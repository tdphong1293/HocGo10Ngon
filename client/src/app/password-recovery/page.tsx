'use client'

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { sendOTP, verifyOTP, resetPassword } from "@/services/user.services";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const PasswordRecoveryPage = () => {
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [password, setPassword] = useState("");
    const [repassword, setRepassword] = useState("");
    const [isOTPTab, setIsOTPTab] = useState(true);
    const [errors, setErrors] = useState<{ [key: string]: string }>({
        email: "",
        password: "",
        repassword: ""
    });
    const [resendTime, setResendTime] = useState(0);
    const [resetToken, setResetToken] = useState("");
    const router = useRouter();

    useEffect(() => {
        let resendTimeoutRef: NodeJS.Timeout | null = null;
        if (resendTime > 0) {
            resendTimeoutRef = setTimeout(() => {
                setResendTime(resendTime - 1);
            }, 1000);
        }
        return () => {
            if (resendTimeoutRef) {
                clearTimeout(resendTimeoutRef);
            }
        };
    }, [resendTime]);

    const clearAllInputs = () => {
        setEmail("");
        setOtpCode("");
        setPassword("");
        setRepassword("");
    }

    const clearAllErrors = () => {
        setErrors({});
    }

    const validateEmail = () => {
        let isValid = true;
        if (!email) {
            setErrors((prev) => ({ ...prev, email: "Email không được để trống (Cần nhập chung với mã OTP)" }));
            isValid = false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            setErrors((prev) => ({ ...prev, email: "Email không hợp lệ" }));
            isValid = false;
        }
        return isValid;
    }

    const validateOTPForm = () => {
        clearAllErrors();
        let isValid = true;
        if (!otpCode) {
            setErrors((prev) => ({ ...prev, otpCode: "Vui lòng nhập mã OTP để lấy lại mật khẩu" }));
            isValid = false;
        }
        const otpRegex = /^\d+$/;
        if (otpCode && !otpRegex.test(otpCode)) {
            setErrors((prev) => ({ ...prev, otpCode: "Định dạng mã OTP không hợp lệ" }));
            isValid = false;
        }
        if (!validateEmail()) {
            isValid = false;
        }
        return isValid;
    }

    const validatePasswordResetForm = () => {
        clearAllErrors();
        let isValid = true;
        if (!password) {
            setErrors((prev) => ({ ...prev, password: "Mật khẩu không được để trống" }));
            isValid = false;
        }
        const passwordRegex = /^.{6,}$/;
        if (password && !passwordRegex.test(password)) {
            setErrors((prev) => ({ ...prev, password: "Mật khẩu phải có ít nhất 6 ký tự" }));
            isValid = false;
        }
        if (!repassword || password !== repassword) {
            setErrors((prev) => ({ ...prev, repassword: "Mật khẩu nhập lại không khớp" }));
            isValid = false;
        }
        return isValid;
    }

    const handleEmailSend = async () => {
        const isValid = validateEmail();
        if (!isValid) return;

        setErrors((prev) => ({ ...prev, email: "" }));

        const response = await sendOTP(email);
        
        if (response.ok) {
            const { data } = await response.json();
            toast.success(data.message || "Đã gửi mã OTP đến email của bạn!");
            setResendTime(60);
        }
        else if (response.status === 429) {
            const { data } = await response.json();
            const retryAfter = data.retryAfter || 60;
            setResendTime(retryAfter);
            toast.warn(data.message || `Mã OTP đã được gửi trước đó. Vui lòng thử lại sau.`);
        }
        else {
            const data = await response.json();
            toast.error(data.message || "Gửi mã OTP thất bại, vui lòng thử lại sau ít phút.");
        }
    }

    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateOTPForm();
        if (!isValid) return;

        const response = await verifyOTP(email, otpCode);
        if (response.ok) {
            const { data } = await response.json();
            setResetToken(data.reset_token || "");
            setIsOTPTab(false);
        } else {
            const data = await response.json();
            toast.error(data.message || "Xác thực mã OTP thất bại!");
        }
    };

    const handlePasswordResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validatePasswordResetForm();
        if (!isValid) return;

        const response = await resetPassword(resetToken, otpCode, email, password);        
        if (response.ok) {
            const { data } = await response.json();
            toast.success(data.message || "Khôi phục mật khẩu thành công!");
            router.push('/authenticate');
        } else {
            const data = await response.json();
            toast.error(data.message || "Khôi phục mật khẩu thất bại!");
            setIsOTPTab(true);
            clearAllInputs();
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.8,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.8,
        }),
    };

    const formTransition = {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
    };

    return (
        <div className="h-full flex flex-col gap-20 items-center bg-background p-4">
            <div className="relative w-full max-w-lg h-full flex items-center">
                <AnimatePresence mode="wait">
                    {isOTPTab ? (
                        <motion.form
                            key="otpForm"
                            custom={-1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={formTransition}
                            className="absolute inset-0 flex flex-col gap-5 justify-center"
                            onSubmit={handleOTPSubmit}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                                className="flex gap-10 items-center justify-center"
                            >
                                <span className="text-4xl text-foreground">Xác thực OTP</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                                className="flex gap-3"
                            >
                                <Input
                                    label="Email"
                                    name="otp-email"
                                    id="otp-email"
                                    placeholder="Nhập email..."
                                    value={email}
                                    trimPaste={true}
                                    onChange={(val) => setEmail(val)}
                                    error={errors.email}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleEmailSend}
                                    disabled={resendTime > 0}
                                    className="h-fit"
                                >
                                    {resendTime > 0 ? `Gửi lại (${resendTime}s)` : 'Gửi mã OTP'}
                                </Button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Input
                                    label="Mã OTP"
                                    name="otp-code"
                                    id="otp-code"
                                    placeholder="Nhập mã OTP..."
                                    value={otpCode}
                                    trimPaste={true}
                                    onChange={(val) => setOtpCode(val)}
                                    error={errors.otpCode}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Button variant="primary" type="submit" className="font-light w-full">Xác thực</Button>
                            </motion.div>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="passwordResetForm"
                            custom={1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={formTransition}
                            className="absolute inset-0 flex flex-col gap-5 justify-center"
                            onSubmit={handlePasswordResetSubmit}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                                className="flex gap-10 items-center justify-center"
                            >
                                <span className="text-4xl text-foreground">Đặt lại mật khẩu</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Input
                                    label="Mật khẩu mới"
                                    name="passwordReset-password"
                                    id="passwordReset-password"
                                    placeholder="Nhập mật khẩu mới..."
                                    value={password}
                                    type="password"
                                    disablePaste={true}
                                    onChange={(val) => setPassword(val)}
                                    error={errors.password}
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Input
                                    label="Nhập lại mật khẩu mới"
                                    name="passwordReset-repassword"
                                    id="passwordReset-repassword"
                                    placeholder="Nhập lại mật khẩu mới..."
                                    value={repassword}
                                    type="password"
                                    disablePaste={true}
                                    onChange={(val) => setRepassword(val)}
                                    error={errors.repassword}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Button variant="primary" type="submit" className="font-light w-full">Đặt lại mật khẩu</Button>
                            </motion.div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default PasswordRecoveryPage;