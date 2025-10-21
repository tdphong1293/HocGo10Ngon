import { Controller, Get, Post, Put, Patch, Delete, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signUp(@Body() createUserDto: any) {
        return this.authService.signUp(createUserDto);
    }

    @Post('signin')
    async signIn(@Body() loginUserDto: any) {
        return this.authService.signIn(loginUserDto);
    }

    @Post('send-otp')
    async sendOTP(@Body('email') email: string) {
        return this.authService.sendOTP(email);
    }

    @Post('verify-otp')
    async verifyOTP(@Body('email') email: string, @Body('otp') otp: string) {
        return this.authService.verifyOTP(email, otp);
    }

    @Post('reset-password')
    async resetPassword(@Body('email') email: string, @Body('newPassword') newPassword: string) {
        return this.authService.resetPassword(email, newPassword);
    }
}