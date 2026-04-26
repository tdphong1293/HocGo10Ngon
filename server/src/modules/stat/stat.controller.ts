import { Controller, Get } from '@nestjs/common';
import { StatService } from './stat.service';
import { AuthenticatedRequest } from '../auth/auth.guard';

@Controller('stats')
export class StatController {
    constructor(
        private readonly statService: StatService,
    ) { }
}
