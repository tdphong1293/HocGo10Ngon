import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Res, Req, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session.service';
import { Public } from '../auth/auth.guard';
import { PracticeTypingTextDto } from './dto/practiceTypingText.dto';

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
    async getTypingPracticeText(@Body() textDto: PracticeTypingTextDto) {
        const { languageCode, mode } = textDto;
        const practiceText = await this.sessionService.getPracticeTypingText(languageCode, mode);
        return {
            message: 'Lấy dữ liệu văn bản tập gõ thành công',
            text: practiceText
        };
    }
}