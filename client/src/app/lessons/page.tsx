'use client';
import { useState, useEffect } from 'react';
import Input from '@/components/Input';
import { getLessonsByLanguageCode, getLessonsByLanguageAndTitle, getUserLesson } from '@/services/lesson.services';
import LessonItem from "@/components/LessonItem";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const LessonsPage = () => {
    const { isAuthenticated, accessToken, user, loading } = useAuth();
    const { languageCode } = useTheme();
    const router = useRouter();

    const [searchLessonTitle, setSearchLessonTitle] = useState<string>("");
    const [lessons, setLessons] = useState<any[]>([]);
    const [learnedLessons, setLearnedLessons] = useState<Set<string>>(new Set());

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
            if (!isAuthenticated || !accessToken || !user) {
                router.push('/');
                toast.info("Vui lòng đăng nhập để truy cập trang này");
                return;
            }

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

            let timeoutId: NodeJS.Timeout | undefined;

            if (searchLessonTitle === "") {
                fetchLessons(accessToken);
            } else {
                timeoutId = setTimeout(() => {
                    fetchLessonsByTitle();
                }, 300);
            }

            return () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
        }
    }, [user, isAuthenticated, accessToken, loading, router, searchLessonTitle, languageCode]);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || !accessToken || !user) {
                router.push('/');
                toast.info("Vui lòng đăng nhập để truy cập trang này");
                return;
            }
            const fetchUserLesson = async () => {
                try {
                    const response = await getUserLesson(accessToken);
                    if (response.ok) {
                        const { data } = await response.json();
                        setLearnedLessons(new Set(data || []));
                    }
                    else {
                        toast.error("Đã có lỗi xảy ra khi tải tiến độ học của bạn");
                    }
                } catch (error) {
                    toast.error("Đã có lỗi xảy ra khi tải tiến độ học của bạn");
                }
            }
            fetchUserLesson();
        }
    }, [user, isAuthenticated, accessToken, loading, router, languageCode]);

    if (!isAuthenticated || !accessToken || !user) {
        return null;
    }

    return (
        <div className="h-full p-4 flex flex-col gap-4">
            <span className="text-3xl font-semibold">Danh sách bài học</span>
            <div className="w-full flex justify-end items-center">
                <div className="flex gap-5 w-fit items-center">
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
                <div
                    className="flex gap-x-8 gap-y-4 flex-wrap items-center"
                >
                    {lessons && lessons.length > 0 ? (
                        lessons.map((lesson: any) => (
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
                                    isLearned={learnedLessons.has(lesson.lessonid)}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            key="no-lessons"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, type: "tween" }}
                            className="text-3xl text-muted-foreground mt-20 w-full flex justify-center items-center"
                        >
                            Hiện chưa có bài học nào
                        </motion.div>
                    )}
                </div>
            </AnimatePresence>
        </div >
    );
}

export default LessonsPage;