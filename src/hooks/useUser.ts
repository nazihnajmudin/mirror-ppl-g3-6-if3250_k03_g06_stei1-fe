import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import type { ApiResponse, User } from '@/types/api.types';

/**
 * Custom hook to fetch and manage current user information
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await apiClient.get<ApiResponse<User>>('/auth/me');
        setUser(response.data.data || null);
        setError(null);
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Gagal mengambil data pengguna';
        setError(message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
