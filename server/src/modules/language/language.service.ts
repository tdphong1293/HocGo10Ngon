import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LanguageService {
    constructor(
        private prisma: PrismaService
    ) { }

    async getAllLanguages() {
        return this.prisma.language.findMany({
            orderBy: {
                languageName: 'asc'
            }
        });
    }

    async createLanguage(languageName: string, languageCode: string) {
        const existingLanguage = await this.prisma.language.findUnique({
            where: {
                languageCode: languageCode
            }
        });

        if (existingLanguage) {
            throw new ConflictException(`Ngôn ngữ với mã "${languageCode}" đã tồn tại.`);
        }

        return this.prisma.language.create({
            data: {
                languageName,
                languageCode
            }
        });
    }
}
