import { IsString, IsNotEmpty } from 'class-validator';
import { SessionMode } from '../../mongoose/schemas/session_mode.schema';

export class PracticeTypingTextDto {
    @IsString()
    @IsNotEmpty({ message: 'Mã ngôn ngữ không được để trống' })
    languageCode: string;

    mode: SessionMode;
}