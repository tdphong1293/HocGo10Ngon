"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    options: Option[];
    placeholder?: string;
    className?: string;
    onChange?: (value: string, isNew?: boolean) => void; // added `isNew`
}

const Select: React.FC<SelectProps> = ({
    options,
    placeholder = "Select...",
    className,
    onChange,
}) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [selected, setSelected] = useState<Option | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter options when typing
    const filteredOptions = options.filter((o) =>
        o.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Close dropdown when clicking outside
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
        setSelected(option);
        setInputValue(option.label);
        setOpen(false);
        onChange?.(option.value, isNew);
    };

    const canCreate =
        inputValue.trim() !== "" &&
        !options.some((o) => o.label.toLowerCase() === inputValue.toLowerCase());

    return (
        <div ref={containerRef} className={`relative w-64 ${className}`}>
            <div
                className={`flex items-center border-2 border-border rounded-lg px-2 py-1 focus-within:ring-1 focus-within:ring-ring`}
                onClick={() => setOpen((prev) => !prev)} // toggle dropdown
            >
                <input
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
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground truncate ${selected?.value === option.value ? "bg-accent text-accent-foreground" : "text-popover-foreground"}`}
                                    title={option.label}
                                >
                                    {option.label}
                                </li>
                            ))}

                            {canCreate && (
                                <li
                                    onClick={() =>
                                        handleSelect({ value: inputValue, label: inputValue }, true)
                                    }
                                    className="px-3 py-2 text-sm text-accent-foreground cursor-pointer truncate bg-accent"
                                    title={`Thêm "${inputValue}"`}
                                >
                                    <Icon icon="majesticons:plus-line" className="inline-block text-lg mr-0.5 align-top" />
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
