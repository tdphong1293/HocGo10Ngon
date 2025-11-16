import { IsString, IsNotEmpty, IsNumber, IsObject, IsEnum } from 'class-validator';
import { SessionType } from 'src/modules/mongoose/schemas/session.schema';

export class sessionDataDto {
    @IsString()
    @IsNotEmpty()
    languageCode: string;

    @IsEnum(SessionType)
    @IsNotEmpty()
    sessionType: SessionType;

    @IsString()
    @IsNotEmpty()
    modeName: string;

    @IsObject()
    usedConfig: Record<string, any>;

    @IsObject()
    usedSubConfig: Record<string, any>;

    @IsNumber()
    CPM: number;

    @IsNumber()
    WPM: number;

    @IsNumber()
    accuracy: number;

    @IsNumber()
    errorCount: number;

    @IsNumber()
    duration: number;

    @IsString()
    rawInput: string;

    @IsObject({ each: true })
    keystrokes: { key: string; timestamp: number; correct: boolean }[];
}