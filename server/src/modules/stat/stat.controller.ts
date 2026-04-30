import { Controller, Get, Req} from '@nestjs/common';
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

    @Get("key-accuracy")
    async getUserKeyAccuracy(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        return this.statService.getUserKeyAccuracy(sub);
    }

    @Get("key-latency")
    async getUserKeyLatency(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        return this.statService.getUserKeyLatency(sub);
    }

    @Get("finger-accuracy")
    async getUserFingerAccuracy(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        return this.statService.getUserFingerAccuracy(sub);
    }

    @Get("finger-latency")
    async getUserFingerLatency(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        return this.statService.getUserFingerLatency(sub);
    }

    @Get("attempts")
    async getUserAttempts(@Req() req: AuthenticatedRequest) {
        const { sub } = req.user;
        const todayData = this.statService.getUserTodaySessionAttempts(sub);
        const thisWeekData = this.statService.getUserThisWeekSessionAttempts(sub);
        return { ...todayData, ...thisWeekData };
    }
}
