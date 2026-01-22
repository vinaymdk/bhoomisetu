import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/auth_service.dart';
import '../../services/social_auth_service.dart';
import '../../widgets/unified_phone_input.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final AuthService _authService = AuthService();
  final SocialAuthService _socialAuthService = SocialAuthService();

  String _step = 'method'; // 'method' or 'otp'
  String _channel = 'sms'; // 'sms' or 'email'
  final String _purpose = 'login'; // Default to login (tabs removed)
  bool _isLoading = false;
  String? _error;
  String? _destination; // Store email/phone for OTP screen
  int _resendCooldown = 0;
  String _countryCode = '+91';
  String _phoneNumber = ''; // Store phone number for UnifiedPhoneInput
  String? _devOtp;

  bool _isPhoneValid() {
    if (_channel != 'sms') return false;
    final phone = _phoneNumber.trim().replaceAll(RegExp(r'\D'), '');
    return phone.length == 10;
  }

  Future<void> _requestOtp() async {
    if (!_formKey.currentState!.validate()) return;

    if (_channel == 'sms' && !_isPhoneValid()) {
      setState(() {
        _error = 'Please enter a valid 10-digit phone number';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      if (_channel == 'sms') {
        // SMS OTP via backend API (same pattern as email)
        final phoneNumber = _phoneNumber.trim().replaceAll(RegExp(r'\D'), '');
        final formattedPhone = '$_countryCode$phoneNumber';

        // Request OTP from backend
        final otpResponse = await _authService.requestOtp(
          channel: 'sms',
          destination: formattedPhone,
          purpose: _purpose,
        );

        setState(() {
          _destination = formattedPhone;
          _step = 'otp';
          _devOtp = otpResponse['otp'] as String?;
          _isLoading = false;
        });
      } else {
        // Email OTP via backend (Brevo)
        final email = _emailController.text.trim();
        if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
          setState(() {
            _error = 'Please enter a valid email address';
            _isLoading = false;
          });
          return;
        }

        // Request OTP from backend
        final otpResponse = await _authService.requestOtp(
          channel: 'email',
          destination: email,
          purpose: _purpose,
        );

        setState(() {
          _destination = email;
          _step = 'otp';
          _devOtp = otpResponse['otp'] as String?;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _verifyOtp() async {
    if (_otpController.text.length != 6) {
      setState(() {
        _error = 'Please enter a 6-digit code';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      if (_channel == 'sms' && _destination != null) {
        // SMS OTP verification via backend API
        final response = await _authService.verifyOtp(
          channel: 'sms',
          destination: _destination!,
          otp: _otpController.text,
        );

        // Login user
        if (!mounted) return;
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        await authProvider.login(response);

        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/home');
        }
      } else if (_channel == 'email' && _destination != null) {
        // Email OTP verification via backend
        final response = await _authService.verifyOtp(
          channel: 'email',
          destination: _destination!,
          otp: _otpController.text,
        );

        // Login user
        if (!mounted) return;
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        await authProvider.login(response);

        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/home');
        }
      } else {
        throw Exception('Invalid verification state');
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _resendCode() async {
    if (_resendCooldown > 0) return;

    setState(() {
      _resendCooldown = 60;
      _isLoading = true;
    });

    // Start cooldown timer
    Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCooldown > 0) {
        setState(() {
          _resendCooldown--;
        });
      } else {
        timer.cancel();
      }
    });

    await _requestOtp();
  }

  Future<void> _socialLogin(String provider) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      String idToken;

      if (provider == 'google') {
        // Google Sign-In
        idToken = await _socialAuthService.signInWithGoogle();
      } else if (provider == 'facebook') {
        // Facebook Sign-In - TODO: Implement when flutter_facebook_auth package is added
        throw Exception(
            'Facebook Sign-In is not yet implemented. Please use Google Sign-In for now.');
      } else if (provider == 'apple') {
        // Apple Sign-In - TODO: Implement when sign_in_with_apple package is added
        throw Exception(
            'Apple Sign-In is not yet implemented. Please use Google Sign-In for now.');
      } else {
        throw Exception('Unknown provider: $provider');
      }

      // Send ID token to backend
      final response = await _authService.socialLogin(
        provider: provider,
        idToken: idToken,
      );

      // Login user
      if (!mounted) return;
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.login(response);

      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/home');
      }
    } catch (e) {
      setState(() {
        final errorMessage = e.toString().replaceAll('Exception: ', '');
        // Handle user cancellation gracefully
        if (errorMessage.contains('cancelled')) {
          _error = null; // Don't show error for user cancellation
        } else {
          _error = errorMessage;
        }
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_step == 'otp') {
      return _buildOtpScreen();
    }
    return _buildMethodScreen();
  }

  Widget _buildMethodScreen() {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                Image.asset(
                  'assets/logo-and-fav/bhoomisetu-logo.png',
                  height: 80,
                ),
                const SizedBox(height: 24),
                const Text(
                  'Welcome to BhoomiSetu',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Sign in to continue',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                // Channel Tabs
                Row(
                  children: [
                    Expanded(
                      child:
                          _buildChannelButton('Phone', _channel == 'sms', () {
                        setState(() {
                          _channel = 'sms';
                          _error = null;
                          _phoneNumber = '';
                          _emailController.clear();
                          _devOtp = null;
                        });
                      }),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child:
                          _buildChannelButton('Email', _channel == 'email', () {
                        setState(() {
                          _channel = 'email';
                          _error = null;
                          _phoneNumber = '';
                          _emailController.clear();
                          _devOtp = null;
                        });
                      }),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Phone/Email Input
                if (_channel == 'sms')
                  UnifiedPhoneInput(
                    value: _phoneNumber,
                    onChange: (value) {
                      setState(() {
                        _phoneNumber = value;
                        _error = null;
                      });
                    },
                    countryCode: _countryCode,
                    onCountryCodeChange: (code) {
                      setState(() {
                        _countryCode = code;
                        _error = null;
                      });
                    },
                    error: _error,
                    disabled: _isLoading,
                  )
                else
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      labelText: 'Email Address',
                      hintText: 'you@example.com',
                      prefixIcon: const Icon(Icons.email),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onChanged: (value) {
                      setState(() {
                        _error = null;
                      });
                    },
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter email';
                      }
                      if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
                          .hasMatch(value)) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                if (_error != null && _channel == 'email') ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Text(
                      _error!,
                      style: TextStyle(color: Colors.red.shade700),
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: (_isLoading ||
                          (_channel == 'sms' && !_isPhoneValid()) ||
                          (_channel == 'email' &&
                              (_emailController.text.trim().isEmpty ||
                                  !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
                                      .hasMatch(_emailController.text.trim()))))
                      ? null
                      : _requestOtp,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator()
                      : Text(
                          'Send ${_channel == 'sms' ? 'OTP' : 'Verification Code'}'),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(child: Divider(color: Colors.grey.shade300)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text('Or continue with',
                          style: TextStyle(color: Colors.grey.shade600)),
                    ),
                    Expanded(child: Divider(color: Colors.grey.shade300)),
                  ],
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed:
                            _isLoading ? null : () => _socialLogin('google'),
                        icon: const Icon(Icons.g_mobiledata, size: 24),
                        label: const Text('Google'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed:
                            _isLoading ? null : () => _socialLogin('facebook'),
                        icon: const Icon(Icons.facebook, size: 24),
                        label: const Text('Facebook'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOtpScreen() {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Enter Verification Code'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              const Text(
                'Enter Verification Code',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'We sent a ${_channel == 'sms' ? 'text message' : 'email'} to ${_destination ?? _emailController.text}',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              TextFormField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 24, letterSpacing: 8),
                maxLength: 6,
                decoration: InputDecoration(
                  hintText: '000000',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  counterText: '',
                ),
                onChanged: (value) {
                  setState(() {
                    _error = null;
                  });
                },
              ),
              if (_devOtp != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.orange.shade200),
                  ),
                  child: Text(
                    'Dev OTP: $_devOtp',
                    style: TextStyle(
                        color: Colors.orange.shade900,
                        fontWeight: FontWeight.w600),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
              if (_error != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(
                    _error!,
                    style: TextStyle(color: Colors.red.shade700),
                  ),
                ),
              ],
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: (_isLoading || _otpController.text.length != 6)
                    ? null
                    : _verifyOtp,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Verify & Continue'),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: _isLoading
                        ? null
                        : () {
                            setState(() {
                              _step = 'method';
                              _otpController.clear();
                              _error = null;
                              _destination = null;
                            });
                          },
                    child: Text(
                        'Change ${_channel == 'sms' ? 'phone number' : 'email'}'),
                  ),
                  TextButton(
                    onPressed: (_isLoading || _resendCooldown > 0)
                        ? null
                        : _resendCode,
                    child: Text(
                      _resendCooldown > 0
                          ? 'Resend code (${_resendCooldown}s)'
                          : 'Resend code',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChannelButton(String label, bool isActive, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? Colors.blue.shade50 : Colors.transparent,
          border: Border.all(
            color: isActive ? Colors.blue : Colors.grey.shade300,
            width: 1.5,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? Colors.blue : Colors.grey,
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    super.dispose();
  }
}
