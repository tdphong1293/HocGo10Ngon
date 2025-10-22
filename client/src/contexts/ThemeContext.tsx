'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Các loại theme và font được hỗ trợ
export type Theme = 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'crimson';
export type Font = 'geist' | 'inter' | 'roboto' | 'poppins' | 'openSans' | 'sourceCodePro' | 'comfortaa' | 'patrickHand' | 'spaceMono' | 'paytoneOne' | 'righteous' | 'monoton';

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

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        const savedFont = localStorage.getItem('font') as Font;

        let actualTheme: Theme = 'light';
        if (savedTheme && ['light', 'dark', 'ocean', 'forest', 'sunset', 'lavender', 'crimson'].includes(savedTheme)) {
            actualTheme = savedTheme;
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            actualTheme = prefersDark ? 'dark' : 'light';
        }

        let actualFont: Font = 'geist';
        if (savedFont && ['geist', 'inter', 'roboto', 'poppins', 'openSans', 'sourceCodePro', 'comfortaa', 'patrickHand', 'spaceMono', 'paytoneOne', 'righteous', 'monoton'].includes(savedFont)) {
            actualFont = savedFont;
        }

        document.documentElement.setAttribute('data-theme', actualTheme);
        document.documentElement.setAttribute('data-font', actualFont);

        setTheme(actualTheme);
        setFont(actualFont);

        localStorage.setItem('theme', actualTheme);
        localStorage.setItem('font', actualFont);

        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }, [theme, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            document.documentElement.setAttribute('data-font', font);
            localStorage.setItem('font', font);
        }
    }, [font, isLoaded]);

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