import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AdminAuthProvider, useAdminAuth } from '../../contexts/AdminAuthContext';

function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, user, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/admin');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(identifier, password);
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Giris | Haber Sitesi Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600">Haber Admin</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Yonetim paneline giris yapin
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="identifier" className="form-label">
                  E-posta veya Kullanici Adi
                </label>
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="form-input"
                  placeholder="ornek@email.com"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Sifre
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="********"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Giris yapiliyor...
                  </span>
                ) : (
                  'Giris Yap'
                )}
              </button>
            </form>
          </div>

          {/* Back link */}
          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="/" className="text-primary-600 hover:underline">
              &larr; Ana sayfaya don
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <AdminAuthProvider>
      <LoginForm />
    </AdminAuthProvider>
  );
}
