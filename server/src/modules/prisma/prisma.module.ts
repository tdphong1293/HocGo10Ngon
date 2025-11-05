import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaCronService } from './prisma-cron.service';

@Global()
@Module({
    providers: [PrismaService, PrismaCronService],
    exports: [PrismaService],
})
export class PrismaModule { }