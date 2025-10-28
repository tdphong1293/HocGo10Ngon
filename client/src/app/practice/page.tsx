'use client';

import { JSX, useState, useRef, useEffect } from "react";
import Keyboard from "@/components/Keyboard";
import type { keyboardSizes } from "@/components/Keyboard";
import { Icon } from "@iconify/react";

const sampleText = `The quick brown fox jumps over the lazy dog.\n\tThis is a sample typing test to demonstrate the theme colors.\nThis is a long test paragraph to check how the typing practice application handles larger blocks of text. It includes multiple lines, punctuation, and various characters to ensure comprehensive testing. Happy typing!. An even longer sentence to test the scrolling functionality of the typing area. Let's add more text to make sure we have enough content to scroll through while typing. This should be sufficient for testing purposes. Enjoy your typing practice! longer sentence to test the scrolling functionality of the typing area. Let's add more text to make sure we have enough content to scroll through while typing. This should be sufficient for testing purposes. Enjoy your typing practice! longer sentence to test the  scrolling functionality of the typing area. Let's add more text to make sure we have enough content to scroll through while typing. This should be sufficient for testing purposes. Enjoy your typing practice! longer sentence to test the scrolling functionality of the typing area. Let's add more text to make sure we have enough content to scroll through while typing. This should be sufficient for testing purposes. Enjoy your typing practice! longer sentence to test the scrolling functionality of the typing area. Let's add more text to make sure we have enough content to scroll through while typing. This should be sufficient for testing purposes. Enjoy your typing practice! longer sentence to test the scrolling functionality of the typing area. Let's add more text to make sure we have enough content to scroll through while typing. This should be sufficient for testing purposes. Enjoy your typing practice!`;

// const sampleText = "Short sample text for. \n Another line here.\tAnd a tab.";

type textSizes = 'small' | 'normal' | 'large' | 'very-large';

const textSizeClass: { [key: string]: string } = {
    'small': 'text-lg',
    'normal': 'text-2xl',
    'large': 'text-4xl',
    'very-large': 'text-6xl',
}

const wrongTextClass: { [key: string]: string } = {
    'small': 'text-sm translate-y-1.5',
    'normal': 'text-lg translate-y-2',
    'large': 'text-2xl translate-y-4',
    'very-large': 'text-4xl translate-y-8',
}

const PracticePage = ({
    text = sampleText
}) => {
    const [userInput, setUserInput] = useState('');
    const [showKeyboard, setShowKeyboard] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [keyboardSize, setKeyboardSize] = useState<keyboardSizes>('small');
    const [textSize, setTextSize] = useState<textSizes>('small');
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const inputRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const handleBlur = () => {
            setActiveKeys([]);
        };
        window.addEventListener('blur', handleBlur);
        return () => window.removeEventListener('blur', handleBlur);
    }, []);

    const toggleShowKeyboard = () => {
        setShowKeyboard(!showKeyboard);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const keyCode = e.code;
        setActiveKeys((prev) => {
            if (!prev.includes(keyCode)) return [...prev, keyCode];
            return prev;
        });

        const key = e.key;
        // Trước e.preventDefault để cho phép các phím đặc biệt hoạt động bình thường
        if (e.metaKey ||  e.ctrlKey || key === "F12" || key === "F5" || key === "Escape") {
            return;
        }

        e.preventDefault();

        // Sau e.preventDefault để bỏ qua các phím mũi tên
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
            return;
        }

        if (key === "Backspace") {
            if (userInput.length > 0) {
                const newValue = userInput.slice(0, -1);
                setUserInput(newValue);
                setCurrentIndex(newValue.length);
            }
        }
        else if (key === "Enter") {
            const newValue = userInput + "\n";
            setUserInput(newValue);
            setCurrentIndex(newValue.length);
        }
        else if (key === "Tab") {
            const newValue = userInput + "\t";
            setUserInput(newValue);
            setCurrentIndex(newValue.length);
        }
        else if (key.length === 1) {
            const newValue = userInput + key;
            setUserInput(newValue);
            setCurrentIndex(newValue.length);
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const keyCode = e.code;
        setActiveKeys((prev) => prev.filter((k) => k !== keyCode));
    };

    const renderCharacter = (char: string, index: number) => {
        let className = '';
        let displayChar: string | JSX.Element = char;
        let wrongChar: string | JSX.Element | null = null;

        if (char === ' ') {
            displayChar = <span>&nbsp;</span>;
        } else if (char === '\n') {
            displayChar = <Icon icon="fluent:arrow-enter-left-24-regular" className="inline-block align-middle relative top-[-2px]" />;
        } else if (char === '\t') {
            displayChar = <Icon icon="fluent:keyboard-tab-24-regular" className="inline-block align-middle relative top-[-1px]" />;
        }

        if (index < userInput.length) {
            if (userInput[index] === char) {
                className = 'text-correct';
            }
            else {
                className = 'text-incorrect relative';
                wrongChar = userInput[index];
                if (wrongChar === '\n') {
                    wrongChar = <Icon icon="fluent:arrow-enter-left-24-regular" className="inline-block align-middle relative top-[-2px]" />;
                } else if (wrongChar === '\t') {
                    wrongChar = <Icon icon="fluent:keyboard-tab-24-regular" className="inline-block align-middle relative top-[-1px]" />;
                }

                return (
                    <span key={index} className={`${className} transition-colors duration-150`}>
                        {displayChar}

                        <span className={`absolute left-1/2 -translate-x-1/2 top-1/2 text-accent-foreground/50 ${wrongTextClass[textSize]}`}>
                            {wrongChar}
                        </span>
                    </span>
                )
            }
        } else if (index === currentIndex) {
            className = 'typing-cursor';
            return (
                <span
                    key={index}
                    ref={cursorRef}
                    className={`${className} transition-colors duration-150`}
                >
                    {displayChar}
                </span>
            );
        } else {
            className = 'text-untyped';
        }

        return (
            <span key={index} className={`${className} transition-colors duration-150`}>
                {displayChar}
            </span>
        );
    };

    const renderText = () => {
        const lines = text.split(/(?<=\n)/);
        let globalIndex = 0;

        return (
            <div className={`flex flex-col gap-0 ${textSizeClass[textSize]}`}>
                {lines.map((line, lineIndex) => (
                    <div key={lineIndex} className={`w-full leading-loose`}>
                        {line.split(' ').map((word, wordIndex) => {
                            let lastChar = '';
                            const wordEls = word.split('').map((char, i) => {
                                const el = renderCharacter(char, globalIndex);
                                if (i === word.length - 1) {
                                    lastChar = char;
                                }
                                globalIndex++;
                                return el;
                            });

                            // add a space element at the end
                            let spaceEl = null;
                            if (lastChar !== '\n' && lastChar !== '\t' && lastChar !== ' ') {
                                spaceEl = renderCharacter(' ', globalIndex);
                                globalIndex++;
                            }
                            return (
                                <span key={wordIndex} className="inline-block">
                                    {wordEls}
                                    {spaceEl}
                                </span>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const getTypingAreaHeight = (keyboardSize: keyboardSizes, textSize: textSizes) => {
        const extraHeight = 10;

        const textHeightMap: Record<textSizes, number> = {
            small: 50,
            normal: 45,
            large: 40,
            "very-large": 35,
        };

        const keyboardAdjustMap: Record<keyboardSizes, number> = {
            small: 0,
            normal: 5,
            large: 10,
        };

        return textHeightMap[textSize] - (showKeyboard ? keyboardAdjustMap[keyboardSize] : -extraHeight)
    };

    useEffect(() => {
        if (cursorRef.current && scrollRef.current) {
            const cursor = cursorRef.current;
            const container = scrollRef.current;

            const cursorTop = cursor.offsetTop;
            const cursorBottom = cursorTop + cursor.offsetHeight;
            const viewTop = container.scrollTop;
            const viewBottom = viewTop + container.clientHeight;

            if (cursorBottom > viewBottom - 20) {
                container.scrollTo({ top: cursorTop, behavior: 'smooth' });
            } else if (cursorTop < viewTop) {
                container.scrollTo({ top: Math.max(0, viewTop - container.clientHeight + 20), behavior: 'smooth' });
            }
        }
    }, [userInput]);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const preventScroll = (e: WheelEvent | TouchEvent) => {
            e.preventDefault();
        };

        container.addEventListener('wheel', preventScroll, { passive: false });
        container.addEventListener('touchmove', preventScroll, { passive: false });

        return () => {
            container.removeEventListener('wheel', preventScroll);
            container.removeEventListener('touchmove', preventScroll);
        };
    }, []);

    return (
        <div className="w-full h-full flex flex-col gap-5 p-4 items-center">
            <div className="w-full">menu</div>
            <div className="w-full">metrics</div>
            <div className="flex flex-col gap-5 items-center h-fit">
                <div className="w-full bg-background px-10">
                    {/* Typing Area */}
                    <div
                        ref={scrollRef}
                        className={`relative overflow-y-auto flex justify-center items-start scrollbar-hide`}
                        style={{ maxHeight: `${getTypingAreaHeight(keyboardSize, textSize)}vh` }}
                    >
                        <div
                            className="w-full px-10 py-6 cursor-text whitespace-pre-wrap break-words"
                            onClick={() => inputRef.current?.focus()}
                            onFocus={() => inputRef.current?.focus()}
                        >
                            {renderText()}
                        </div>
                        <div
                            ref={inputRef}
                            tabIndex={0}
                            onKeyDown={handleKeyDown}
                            onKeyUp={handleKeyUp}
                            className="absolute opacity-0 top-4 left-4 pointer-events-none"
                        />
                    </div>
                </div>
                {showKeyboard && (
                    <Keyboard
                        activeKeys={activeKeys}
                        size={keyboardSize}
                    />
                )}
            </div>
        </div>
    );
};

export default PracticePage;
