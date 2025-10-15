'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

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
        const currentDOMFont = document.documentElement.getAttribute('data-font') as Font;

        // Set the theme
        if (savedTheme && ['light', 'dark', 'ocean', 'forest', 'sunset', 'lavender', 'crimson'].includes(savedTheme)) {
            setTheme(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }

        // Set the font - prioritize localStorage, then DOM, then default
        let fontToSet: Font = 'geist';
        if (savedFont && ['geist', 'inter', 'roboto', 'poppins', 'openSans', 'sourceCodePro'].includes(savedFont)) {
            fontToSet = savedFont;
        } else if (currentDOMFont && ['geist', 'inter', 'roboto', 'poppins', 'openSans', 'sourceCodePro'].includes(currentDOMFont)) {
            fontToSet = currentDOMFont;
        }

        setFont(fontToSet);

        // Set DOM immediately before marking as loaded
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-font', fontToSet);
        localStorage.setItem('theme', theme);
        localStorage.setItem('font', fontToSet);

        previousFontRef.current = fontToSet;
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

        // Apply font to document (only on actual font changes)
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