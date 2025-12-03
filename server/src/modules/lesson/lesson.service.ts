import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NewLessonDto } from './dto/newLesson.dto';
import { UpdateLessonDto } from './dto/updateLesson.dto';
import { categorizedParagraphByRowKey } from 'src/utils/categorizedParagraph';

@Injectable()
export class LessonService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async getAllLessons() {
        return await this.prisma.lesson.findMany({
            orderBy: {
                orderNumber: 'asc',
            }
        });
    }

    async getLessonById(lessonid: string) {
        const lesson = await this.prisma.lesson.findUnique({
            where: {
                lessonid
            }
        });

        if (!lesson) {
            throw new NotFoundException('Không tìm thấy mã bài học');
        }

        const nextLessonId = await this.prisma.lesson.findFirst({
            where: {
                orderNumber: {
                    gt: lesson.orderNumber,
                }
            },
            orderBy: {
                orderNumber: 'asc',
            },
            select: {
                lessonid: true,
            }
        });

        return {
            ...lesson,
            ...(nextLessonId ? { nextLessonId: nextLessonId.lessonid } : {})
        }
    }

    async getLessonsByLanguageCode(languageCode: string) {
        return await this.prisma.lesson.findMany({
            where: {
                language: {
                    languageCode
                }
            },
            orderBy: {
                orderNumber: 'asc',
            }
        });
    }

    async getLessonsByLanguageAndTitle(languageCode: string, searchTitle: string) {
        return await this.prisma.lesson.findMany({
            where: {
                language: {
                    languageCode
                },
                title: {
                    contains: searchTitle,
                    mode: "insensitive",
                }
            },
            orderBy: {
                orderNumber: 'asc',
            }
        });
    }

    async getLessonLastOrder() {
        return await this.prisma.lesson.count();
    }

    async updateLessonOrder(lessonid: string, newOrder: number) {
        const lesson = await this.prisma.lesson.findUnique({
            where: {
                lessonid
            }
        });

        if (!lesson) {
            throw new NotFoundException('Không tìm thấy mã bài học');
        }

        const oldOrder = lesson.orderNumber;

        const endLimit = await this.getLessonLastOrder();

        if (newOrder < 1 || newOrder > endLimit) {
            throw new BadRequestException('Số thứ tự bài học không hợp lệ');
        }

        if (lesson.orderNumber === newOrder) {
            return lesson;
        }

        await this.prisma.$transaction(async (prismaTransaction) => {
            if (newOrder > oldOrder) {
                await prismaTransaction.lesson.updateMany({
                    where: {
                        orderNumber: {
                            gt: oldOrder,
                            lte: newOrder,
                        }
                    },
                    data: {
                        orderNumber: {
                            decrement: 1,
                        }
                    }
                });
            }
            else if (newOrder < oldOrder) {
                await prismaTransaction.lesson.updateMany({
                    where: {
                        orderNumber: {
                            lt: oldOrder,
                            gte: newOrder,
                        }
                    },
                    data: {
                        orderNumber: {
                            increment: 1,
                        }
                    }
                });
            }
            else {
                return;
            }

            await prismaTransaction.lesson.update({
                where: {
                    lessonid
                },
                data: {
                    orderNumber: newOrder,
                }
            });
        });
    }

    async addLesson(data: NewLessonDto) {
        const endLimit = await this.getLessonLastOrder();

        if (data.orderNumber < 1 || data.orderNumber > endLimit + 1) {
            throw new BadRequestException('Số thứ tự bài học không hợp lệ');
        }

        return await this.prisma.$transaction(async (prismaTransaction) => {
            if (data.orderNumber <= endLimit) {
                await prismaTransaction.lesson.updateMany({
                    where: {
                        orderNumber: {
                            gte: data.orderNumber,
                        }
                    },
                    data: {
                        orderNumber: {
                            increment: 1,
                        }
                    }
                });
            }

            return await prismaTransaction.lesson.create({
                data: {
                    title: data.title,
                    orderNumber: data.orderNumber,
                    lessonType: data.lessonType,
                    heldKey: data.heldKey,
                    rowType: categorizedParagraphByRowKey(data.lessonContent),
                    lessonContent: data.lessonContent,
                    languageid: data.languageid,
                }
            });
        });
    }

    async updateLesson(lessonid: string, data: UpdateLessonDto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: {
                lessonid
            }
        });

        if (!lesson) {
            throw new NotFoundException('Không tìm thấy mã bài học');
        }

        const dataToUpdate: Record<string, any> = {};
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && key !== 'orderNumber') {
                dataToUpdate[key] = value;
            }
        });

        if (data.orderNumber !== undefined && lesson.orderNumber !== data.orderNumber) {
            return await this.prisma.$transaction(async (prismaTransaction) => {
                await this.updateLessonOrder(lessonid, data.orderNumber!);

                return await prismaTransaction.lesson.update({
                    where: {
                        lessonid
                    },
                    data: dataToUpdate
                });
            });
        }

        return await this.prisma.lesson.update({
            where: {
                lessonid
            },
            data: dataToUpdate
        });
    }

    async getUserLesson(userid: string) {
        const lessons = await this.prisma.userLesson.findMany({
            where: {
                userid
            },
            select: {
                lessonid: true,
            },
            distinct: ['lessonid']
        });

        return lessons.map(lesson => lesson.lessonid);
    }
}