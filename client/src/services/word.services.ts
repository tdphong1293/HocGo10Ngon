export const addWords = async (accessToken: string, words: string[], languageid: string) => {
    return await fetch('/api/words/add-words', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ words, languageid }),
    });
}

export const deleteWords = async (accessToken: string, words: string[]) => {
    return await fetch('/api/words/delete-words', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ words }),
    });
}