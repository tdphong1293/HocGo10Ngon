import { ApiResponse } from "@/lib/ApiResponse";
import { NextRequest } from 'next/server';

const API_URL = `http://${process.env.SERVER_HOST || 'localhost'}:${process.env.SERVER_PORT || '8080'}`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const access_token = request.headers.get('Authorization')?.split(' ')[1];

        const response = await fetch(`${API_URL}/api/v1/paragraphs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(access_token && { 'Authorization': `Bearer ${access_token}` }),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        if (response.ok) {
            return ApiResponse.success(data);
        }
        else {
            return ApiResponse.error(data.message || 'Thêm đoạn văn bản không thành công', response.status);
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ApiResponse.error(errorMessage, 500);
    }
}