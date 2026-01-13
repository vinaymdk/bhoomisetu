export interface User {
  id: string;
  fullName: string;
  primaryPhone?: string;
  primaryEmail?: string;
  status: 'pending' | 'active' | 'suspended' | 'banned';
  fraudRiskScore?: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  roles: string[];
  tokens: AuthTokens;
}

export interface RequestOtpRequest {
  channel: 'sms' | 'email';
  destination: string;
  purpose: 'login' | 'signup';
}

export interface VerifyOtpRequest {
  channel: 'sms' | 'email';
  destination: string;
  otp?: string; // Optional - for direct OTP (testing/email)
  verificationId?: string; // Optional - for direct OTP verification
  idToken?: string; // Firebase ID token (preferred for phone)
  deviceId?: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'facebook' | 'apple';
  idToken: string;
  deviceId?: string;
}
