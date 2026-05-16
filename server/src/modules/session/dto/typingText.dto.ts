import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SessionMode } from '../../mongoose/schemas/session_mode.schema';

class TypingSessionModeDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên chế độ gõ không được để trống' })
    modeName!: string;

    @IsObject()
    config!: Record<string, any>;

    @IsObject()
    @IsOptional()
    subConfig?: Record<string, any>;
}

export class TypingTextDto {
    @IsString()
    @IsNotEmpty({ message: 'Mã ngôn ngữ không được để trống' })
    languageCode!: string;

    @ValidateNested()
    @Type(() => TypingSessionModeDto)
    mode!: SessionMode;
}