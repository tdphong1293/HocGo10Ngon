type AuthFetchOptions = {
    accessToken?: string | null;
    onAccessToken?: (token: string | null) => void;
    onFailed?: () => void;
    retryOnUnauthorized?: boolean;
};


let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
    // Nếu đã có một lần gọi refresh đang diễn ra tránh miền găng gán access token nhiều lần
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                return null;
            }

            const payload = await response.json();
            return payload?.data?.access_token ?? null;
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

const withAuthHeader = (init: RequestInit | undefined, token: string | null) => {
    const headers = new Headers(init?.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return {
        ...init,
        headers,
    } satisfies RequestInit;
};

export const authFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: AuthFetchOptions,
) => {
    const { accessToken = null, onFailed, onAccessToken, retryOnUnauthorized = true } = options ?? {};

    const response = await fetch(input, withAuthHeader(init, accessToken));
    if (response.status !== 401 || !retryOnUnauthorized) {
        return response;
    }

    const newToken = await refreshAccessToken();
    if (!newToken) {
        // Nếu không thể refresh token, gọi callback onFailed nếu có và trả về response gốc
        onFailed?.();
        return response;
    }
    
    // Gọi callback onAccessToken với token mới và thử lại yêu cầu
    onAccessToken?.(newToken);
    return fetch(input, withAuthHeader(init, newToken));
};
