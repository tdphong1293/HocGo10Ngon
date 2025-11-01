import type { keyboardSizes } from '@/components/Keyboard';

export type TextSize = 'normal' | 'large' | 'very-large';

export const textSizeOptions: TextSize[] = ['normal', 'large', 'very-large'];

export const textSizeClass: Record<TextSize, string> = {
    normal: 'text-2xl',
    large: 'text-4xl',
    'very-large': 'text-6xl',
};

export const wrongTextClass: Record<TextSize, string> = {
    normal: 'text-lg translate-y-2',
    large: 'text-2xl translate-y-4',
    'very-large': 'text-4xl translate-y-8',
};

export const keyboardSizeOptions: keyboardSizes[] = ['small', 'normal', 'large'];
