import { useEffect, useState, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { loginState } from '@/state';
import { refreshUserData, checkAuthStatus, UserData } from './api-auth';
import { useRouter } from 'next/router';

export function useAuth() {
  const [login, setLogin] = useRecoilState(loginState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await refreshUserData();
      if (userData) {
        setLogin(userData);
        return userData;
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err: any) {
      console.error('Error refreshing user:', err);
      setError(err.message || 'Failed to refresh user data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setLogin]);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authStatus = await checkAuthStatus();
      
      if (authStatus.isAuthenticated && authStatus.user) {
        setLogin(authStatus.user);
        return authStatus.user;
      } else {
        if (authStatus.error === 'Workspace not setup') {
          router.push('/welcome');
        } else if (authStatus.error === 'Not logged in') {
          router.push('/login');
        } else {
          setError(authStatus.error || 'Authentication failed');
        }
        return null;
      }
    } catch (err: any) {
      console.error('Error checking auth:', err);
      setError(err.message || 'Authentication check failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setLogin, router]);

  // Auto-refresh user data when component mounts
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Refresh user data when window gains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (login.userId !== 1) { // Only refresh if we have a real user
        refreshUser();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [login.userId, refreshUser]);

  return {
    user: login,
    isLoading,
    error,
    refreshUser,
    checkAuth,
    isAuthenticated: login.userId !== 1 && login.username !== ''
  };
} 