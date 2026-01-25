import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsArray, MaxLength, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ChatLanguage {
  EN = 'en',
  TE = 'te', // Telugu
  HI = 'hi', // Hindi
}

export enum ChatContextType {
  FAQ = 'faq',
  PROPERTY_SEARCH = 'property_search',
  REQUIREMENT_UPDATE = 'requirement_update',
  APPOINTMENT_BOOKING = 'appointment_booking',
  GENERAL = 'general',
}

class MessageHistoryDto {
  @IsEnum(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;

  @IsEnum(ChatLanguage)
  @IsOptional()
  language?: ChatLanguage;

  @IsString()
  @IsOptional()
  sessionId?: string; // For continuing conversation

  @IsUUID()
  @IsOptional()
  conversationId?: string; // For continuing specific conversation

  @IsEnum(ChatContextType)
  @IsOptional()
  contextType?: ChatContextType;

  @IsUUID()
  @IsOptional()
  contextPropertyId?: string; // If asking about specific property

  @IsUUID()
  @IsOptional()
  contextRequirementId?: string; // If asking about requirement

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageHistoryDto)
  @IsOptional()
  previousMessages?: MessageHistoryDto[]; // Conversation history
}
