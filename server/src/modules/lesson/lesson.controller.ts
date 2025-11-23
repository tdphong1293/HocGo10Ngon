import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { NewLessonDto } from './dto/newLesson.dto';
import { UpdateLessonDto } from './dto/updateLesson.dto';

@Controller('lessons')
export class LessonController {
    constructor(
        private lessonService: LessonService
    ) { }

    @Get()
    async getAllLessons(@Query('languageCode') languageCode?: string, @Query('searchTitle') searchTitle?: string) {
        if (languageCode && searchTitle) {
            return await this.lessonService.getLessonsByLanguageAndTitle(languageCode, searchTitle);
        }
        else if (languageCode) {
            return await this.lessonService.getLessonsByLanguageCode(languageCode);
        }
        else {
            console.log("No filters applied");
            return await this.lessonService.getAllLessons();
        }
    }

    @Get('last-order')
    async getLessonLastOrder() {
        return await this.lessonService.getLessonLastOrder();
    }

    @Post()
    async addLesson(@Body() newLessonDto: NewLessonDto) {
        return await this.lessonService.addLesson(newLessonDto);
    }

    @Put('order')
    async updateLessonOrder(@Body('lessonid') lessonid: string, @Body('newOrder') newOrder: number) {
        return await this.lessonService.updateLessonOrder(lessonid, newOrder);
    }

    @Patch(':lessonid')
    async updateLesson(@Param('lessonid') lessonid: string, @Body() updateLessonDto: UpdateLessonDto) {
        return await this.lessonService.updateLesson(lessonid, updateLessonDto);
    }

    @Get(':lessonid')
    async getLessonById(@Param('lessonid') lessonid: string) {
        return await this.lessonService.getLessonById(lessonid);
    }
}