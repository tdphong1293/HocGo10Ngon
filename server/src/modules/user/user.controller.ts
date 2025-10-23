import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Req, Res } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { SignupUserDto } from '../auth/dto/signup-user.dto';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {}


    @Post()
    async create(@Body() createUserDto: SignupUserDto) {
        const { username, email, password } = createUserDto;
        return await this.userService.create(username, email, password);
    }

    @Get()
    async findAll() {
        return await this.userService.findAll();
    }

    @Get(':username')
    async findOneByUsername(@Param('username') username: string) {
        return await this.userService.findOneByUsername(username);
    }

    @Put('preferred-font')
    async updatePreferredFont(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response, @Body('font') font: string) {
        const { sub } = request.user;
        return await this.userService.updatePreferredFont(sub, font);
    }

    @Put('preferred-theme')
    async updatePreferredTheme(@Req() request: AuthenticatedRequest, @Body('theme') theme: string) {
        const { sub } = request.user;
        return await this.userService.updatePreferredTheme(sub, theme);
    }
}