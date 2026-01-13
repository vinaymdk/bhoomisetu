import { IsIn, IsNotEmpty, IsString, IsOptional, ValidateIf } from 'class-validator';

export class VerifyOtpDto {
  // Firebase ID token (from client after OTP verification)
  // This is the preferred method for Firebase Auth - client verifies OTP with Firebase SDK first
  @ValidateIf((o) => o.channel === 'sms' && !o.otp)
  @IsString()
  @IsNotEmpty()
  idToken?: string;

  // Alternative: Direct OTP verification (for email OTP via Brevo)
  @ValidateIf((o) => o.channel === 'email' && !o.idToken)
  @IsString()
  @IsNotEmpty()
  otp?: string;

  @IsIn(['sms', 'email'])
  channel!: 'sms' | 'email';
  
  // Destination (email or phone) - required for email OTP verification
  @ValidateIf((o) => o.channel === 'email' && !o.idToken)
  @IsString()
  @IsNotEmpty()
  destination?: string;
  
  // Optional metadata
  @IsOptional()
  @IsString()
  deviceId?: string;
}

