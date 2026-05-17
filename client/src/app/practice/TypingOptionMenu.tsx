'use client';

import { Icon } from '@iconify/react';
import { useState, useRef, useEffect } from 'react';
import Switch from '@/components/Switch';
import type { keyboardSizes } from '@/components/Keyboard';
import type { TextSize } from '@/config/typingUi';
import { textSizeOptions, textSizeClass, keyboardSizeOptions } from '@/config/typingUi';
import { AnimatePresence, motion } from 'framer-motion';

const textSizeText = (size: string) => {
    switch (size) {
        case 'normal':
            return 'Bình thường';
        case 'large':
            return 'Lớn';
        case 'very-large':
            return 'Rất lớn';
        default:
            return size;
    }
}

const keyboardSizeText = (size: string) => {
    switch (size) {
        case 'small':
            return 'Nhỏ';
        case 'normal':
            return 'Bình thường';
        case 'large':
            return 'Lớn';
        default:
            return size;
    }
}

interface TypingOptionMenuProps {
    textSize: TextSize;
    keyboardSize: keyboardSizes;
    setTextSize: (size: TextSize) => void;
    setKeyboardSize: (size: keyboardSizes) => void;
    showKeyboard: boolean;
    setShowKeyboard: (value: boolean) => void;
    hintMode: boolean;
    setHintMode: (value: boolean) => void;
    enableSounds: boolean;
    setEnableSounds: (value: boolean) => void;
}

const TypingOptionMenu: React.FC<TypingOptionMenuProps> = ({
    textSize,
    keyboardSize,
    setTextSize,
    setKeyboardSize,
    showKeyboard,
    setShowKeyboard,
    hintMode,
    setHintMode,
    enableSounds,
    setEnableSounds,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: PointerEvent) => {
            const container = containerRef.current;
            const target = event.target as Node | null;
            if (!container || !target) return;

            if (!container.contains(target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('pointerdown', handleClickOutside, true);
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside, true);
        };
    }, []);

    return (
        <div
            className="relative"
            ref={containerRef}
        >
            <div className="cursor-pointer">
                <Icon
                    icon={isOpen ? "fluent:options-28-filled" : "fluent:options-28-regular"}
                    className={`text-card-foreground text-2xl ${isOpen ? '' : ''}`}
                    onClick={() => setIsOpen((prev) => !prev)}
                />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute mt-0.5 right-0
                                bg-card shadow-lg rounded-lg p-4 border-2 border-border
                                flex flex-col gap-5 z-40 w-100
                            "
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <div className="flex justify-between gap-5 items-start">
                            <span className="text-sm">Hiển thị chữ đúng ở dưới nếu gõ sai</span>
                            <Switch
                                state={hintMode}
                                setState={setHintMode}
                            />
                        </div>
                        <div className="flex justify-between gap-5 items-start">
                            <span className="text-sm">Hiển thị bàn phím ảo</span>
                            <Switch
                                state={showKeyboard}
                                setState={setShowKeyboard}
                            />
                        </div>
                        <div className="flex justify-between gap-5 items-start">
                            <span className="text-sm">Âm thanh khi gõ phím</span>
                            <Switch
                                state={enableSounds}
                                setState={setEnableSounds}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm">Cỡ chữ</span>
                            <div className="flex gap-2 justify-between items-center">
                                {textSizeOptions.map((size) => (
                                    <div
                                        key={`text-${size}`}
                                    >
                                        <div
                                            className={`cursor-pointer flex flex-col gap-2 items-center group`}
                                            onClick={() => setTextSize(size)}
                                        >
                                            <div className={`w-25 h-25 flex justify-center items-center border-2 border-border rounded-lg text-accent-foreground ${textSize === size ? 'bg-primary' : 'bg-accent group-hover:bg-primary/50'}`}>
                                                <span className={`${textSizeClass[size]} select-none`}>Aa</span>
                                            </div>
                                            <span className={`${textSize === size ? 'font-bold underline' : 'group-hover:font-bold'}`}>{textSizeText(size)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm">Cỡ bàn phím ảo</span>
                            <div className="flex gap-2 justify-between items-center">
                                {keyboardSizeOptions.map((size) => (
                                    <div
                                        key={`kb-${size}`}
                                    >
                                        <span
                                            className={`cursor-pointer ${keyboardSize === size ? 'font-bold underline' : 'hover:font-bold'}`}
                                            onClick={() => setKeyboardSize(size)}
                                        >
                                            {keyboardSizeText(size)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default TypingOptionMenu;