'use client'

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/Input";
import Button from "@/components/Button";

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
            setErrors((prev) => ({ ...prev, email: "Email không được để trống" }));
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
        let isValid = true;
        if (!otpCode) {
            setErrors((prev) => ({ ...prev, otpCode: "Vui lòng nhập mã OTP đã được gửi đến email của bạn" }));
            isValid = false;
        }
        const otpRegex = /^\d{6}$/;
        if (otpCode && !otpRegex.test(otpCode)) {
            setErrors((prev) => ({ ...prev, otpCode: "Mã OTP không hợp lệ" }));
            isValid = false;
        }
        return isValid;
    }

    const validatePasswordResetForm = () => {
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

    const handleEmailSend = () => {
        const isValid = validateEmail();
        if (!isValid) return;
        clearAllErrors();
        console.log('Email:', email);
        setResendTime(60);
    }

    const handleOTPSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOTPTab(false);
        // const isValid = validateOTPForm();
        // if (!isValid) return;
        // clearAllErrors();
        // console.log('OTP:', { otpCode });
    };

    const handlePasswordResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOTPTab(true);
        // const isValid = validatePasswordResetForm();
        // if (!isValid) return;
        // clearAllErrors();
        // console.log('Password Reset:', {
        //     email,
        //     password,
        //     repassword
        // });
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
                                    onChange={(val) => setEmail(val.trim())}
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
                                    onChange={(val) => setOtpCode(val.trim())}
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
                                    onChange={(val) => setPassword(val.trim())}
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
                                    onChange={(val) => setRepassword(val.trim())}
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