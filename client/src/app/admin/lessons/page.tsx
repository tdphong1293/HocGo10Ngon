'use client';
import { useState, useEffect, forwardRef } from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { getAllLessons } from '@/services/lesson.services';
import LessonItem from "@/components/LessonItem";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AdminLessonsPage = () => {
    const { isAuthenticated, accessToken, user, loading } = useAuth();
    const router = useRouter();

    const [searchLessonOrder, setSearchLessonOrder] = useState<string>("");
    const [lessons, setLessons] = useState<any[]>([]);

    const fetchLessons = async (accessToken: string) => {
        try {
            const response = await getAllLessons(accessToken);
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
            }
            else {
                fetchLessons(accessToken);
            }
        }
    }, [user, isAuthenticated, accessToken, loading, router]);

    if (!isAuthenticated || !accessToken || !user || user.role !== 'ADMIN') {
        return null;
    }

    const tmpLessons = [
        { lessonid: '1', orderNumber: 1, title: 'Bài học 1' },
        { lessonid: '2', orderNumber: 2, title: 'Bài học 2' },
        { lessonid: '3', orderNumber: 3, title: 'Bài học 3' },
        { lessonid: '4', orderNumber: 4, title: 'Bài học 4' },
        { lessonid: '5', orderNumber: 5, title: 'Bài học 5' },
        { lessonid: '6', orderNumber: 6, title: 'Bài học 6' },
        { lessonid: '7', orderNumber: 7, title: 'Bài học 7' },
        { lessonid: '8', orderNumber: 8, title: 'Bài học 8' },
        { lessonid: '9', orderNumber: 9, title: 'Bài học 9' },
        { lessonid: '10', orderNumber: 10, title: 'Bài học 10' },
        { lessonid: '11', orderNumber: 11, title: 'Bài học 11' },
        { lessonid: '12', orderNumber: 12, title: 'Bài học 12' },
        { lessonid: '13', orderNumber: 13, title: 'Bài học 13' },
        { lessonid: '14', orderNumber: 14, title: 'Bài học 14' },
        { lessonid: '15', orderNumber: 15, title: 'Bài học 15' },
        { lessonid: '16', orderNumber: 16, title: 'Bài học 16' },
        { lessonid: '17', orderNumber: 17, title: 'Bài học 17' },
        { lessonid: '18', orderNumber: 18, title: 'Bài học 18' },
        { lessonid: '19', orderNumber: 19, title: 'Bài học 19' },
        { lessonid: '20', orderNumber: 209, title: 'Bài học 20' },
    ]

    return (
        <div className="h-full p-4 flex flex-col gap-4">
            <span className="text-3xl font-semibold">Danh sách bài học</span>
            <div className="w-full flex justify-end items-center">
                <div className="flex gap-5 w-fit items-center">
                    <Button variant="primary" size="small" className="w-45">Thay đổi thứ tự</Button>
                    <Input
                        label="Tìm kiếm theo thứ tự bài học"
                        placeholder="Nhập thứ tự bài học"
                        value={searchLessonOrder}
                        onChange={(val) => setSearchLessonOrder(val)}
                    />
                </div>
            </div>
            <AnimatePresence>
                <div
                    className="flex gap-x-8 gap-y-4 flex-wrap items-center"
                >
                    {tmpLessons && tmpLessons.length > 0 ? (
                        tmpLessons.map((lesson: any) => (
                            <motion.div
                                key={lesson.id}
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
                        ))
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
            </AnimatePresence>
        </div >
    );
}

export default AdminLessonsPage;