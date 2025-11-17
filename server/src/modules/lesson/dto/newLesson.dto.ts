import { IsString, IsNumber, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { RowType, LessonType } from 'src/generated/client/enums';

export class NewLessonDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @IsNotEmpty()
    orderNumber: number;

    @IsEnum(LessonType)
    @IsNotEmpty()
    lessonType: LessonType;

    @IsString()
    @IsOptional()
    heldKey?: string;

    @IsString()
    @IsNotEmpty()
    lessonContent: string;

    @IsString()
    @IsNotEmpty()
    languageid: string;
}