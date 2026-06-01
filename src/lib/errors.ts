import axios, { AxiosError } from 'axios';

export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    let data = error.response?.data as any;

    // Jika server tidak sengaja mengirimkan string JSON mentah
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return data;
      }
    }

    if (data && typeof data === 'object' && data.message) {
      return data.message;
    }
    
    return error.message || 'Terjadi kesalahan saat berkomunikasi dengan server';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Terjadi kesalahan yang tidak diketahui';
}

export function getErrorStatus(error: unknown): number | null {
  if (isAxiosError(error)) {
    return error.response?.status || null;
  }
  return null;
}