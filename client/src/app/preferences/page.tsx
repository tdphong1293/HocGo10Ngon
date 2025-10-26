'use client';

import { Theme, Font } from '@/contexts/ThemeContext';
import { useTheme } from '@/hooks/useTheme';
import ThemePreview from '@/components/ThemePreview';
import FontPreview from '@/components/FontPreview';
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

const PreferencesPage = () => {
    const { theme, font, setTheme, setFont } = useTheme();
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
        <div className="p-4 flex flex-col gap-4">
            <span className="text-3xl font-semibold">Tùy chỉnh giao diện</span>
            <div className="w-full h-1 rounded-lg bg-primary"></div>
            <div className="bg-card text-card-foreground border-3 border-border rounded-lg flex flex-col gap-4 p-4 items-center">
                <span className="text-xl font-semibold">Màu chủ đề (Theme)</span>
                <div className="flex gap-4 flex-wrap justify-center">
                    {themes.map((themeOption) => (
                        <div key={themeOption.value} className="flex flex-col gap-2">
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
            <div className="w-full h-1 rounded-lg bg-primary"></div>
            <div className="bg-card text-card-foreground border-3 border-border rounded-lg flex flex-col gap-4 p-4 items-center">
                <span className="text-xl font-semibold">Kiểu chữ (Font)</span>
                <div className="flex gap-4 flex-wrap justify-center">
                    {fonts.map((fontOption) => (
                        <div key={fontOption.value}>
                            <FontPreview
                                font={fontOption.value}
                                label={fontOption.label}
                                description={fontOption.description}
                                sample={fontOption.sample}
                                isActive={font === fontOption.value}
                                onClick={() => handleFontChange(fontOption.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PreferencesPage;
