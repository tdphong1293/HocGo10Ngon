import { IsString, IsNotEmpty } from 'class-validator';

export class createParagraphDto {
    @IsString()
    @IsNotEmpty()
    paragraphContent: string;

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