'use client';

import { use, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";


const LessonPage: React.FC<PageProps<"/lessons/[lessonid]">> = ({
    params,
}) => {
    const { lessonid } = use(params);
    const { isAuthenticated, accessToken, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || !accessToken || !user) {
                router.push('/');
                toast.info("Vui lòng đăng nhập để truy cập trang này");
                return;
            }
        }
    }, [loading, isAuthenticated, accessToken, user, router]);

    if (!isAuthenticated || !accessToken || !user) {
        return null;
    }

    return (
        <>
        </>
    );
}

export default LessonPage;