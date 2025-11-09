'use client';

import React, { createContext, useContext, useId } from 'react';

interface RadioGroupContextValue {
    name: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

const useRadioGroup = () => {
    const context = useContext(RadioGroupContext);
    if (!context) {
        throw new Error('RadioGroupItem must be used within RadioGroup');
    }
    return context;
};

interface RadioGroupProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    name?: string;
}

export const RadioGroup = ({
    value,
    onValueChange,
    children,
    className = '',
    disabled = false,
    name,
}: RadioGroupProps) => {
    const generatedName = useId();
    const groupName = name || generatedName;

    return (
        <RadioGroupContext.Provider
            value={{
                name: groupName,
                value,
                onChange: onValueChange,
                disabled,
            }}
        >
            <div className={`space-y-2 ${className}`} role="radiogroup">
                {children}
            </div>
        </RadioGroupContext.Provider>
    );
};

interface RadioGroupItemProps {
    value: string;
    id?: string;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const RadioGroupItem = ({
    value,
    id: customId,
    disabled: itemDisabled = false,
    className = '',
    children,
}: RadioGroupItemProps) => {
    const { name, value: selectedValue, onChange, disabled: groupDisabled } = useRadioGroup();
    const generatedId = useId();
    const id = customId || generatedId;
    const isDisabled = groupDisabled || itemDisabled;
    const isChecked = selectedValue === value;

    const handleChange = () => {
        if (!isDisabled) {
            onChange(value);
        }
    };

    return (
        <div className={`flex items-center ${className}`}>
            <div className="relative flex items-center">
                <input
                    type="radio"
                    id={id}
                    name={name}
                    value={value}
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={isDisabled}
                    className="sr-only peer"
                />
                <div
                    onClick={handleChange}
                    className={`
                        w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer
                        transition-all duration-200
                        ${isChecked
                            ? 'border-primary bg-primary'
                            : 'border-input bg-background'
                        }
                        ${isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-primary/70'
                        }
                        peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2
                    `}
                >
                    {isChecked && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                </div>
            </div>
            {children && (
                <label
                    htmlFor={id}
                    className={`
                        ml-2 text-sm cursor-pointer select-none
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {children}
                </label>
            )}
        </div>
    );
};
