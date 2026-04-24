"use client";

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
type TooltipAlign = 'start' | 'center' | 'end';

interface TooltipProps {
    children: React.ReactNode;
    text: string;
    shortcut?: string;
    side?: TooltipSide;
    align?: TooltipAlign;
    offset?: number; // Distance from trigger element in pixels
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, shortcut, side = 'top', align = 'center', offset = 8 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const [actualSide, setActualSide] = useState<TooltipSide>(side);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const gap = offset;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let calculatedSide = side;
            let top = 0;
            let left = 0;

            // Calculate initial position based on preferred side and alignment
            switch (side) {
                case 'top':
                case 'bottom':
                    // Vertical positioning
                    if (side === 'top') {
                        top = triggerRect.top - tooltipRect.height - gap;
                        if (top < 0) {
                            calculatedSide = 'bottom';
                            top = triggerRect.bottom + gap;
                        }
                    } else {
                        top = triggerRect.bottom + gap;
                        if (top + tooltipRect.height > viewportHeight) {
                            calculatedSide = 'top';
                            top = triggerRect.top - tooltipRect.height - gap;
                        }
                    }

                    // Horizontal alignment
                    switch (align) {
                        case 'start':
                            left = triggerRect.left;
                            break;
                        case 'end':
                            left = triggerRect.right - tooltipRect.width;
                            break;
                        case 'center':
                        default:
                            left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                            break;
                    }

                    // Constrain horizontally (gap lúc này là padding so với viewport edge)
                    if (left < gap) left = gap;
                    if (left + tooltipRect.width > viewportWidth - gap) {
                        left = viewportWidth - tooltipRect.width - gap;
                    }
                    break;

                case 'left':
                case 'right':
                    // Horizontal positioning
                    if (side === 'left') {
                        left = triggerRect.left - tooltipRect.width - gap;
                        if (left < 0) {
                            calculatedSide = 'right';
                            left = triggerRect.right + gap;
                        }
                    } else {
                        left = triggerRect.right + gap;
                        if (left + tooltipRect.width > viewportWidth) {
                            calculatedSide = 'left';
                            left = triggerRect.left - tooltipRect.width - gap;
                        }
                    }

                    // Vertical alignment
                    switch (align) {
                        case 'start':
                            top = triggerRect.top;
                            break;
                        case 'end':
                            top = triggerRect.bottom - tooltipRect.height;
                            break;
                        case 'center':
                        default:
                            top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                            break;
                    }

                    // Constrain vertically (gap lúc này là padding so với viewport edge)
                    if (top < gap) top = gap;
                    if (top + tooltipRect.height > viewportHeight - gap) {
                        top = viewportHeight - tooltipRect.height - gap;
                    }
                    break;
            }

            setPosition({ top, left });
            setActualSide(calculatedSide);
        }
    }, [isVisible, side, align, offset]);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className="inline-block"
            >
                {children}
            </div>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        ref={tooltipRef}
                        className="fixed z-60 px-3 py-2 bg-accent text-accent-foreground rounded-md shadow-lg pointer-events-none border-2 border-border"
                        style={{
                            top: `${position?.top ?? 0}px`,
                            left: `${position?.left ?? 0}px`,
                            visibility: position ? 'visible' : 'hidden',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-sm whitespace-nowrap">{text}</span>
                            {shortcut && (
                                <span className="text-xs opacity-70 whitespace-nowrap">({shortcut})</span>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Tooltip;
