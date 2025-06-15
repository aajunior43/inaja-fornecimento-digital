
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// Senha padrão para desenvolvimento - em produção, isso deveria vir de um backend seguro
const ADMIN_PASSWORD = 'Jr19991020.';
const AUTH_KEY = 'admin_authenticated';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se existe sessão salva
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
