import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createParagraphDto } from './dto/createParagraph.dto';
import { categorizedParagraphByLength } from 'src/utils/categorizedParagraph';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class ParagraphService {
    constructor(
        private prisma: PrismaService
    ) { }

    async createParagraph(data: createParagraphDto) {
        const { paragraphContent, contentType, languageid, source, author } = data;

        return this.prisma.paragraph.create({
            data: {
                paragraphContent,
                contentType,
                languageid,
                source,
                author,
                lengthType: categorizedParagraphByLength(paragraphContent),
                externalid: createId()
            }
        });
    }
}