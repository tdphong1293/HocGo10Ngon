'use client'

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/Input";
import LogoV3 from "@/components/LogoV3";
import Button from "@/components/Button";
import Link from "next/dist/client/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AuthenticatePage = () => {
    const [signinUsername, setSigninUsername] = useState("");
    const [signinPassword, setSigninPassword] = useState("");
    const [email, setEmail] = useState("");
    const [signupUsername, setSignupUsername] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [repassword, setRepassword] = useState("");
    const [isSigninTab, setIsSigninTab] = useState(true);
    const [errors, setErrors] = useState<{ [key: string]: string }>({
        signinUsername: "",
        signinPassword: "",
        email: "",
        signupUsername: "",
        signupPassword: "",
        repassword: ""
    });

    const { isAuthenticated, accessToken, user, signIn, signUp, signOut } = useAuth();
    const [signedInPerformed, setSignedInPerformed] = useState(false);
    const router = useRouter();

    const clearAllInputs = () => {
        setSigninUsername("");
        setSigninPassword("");
        setEmail("");
        setSignupUsername("");
        setSignupPassword("");
        setRepassword("");
    }

    const clearAllErrors = () => {
        setErrors({});
    }

    const validateSigninForm = () => {
        let isValid = true;
        if (!signinUsername) {
            setErrors((prev) => ({ ...prev, signinUsername: "Tên đăng nhập không được để trống" }));
            isValid = false;
        }
        if (!signinPassword) {
            setErrors((prev) => ({ ...prev, signinPassword: "Mật khẩu không được để trống" }));
            isValid = false;
        }
        const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;
        if (signinUsername && !usernameRegex.test(signinUsername)) {
            setErrors((prev) => ({ ...prev, signinUsername: "Tên đăng nhập không hợp lệ (5-20 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới)" }));
            isValid = false;
        }
        const passwordRegex = /^.{6,}$/;
        if (signinPassword && !passwordRegex.test(signinPassword)) {
            setErrors((prev) => ({ ...prev, signinPassword: "Mật khẩu phải có ít nhất 6 ký tự" }));
            isValid = false;
        }
        return isValid;
    }

    const validateSignupForm = () => {
        let isValid = true;
        if (!signupUsername) {
            setErrors((prev) => ({ ...prev, signupUsername: "Tên đăng nhập không được để trống" }));
            isValid = false;
        }
        if (!signupPassword) {
            setErrors((prev) => ({ ...prev, signupPassword: "Mật khẩu không được để trống" }));
            isValid = false;
        }
        if (!email) {
            setErrors((prev) => ({ ...prev, email: "Email không được để trống" }));
            isValid = false;
        }
        const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;
        if (signupUsername && !usernameRegex.test(signupUsername)) {
            setErrors((prev) => ({ ...prev, signupUsername: "Tên đăng nhập không hợp lệ (5-20 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới)" }));
            isValid = false;
        }
        const passwordRegex = /^.{6,}$/;
        if (signupPassword && !passwordRegex.test(signupPassword)) {
            setErrors((prev) => ({ ...prev, signupPassword: "Mật khẩu phải có ít nhất 6 ký tự" }));
            isValid = false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            setErrors((prev) => ({ ...prev, email: "Email không hợp lệ" }));
            isValid = false;
        }
        if (!repassword || signupPassword !== repassword) {
            setErrors((prev) => ({ ...prev, repassword: "Mật khẩu nhập lại không khớp" }));
            isValid = false;
        }
        return isValid;
    }

    const handleSigninSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validateSigninForm();
        if (!isValid) return;
        clearAllErrors();
        if (isAuthenticated && user && accessToken) {
            await signOut();
        }
        const signInSuccess = await signIn(signinUsername, signinPassword);
        if (signInSuccess) {
            // Chặn thông báo đã đăng nhập
            setSignedInPerformed(false);
        }
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validateSignupForm();
        if (!isValid) return;
        clearAllErrors();
        const signUpSuccess = await signUp(signupUsername, signupPassword, email);
        if (signUpSuccess) {
            clearAllInputs();
            setIsSigninTab(true);
        }
    };

    useEffect(() => {
        if (isAuthenticated && accessToken && user) {
            setSignedInPerformed(true);
        }
    }, [isAuthenticated, accessToken, user]);

    useEffect(() => {
        if (signedInPerformed) {
            router.push('/');
            toast.success("Bạn đã đăng nhập rồi mà!");
        }
    }, [signedInPerformed]);

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
            x: direction > 0 ? -300 : 300,
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
                    {isSigninTab ? (
                        <motion.form
                            key="signinForm"
                            custom={1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={formTransition}
                            className="absolute inset-0 flex flex-col gap-5 justify-center"
                            onSubmit={handleSigninSubmit}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                                className="flex gap-10 items-center justify-center"
                            >
                                <LogoV3 width={150} height={150} className="-my-6" textColor="var(--foreground)" bgColor="var(--background)" />
                                <span className="text-4xl text-foreground">Đăng nhập</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Input
                                    label="Tên đăng nhập"
                                    name="signin-username"
                                    id="signin-username"
                                    placeholder="Nhập tên đăng nhập..."
                                    value={signinUsername}
                                    trimPaste={true}
                                    onChange={(val) => setSigninUsername(val)}
                                    error={errors.signinUsername}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Input
                                    label="Mật khẩu"
                                    name="signin-password"
                                    id="signin-password"
                                    placeholder="Nhập mật khẩu..."
                                    type="password"
                                    value={signinPassword}
                                    disablePaste={true}
                                    onChange={(val) => setSigninPassword(val)}
                                    error={errors.signinPassword}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <div className="flex justify-end">
                                    <Link
                                        href="/password-recovery"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Button variant="primary" type="submit" className="font-light w-full">Đăng nhập</Button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                                className="flex justify-center gap-5 text-sm text-muted-foreground"
                            >
                                Chưa có tài khoản?
                                <div
                                    onClick={() => { setIsSigninTab(false); clearAllInputs(); clearAllErrors(); }}
                                    className="text-primary hover:underline cursor-pointer"
                                >
                                    Đăng ký ngay
                                </div>
                            </motion.div>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="signupForm"
                            custom={-1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={formTransition}
                            className="absolute inset-0 flex flex-col gap-5 justify-center"
                            onSubmit={handleSignupSubmit}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                                className="flex gap-10 items-center justify-center"
                            >
                                <span className="text-4xl text-foreground">Đăng ký tài khoản</span>
                                <LogoV3 width={150} height={150} className="-my-6" textColor="var(--foreground)" bgColor="var(--background)" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Input
                                    label="Tên đăng nhập"
                                    name="signup-username"
                                    id="signup-username"
                                    placeholder="Nhập tên đăng nhập..."
                                    value={signupUsername}
                                    trimPaste={true}
                                    onChange={(val) => setSignupUsername(val)}
                                    error={errors.signupUsername}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Input
                                    label="Email"
                                    name="signup-email"
                                    id="signup-email"
                                    placeholder="Nhập email..."
                                    value={email}
                                    trimPaste={true}
                                    onChange={(val) => setEmail(val)}
                                    error={errors.email}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Input
                                    label="Mật khẩu"
                                    name="signup-password"
                                    id="signup-password"
                                    placeholder="Nhập mật khẩu..."
                                    type="password"
                                    value={signupPassword}
                                    disablePaste={true}
                                    onChange={(val) => setSignupPassword(val)}
                                    error={errors.signupPassword}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Input
                                    label="Nhập lại mật khẩu"
                                    name="signup-repassword"
                                    id="signup-repassword"
                                    placeholder="Nhập lại mật khẩu..."
                                    type="password"
                                    value={repassword}
                                    disablePaste={true}
                                    onChange={(val) => setRepassword(val)}
                                    error={errors.repassword}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                            >
                                <Button variant="primary" type="submit" className="font-light w-full">Đăng ký</Button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.6, type: "spring", damping: 25, stiffness: 500 }}
                                className="flex justify-center gap-5 text-sm text-muted-foreground"
                            >
                                Đã có tài khoản?
                                <div
                                    onClick={() => { setIsSigninTab(true); clearAllInputs(); clearAllErrors(); }}
                                    className="text-primary hover:underline cursor-pointer"
                                >
                                    Đăng nhập ngay
                                </div>
                            </motion.div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default AuthenticatePage;