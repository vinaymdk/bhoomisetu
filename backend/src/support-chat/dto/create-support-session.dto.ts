import { IsEnum } from 'class-validator';
import { SupportChatRole } from '../entities/support-chat-session.entity';

export class CreateSupportSessionDto {
  @IsEnum(SupportChatRole)
  supportRole: SupportChatRole;
}
