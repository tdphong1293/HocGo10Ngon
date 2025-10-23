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