export const getAllLessons = async (accessToken: string) => {
    return await fetch('/api/lessons', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });
}

export const getLessonsByLanguageCode = async (accessToken: string, languageCode: string) => {
    return await fetch(`/api/lessons?languageCode=${languageCode}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });
}

export const getLessonsByLanguageAndTitle = async (accessToken: string, languageCode: string, searchTitle: string) => {
    return await fetch(`/api/lessons?languageCode=${languageCode}&searchTitle=${searchTitle}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });
}

export const getLessonLastOrder = async (accessToken: string) => {
    return await fetch('/api/lessons/last-order', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });
}

export const addLesson = async (accessToken: string, lessonData: any) => {
    return await fetch('/api/lessons', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(lessonData),
    });
}

export const updateLesson = async (accessToken: string, lessonid: string, lessonData: any) => {
    return await fetch(`/api/lessons/${lessonid}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(lessonData),
    });
}

export const getLessonById = async (accessToken: string, lessonid: string) => {
    return await fetch(`/api/lessons/${lessonid}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });
}

export const updateLessonOrder = async (accessToken: string, lessonid: string, newOrder: number) => {
    return await fetch(`/api/lessons/order`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ lessonid, newOrder }),
    });
}