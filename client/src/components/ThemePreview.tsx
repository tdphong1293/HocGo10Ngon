import { Theme } from '@/contexts/ThemeContext';

interface ThemePreviewProps {
    theme: Theme;
    isActive: boolean;
    onClick: () => void;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({
    theme,
    isActive,
    onClick
}) => {
    return (
        <div data-theme={theme} className={`rounded-lg w-30 ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
            <div
                onClick={onClick}
                className={`relative w-full h-15 rounded-lg border-2 border-border flex justify-between cursor-pointer ${isActive ? '' : 'hover:border-ring'}`}
            >
                <div className="w-1/3 h-full bg-primary rounded-l-md"></div>
                <div className="w-1/3 h-full bg-secondary"></div>
                <div className="w-1/3 h-full bg-accent rounded-r-md"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className="text-xs font-medium px-2 py-1 rounded backdrop-blur-sm bg-background text-primary"
                    >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ThemePreview;