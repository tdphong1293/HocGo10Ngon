"use client";

import { useEffect, useRef, useState } from 'react';
import Keyboard, { keyboardSizes } from '@/components/Keyboard';
import { Icon } from '@iconify/react';
import type { TextSize } from '@/config/typingUi';
import { textSizeClass, wrongTextClass } from '@/config/typingUi';

interface Keystroke {
    key: string;
    timestamp: number;
    correct: boolean;
    index: number;
}

export interface TypingStats {
    wpm: number;
    cpm: number;
    raw: number;
    accuracy: number;
    errors: number;
    elapsed: number;
}

interface TypingPracticeProps {
    text: string;
    textSize: TextSize;
    keyboardSize: keyboardSizes;
    showKeyboard: boolean;
    hintMode: boolean;
    onStatsChange?: (stats: TypingStats) => void;
    enableSounds: boolean;
}

const TypingPractice: React.FC<TypingPracticeProps> = ({
    text,
    textSize,
    keyboardSize,
    showKeyboard,
    hintMode,
    onStatsChange,
    enableSounds,
}) => {
    const [userInput, setUserInput] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(true);
    const [heldKey, setHeldKey] = useState<string | null>(null);
    const [isHoldingKey, setIsHoldingKey] = useState(false);

    const inputRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);

    // Typing metrics
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0); // seconds
    const [errorCount, setErrorCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [keystrokeLog, setKeystrokeLog] = useState<Array<Keystroke>>([]);

    const [timeLimit, setTimeLimit] = useState<number | null>(null);
    const [wordLimit, setWordLimit] = useState<number | null>(null);

    const wordCount = text.trim().split(/\s+/).length;

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

    const playSound = (type: 'correct' | 'incorrect') => {
        if (!enableSounds) return;
        const soundPath = type === 'correct' ? '/sounds/correct.mp3' : '/sounds/incorrect.mp3';
        const audio = new Audio(soundPath);
        audio.volume = 0.5;
        audio.play();
    };

    // Clear active keys on window blur
    useEffect(() => {
        const handleBlur = () => setActiveKeys([]);
        window.addEventListener('blur', handleBlur);
        return () => window.removeEventListener('blur', handleBlur);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const keyCode = e.code;
        setActiveKeys((prev) => (prev.includes(keyCode) ? prev : [...prev, keyCode]));

        const key = e.key;
        if (e.metaKey || e.ctrlKey || key === 'F12' || key === 'F5' || key === 'Escape') return;

        e.preventDefault();
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) return;

        if (key === 'Backspace') {
            if (heldKey && !isHoldingKey) return;
            if (userInput.length > 0) {
                const newValue = userInput.slice(0, -1);
                setUserInput(newValue);
                setCurrentIndex(newValue.length);
                playSound('correct');
                setKeystrokeLog((prev) => [
                    ...prev,
                    { key: 'Backspace', timestamp: Date.now() - (startTime ?? 0), correct: true, index: newValue.length },
                ]);
            }
            return;
        }

        if (key === 'Enter') {
            if (heldKey && !isHoldingKey) return;
            if (!timerRunning) {
                setTimerRunning(true);
                setStartTime(Date.now());
            }
            const newValue = userInput + '\n';
            setUserInput(newValue);
            setCurrentIndex(newValue.length);
            const expectedChar = text[newValue.length - 1];
            const correct = expectedChar === '\n';
            playSound(correct ? 'correct' : 'incorrect');
            correct ? setCorrectCount((p) => p + 1) : setErrorCount((p) => p + 1);
            setKeystrokeLog((prev) => [
                ...prev,
                { key: 'Enter', timestamp: Date.now() - (startTime ?? 0), correct, index: newValue.length - 1 },
            ]);
            return;
        }

        if (key === 'Tab') {
            if (heldKey && !isHoldingKey) return;
            if (!timerRunning) {
                setTimerRunning(true);
                setStartTime(Date.now());
            }
            const newValue = userInput + '\t';
            setUserInput(newValue);
            setCurrentIndex(newValue.length);
            const expectedChar = text[newValue.length - 1];
            const correct = expectedChar === '\t';
            playSound(correct ? 'correct' : 'incorrect');
            correct ? setCorrectCount((p) => p + 1) : setErrorCount((p) => p + 1);
            setKeystrokeLog((prev) => [
                ...prev,
                { key: 'Tab', timestamp: Date.now() - (startTime ?? 0), correct, index: newValue.length - 1 },
            ]);
            return;
        }

        if (key.length === 1) {
            if (heldKey && heldKey === key) {
                setIsHoldingKey(true);
                return;
            }
            if (heldKey && !isHoldingKey) return;
            if (e.repeat) return; // avoid repeats for characters
            if (!timerRunning) {
                setTimerRunning(true);
                setStartTime(Date.now());
            }
            const newValue = userInput + key;
            setUserInput(newValue);
            setCurrentIndex(newValue.length);
            const expectedChar = text[newValue.length - 1];
            const correct = key === expectedChar;
            playSound(correct ? 'correct' : 'incorrect');
            correct ? setCorrectCount((p) => p + 1) : setErrorCount((p) => p + 1);
            setKeystrokeLog((prev) => [
                ...prev,
                { key, timestamp: Date.now() - (startTime ?? 0), correct, index: newValue.length - 1 },
            ]);
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const keyCode = e.code;
        setActiveKeys((prev) => prev.filter((k) => k !== keyCode));
        if (heldKey && heldKey === e.key) setIsHoldingKey(false);
    };

    const renderCharacter = (char: string, index: number) => {
        const typedChar = userInput[index];
        const expectedChar = char;

        const isTyped = index < userInput.length;
        const isCorrect = typedChar === expectedChar;
        const isActive = index === currentIndex;

        const renderSymbol = (c: string) => {
            if (c === ' ')
                return (
                    <span className="inline-block align-baseline w-[1ch]">&nbsp;</span>
                );
            if (c === '\n')
                return (
                    <Icon icon="fluent:arrow-enter-left-24-regular" className="inline-block align-middle" />
                );
            if (c === '\t')
                return (
                    <Icon icon="fluent:keyboard-tab-24-regular" className="inline-block align-middle" />
                );
            return c;
        };

        if (isActive) {
            return (
                <span key={index} ref={cursorRef} className="typing-cursor">
                    {renderSymbol(expectedChar)}
                </span>
            );
        }

        if (hintMode && isTyped && !isCorrect) {
            return (
                <span key={index} className="relative">
                    <span className="text-incorrect">{renderSymbol(expectedChar)}</span>
                    <span className={`absolute text-accent-foreground/30 left-1/2 -translate-x-1/2 top-1/2 ${wrongTextClass[textSize]}`}>
                        {renderSymbol(typedChar)}
                    </span>
                </span>
            );
        }

        let className = 'transition-colors duration-150 ';
        if (!isTyped) className += 'text-untyped';
        else if (isCorrect) className += 'text-correct';
        else className += 'text-incorrect';

        return (
            <span key={index} className={className}>
                {renderSymbol(expectedChar)}
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
                                if (i === word.length - 1) lastChar = char;
                                globalIndex++;
                                return el;
                            });
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

    const getTypingAreaHeight = (keyboardSize: keyboardSizes, textSize: TextSize) => {
        const extraHeight = 10;
        const textHeightMap: Record<TextSize, number> = {
            normal: 45,
            large: 40,
            'very-large': 35,
        };
        const keyboardAdjustMap: Record<keyboardSizes, number> = {
            small: 0,
            normal: 5,
            large: 10,
        };
        return textHeightMap[textSize] - (showKeyboard ? keyboardAdjustMap[keyboardSize] : -extraHeight);
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
        const preventScroll = (e: WheelEvent | TouchEvent) => e.preventDefault();
        container.addEventListener('wheel', preventScroll, { passive: false });
        container.addEventListener('touchmove', preventScroll, { passive: false });
        return () => {
            container.removeEventListener('wheel', preventScroll);
            container.removeEventListener('touchmove', preventScroll);
        };
    }, []);

    // report stats to parent
    useEffect(() => {
        const minutes = elapsedTime / 60;
        const cpm = correctCount / (minutes || 1) || 0;
        const raw = (correctCount + errorCount) / (minutes || 1) || 0;
        const wpm = correctCount / 5 / (minutes || 1) || 0;
        const accuracy = correctCount + errorCount === 0 ? 100 : (correctCount / (correctCount + errorCount)) * 100;
        onStatsChange?.({ wpm, cpm, raw, accuracy, errors: errorCount, elapsed: elapsedTime });
    }, [correctCount, errorCount, elapsedTime]);

    return (
        <div className="flex flex-col gap-5 items-center h-fit w-full">
            <div className="w-full bg-background relative">
                <div
                    className={`absolute inset-0 bg-accent/50 rounded-md mx-10 text-accent-foreground z-10 flex flex-col justify-center items-center gap-4 backdrop-blur-sm transition-opacity duration-300 ${isFocused ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
                    onClick={() => inputRef.current?.focus()}
                >
                    Nhấn vào đây để tiếp tục gõ
                </div>
                <div
                    className={`absolute inset-0 bg-accent/50 rounded-md mx-10 text-accent-foreground z-10 flex flex-col justify-center items-center gap-4 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${isHoldingKey || !heldKey ? 'opacity-0' : 'opacity-100'}`}
                >
                    <div className="flex gap-3 justify-center items-center text-2xl">
                        Vui lòng giữ phím
                        <span className="w-10 h-10 bg-primary/20 rounded-md flex justify-center items-center border-2 border-primary-foreground text-primary-foreground animate-bounce">{heldKey}</span>
                        để tiếp tục
                    </div>
                </div>

                {/* Typing Area */}
                <div
                    ref={scrollRef}
                    className={`relative overflow-y-auto flex justify-center items-start scrollbar-hide`}
                    style={{ maxHeight: `${getTypingAreaHeight(keyboardSize, textSize)}vh` }}
                >
                    <div
                        className="w-full px-10 cursor-text whitespace-pre-wrap break-words select-none"
                        onClick={() => {
                            inputRef.current?.focus();
                            setIsFocused(true);
                        }}
                        onFocus={() => {
                            inputRef.current?.focus();
                            setIsFocused(true);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                    >
                        {renderText()}
                    </div>
                    <div
                        onBlur={() => setIsFocused(false)}
                        onFocus={() => setIsFocused(true)}
                        ref={inputRef}
                        tabIndex={0}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                        className="absolute opacity-0 top-4 left-4 pointer-events-none"
                    />
                </div>
            </div>
            {showKeyboard && (
                <Keyboard activeKeys={activeKeys} size={keyboardSize} />
            )}
        </div>
    );
};

export default TypingPractice;
