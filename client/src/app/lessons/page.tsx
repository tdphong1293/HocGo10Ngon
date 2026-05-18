'use client';
import { useState, useEffect } from 'react';
import Input from '@/components/Input';
import { getAllLessons, getUserLesson } from '@/services/lesson.services';
import LessonItem from "@/components/LessonItem";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from '@/components/LoadingSpinner';

const LessonsPage = () => {
    const { isAuthenticated, accessToken, user, loading, requireAuth, setAccessToken, signOut } = useAuth();
    const { languageCode } = useTheme();
    const isGuest = !isAuthenticated || !accessToken || !user;
    const [authChecked, setAuthChecked] = useState(false);

    const [searchTitle, setSearchTitle] = useState<string>("");
    const [lessons, setLessons] = useState<any[]>([]);
    const [learnedLessons, setLearnedLessons] = useState<Set<string>>(new Set());

    useEffect(() => {
        const checkAuth = async () => {
            const result = await requireAuth();
            setAuthChecked(result);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (authChecked && !isGuest) {
            const fetchLessons = async (accessToken: string, languageCode?: string, searchTitle?: string) => {
                try {
                    const response = await getAllLessons(accessToken, languageCode, searchTitle, setAccessToken, () => signOut("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"));
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

            const timeoutId = setTimeout(() => {
                fetchLessons(accessToken, languageCode, searchTitle);
            }, 300);

            return () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
        }
    }, [isGuest, authChecked, searchTitle, languageCode]);

    useEffect(() => {
        if (authChecked && !isGuest) {
            const fetchUserLesson = async () => {
                try {
                    const response = await getUserLesson(accessToken, setAccessToken, () => signOut("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"));
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
    }, [authChecked, isGuest, languageCode]);

    if (loading) {
        return (
            <div className="h-full w-full flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!authChecked || isGuest) {
        return null
    }

    return (
        <div className="h-full p-4 flex flex-col gap-4">
            <span className="text-3xl font-semibold">Danh sách bài học</span>
            <div className="w-full flex justify-end items-center">
                <div className="flex gap-5 w-fit items-center">
                    <Input
                        label="Tìm kiếm theo tiêu đề bài học"
                        placeholder="Nhập tiêu đề bài học"
                        value={searchTitle}
                        onChange={(val) => setSearchTitle(val)}
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