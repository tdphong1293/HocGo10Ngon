'use client';

import React, { useState } from 'react';

interface TypingTestDemoProps {
    text?: string;
}

export const TypingTestDemo: React.FC<TypingTestDemoProps> = ({
    text = "The quick brown fox jumps over the lazy dog. This is a sample typing test to demonstrate the theme colors."
}) => {
    const [userInput, setUserInput] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= text.length) {
            setUserInput(value);
            setCurrentIndex(value.length);
        }
    };

    const renderCharacter = (char: string, index: number) => {
        let className = '';
        let displayChar = char;

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

        // Show space as underscore for visibility
        if (char === ' ') {
            displayChar = '_';
        }

        return (
            <span
                key={index}
                className={`${className} transition-colors duration-150`}
            >
                {displayChar}
            </span>
        );
    };

    const accuracy = userInput.length > 0 ?
        Math.round((userInput.split('').filter((char, i) => char === text[i]).length / userInput.length) * 100) :
        100;

    const wpm = Math.round((userInput.length / 5) * 12); // Assuming 1 minute = 5 chars average

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Typing Test Demo</h3>

                {/* Typing Area */}
                <div className="mb-4">
                    <div
                        className="text-lg leading-relaxed font-mono p-4 bg-muted rounded-lg cursor-text flex flex-wrap"
                        onClick={() => document.getElementById('typing-input')?.focus()}
                    >
                        {text.split('').map((char, index) => renderCharacter(char, index))}
                        {currentIndex === text.length && (
                            <span className="typing-cursor">|</span>
                        )}
                    </div>
                </div>

                {/* Hidden Input */}
                <input
                    id="typing-input"
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    placeholder="Start typing here..."
                    autoComplete="off"
                    spellCheck="false"
                />

                {/* Stats */}
                <div className="flex gap-6 mt-4 text-sm">
                    <div className="text-muted-foreground">
                        Progress: <span className="text-foreground font-medium">{userInput.length}/{text.length}</span>
                    </div>
                    <div className="text-muted-foreground">
                        Accuracy: <span className="text-foreground font-medium">{accuracy}%</span>
                    </div>
                    <div className="text-muted-foreground">
                        WPM: <span className="text-foreground font-medium">{wpm}</span>
                    </div>
                </div>
            </div>

            {/* Color Legend */}
            <div className="bg-card p-4 rounded-lg border border-border">
                <h4 className="text-sm font-medium text-card-foreground mb-3">Color Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-correct font-mono">Aa</span>
                        <span className="text-muted-foreground">Correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-incorrect font-mono">Aa</span>
                        <span className="text-muted-foreground">Incorrect</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-untyped font-mono">Aa</span>
                        <span className="text-muted-foreground">Untyped</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono px-1 bg-cursor text-cursor-text rounded">A</span>
                        <span className="text-muted-foreground">Cursor</span>
                    </div>
                </div>
            </div>
        </div>
    );
};