"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Icon } from "@iconify/react";

interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    id?: string;
    label?: string;
    options: Option[];
    value?: string;
    placeholder?: string;
    className?: string;
    onChange?: (value: string, isNew?: boolean) => void;
    allowCreate?: boolean;
}

const Select: React.FC<SelectProps> = ({
    id,
    label,
    options,
    value: controlledValue,
    placeholder = "Chọn...",
    className,
    onChange,
    allowCreate = false,
}) => {
    const [open, setOpen] = useState(false);
    const [uncontrolledValue, setUncontrolledValue] = useState<Option | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isControlled = controlledValue !== undefined;

    // Compute the selected option for controlled mode
    const controlledOption = options.find(o => o.value === controlledValue) || null;
    const selectedOption = isControlled ? controlledOption : uncontrolledValue;

    // Local input value for filtering
    const [inputValue, setInputValue] = useState(selectedOption?.label || "");

    const usedId = id || useId();

    const filteredOptions = options.filter((o) =>
        o.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Keep inputValue synced with external value (for controlled mode)
    useEffect(() => {
        if (isControlled && controlledOption) {
            setInputValue(controlledOption.label);
        } else if (isControlled && !controlledOption) {
            setInputValue("");
        }
    }, [controlledValue, options]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: Option, isNew = false) => {
        if (!isControlled) {
            setUncontrolledValue(option);
        }
        setInputValue(option.label);
        setOpen(false);
        onChange?.(option.value, isNew);
    };

    const canCreate = allowCreate &&
        inputValue.trim() !== "" &&
        !options.some((o) => o.label.toLowerCase() === inputValue.toLowerCase());

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isControlled) setUncontrolledValue(null);
        setInputValue("");
        onChange?.("", false);
    };

    return (
        <div ref={containerRef} className={`relative w-64 ${className}`}>
            <div className={`flex gap-2 items-center mb-1`}>
                {label && (
                    <label htmlFor={usedId} className="">
                        {label}
                    </label>
                )}
                {selectedOption && inputValue.trim() === "" && (
                    <div className="flex items-center gap-1 bg-accent text-accent-foreground px-2 py-1 rounded-full w-fit">
                        <span
                            className="text-sm truncate max-w-[200px]"
                            title={selectedOption?.label}
                        >
                            Đã chọn {selectedOption?.label}
                        </span>
                        <Icon
                            icon="mdi:close"
                            className="cursor-pointer text-base"
                            onClick={handleClear}
                        />
                    </div>
                )}
            </div>
            <div
                className={`flex items-center border-2 border-border rounded-lg px-2 py-1 focus-within:ring-1 focus-within:ring-ring`}
                onClick={() => setOpen((prev) => !prev)}
            >
                <input
                    id={usedId}
                    className="flex-1 bg-transparent outline-none cursor-text"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setOpen(true);
                    }}
                />
                <Icon
                    icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
                    className="text-muted-foreground text-2xl cursor-pointer"
                />
            </div>

            {open && (
                <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-md">
                    {filteredOptions.length === 0 && !canCreate ? (
                        <li className="px-3 py-2 text-sm text-muted-foreground">
                            Không tìm thấy lựa chọn nào
                        </li>
                    ) : (
                        <>
                            {filteredOptions.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className={`px-3 py-2 text-sm cursor-pointer truncate ${selectedOption?.value === option.value
                                        ? "bg-accent text-accent-foreground"
                                        : "text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                    title={option.label}
                                >
                                    {option.label}
                                </li>
                            ))}

                            {canCreate && (
                                <li
                                    onClick={() =>
                                        handleSelect(
                                            { value: inputValue, label: inputValue },
                                            true
                                        )
                                    }
                                    className={`px-3 py-2 text-sm cursor-pointer truncate ${selectedOption?.value === inputValue
                                        ? "bg-accent text-accent-foreground"
                                        : "text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                    title={`Thêm "${inputValue}"`}
                                >
                                    <Icon
                                        icon="majesticons:plus-line"
                                        className="inline-block text-lg mr-0.5 align-top"
                                    />
                                    Thêm "{inputValue}"
                                </li>
                            )}
                        </>
                    )}
                </ul>
            )}
        </div>
    );
};

export default Select;