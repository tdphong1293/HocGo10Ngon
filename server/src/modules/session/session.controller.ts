import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Res, Req, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session.service';
import { Public } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { TypingTextDto } from './dto/typingText.dto';
import { sessionDataDto } from './dto/sessionData.dto';

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
    @Post('text')
    async getTypingText(@Body() textDto: TypingTextDto) {
        const { languageCode, mode } = textDto;
        const { totalWords, words, author, source } = await this.sessionService.getTypingText(languageCode, mode);
        return {
            message: 'Lấy dữ liệu văn bản tập gõ thành công',
            totalWords: totalWords,
            words: words,
            author: author,
            source: source,
        };
    }

    @Post('store')
    async storeSession(@Req() req: AuthenticatedRequest, @Body() sessionDataDto: sessionDataDto) {
        const { sub } = req.user;
        return this.sessionService.storeSession(sub, sessionDataDto);
    }
}