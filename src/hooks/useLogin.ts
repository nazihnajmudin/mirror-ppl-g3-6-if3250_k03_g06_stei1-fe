import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { getErrorStatus, getErrorMessage } from '@/lib/errors';
import type { LoginInput } from '@/validators/auth.validator';
import { useAuth } from '@/contexts/AuthContext';

const TOKEN_STORAGE_KEY = 'access_token';

export const useLogin = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { fetchSession } = useAuth();

  const login = async (values: LoginInput, setError: any) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', values);
      const token = response.data?.data?.token || response.data?.token;

      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        
        await fetchSession(); 
        
        router.push('/');
      } else {
        throw new Error('Format response tidak sesuai (Token Missing).');
      }
    } catch (error: unknown) {
      const statusCode = getErrorStatus(error);
      const errorMessage = getErrorMessage(error);

      if (statusCode === 401 || statusCode === 400) {
        setError('root', { message: errorMessage || 'Email atau password salah.' });
      } else if (statusCode === 403) {
        setError('root', { message: 'Akun Anda tidak memiliki akses ke portal ini.' });
      } else {
        setError('root', { message: 'Gagal terhubung ke server. Silakan coba lagi.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
};