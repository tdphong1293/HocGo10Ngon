import { Controller, Get, Req } from '@nestjs/common';
import { StatService } from './stat.service';
import type { AuthenticatedRequest } from '../auth/auth.guard';

@Controller('stats')
export class StatController {
    constructor(
        private readonly statService: StatService,
    ) { }

    @Get()
    async getUserTypingStats(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        return this.statService.getUserTypingStats(sub);
    }

    @Get("webtime")
    async getUserActiveWebtime(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        return this.statService.getUserActiveWebtime(sub);
    }

    @Get("keys")
    async getUserKeyStats(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        const keyAccuracy = await this.statService.getUserKeyAccuracy(sub);
        const keyLatency = await this.statService.getUserKeyLatency(sub);
        const returnData: Record<string, { accuracy: number; avgLatency: number }> = {};

        for (const { key, accuracy } of keyAccuracy) {
            returnData[key] = { ...returnData[key], accuracy };
        }

        for (const { key, avgLatency } of keyLatency) {
            returnData[key] = { ...returnData[key], avgLatency };
        }

        return returnData;
    }

    @Get("fingers")
    async getUserFingerStats(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        const fingerAccuracy = await this.statService.getUserFingerAccuracy(sub);
        const fingerLatency = await this.statService.getUserFingerLatency(sub);
        const returnData: Record<string, { accuracy: number; avgLatency: number }> = {};

        for (const [finger, { accuracy }] of Object.entries(fingerAccuracy)) {
            returnData[finger] = { ...returnData[finger], accuracy };
        }

        for (const [finger, { avgLatency }] of Object.entries(fingerLatency)) {
            returnData[finger] = { ...returnData[finger], avgLatency };
        }

        return returnData;
    }

    @Get("attempts")
    async getUserAttempts(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        const todayData = await this.statService.getUserTodaySessionAttempts(sub);
        const thisWeekData = await this.statService.getUserThisWeekSessionAttempts(sub);
        return {
            today: todayData,
            this_week: thisWeekData,
        };
    }

    @Get("keytypes")
    async getUserKeyTypeLatency(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        const keyTypeLatency = await this.statService.getUserKeyTypeLatency(sub);
        const returnData: Record<string, { avgLatency: number }> = {};
        for (const [keyType, { avgLatency }] of Object.entries(keyTypeLatency)) {
            returnData[keyType] = { ...returnData[keyType], avgLatency };
        }
        return returnData;
    }

    @Get("stat-time")
    async getUserTypingStatsByTime(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        return await this.statService.getUserTypingStatsByTime(sub);
    }
}
