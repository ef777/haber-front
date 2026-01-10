import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';

const AdminAuthContext = createContext(undefined);

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Token'dan kullanici bilgilerini yukle
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('admin_jwt');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${STRAPI_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('admin_jwt');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('admin_jwt');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Giris yap
  const login = useCallback(async (identifier, password) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Giris basarisiz');
      }

      localStorage.setItem('admin_jwt', data.jwt);
      setUser(data.user);
      router.push('/admin');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Cikis yap
  const logout = useCallback(() => {
    localStorage.removeItem('admin_jwt');
    setUser(null);
    router.push('/admin/giris');
  }, [router]);

  // Auth token al
  const getToken = useCallback(() => {
    return localStorage.getItem('admin_jwt');
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, loading, error, login, logout, getToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

export default AdminAuthContext;
