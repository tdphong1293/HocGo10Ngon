'use client';

import { JSX, useState, useRef, useEffect } from "react";
import Keyboard from "@/components/Keyboard";
import type { keyboardSizes } from "@/components/Keyboard";
import { Icon } from "@iconify/react";
import TypingModeMenu from "./TypingModeMenu"

const sampleText = `The quick brown fox jumps over the lazy dog.\n\tThis is a sample typing test to demonstrate the theme colors.\nThis is a long test paragraph to check how the typing practice application handles larger blocks of text. It includes multiple lines, punctuation, and various characters to ensure comprehensive testing. Happy typing!. An even longer sentence to test the scrolling functionality of the typing area. Let's add more text to make sure we have enough content to scroll through while typing. This should be sufficient for testing purposes. Enjoy your typing practice! longer sentence to test the scrolling functionality of the typing area. Let's add more text to make sure we have enough content to scroll through while typing. This should be sufficient for testing purposes. Enjoy your typing practice!`;

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

interface Keystroke {
    key: string;
    timestamp: number;
    correct: boolean;
    index: number;
}

const PracticePage = ({ }) => {
    const [userInput, setUserInput] = useState('');
    const [showKeyboard, setShowKeyboard] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [keyboardSize, setKeyboardSize] = useState<keyboardSizes>('small');
    const [textSize, setTextSize] = useState<textSizes>('small');
    const [activeKeys, setActiveKeys] = useState<string[]>([]);

    const inputRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);

    const [text, setText] = useState(sampleText);

    // Typing metrics
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0); // seconds
    const [errorCount, setErrorCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [keystrokeLog, setKeystrokeLog] = useState<Array<Keystroke>>([]);

    // Time limit or word count mode
    const [timeLimit, setTimeLimit] = useState<number | null>(null);
    const [wordLimit, setWordLimit] = useState<number | null>(null);

    const wordCount = (input: string) => input.trim().split(/\s+/).length;

    useEffect(() => {
        setUserInput('');
        setCurrentIndex(0);
        setStartTime(null);
        setElapsedTime(0);
        setErrorCount(0);
        setCorrectCount(0);
        setTimerRunning(false);
        setKeystrokeLog([]);
    }, [text]);

    useEffect(() => {
        if (!timerRunning) return;

        const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timerRunning]);

    // Hàm phát âm thanh khi gõ đúng/sai (không sử dụng Ref 
    // để có âm thanh kể cả khi giữ phím)
    const playSound = (type: 'correct' | 'incorrect') => {
        const soundPath = type === 'correct' ? '/sounds/correct.mp3' : '/sounds/incorrect.mp3';
        const audio = new Audio(soundPath);
        audio.volume = 0.5;
        audio.play();
    }

    // Xóa tất cả phím đang active khi cửa sổ mất focus
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
        if (e.metaKey || e.ctrlKey || key === "F12" || key === "F5" || key === "Escape") {
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
                playSound('correct');
                setKeystrokeLog((prev) => [...prev, { key: 'Backspace', timestamp: Date.now() - (startTime ?? 0), correct: true, index: newValue.length }]);
            }
        }
        else if (key === "Enter") {
            if (!timerRunning) {
                setTimerRunning(true);
                setStartTime(Date.now());
            }

            const newValue = userInput + "\n";
            setUserInput(newValue);
            setCurrentIndex(newValue.length);

            const expectedChar = text[newValue.length - 1];
            if (expectedChar === '\n') {
                playSound('correct');
                setCorrectCount((prev) => prev + 1);
                setKeystrokeLog(
                    (prev) => [...prev, { key: 'Enter', timestamp: Date.now() - (startTime ?? 0), correct: true, index: newValue.length - 1 }]
                );
            } else {
                playSound('incorrect');
                setErrorCount((prev) => prev + 1);
                setKeystrokeLog((prev) => [...prev, { key: 'Enter', timestamp: Date.now() - (startTime ?? 0), correct: false, index: newValue.length - 1 }]);
            }
        }
        else if (key === "Tab") {
            if (!timerRunning) {
                setTimerRunning(true);
                setStartTime(Date.now());
            }

            const newValue = userInput + "\t";
            setUserInput(newValue);
            setCurrentIndex(newValue.length);

            const expectedChar = text[newValue.length - 1];
            if (expectedChar === '\t') {
                playSound('correct');
                setCorrectCount((prev) => prev + 1);
                setKeystrokeLog((prev) => [...prev, { key: 'Tab', timestamp: Date.now() - (startTime ?? 0), correct: true, index: newValue.length - 1 }]);
            } else {
                playSound('incorrect');
                setErrorCount((prev) => prev + 1);
                setKeystrokeLog((prev) => [...prev, { key: 'Tab', timestamp: Date.now() - (startTime ?? 0), correct: false, index: newValue.length - 1 }]);
            }
        }
        else if (key.length === 1) {
            if (!timerRunning) {
                setTimerRunning(true);
                setStartTime(Date.now());
            }

            // Chặn giữ phím cho các phím chữ, số và ký tự đặc biệt
            if (e.repeat) return;

            const newValue = userInput + key;
            setUserInput(newValue);
            setCurrentIndex(newValue.length);

            const expectedChar = text[newValue.length - 1];
            if (key === expectedChar) {
                playSound('correct');
                setCorrectCount((prev) => prev + 1);
                setKeystrokeLog((prev) => [...prev, { key: key, timestamp: Date.now() - (startTime ?? 0), correct: true, index: newValue.length - 1 }]);
            } else {
                playSound('incorrect');
                setErrorCount((prev) => prev + 1);
                setKeystrokeLog((prev) => [...prev, { key: key, timestamp: Date.now() - (startTime ?? 0), correct: false, index: newValue.length - 1 }]);
            }
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

    const minutes = elapsedTime / 60;
    const cpm = correctCount / minutes || 0;
    const raw = (correctCount + errorCount) / minutes || 0;
    const wpm = correctCount / 5 / minutes || 0;
    const accuracy = correctCount + errorCount === 0
        ? 100
        : (correctCount / (correctCount + errorCount)) * 100;


    return (
        <div className="w-full h-full flex flex-col gap-5 p-4 items-center">
            <TypingModeMenu setTypingText={setText} />
            <div className="w-full flex justify-start items-center gap-4 text-md px-10 bg text-accent-foreground">
                <div>WPM: {wpm.toFixed(2)}</div>
                <div>CPM: {cpm.toFixed(2)}</div>
                <div>Raw: {raw.toFixed(2)}</div>
                <div>Accuracy: {accuracy.toFixed(2)}%</div>
                <div>Errors: {errorCount}</div>
                <div>Time: {elapsedTime}s</div>
            </div>
            <div className="flex flex-col gap-5 items-center h-fit">
                <div className="w-full bg-background">
                    {/* Typing Area */}
                    <div
                        ref={scrollRef}
                        className={`relative overflow-y-auto flex justify-center items-start scrollbar-hide`}
                        style={{ maxHeight: `${getTypingAreaHeight(keyboardSize, textSize)}vh` }}
                    >
                        <div
                            className="w-full px-10 cursor-text whitespace-pre-wrap break-words"
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
