export const getSessionModes = async () => {
    return await fetch('/api/sessions/modes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

interface TypingMode {
    modeName: string;
    config: { [key: string]: any };
    subConfig?: { [key: string]: any };
}

export const getPracticeTypingText = async (mode: TypingMode) => {
    return await fetch('/api/sessions/practice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(mode),
    })
}