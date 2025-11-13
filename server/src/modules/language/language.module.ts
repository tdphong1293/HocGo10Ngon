import { Module } from '@nestjs/common';
import { LanguageService } from './language.service';
import { LanguageController } from './language.controller';

@Module({
    providers: [LanguageService],
    controllers: [LanguageController],
    exports: [LanguageService]
})
export class LanguageModule { }