import { ApiResponse } from "@/lib/ApiResponse";
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers'

const API_URL = `http://${process.env.SERVER_HOST || 'localhost'}:${process.env.SERVER_PORT || '8080'}`;

export async function POST() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (!refreshToken) {
            return ApiResponse.success('Đăng xuất thành công');
        }

        const response = await fetch(`${API_URL}/api/v1/auth/signout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `refresh_token=${refreshToken}`,
            },
        });

        if (response.ok) {
            const { data, message } = await response.json();
            return ApiResponse.created(data, message);
        } else {
            const errorData = await response.json();
            return ApiResponse.error(errorData.message);
        }

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ApiResponse.error(errorMessage, 500);
    }
}