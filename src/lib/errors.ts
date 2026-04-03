import axios, { AxiosError } from 'axios';

// Type guard to check if an unknown error is an AxiosError
export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

// Get error message from an unknown error object, with special handling for Axios errors
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as any;
    return data?.message || error.message || 'Terjadi kesalahan saat berkomunikasi dengan server';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Terjadi kesalahan yang tidak diketahui';
}

// Get HTTP status code from Axios error, returns null if not an Axios error or status code is unavailable
export function getErrorStatus(error: unknown): number | null {
  if (isAxiosError(error)) {
    return error.response?.status || null;
  }
  return null;
}
