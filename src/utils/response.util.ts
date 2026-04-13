import { ApiSuccessResponse, ApiErrorResponse } from "../types/genderize.types";

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    status: "success",
    data,
  };
}

export function errorResponse(message: string): ApiErrorResponse {
  return {
    status: "error",
    message,
  };
}
