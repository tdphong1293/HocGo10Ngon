'use client';

import React from 'react';
import { useTheme, Theme } from '@/contexts/ThemeContext';

interface ThemePreviewProps {
    theme: Theme;
    isActive: boolean;
    onClick: () => void;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, isActive, onClick }) => {
    return (
        <div className={`relative ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
            <div data-theme={theme}>
                <button
                    onClick={onClick}
                    className="relative w-full h-16 rounded-lg border-2 transition-all overflow-hidden bg-background border-border"
                >
                    <div className="absolute inset-0 flex">
                        <div className="w-1/3 h-full bg-primary"></div>
                        <div className="w-1/3 h-full bg-secondary"></div>
                        <div className="w-1/3 h-full bg-accent"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span
                            className="text-xs font-medium px-2 py-1 rounded backdrop-blur-sm"
                            style={{
                                backgroundColor: 'var(--background)',
                                color: 'var(--primary)',
                                opacity: 0.9
                            }}
                        >
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
};