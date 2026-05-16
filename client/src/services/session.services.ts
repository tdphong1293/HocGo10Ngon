import { authFetch } from "@/lib/authFetch";

export const getSessionModes = async () => {
    return await fetch('/api/sessions/modes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

export interface TypingMode {
    modeName: string;
    config: { [key: string]: any };
    subConfig?: { [key: string]: any };
}

export const getTypingText = async (languageCode: string, mode: TypingMode) => {
    return await fetch('/api/sessions/text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ languageCode, mode }),
    })
}

export const storeTypingSessionResult = async (
    accessToken: string,
    data: any,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/sessions/store',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        },
        { accessToken, onAccessToken, onFailed }
    );
}