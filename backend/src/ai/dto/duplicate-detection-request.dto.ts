export interface DuplicateDetectionRequestDto {
  // User identifiers to check
  phone?: string;
  email?: string;
  firebaseUid?: string;
  
  // Device and network information
  deviceId?: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  
  // Additional signals
  name?: string;
  paymentMethodHash?: string; // Hashed payment method for comparison
  
  // Context
  timestamp: string;
}
