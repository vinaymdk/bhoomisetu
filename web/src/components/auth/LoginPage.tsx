import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { initializeFirebase, sendPhoneOtp, verifyPhoneOtp, getIdToken, googleProvider, facebookProvider, clearRecaptchaVerifier, getAuthInstance } from '../../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { UnifiedPhoneInput } from './UnifiedPhoneInput';
import './Auth.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'method' | 'otp'>('method');
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [destination, setDestination] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [purpose, setPurpose] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get purpose from URL params
  useEffect(() => {
    const purposeParam = searchParams.get('purpose');
    if (purposeParam === 'signup') {
      setPurpose('signup');
    } else {
      setPurpose('login');
    }
  }, [searchParams]);

  // Note: Redirect is now handled by PublicRoute component
  // This effect is kept for backward compatibility but PublicRoute handles it

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Initialize Firebase on mount
  useEffect(() => {
    initializeFirebase().catch((error) => {
      console.error('Firebase initialization error:', error);
      setError('Failed to initialize authentication. Please refresh the page.');
    });

    return () => {
      clearRecaptchaVerifier();
    };
  }, []);

  // Clear fields and errors when switching channels
  const handleChannelChange = (newChannel: 'sms' | 'email') => {
    setChannel(newChannel);
    setError(null);
    setDestination('');
    setPhoneNumber('');
    setOtp('');
    setVerificationId(null);
    clearRecaptchaVerifier(); // Clear reCAPTCHA when switching
  };

  const validatePhone = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };
  
  const isPhoneValid = validatePhone(phoneNumber);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (channel === 'sms') {
        if (!isPhoneValid) {
          setError('Please enter a valid 10-digit phone number');
          setLoading(false);
          return;
        }
        // Format: +91 9876543210 (with space)
        const formattedPhone = `${countryCode} ${phoneNumber}`;
        const vid = await sendPhoneOtp(formattedPhone);
        setVerificationId(vid);
        setDestination(formattedPhone);
        
        // Also notify backend (for logging and fraud checks)
        await authService.requestOtp({
          channel: 'sms',
          destination: formattedPhone,
          purpose,
        });
      } else {
        // Email OTP via backend
        if (!validateEmail(destination)) {
          setError('Please enter a valid email address');
          setLoading(false);
          return;
        }

        // Request OTP from backend
        await authService.requestOtp({
          channel: 'email',
          destination,
          purpose,
        });

        // For email, backend sends OTP - set placeholder verification ID
        setVerificationId('email-otp-backend');
        setStep('otp');
        setLoading(false);
        return;
      }

      setStep('otp');
    } catch (err: any) {
      if (channel === 'sms') {
        clearRecaptchaVerifier();
      }
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      setLoading(false);
      return;
    }

    try {
      if (channel === 'sms' && verificationId && verificationId !== 'email-otp-backend') {
        // Verify phone OTP with Firebase
        await verifyPhoneOtp(verificationId, otp);
        const idToken = await getIdToken() || '';
        if (!idToken) {
          throw new Error('Failed to get authentication token');
        }

        // Send to backend
        const response = await authService.verifyOtp({
          channel: 'sms',
          destination: destination,
          idToken,
        });

        login(response);
        navigate('/dashboard');
      } else if (channel === 'email' && verificationId === 'email-otp-backend') {
        // Email OTP verification via backend
        // Backend should verify OTP and return tokens
        const response = await authService.verifyOtp({
          channel: 'email',
          destination: destination,
          otp: otp,
        });

        login(response);
        navigate('/dashboard');
      } else {
        throw new Error('Invalid verification state');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setError(null);
    setLoading(true);
    setResendCooldown(60);

    try {
      if (channel === 'sms' && isPhoneValid) {
        clearRecaptchaVerifier(); // Clear before resending
        const formattedPhone = `${countryCode} ${phoneNumber}`;
        const vid = await sendPhoneOtp(formattedPhone);
        setVerificationId(vid);
        setDestination(formattedPhone);
        
        await authService.requestOtp({
          channel: 'sms',
          destination: formattedPhone,
          purpose,
        });
      } else if (channel === 'email' && validateEmail(destination)) {
        await authService.requestOtp({
          channel: 'email',
          destination,
          purpose,
        });
        setVerificationId('email-otp-backend');
      }
    } catch (err: any) {
      if (channel === 'sms') {
        clearRecaptchaVerifier();
      }
      setError(err.message || 'Failed to resend code. Please try again.');
      setResendCooldown(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setError(null);
    setLoading(true);

    try {
      await initializeFirebase();
      const authInstance = await getAuthInstance();
      
      let result;
      const providerInstance = provider === 'google' ? googleProvider : provider === 'facebook' ? facebookProvider : null;

      if (!providerInstance) {
        throw new Error(`${provider} login is not yet supported`);
      }

      result = await signInWithPopup(authInstance, providerInstance);
      const idToken = await result.user.getIdToken();

      const response = await authService.socialLogin({
        provider,
        idToken,
      });

      login(response);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Enter Verification Code</h1>
          <p className="auth-subtitle">
            We sent a {channel === 'sms' ? 'text message' : 'email'} to {destination}
          </p>

          {/* reCAPTCHA container (hidden) */}
          <div id="recaptcha-container"></div>

          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="otp" className="auth-label">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="auth-input"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                autoFocus
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-button" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div className="auth-link-buttons-row">
              <button
                type="button"
                onClick={() => {
                  setStep('method');
                  setOtp('');
                  setError(null);
                  setVerificationId(null);
                  if (channel === 'sms') {
                    clearRecaptchaVerifier();
                  }
                }}
                className="auth-link-button auth-link-button-left"
                disabled={loading}
              >
                Change {channel === 'sms' ? 'phone number' : 'email'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                className="auth-link-button auth-link-button-right"
                disabled={loading || resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome to Bhoomisetu</h1>
        <p className="auth-subtitle">{purpose === 'login' ? 'Sign in to continue' : 'Create your account'}</p>

        {/* reCAPTCHA container (hidden) */}
        <div id="recaptcha-container"></div>

        <form onSubmit={handleRequestOtp} className="auth-form">
          <div className="auth-channel-tabs">
            <button
              type="button"
              className={`auth-channel-tab ${channel === 'sms' ? 'auth-channel-tab-active' : ''}`}
              onClick={() => handleChannelChange('sms')}
            >
              Phone
            </button>
            <button
              type="button"
              className={`auth-channel-tab ${channel === 'email' ? 'auth-channel-tab-active' : ''}`}
              onClick={() => handleChannelChange('email')}
            >
              Email
            </button>
          </div>

          {channel === 'sms' ? (
            <UnifiedPhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              error={error || undefined}
              disabled={loading}
            />
          ) : (
            <div className="auth-form-group">
              <label htmlFor="destination" className="auth-label">
                Email Address
              </label>
              <input
                id="destination"
                type="email"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setError(null);
                }}
                className="auth-input"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="auth-button"
            disabled={loading || (channel === 'sms' ? !isPhoneValid : !destination)}
          >
            {loading ? 'Sending...' : `Send ${channel === 'sms' ? 'OTP' : 'Verification Code'}`}
          </button>
        </form>

        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="auth-social-buttons">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="auth-social-button"
            disabled={loading}
          >
            <svg className="auth-social-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            className="auth-social-button"
            disabled={loading}
          >
            <svg className="auth-social-icon" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>
      </div>
    </div>
  );
};
