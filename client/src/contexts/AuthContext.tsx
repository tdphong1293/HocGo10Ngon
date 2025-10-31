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
    theme?: string;
    font?: string;
    languageCode?: string;
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
    refreshToken: (silentFail?: boolean) => Promise<boolean>;
    signOut: () => Promise<void>;
    signIn: (username: string, password: string) => Promise<boolean>;
    signUp: (username: string, password: string, email: string) => Promise<boolean>;
    requireAuth: () => Promise<boolean>;
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

    const refreshToken = async (silentFail = false) => {
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
                    router.push('/authenticate');
                }
                return false;
            }
        } catch (error) {
            setIsAuthenticated(false);
            setAccessToken(null);
            setUser(null);
            // Only redirect if not silent
            if (!silentFail) {
                router.push('/authenticate');
            }
            return false;
        } finally {
            setLoading(false);
        }
        return false;
    }

    // New method: only redirect when user actually needs auth
    const requireAuth = async (): Promise<boolean> => {
        // If already authenticated, return true
        if (isAuthenticated && accessToken) {
            return true;
        }

        // Try to refresh token
        const refreshSuccess = await refreshToken(false); // Will redirect on failure
        return refreshSuccess;
    }

    const signOut = async () => {
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
            theme: parsed.theme,
            font: parsed.font,
        } as AuthUser;
    }
    catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
}