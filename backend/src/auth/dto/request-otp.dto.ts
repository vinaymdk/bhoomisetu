import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class RequestOtpDto {
  @IsIn(['sms', 'email'])
  channel!: 'sms' | 'email';

  @IsString()
  @IsNotEmpty()
  destination!: string;

  @IsIn(['login', 'signup'])
  purpose!: 'login' | 'signup';
}

