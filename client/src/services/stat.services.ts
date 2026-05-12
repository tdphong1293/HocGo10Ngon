export const getUserTypingStats = async (accessToken: string) => {
    return await fetch('/api/stats', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
    })
}

export const getUserActiveWebtime = async (accessToken: string) => {
    return await fetch('/api/stats/webtime', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
    })
}

export const getUserKeyStats = async (accessToken: string) => {
    return await fetch('/api/stats/keys', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
    })
}

export const getUserFingerStats = async (accessToken: string) => {
    return await fetch('/api/stats/fingers', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
    })
}

export const getUserAttempts = async (accessToken: string) => {
    return await fetch('/api/stats/attempts', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
    })
}

export const getUserKeyTypeLatency = async (accessToken: string) => {
    return await fetch('/api/stats/keytypes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
    })
}

export const getUserTypingStatsByTime = async (accessToken: string) => {
    return await fetch('/api/stats/stat-time', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
    })
}