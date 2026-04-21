import { IsString, IsNumber, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { RowType, LessonHandType, LessonType } from 'src/generated/enums';

export class NewLessonDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @IsNotEmpty()
    orderNumber: number;

    @IsEnum(LessonHandType)
    @IsNotEmpty()
    lessonHandType: LessonHandType;

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