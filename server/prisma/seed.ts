import { PrismaClient } from "src/generated/client/client";
import fs from "fs";

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
    }

    const user = await prisma.user.create({
        data: {
            username: 'user1',
            email: 'user1@example.com',
            password: bcrypt.hashSync('123456', 10),
        },
    });

    const punctuations = ['.', ',', '!', '?', ';', ':', '-', '(', ')', '[', ']', '{', '}', '"', "'", '/', '\\', '@', '#', '$', '%', '^', '&', '*', '_', '~', '`', '<', '>'];
    await prisma.punctuation.createMany({
        data: punctuations.map((char) => ({
            punctuationSymbol: char
        })),
    });

    await prisma.number.create({
        data: {
            minValue: 0,
            maxValue: 1000,
        }
    })

    await prisma.language.createMany({
        data: [
            { languageName: 'English' },
            { languageName: 'Vietnamese' },
        ],
    });

    const englishLanguage = await prisma.language.findUnique({
        where: { languageName: 'English' },
    })
    
    if (!englishLanguage) {
        throw new Error('Không tìm thấy ngôn ngữ English');
    }

    const vietnameseLanguage = await prisma.language.findUnique({
        where: { languageName: 'Vietnamese' },
    })

    if (!vietnameseLanguage) {
        throw new Error('Không tìm thấy ngôn ngữ Vietnamese');
    }

    console.log('Seeding english short words...');
    const shortWords = fs.readFileSync(__dirname + '/google-10000-english-usa-no-swears-short.txt', 'utf-8');
    const shortWordList = shortWords.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    await prisma.word.createMany({
        data: shortWordList.map(word => ({
            lengthType: 'SHORT',
            normalForm: word,
            capitalForm: word.charAt(0).toUpperCase() + word.slice(1),
            languageid: englishLanguage.languageid,
        })),
    });
    console.log('Seeded english short words.');

    console.log('Seeding english medium words...');
    const mediumWords = fs.readFileSync(__dirname + '/google-10000-english-usa-no-swears-medium.txt', 'utf-8');
    const mediumWordList = mediumWords.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    await prisma.word.createMany({
        data: mediumWordList.map(word => ({
            lengthType: 'MEDIUM',
            normalForm: word,
            capitalForm: word.charAt(0).toUpperCase() + word.slice(1),
            languageid: englishLanguage.languageid,
        })),
    });
    console.log('Seeded english medium words.');

    console.log('Seeding english long words...');
    const longWords = fs.readFileSync(__dirname + '/google-10000-english-usa-no-swears-long.txt', 'utf-8');
    const longWordList = longWords.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    await prisma.word.createMany({
        data: longWordList.map(word => ({
            lengthType: 'LONG',
            normalForm: word,
            capitalForm: word.charAt(0).toUpperCase() + word.slice(1),
            languageid: englishLanguage.languageid,
        })),
    });
    console.log('Seeded english long words.');

    console.log('Seeding completed.');
}

main();