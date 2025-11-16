import { Body, Controller, Post } from '@nestjs/common';
import { ParagraphService } from './paragraph.service';
import { createParagraphDto } from './dto/createParagraph.dto';

@Controller('paragraphs')
export class ParagraphController {
    constructor(
        private readonly paragraphService: ParagraphService
    ) { }

    @Post()
    async createParagraph(@Body() data: createParagraphDto) {
        await this.paragraphService.createParagraph(data);
        return {
            message: "Đã thêm đoạn văn bản thành công"
        }
    }
}