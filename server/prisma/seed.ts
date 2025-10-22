import { PrismaClient } from "src/generated/client/client";

import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    async function deleteAllData(tableList: string[]) {
        for (const tableName of tableList) {
            console.log('Truncating all data from ' + tableName);
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;`);
        }
    }

    const tableList = [
        'refresh_tokens',
        'users',
        'lessons',
        'paragraphs',
        'words',
        'numbers',
        'punctuations',
        'user_lessons',
        'languages',
        'lesson_practices',
        'user_practices',
    ];

    await deleteAllData(tableList);


    const adminExists = await prisma.user.findUnique({
        where: { username: 'admin' },
    });

    if (!adminExists) {
        const adminUser = await prisma.user.create({
            data: {
                username: 'admin',
                email: 'tangphong333@gmail.com',
                password: bcrypt.hashSync('123456', 10),
                role: 'ADMIN',
            },
        });
        // console.log('Admin user created:', adminUser);
    }

    const user = await prisma.user.create({
        data: {
            username: 'user1',
            email: 'user1@example.com',
            password: bcrypt.hashSync('123456', 10),
        },
    });
    // console.log('User created:', user);

    console.log('Seeding completed.');
}

main();