import { IsIn, IsNotEmpty, IsString, IsOptional, ValidateIf } from 'class-validator';

export class VerifyOtpDto {
  // Firebase ID token (from client after OTP verification)
  // This is the preferred method for Firebase Auth - client verifies OTP with Firebase SDK first
  @ValidateIf((o) => !o.verificationId || !o.otp)
  @IsString()
  @IsNotEmpty()
  idToken?: string;

  // Alternative: Direct OTP verification (for testing or custom flow)
  // Note: For production, use idToken from Firebase client SDK
  @ValidateIf((o) => !o.idToken)
  @IsString()
  @IsNotEmpty()
  verificationId?: string;

  @ValidateIf((o) => !o.idToken && o.verificationId)
  @IsString()
  @IsNotEmpty()
  otp?: string;

  @IsIn(['sms', 'email'])
  channel!: 'sms' | 'email';
  
  // Optional metadata
  @IsOptional()
  @IsString()
  deviceId?: string;
}

