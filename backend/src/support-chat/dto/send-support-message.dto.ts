import { IsString, IsOptional, IsEnum } from 'class-validator';
import { SupportMessageType } from '../entities/support-chat-message.entity';

export class SendSupportMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(SupportMessageType)
  messageType?: SupportMessageType;
}
