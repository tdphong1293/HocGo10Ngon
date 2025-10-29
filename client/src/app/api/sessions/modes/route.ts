import { ApiResponse } from "@/lib/ApiResponse";

const API_URL = `http://${process.env.SERVER_HOST || 'localhost'}:${process.env.SERVER_PORT || '8080'}`;

export async function GET() {
    try {
        const response = await fetch(`${API_URL}/api/v1/sessions/modes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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