"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/api-client';
import type { User, ApiResponse } from '@/types/api.types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  fetchSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  fetchSession: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchSession = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        return;
      }
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      setUser(response.data.data || null);
    } catch (error) {
      console.error('Sesi kedaluwarsa atau tidak valid:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Eksekusi pengambilan data pertama kali saat aplikasi dibuka
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Global Route Guard
  useEffect(() => {
    const isPublicRoute = pathname.startsWith('/login');
    
    // Jika sudah selesai loading, tapi tidak ada user, dan sedang tidak di halaman login -> tendang!
    if (!loading && !user && !isPublicRoute) {
      router.push('/login');
    }
    
    // Jika sudah login tapi iseng buka halaman login -> tendang ke dashboard!
    if (!loading && user && isPublicRoute) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const logout = useCallback(async () => {
    // Bersihkan state klien seketika untuk mencegah lag dan loop rerouting
    localStorage.removeItem('access_token');
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.href = '/login';

    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Gagal memanggil API logout backend:', error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, fetchSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook kustom agar komponen lain bisa memanggil AuthContext
export const useAuth = () => useContext(AuthContext);

// Alias
export const useUser = useAuth;