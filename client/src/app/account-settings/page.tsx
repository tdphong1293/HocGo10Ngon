'use client';

import Input from "@/components/Input";
import Button from "@/components/Button";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { changePassword } from "@/services/user.services";

const AccountSettingsPage = () => {
    const { user, isAuthenticated, accessToken, loading } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated || !accessToken || !user) {
            router.push('/authenticate');
            toast.info('Bạn cần đăng nhập để truy cập vào trang cài đặt tài khoản');
        }
    }, [loading, isAuthenticated, accessToken, user]);

    const validateChangePasswordForm = () => {
        clearAllErrors();
        let isValid = true;
        if (!currentPassword) {
            isValid = false;
            setErrors((prev) => ({ ...prev, currentPassword: 'Vui lòng nhập mật khẩu hiện tại' }));
        }
        if (!newPassword) {
            isValid = false;
            setErrors((prev) => ({ ...prev, newPassword: 'Vui lòng nhập mật khẩu mới' }));
        }
        const passwordRegex = /^.{6,}$/;
        if (currentPassword && !passwordRegex.test(currentPassword)) {
            isValid = false;
            setErrors((prev) => ({ ...prev, currentPassword: 'Mật khẩu hiện tại phải có ít nhất 6 ký tự' }));
        }
        if (newPassword && !passwordRegex.test(newPassword)) {
            isValid = false;
            setErrors((prev) => ({ ...prev, newPassword: 'Mật khẩu mới phải có ít nhất 6 ký tự' }));
        }
        if (!confirmPassword || newPassword !== confirmPassword) {
            isValid = false;
            setErrors((prev) => ({ ...prev, confirmPassword: 'Mật khẩu xác nhận không khớp' }));
        }
        return isValid;
    }

    const clearAllInputs = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }

    const clearAllErrors = () => {
        setErrors(null);
    }

    const handleChangePasswordFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const isValid = validateChangePasswordForm();
        if (!isValid) return;

        const response = await changePassword(accessToken!, currentPassword, newPassword);
        if (response.ok) {
            clearAllInputs();
            const { data } = await response.json();
            toast.success(data.message || 'Đổi mật khẩu thành công!');
        } else {
            const data = await response.json();
            toast.error(data.message || 'Đổi mật khẩu không thành công');
        }
    }


    return (
        <div className="p-4 flex flex-col gap-4">
            <span className="text-3xl font-semibold">Cài đặt tài khoản</span>
            <div className="w-full h-1 rounded-lg bg-primary"></div>
            <div className="bg-card text-card-foreground border-3 border-border rounded-lg flex flex-col gap-4 p-4 items-center">
                <span className="text-xl font-semibold">Thay đổi mật khẩu</span>
                <form
                    id="change-password-form"
                    className="w-full flex flex-col gap-4 max-w-lg"
                    onSubmit={handleChangePasswordFormSubmit}
                >
                    <Input
                        id="change-password-current"
                        name="change-password-current"
                        label="Mật khẩu hiện tại"
                        type="password"
                        placeholder="Nhập mật khẩu hiện tại"
                        value={currentPassword}
                        onChange={(val) => setCurrentPassword(val)}
                        error={errors?.currentPassword}
                    />
                    <Input
                        id="change-password-new"
                        name="change-password-new"
                        label="Mật khẩu mới"
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        value={newPassword}
                        onChange={(val) => setNewPassword(val)}
                        error={errors?.newPassword}
                    />
                    <Input
                        id="change-password-confirm"
                        name="change-password-confirm"
                        label="Xác nhận mật khẩu mới"
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChange={(val) => setConfirmPassword(val)}
                        error={errors?.confirmPassword}
                    />
                    <Button
                        type="submit"
                        variant="primary"
                    >
                        <Icon icon="mdi:lock-reset" className="mr-2 text-2xl" />
                        Đổi mật khẩu
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AccountSettingsPage;
