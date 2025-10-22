import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    // async create(data: CreateUserDto) {
    //     return this.prisma.user.create({ data });
    // }

    async findAll() {
        return this.prisma.user.findMany();
    }

    async findOneByUsername(username: string) {
        return this.prisma.user.findUnique({ where: { username } });
    }

    // async update(id: string, data: UpdateUserDto) {
    //     return this.prisma.user.update({ where: { id }, data });
    // }

    // async remove(id: string) {
    //     return this.prisma.user.delete({ where: { id } });
    // }
}