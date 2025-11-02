"use client";

import { useEffect, useRef, useState } from 'react';
import Keyboard, { keyboardSizes } from '@/components/Keyboard';
import { Icon } from '@iconify/react';
import type { TextSize } from '@/config/typingUi';
import { textSizeClass, wrongTextClass } from '@/config/typingUi';
import TypingOptionMenu from './TypingOptionMenu';
import { AnimatePresence, motion } from 'framer-motion';
import PostSessionLineChart from './PostSessionLineChart';

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
    words: number;
}

interface TypingPracticeProps {
    text: string;
    // Controlled (optional)
    textSize?: TextSize;
    keyboardSize?: keyboardSizes;
    showKeyboard?: boolean;
    hintMode?: boolean;
    enableSounds?: boolean;
    // Outputs and misc
    onStatsChange?: (stats: TypingStats) => void;
    endMode?: 'time' | 'words' | 'length' | null;
    timeLimit?: number | null;
    heldKey?: string | null;
    // Refresh text function
    refreshText?: () => Promise<void>;
}

const TypingPractice: React.FC<TypingPracticeProps> = ({
    text,
    textSize,
    keyboardSize,
    showKeyboard,
    hintMode,
    onStatsChange,
    enableSounds,
    endMode = null,
    timeLimit = null,
    heldKey = null,
    refreshText,
}) => {
    const [userInput, setUserInput] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isHoldingKey, setIsHoldingKey] = useState(false);

    const inputRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);
    const isProcessingRef = useRef(false);

    // Typing metrics
    const [startTime, setStartTime] = useState<number | null>(null);
    const [userWordCount, setUserWordCount] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0); // seconds
    const [errorCount, setErrorCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [keystrokeLog, setKeystrokeLog] = useState<Array<Keystroke>>([]);
    const [inputHistory, setInputHistory] = useState<string>(''); // Track actual typed characters

    const [isFinished, setIsFinished] = useState(false);
    const [textAnimationKey, setTextAnimationKey] = useState(0);

    const wordCount = (text: string) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    const textWordCount = wordCount(text);

    // Local option state (used when uncontrolled)
    const [localTextSize, setLocalTextSize] = useState<TextSize>('normal');
    const [localKeyboardSize, setLocalKeyboardSize] = useState<keyboardSizes>('small');
    const [localShowKeyboard, setLocalShowKeyboard] = useState<boolean>(true);
    const [localHintMode, setLocalHintMode] = useState<boolean>(true);
    const [localEnableSounds, setLocalEnableSounds] = useState<boolean>(true);

    // Initialize local options from props or localStorage
    useEffect(() => {
        const ls = typeof window !== 'undefined' ? window.localStorage : null;
        const saved = {
            textSize: (ls?.getItem('textSize') as TextSize | null) ?? null,
            keyboardSize: (ls?.getItem('keyboardSize') as keyboardSizes | null) ?? null,
            showKeyboard: ls ? JSON.parse(ls.getItem('showKeyboard') ?? 'true') as boolean : true,
            hintMode: ls ? JSON.parse(ls.getItem('hintMode') ?? 'true') as boolean : true,
            enableSounds: ls ? JSON.parse(ls.getItem('enableSounds') ?? 'true') as boolean : true,
        };

        setLocalTextSize(textSize ?? saved.textSize ?? 'normal');
        setLocalKeyboardSize(keyboardSize ?? saved.keyboardSize ?? 'small');
        setLocalShowKeyboard(showKeyboard ?? saved.showKeyboard ?? true);
        setLocalHintMode(hintMode ?? saved.hintMode ?? true);
        setLocalEnableSounds((typeof enableSounds === 'boolean') ? enableSounds : saved.enableSounds ?? true);
    }, []);

    useEffect(() => {
        const ls = typeof window !== 'undefined' ? window.localStorage : null;
        if (!ls) return;
        ls.setItem('textSize', localTextSize);
        ls.setItem('keyboardSize', localKeyboardSize);
        ls.setItem('showKeyboard', JSON.stringify(localShowKeyboard));
        ls.setItem('hintMode', JSON.stringify(localHintMode));
        ls.setItem('enableSounds', JSON.stringify(localEnableSounds));
    }, [localTextSize, localKeyboardSize, localShowKeyboard, localHintMode, localEnableSounds]);

    const textSizeToUse = textSize ?? localTextSize;
    const keyboardSizeToUse = keyboardSize ?? localKeyboardSize;
    const showKeyboardToUse = showKeyboard ?? localShowKeyboard;
    const hintModeToUse = hintMode ?? localHintMode;
    const enableSoundsToUse = (typeof enableSounds === 'boolean') ? enableSounds : localEnableSounds;

    const resetSession = () => {
        setUserInput('');
        setCurrentIndex(0);
        setStartTime(null);
        setElapsedTime(0);
        setErrorCount(0);
        setCorrectCount(0);
        setTimerRunning(false);
        setKeystrokeLog([]);
        setInputHistory('');
        setIsFinished(false);
    }

    useEffect(() => {
        resetSession();
        setTextAnimationKey(Math.random());
    }, [text]);

    useEffect(() => {
        if (!timerRunning) return;
        const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timerRunning]);

    const playSound = (type: 'correct' | 'incorrect') => {
        if (!enableSoundsToUse) return;
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
        if (isProcessingRef.current) return; // Prevent recursive calls
        isProcessingRef.current = true;

        const keyCode = e.code;
        // Use callback form but return same reference if no change to prevent unnecessary re-renders
        setActiveKeys((prev) => {
            if (prev.includes(keyCode)) return prev;
            return [...prev, keyCode];
        });

        const key = e.key;

        // Ctrl + Shift + R => Lấy text gõ mới
        if (e.ctrlKey && e.shiftKey && !e.altKey && key.toLowerCase() === 'r') {
            e.preventDefault();
            (async () => { await refreshText?.(); })();
            isProcessingRef.current = false;
            return;
        }

        // Ctrl + R => reset lại session gõ hiện tại
        if (e.ctrlKey && !e.shiftKey && !e.altKey && key.toLowerCase() === 'r') {
            e.preventDefault(); // stop browser refresh
            resetSession();
            isProcessingRef.current = false;
            return;
        }

        if (e.metaKey || e.ctrlKey || key === 'F12' || key === 'F5' || key === 'Escape') {
            isProcessingRef.current = false;
            return;
        }

        e.preventDefault();
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
            isProcessingRef.current = false;
            return;
        }

        // Helper to get current timestamp relative to start
        const getTimestamp = () => {
            if (!startTime) return 0; // Return 0 if timer hasn't started yet
            return Date.now() - startTime;
        };

        if (key === 'Backspace') {
            if (heldKey && !isHoldingKey) return;
            if (userInput.length > 0) {
                const newValue = userInput.slice(0, -1);
                setUserInput(newValue);
                setCurrentIndex(newValue.length);
                playSound('correct');
                // Only log if timer has started
                if (startTime) {
                    setKeystrokeLog((prev) => [
                        ...prev,
                        { key: 'Backspace', timestamp: getTimestamp(), correct: true, index: newValue.length },
                    ]);
                }
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
            setInputHistory(prev => prev + '\n'); // Add to history
            const expectedChar = text[newValue.length - 1];
            const correct = expectedChar === '\n';
            playSound(correct ? 'correct' : 'incorrect');
            correct ? setCorrectCount((p) => p + 1) : setErrorCount((p) => p + 1);
            setKeystrokeLog((prev) => [
                ...prev,
                { key: 'Enter', timestamp: getTimestamp(), correct, index: newValue.length - 1 },
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
            setInputHistory(prev => prev + '\t'); // Add to history
            const expectedChar = text[newValue.length - 1];
            const correct = expectedChar === '\t';
            playSound(correct ? 'correct' : 'incorrect');
            correct ? setCorrectCount((p) => p + 1) : setErrorCount((p) => p + 1);
            setKeystrokeLog((prev) => [
                ...prev,
                { key: 'Tab', timestamp: getTimestamp(), correct, index: newValue.length - 1 },
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
            setInputHistory(prev => prev + key); // Add to history
            const expectedChar = text[newValue.length - 1];
            const correct = key === expectedChar;
            playSound(correct ? 'correct' : 'incorrect');
            correct ? setCorrectCount((p) => p + 1) : setErrorCount((p) => p + 1);
            setKeystrokeLog((prev) => [
                ...prev,
                { key, timestamp: getTimestamp(), correct, index: newValue.length - 1 },
            ]);
        }

        // Reset processing flag
        isProcessingRef.current = false;
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

        if (hintModeToUse && isTyped && !isCorrect) {
            return (
                <span key={index} className="relative">
                    <span className="text-incorrect">{renderSymbol(expectedChar)}</span>
                    <span className={`absolute text-accent-foreground/30 left-1/2 -translate-x-1/2 top-1/2 ${wrongTextClass[textSizeToUse]}`}>
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
            <div className={`flex flex-col gap-0 ${textSizeClass[textSizeToUse]}`}>
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
        return textHeightMap[textSize] - (showKeyboardToUse ? keyboardAdjustMap[keyboardSize] : -extraHeight);
    };

    useEffect(() => {
        setUserWordCount(wordCount(userInput));

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

        if (endMode === 'time') {
            if (timeLimit && (elapsedTime >= timeLimit || userInput.length >= text.length)) {
                setIsFinished(true);
                setTimerRunning(false);
            }
        }
        else if (endMode === 'length') {
            if (userInput.length >= text.length) {
                setIsFinished(true);
                setTimerRunning(false);
            }
        }
    }, [userInput, endMode, timeLimit, elapsedTime, text.length]);  

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
        onStatsChange?.({ wpm, cpm, raw, accuracy, errors: errorCount, elapsed: elapsedTime, words: userWordCount });
    }, [correctCount, errorCount, elapsedTime]);

    return (
        <div className="flex flex-col gap-5 items-center h-fit w-full">
            {/* Stats + Options */}
            <div className="flex justify-between w-full gap-10 px-10">
                <div className="w-full flex justify-start items-center gap-4 text-accent-foreground">
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-bold">WPM:</span>
                        <span className="text-lg">{((correctCount / 5) / (elapsedTime / 60 || 1)).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-bold">CPM:</span>
                        <span className="text-lg">{(correctCount / (elapsedTime / 60 || 1)).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-bold">Raw:</span>
                        <span className="text-lg">{(((correctCount + errorCount)) / (elapsedTime / 60 || 1)).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-bold">Accuracy:</span>
                        <span className="text-lg">{(correctCount + errorCount === 0 ? 100 : (correctCount / (correctCount + errorCount)) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-bold">Errors:</span>
                        <span className="text-lg">{errorCount}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-bold">Time:</span>
                        <span className="text-lg">{elapsedTime}s {timeLimit ? ` / ${timeLimit}s` : ''}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-bold">Words:</span>
                        <span className="text-lg">{userWordCount} / {textWordCount}</span>
                    </div>
                </div>
                <TypingOptionMenu
                    textSize={textSizeToUse}
                    keyboardSize={keyboardSizeToUse}
                    setTextSize={setLocalTextSize}
                    setKeyboardSize={setLocalKeyboardSize}
                    showKeyboard={showKeyboardToUse}
                    setShowKeyboard={setLocalShowKeyboard}
                    hintMode={hintModeToUse}
                    setHintMode={setLocalHintMode}
                    enableSounds={enableSoundsToUse}
                    setEnableSounds={setLocalEnableSounds}
                />
            </div>
            <motion.div
                key={textAnimationKey}
                className="w-full bg-background relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onAnimationComplete={() => inputRef.current?.focus()}
            >
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
                    className={`relative overflow-y-hidden flex justify-center items-start`}
                    style={{ maxHeight: `${getTypingAreaHeight(keyboardSizeToUse, textSizeToUse)}vh` }}
                >
                    <div
                        className="w-full px-10 cursor-text whitespace-pre-wrap break-words select-none"
                        style={{
                            fontFeatureSettings: '"liga" 0, "calt" 0',
                        }}
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
            </motion.div>
            <AnimatePresence>
                {showKeyboardToUse && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        <Keyboard
                            activeKeys={activeKeys}
                            size={keyboardSizeToUse}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            {isFinished && keystrokeLog.length > 0 && (
                <div className="w-full mt-10 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-accent-foreground mb-4">Session Performance</h3>
                        <PostSessionLineChart keystrokeLog={keystrokeLog} />
                    </div>

                    {inputHistory && (
                        <div className="w-full">
                            <h3 className="text-lg font-bold text-accent-foreground mb-3">Input History</h3>
                            <div className="bg-accent/30 rounded-lg p-4 border border-border">
                                <div className="font-mono text-sm whitespace-pre-wrap break-words text-accent-foreground">
                                    {inputHistory.split('').map((char, i) => {
                                        const expectedChar = text[i];
                                        const isCorrect = char === expectedChar;

                                        if (char === ' ') {
                                            return (
                                                <span
                                                    key={i}
                                                    className={`inline-block w-[1ch] ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                                                >
                                                    &nbsp;
                                                </span>
                                            );
                                        }
                                        if (char === '\n') {
                                            return <span key={i} className={isCorrect ? 'text-green-500' : 'text-red-500'}>↵<br /></span>;
                                        }
                                        if (char === '\t') {
                                            return <span key={i} className={isCorrect ? 'text-green-500' : 'text-red-500'}>→</span>;
                                        }

                                        return (
                                            <span
                                                key={i}
                                                className={isCorrect ? 'text-green-500' : 'text-red-500 font-bold'}
                                            >
                                                {char}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TypingPractice;
