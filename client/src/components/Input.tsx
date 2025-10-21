import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    name?: string;
    id?: string;
    className?: string;
    disablePaste?: boolean;
    trimPaste?: boolean;
    error?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    value,
    onChange,
    placeholder = "",
    type = "text",
    name,
    id,
    className,
    disablePaste = false,
    trimPaste = false,
    error,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    // Floating nếu đang focus hoặc có giá trị
    const isFloating = isFocused || value.length > 0;

    // Handle paste events
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        if (disablePaste) {
            e.preventDefault();
            return;
        }

        if (trimPaste) {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const cleanedText = pastedText.replace(/\s+/g, '');

            onChange(value + cleanedText);
        }
    };

    return (
        <div className={`flex flex-col gap-1 w-full ${className || ''}`}>
            <div className="relative w-full">
                <label
                    htmlFor={id}
                    className={`absolute left-4 transition-all duration-300 ease-in-out pointer-events-none z-10
                        ${isFloating
                            ? 'text-xs text-primary bg-background px-1 -translate-y-1/2'
                            : 'top-1/2 text-sm text-muted-foreground -translate-y-1/2'
                        }`}
                >
                    {label}
                </label>

                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onPaste={handlePaste}
                    placeholder={isFocused ? placeholder : ''}
                    className={`
                        w-full px-4 py-2 border-2 rounded-md transition-colors duration-300
                        text-sm text-foreground bg-background
                        focus:outline-none focus:ring-1 focus:ring-ring
                        ${isFocused
                            ? 'border-ring'
                            : 'border-border hover:border-border-hover'
                        }
                        ${error ? 'border-destructive' : ''}
                    `}
                />
            </div>
            <AnimatePresence>
                {error && (
                    <motion.p
                        className="text-sm text-destructive"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

Input.displayName = 'Input';

export default Input;