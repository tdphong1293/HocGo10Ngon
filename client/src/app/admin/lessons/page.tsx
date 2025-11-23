'use client';
import { useState, useEffect } from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { getLessonsByLanguageCode, getLessonsByLanguageAndTitle } from '@/services/lesson.services';
import LessonItem from "@/components/LessonItem";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import SortableLessonItem from '@/components/SortableLessonItem';
import { updateLessonOrder } from '@/services/lesson.services';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import Link from 'next/link';
import { Icon } from '@iconify/react';

const AdminLessonsPage = () => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeId, setActiveId] = useState<string | null>(null);

    const { isAuthenticated, accessToken, user, loading } = useAuth();
    const { languageCode } = useTheme();
    const router = useRouter();

    const [searchLessonTitle, setSearchLessonTitle] = useState<string>("");
    const [lessons, setLessons] = useState<any[]>([]);
    const [isReordering, setIsReordering] = useState<boolean>(false);

    const fetchLessons = async (accessToken: string) => {
        try {
            const response = await getLessonsByLanguageCode(accessToken, languageCode || "en");
            if (response.ok) {
                const { data } = await response.json();
                setLessons(data);
            }
            else {
                toast.error("Đã có lỗi xảy ra khi tải danh sách bài học");
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra khi tải danh sách bài học");
        }
    }

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || !accessToken || !user || user.role !== 'ADMIN') {
                router.push('/');
                return;
            }

            const timeoutId = setTimeout(() => {
                if (searchLessonTitle === "") {
                    fetchLessons(accessToken);
                } else {
                    const fetchLessonsByTitle = async () => {
                        try {
                            const response = await getLessonsByLanguageAndTitle(accessToken, languageCode || "en", searchLessonTitle);
                            if (response.ok) {
                                const { data } = await response.json();
                                setLessons(data);
                            }
                            else {
                                toast.error("Đã có lỗi xảy ra khi tải danh sách bài học");
                            }
                        } catch (error) {
                            toast.error("Đã có lỗi xảy ra khi tải danh sách bài học");
                        }
                    }
                    fetchLessonsByTitle();
                }
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [user, isAuthenticated, accessToken, loading, router, searchLessonTitle, languageCode]);

    if (!isAuthenticated || !accessToken || !user || user.role !== 'ADMIN') {
        return null;
    }

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        const oldIndex = lessons.findIndex(item => item.lessonid === active.id);
        const newIndex = lessons.findIndex(item => item.lessonid === over.id);

        const reordered = arrayMove(lessons, oldIndex, newIndex);
        setLessons(reordered);

        const newOrderNumber = lessons[newIndex].orderNumber;

        try {
            const response = await updateLessonOrder(accessToken, active.id, newOrderNumber);
            if (response.ok) {
                toast.success("Cập nhật thứ tự thành công");
                await fetchLessons(accessToken);
            }
            else {
                const errorData = await response.json();
                toast.error(errorData.message || "Cập nhật thứ tự bài học thất bại");
            }
        } catch (error) {
            toast.error("Cập nhật thứ tự bài học thất bại");
            await fetchLessons(accessToken);
        }
    };

    const activeLesson = activeId ? lessons.find(lesson => lesson.lessonid === activeId) : null;

    return (
        <div className="h-full p-4 flex flex-col gap-4">
            <span className="text-3xl font-semibold">Danh sách bài học</span>
            <div className="w-full flex justify-end items-center">
                <div className="flex gap-5 w-fit items-center">
                    <Button
                        variant="primary"
                        size="small"
                        className="w-fit! h-10"
                    >
                        <Link
                            href="/admin/lessons/new"
                            className="flex gap-1 justify-center items-center"
                        >
                            Thêm bài học mới
                            <Icon icon="ic:round-plus" className="text-2xl" />
                        </Link>
                    </Button>
                    <Button
                        variant={isReordering ? "primary" : "primary-outline"}
                        size="small"
                        className="w-fit! h-10"
                        onClick={() => setIsReordering(!isReordering)}
                    >
                        {isReordering ? "Hoàn tất sắp xếp" : "Sắp xếp lại bài học"}
                    </Button>
                    <Input
                        label="Tìm kiếm theo tiêu đề bài học"
                        placeholder="Nhập tiêu đề bài học"
                        value={searchLessonTitle}
                        onChange={(val) => setSearchLessonTitle(val)}
                        className="w-fit!"
                    />
                </div>
            </div>
            <AnimatePresence>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={(event) => {
                        setActiveId(String(event.active.id));
                    }}
                    onDragEnd={handleDragEnd}
                    onDragCancel={() => setActiveId(null)}
                >
                    <SortableContext
                        items={lessons.map((lesson: any) => lesson.lessonid)}
                        strategy={rectSortingStrategy}
                    >
                        <div
                            className="flex gap-x-8 gap-y-4 flex-wrap items-center"
                        >
                            {lessons && lessons.length > 0 ? (
                                lessons.map((lesson: any) => {
                                    if (isReordering) {
                                        return (
                                            <motion.div
                                                key={`sortable-${lesson.lessonid}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.5, type: "tween" }}
                                            >
                                                <SortableLessonItem
                                                    id={lesson.lessonid}
                                                    lessonOrder={lesson.orderNumber}
                                                    lessonTitle={lesson.title}
                                                />
                                            </motion.div>
                                        );
                                    }
                                    else {
                                        return (
                                            <motion.div
                                                key={`unsortable-${lesson.lessonid}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.5, type: "tween" }}
                                            >
                                                <LessonItem
                                                    id={lesson.lessonid}
                                                    lessonOrder={lesson.orderNumber}
                                                    lessonTitle={lesson.title}
                                                />
                                            </motion.div>
                                        );
                                    }
                                })
                            ) : (
                                <motion.div
                                    key="no-lessons"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center text-muted-foreground mt-10"
                                >
                                    Không có bài học nào
                                </motion.div>
                            )}
                        </div>
                    </SortableContext>
                    <DragOverlay>
                        {activeLesson && (
                            <LessonItem
                                id={activeLesson.lessonid}
                                lessonOrder={activeLesson.orderNumber}
                                lessonTitle={activeLesson.title}
                                disabled={true}
                            />
                        )}
                    </DragOverlay>
                </DndContext>
            </AnimatePresence>
        </div >
    );
}

export default AdminLessonsPage;