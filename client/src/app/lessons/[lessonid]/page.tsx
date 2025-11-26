'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import { getLessonById } from '@/services/lesson.services';
import TypingPractice from '@/components/TypingPractice';


const LessonPage: React.FC<PageProps<"/lessons/[lessonid]">> = ({
    params,
}) => {
    const { lessonid } = use(params);
    const { isAuthenticated, accessToken, user, loading } = useAuth();
    const router = useRouter();

    const [words, setWords] = useState<string[]>([]);
    const [lessonData, setLessonData] = useState<any>(null);

    const fetchLessonData = async () => {
        try {
            const response = await getLessonById(accessToken!, lessonid);
            if (response.ok) {
                const { data } = await response.json();
                setLessonData(data);
                const content = data.lessonContent || "";
                if (content.length > 0) {
                    setWords(content.trim().split(/\s+/).filter((word: string) => word.trim().length > 0));
                }
            }
            else if (response.status === 404) {
                toast.error("Không tìm thấy bài học.");
                router.push("/lessons");
            }
            else {
                toast.error("Đã có lỗi xảy ra khi tải bài học.");
            }
        } catch (err) {
            toast.error("Đã có lỗi xảy ra khi tải bài học.");
        }
    }

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || !accessToken || !user) {
                router.push('/');
                toast.info("Vui lòng đăng nhập để truy cập trang này");
                return;
            }
            else {
                fetchLessonData();
            }
        }
    }, [loading, isAuthenticated, accessToken, user, router]);

    if (!isAuthenticated || !accessToken || !user) {
        return null;
    }

    return (
        <div className="p-4 flex flex-col gap-5 w-full h-full">
            <span className="text-3xl font-bold">{`Bài học ${lessonData?.orderNumber}: ${lessonData?.title}`}</span>
            <TypingPractice
                words={words}
                sessionType="LESSON"
                totalWords={words.length}
                endMode={"length"}
                nextLessonId={"abc"}
            />
        </div>
    );
}

export default LessonPage;