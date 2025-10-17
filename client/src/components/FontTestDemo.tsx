'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export const FontTestDemo: React.FC = () => {
    const { font, isLoaded } = useTheme();
    const [currentFontVar, setCurrentFontVar] = useState('');
    const [dataFontAttr, setDataFontAttr] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && isLoaded) {

            const timeoutId = setTimeout(() => {
                const htmlElement = document.documentElement;
                const computedStyle = window.getComputedStyle(htmlElement);
                const fontFamily = computedStyle.getPropertyValue('font-family');
                setCurrentFontVar(fontFamily);

                const dataFont = htmlElement.getAttribute('data-font') || 'not set';
                setDataFontAttr(dataFont);

                // Debug font changes
                console.log('FontTestDemo Update (after delay):', {
                    contextFont: font,
                    domDataFont: dataFont,
                    bodyFontFamily: window.getComputedStyle(document.body).fontFamily,
                    mismatch: font !== dataFont,
                    isLoaded
                });
            }, 1);

            return () => clearTimeout(timeoutId);
        }
    }, [font, isLoaded]);

    const testTexts = [
        'The quick brown fox jumps over the lazy dog',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'abcdefghijklmnopqrstuvwxyz',
        '1234567890 !@#$%^&*()',
        'Typing test with different fonts'
    ];

    return (
        <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Font Test Demo</h3>
            <div className="mb-6 p-2 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-2">
                    React Context Font: <span className="font-medium text-foreground capitalize">{font}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                    Current CSS font-family: <code className="bg-background px-2 py-1 rounded text-xs">{currentFontVar}</code>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    data-font attribute: <code className="bg-background px-2 py-1 rounded text-xs">{dataFontAttr}</code>
                </p>
                {font !== dataFontAttr && (
                    <p className="text-xs text-destructive mt-2 font-medium">
                        ⚠️ Mismatch detected: React context ({font}) ≠ DOM attribute ({dataFontAttr})
                    </p>
                )}
            </div>

            <div className="space-y-4">
                {testTexts.map((text, index) => (
                    <div key={index} className="p-3 bg-muted rounded text-foreground border">
                        {text}
                    </div>
                ))}

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-card-foreground">Different Sizes</h4>
                        <div className="space-y-1">
                            <div className="text-xs text-foreground border p-2 rounded">Extra small text (12px)</div>
                            <div className="text-sm text-foreground border p-2 rounded">Small text (14px)</div>
                            <div className="text-base text-foreground border p-2 rounded">Base text (16px)</div>
                            <div className="text-lg text-foreground border p-2 rounded">Large text (18px)</div>
                            <div className="text-xl text-foreground border p-2 rounded">Extra large text (20px)</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-card-foreground">Font Weights</h4>
                        <div className="space-y-1">
                            <div className="font-light text-foreground border p-2 rounded">Light weight</div>
                            <div className="font-normal text-foreground border p-2 rounded">Normal weight</div>
                            <div className="font-medium text-foreground border p-2 rounded">Medium weight</div>
                            <div className="font-semibold text-foreground border p-2 rounded">Semibold weight</div>
                            <div className="font-bold text-foreground border p-2 rounded">Bold weight</div>
                        </div>
                    </div>
                </div>

                {/* Direct font testing */}
                <div className="mt-6 p-4 bg-background border rounded-lg">
                    <h4 className="text-sm font-medium text-card-foreground mb-3">Direct Font Testing</h4>
                    <div className="space-y-2 text-sm">
                        <div style={{ fontFamily: 'var(--font-geist)' }} className="p-2 border rounded">
                            Geist: The quick brown fox jumps over the lazy dog
                        </div>
                        <div style={{ fontFamily: 'var(--font-inter)' }} className="p-2 border rounded">
                            Inter: The quick brown fox jumps over the lazy dog
                        </div>
                        <div style={{ fontFamily: 'var(--font-roboto)' }} className="p-2 border rounded">
                            Roboto: The quick brown fox jumps over the lazy dog
                        </div>
                        <div style={{ fontFamily: 'var(--font-poppins)' }} className="p-2 border rounded">
                            Poppins: The quick brown fox jumps over the lazy dog
                        </div>
                        <div style={{ fontFamily: 'var(--font-openSans)' }} className="p-2 border rounded">
                            Open Sans: The quick brown fox jumps over the lazy dog
                        </div>
                        <div style={{ fontFamily: 'var(--font-sourceCodePro)' }} className="p-2 border rounded">
                            Source Code Pro: The quick brown fox jumps over the lazy dog
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};