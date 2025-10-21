import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    async signUp(createUserDto: any) {
        // Registration logic here
    }

    async signIn(loginUserDto: any) {
        // Login logic here
    }

    async sendOTP(email: string) {
        // OTP sending logic here
    }

    async verifyOTP(email: string, otp: string) {

    }

    async resetPassword(email: string, newPassword: string) {

    }
}