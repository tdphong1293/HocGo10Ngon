import { IsString, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    resetToken: string;

    @IsString()
    @IsNotEmpty()
    otp: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Định dạng email không hợp lệ' })
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    newPassword: string;
}