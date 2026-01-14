import { IsIn, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  // Firebase ID token (from client after OTP verification)
  // This is the preferred method for Firebase Auth - client verifies OTP with Firebase SDK first
  @IsString()
  @IsOptional()
  idToken?: string;

  // Alternative: Direct OTP verification (for email OTP via Brevo)
  @IsString()
  @IsOptional()
  otp?: string;

  @IsIn(['sms', 'email'])
  @IsNotEmpty()
  channel!: 'sms' | 'email';
  
  // Destination (email or phone) - required for email OTP verification
  @IsString()
  @IsOptional()
  destination?: string;
  
  // Optional metadata
  @IsOptional()
  @IsString()
  deviceId?: string;
}

