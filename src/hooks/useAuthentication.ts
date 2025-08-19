import { useState, useEffect } from 'react';
import { oauthManager, UserInfo, AuthState } from '@/utils/oauth';
import { PlatformDetectionState } from '@/hooks/usePlatformDetection';

export interface AuthenticationState {
  status: AuthState;
  userInfo: UserInfo | null;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

export function useAuthentication(platformState: PlatformDetectionState): AuthenticationState {
  const [authStatus, setAuthStatus] = useState<AuthState>('unauthenticated');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check authentication status when extension becomes available
  useEffect(() => {
    if (
      (platformState.status === 'detected' || platformState.status === 'setup') &&
      platformState.client
    ) {
      checkExistingAuth();
    }
  }, [platformState.status, platformState.client]);

  const checkExistingAuth = async () => {
    if (oauthManager.isAuthenticated()) {
      const storedUserInfo = oauthManager.getUserInfo();
      if (storedUserInfo) {
        setUserInfo(storedUserInfo);
        setAuthStatus('authenticated');
      } else {
        await fetchUserInfo();
      }
    }
  };

  const fetchUserInfo = async () => {
    if (!platformState.client) return;

    try {
      setAuthStatus('authenticating');
      const userInfo = await oauthManager.fetchUserInfo(platformState.client);
      setUserInfo(userInfo);
      setAuthStatus('authenticated');
      setAuthError(null);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      setAuthError(error instanceof Error ? error.message : String(error));
      setAuthStatus('error');
      oauthManager.logout();
    }
  };

  const login = async () => {
    if (!platformState.client) {
      setAuthError(
        'Extension not available. Please ensure the Bodhi browser extension is installed and enabled.'
      );
      return;
    }

    try {
      setAuthStatus('authenticating');
      setAuthError(null);

      await oauthManager.requestResourceAccess(platformState.client);
      const authUrl = await oauthManager.buildAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(error instanceof Error ? error.message : String(error));
      setAuthStatus('error');
    }
  };

  const logout = () => {
    oauthManager.logout();
    setUserInfo(null);
    setAuthStatus('unauthenticated');
    setAuthError(null);
  };

  return {
    status: authStatus,
    userInfo,
    error: authError,
    login,
    logout,
  };
}
