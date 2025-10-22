import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Res, Req, UnauthorizedException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SignupUserDto } from './dto/signup-user.dto';
import { SigninUserDto } from './dto/signin-user.dto';
import { Public } from './auth.guard';
import { ConfigService } from '@nestjs/config';
@Controller('auth')
@Public()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    @Post('signup')
    async signUp(@Body() signupUserDto: SignupUserDto) {
        return this.authService.signUp(signupUserDto);
    }

    @Post('signin')
    async signIn(@Body() signinUserDto: SigninUserDto, @Res({passthrough: true}) response: Response) {
        const result = await this.authService.signIn(signinUserDto);

        // Store refresh token as HttpOnly cookie
        response.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,    // Cannot be accessed by JavaScript
            secure: this.configService.get('NODE_ENV') === 'production', // HTTPS in production
            sameSite: 'strict', // CSRF protection
            maxAge: (this.configService.get<number>('JWT_REFRESH_EXPIRES_IN_MS') || 7) * 24 * 60 * 60 * 1000 // 7 days
        });

        // Only send access token to client
        return {
            message: result.message,
            access_token: result.access_token
        };
    }

    @Post('refresh')
    async refreshTokens(@Req() request: Request, @Res({passthrough: true}) response: Response) {
        const refreshToken = request.cookies['refresh_token'];

        if (!refreshToken) {
            throw new UnauthorizedException('Không tìm thấy Refresh token');
        }

        const result = await this.authService.refreshTokens(refreshToken);

        // Set new refresh token cookie
        response.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: 'strict',
            maxAge: (this.configService.get<number>('JWT_REFRESH_EXPIRES_IN_MS') || 7) * 24 * 60 * 60 * 1000
        });

        return {
            access_token: result.access_token
        };
    }

    @Post('signout')
    async signOut(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies['refresh_token'];

        if (refreshToken) {
            // Clear the refresh token cookie
            response.clearCookie('refresh_token');
            return await this.authService.signOut(refreshToken);
        }
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