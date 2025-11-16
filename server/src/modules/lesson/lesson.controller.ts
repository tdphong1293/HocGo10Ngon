import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { NewLessonDto } from './dto/newLesson.dto';
import { UpdateLessonDto } from './dto/updateLesson.dto';

@Controller('lessons')
export class LessonController {
    constructor(
        private lessonService: LessonService
    ) { }

    @Get()
    async getAllLessons() {
        return await this.lessonService.getAllLessons();
    }

    @Get('last-order')
    async getLessonLastOrder() {
        return await this.lessonService.getLessonLastOrder();
    }
    
    @Post()
    async addLesson(newLessonDto: NewLessonDto) {
        return await this.lessonService.addLesson(newLessonDto);
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