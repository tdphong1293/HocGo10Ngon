import { IsString, IsNumber, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { RowType, LessonHandType, LessonType } from 'src/generated/enums';

export class UpdateLessonDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsNumber()
    @IsOptional()
    orderNumber?: number;

    @IsEnum(RowType)
    @IsOptional()
    rowType?: RowType;

    @IsEnum(LessonHandType)
    @IsOptional()
    lessonHandType?: LessonHandType;

    @IsEnum(LessonType)
    @IsNotEmpty()
    lessonType: LessonType;

    @IsString()
    @IsOptional()
    heldKey?: string;

    @IsString()
    @IsOptional()
    lessonContent?: string;

    @IsString()
    @IsOptional()
    languageid?: string;
}