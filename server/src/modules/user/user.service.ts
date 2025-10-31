import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSessionModeDocument } from '../mongoose/schemas/user_session_mode.schema';
import { SessionModeDocument, SessionMode } from '../mongoose/schemas/session_mode.schema';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        @InjectModel('UserSessionMode') private userSessionModeModel: Model<UserSessionModeDocument>,
        @InjectModel('SessionMode') private sessionModeModel: Model<SessionModeDocument>,
    ) { }

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
            if (error instanceof HttpException) {
                throw error;
            }
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
            if (error instanceof HttpException) {
                throw error;
            }
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
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Cập nhật mật khẩu không thành công');
        }
    }

    async changePassword(userid: string, currentPassword: string, newPassword: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    userid
                }
            });

            if (!user) {
                throw new NotFoundException('Không tìm thấy người dùng');
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new BadRequestException('Mật khẩu hiện tại không đúng');
            }

            await this.prisma.user.update({
                where: {
                    userid
                },
                data: {
                    password: await bcrypt.hash(newPassword, 10)
                }
            });

            return {
                message: 'Đổi mật khẩu thành công!',
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Đổi mật khẩu không thành công');
        }
    }

    async getUserSessionMode(userid: string) {
        try {
            const userSessionMode = await this.userSessionModeModel.findOne({ userid }).exec();

            if (!userSessionMode) {
                throw new NotFoundException('Không tìm thấy chế độ gõ của người dùng');
            }

            const activeSessionMode = await this.sessionModeModel.findOne({ modeName: userSessionMode.modeName }).exec();

            if (!activeSessionMode) {
                throw new NotFoundException('Chế độ gõ của người dùng không hợp lệ');
            }

            const userSessionModeFormatted = {
                modeName: userSessionMode.modeName,
                config: userSessionMode.config,
                subConfig: userSessionMode.subConfig,
            }

            const userActiveModeFormatted = {
                modeName: activeSessionMode.modeName,
                config: activeSessionMode.config,
                subConfig: activeSessionMode.subConfig,
            }

            return {
                message: 'Lấy chế độ gõ của người dùng thành công',
                activeMode: userActiveModeFormatted,
                sessionMode: userSessionModeFormatted,
            }
        } catch (error) {
            console.log('error', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Lấy chế độ gõ của người dùng không thành công');
        }
    }

    async updateUserSessionMode(userid: string, mode: SessionMode) {
        try {
            const updatedSessionMode = await this.userSessionModeModel.updateOne(
                { userid },
                {
                    modeName: mode.modeName,
                    config: mode.config,
                    subConfig: mode.subConfig,
                },
                { upsert: true }
            ).exec();

            if (!updatedSessionMode) {
                throw new NotFoundException('Không tìm thấy chế độ gõ của người dùng');
            }

            return {
                message: 'Cập nhật chế độ gõ của người dùng thành công',
                sessionMode: updatedSessionMode,
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Cập nhật chế độ gõ của người dùng không thành công');
        }
    }
}