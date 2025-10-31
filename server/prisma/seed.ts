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
            { languageName: 'English', languageCode: 'en' },
            { languageName: 'Vietnamese', languageCode: 'vi' },
        ],
    });

    const categorizedWordByLength = (word: string) => {
        if (word.length <= 4) {
            return 'SHORT';
        } else if (word.length <= 8) {
            return 'MEDIUM';
        } else {
            return 'LONG';
        }
    }

    const homeRowKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', ':', '\"'];
    const topRowKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\', '{', '}', '|'];
    const bottomRowKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '<', '>', '?'];


    const categorizedWordByRowKey = (word: string) => {
        const lowerWord = word.toLowerCase();
        let usesHomeRow = false;
        let usesTopRow = false;
        let usesBottomRow = false;

        for (const char of lowerWord) {
            if (homeRowKeys.includes(char)) {
                usesHomeRow = true;
            } else if (topRowKeys.includes(char)) {
                usesTopRow = true;
            } else if (bottomRowKeys.includes(char)) {
                usesBottomRow = true;
            }
        }

        switch (true) {
            case usesHomeRow && !usesTopRow && !usesBottomRow:
                return 'HOME';
            case usesTopRow && !usesHomeRow && !usesBottomRow:
                return 'TOP';
            case usesBottomRow && !usesHomeRow && !usesTopRow:
                return 'BOTTOM';
            case usesHomeRow && usesTopRow && !usesBottomRow:
                return 'HOME_TOP';
            case usesHomeRow && usesBottomRow && !usesTopRow:
                return 'HOME_BOTTOM';
            case usesTopRow && usesBottomRow && !usesHomeRow:
                return 'TOP_BOTTOM';
            case usesHomeRow && usesTopRow && usesBottomRow:
                return 'ALL';
            default:
                return null;
        }
    }

    const englishLanguage = await prisma.language.findUnique({
        where: { languageCode: 'en' },
    })
    
    if (!englishLanguage) {
        throw new Error('Không tìm thấy ngôn ngữ English');
    }

    const vietnameseLanguage = await prisma.language.findUnique({
        where: { languageCode: 'vi' },
    })

    if (!vietnameseLanguage) {
        throw new Error('Không tìm thấy ngôn ngữ Vietnamese');
    }

    console.log('Seeding english short words...');
    const shortWords = fs.readFileSync(__dirname + '/google-10000-english-usa-no-swears-short.txt', 'utf-8');
    const shortWordList = shortWords.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    await prisma.word.createMany({
        data: shortWordList.map(word => ({
            rowType: categorizedWordByRowKey(word),
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
            rowType: categorizedWordByRowKey(word),
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
            rowType: categorizedWordByRowKey(word),
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