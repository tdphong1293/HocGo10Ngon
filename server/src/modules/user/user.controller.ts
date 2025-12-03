import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Req, Res } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { SignupUserDto } from '../auth/dto/signup-user.dto';
import { UserService } from './user.service';
import { SessionMode } from '../mongoose/schemas/session_mode.schema';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }


    @Post()
    async create(@Body() createUserDto: SignupUserDto) {
        const { username, email, password } = createUserDto;
        return await this.userService.create(username, email, password);
    }

    @Get()
    async findAll() {
        return await this.userService.findAll();
    }

    @Get('username')
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

    @Put('change-password')
    async changePassword(@Req() request: AuthenticatedRequest, @Body('currentPassword') currentPassword: string, @Body('newPassword') newPassword: string) {
        const { sub } = request.user;
        return await this.userService.changePassword(sub, currentPassword, newPassword);
    }

    @Get('mode')
    async getUserSessionMode(@Req() request: AuthenticatedRequest) {
        const { sub } = request.user;
        return await this.userService.getUserSessionMode(sub);
    }

    @Put('mode')
    async updateUserSessionMode(@Req() request: AuthenticatedRequest, @Body() mode: SessionMode) {
        const { sub } = request.user;
        return await this.userService.updateUserSessionMode(sub, mode);
    }
}