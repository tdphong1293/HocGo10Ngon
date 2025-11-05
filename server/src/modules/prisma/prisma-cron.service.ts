import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { categorizedParagraphByLength } from 'src/utils/quoteParagraph';

@Injectable()
export class PrismaCronService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly schedulerRegistry: SchedulerRegistry
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async cleanUpOldRefreshTokens() {
        const result = await this.prismaService.refreshToken.deleteMany({
            where: {
                OR: [
                    { revoked: true },
                    { expiresAt: { lt: new Date() } },
                ]
            },
        });
        console.log(`Đã dọn dẹp ${result.count} refresh tokens hết hạn hoặc bị thu hồi.`);
    }

    @Cron(CronExpression.EVERY_30_MINUTES, {
        name: 'fetchQuotesDataJob',
    })
    async fetchQuotesData() {
        console.log('Bắt đầu công việc lấy dữ liệu câu trích dẫn từ QuoteAPI...');
        try {
            const paragraphCount = await this.prismaService.paragraph.count({
                where: {
                    contentType: 'QUOTE',
                },
            });

            if (paragraphCount >= 100000) {
                console.log('Đã đạt đến giới hạn câu trích dẫn, không lấy thêm nữa.');
                const job = this.schedulerRegistry.getCronJob('fetchQuotesDataJob');
                job.stop();
                return;
            }

            const response = await fetch('https://api.quotable.io/quotes/random?limit=50', {
                method: 'GET',
            });

            if (response.ok) {
                const data = await response.json();

                const englishLanguage = await this.prismaService.language.findUnique({
                    where: { languageCode: 'en' },
                });

                if (!englishLanguage) {
                    console.error('Không tìm thấy ngôn ngữ tiếng Anh trong cơ sở dữ liệu để lưu trữ câu trích dẫn.');
                    return;
                }

                const quotesToInsert = data.map((quote: any) => ({
                    source: quote.author,
                    externalid: quote._id,
                    paragraphContent: quote.content,
                    author: quote.author,
                    contentType: 'QUOTE' as const,
                    lengthType: categorizedParagraphByLength(quote.content),
                    languageid: englishLanguage.languageid,
                }));

                await this.prismaService.paragraph.createMany({
                    data: quotesToInsert,
                    skipDuplicates: true,
                });

                console.log(`Đã lấy và lưu trữ ${quotesToInsert.length} trích dẫn thành công từ QuoteAPI.`);
            }
            else if (response.status === 429) {
                const retryAfter = parseInt(response.headers.get('Retry-After') ?? '60', 10);
                console.warn(`Đạt hạn mức yêu cầu tối đa của API, sẽ thử lại sau ${retryAfter} giây.`);
                setTimeout(() => this.fetchQuotesData(), retryAfter * 1000);
                return;
            }
            else {
                console.error('Lỗi khi lấy dữ liệu câu trích dẫn:', response.statusText);
                return;
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu câu trích dẫn:', error);
        }
    }
}