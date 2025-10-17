'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

// Các loại theme và font được hỗ trợ
export type Theme = 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'crimson';
export type Font = 'geist' | 'inter' | 'roboto' | 'poppins' | 'openSans' | 'sourceCodePro';

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
    const previousFontRef = useRef<Font | null>(null);

    useEffect(() => {
        // Load saved preferences from localStorage and current DOM state
        const savedTheme = localStorage.getItem('theme') as Theme;
        const savedFont = localStorage.getItem('font') as Font;

        // Set the theme
        if (savedTheme && ['light', 'dark', 'ocean', 'forest', 'sunset', 'lavender', 'crimson'].includes(savedTheme)) {
            setTheme(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }

        // Set the font - prioritize localStorage, then DOM, then default
        if (savedFont && ['geist', 'inter', 'roboto', 'poppins', 'openSans', 'sourceCodePro'].includes(savedFont)) {
            setFont(savedFont);
        }


        // Set DOM immediately before marking as loaded
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-font', font);
        localStorage.setItem('theme', theme);
        localStorage.setItem('font', font);

        previousFontRef.current = font;
        setIsLoaded(true);
    }, []);
    
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (!isLoaded) return;

        // Check if font actually changed
        if (previousFontRef.current === font) return;

        document.documentElement.setAttribute('data-font', font);
        localStorage.setItem('font', font);

        // Update ref after processing
        previousFontRef.current = font;
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