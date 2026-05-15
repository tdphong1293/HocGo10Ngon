import { Theme, Font } from '@/contexts/ThemeContext'
import { TypingMode } from './session.services'
import { authFetch } from '@/lib/authFetch'

export const updatePreferredTheme = async (
    accessToken: string,
    theme: Theme,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/users/preferred-theme',
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ theme }),
        },
        { accessToken, onAccessToken, onFailed }
    )
}

export const updatePreferredFont = async (
    accessToken: string,
    font: Font,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/users/preferred-font',
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ font }),
        },
        { accessToken, onAccessToken, onFailed }
    )
}

export const sendOTP = async (email: string) => {
    return await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
}

export const verifyOTP = async (email: string, otp: string) => {
    return await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
    })
}

export const resetPassword = async (resetToken: string, otp: string, email: string, newPassword: string) => {
    return await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetToken, otp, email, newPassword }),
    })
}

export const changePassword = async (
    accessToken: string,
    currentPassword: string,
    newPassword: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/users/change-password',
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ currentPassword, newPassword }),
        },
        { accessToken, onAccessToken, onFailed }
    )
}


export const getUserSessionMode = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/users/get-session-mode',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        },
        { accessToken, onAccessToken, onFailed }
    )
}

export const updateUserSessionMode = async (
    accessToken: string,
    mode: TypingMode,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/users/update-session-mode',
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(mode),
        },
        { accessToken, onAccessToken, onFailed }
    )
}

export const getUserPreferences = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/users/preferences',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        },
        { accessToken, onAccessToken, onFailed }
    )
}