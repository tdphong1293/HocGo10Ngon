import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ContentType } from 'src/generated/client/enums';

export class createParagraphDto {
    @IsString()
    @IsNotEmpty()
    paragraphContent: string;

    @IsNotEmpty()
    contentType: ContentType;

    @IsString()
    @IsNotEmpty()
    languageid: string;

    @IsOptional()
    @IsString()
    source?: string;

    @IsOptional()
    @IsString()
    author?: string;
}