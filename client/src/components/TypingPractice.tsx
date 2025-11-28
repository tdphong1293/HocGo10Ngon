"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Keyboard, { keyboardSizes } from '@/components/Keyboard';
import { Icon } from '@iconify/react';
import type { TextSize } from '@/config/typingUi';
import { textSizeClass, wrongTextClass } from '@/config/typingUi';
import TypingOptionMenu from '@/app/practice/TypingOptionMenu';
import { AnimatePresence, motion } from 'framer-motion';
import PostSessionStat from '@/app/practice/PostSessionStat';
import { storeTypingSessionResult } from '@/services/session.services';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { TypingMode } from '@/app/practice/TypingModeMenu';
import Tooltip from '@/components/Tooltip';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { toast } from 'react-toastify';

export interface Keystroke {
    key: string;
    timestamp: number;
    correct: boolean;
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
    words: string[];
    sessionType: 'PRACTICE' | 'LESSON';
    totalWords?: number;
    author?: string | null;
    source?: string | null;
    lessonid?: string | null;
    nextLessonId?: string | null;
    textSize?: TextSize;
    keyboardSize?: keyboardSizes;
    showKeyboard?: boolean;
    hintMode?: boolean;
    enableSounds?: boolean;
    onStatsChange?: (stats: TypingStats) => void;
    endMode?: 'time' | 'words' | 'length' | null;
    state?: TypingMode | null;
    timeLimit?: number | null;
    heldKey?: string | null;
    refreshText?: () => Promise<void>;
}

const TypingPractice: React.FC<TypingPracticeProps> = ({
    words,
    sessionType,
    totalWords,
    author,
    source,
    lessonid,
    nextLessonId,
    textSize,
    keyboardSize,
    showKeyboard,
    hintMode,
    onStatsChange,
    enableSounds,
    endMode = null,
    state = null,
    timeLimit = null,
    heldKey = null,
    refreshText,
}) => {
    const [userInput, setUserInput] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isHoldingKey, setIsHoldingKey] = useState(false);

    const typingContainerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);
    const isProcessingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [visibleStartLine, setVisibleStartLine] = useState(0);
    const [lineHeightPx, setLineHeightPx] = useState<number>(0);
    const contentWrapperRef = useRef<HTMLDivElement>(null);
    const skipAnimationRef = useRef(true);
    const lineHeightRatioMap: Record<TextSize, number> = {
        normal: 1.4,
        large: 1.3,
        'very-large': 1.2,
    };

    const BUFFER_WORDS = 100;
    const [renderedWordCount, setRenderedWordCount] = useState(BUFFER_WORDS);

    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [keystrokeLog, setKeystrokeLog] = useState<Array<Keystroke>>([]);
    const [inputHistory, setInputHistory] = useState<string>('');
    const [typingStats, setTypingStats] = useState<TypingStats>({
        wpm: 0,
        cpm: 0,
        raw: 0,
        accuracy: 100,
        errors: 0,
        elapsed: 0,
        words: 0,
    });

    const [isFinished, setIsFinished] = useState(false);
    const [textAnimationKey, setTextAnimationKey] = useState(0);
    const isInitialMount = useRef(true);

    const displayText = useMemo(() => {
        return words.slice(0, renderedWordCount).join(' ');
    }, [words, renderedWordCount, textAnimationKey]);

    const fullTextLength = useMemo(() => {
        return words.join(' ').length;
    }, [words]);

    const fullText = useMemo(() => {
        return words.join(' ');
    }, [words]);

    const totalWordsToUse = totalWords ?? words.length;

    const wordCount = (text: string) => {
        return text.trim().split(" ").filter(word => word.trim().length > 0).length;
    }

    const getCurrentWordIndex = useCallback((charIndex: number) => {
        const fullTextLocal = words.join(' ');
        const textUpToCursor = fullTextLocal.slice(0, charIndex);
        return wordCount(textUpToCursor);
    }, [words]);

    const [localTextSize, setLocalTextSize] = useState<TextSize>('large');
    const [localKeyboardSize, setLocalKeyboardSize] = useState<keyboardSizes>('small');
    const [localShowKeyboard, setLocalShowKeyboard] = useState<boolean>(true);
    const [localHintMode, setLocalHintMode] = useState<boolean>(true);
    const [localEnableSounds, setLocalEnableSounds] = useState<boolean>(true);

    const initializedRef = useRef(false);
    useEffect(() => {
        const ls = typeof window !== 'undefined' ? window.localStorage : null;
        const saved = {
            textSize: (ls?.getItem('textSize') as TextSize | null) ?? null,
            keyboardSize: (ls?.getItem('keyboardSize') as keyboardSizes | null) ?? null,
            showKeyboard: ls ? (ls.getItem('showKeyboard') !== null ? JSON.parse(ls.getItem('showKeyboard') as string) as boolean : null) : null,
            hintMode: ls ? (ls.getItem('hintMode') !== null ? JSON.parse(ls.getItem('hintMode') as string) as boolean : null) : null,
            enableSounds: ls ? (ls.getItem('enableSounds') !== null ? JSON.parse(ls.getItem('enableSounds') as string) as boolean : null) : null,
        };

        setLocalTextSize(saved.textSize ?? textSize ?? 'large');
        setLocalKeyboardSize(saved.keyboardSize ?? keyboardSize ?? 'small');
        setLocalShowKeyboard(saved.showKeyboard ?? showKeyboard ?? true);
        setLocalHintMode(saved.hintMode ?? hintMode ?? true);
        setLocalEnableSounds(saved.enableSounds ?? (typeof enableSounds === 'boolean' ? enableSounds : true));
        initializedRef.current = true;
    }, []);

    useEffect(() => {
        const ls = typeof window !== 'undefined' ? window.localStorage : null;
        if (!ls) return;
        if (!initializedRef.current) return;
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

    const resetSession = useCallback(() => {
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
        setRenderedWordCount(BUFFER_WORDS); // Reset rendered word count
        setTextAnimationKey(key => key + 1);
    }, []);

    useEffect(() => {
        if (!words || words.length === 0) return;

        if (isInitialMount.current) {
            isInitialMount.current = false;
            setIsFocused(true);
            return;
        }

        resetSession();
        const timer = setTimeout(() => {
            setIsFocused(true);
            resetSession();
        }, 10);
        return () => clearTimeout(timer);
    }, [words, resetSession]);

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

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (isProcessingRef.current) return;
        if (isFinished) return;
        isProcessingRef.current = true;

        const keyCode = e.code;
        setActiveKeys((prev) => {
            if (prev.includes(keyCode)) return prev;
            return [...prev, keyCode];
        });

        const key = e.key;

        if (e.metaKey || e.ctrlKey || key === 'F12' || key === 'F5' || key === 'Escape') {
            isProcessingRef.current = false;
            return;
        }

        e.preventDefault();
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
            isProcessingRef.current = false;
            return;
        }

        const timestamp = startTime ? Date.now() - startTime : 0;

        const commitChar = (char: string) => {
            if (!timerRunning) {
                setTimerRunning(true);
                setStartTime(Date.now());
            }

            const newValue = userInput + char;
            const index = newValue.length - 1;
            const expected = displayText[index];
            const correct = expected === char;

            setUserInput(newValue);
            setCurrentIndex(newValue.length);
            setInputHistory(prev => prev + char);
            playSound(correct ? "correct" : "incorrect");

            if (correct) setCorrectCount(p => p + 1);
            else setErrorCount(p => p + 1);

            setKeystrokeLog(prev => [
                ...prev,
                { key: char, timestamp, correct, index }
            ]);
        };

        // Backspace
        if (key === "Backspace") {
            if (heldKey && !isHoldingKey) {
                isProcessingRef.current = false;
                return;
            }
            if (userInput.length > 0) {
                const newValue = userInput.slice(0, -1);
                setUserInput(newValue);
                setCurrentIndex(newValue.length);
                playSound("correct");
                setKeystrokeLog(prev => [
                    ...prev,
                    { key: "Backspace", timestamp, correct: true, index: newValue.length }
                ]);
            }

            isProcessingRef.current = false;
            return;
        }

        // Enter
        if (key === "Enter") {
            if (heldKey && !isHoldingKey) {
                isProcessingRef.current = false;
                return;
            }
            commitChar("\n");
            isProcessingRef.current = false;
            return;
        }

        // Tab
        if (key === "Tab") {
            if (heldKey && !isHoldingKey) {
                isProcessingRef.current = false;
                return;
            }
            commitChar("\t");
            isProcessingRef.current = false;
            return;
        }

        // Normal characters
        if (key.length === 1) {
            if (heldKey && heldKey.toLowerCase() === key.toLocaleLowerCase()) {
                setIsHoldingKey(true);
                isProcessingRef.current = false;
                return;
            }
            if (heldKey && !isHoldingKey) {
                isProcessingRef.current = false;
                return;
            }
            if (e.repeat) {
                isProcessingRef.current = false;
                return;
            }
            if (!/^[\p{L}\p{N}\p{P}\p{Zs}]$/u.test(key)) {
                isProcessingRef.current = false;
                return;
            }

            commitChar(key);
        }

        isProcessingRef.current = false;
    }, [isFinished, userInput, displayText, startTime, timerRunning, heldKey, isHoldingKey, playSound]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const keyCode = e.code;
        setActiveKeys((prev) => prev.filter((k) => k !== keyCode));
        if (heldKey && heldKey.toLowerCase() === e.key.toLowerCase()) {
            setIsHoldingKey(false);
        }
    }, [heldKey]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (typingContainerRef.current && !typingContainerRef.current.contains(e.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleBlur = () => setActiveKeys([]);
        window.addEventListener('blur', handleBlur);
        return () => window.removeEventListener('blur', handleBlur);
    }, []);

    // Global keyboard shortcuts and typing handlers
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isTypingElsewhere =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;
            if (isTypingElsewhere) {
                return;
            }

            const key = e.key;
            if (e.ctrlKey && !e.shiftKey && !e.altKey && key === 'Enter') {
                e.preventDefault();
                refreshText?.();
                setTimeout(() => {
                    setIsFocused(true);
                }, 10);
                return;
            }
            if (e.ctrlKey && !e.shiftKey && !e.altKey && key.toLowerCase() === 'r') {
                e.preventDefault();
                resetSession();
                setTimeout(() => {
                    setIsFocused(true);
                }, 10);
                return;
            }
            if (isFocused && !isFinished) {
                handleKeyDown(e);
            }
        };

        const handleGlobalKeyUp = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isTypingElsewhere =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;
            if (isTypingElsewhere) {
                return;
            }

            if (isFocused && !isFinished) {
                handleKeyUp(e);
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        window.addEventListener('keyup', handleGlobalKeyUp);

        return () => {
            window.removeEventListener('keydown', handleGlobalKeyDown);
            window.removeEventListener('keyup', handleGlobalKeyUp);
        };
    }, [refreshText, resetSession, isFocused, isFinished, handleKeyDown, handleKeyUp]);

    const renderCharacter = (char: string, index: number) => {
        const typedChar = userInput[index];
        const expectedChar = char;

        const isTyped = index < userInput.length;
        const isCorrect = typedChar === expectedChar;
        const isActive = index === currentIndex;

        const renderSymbol = (c: string) => {
            if (c === ' ') return ' ';
            if (c === '\n')
                return <Icon icon="fluent:arrow-enter-left-24-regular" className="inline-block align-middle" />;
            if (c === '\t')
                return <Icon icon="fluent:keyboard-tab-24-regular" className="inline-block align-middle" />;
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

        const className = !isTyped
            ? 'transition-colors duration-150 text-untyped'
            : isCorrect
                ? 'transition-colors duration-150 text-correct'
                : 'transition-colors duration-150 text-incorrect';

        return (
            <span key={index} className={className}>
                {renderSymbol(expectedChar)}
            </span>
        );
    };

    const renderText = () => {
        const content: React.ReactElement[] = [];
        for (let i = 0; i < displayText.length; i++) {
            const ch = displayText[i];
            if (ch === '\n') {
                content.push(
                    <span key={`nl-${i}`} className="inline-flex items-center">
                        {renderCharacter('\n', i)}
                    </span>
                );
                content.push(<br key={`br-${i}`} />);
                continue;
            }
            content.push(renderCharacter(ch, i));
        }

        return (
            <div>
                {content}
            </div>
        );
    };

    const renderedTextMemo = useMemo(() => renderText(), [displayText, renderedWordCount, userInput, currentIndex, textSizeToUse, textAnimationKey]);

    const VISIBLE_LINES = 3;
    const EDGE_BUFFER = 1;
    const BOTTOM_EXTRA = 0.75;

    useEffect(() => {
        const wordsTyped = getCurrentWordIndex(currentIndex);

        const targetRender = Math.min(totalWordsToUse, wordsTyped + BUFFER_WORDS);

        if (targetRender !== renderedWordCount) {
            setRenderedWordCount(targetRender);
        }

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            if (!cursorRef.current || !contentWrapperRef.current) return;
            const cursor = cursorRef.current;
            let lh = lineHeightPx;
            if (!lh) {
                const cs = window.getComputedStyle(contentWrapperRef.current);
                lh = parseFloat(cs.lineHeight) || cursor.getBoundingClientRect().height || 1;
                if (!lineHeightPx) setLineHeightPx(lh);
            }
            if (lh <= 0) return;

            const caretLine = Math.floor(cursor.offsetTop / lh);
            let newStart = visibleStartLine;
            const bottomThreshold = visibleStartLine + VISIBLE_LINES - 1 - EDGE_BUFFER;
            const topThreshold = visibleStartLine + EDGE_BUFFER;

            if (caretLine > bottomThreshold) {
                newStart = caretLine - (VISIBLE_LINES - 1 - EDGE_BUFFER);
            } else if (caretLine < topThreshold) {
                newStart = Math.max(0, caretLine - EDGE_BUFFER);
            }

            if (newStart !== visibleStartLine) {
                setVisibleStartLine(newStart);
                if (skipAnimationRef.current) {
                    skipAnimationRef.current = false;
                }
            }
        }, 30);

        if (endMode === 'time') {
            if (timeLimit && (elapsedTime >= timeLimit || userInput.length >= fullTextLength)) {
                setIsFinished(true);
                setTimerRunning(false);
            }
        }
        else if (endMode === 'length') {
            if (userInput.length >= fullTextLength) {
                setIsFinished(true);
                setTimerRunning(false);
            }
        }

        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [userInput, endMode, timeLimit, elapsedTime, fullTextLength, currentIndex, totalWordsToUse, renderedWordCount, BUFFER_WORDS, getCurrentWordIndex, visibleStartLine, lineHeightPx, textSizeToUse]);

    useEffect(() => {
        const container = scrollRef.current;
        if (container) container.style.overflowY = 'hidden';
        if (container) {
            const cs = window.getComputedStyle(container);
            let lh = parseFloat(cs.lineHeight);
            if (!isFinite(lh) || lh <= 0) {
                const fs = parseFloat(cs.fontSize) || 16;
                lh = fs * lineHeightRatioMap[textSizeToUse];
            }
            setLineHeightPx(lh);
        }
    }, [textSizeToUse]);

    useEffect(() => {
        const minutes = elapsedTime / 60;
        const cpm = correctCount / (minutes || 1) || 0;
        const raw = (correctCount + errorCount) / 5 / (minutes || 1) || 0;
        const wpm = correctCount / 5 / (minutes || 1) || 0;
        const accuracy = correctCount + errorCount === 0 ? 100 : (correctCount / (correctCount + errorCount)) * 100;
        onStatsChange?.({ wpm, cpm, raw, accuracy, errors: errorCount, elapsed: elapsedTime, words: getCurrentWordIndex(currentIndex) });
        setTypingStats({ wpm, cpm, raw, accuracy, errors: errorCount, elapsed: elapsedTime, words: getCurrentWordIndex(currentIndex) });
    }, [correctCount, errorCount, elapsedTime, currentIndex, onStatsChange, getCurrentWordIndex, setTypingStats]);

    // Memoize stats display to prevent re-renders
    const StatsDisplay = useMemo(() => (
        <div className="w-full flex justify-start items-center gap-4 text-accent-foreground">
            <div className="flex flex-col text-right">
                <span className="text-sm font-bold">WPM:</span>
                <span className="text-lg">{(typingStats.wpm).toFixed(2)}</span>
            </div>
            <div className="flex flex-col text-right">
                <span className="text-sm font-bold">CPM:</span>
                <span className="text-lg">{(typingStats.cpm).toFixed(2)}</span>
            </div>
            <div className="flex flex-col text-right">
                <span className="text-sm font-bold">Raw:</span>
                <span className="text-lg">{(typingStats.raw).toFixed(2)}</span>
            </div>
            <div className="flex flex-col text-right">
                <span className="text-sm font-bold">Accuracy:</span>
                <span className="text-lg">{(typingStats.accuracy).toFixed(2)}%</span>
            </div>
            <div className="flex flex-col text-right">
                <span className="text-sm font-bold">Errors:</span>
                <span className="text-lg">{typingStats.errors}</span>
            </div>
            <div className="flex flex-col text-right">
                <span className="text-sm font-bold">Time:</span>
                <span className="text-lg">{elapsedTime}s {timeLimit ? ` / ${timeLimit}s` : ''}</span>
            </div>
            <div className="flex flex-col text-right">
                <span className="text-sm font-bold">Words:</span>
                <span className="text-lg">{getCurrentWordIndex(currentIndex)} / {totalWordsToUse}</span>
            </div>
        </div>
    ), [typingStats, elapsedTime, timeLimit, currentIndex, totalWords, getCurrentWordIndex, totalWordsToUse]);

    const { isAuthenticated, user, accessToken, loading } = useAuth();
    const { languageCode } = useTheme();

    useEffect(() => {
        const storeSessionResult = async () => {
            if (isFinished && keystrokeLog.length > 0 && isAuthenticated && user && accessToken && languageCode) {
                setIsFocused(false);
                setActiveKeys([]);
                if (heldKey) {
                    setIsHoldingKey(false);
                }

                const data = {
                    sessionType,
                    languageCode: languageCode,
                    lessonid: sessionType === 'LESSON' && lessonid ? lessonid : undefined,
                    modeName: state?.modeName,
                    useConfig: state?.config || {},
                    useSubConfig: state?.subConfig || {},
                    wpm: typingStats.wpm,
                    cpm: typingStats.cpm,
                    accuracy: typingStats.accuracy,
                    errorCount: typingStats.errors,
                    duration: typingStats.elapsed,
                    rawInput: inputHistory,
                    keystrokes: keystrokeLog,
                };

                const response = await storeTypingSessionResult(accessToken, data);
                if (!response.ok) {
                    const errorData = await response.json();
                    toast.error(errorData.message || 'Lỗi khi lưu kết quả phiên gõ!');
                }
            }
        };
        storeSessionResult();
    }, [isFinished, keystrokeLog, isAuthenticated, user, accessToken, languageCode, typingStats, state, inputHistory]);

    if (loading) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 items-center h-fit w-full">
            {/* Stats + Options */}
            {!isFinished && (
                <div className="flex justify-between w-full gap-10 px-10">
                    {StatsDisplay}
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
            )}

            <AnimatePresence mode="wait">
                {!isFinished && (
                    <motion.div
                        key={textAnimationKey}
                        ref={typingContainerRef}
                        className="w-full bg-background relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        <div
                            className={`absolute inset-0 bg-accent/50 rounded-md mx-10 text-accent-foreground z-10 flex flex-col justify-center items-center gap-4 backdrop-blur-sm transition-opacity duration-300 ${isFocused ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
                            onClick={() => setIsFocused(true)}
                        >
                            Nhấn vào đây để tiếp tục gõ
                        </div>
                        <div
                            className={`absolute inset-0 bg-accent/50 rounded-md mx-10 text-accent-foreground z-20 flex flex-col justify-center items-center gap-4 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${isHoldingKey || !heldKey ? 'opacity-0' : 'opacity-100'}`}
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
                            className={`relative w-full flex justify-center items-start overflow-hidden ${textSizeClass[textSizeToUse]} select-none leading-loose`}
                            style={{
                                height: `calc((${VISIBLE_LINES} + ${BOTTOM_EXTRA}) * 1lh)`
                            }}
                        >
                            <div
                                className="w-full"
                                style={{
                                    height: `calc(${VISIBLE_LINES} * 1lh)`,
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    ref={contentWrapperRef}
                                    className="w-full px-10 cursor-text whitespace-pre-wrap break-words"
                                    style={{
                                        fontFeatureSettings: '"liga" 0, "calt" 0',
                                        lineHeight: 'inherit',
                                        transform: lineHeightPx ? `translateY(-${visibleStartLine * lineHeightPx}px)` : undefined,
                                        willChange: 'transform',
                                        transition: skipAnimationRef.current ? 'none' : 'transform 180ms ease-out'
                                    }}
                                    onClick={() => setIsFocused(true)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onDragStart={(e) => e.preventDefault()}
                                >
                                    {renderedTextMemo}
                                </div>
                            </div>
                            {/* Bottom extra space for overlays */}
                            <div aria-hidden style={{ height: `calc(${BOTTOM_EXTRA} * 1lh)` }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showKeyboardToUse && !isFinished && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        <Keyboard
                            activeKeys={activeKeys}
                            size={keyboardSizeToUse}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isFinished && keystrokeLog.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="w-full"
                    >
                        <PostSessionStat
                            text={fullText}
                            keystrokeLog={keystrokeLog}
                            typingStats={typingStats}
                            inputHistory={inputHistory}
                            author={author}
                            source={source}
                        />
                        <div className="flex justify-center gap-10 mt-6">
                            {lessonid && (
                                <Tooltip text="Quay về danh sách bài học" side="left">
                                    <Link href={`/lessons`}>
                                        <div
                                            className="p-2 cursor-pointer border-2 border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            <Icon
                                                icon="line-md:arrow-left" className="text-2xl"
                                            />
                                        </div>
                                    </Link>
                                </Tooltip>
                            )}
                            <Tooltip text="Gõ lại với văn bản hiện tại" shortcut="Ctrl+R" side={lessonid ? (nextLessonId ? 'top' : 'right') : 'left'}>
                                <div className="p-2 cursor-pointer border-2 border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                                    <Icon
                                        icon="ri:reset-left-fill" className="text-2xl"
                                        onClick={resetSession}
                                    />
                                </div>
                            </Tooltip>
                            {refreshText && (
                                <Tooltip text="Phiên gõ mới" shortcut="Ctrl+Enter" side={nextLessonId ? 'top' : 'right'}>
                                    <div className="p-2 cursor-pointer border-2 border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                                        <Icon
                                            icon="ooui:next-ltr" className="text-2xl"
                                            onClick={async () => { await refreshText?.(); }}
                                        />
                                    </div>
                                </Tooltip>
                            )}
                            {nextLessonId && (
                                <Tooltip text="Bài học tiếp theo" side="right">
                                    <Link href={`/lessons/${nextLessonId}`}>
                                        <div
                                            className="p-2 cursor-pointer border-2 border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            <Icon
                                                icon="line-md:arrow-right" className="text-2xl"
                                            />
                                        </div>
                                    </Link>
                                </Tooltip>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TypingPractice;
