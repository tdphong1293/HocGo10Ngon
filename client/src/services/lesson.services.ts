import { authFetch } from '@/lib/authFetch';

export const getAllLessons = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/lessons',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        { accessToken, onAccessToken, onFailed }
    );
}

export const getLessonsByLanguageCode = async (
    accessToken: string, 
    languageCode: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        `/api/lessons?languageCode=${languageCode}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        { accessToken, onAccessToken, onFailed }
    );
}


export const getLessonsByLanguageAndTitle = async (
    accessToken: string, 
    languageCode: string, 
    searchTitle: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        `/api/lessons?languageCode=${languageCode}&searchTitle=${searchTitle}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        { accessToken, onAccessToken, onFailed }
    );
}

export const getLessonLastOrder = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/lessons/last-order',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        { accessToken, onAccessToken, onFailed }
    );
}

export const addLesson = async (
    accessToken: string,
    lessonData: any,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        '/api/lessons',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(lessonData)
        },
        { accessToken, onAccessToken, onFailed }
    );
}

export const updateLesson = async (
    accessToken: string,
    lessonid: string,
    lessonData: any,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        `/api/lessons/${lessonid}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(lessonData),
        },
        { accessToken, onAccessToken, onFailed }
    );
}

export const getLessonById = async (
    accessToken: string,
    lessonid: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        `/api/lessons/${lessonid}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        { accessToken, onAccessToken, onFailed }
    );
}

export const updateLessonOrder = async (
    accessToken: string,
    lessonid: string,
    newOrder: number,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        `/api/lessons/order`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lessonid, newOrder }),
        },
        { accessToken, onAccessToken, onFailed }
    );
}

export const getUserLesson = async (
    accessToken: string,
    onAccessToken?: (token: string | null) => void,
    onFailed?: (text?: string) => Promise<void>
) => {
    return await authFetch(
        `/api/lessons/user`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        { accessToken, onAccessToken, onFailed }
    );
}