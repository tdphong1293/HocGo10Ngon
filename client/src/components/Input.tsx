import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

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
    disablePasteWithWarning?: boolean;
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
    disablePasteWithWarning = false,
    trimPaste = false,
    error,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [subType, setSubType] = useState(type);

    // Floating nếu đang focus hoặc có giá trị
    const isFloating = isFocused || value.length > 0;

    const handleShowHidePassword = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (subType === 'password') {
            setSubType('text');
            setPasswordVisible(true);
        }
        else {
            setSubType('password');
            setPasswordVisible(false);
        }
    };

    // Handle paste events
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        if (disablePaste) {
            e.preventDefault();
            if (disablePasteWithWarning) {
                toast.warning('Không được phép dán nội dung vào trường này');
            }
            return;
        }

        if (trimPaste) {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const cleanedText = pastedText.replace(/\s+/g, '');
            const target = e.currentTarget as HTMLInputElement;
            const start = target.selectionStart || 0;
            const end = target.selectionEnd || 0;
            const value = target.value;
            const newValue = value.slice(0, start) + cleanedText + value.slice(end);
            target.selectionStart = target.selectionEnd = start + cleanedText.length;

            onChange(newValue);
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
                    type={subType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onPaste={handlePaste}
                    placeholder={isFocused ? placeholder : ''}
                    autoComplete='false'
                    autoCorrect='false'
                    autoCapitalize='false'
                    className={`
                        w-full py-2 border-2 rounded-md transition-colors duration-300
                        text-sm text-foreground bg-background
                        focus:outline-none focus:ring-1 focus:ring-ring
                        ${isFocused
                            ? 'border-ring'
                            : 'border-border hover:border-border-hover'
                        }
                        ${(type === 'password' && (isFocused || passwordVisible))
                            ? 'pl-4 pr-7'
                            : 'px-4'
                        }
                        ${error ? 'border-destructive' : ''}
                    `}
                />
                {(isFocused || passwordVisible) && type === 'password' && (
                    <Icon
                        icon={`${passwordVisible ? 'fluent:eye-off-24-filled' : 'fluent:eye-24-filled'}`}
                        onMouseDown={handleShowHidePassword}
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-foreground text-xl"
                    />
                )}
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