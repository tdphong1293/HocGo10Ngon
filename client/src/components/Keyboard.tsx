import React, { useMemo } from 'react';

export type keyboardSizes = 'small' | 'normal' | 'large';

interface KeyboardProps {
    activeKeys?: string[];
    size?: keyboardSizes;
}

// Converts real e.code names to your layout naming scheme
const normalizeKeyName = (code: string): string => {
    switch (code) {
        case "ShiftLeft": return "LShift";
        case "ShiftRight": return "RShift";
        case "ControlLeft": return "LCtrl";
        case "ControlRight": return "RCtrl";
        case "AltLeft": return "LAlt";
        case "AltRight": return "RAlt";
        case "MetaLeft": return "LWin";
        case "MetaRight": return "RWin";
        case "CapsLock": return "Caps Lock";
        case "Backspace": return "Backspace";
        case "Tab": return "Tab";
        case "Enter": return "Enter";
        case "Space": return "Space";
        default:
            if (code.startsWith("Backquote")) return "`";
            if (code.startsWith("Key")) return code.slice(3).toUpperCase();
            if (code.startsWith("Digit")) return code.slice(5);
            if (code.startsWith("BracketLeft")) return "[";
            if (code.startsWith("BracketRight")) return "]";
            if (code.startsWith("Backslash")) return "\\";
            if (code.startsWith("Semicolon")) return ";";
            if (code.startsWith("Quote")) return "'";
            if (code.startsWith("Comma")) return ",";
            if (code.startsWith("Period")) return ".";
            if (code.startsWith("Slash")) return "/";
            if (code.startsWith("Minus")) return "-";
            if (code.startsWith("Equal")) return "=";
            return code;
    }
};


// ----- Shared helpers for DRY -----
const sizeStyles = {
    twoChar: {
        small: 'gap-0 px-2 py-0.5 min-h-9 min-w-9 text-xs',
        normal: 'gap-0.5 px-2 py-1 min-h-10 min-w-10 text-xs',
        large: 'gap-1 px-3 py-1 min-h-14 min-w-14 text-sm',
    },
    func: {
        small: 'px-1 py-0.5 min-h-9 text-xs',
        normal: 'px-1 py-1 min-h-10 text-sm',
        large: 'px-1 py-1 min-h-14 text-base',
    },
    letter: {
        small: 'text-lg px-1 py-0.5 min-h-9 min-w-9',
        normal: 'text-xl px-1 py-1 min-h-10 min-w-10',
        large: 'text-4xl px-2 py-1 min-h-14 min-w-14',
    },
} as const;

const baseKeyClasses = 'border-1 border-border rounded-md transition-colors';

const bgForActive = (isActive: boolean) =>
    isActive ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground';

const getNormalizedActiveKeys = (activeKeys: string[], pre?: string[]) => pre ?? activeKeys.map(normalizeKeyName);

export const twoCharacterKey = (
    keys: string[],
    activeKeys: string[],
    size: keyboardSizes = 'large',
    extraClass: string = "",
    normalizedActiveKeys?: string[],
) => {
    const normalized = getNormalizedActiveKeys(activeKeys, normalizedActiveKeys);
    const isActive = keys.some(key => normalized.includes(key));
    const baseClasses = `flex flex-col justify-center items-center ${baseKeyClasses} ${sizeStyles.twoChar[size]}`;
    const bgClass = bgForActive(isActive);

    return (
        <div className={`${baseClasses} ${bgClass} ${extraClass}`.trim()}>
            {keys.map((key, index) => (
                <div key={`2-character-key-${index}`}>
                    {key}
                </div>
            ))}
        </div>
    );
}

export const functionKey = (
    key: string,
    activeKeys: string[],
    size: keyboardSizes = 'large',
    extraClass: string = "",
    normalizedActiveKeys?: string[],
) => {
    let displayKey = key;
    if (key.toLowerCase() === 'lshift' || key.toLowerCase() === 'rshift') {
        displayKey = 'Shift';
    }
    else if (key.toLowerCase() === 'lctrl' || key.toLowerCase() === 'rctrl') {
        displayKey = 'Ctrl';
    }
    else if (key.toLowerCase() === 'lwin' || key.toLowerCase() === 'rwin') {
        displayKey = 'Win';
    }
    else if (key.toLowerCase() === 'lalt' || key.toLowerCase() === 'ralt') {
        displayKey = 'Alt';
    }
    const normalized = getNormalizedActiveKeys(activeKeys, normalizedActiveKeys).map(s => s.toLowerCase());
    const isActive = normalized.includes(key.toLowerCase());
    const baseClasses = `flex justify-start items-end ${baseKeyClasses} ${sizeStyles.func[size]}`;
    const bgClass = bgForActive(isActive);

    return (
        <div className={`${baseClasses} ${bgClass} ${extraClass}`.trim()}>
            {displayKey}
        </div>
    );
}

export const letterKey = (
    key: string,
    activeKeys: string[],
    size: keyboardSizes = 'large',
    extraClass: string = "",
    normalizedActiveKeys?: string[],
) => {
    const normalized = getNormalizedActiveKeys(activeKeys, normalizedActiveKeys).map(s => s.toLowerCase());
    const isActive = normalized.includes(key.toLowerCase());
    const baseClasses = `flex justify-center items-center ${baseKeyClasses} ${sizeStyles.letter[size]}`;
    const bgClass = bgForActive(isActive);

    return (
        <div key={`letter-key-${key}`} className={`${baseClasses} ${bgClass} ${extraClass}`.trim()}>
            {key}
        </div>
    );
}

const TopRowKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const HomeRowKeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const BottomRowKeys = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

const Keyboard: React.FC<KeyboardProps> = ({
    activeKeys = [],
    size = 'normal',
}) => {
    const containerWidthMap: Record<keyboardSizes, string> = {
        small: 'max-w-xl',
        normal: 'max-w-2xl',
        large: 'max-w-4xl',
    };
    const containerWidthClass = containerWidthMap[size];
    const containerGapMap: Record<keyboardSizes, string> = {
        small: 'gap-0',
        normal: 'gap-0.5',
        large: 'gap-1',
    };
    const containerGapClass = containerGapMap[size];

    const normalizedActive = useMemo(() => activeKeys.map(normalizeKeyName), [activeKeys]);

    return (
        <div className={`keyboard-fixed-font flex flex-col ${containerGapClass} ${containerWidthClass} w-full`}>
            <div className={`flex ${containerGapClass}`}>
                {twoCharacterKey(['~', '`'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey(['!', '1'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey(['@', '2'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey(['#', '3'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey(['$', '4'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey(['%', '5'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey(['^', '6'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey(['&', '7'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey(['*', '8'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey(['(', '9'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey([')', '0'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey(['_', '-'], activeKeys, size, 'w-1/16', normalizedActive)}
                {twoCharacterKey(['+', '='], activeKeys, size, 'w-1/16', normalizedActive)}
                {functionKey('Backspace', activeKeys, size, 'w-3/16', normalizedActive)}
            </div>
            <div className={`flex ${containerGapClass}`}>
                {functionKey('Tab', activeKeys, size, 'w-2/17', normalizedActive)}
                {TopRowKeys.map((key) => letterKey(key, activeKeys, size, 'w-1/17', normalizedActive))}
                {twoCharacterKey(['{', '['], activeKeys, size, 'w-1/17', normalizedActive)}
                {twoCharacterKey(['}', ']'], activeKeys, size, 'w-1/17', normalizedActive)}
                {twoCharacterKey(['|', '\\'], activeKeys, size, 'w-3/17', normalizedActive)}
            </div>
            <div className={`flex ${containerGapClass}`}>
                {functionKey('Caps Lock', activeKeys, size, 'w-4/19', normalizedActive)}
                {HomeRowKeys.map((key) => letterKey(key, activeKeys, size, 'w-1/19', normalizedActive))}
                {twoCharacterKey([':', ';'], activeKeys, size, 'w-1/19', normalizedActive)}
                {twoCharacterKey(['"', "'"], activeKeys, size, 'w-1/19', normalizedActive)}
                {functionKey('Enter', activeKeys, size, 'w-6/19', normalizedActive)}
            </div>
            <div className={`flex ${containerGapClass}`}>
                {functionKey('LShift', activeKeys, size, 'w-3/19', normalizedActive)}
                {BottomRowKeys.map((key) => letterKey(key, activeKeys, size, 'w-1/19', normalizedActive))}
                {twoCharacterKey(['<', ','], activeKeys, size, 'w-1/19', normalizedActive)}
                {twoCharacterKey(['>', '.'], activeKeys, size, 'w-1/19', normalizedActive)}
                {twoCharacterKey(['?', '/'], activeKeys, size, 'w-1/19', normalizedActive)}
                {functionKey('RShift', activeKeys, size, 'w-5/19', normalizedActive)}
            </div>
            <div className={`flex ${containerGapClass}`}>
                {functionKey('LCtrl', activeKeys, size, 'w-1/11', normalizedActive)}
                {functionKey('LWin', activeKeys, size, 'w-1/11', normalizedActive)}
                {functionKey('LAlt', activeKeys, size, 'w-1/11', normalizedActive)}
                {functionKey('Space', activeKeys, size, 'w-5/12', normalizedActive)}
                {functionKey('RAlt', activeKeys, size, 'w-1/11', normalizedActive)}
                {functionKey('RWin', activeKeys, size, 'w-1/11', normalizedActive)}
                {functionKey('Menu', activeKeys, size, 'w-1/11', normalizedActive)}
                {functionKey('RCtrl', activeKeys, size, 'w-1/11', normalizedActive)}
            </div>
        </div>
    )
}

export default Keyboard;