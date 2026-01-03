import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

export default function LoginPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login: authLogin, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/';

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await login(email, password);
      authLogin(response.token, response.user);

      // Redirect based on role
      if (response.user.role === 'Employer') {
        navigate('/my-gigs');
      } else {
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{t('auth.loginTitle')}</h1>
          <p className="text-neutral-400 mt-2">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Email login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="label">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>

        <p className="text-center text-neutral-500 mt-6">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-white hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </Layout>
  );
}
