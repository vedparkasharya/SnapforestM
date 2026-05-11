import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  message: string = "Success",
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string = "Something went wrong",
  status: number = 500,
  error?: string
) {
  return NextResponse.json(
    {
      success: false,
      message,
      error,
    },
    { status }
  );
}

export function validationError(message: string = "Validation failed", error?: string) {
  return errorResponse(message, 400, error);
}

export function unauthorizedError(message: string = "Unauthorized access") {
  return errorResponse(message, 401);
}

export function forbiddenError(message: string = "Forbidden access") {
  return errorResponse(message, 403);
}

export function notFoundError(message: string = "Resource not found") {
  return errorResponse(message, 404);
}
