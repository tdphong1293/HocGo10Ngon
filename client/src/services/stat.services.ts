import { authFetch } from '@/lib/authFetch';

export const getUserTypingStats = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/stats',
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

export const getUserActiveWebtime = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/stats/webtime',
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


export const getUserKeyStats = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/stats/keys',
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

export const getUserFingerStats = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/stats/fingers',
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

export const getUserAttempts = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/stats/attempts',
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

export const getUserKeyTypeLatency = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/stats/keytypes',
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

export const getUserTypingStatsByTime = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/stats/stat-time',
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
