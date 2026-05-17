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

export const textKeySizeMap: Record<TextSize, string> = {
    normal: 'w-10 h-10',
    large: 'w-20 h-20',
    'very-large': 'w-28 h-28',
};

export const textKeyGapMap: Record<TextSize, string> = {
    normal: 'gap-1',
    large: 'gap-2',
    'very-large': 'gap-2.5',
}

export const textKeyMoveUpMap: Record<TextSize, string> = {
    normal: '-translate-y-1.5',
    large: '-translate-y-2',
    'very-large': '-translate-y-3',
}

export const keyboardSizeOptions: keyboardSizes[] = ['small', 'normal', 'large'];
