import { Injectable, BadRequestException, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { SessionDocument, Session } from '../mongoose/schemas/session.schema';
import { SessionModeDocument, SessionMode } from '../mongoose/schemas/session_mode.schema';
import { PrismaService } from '../prisma/prisma.service';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SessionService {
    constructor(
        @InjectModel('Session') private sessionModel: Model<SessionDocument>,
        @InjectModel('SessionMode') private sessionModeModel: Model<SessionModeDocument>,
        private prismaService: PrismaService,
    ) { }

    async getSessionMode() {
        const sessionModes = await this.sessionModeModel.find().exec();
        if (!sessionModes) {
            throw new InternalServerErrorException('Lỗi khi lấy dữ liệu chế độ gõ');
        }

        const sessionModesFormatted = sessionModes.map(mode => ({
            modeName: mode.modeName,
            config: mode.config,
            subConfig: mode.subConfig,
        }));

        return {
            message: 'Lấy dữ liệu chế độ gõ thành công',
            sessionModes: sessionModesFormatted,
        }
    }

    async getWordsByLengthType(lengthType: 'SHORT' | 'MEDIUM' | 'LONG') {
        const words = await this.prismaService.word.findMany({
            where: {
                lengthType: lengthType,
            }
        });

        const wordList = words.map(w => w.normalForm);

        return {
            message: `Lấy dữ liệu từ thuộc loại ${lengthType} thành công`,
            counts: words.length,
            words: wordList,
        }
    }

    async getParagraphsByLengthType(lengthType: 'ALL' | 'SHORT' | 'MEDIUM' | 'LONG') {
        if (lengthType === 'ALL') {
            const paragraphs = await this.prismaService.paragraph.findMany({});
            const paragraphList = paragraphs.map(p => p.paragraphContent);
            return {
                message: 'Lấy dữ liệu đoạn văn thành công',
                counts: paragraphs.length,
                paragraphs: paragraphList,
            }
        }
        else {
            const paragraphs = await this.prismaService.paragraph.findMany({
                where: {
                    lengthType: lengthType,
                }
            });

            const paragraphList = paragraphs.map(p => p.paragraphContent);

            return {
                message: `Lấy dữ liệu đoạn văn thuộc loại ${lengthType} thành công`,
                counts: paragraphs.length,
                paragraphs: paragraphList,
            }
        }
    }

    async getWordsByRowType(rowType: 'ALL' | 'HOME' | 'TOP' | 'BOTTOM' | 'HOME_TOP' | 'HOME_BOTTOM' | 'TOP_BOTTOM') {
        const words = await this.prismaService.word.findMany({
            where: {
                rowType: rowType,
            }
        });

        const wordList = words.map(w => w.normalForm);

        return {
            message: `Lấy dữ liệu từ thuộc loại ${rowType} thành công`,
            counts: words.length,
            words: wordList,
        }
    }

    async getAllPunctuations() {
        const punctuations = await this.prismaService.punctuation.findMany({});
        const punctuationList = punctuations.map(p => p.punctuationSymbol);
        return {
            message: 'Lấy dữ liệu dấu câu thành công',
            counts: punctuations.length,
            punctuations: punctuationList,
        }
    }

    async getPracticeTypingText(mode: SessionMode): Promise<string> {
        try {
            if (mode.modeName === 'words') {
                const wordCount = mode.config?.wordCount || 50;
                const subConfig = mode.subConfig || {};

                // --- 1. Fetch random words from DB ---
                const words = await this.prismaService.word.findMany({
                    where: {
                        language: { languageName: 'English' },
                    },
                });

                const takenWords = words.sort(() => 0.5 - Math.random()).slice(0, wordCount);

                let wordList = takenWords.map(w => w.normalForm);

                // --- 2. Capitalization toggle ---
                if (subConfig.capitalization) {
                    wordList = wordList.map(w => {
                        if (Math.random() < 0.3) return w.charAt(0).toUpperCase() + w.slice(1);
                        return w;
                    });
                }

                // --- 3. Add random numbers ---
                if (subConfig.number) {
                    const numberLimit = await this.prismaService.number.findFirst({});
                    if (!numberLimit || numberLimit.maxValue == null || numberLimit.minValue == null) {
                        throw new NotFoundException('Không tìm thấy giới hạn số trong cơ sở dữ liệu');
                    }

                    const numbers = Array.from({ length: Math.floor(wordCount * 0.1) }, () =>
                        (Math.floor(Math.random() * (numberLimit.maxValue - numberLimit.minValue + 1))
                            + numberLimit.minValue).toString()
                    );
                    for (const num of numbers) {
                        const insertIndex = Math.floor(Math.random() * wordList.length);
                        wordList.splice(insertIndex, 1, num);
                    }
                }

                // --- 4. Add punctuation randomly ---
                if (subConfig.punctuation) {
                    const punctuations = await this.prismaService.punctuation.findMany({});
                    const punctuationChars = punctuations.map(p => p.punctuationSymbol);

                    wordList = wordList.map(word => {
                        if (Math.random() < 0.2) {
                            const punc = punctuationChars[Math.floor(Math.random() * punctuationChars.length)];
                            return word + punc;
                        }
                        return word;
                    });
                }

                // --- 5. Shuffle and join ---
                wordList = wordList.sort(() => Math.random() - 0.5);
                return wordList.join(' ');
            }
            else if (mode.modeName === 'time') {
                const ratioLimit = 5; // 300 words per minute => 5 words per second
                const timeLimit = mode.config?.timeLimit || 60;
                const totalWords = ratioLimit * timeLimit;

                const tmpMode = {
                    modeName: 'words',
                    config: { wordCount: totalWords },
                    subConfig: mode.subConfig,
                } as SessionMode;

                return this.getPracticeTypingText(tmpMode);
            }
            else if (mode.modeName === 'paragraphs') {
                const paragraphLength = mode.config?.paragraphLength || 'MEDIUM';
                if (paragraphLength === 'ALL') {
                    const paragraphs = await this.prismaService.paragraph.findMany({});
                    const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
                    return randomParagraph.paragraphContent;
                }
                else {
                    const paragraphs = await this.prismaService.paragraph.findMany({
                        where: {
                            lengthType: paragraphLength,
                        }
                    });
                    const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
                    return randomParagraph.paragraphContent;
                }
            }
            else if (mode.modeName === 'row-based') {
                const rowType = mode.config?.rowType || 'HOME';
                const wordCount = mode.subConfig?.wordCount || 50;

                const words = await this.prismaService.word.findMany({
                    where: {
                        rowType: rowType,
                    }
                });

                const takenWords = words.sort(() => 0.5 - Math.random()).slice(0, wordCount);
                const wordList = takenWords.map(w => w.normalForm);
                return wordList.join(' ');
            }
            else {
                throw new BadRequestException('Chế độ gõ không hợp lệ');
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            else {
                throw new InternalServerErrorException('Lỗi khi lấy dữ liệu gõ');
            }
        }
    }
}