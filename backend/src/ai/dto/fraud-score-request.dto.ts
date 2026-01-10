export interface FraudScoreRequestDto {
  // User identifiers
  userId?: string;
  phone?: string;
  email?: string;
  firebaseUid?: string;
  
  // Context information
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceFingerprint?: string;
  
  // Request metadata
  requestType: 'otp_request' | 'signup' | 'login' | 'session_creation' | 'payment';
  timestamp: string;
  
  // Historical data (optional)
  previousAttempts?: number;
  accountAge?: number; // in days
  
  // Additional context
  metadata?: Record<string, any>;
}
