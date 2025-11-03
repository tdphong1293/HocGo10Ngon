"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import Keyboard, { keyboardSizes } from '@/components/Keyboard';
import { Icon } from '@iconify/react';
import type { TextSize } from '@/config/typingUi';
import { textSizeClass, wrongTextClass } from '@/config/typingUi';
import TypingOptionMenu from './TypingOptionMenu';
import { AnimatePresence, motion } from 'framer-motion';
import PostSessionStat from './PostSessionStat';

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
    totalWords: number;
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
    words,
    totalWords,
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
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Lazy rendering state
    const INITIAL_WORDS = 80;
    const BUFFER_WORDS = 10;
    const [renderedWordCount, setRenderedWordCount] = useState(INITIAL_WORDS); // Initial render count

    // Typing metrics
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

    // Compute full text from words array for rendering up to renderedWordCount
    const text = useMemo(() => {
        return words.slice(0, renderedWordCount).join(' ');
    }, [words, renderedWordCount]);

    // Total text length for completion check
    const fullTextLength = useMemo(() => {
        return words.join(' ').length;
    }, [words]);

    // Full text for PostSessionStat analysis
    const fullText = useMemo(() => {
        return words.join(' ');
    }, [words]);

    const wordCount = (text: string) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    // Get current word index based on character position
    const getCurrentWordIndex = (charIndex: number) => {
        const fullText = words.join(' ');
        const textUpToCursor = fullText.slice(0, charIndex);
        return wordCount(textUpToCursor);
    }

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
        setRenderedWordCount(INITIAL_WORDS); // Reset rendered word count
    }

    useEffect(() => {
        resetSession();
        setTextAnimationKey(key => key + 1);
        // Delay focus to after animation starts
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, [words]);

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

    // Global keyboard shortcuts - works even when finished
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const key = e.key;

            // Ctrl + Shift + R => Lấy text gõ mới (refresh text)
            if (e.ctrlKey && e.shiftKey && !e.altKey && key.toLowerCase() === 'r') {
                e.preventDefault();
                (async () => { await refreshText?.(); })();
                return;
            }

            // Ctrl + R => reset lại session gõ hiện tại (reset session)
            if (e.ctrlKey && !e.shiftKey && !e.altKey && key.toLowerCase() === 'r') {
                e.preventDefault(); // stop browser refresh
                resetSession();
                setTextAnimationKey(key => key + 1);
                setTimeout(() => inputRef.current?.focus(), 100);
                return;
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [refreshText, resetSession]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (isProcessingRef.current) return; // Prevent recursive calls
        if (isFinished) return; // Disable typing when finished
        isProcessingRef.current = true;

        const keyCode = e.code;
        // Use callback form but return same reference if no change to prevent unnecessary re-renders
        setActiveKeys((prev) => {
            if (prev.includes(keyCode)) return prev;
            return [...prev, keyCode];
        });

        const key = e.key;

        // Note: Ctrl+R and Ctrl+Shift+R are handled globally now (works even when finished)

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
            if (heldKey && !isHoldingKey) {
                isProcessingRef.current = false;
                return;
            }
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
            isProcessingRef.current = false;
            return;
        }

        if (key === 'Enter') {
            if (heldKey && !isHoldingKey) {
                isProcessingRef.current = false;
                return;
            }
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
            isProcessingRef.current = false;
            return;
        }

        if (key === 'Tab') {
            if (heldKey && !isHoldingKey) {
                isProcessingRef.current = false;
                return;
            }
            if (!timerRunning) {
                setTimerRunning(true);
                setStartTime(Date.now());
            }
            const newValue = userInput + '\t';
            setUserInput(newValue);
            setCurrentIndex(newValue.length);
            setInputHistory(prev => prev + '\t');
            const expectedChar = text[newValue.length - 1];
            const correct = expectedChar === '\t';
            playSound(correct ? 'correct' : 'incorrect');
            correct ? setCorrectCount((p) => p + 1) : setErrorCount((p) => p + 1);
            setKeystrokeLog((prev) => [
                ...prev,
                { key: 'Tab', timestamp: getTimestamp(), correct, index: newValue.length - 1 },
            ]);
            isProcessingRef.current = false;
            return;
        }

        if (key.length === 1) {
            if (heldKey && heldKey === key) {
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

        // Optimize symbol rendering - reuse objects
        const renderSymbol = (c: string) => {
            if (c === ' ') return '\u00A0'; // Non-breaking space as string
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

        // Use single class string instead of concatenation
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
        // Use words array directly - only render up to renderedWordCount
        let globalIndex = 0;
        const renderedContent: React.ReactElement[] = [];

        for (let i = 0; i < renderedWordCount && i < words.length; i++) {
            const word = words[i];

            // Render each character in the word
            const wordEls = word.split('').map((char, charIndex) => {
                const el = renderCharacter(char, globalIndex);
                globalIndex++;
                return el;
            });

            renderedContent.push(
                <span key={`word-${i}`} className="inline-block">
                    {wordEls}
                </span>
            );

            // Add space after word (except last word)
            if (i < renderedWordCount - 1 && i < words.length - 1) {
                const spaceEl = renderCharacter(' ', globalIndex);
                globalIndex++;
                renderedContent.push(
                    <span key={`space-${i}`} className="inline-block">
                        {spaceEl}
                    </span>
                );
            }
        }

        return (
            <div className={`flex flex-wrap gap-0 ${textSizeClass[textSizeToUse]} leading-loose`}>
                {renderedContent}
            </div>
        );
    };

    useEffect(() => {
        // Dynamic word rendering: adjust rendered word count based on typing position
        const currentWordIndex = getCurrentWordIndex(currentIndex);

        // Progressive rendering: Append BUFFER_WORDS after every BUFFER_WORDS typed
        // Example: BUFFER_WORDS=10, INITIAL=80 → after typing word 10, append 10 (90 total); after word 20, append 10 (100), etc.
        const wordsTyped = currentWordIndex;
        const expectedRendered = INITIAL_WORDS + Math.ceil(wordsTyped / BUFFER_WORDS) * BUFFER_WORDS;

        // Append if we've typed enough words and haven't rendered enough yet
        if (wordsTyped > 0 && wordsTyped % BUFFER_WORDS === 0 && renderedWordCount < expectedRendered && renderedWordCount < totalWords) {
            setRenderedWordCount(Math.min(expectedRendered, totalWords));
        }
        // If backspacing significantly, remove words (keep at least INITIAL_WORDS)
        else if (wordsTyped < renderedWordCount - INITIAL_WORDS + BUFFER_WORDS && renderedWordCount > INITIAL_WORDS) {
            // Remove words back to current position + buffer
            setRenderedWordCount(Math.max(wordsTyped + INITIAL_WORDS, INITIAL_WORDS));
        }

        // Debounce scroll updates to reduce performance impact
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
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
                    container.scrollTo({ top: Math.max(0, viewTop - container.clientHeight), behavior: 'smooth' });
                }
            }
        }, 50); // 50ms debounce

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
    }, [userInput, endMode, timeLimit, elapsedTime, fullTextLength, currentIndex, totalWords, renderedWordCount, BUFFER_WORDS, INITIAL_WORDS]);

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
        onStatsChange?.({ wpm, cpm, raw, accuracy, errors: errorCount, elapsed: elapsedTime, words: getCurrentWordIndex(currentIndex) });
        setTypingStats({ wpm, cpm, raw, accuracy, errors: errorCount, elapsed: elapsedTime, words: getCurrentWordIndex(currentIndex) });
    }, [correctCount, errorCount, elapsedTime, currentIndex, onStatsChange]);

    const getTypingAreaHeight = (textSize: TextSize) => {
        const textHeightMap: Record<TextSize, number> = {
            normal: 25,
            large: 36,
            'very-large': 36,
        };
        return textHeightMap[textSize];
    };

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
                <span className="text-lg">{getCurrentWordIndex(currentIndex)} / {totalWords}</span>
            </div>
        </div>
    ), [typingStats, elapsedTime, timeLimit, currentIndex, totalWords]);

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
            {!isFinished && (
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
                        style={{ height: `${getTypingAreaHeight(textSizeToUse)}vh` }}
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
            )}

            <AnimatePresence>
                {showKeyboardToUse && !isFinished && (
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
            <AnimatePresence>
                {isFinished && keystrokeLog.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="w-full"
                    >
                        <PostSessionStat
                            text={fullText}
                            keystrokeLog={keystrokeLog}
                            typingStats={typingStats}
                            inputHistory={inputHistory}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TypingPractice;
