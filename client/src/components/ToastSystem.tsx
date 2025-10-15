'use client';

import React from 'react';

// Simple static demo component to showcase toast colors
export const ToastColorDemo: React.FC = () => {
    const toastTypes = [
        {
            type: 'success',
            title: 'Test completed!',
            message: 'Great job! You achieved 95% accuracy.',
            bgClass: 'bg-toast-success-bg',
            textClass: 'text-toast-success',
            borderClass: 'border-toast-success',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            ),
        },
        {
            type: 'error',
            title: 'Error occurred',
            message: 'Failed to save your progress. Please try again.',
            bgClass: 'bg-toast-error-bg',
            textClass: 'text-toast-error',
            borderClass: 'border-toast-error',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            ),
        },
        {
            type: 'warning',
            title: 'Low accuracy',
            message: 'Your accuracy dropped below 80%. Slow down!',
            bgClass: 'bg-toast-warning-bg',
            textClass: 'text-toast-warning',
            borderClass: 'border-toast-warning',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            ),
        },
        {
            type: 'info',
            title: 'New theme applied',
            message: 'Your theme has been successfully changed.',
            bgClass: 'bg-toast-info-bg',
            textClass: 'text-toast-info',
            borderClass: 'border-toast-info',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            ),
        },
    ];

    return (
        <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Toast Notification Colors</h3>
            <p className="text-muted-foreground mb-6">
                Static examples showing toast colors for different notification types:
            </p>

            <div className="space-y-4">
                {toastTypes.map((toast) => (
                    <div
                        key={toast.type}
                        className={`${toast.bgClass} ${toast.textClass} ${toast.borderClass} border rounded-lg p-4 shadow-sm`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                {toast.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium">{toast.title}</div>
                                <div className="text-sm opacity-90 mt-1">{toast.message}</div>
                            </div>
                            <div className="text-xs opacity-70 capitalize">{toast.type}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">Tailwind Color Utilities Available:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                    <div><code className="bg-background px-2 py-1 rounded text-xs">text-toast-success</code> - Success text color</div>
                    <div><code className="bg-background px-2 py-1 rounded text-xs">bg-toast-success-bg</code> - Success background</div>
                    <div><code className="bg-background px-2 py-1 rounded text-xs">border-toast-success</code> - Success border</div>
                    <div><code className="bg-background px-2 py-1 rounded text-xs">text-toast-error</code> - Error text color</div>
                    <div><code className="bg-background px-2 py-1 rounded text-xs">bg-toast-error-bg</code> - Error background</div>
                    <div><code className="bg-background px-2 py-1 rounded text-xs">text-toast-warning</code> - Warning text color</div>
                    <div><code className="bg-background px-2 py-1 rounded text-xs">text-toast-info</code> - Info text color</div>
                </div>
            </div>
        </div>
    );
};