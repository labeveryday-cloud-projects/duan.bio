import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authConfig } from './authConfig';

const AuthContext = createContext(null);

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const parseIdToken = useCallback((idToken) => {
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      return { email: payload.email, name: payload.name || payload.email };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      const verifier = sessionStorage.getItem('pkce_verifier');
      if (verifier) {
        exchangeCode(code, verifier);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  async function exchangeCode(code, verifier) {
    try {
      const tokenUrl = `https://${authConfig.domain}/oauth2/token`;
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: authConfig.clientId,
        redirect_uri: authConfig.redirectUri,
        code,
        code_verifier: verifier,
      });

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.id_token);
        setUser(parseIdToken(data.id_token));
        sessionStorage.removeItem('pkce_verifier');
      }
    } catch (e) {
      console.error('Token exchange failed:', e);
    } finally {
      setLoading(false);
    }
  }

  const login = useCallback(async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    sessionStorage.setItem('pkce_verifier', verifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: authConfig.clientId,
      redirect_uri: authConfig.redirectUri,
      scope: authConfig.scopes.join(' '),
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });

    window.location.href = `https://${authConfig.domain}/oauth2/authorize?${params}`;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    const params = new URLSearchParams({
      client_id: authConfig.clientId,
      logout_uri: authConfig.logoutUri,
    });
    window.location.href = `https://${authConfig.domain}/logout?${params}`;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
