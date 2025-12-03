import { Module } from '@nestjs/common';
import { ParagraphService } from './paragraph.service';
import { ParagraphController } from './paragraph.controller';

@Module({
    controllers: [ParagraphController],
    providers: [ParagraphService],
    exports: [ParagraphService],
})
export class ParagraphModule { }