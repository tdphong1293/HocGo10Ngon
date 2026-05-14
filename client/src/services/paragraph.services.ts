import { authFetch } from "@/lib/authFetch";

export const createParagraph = async (
    accessToken: string,
    data: any,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/paragraphs/create-paragraph',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        },
        { accessToken, onAccessToken, onFailed }
    )
}