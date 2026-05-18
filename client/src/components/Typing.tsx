"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Keyboard, { keyboardSizes } from '@/components/Keyboard';
import { Icon } from '@iconify/react';
import type { TextSize } from '@/config/typingUi';
import { textSizeClass, wrongTextClass, textKeySizeMap, textKeyGapMap, textKeyMoveUpMap } from '@/config/typingUi';
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
    isCorrect: boolean;
    deltaTime?: number;
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

interface TypingProps {
    words: string[];
    sessionType: 'PRACTICE' | 'LESSON';
    lessonType?: 'PRACTICE' | 'KEY_LESSON';
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

const Typing: React.FC<TypingProps> = ({
    words,
    sessionType,
    lessonType,
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
    const [displayedWords, setDisplayedWords] = useState<string[]>(words);
    const soundRefs = useRef<Partial<Record<'correct' | 'incorrect', HTMLAudioElement>>>({});
    const lastSoundAtRef = useRef(0);
    const SOUND_MIN_INTERVAL_MS = 60;

    const [wrongChar, setWrongChar] = useState<string | null>(null);
    const [isBackspaceTyped, setIsBackspaceTyped] = useState(false);
    const wrongCharTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const backspaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const displayedText = useMemo(() => {
        if (lessonType === "KEY_LESSON") {
            return displayedWords.join('')
        }
        return displayedWords.slice(0, renderedWordCount).join(' ');
    }, [displayedWords, renderedWordCount, lessonType]);

    const fullText = useMemo(() => {
        if (lessonType === "KEY_LESSON") {
            return displayedText;
        }
        return displayedWords.join(' ');
    }, [displayedWords, lessonType, displayedText]);

    const fullTextLength = useMemo(() => {
        return fullText.length;
    }, [fullText]);

    const totalWordsToUse = totalWords ?? displayedWords.length;

    const wordCount = (text: string) => {
        return text.trim().split(" ").filter(word => word.trim().length > 0).length;
    }

    const getCurrentWordIndex = useCallback((charIndex: number) => {
        const fullTextLocal = displayedWords.join(' ');
        const textUpToCursor = fullTextLocal.slice(0, charIndex);
        return wordCount(textUpToCursor);
    }, [displayedWords]);

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
        setWrongChar(null);
        setIsBackspaceTyped(false);
        setRenderedWordCount(BUFFER_WORDS); // Reset rendered word count
        setTextAnimationKey(key => key + 1);
        setVisibleStartLine(0);
        skipAnimationRef.current = true;
        if (wrongCharTimeoutRef.current) {
            clearTimeout(wrongCharTimeoutRef.current);
            wrongCharTimeoutRef.current = null;
        }
        if (backspaceTimeoutRef.current) {
            clearTimeout(backspaceTimeoutRef.current);
            backspaceTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        // unmount cleanup
        return () => {
            if (wrongCharTimeoutRef.current) {
                clearTimeout(wrongCharTimeoutRef.current);
                wrongCharTimeoutRef.current = null;
            }
            if (backspaceTimeoutRef.current) {
                clearTimeout(backspaceTimeoutRef.current);
                backspaceTimeoutRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!words || words.length === 0) return;

        setDisplayedWords(words);
        resetSession();

        const timer = setTimeout(() => {
            setIsFocused(true);
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
        const now = Date.now();
        if (now - lastSoundAtRef.current < SOUND_MIN_INTERVAL_MS) return;
        lastSoundAtRef.current = now;
        const soundPath = type === 'correct' ? '/sounds/correct.mp3' : '/sounds/incorrect.mp3';
        let audio = soundRefs.current[type];
        if (!audio) {
            audio = new Audio(soundPath);
            audio.preload = 'auto';
            soundRefs.current[type] = audio;
        }
        audio.volume = 0.5;
        audio.currentTime = 0;
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

        if (e.isComposing || key === 'Dead' || key === 'Process') {
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

        const timestamp = startTime ? Date.now() - startTime : 0;

        const commitChar = (char: string) => {
            if (!timerRunning) {
                setTimerRunning(true);
                setStartTime(Date.now());
            }

            const newValue = userInput + char;
            const index = newValue.length - 1;
            const expected = displayedText[index];
            const correct = expected === char;

            if (!correct && lessonType === "KEY_LESSON") {
                playSound("incorrect");
                setWrongChar(char);
                if (wrongCharTimeoutRef.current) {
                    clearTimeout(wrongCharTimeoutRef.current);
                }
                wrongCharTimeoutRef.current = setTimeout(() => {
                    setWrongChar(null);
                    wrongCharTimeoutRef.current = null;
                }, 300);
                isProcessingRef.current = false;
                return;
            }

            setUserInput(newValue);
            setCurrentIndex(newValue.length);
            setInputHistory(prev => prev + char);
            playSound(correct ? "correct" : "incorrect");

            if (correct) setCorrectCount(p => p + 1);
            else setErrorCount(p => p + 1);

            const keystroke: Keystroke = { key: char, timestamp, isCorrect: correct, deltaTime: timestamp - (keystrokeLog.length > 0 ? keystrokeLog[keystrokeLog.length - 1].timestamp : 0) };
            setKeystrokeLog(prev => [
                ...prev,
                keystroke
            ]);
        };

        // Backspace
        if (key === "Backspace") {
            if (lessonType === "KEY_LESSON") {
                playSound("correct")
                setIsBackspaceTyped(true);
                if (backspaceTimeoutRef.current) {
                    clearTimeout(backspaceTimeoutRef.current);
                }
                backspaceTimeoutRef.current = setTimeout(() => {
                    setIsBackspaceTyped(false);
                    backspaceTimeoutRef.current = null;
                }, 2000);
                isProcessingRef.current = false;
                return;
            }
            if (heldKey && !isHoldingKey) {
                isProcessingRef.current = false;
                return;
            }
            if (userInput.length > 0) {
                const newValue = userInput.slice(0, -1);
                setUserInput(newValue);
                setCurrentIndex(newValue.length);
                playSound("correct");
                const keystroke: Keystroke = { key: "Backspace", timestamp, isCorrect: true, deltaTime: timestamp - (keystrokeLog.length > 0 ? keystrokeLog[keystrokeLog.length - 1].timestamp : 0) };
                setKeystrokeLog(prev => [
                    ...prev,
                    keystroke
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
            if (heldKey && heldKey.toLowerCase() === key.toLowerCase()) {
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
            if (!/^[\p{L}\p{N}\p{P}\p{S}\p{Zs}]$/u.test(key)) {
                isProcessingRef.current = false;
                return;
            }

            commitChar(key);
        }

        isProcessingRef.current = false;
    }, [isFinished, userInput, displayedText, startTime, timerRunning, heldKey, isHoldingKey, playSound]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const keyCode = e.code;
        setActiveKeys((prev) => prev.filter((k) => k !== keyCode));
        if (heldKey && heldKey.toLowerCase() === e.key.toLowerCase()) {
            setIsHoldingKey(false);
        }
    }, [heldKey]);

    // Set các giá trị về false khi click ra ngoài, chuyển tab, ẩn cửa sổ, hoặc khi cửa sổ mất focus
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (typingContainerRef.current && !typingContainerRef.current.contains(e.target as Node)) {
                setIsFocused(false);
                setActiveKeys([]);
                if (timerRunning) {
                    setTimerRunning(false);
                }
                if (heldKey) {
                    setIsHoldingKey(false);
                }
            }
        };

        const handleBlur = () => {
            setActiveKeys([]);
            setIsFocused(false);
            if (timerRunning) {
                setTimerRunning(false);
            }
            if (heldKey) {
                setIsHoldingKey(false);
            }
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState !== 'visible') {
                setActiveKeys([]);
                setIsFocused(false);
                if (timerRunning) {
                    setTimerRunning(false);
                }
                if (heldKey) {
                    setIsHoldingKey(false);
                }
            }
        };

        const handlePageHide = () => {
            setActiveKeys([]);
            setIsFocused(false);
            if (timerRunning) {
                setTimerRunning(false);
            }
            if (heldKey) {
                setIsHoldingKey(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('blur', handleBlur);
        };
    }, [heldKey, timerRunning]);

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
        for (let i = 0; i < displayedText.length; i++) {
            const ch = displayedText[i];
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

    const renderedTextMemo = useMemo(() => renderText(), [displayedText, renderedWordCount, userInput, currentIndex, textSizeToUse, textAnimationKey]);

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

        if (fullTextLength > 0) {
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
        <div
            className="w-full flex justify-start items-center gap-4 text-accent-foreground"
        >
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
            {lessonType !== "KEY_LESSON" && (
                <div className="flex flex-col text-right">
                    <span className="text-sm font-bold">Words:</span>
                    <span className="text-lg">{getCurrentWordIndex(currentIndex)} / {totalWordsToUse}</span>
                </div>
            )}
        </div>
    ), [typingStats, elapsedTime, timeLimit, currentIndex, totalWords, getCurrentWordIndex, totalWordsToUse]);

    const { isAuthenticated, user, accessToken, loading, setAccessToken, signOut } = useAuth();
    const isGuest = !isAuthenticated || !user || !accessToken;
    const { languageCode } = useTheme();

    useEffect(() => {
        const storeSessionResult = async () => {
            if (isFinished && keystrokeLog.length > 0 && !isGuest && languageCode) {
                setIsFocused(false);
                setActiveKeys([]);
                if (heldKey) {
                    setIsHoldingKey(false);
                }

                const data = {
                    sessionType,
                    lessonType,
                    languageCode: languageCode,
                    lessonid: sessionType === 'LESSON' && lessonid ? lessonid : undefined,
                    modeName: state?.modeName,
                    usedConfig: state?.config || {},
                    usedSubConfig: state?.subConfig || {},
                    WPM: typingStats.wpm,
                    CPM: typingStats.cpm,
                    accuracy: typingStats.accuracy,
                    errorCount: typingStats.errors,
                    duration: typingStats.elapsed,
                    rawInput: inputHistory,
                    keystrokes: keystrokeLog,
                };

                const response = await storeTypingSessionResult(accessToken, data, setAccessToken, () => signOut("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"));
                if (response.ok) {
                    if ((data.WPM < 20 || data.accuracy < 60 || data.CPM < 100) && lessonType !== 'KEY_LESSON') {
                        toast.warn('Phiên gõ có WPM/CPM hoặc độ chính xác khá thấp sẽ xem như thất bại và không được tính vào thành tích của bạn');
                    }
                }
                else {
                    const errorData = await response.json();
                    toast.error(errorData.message || 'Lỗi khi lưu kết quả phiên gõ!');
                }
            }
        };
        storeSessionResult();
    }, [isFinished, keystrokeLog, isGuest, languageCode, typingStats, state, inputHistory]);

    const getKeyLessonCharIndex = (row: number, col: number) => {
        let index = 0;
        for (let i = 0; i < row; i++) {
            index += words[i].length;
        }
        return index + col;
    }

    const getKeyLessonWordIndex = (charIndex: number) => {
        let wordIndex = 0;
        let currentIndex = 0;
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (charIndex < currentIndex + word.length) {
                wordIndex = i;
                break;
            }
            currentIndex += word.length;
        }
        return wordIndex;
    }

    const renderKeyLessonText = (currenIndex: number) => {
        const wordIndex = getKeyLessonWordIndex(currenIndex);
        if (wordIndex >= words.length) return null;
        const word = words[wordIndex];
        const keyLessonKey = `${wordIndex}-${textAnimationKey}`;

        return (
            <div className="w-full flex flex-col gap-2 items-center">
                <div className="min-h-9">
                    {isBackspaceTyped && (
                        <Icon
                            icon="ic:round-backspace"
                            className="text-incorrect "
                        />
                    )}
                </div>
                <AnimatePresence mode="wait" initial={true}>
                    <motion.div
                        className="flex gap-4 flex-wrap justify-center items-center"
                        key={keyLessonKey}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                        {word.split("").map((char, charIndex) => {
                            const typedChar = userInput[getKeyLessonCharIndex(wordIndex, charIndex)];
                            const isTyped = getKeyLessonCharIndex(wordIndex, charIndex) < userInput.length;
                            const isCorrect = typedChar === char;
                            const isActive = getKeyLessonCharIndex(wordIndex, charIndex) === currentIndex;

                            return (
                                <div
                                    className={`flex flex-col ${textKeyGapMap[textSizeToUse]}`}
                                    key={`char-wrapper-${wordIndex}-${charIndex}`}
                                >
                                    <div
                                        key={`char-${wordIndex}-${charIndex}`}
                                        className={`aspect-square ${textKeySizeMap[textSizeToUse]} rounded-md flex justify-center items-center border-2 border-border transition-colors duration-150 ${!isTyped ? "" : isCorrect ? "border-correct text-correct" : "border-incorrect text-incorrect"} ${isActive && wrongChar ? "border-incorrect text-incorrect " + textKeyMoveUpMap[textSizeToUse] + " transition-transform duration-300" : ""}`}
                                    >
                                        {isActive && wrongChar ? wrongChar : char}
                                    </div>
                                    <div className={`h-1 w-full rounded-md ${isActive ? "bg-primary" : ""}`} />
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (words.length <= 0 || !words) {
        return null;
    }

    return (
        <div className="flex flex-col gap-5 items-center h-fit w-full">
            <AnimatePresence mode="wait" initial={false}>
                {!isFinished ? (
                    <motion.div
                        key="typing-scene"
                        className="w-full flex flex-col gap-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        {/* Stats + Options */}
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

                        <motion.div
                            key={textAnimationKey}
                            ref={typingContainerRef}
                            className="w-full bg-background relative"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <div
                                className={`absolute inset-0 bg-accent/50 rounded-md mx-10 text-accent-foreground z-25 flex flex-col justify-center items-center gap-4 backdrop-blur-sm transition-opacity duration-300 ${isFocused ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
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
                            {lessonType !== "KEY_LESSON" ? (
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
                                            className="w-full px-10 cursor-text whitespace-pre-wrap wrap-break-word"
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
                            ) : (
                                <div
                                    className={`w-full flex justify-center items-center overflow-hidden ${textSizeClass[textSizeToUse]} select-none leading-loose`}
                                    style={{
                                        height: `calc((${VISIBLE_LINES} + ${BOTTOM_EXTRA}) * 1lh)`
                                    }}
                                >
                                    {renderKeyLessonText(currentIndex)}
                                </div>
                            )}
                        </motion.div>

                        {showKeyboardToUse && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="w-full flex justify-center"
                            >
                                <Keyboard
                                    activeKeys={activeKeys}
                                    size={keyboardSizeToUse}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="post-scene"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="w-full"
                    >
                        {keystrokeLog.length > 0 && lessonType !== "KEY_LESSON" ?
                            (
                                <PostSessionStat
                                    text={fullText}
                                    keystrokeLog={keystrokeLog}
                                    typingStats={typingStats}
                                    inputHistory={inputHistory}
                                    author={author}
                                    source={source}
                                />
                            ) : (
                                <div className="w-full h-60 flex flex-col justify-center items-center gap-2">
                                    <Icon icon="material-symbols:check-circle" className="text-6xl text-correct" />
                                    <span className="text-3xl font-bold">Hoàn thành!</span>
                                </div>
                            )
                        }
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
                                <div
                                    className="p-2 cursor-pointer border-2 border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                    onClick={resetSession}
                                >
                                    <Icon
                                        icon="ri:reset-left-fill" className="text-2xl"
                                    />
                                </div>
                            </Tooltip>
                            {refreshText && (
                                <Tooltip text="Phiên gõ mới" shortcut="Ctrl+Enter" side={nextLessonId ? 'top' : 'right'}>
                                    <div
                                        className="p-2 cursor-pointer border-2 border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                        onClick={async () => { await refreshText?.(); }}
                                    >
                                        <Icon
                                            icon="ooui:next-ltr" className="text-2xl"
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

export default Typing;
