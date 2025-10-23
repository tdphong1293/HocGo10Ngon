import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async create(username: string, email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);

        return this.prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            }
        });
    }

    async findAll() {
        return this.prisma.user.findMany();
    }

    async findOneByUsername(username: string) {
        return this.prisma.user.findUnique({
            where: {
                username
            }
        });
    }

    async findOneByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email
            }
        });
    }

    async updatePreferredTheme(userid: string, theme: string) {
        try {
            const updatedUser = await this.prisma.user.update({
                where: {
                    userid
                },
                data: {
                    preferredTheme: theme
                }
            });

            if (!updatedUser) {
                throw new NotFoundException('Không tìm thấy người dùng');
            }

            return {
                message: 'Cập nhật theme ưa thích thành công',
            }
        } catch (error) {
            throw new InternalServerErrorException('Cập nhật theme không thành công');
        }
    }

    async updatePreferredFont(userid: string, font: string) {
        try {
            const updatedUser = await this.prisma.user.update({
                where: {
                    userid
                },
                data: {
                    preferredFont: font
                }
            });

            if (!updatedUser) {
                throw new NotFoundException('Không tìm thấy người dùng');
            }

            return {
                message: 'Cập nhật font ưa thích thành công',
            }
        }
        catch (error) {
            throw new InternalServerErrorException('Cập nhật font không thành công');
        }
    }

    async updatePassword(userid: string, newPassword: string) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            const updatedUser = await this.prisma.user.update({
                where: {
                    userid
                },
                data: {
                    password: hashedPassword
                }
            });

            if (!updatedUser) {
                throw new NotFoundException('Không tìm thấy người dùng');
            }

            return {
                message: 'Cập nhật mật khẩu thành công',
            }
        } catch (error) {
            throw new InternalServerErrorException('Cập nhật mật khẩu không thành công');
        }
    }
}