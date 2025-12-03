'use client';

import { redirect } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const AdminPage = () => {
    const { user, isAuthenticated, accessToken, loading } = useAuth();
    if (!loading) {
        if (!isAuthenticated || !accessToken || !user || user.role !== 'ADMIN') {
            redirect('/');
        } else {
            redirect('/admin/words');
        }
    }
}

export default AdminPage;