import { useCallback, useEffect, useState } from 'react';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setAuthData({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export default function useAuth() {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    setToken(getToken());
    setUser(getStoredUser());
  }, []);

  const login = useCallback((data) => {
    setAuthData(data);
    setToken(getToken());
    setUser(getStoredUser());
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    setToken('');
    setUser(null);
  }, []);

  return { token, user, login, logout };
}
