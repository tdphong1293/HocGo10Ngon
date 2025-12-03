import { Controller, Post, Body, Delete } from '@nestjs/common';
import { WordService } from './word.service';
import { Roles, Role } from 'src/modules/auth/roles.guard';

@Controller('words')
export class WordController {
    constructor(
        private readonly wordService: WordService
    ) { }

    @Post()
    @Roles(Role.ADMIN)
    async addWords(
        @Body('words') words: string[],
        @Body('languageid') languageid: string,
    ) {
        const result = await this.wordService.addWords(words, languageid);
        return {
            count: result.count,
            message: `Thêm ${result.count} từ mới thành công.`,
        };
    }

    @Delete()
    @Roles(Role.ADMIN)
    async deleteWords(
        @Body('words') words: string[],
    ) {
        const result = await this.wordService.deleteWords(words);
        return {
            count: result.count,
            message: `Xóa ${result.count} từ thành công.`,
        };
    }
}