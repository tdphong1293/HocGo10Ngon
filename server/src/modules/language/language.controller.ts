import { Controller, Get, Post, Body } from '@nestjs/common';
import { LanguageService } from './language.service';
import { Public } from '../auth/auth.guard';
import { Roles, Role } from 'src/modules/auth/roles.guard';

@Controller('languages')
export class LanguageController {
    constructor(
        private languageService: LanguageService
    ) { }

    @Get()
    @Public()
    async getAllLanguages() {
        const result = await this.languageService.getAllLanguages();
        return {
            languages: result,
            message: 'Lấy danh sách ngôn ngữ thành công.',
        }
    }

    @Post()
    @Roles(Role.ADMIN)
    async createLanguage(
        @Body('languageName') languageName: string,
        @Body('languageCode') languageCode: string
    ) {
        const result = await this.languageService.createLanguage(languageName, languageCode);
        return {
            language: result,
            message: 'Thêm ngôn ngữ mới thành công.',
        }
    }
}