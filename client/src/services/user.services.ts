import { Theme, Font } from '@/contexts/ThemeContext'

export const updatePreferredTheme = async (access_token: string, theme: Theme) => {
    return await fetch('/api/users/preferred-theme', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ theme }),
    })
}

export const updatePreferredFont = async (access_token: string, font: Font) => {
    return await fetch('/api/users/preferred-font', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ font }),
    })
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