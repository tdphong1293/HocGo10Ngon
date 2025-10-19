import React from 'react';

interface KeyboardProps {
    activeKeys: string[];
    onKeyPress: (key: string) => void;
}

export const twoCharacterKey = (keys: string[], activeKeys: string[], extraClass: string = "") => {
    const isActive = keys.some(key => activeKeys.includes(key));
    const baseClasses = "flex flex-col gap-1 border-1 border-border justify-center items-center rounded-md px-3 py-1 min-h-14 min-w-14 transition-colors";
    const bgClass = isActive ? "bg-primary text-primary-foreground" : "bg-background text-foreground";

    return (
        <div className={`${baseClasses} ${bgClass} ${extraClass}`.trim()}>
            {keys.map((key, index) => (
                <div key={`2-character-key-${index}`} className="text-sm">
                    {key}
                </div>
            ))}
        </div>
    );
}

export const functionKey = (key: string, activeKeys: string[], extraClass: string = "") => {
    let displayKey = key;
    if (key === 'LShift' || key === 'RShift') {
        displayKey = 'Shift';
    }
    const isActive = activeKeys.some(activeKey => activeKey.toLowerCase() === key.toLowerCase());
    const baseClasses = "flex justify-start items-end border-1 border-border rounded-md px-1 py-1 min-h-14 transition-colors";
    const bgClass = isActive ? "bg-primary text-primary-foreground" : "bg-background text-foreground";

    return (
        <div className={`${baseClasses} ${bgClass} ${extraClass}`.trim()}>
            {displayKey}
        </div>
    );
}

export const letterKey = (key: string, activeKeys: string[], extraClass: string = "") => {
    const isActive = activeKeys.some(activeKey => activeKey.toLowerCase() === key.toLowerCase());
    const baseClasses = "flex justify-center items-center border-1 border-border rounded-md text-4xl px-2 py-1 min-h-14 min-w-14 transition-colors";
    const bgClass = isActive ? "bg-primary text-primary-foreground" : "bg-background text-foreground";

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
    activeKeys,
    onKeyPress
}) => {
    return (
        <div className="keyboard-fixed-font flex flex-col gap-1 w-full max-w-4xl">
            <div className="flex gap-1">
                {twoCharacterKey(['~', '`'], activeKeys)}
                {twoCharacterKey(['!', '1'], activeKeys)}
                {twoCharacterKey(['@', '2'], activeKeys)}
                {twoCharacterKey(['#', '3'], activeKeys)}
                {twoCharacterKey(['$', '4'], activeKeys)}
                {twoCharacterKey(['%', '5'], activeKeys)}
                {twoCharacterKey(['^', '6'], activeKeys)}
                {twoCharacterKey(['&', '7'], activeKeys)}
                {twoCharacterKey(['*', '8'], activeKeys)}
                {twoCharacterKey(['(', '9'], activeKeys)}
                {twoCharacterKey([')', '0'], activeKeys)}
                {twoCharacterKey(['_', '-'], activeKeys)}
                {twoCharacterKey(['+', '='], activeKeys)}
                {functionKey('Backspace', activeKeys, 'min-w-28 w-full')}
            </div>
            <div className="flex gap-1">
                {functionKey('Tab', activeKeys, 'min-w-21 w-full')}
                {TopRowKeys.map((key) => letterKey(key, activeKeys))}
                {twoCharacterKey(['{', '['], activeKeys)}
                {twoCharacterKey(['}', ']'], activeKeys)}
                {twoCharacterKey(['|', '\\'], activeKeys, 'min-w-18 w-full')}
            </div>
            <div className="flex gap-1">
                {functionKey('Caps Lock', activeKeys, 'min-w-24')}
                {HomeRowKeys.map((key) => letterKey(key, activeKeys))}
                {twoCharacterKey([':', ';'], activeKeys)}
                {twoCharacterKey(['"', "'"], activeKeys)}
                {functionKey('Enter', activeKeys, 'min-w-30 w-full')}
            </div>
            <div className="flex gap-1">
                {functionKey('LShift', activeKeys, 'min-w-32')}
                {BottomRowKeys.map((key) => letterKey(key, activeKeys))}
                {twoCharacterKey(['<', ','], activeKeys)}
                {twoCharacterKey(['>', '.'], activeKeys)}
                {twoCharacterKey(['?', '/'], activeKeys)}
                {functionKey('RShift', activeKeys, 'min-w-35 w-full')}
            </div>
            <div className="flex gap-1">
                {functionKey('Tab', activeKeys, 'min-w-16 w-full')}
                {functionKey('Win', activeKeys, 'min-w-16 w-full')}
                {functionKey('Alt', activeKeys, 'min-w-16 w-full')}
                {functionKey('Space', activeKeys, 'min-w-90 w-full')}
                {functionKey('Alt', activeKeys, 'min-w-16 w-full')}
                {functionKey('Win', activeKeys, 'min-w-16 w-full')}
                {functionKey('Menu', activeKeys, 'min-w-16 w-full')}
                {functionKey('Ctrl', activeKeys, 'min-w-16 w-full')}
            </div>
        </div>
    )
}

export default Keyboard;