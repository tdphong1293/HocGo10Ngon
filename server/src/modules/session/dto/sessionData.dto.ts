import { IsString, IsNotEmpty, IsNumber, IsObject, IsEnum, IsOptional } from 'class-validator';
import { SessionType } from 'src/modules/mongoose/schemas/session.schema';

export class sessionDataDto {
    @IsString()
    @IsNotEmpty()
    languageCode: string;

    @IsEnum(SessionType)
    @IsNotEmpty()
    sessionType: SessionType;

    @IsString()
    @IsOptional()
    lessonid: string;

    @IsString()
    @IsOptional()
    modeName: string;

    @IsObject()
    @IsOptional()
    usedConfig: Record<string, any>;

    @IsObject()
    @IsOptional()
    usedSubConfig: Record<string, any>;

    @IsNumber()
    @IsOptional()
    CPM: number;

    @IsNumber()
    @IsOptional()
    WPM: number;

    @IsNumber()
    @IsOptional()
    accuracy: number;

    @IsNumber()
    @IsOptional()
    errorCount: number;

    @IsNumber()
    @IsOptional()
    duration: number;

    @IsString()
    @IsOptional()
    rawInput: string;

    @IsObject({ each: true })
    keystrokes: { key: string; timestamp: number; correct: boolean }[];
}