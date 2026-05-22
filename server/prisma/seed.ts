import { PrismaClient } from "src/generated/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { categorizedWordByRowKey } from "src/utils/categorizedWord";
import { categorizedParagraphByLength } from "src/utils/categorizedParagraph";
import { RowType, LessonHandType, LessonType } from "src/generated/enums";
import fs from "fs";

import bcrypt from "bcryptjs";
import "dotenv-expand/config";

const connectionString = `${process.env.POSTGRES_URL}` || '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

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

    console.log('Seeding paragraphs...');

    const paragraphs = [
        {
            text: 'It was a bright cold day in April, and the clocks were striking thirteen.',
            source: '1984',
            author: 'George Orwell',
        },
        {
            text: 'All happy families are alike; each unhappy family is unhappy in its own way.',
            source: 'Anna Karenina',
            author: 'Leo Tolstoy',
        },
        {
            text: 'The man in black fled across the desert, and the gunslinger followed.',
            source: 'The Gunslinger',
            author: 'Stephen King',
        },
        {
            text: 'Ships at a distance have every man\'s wish on board.',
            source: 'Their Eyes Were Watching God',
            author: 'Zora Neale Hurston',
        },
        {
            text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
            source: 'Pride and Prejudice',
            author: 'Jane Austen',
        },
        {
            text: 'You don\'t forget the face of the person who was your last hope.',
            source: 'The Hunger Games',
            author: 'Suzanne Collins',
        },
        {
            text: 'Fear is the mind-killer. Fear is the little-death that brings total obliteration.',
            source: 'Dune',
            author: 'Frank Herbert',
        },
        {
            text: 'After all, tomorrow is another day.',
            source: 'Gone with the Wind',
            author: 'Margaret Mitchell',
        },
        {
            text: 'Get busy living, or get busy dying.',
            source: 'The Shawshank Redemption',
            author: 'Stephen King',
        },
        {
            text: 'May the Force be with you.',
            source: 'Star Wars',
            author: 'George Lucas',
        },
        {
            text: 'The old man sat quietly beside the river as the sun disappeared behind the hills. Fishermen were returning home with empty nets, and the evening air carried the smell of rain and smoke from distant houses.',
            source: 'The Old Man and the Sea',
            author: 'Ernest Hemingway',
        },
        {
            text: 'Harry had always been small and skinny for his age. He lived in the cupboard under the stairs and spent most evenings listening to the distant laughter coming from the living room while he remained alone in the dark.',
            source: 'Harry Potter and the Philosopher\'s Stone',
            author: 'J.K. Rowling',
        },
        {
            text: 'The train moved slowly through the snowy countryside while passengers slept in silence. Near the window, a young woman continued reading the same letter again and again, unable to forget the final sentence.',
            source: 'Murder on the Orient Express',
            author: 'Agatha Christie',
        },
        {
            text: 'Far above the clouds, the city lights looked like scattered stars across the earth. The pilot adjusted the controls carefully while turbulence shook the cabin and anxious passengers gripped their seats.',
            source: 'Night Flight',
            author: 'Antoine de Saint-Exupéry',
        },
        {
            text: 'The marketplace was crowded with travelers, musicians, and merchants from distant countries. Bright fabrics hung between wooden stalls, children ran through narrow streets, and the sound of drums echoed late into the evening.',
            source: 'Arabian Nights',
            author: 'Anonymous',
        },
        {
            text: 'For a long moment, nobody in the courtroom spoke. The witness stood near the door with trembling hands while reporters prepared their notebooks, knowing the testimony could change the entire case.',
            source: 'To Kill a Mockingbird',
            author: 'Harper Lee',
        },
        {
            text: 'The spaceship drifted silently near the edge of the planet while warning lights flashed across the control panel. Outside the window, enormous storms moved slowly across the dark surface below.',
            source: '2001: A Space Odyssey',
            author: 'Arthur C. Clarke',
        },
        {
            text: 'Elizabeth walked across the garden path with careful steps as the morning fog covered the fields around the estate. Somewhere in the distance, church bells rang softly through the cold autumn air.',
            source: 'Pride and Prejudice',
            author: 'Jane Austen',
        },
        {
            text: 'There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning; but since dinner the cold winter wind had brought with it clouds so sombre, and a rain so penetrating, that further outdoor exercise was now out of the question.',
            source: 'Jane Eyre',
            author: 'Charlotte Brontë',
        },

        {
            text: 'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',
            source: 'Moby-Dick',
            author: 'Herman Melville',
        },

        {
            text: 'It is a melancholy truth that even great men have their poor relations. The Scarlett family of South Carolina had an aunt in Charleston whose husband had been governor of the state, and whose son had married a lady of wealth and position.',
            source: 'The Gilded Age',
            author: 'Mark Twain',
        },

        {
            text: 'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do. Once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it.',
            source: 'Alice\'s Adventures in Wonderland',
            author: 'Lewis Carroll',
        },

        {
            text: 'In another moment down went Alice after it, never once considering how in the world she was to get out again. The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down.',
            source: 'Alice\'s Adventures in Wonderland',
            author: 'Lewis Carroll',
        },

        {
            text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.',
            source: 'A Tale of Two Cities',
            author: 'Charles Dickens',
        },

        {
            text: 'The little room was almost dark, for the day was cloudy. Through the window could be seen the tops of trees tossing in the wind. A fire burned faintly upon the hearth, and the quiet ticking of a clock sounded from the corner.',
            source: 'The Secret Garden',
            author: 'Frances Hodgson Burnett',
        },

        {
            text: 'Dorothy lived in the midst of the great Kansas prairies, with Uncle Henry, who was a farmer, and Aunt Em, who was the farmer\'s wife. Their house was small, for the lumber to build it had to be carried by wagon many miles.',
            source: 'The Wonderful Wizard of Oz',
            author: 'L. Frank Baum',
        },
    ];

    const paragraphData = paragraphs.map(({ text, source, author }) => ({
        paragraphContent: text,
        source,
        author,
        lengthType: categorizedParagraphByLength(text),
        languageid: englishLanguage.languageid,
    }));

    await prisma.paragraph.createMany({
        data: paragraphData,
        skipDuplicates: true,
    });

    console.log("Seeding lessons...");
    const lessons = [
        {
            title: 'f & j - 2 phím đầu tiên của HOME-ROW',
            orderNumber: 1,
            rowType: RowType.HOME,
            lessonHandType: LessonHandType.BOTH_HANDS,
            lessonType: LessonType.KEY_LESSON,
            languageid: englishLanguage.languageid,
            lessonContent: 'fj fj ff jj ff jj jf jf',
        },
        {
            title: 'Luyện tập phím f & j',
            orderNumber: 2,
            rowType: RowType.HOME,
            lessonHandType: LessonHandType.BOTH_HANDS,
            lessonType: LessonType.PRACTICE,
            languageid: englishLanguage.languageid,
            lessonContent: 'fj fj fjfj jf jf jfjf ffjj ffjj jfjj ffjj fjff jjff jfjf jjff',
        },
        {
            title: 'd & k - 2 phím tiếp theo',
            orderNumber: 3,
            rowType: RowType.HOME,
            lessonHandType: LessonHandType.BOTH_HANDS,
            lessonType: LessonType.KEY_LESSON,
            languageid: englishLanguage.languageid,
            lessonContent: 'dk dk dd kk dd kk kd kd',
        },
        {
            title: 'Luyện tập phím d & k',
            orderNumber: 4,
            rowType: RowType.HOME,
            lessonHandType: LessonHandType.BOTH_HANDS,
            lessonType: LessonType.PRACTICE,
            languageid: englishLanguage.languageid,
            lessonContent: 'dk dk dkdk kd kd kdkd ddkk ddkk kddd ddkk dkdd kkdd kdkd kkdd',
        },
        {
            title: 'luyện tập 4 phím cơ bản f, j, d, k',
            orderNumber: 5,
            rowType: RowType.HOME,
            lessonHandType: LessonHandType.BOTH_HANDS,
            lessonType: LessonType.PRACTICE,
            languageid: englishLanguage.languageid,
            lessonContent: 'ffjj jjff fffj jjjf fjfj ddkk kkdd kdkd kkkd dddk fjdk jfkd fdjk jkdf fkdj jdfk dfjk dkfj kdfj kdjf dkfj',
        },
        {
            title: 's & l - 2 phím tiếp theo',
            orderNumber: 6,
            rowType: RowType.HOME,
            lessonHandType: LessonHandType.BOTH_HANDS,
            lessonType: LessonType.KEY_LESSON,
            languageid: englishLanguage.languageid,
            lessonContent: 'sl sl ss ll ss ll ls ls ll ss llll ssss',
        },
        {
            title: 'Luyện tập phím s & l',
            orderNumber: 7,
            rowType: RowType.HOME,
            lessonHandType: LessonHandType.BOTH_HANDS,
            lessonType: LessonType.PRACTICE,
            languageid: englishLanguage.languageid,
            lessonContent: 'sl sl slsl ls ls lsls ssll ssll lsls ssss llll llsl ssll slls lsls lssl slls',
        },
        {
            title: 'Luyện tập 6 phím cơ bản f, j, d, k, s, l',
            orderNumber: 8,
            rowType: RowType.HOME,
            lessonHandType: LessonHandType.BOTH_HANDS,
            lessonType: LessonType.PRACTICE,
            languageid: englishLanguage.languageid,
            lessonContent: 'fds sdf dfs dsf sfd jkl lkj kjl klj kld jdf klj fds sdk sld kfj lkd jsl kdf jsl kdfj lskj fls jkd lfj',
        },
        {
            title: 'a & ; - 2 phím cuối của HOME-ROW',
            orderNumber: 9,
            rowType: RowType.HOME,
            lessonHandType: LessonHandType.BOTH_HANDS,
            lessonType: LessonType.KEY_LESSON,
            languageid: englishLanguage.languageid,
            lessonContent: 'a; a; aa ;; aa ;; ;a ;a ;a; a;a ;a; a;a ;a; aa;; ;;aa ;a;a',
        },
        {
            title: 'Luyện tập phím a & ;',
            orderNumber: 10,
            rowType: RowType.HOME,
            lessonHandType: LessonHandType.BOTH_HANDS,
            lessonType: LessonType.PRACTICE,
            languageid: englishLanguage.languageid,
            lessonContent: 'a; a; a;a ;a; aa;; ;;aa ;a;a aa;; ;;aa a;a ;a; aa;; ;;aa ;a;a a;a ;a; aa;; ;;aa',
        },
        {
            title: 'Luyện tập 8 phím HOME-ROW',
            orderNumber: 11,
            rowType: RowType.HOME,
            lessonHandType: LessonHandType.BOTH_HANDS,
            lessonType: LessonType.PRACTICE,
            languageid: englishLanguage.languageid,
            lessonContent: 'asdf jkl; asdf jkl; afj; als; jdfk kad; fj; als; jdfk kad; asdf jkl; asdf jkl; afj; als; jdfk kad; asdf jkl; asdf jkl; afj; als; jdfk kad;',
        },
    ]

    const lessonData = lessons.map(({ title, orderNumber, rowType, lessonHandType, lessonType, languageid, lessonContent }) => ({
        title,
        orderNumber,
        rowType,
        lessonHandType,
        lessonType,
        languageid,
        lessonContent,
    }));

    await prisma.lesson.createMany({
        data: lessonData,
        skipDuplicates: true,
    });

    console.log('Seeding completed.');
}

main();