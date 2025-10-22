import { ApiResponse } from "@/lib/ApiResponse";
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers'

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (!refreshToken) {
            return ApiResponse.unauthorized('Không tìm thấy Refresh token');
        }

        const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `refresh_token=${refreshToken}`,
            },
        });

        if (response.ok) {
            const { access_token } = await response.json();

            // Return just the access token (refresh token stays the same)
            return ApiResponse.created(access_token);
        } else {
            const errorData = await response.json();
            return ApiResponse.unauthorized(errorData.message);
        }

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ApiResponse.error(errorMessage, 500);
    }
}