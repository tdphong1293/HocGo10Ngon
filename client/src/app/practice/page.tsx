"use client";

import { useRef, useState } from "react";
import TypingModeMenu from "./TypingModeMenu";
import TypingPractice from "@/components/TypingPractice";

const PracticePage = ({ }) => {
    const [text, setText] = useState('');
    const [endMode, setEndMode] = useState<'time' | 'length' | null>(null);
    const [timeLimit, setTimeLimit] = useState<number | null>(null);
    const refreshRef = useRef<(() => Promise<void>) | null>(null);

    return (
        <div className="w-full h-full flex flex-col gap-5 p-4 items-center">
            <TypingModeMenu
                setTypingText={setText}
                setEndMode={setEndMode}
                setTimeLimit={setTimeLimit}
                onProvideRefresh={(fn) => { refreshRef.current = fn; }}
            />
            <TypingPractice
                text={text}
                endMode={endMode}
                timeLimit={timeLimit}
                refreshText={async () => { await refreshRef.current?.(); }}
            />
        </div>
    );
};

export default PracticePage;
