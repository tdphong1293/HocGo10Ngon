"use client";

import { useState } from "react";
import TypingModeMenu from "./TypingModeMenu";
import TypingOptionMenu from "./TypingOptionMenu";
import TypingPractice from "@/components/TypingPractice";
import type { keyboardSizes } from "@/components/Keyboard";
import type { TextSize } from "@/config/typingUi";

const PracticePage = ({ }) => {
    const [showKeyboard, setShowKeyboard] = useState(true);
    const [keyboardSize, setKeyboardSize] = useState<keyboardSizes>('small');
    const [textSize, setTextSize] = useState<TextSize>('large');
    const [hintMode, setHintMode] = useState(true);
    const [text, setText] = useState('');

    const [stats, setStats] = useState({ wpm: 0, cpm: 0, raw: 0, accuracy: 100, errors: 0, elapsed: 0 });

    return (
        <div className="w-full h-full flex flex-col gap-5 p-4 items-center">
            <TypingModeMenu setTypingText={setText} />
            <div className="flex justify-between w-full gap-10 px-10">
                <div className="w-full flex justify-start items-center gap-4 text-md text-accent-foreground">
                    <div>WPM: {stats.wpm.toFixed(2)}</div>
                    <div>CPM: {stats.cpm.toFixed(2)}</div>
                    <div>Raw: {stats.raw.toFixed(2)}</div>
                    <div>Accuracy: {stats.accuracy.toFixed(2)}%</div>
                    <div>Errors: {stats.errors}</div>
                    <div>Time: {stats.elapsed}s</div>
                </div>
                <TypingOptionMenu
                    textSize={textSize}
                    keyboardSize={keyboardSize}
                    setTextSize={setTextSize}
                    setKeyboardSize={setKeyboardSize}
                    showKeyboard={showKeyboard}
                    setShowKeyboard={setShowKeyboard}
                    hintMode={hintMode}
                    setHintMode={setHintMode}
                />
            </div>
            <TypingPractice
                text={text}
                textSize={textSize}
                keyboardSize={keyboardSize}
                showKeyboard={showKeyboard}
                hintMode={hintMode}
                onStatsChange={setStats}
            />
        </div>
    );
};

export default PracticePage;
