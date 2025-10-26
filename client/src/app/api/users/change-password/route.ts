import { ApiResponse } from "@/lib/ApiResponse";
import { NextRequest } from 'next/server';

const API_URL = `http://${process.env.SERVER_HOST || 'localhost'}:${process.env.SERVER_PORT || '8080'}`;

export async function PUT(request: NextRequest) {
    try {
        const access_token = request.headers.get('Authorization')?.split(' ')[1];
        const body = await request.json();

        const response = await fetch(`${API_URL}/api/v1/users/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(access_token && { 'Authorization': `Bearer ${access_token}` }),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log('Change Password Response:', data);
        if (response.ok) {
            return ApiResponse.success(data);
        } else {
            return ApiResponse.error(data.message || 'Đổi mật khẩu không thành công', response.status);
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ApiResponse.error(errorMessage, 500);
    }
}