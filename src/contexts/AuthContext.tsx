import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';

const MOCK_USER: User = {
  id: 1,
  email: 'poc@local',
  full_name: 'POC User',
  role: 'doc_uploader',
  is_active: true,
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // POC: no auth - treat as authenticated when mock user is set
  const isAuthenticated = !!user;

  // POC: Initialize with mock user only (no API calls)
  useEffect(() => {
    setUser(MOCK_USER);
    setIsLoading(false);
  }, []);

  const login = async (_email: string, _password: string): Promise<User> => {
    setUser(MOCK_USER);
    localStorage.setItem('userRole', MOCK_USER.role);
    return MOCK_USER;
  };

  const logout = async (): Promise<void> => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
