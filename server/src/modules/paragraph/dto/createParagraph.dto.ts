import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ContentType } from 'src/generated/enums';

export class createParagraphDto {
    @IsString()
    @IsNotEmpty()
    paragraphContent: string;

    @IsEnum(ContentType)
    @IsNotEmpty()
    contentType: ContentType;

    @IsString()
    @IsNotEmpty()
    languageid: string;

    @IsNotEmpty()
    @IsString()
    source: string;

    @IsNotEmpty()
    @IsString()
    author: string;
}