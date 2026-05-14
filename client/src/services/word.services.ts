import { authFetch } from "@/lib/authFetch";

export const addWords = async (
    accessToken: string,
    words: string[],
    languageid: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/words/add-words',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ words, languageid }),
        },
        { accessToken, onAccessToken, onFailed }
    );
}

export const deleteWords = async (
    accessToken: string,
    words: string[],
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/words/delete-words',
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ words }),
        },
        { accessToken, onAccessToken, onFailed }
    );
}       