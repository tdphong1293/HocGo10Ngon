'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Các loại theme và font được hỗ trợ
export type Theme = 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'crimson' | 'midnight' | 'sage' | 'solar' | 'peach' | 'berry' | 'charcoal';
export type Font = 'geist' | 'inter' | 'roboto' | 'poppins' | 'openSans' | 'sourceCodePro' | 'comfortaa' | 'patrickHand' | 'spaceMono' | 'paytoneOne' | 'righteous' | 'lato' | 'merriweather' | 'nunito' | 'ubuntu' | 'playfairDisplay' | 'workSans' | 'monoton';

interface ThemeContextType {
    theme: Theme;
    font: Font;
    isLoaded: boolean;
    setTheme: (theme: Theme) => void;
    setFont: (font: Font) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Tránh việc sử dụng context bên ngoài provider
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('light');
    const [font, setFont] = useState<Font>('geist');
    const [isLoaded, setIsLoaded] = useState(false);
    const { isAuthenticated, user, accessToken } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user && accessToken) {
            setTheme(user.theme as Theme || 'light');
            setFont(user.font as Font || 'geist');
        }

        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            console.log("Setting theme and font in document element and cookies:", theme, font);
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.setAttribute('data-font', font);
            document.cookie = `theme=${encodeURIComponent(theme)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
            document.cookie = `font=${encodeURIComponent(font)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        }
    }, [theme, font]);

    useEffect(() => {
        if (isLoaded && isAuthenticated && user && accessToken) {
            setTheme(user.theme as Theme);
            setFont(user.font as Font);
            console.log("Updating theme and font from user preferences");
        }
    }, [isAuthenticated, user, accessToken, theme, font]);

    const value = {
        theme,
        font,
        isLoaded,
        setTheme,
        setFont,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};