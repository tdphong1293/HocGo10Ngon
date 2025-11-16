import { IsString, IsNumber, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { RowType, LessonType } from 'src/generated/client/enums';

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

    @IsEnum(LessonType)
    @IsOptional()
    lessonType?: LessonType;

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