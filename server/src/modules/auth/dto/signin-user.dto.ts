import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SigninUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5, { message: 'Tên đăng nhập phải có ít nhất 5 ký tự' })
    @MaxLength(20, { message: 'Tên đăng nhập được phép chứa tối đa 20 ký tự' })
    @Matches(/^[a-zA-Z0-9_]{5,20}$/, { message: 'Tên đăng nhập chỉ có thể chứa chữ cái, số và dấu gạch dưới' })
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string;
}