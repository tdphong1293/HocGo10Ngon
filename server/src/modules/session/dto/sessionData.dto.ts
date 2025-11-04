import { IsString, IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class sessionDataDto {
    @IsString()
    @IsNotEmpty()
    languageCode: string;

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