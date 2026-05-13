'use client';

import { redirect } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

const AdminPage = () => {
    const { user, isAuthenticated, accessToken, loading, requireAuth } = useAuth();
    const isGuest = !isAuthenticated || !accessToken || !user || user.role !== 'ADMIN';
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const result = await requireAuth(true);
            setAuthChecked(result);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (authChecked && !isGuest) {
            redirect('/admin/words');
        } 
        else {
            notFound();
        }
    }, [authChecked, isGuest]);
}

export default AdminPage;