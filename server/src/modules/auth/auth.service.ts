import { Injectable, UnauthorizedException, Inject, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { SignupUserDto } from './dto/signup-user.dto';
import { SigninUserDto } from './dto/signin-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { CacheService } from '../cache/cache.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly nodemailerService: NodemailerService,
        private readonly cacheService: CacheService,
    ) { }

    async signUp(signupUserDto: SignupUserDto) {
        const { username, email, password } = signupUserDto;

        const existUsername = await this.userService.findOneByUsername(username);
        if (existUsername) {
            throw new UnauthorizedException('Tên đăng nhập đã tồn tại');
        }

        const existEmail = await this.userService.findOneByEmail(email);
        if (existEmail) {
            throw new UnauthorizedException('Email đã được sử dụng');
        }

        await this.userService.create(username, email, password);

        return { message: 'Đăng ký tài khoản thành công' };
    }

    async signIn(signinUserDto: SigninUserDto) {
        const user = await this.userService.findOneByUsername(signinUserDto.username);
        if (user && await bcrypt.compare(signinUserDto.password, user.password)) {
            const payload = {
                sub: user.userid,
                username: user.username,
                email: user.email,
                role: user.role,
                theme: user.preferredTheme,
                font: user.preferredFont,
                languageCode: user.preferredLanguageCode,
            };

            // Generate access token (short-lived)
            const access_token = await this.jwtService.signAsync(payload);

            // Generate refresh token (long-lived)
            const refresh_token = await this.generateRefreshToken(user.userid);

            return {
                message: 'Đăng nhập thành công!',
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

        // Generate new access token
        const payload = {
            sub: storedToken.user.userid,
            username: storedToken.user.username,
            email: storedToken.user.email,
            role: storedToken.user.role,
            theme: storedToken.user.preferredTheme,
            font: storedToken.user.preferredFont,
        };

        const access_token = await this.jwtService.signAsync(payload);

        return {
            access_token,
            message: 'Làm mới token thành công'
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

    private generateOTP(length: number = 6): string {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    }

    async sendOTP(email: string) {
        const user = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException('Không tìm thấy tài khoản với email này');
        }

        const cachedOtp = await this.cacheService.ttl(`${user.userid}:${email}:otp`);

        // Không cho phép gửi lại mã OTP trước 2 phút còn lại (chưa qua 1 phút) 
        if (cachedOtp && cachedOtp - Date.now() > 120000) {
            const remainingSeconds = Math.ceil((cachedOtp - Date.now()) / 1000) - 120;
            throw new HttpException({
                message: 'Một yêu cầu OTP đã được gửi đến email này, vui lòng chờ vài giây trước khi gửi lại',
                retryAfter: remainingSeconds
            }, HttpStatus.TOO_MANY_REQUESTS);
        }

        // Trường hợp TTL của OTP còn ít hơn 2 phút, xóa OTP cũ, gửi OTP mới
        await this.cacheService.del(`${user.userid}:${email}:otp`);

        const otpCode = this.generateOTP(6);
        await this.nodemailerService.sendOTPEmail(email, user.username, otpCode, 3);
        await this.cacheService.set(`${user.userid}:${email}:otp`, otpCode, 3 * 60 * 1000); // Lưu OTP trong 3 phút

        return { message: 'Đã gửi mã OTP đến email của bạn, nếu không có hãy kiểm tra hộp thư rác hoặc spam' };
    }

    async verifyOTP(email: string, otp: string) {
        const user = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException('Không tìm thấy tài khoản với email này');
        }

        const cachedOtp = await this.cacheService.get(`${user.userid}:${email}:otp`);
        if (!cachedOtp || cachedOtp !== otp) {
            throw new NotFoundException('Mã OTP không hợp lệ hoặc đã hết hạn');
        }


        await this.cacheService.del(`${user.userid}:${email}:otp`);
        const resetToken = await this.generateResetToken();
        // Tạo token reset password và lưu vào cache với TTL 10 phút
        await this.cacheService.set(`${user.userid}:${email}:${otp}:reset`, resetToken, 10 * 60 * 1000);
        return { 
            reset_token: resetToken,
            message: 'Xác thực mã OTP thành công!' 
        };
    }

    private async generateResetToken(): Promise<string> {
        const token = crypto.randomBytes(64).toString('hex');
        return token;
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { resetToken, otp, email, newPassword } = resetPasswordDto;

        const user = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException('Không tìm thấy tài khoản với email này');
        }

        const cachedResetToken = await this.cacheService.get(`${user.userid}:${email}:${otp}:reset`);
        if (!cachedResetToken || cachedResetToken !== resetToken) {
            throw new NotFoundException('Phiên khôi phục mật khẩu không hợp lệ hoặc đã hết hạn');
        }

        await this.cacheService.del(`${user.userid}:${email}:${otp}:reset`);
        await this.userService.updatePassword(user.userid, newPassword);

        return { message: 'Khôi phục mật khẩu thành công!' };
    }
}