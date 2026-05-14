import { authFetch } from "@/lib/authFetch";

export const getAllLanguages = async () => {
    return await fetch('/api/languages/get-all-languages', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export const addLanguage = async (
    accessToken: string,
    languageName: string,
    languageCode: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/languages/add-language',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ languageName, languageCode }),
        },
        { accessToken, onAccessToken, onFailed }
    );
}
