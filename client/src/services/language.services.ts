export const getAllLanguages = async () => {
    return await fetch('/api/languages/get-all-languages', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export const addLanguage = async (accessToken: string, languageName: string, languageCode: string) => {
    return await fetch('/api/languages/add-language', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ languageName, languageCode }),
    });
}
