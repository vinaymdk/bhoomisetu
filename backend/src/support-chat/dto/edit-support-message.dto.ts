import { IsString } from 'class-validator';

export class EditSupportMessageDto {
  @IsString()
  content: string;
}
