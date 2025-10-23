import { ApiResponse } from "@/lib/ApiResponse";
import { NextRequest } from 'next/server';

const API_URL = `http://${process.env.SERVER_HOST || 'localhost'}:${process.env.SERVER_PORT || '8080'}`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const data = await response.json();
            return ApiResponse.success(data);
        }  else {
            const errorData = await response.json();
            return ApiResponse.notFound(errorData.message);
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ApiResponse.error(errorMessage, 500);
    }
}