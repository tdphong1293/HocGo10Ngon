import { Font } from '@/contexts/ThemeContext';

interface FontPreviewProps {
    font: Font;
    label: string;
    description: string;
    sample: string;
    isActive: boolean;
    onClick: () => void;
}

const FontPreview: React.FC<FontPreviewProps> = ({
    font,
    label,
    description,
    sample,
    isActive,
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className={`w-full p-3 rounded-lg border text-left transition-all hover:scale-102 ${isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-border-hover hover:text-accent-foreground hover:bg-accent'
                }`}
        >
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{label}</span>
                {isActive && (
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <div className="text-sm text-muted-foreground mb-2">{description}</div>
            <div
                data-font={font}
                className="text-md text-foreground"
            >
                {sample}
            </div>
        </div>
    );
}

export default FontPreview;