import { ApiResponse } from "@/lib/ApiResponse";
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers'

const API_URL = `http://${process.env.SERVER_HOST || 'localhost'}:${process.env.SERVER_PORT || '8080'}`;

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const headers: Record<string, string> = {};
        const body = await request.json();

        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (refreshToken) {
            headers['Cookie'] = `refresh_token=${refreshToken}`;
        }

        const response = await fetch(`${API_URL}/api/v1/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const data = await response.json();
            const cookieHeader = response.headers.get('set-cookie');

            const nextResponse = ApiResponse.created(data.data, data.message);

            if (cookieHeader) {
                nextResponse.headers.set('Set-Cookie', cookieHeader);
            }

            return nextResponse;

        } else {
            const errorData = await response.json();
            return ApiResponse.unauthorized(errorData.message);
        }

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ApiResponse.error(errorMessage, 500);
    }
}