export const createParagraph = async (accessToken: string, data: any) => {
    return await fetch('/api/paragraphs/create-paragraph', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    })
}