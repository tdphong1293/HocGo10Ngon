'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import { getLessonById } from '@/services/lesson.services';
import Typing from '@/components/Typing';
import LoadingSpinner from '@/components/LoadingSpinner';


const LessonPage: React.FC<PageProps<"/lessons/[lessonid]">> = ({
    params,
}) => {
    const { lessonid } = use(params);
    const { isAuthenticated, accessToken, user, loading, requireAuth, setAccessToken, signOut } = useAuth();
    const isGuest = !isAuthenticated || !accessToken || !user;
    const [authChecked, setAuthChecked] = useState(false);
    const router = useRouter();

    const [words, setWords] = useState<string[]>([]);
    const [lessonData, setLessonData] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const result = await requireAuth();
            setAuthChecked(result);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        const fetchLessonData = async () => {
            try {
                const response = await getLessonById(accessToken!, lessonid, setAccessToken, () => signOut("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"));
                if (response.ok) {
                    const { data } = await response.json();
                    setLessonData(data);
                    const content = data.lessonContent || "";
                    if (content.length > 0) {
                        setWords(content.trim().split(" ").filter((word: string) => word.trim().length > 0));
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
        };

        if (authChecked && !isGuest) {
            fetchLessonData();
        }
    }, [authChecked, isGuest]);

    if (loading) {
        return (
            <div className="h-full w-full flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!lessonData || !authChecked || isGuest) {
        return null;
    }

    return (
        <div className="p-4 flex flex-col gap-5 w-full h-full">
            <span className="text-3xl font-bold">{`Bài học ${lessonData?.orderNumber}: ${lessonData?.title}`}</span>
            <Typing
                words={words}
                sessionType="LESSON"
                lessonType={lessonData?.lessonType}
                totalWords={words.length}
                endMode={"length"}
                heldKey={lessonData?.heldKey}
                lessonid={lessonid}
                nextLessonId={lessonData?.nextLessonId}
            />
        </div>
    );
}

export default LessonPage;