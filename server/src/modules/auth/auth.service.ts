import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupUserDto } from './dto/signup-user.dto';
import { SigninUserDto } from './dto/signin-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { matches } from 'class-validator';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService
    ) { }

    async signUp(signupUserDto: SignupUserDto) {
        // return this.userService.create(signupUserDto);
    }

    async signIn(signinUserDto: SigninUserDto) {
        const user = await this.userService.findOneByUsername(signinUserDto.username);
        if (user && user.password === signinUserDto.password) {
            const payload = {
                sub: user.userid,
                username: user.username,
                email: user.email,
                role: user.role
            };

            // Generate access token (short-lived)
            const access_token = await this.jwtService.signAsync(payload);

            // Generate refresh token (long-lived)
            const refresh_token = await this.generateRefreshToken(user.userid);

            return {
                message: 'Đăng nhập thành công',
                access_token,
                refresh_token
            };
        } else {
            throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
        }
    }

    async refreshTokens(refreshToken: string) {

        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });

        if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }

        // Generate new tokens
        const payload = {
            sub: storedToken.user.userid,
            username: storedToken.user.username,
            email: storedToken.user.email,
            role: storedToken.user.role
        };

        const access_token = await this.jwtService.signAsync(payload);

        const new_refresh_token = await this.generateRefreshToken(storedToken.user.userid);

        await this.prisma.refreshToken.update({
            where: { token: refreshToken },
            data: { revoked: true }
        });

        return {
            access_token,
            refresh_token: new_refresh_token
        };
    }

    async signOut(refreshToken: string) {
        // Revoke refresh token
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revoked: true }
        });

        return { message: 'Đăng xuất thành công' };
    }

    private async generateRefreshToken(userid: string): Promise<string> {
        const token = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date();
        const refreshTokenSpanDay = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN') || 7;
        expiresAt.setDate(expiresAt.getDate() + refreshTokenSpanDay);

        // Store in database
        await this.prisma.refreshToken.create({
            data: {
                token,
                userid,
                expiresAt
            }
        });

        return token;
    }

    async sendOTP(email: string) {
        // OTP sending logic here
    }

    async verifyOTP(email: string, otp: string) {

    }

    async resetPassword(email: string, newPassword: string) {

    }
}