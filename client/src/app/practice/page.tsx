'use client';

import { useState } from "react";
import Keyboard from "@/components/Keyboard";

const sampleText = "The quick brown fox jumps over the lazy dog. This is a sample typing test to demonstrate the theme colors.";

interface PracticePageProps {
    text?: string;
}

const PracticePage = ({
    text = sampleText
}) => {
    const [userInput, setUserInput] = useState('');
    const [showKeyboard, setShowKeyboard] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= text.length) {
            setUserInput(value);
            setCurrentIndex(value.length);
        }
    };

    const toggleKeyboard = () => {
        setShowKeyboard(!showKeyboard);
    }

    const renderCharacter = (char: string, index: number) => {
        let className = '';

        if (index < userInput.length) {
            // Character has been typed
            if (userInput[index] === char) {
                className = 'text-correct';
            } else {
                className = 'text-incorrect';
            }
        } else if (index === currentIndex) {
            // Current character (cursor position) - just use typing-cursor class
            className = 'typing-cursor';
        } else {
            // Untyped character
            className = 'text-untyped';
        }

        return (
            <span
                key={index}
                className={`${className} transition-colors duration-150`}
            >
                {char}
            </span>
        )
    }

    return (
        <div className="w-full h-full flex flex-col gap-4 ">
            <div className="bg-background p-10">
                abc
            </div>
            <div className="bg-muted p-10">
                def
            </div>
        </div>
    );
}

export default PracticePage;