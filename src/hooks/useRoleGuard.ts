import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './useUser';

type AllowedRoles = 'SUPER_ADMIN' | 'PIMPINAN' | 'KAPRODI' | 'TIM_PRODI';

/**
 * Custom hook to protect pages that require specific roles
 * Redirects to login if not authenticated or to home if role not allowed
 */
export function useRoleGuard(allowedRoles: AllowedRoles[]) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');

    // If no token, redirect to login
    if (!token) {
      router.push('/login');
      return;
    }

    // If user not loaded, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // If user role not in allowed roles, redirect to home
    if (!allowedRoles.includes(user.role)) {
      router.push('/');
    }
  }, [user, loading, router, allowedRoles]);
}
