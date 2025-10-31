import { ApiResponse } from "@/lib/ApiResponse";
import { NextRequest } from "next/server";

const API_URL = `http://${process.env.SERVER_HOST || 'localhost'}:${process.env.SERVER_PORT || '8080'}`;

export async function GET(request: NextRequest) {
    try {
        const access_token = request.headers.get('Authorization')?.split(' ')[1];

        const response = await fetch(`${API_URL}/api/v1/users/mode`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(access_token && { 'Authorization': `Bearer ${access_token}` }),
            },
        });

        if (response.ok) {
            const data = await response.json();
            return ApiResponse.success(data);
        } else {
            const errorData = await response.json();
            return ApiResponse.error(errorData.message, response.status);
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ApiResponse.error(errorMessage, 500);
    }
}