import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to protect pages that require authentication
 * Redirects to login if no valid token is found
 */
export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');

    if (!token) {
      router.push('/login');
    }
  }, [router]);
}
