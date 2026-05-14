'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Role } from '../config/menuConfig';

interface AuthUser {
    userid: string;
    username: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    loading: boolean;
    setLoading: (value: boolean) => void;
    refreshToken: (silentFail?: boolean, redirectTo?: string, showToast?: boolean) => Promise<boolean>;
    signOut: (text?: string) => Promise<void>;
    signIn: (username: string, password: string) => Promise<boolean>;
    signUp: (username: string, password: string, email: string) => Promise<boolean>;
    requireAuth: (adminOnly?: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    const refreshToken = async (silentFail = false, redirectTo = "/authenticate", showToast = true) => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include' // Gửi kèm cookie
            });

            if (response.ok) {
                setIsAuthenticated(true);
                const { data: { access_token } } = await response.json();
                setAccessToken(access_token);
                const user = decodeJWT(access_token);
                setUser(user);
                return true;
            } else if (response.status === 401) {
                setIsAuthenticated(false);
                setAccessToken(null);
                setUser(null);
                // Only redirect if not silent
                if (!silentFail) {
                    router.push(redirectTo);
                    if (showToast) {
                        toast.info("Vui lòng đăng nhập để truy cập", {
                            toastId: 'page-auth-required',
                        });
                    }
                }
                return false;
            }
        } catch (error) {
            setIsAuthenticated(false);
            setAccessToken(null);
            setUser(null);
            // Only redirect if not silent
            if (!silentFail) {
                router.push(redirectTo);
                if (showToast) {
                    toast.info("Vui lòng đăng nhập để truy cập", {
                        toastId: 'page-auth-required',
                    });
                }
            }
            return false;
        } finally {
            setLoading(false);
        }
        return false;
    }

    // Sử dụng cho trang cần xác thực 
    const requireAuth = async (adminOnly: boolean = false): Promise<boolean> => {
        // Nếu đã xác thực và có token, user thì trả về true
        if (isAuthenticated && accessToken && user) {
            // Nếu trang chỉ dành cho admin mà user không phải admin thì trả về false
            if (adminOnly && user.role !== 'ADMIN') {
                return false;
            }
            return true;
        }

        // Nếu chưa xác thực, thử lấy lại access token mới dựa trên refresh token lưu trong cookies

        // Trường hợp refresh token không hợp lệ hoặc đã hết hạn
        // user sẽ được chuyển hướng đến trang đăng nhập tạo refresh token mới

        // Trường hợp lấy được access token mới thành công
        // user sẽ được cập nhật và trả về true
        if (adminOnly) {
            // Nếu trang chỉ dành cho admin thì sẽ redirect về trang chủ và không hiển thị toast
            return await refreshToken(false, "/", false);
        } else {
            // Còn lại sẽ redirect về trang đăng nhập và hiển thị toast
            return await refreshToken();
        }
    }

    const signOut = async (text: string = "Đăng xuất thành công!") => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/signout', {
                method: 'POST',
                credentials: 'include' // Gửi kèm cookie
            });
            if (response.ok) {
                setIsAuthenticated(false);
                setAccessToken(null);
                setUser(null);
                router.refresh();
                if (!text || text.trim() === "" || text === "Đăng xuất thành công!") {
                    toast.success(text);
                } else {
                    toast.info(text);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi đăng xuất, vui lòng thử lại sau ít phút';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const signIn = async (username: string, password: string) => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include', // Gửi kèm cookie
            });
            if (response.ok) {
                const { data: { access_token, message } } = await response.json();
                const decoded_user = decodeJWT(access_token);

                setIsAuthenticated(true);
                setAccessToken(access_token);
                setUser(decoded_user);

                toast.success(message || "Đăng nhập thành công!");
                router.push('/');
                return true;
            } else if (response.status === 401) {
                setIsAuthenticated(false);
                setAccessToken(null);
                setUser(null);
                const errorData = await response.json();
                toast.error(errorData.message || "Sai tên đăng nhập hoặc mật khẩu");
                return false;
            } else {
                return false;
            }
        } catch (error: unknown) {
            setIsAuthenticated(false);
            setAccessToken(null);
            setUser(null);
            const errorMessage = error instanceof Error ? error.message : 'Lỗi dăng nhập, vui lòng thử lại sau ít phút';
            toast.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }

    const signUp = async (username: string, password: string, email: string) => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password, email }),
            });

            if (response.ok) {
                toast.success("Đăng ký tài khoản thành công!");
                return true;
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Lỗi đăng ký tài khoản, vui lòng thử lại sau ít phút");
                return false;
            }
        }
        catch (error: unknown) {
            setIsAuthenticated(false);
            setAccessToken(null);
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refreshToken(true); // Silent refresh on mount, no redirect
    }, []);



    const value = {
        isAuthenticated,
        setIsAuthenticated,
        accessToken,
        setAccessToken,
        user,
        setUser,
        loading,
        setLoading,
        refreshToken,
        signOut,
        signIn,
        signUp,
        requireAuth,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
};

const decodeJWT = (token: string): AuthUser | null => {
    try {
        if (!token || typeof token !== 'string') {
            return null;
        }

        const payload = token.split('.')[1];
        const decodedPayload = atob(payload);
        const parsed = JSON.parse(decodedPayload);

        return {
            userid: parsed.sub,
            username: parsed.username,
            email: parsed.email,
            role: parsed.role,
        } as AuthUser;
    }
    catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
}