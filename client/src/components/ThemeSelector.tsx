'use client';

import React, { useState } from 'react';
import { Theme, Font } from '@/contexts/ThemeContext';
import { useTheme } from '@/hooks/useTheme';
import { ThemePreview } from './ThemePreview';
import { updatePreferredFont, updatePreferredTheme } from '@/services/user.services';
import { useAuth } from '@/hooks/useAuth';

const themes: { value: Theme; label: string; description: string }[] = [
    { value: 'light', label: 'Light', description: 'Clean and bright' },
    { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
    { value: 'ocean', label: 'Ocean', description: 'Blue depths' },
    { value: 'forest', label: 'Forest', description: 'Green serenity' },
    { value: 'sunset', label: 'Sunset', description: 'Warm oranges' },
    { value: 'lavender', label: 'Lavender', description: 'Purple elegance' },
    { value: 'crimson', label: 'Crimson', description: 'Bold reds' },
    { value: 'midnight', label: 'Midnight', description: 'Deep blue night' },
    { value: 'sage', label: 'Sage', description: 'Soft green calm' },
    { value: 'solar', label: 'Solar', description: 'Warm daylight' },
    { value: 'peach', label: 'Peach', description: 'Soft warm peach' },
    { value: 'berry', label: 'Berry', description: 'Vibrant berry tones' },
    { value: 'charcoal', label: 'Charcoal', description: 'Dark neutral slate' },
];

const fonts: { value: Font; label: string; description: string; sample: string }[] = [
    { value: 'geist', label: 'Geist', description: 'Modern geometric', sample: 'The quick brown fox' },
    { value: 'inter', label: 'Inter', description: 'Highly readable', sample: 'The quick brown fox' },
    { value: 'roboto', label: 'Roboto', description: 'Friendly and open', sample: 'The quick brown fox' },
    { value: 'poppins', label: 'Poppins', description: 'Rounded and approachable', sample: 'The quick brown fox' },
    { value: 'openSans', label: 'Open Sans', description: 'Humanist sans-serif', sample: 'The quick brown fox' },
    { value: 'sourceCodePro', label: 'Source Code Pro', description: 'Monospace elegance', sample: 'const theme = {}' },
    { value: 'comfortaa', label: 'Comfortaa', description: 'Rounded and friendly', sample: 'The quick brown fox' },
    { value: 'patrickHand', label: 'Patrick Hand', description: 'Handwritten style', sample: 'The quick brown fox' },
    { value: 'spaceMono', label: 'Space Mono', description: 'Futuristic monospace', sample: 'const theme = {}' },
    { value: 'paytoneOne', label: 'Paytone One', description: 'Bold display font', sample: 'The quick brown fox' },
    { value: 'righteous', label: 'Righteous', description: 'Strong and geometric', sample: 'The quick brown fox' },
    { value: 'lato', label: 'Lato', description: 'Neutral and versatile', sample: 'The quick brown fox' },
    { value: 'merriweather', label: 'Merriweather', description: 'Readable serif', sample: 'The quick brown fox' },
    { value: 'nunito', label: 'Nunito', description: 'Rounded friendly sans', sample: 'The quick brown fox' },
    { value: 'ubuntu', label: 'Ubuntu', description: 'Humanist sans-serif', sample: 'The quick brown fox' },
    { value: 'playfairDisplay', label: 'Playfair Display', description: 'Elegant serif display', sample: 'The quick brown fox' },
    { value: 'workSans', label: 'Work Sans', description: 'Clean geometric sans', sample: 'The quick brown fox' },
];

export const ThemeSelector: React.FC = () => {
    const { theme, font, setTheme, setFont } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const { accessToken, isAuthenticated, user, refreshToken } = useAuth();

    const handleThemeChange = async (newTheme: Theme) => {
        if (!isAuthenticated || !user || !accessToken) {
            setTheme(newTheme);
            return;
        }

        const response = await updatePreferredTheme(accessToken, newTheme);
        if (response.ok) {
            refreshToken();
        }
    }

    const handleFontChange = async (newFont: Font) => {
        if (!isAuthenticated || !user || !accessToken) {
            setFont(newFont);
            return;
        }

        const response = await updatePreferredFont(accessToken, newFont);
        if (response.ok) {
            refreshToken();
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
                aria-label="Theme and font settings"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                <span className="hidden sm:inline">Customize</span>
            </button>

            {isOpen && (
                <div className="absolute bottom-full right-0 mt-2 w-96 bg-background border border-border rounded-lg shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h3 className="text-lg font-semibold text-foreground">Appearance Settings</h3>
                        <p className="text-sm text-muted-foreground">Customize your visual experience</p>
                    </div>

                    {/* Theme Selection */}
                    <div className="p-4 border-b border-border">
                        <h4 className="text-sm font-medium text-foreground mb-4">Choose Theme</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {themes.map((themeOption) => (
                                <div key={themeOption.value} className="space-y-2">
                                    <ThemePreview
                                        theme={themeOption.value}
                                        isActive={theme === themeOption.value}
                                        onClick={() => handleThemeChange(themeOption.value)}
                                    />
                                    <div className="text-center">
                                        <div className="text-xs font-medium text-foreground">{themeOption.label}</div>
                                        <div className="text-xs text-muted-foreground">{themeOption.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Font Selection */}
                    <div className="p-4">
                        <h4 className="text-sm font-medium text-foreground mb-4">Choose Font</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {fonts.map((fontOption) => (
                                <button
                                    key={fontOption.value}
                                    onClick={() => handleFontChange(fontOption.value)}
                                    className={`w-full p-3 rounded-lg border text-left transition-all hover:scale-[1.02] ${font === fontOption.value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border hover:border-border-hover hover:bg-accent'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">{fontOption.label}</span>
                                        {font === fontOption.value && (
                                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-2">{fontOption.description}</div>
                                    <div
                                        className="text-sm text-foreground"
                                        style={{
                                            fontFamily: `var(--font-${fontOption.value})`
                                        }}
                                    >
                                        {fontOption.sample}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Current Settings Display */}
                    <div className="p-4 bg-muted/50 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                            Current: <span className="font-medium text-foreground capitalize">{theme}</span> theme, <span className="font-medium text-foreground capitalize">{font}</span> font
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 -z-10"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};