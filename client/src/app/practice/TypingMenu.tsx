import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TypingMode {
    modeName: string;
    config: { [key: string]: any };
    subConfig?: { [key: string]: any };
}

interface TypingMenuProps {
    onModeChange?: (mode: TypingMode) => void;
}

const createDefaultState = (mode: TypingMode) => {
    const configState: Record<string, any> = {};
    const subConfigState: Record<string, any> = {};

    // pick first/default values
    for (const [key, value] of Object.entries(mode.config || {})) {
        configState[key] = Array.isArray(value) ? value[0] : value;
    }

    // empty objects mean toggles (default false)
    for (const [subKey, subValue] of Object.entries(mode.subConfig || {})) {
        if (Array.isArray(subValue)) {
            subConfigState[subKey] = subValue[0];
        } else {
            subConfigState[subKey] = false;
        }
    }

    return { modeName: mode.modeName, config: configState, subConfig: subConfigState };
};

const TypingMenu: React.FC<TypingMenuProps> = ({
    onModeChange,
}) => {
    const [sessionModeData, setSessionModeData] = useState<TypingMode[]>([
        {
            modeName: 'time',
            config: { timeLimit: [30, 60, 90, 120] },
            subConfig: { number: {}, punctuation: {}, capitalization: {} }
        },
        {
            modeName: 'words',
            config: { wordCount: [15, 25, 50, 100] },
            subConfig: { number: {}, punctuation: {}, capitalization: {} }
        },
        {
            modeName: 'paragraphs',
            config: { paragraphLength: ['short', 'medium', 'long'] },
        },
        {
            modeName: 'row-based',
            config: { rows: ['home', 'top', 'bottom', 'home-top', 'home-bottom', 'top-bottom'] },
            subConfig: { wordCount: [15, 25, 50, 100] }
        }
    ]);

    const [activeMode, setActiveMode] = useState<TypingMode | null>(sessionModeData[0]);
    const [state, setState] = useState<TypingMode | null>(createDefaultState(sessionModeData[0]));

    const handleModeChange = (mode: TypingMode) => {
        setActiveMode(mode);
        setState(createDefaultState(mode));
    }

    const handleToggleSubConfig = (key: string) => {
        setState((prev: TypingMode | null) => {
            if (!prev) return null;
            return {
                modeName: prev.modeName,
                config: prev.config,
                subConfig: {
                    ...prev.subConfig,
                    [key]: !prev.subConfig?.[key],
                },
            };
        });
    };

    const handleSelectConfigOption = (key: string, value: any) => {
        setState((prev: TypingMode | null) => {
            if (!prev) return null;
            return {
                modeName: prev.modeName,
                config: {
                    ...prev.config,
                    [key]: value,
                },
                subConfig: prev.subConfig,
            };
        });
    };

    const handleSelectSubConfigOption = (key: string, value: any) => {
        setState((prev: TypingMode | null) => {
            if (!prev) return null;
            return {
                modeName: prev.modeName,
                config: prev.config,
                subConfig: {
                    ...prev.subConfig,
                    [key]: value,
                }
            };
        });
    };

    return (
        <div className="w-full flex justify-center">
            <AnimatePresence>
                <motion.div
                    className="text-sm bg-accent text-accent-foreground rounded-lg border-2 border-border px-2 py-1 flex gap-3"
                    layout
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    {activeMode?.subConfig && (
                        <>
                            <div className="flex gap-5">
                                {Object.entries(activeMode.subConfig).map(([subKey, subValue]) => {
                                    if (Array.isArray(subValue)) {
                                        // subconfig with multiple options (like wordCount)
                                        return subValue.map((option: any) => (
                                            <span
                                                key={`subconfig-${subKey}-${option}`}
                                                onClick={() => handleSelectSubConfigOption(subKey, option)}
                                                className={`cursor-pointer ${state?.subConfig?.[subKey] === option
                                                    ? "text-primary-foreground"
                                                    : "hover:text-accent-foreground/50"
                                                    }`}
                                            >
                                                {option}
                                            </span>
                                        ));
                                    }

                                    return (
                                        <span
                                            key={`subconfig-${subKey}`}
                                            onClick={() => handleToggleSubConfig(subKey)}
                                            className={`cursor-pointer ${state?.subConfig?.[subKey]
                                                ? "text-primary-foreground"
                                                : "hover:text-accent-foreground/50"
                                                }`}
                                        >
                                            {subKey}
                                        </span>
                                    );
                                })}
                            </div>
                            <div>
                                |
                            </div>
                        </>
                    )}

                    <div className="flex gap-5">
                        {sessionModeData.map((mode) => (
                            <span
                                key={`mode-${mode.modeName}`}
                                onClick={() => handleModeChange(mode)}
                                className={`
                                    cursor-pointer
                                    ${activeMode?.modeName === mode.modeName ? 'text-primary-foreground' : 'hover:text-accent-foreground/50'}
                                `}
                            >
                                {mode.modeName}
                            </span>
                        ))}
                    </div>

                    {activeMode?.config && (
                        <>
                            <div>|</div>
                            <div className="flex gap-5">
                                {Object.entries(activeMode.config).map(([key, value]) =>
                                    Array.isArray(value) ? (
                                        value.map((option: any) => (
                                            <span
                                                key={`config-${key}-${option}`}
                                                onClick={() => handleSelectConfigOption(key, option)}
                                                className={`cursor-pointer ${state?.config?.[key] === option
                                                    ? "text-primary-foreground"
                                                    : "hover:text-accent-foreground/50"
                                                    }`}
                                            >
                                                {option}
                                            </span>
                                        ))
                                    ) : (
                                        <span
                                            key={`config-${key}`}
                                            className="hover:text-accent-foreground/50 cursor-pointer"
                                        >
                                            {key}
                                        </span>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default TypingMenu;