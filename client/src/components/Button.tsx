import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'destructive' | 'primary-outline' | 'destructive-outline';
    size?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    children,
    className,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-2 border-border hover:border-border-hover';
    const variantClasses = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'bg-secondary/50 text-secondary-foreground hover:bg-secondary',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
        'primary-outline': 'bg-background border-2 border-primary text-foreground hover:text-primary-foreground hover:bg-primary/80',
        'destructive-outline': 'bg-background border-2 border-destructive text-destructive hover:text-destructive-foreground hover:bg-destructive/80',
    }[variant];
    const sizeClasses = {
        small: 'px-2 py-1 text-sm',
        medium: 'px-3 py-1.5 text-md',
        large: 'px-4 py-2.5 text-lg',
    }[size];
    return (
        <button
            className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className || ''}`.trim()}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <LoadingSpinner /> : children}
        </button>
    );
}

export default Button;