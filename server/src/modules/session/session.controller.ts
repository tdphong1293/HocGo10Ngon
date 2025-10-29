import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Res, Req, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session.service';
import { Public } from '../auth/auth.guard';
import { SessionMode } from '../mongoose/schemas/session_mode.schema';

@Controller('sessions')
export class SessionController {
    constructor(
        private readonly sessionService: SessionService,
    ) { }

    @Public()
    @Get('modes')
    async getSessionModes() {
        return this.sessionService.getSessionMode();
    }

    @Public()
    @Post('practice')
    async getTypingPracticeText(@Body() body: SessionMode) {
        const practiceText = await this.sessionService.getPracticeTypingText(body);
        return {
            message: 'Lấy dữ liệu văn bản tập gõ thành công',
            text: practiceText
        };
    }
}