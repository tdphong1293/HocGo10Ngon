import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

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
}