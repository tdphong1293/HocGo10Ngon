'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface AuthUser {
    userid: string;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
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
    signIn: (username: string, password: string) => Promise<void>;
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
                const { data, message } = await response.json();
                setAccessToken(data);
                const user = decodeJWT(data);
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
                const { data, message } = await response.json();
                const user = decodeJWT(data);

                setIsAuthenticated(true);
                setAccessToken(data);
                setUser(user);

                window.location.href = '/';
            } else if (response.status === 401) {
                setIsAuthenticated(false);
                setAccessToken(null);
                setUser(null);
                const errorData = await response.json();
                toast.error(errorData.message || "Sai tên đăng nhập hoặc mật khẩu");
            }
        } catch (error: unknown) {
            setIsAuthenticated(false);
            setAccessToken(null);
            setUser(null);
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
            role: parsed.role
        } as AuthUser;
    }
    catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
}