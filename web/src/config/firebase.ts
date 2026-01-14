import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signInWithCredential, PhoneAuthProvider, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, type Auth } from 'firebase/auth';

// Firebase config will be loaded from backend
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firebaseInitialized = false;

// Auth providers
export let googleProvider: GoogleAuthProvider | null = null;
export let facebookProvider: FacebookAuthProvider | null = null;
export let appleProvider: OAuthProvider | null = null;

// Recaptcha verifier for phone auth
let recaptchaVerifier: RecaptchaVerifier | null = null;

// Initialize Firebase from backend config
export const initializeFirebase = async (): Promise<void> => {
  if (firebaseInitialized && app && auth) {
    return;
  }

  try {
    // Fetch Firebase config from backend
    // Use base URL without /api prefix for config endpoint
    // const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://192.168.0.8:3000'; // HMD Office
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://192.168.0.108:3000'; // Home
    const response = await fetch(`${baseUrl}/api/config/firebase`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Firebase config: ${response.statusText}`);
    }
    
    const firebaseConfig = await response.json();

    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase API key not found. Please configure Firebase in backend .env file.');
    }

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Initialize providers
    googleProvider = new GoogleAuthProvider();
    facebookProvider = new FacebookAuthProvider();
    appleProvider = new OAuthProvider('apple.com');

    firebaseInitialized = true;
  } catch (error: any) {
    console.error('Failed to initialize Firebase:', error);
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
};

// Get auth instance (initialize if needed)
export const getAuthInstance = async (): Promise<Auth> => {
  if (!auth) {
    await initializeFirebase();
  }
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }
  return auth;
};

export const getRecaptchaVerifier = async (): Promise<RecaptchaVerifier> => {
  const authInstance = await getAuthInstance();
  
  // Clear existing verifier to avoid "already rendered" error
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (e) {
      // Ignore errors if already cleared
    }
    recaptchaVerifier = null;
  }
  
  // Check if container exists, create if not
  let container = document.getElementById('recaptcha-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'recaptcha-container';
    container.style.display = 'none';
    document.body.appendChild(container);
  }
  
  // Clear any existing reCAPTCHA in the container
  container.innerHTML = '';
  
  // Create new verifier
  recaptchaVerifier = new RecaptchaVerifier(authInstance, 'recaptcha-container', {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
  });
  
  return recaptchaVerifier;
};

export const clearRecaptchaVerifier = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
};

// Phone OTP functions
export const sendPhoneOtp = async (phoneNumber: string): Promise<string> => {
  try {
    const authInstance = await getAuthInstance();
    const verifier = await getRecaptchaVerifier();
    // Format: +91 9876543210 (with space) - Firebase expects this format
    const formattedPhone = phoneNumber.includes(' ') ? phoneNumber : phoneNumber.replace(/(\+\d+)(\d+)/, '$1 $2');
    const confirmationResult = await signInWithPhoneNumber(authInstance, formattedPhone, verifier);
    return confirmationResult.verificationId;
  } catch (error: any) {
    clearRecaptchaVerifier();
    throw new Error(error.message || 'Failed to send OTP');
  }
};

export const verifyPhoneOtp = async (verificationId: string, otp: string) => {
  try {
    const authInstance = await getAuthInstance();
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const result = await signInWithCredential(authInstance, credential);
    return result.user;
  } catch (error: any) {
    throw new Error(error.message || 'Invalid OTP');
  }
};

// Get Firebase ID token
export const getIdToken = async (): Promise<string | null> => {
  const authInstance = await getAuthInstance();
  const user = authInstance.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

// Export auth for direct access (after initialization)
export { auth };
