export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
  };
}

export function errorResponse(error: string): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error,
  };
}
