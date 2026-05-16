import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SessionType, LessonType } from 'src/modules/mongoose/schemas/session.schema';

class KeystrokeDto {
    @IsString()
    @IsNotEmpty()
    key!: string;

    @IsNumber()
    timestamp!: number;

    @IsBoolean()
    isCorrect!: boolean;

    @IsNumber()
    @IsOptional()
    deltaTime?: number;
}

export class sessionDataDto {
    @IsString()
    @IsNotEmpty()
    languageCode!: string;

    @IsEnum(SessionType)
    @IsNotEmpty()
    sessionType!: SessionType;

    @IsEnum(LessonType)
    @IsOptional()
    lessonType?: LessonType;

    @IsString()
    @IsOptional()
    lessonid?: string;

    @IsString()
    @IsOptional()
    modeName?: string;

    @IsObject()
    @IsOptional()
    usedConfig?: Record<string, any>;

    @IsObject()
    @IsOptional()
    usedSubConfig?: Record<string, any>;

    @IsNumber()
    @IsOptional()
    CPM?: number;

    @IsNumber()
    @IsOptional()
    WPM?: number;

    @IsNumber()
    @IsOptional()
    accuracy?: number;

    @IsNumber()
    @IsOptional()
    errorCount?: number;

    @IsNumber()
    @IsOptional()
    duration?: number;

    @IsString()
    @IsOptional()
    rawInput?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => KeystrokeDto)
    keystrokes!: KeystrokeDto[];
}