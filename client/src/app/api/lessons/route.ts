import { ApiResponse } from "@/lib/ApiResponse";
import { NextRequest } from "next/server";

const API_URL = `http://${process.env.SERVER_HOST || 'localhost'}:${process.env.SERVER_PORT || '8080'}`;

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const languageCode = searchParams.get('languageCode');
    const searchTitle = searchParams.get('searchTitle');
    const validLanguageCode = languageCode && languageCode !== 'null' && languageCode !== 'undefined';
    const validSearchTitle = searchTitle && searchTitle !== 'null' && searchTitle !== 'undefined';

    try {
        const access_token = request.headers.get('Authorization')?.split(' ')[1];

        let url = `${API_URL}/api/v1/lessons`;
        if (validLanguageCode && validSearchTitle) {
            url += `?languageCode=${languageCode}&searchTitle=${searchTitle}`;
        }
        else if (validLanguageCode) {
            url += `?languageCode=${languageCode}`;
        }
        else if (validSearchTitle) {
            url += `?searchTitle=${searchTitle}`;
        }
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(access_token && { 'Authorization': `Bearer ${access_token}` }),
            },
        });

        if (response.ok) {
            const data = await response.json();
            return ApiResponse.success(data);
        }
        else if (response.status === 401) {
            return ApiResponse.unauthorized('Người dùng phải đăng nhập để thực hiện hành động này');
        }
        else {
            const errorData = await response.json();
            return ApiResponse.error(errorData.message, response.status);
        }
    }
    catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ApiResponse.error(errorMessage, 500);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const access_token = request.headers.get('Authorization')?.split(' ')[1];

        const response = await fetch(`${API_URL}/api/v1/lessons`, {
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
        else if (response.status === 401) {
            return ApiResponse.unauthorized('Người dùng phải đăng nhập để thực hiện hành động này');
        }
        else if (response.status === 403) {
            return ApiResponse.forbidden('Người dùng không có quyền thực hiện hành động này');
        }
        else {
            return ApiResponse.error(data.message || 'Thêm bài học không thành công', response.status);
        }
    }
    catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ApiResponse.error(errorMessage, 500);
    }
}