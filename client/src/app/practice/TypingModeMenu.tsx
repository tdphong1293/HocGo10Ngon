import { useState, useEffect, use, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSessionModes, getPracticeTypingText } from '@/services/session.services';
import { getUserSessionMode, updateUserSessionMode } from "@/services/user.services";
import { toast } from "react-toastify";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";

export interface TypingMode {
    modeName: string;
    config: { [key: string]: any };
    subConfig?: { [key: string]: any };
}

interface TypingMenuProps {
    setTypingWords: (words: string[]) => void;
    setWordCount?: (count: number) => void;
    setEndMode?: (mode: 'time' | 'length' | null) => void;
    onStateChange?: (state: TypingMode | null) => void;
    setTimeLimit?: (limit: number | null) => void;
    onProvideRefresh?: (refresh: () => Promise<void>) => void;
    setAuthor?: (author: string | null) => void;
    setSource?: (source: string | null) => void;
}

const createDefaultState = (mode: TypingMode | null) => {
    const configState: Record<string, any> = {};
    const subConfigState: Record<string, any> = {};

    if (!mode) return null;

    // pick first/default values
    for (const [key, value] of Object.entries(mode.config || {})) {
        configState[key] = Array.isArray(value) && value.length > 0 ? value[0] : false;
    }

    // empty objects mean toggles (default false)
    for (const [subKey, subValue] of Object.entries(mode.subConfig || {})) {
        subConfigState[subKey] = Array.isArray(subValue) && subValue.length > 0 ? subValue[0] : false;
    }

    return { modeName: mode.modeName, config: configState, subConfig: subConfigState };
};

const TypingMenu: React.FC<TypingMenuProps> = ({
    setTypingWords,
    setWordCount,
    setEndMode,
    setTimeLimit,
    onStateChange,
    onProvideRefresh,
    setAuthor,
    setSource,
}) => {
    const [sessionModeData, setSessionModeData] = useState<TypingMode[] | null>(null);
    const [activeMode, setActiveMode] = useState<TypingMode | null>(sessionModeData?.[0] || null);
    const [state, setState] = useState<TypingMode | null>(createDefaultState(sessionModeData?.[0] || null));
    const [prevState, setPrevState] = useState<TypingMode | null>(null);
    const { languageCode } = useTheme();
    const { isAuthenticated, user, accessToken } = useAuth();

    useEffect(() => {
        const fetchModes = async () => {
            const response = await getSessionModes();
            const { data } = await response.json();
            if (response.ok) {
                setSessionModeData(data.sessionModes);
                setActiveMode(data.sessionModes[0]);
                setState(createDefaultState(data.sessionModes[0]));
            }
        };
        fetchModes();
    }, []);

    useEffect(() => {
        const fetchUserMode = async () => {
            const response = await getUserSessionMode(accessToken!);
            if (response.ok) {
                const { data: { activeMode, sessionMode } } = await response.json();
                setActiveMode(activeMode);
                setState(sessionMode);
            }
        }
        if (isAuthenticated && user && accessToken) {
            fetchUserMode();
        }
    }, [isAuthenticated, user, accessToken]);

    const fetchPracticeText = useCallback(async () => {
        if (state) {
            if (isAuthenticated && user && accessToken && JSON.stringify(state) !== JSON.stringify(prevState)) {
                updateUserSessionMode(accessToken, state);
            }

            const response = await getPracticeTypingText(languageCode, state);
            if (response.ok) {
                const { data } = await response.json();
                setTypingWords && setTypingWords(data.words);
                setWordCount && setWordCount(data.totalWords);
                setAuthor && setAuthor(data.author || null);
                setSource && setSource(data.source || null);
            }
            else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Lỗi khi lấy văn bản luyện tập');
            }
        }
    }, [state, prevState, languageCode, isAuthenticated, user, accessToken]);

    // Expose bound refresh function to parent
    useEffect(() => {
        onProvideRefresh?.(fetchPracticeText);
    }, [onProvideRefresh, fetchPracticeText]);

    useEffect(() => {
        if (JSON.stringify(state) !== JSON.stringify(prevState)) {
            fetchPracticeText();
            onStateChange?.(state);

            switch (state?.modeName) {
                case 'time':
                    setEndMode?.('time');
                    setTimeLimit?.(state.config?.timeLimit || null);
                    break;
                case 'words':
                case 'row-based':
                case 'paragraphs':
                    setEndMode?.('length');
                    setTimeLimit?.(null);
                    break;
                default:
                    setEndMode?.(null);
            }
        }
    }, [state, languageCode]);

    const handleModeChange = (mode: TypingMode) => {
        if (activeMode?.modeName === mode.modeName) return; // no change
        setActiveMode(mode);
        setPrevState(state);
        setState(createDefaultState(mode));
    }

    const handleToggleConfig = (key: string) => {
        setPrevState(state);
        setState((prev: TypingMode | null) => {
            if (!prev) return null;
            return {
                modeName: prev.modeName,
                config: {
                    ...prev.config,
                    [key]: !prev.config?.[key],
                },
                subConfig: prev.subConfig,
            };
        });
    };

    const handleToggleSubConfig = (key: string) => {
        setPrevState(state);
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
        if (state?.config?.[key] === value) return; // no change
        setPrevState(state);
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
        if (state?.subConfig?.[key] === value) return; // no change
        setPrevState(state);
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
                    {activeMode?.subConfig && Object.keys(activeMode.subConfig).length > 0 && (
                        <>
                            <div className="flex gap-5">
                                {Object.entries(activeMode.subConfig).map(([subKey, subValue]) => {
                                    if (Array.isArray(subValue) && subValue.length > 0) {
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
                        {sessionModeData?.map((mode) => (
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

                    {activeMode?.config && Object.keys(activeMode.config).length > 0 && (
                        <>
                            <div>|</div>
                            <div className="flex gap-5">
                                {Object.entries(activeMode.config).map(([key, value]) =>
                                    Array.isArray(value) && value.length > 0 ? (
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
                                            onClick={() => handleToggleConfig(key)}
                                            className={`cursor-pointer ${state?.config?.[key]
                                                ? "text-primary-foreground"
                                                : "hover:text-accent-foreground/50"
                                                }`}
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