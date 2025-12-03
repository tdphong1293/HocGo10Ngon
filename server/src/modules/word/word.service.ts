import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { categorizedWordByLength, categorizedWordByRowKey } from 'src/utils/categorizedWord';

@Injectable()
export class WordService {
    constructor(
        private prisma: PrismaService
    ) { }

    async addWords(words: string[], languageid: string) {
        const createWords = words.map(word => {
            const normalizedWord = word.toLowerCase();
            return {
                rowType: categorizedWordByRowKey(normalizedWord),
                lengthType: categorizedWordByLength(normalizedWord),
                normalForm: normalizedWord,
                capitalForm: normalizedWord.charAt(0).toUpperCase() + normalizedWord.slice(1),
                languageid: languageid,
            }
        });

        return await this.prisma.word.createMany({
            data: createWords,
            skipDuplicates: true
        });
    }

    async deleteWords(words: string[]) {
        const deleteWords = words.map(word => {
            const normalizedWord = word.toLowerCase();
            return {
                normalForm: normalizedWord,
            }
        });

        return await this.prisma.word.deleteMany({
            where: {
                OR: deleteWords
            },
        });
    }
}