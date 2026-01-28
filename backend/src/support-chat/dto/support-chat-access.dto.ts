import { IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { SupportChatRole } from '../entities/support-chat-session.entity';

export class SupportChatAccessDto {
  @IsUUID()
  userId: string;

  @IsEnum(SupportChatRole)
  supportRole: SupportChatRole;

  @IsBoolean()
  isEnabled: boolean;
}
