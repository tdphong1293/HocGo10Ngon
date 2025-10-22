import { NextResponse } from 'next/server';

export class ApiResponse {
    static success(data: unknown, message = HttpMessages[HttpStatus.OK]) {
        return NextResponse.json({
            message,
            data
        }, { status: HttpStatus.OK });
    }

    static error(message = HttpMessages[HttpStatus.INTERNAL_SERVER_ERROR], statusCode = HttpStatus.INTERNAL_SERVER_ERROR) {
        return NextResponse.json({
            message
        }, { status: statusCode });
    }

    static notFound(message = HttpMessages[HttpStatus.NOT_FOUND]) {
        return NextResponse.json({
            message
        }, { status: HttpStatus.NOT_FOUND });
    }

    static unauthorized(message = HttpMessages[HttpStatus.UNAUTHORIZED]) {
        return NextResponse.json({
            message
        }, { status: HttpStatus.UNAUTHORIZED });
    }

    static badRequest(message = HttpMessages[HttpStatus.BAD_REQUEST]) {
        return NextResponse.json({
            message
        }, { status: HttpStatus.BAD_REQUEST });
    }

    static conflict(message = HttpMessages[HttpStatus.CONFLICT]) {
        return NextResponse.json({
            message
        }, { status: HttpStatus.CONFLICT });
    }

    static forbidden(message = HttpMessages[HttpStatus.FORBIDDEN]) {
        return NextResponse.json({
            message
        }, { status: HttpStatus.FORBIDDEN });
    }

    static created(data: unknown, message = HttpMessages[HttpStatus.CREATED]) {
        return NextResponse.json({
            message,
            data
        }, { status: HttpStatus.CREATED });
    }
}

const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

const HttpMessages = {
    [HttpStatus.OK]: 'OK',
    [HttpStatus.CREATED]: 'Created',
    [HttpStatus.NO_CONTENT]: 'No Content',
    [HttpStatus.BAD_REQUEST]: 'Bad Request',
    [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
    [HttpStatus.FORBIDDEN]: 'Forbidden',
    [HttpStatus.NOT_FOUND]: 'Not Found',
    [HttpStatus.CONFLICT]: 'Conflict occurred',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};