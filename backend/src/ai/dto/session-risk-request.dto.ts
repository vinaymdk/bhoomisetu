export interface SessionRiskRequestDto {
  userId: string;
  sessionId?: string;
  
  // Current session info
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceFingerprint?: string;
  
  // Previous session info (for comparison)
  previousIpAddress?: string;
  previousDeviceId?: string;
  previousLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  
  // Current location
  currentLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  
  // Timing
  lastLoginAt?: string;
  currentTimestamp: string;
  
  // Additional context
  loginProvider: 'phone_otp' | 'email_otp' | 'google' | 'facebook' | 'apple' | 'passkey';
  metadata?: Record<string, any>;
}
