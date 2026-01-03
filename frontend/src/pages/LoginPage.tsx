import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { login, loginWithLinkedIn } from '../services/api';

const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID || '';
const LINKEDIN_REDIRECT_URI = `${window.location.origin}/auth/linkedin/callback`;

export default function LoginPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login: authLogin, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Prevent double token exchange (React StrictMode issue)
  const tokenExchangeAttempted = useRef(false);

  const redirectTo = searchParams.get('redirect') || '/';
  const code = searchParams.get('code');
  
  // Check if this is LinkedIn callback
  const isLinkedInCallback = location.pathname === '/auth/linkedin/callback';

  // Handle LinkedIn callback
  useEffect(() => {
    async function handleLinkedInCallback() {
      // Prevent duplicate calls (StrictMode causes useEffect to run twice)
      if (code && isLinkedInCallback && !tokenExchangeAttempted.current) {
        tokenExchangeAttempted.current = true;
        setIsLoading(true);
        try {
          const response = await loginWithLinkedIn(code, LINKEDIN_REDIRECT_URI);
          
          if (response.isNewUser && response.linkedInData) {
            // New user - store LinkedIn data and redirect to registration
            sessionStorage.setItem('linkedInData', JSON.stringify(response.linkedInData));
            navigate('/register?linkedin=true');
          } else if (response.token && response.user) {
            // Existing user - log them in
            authLogin(response.token, response.user);
            
            // Redirect based on role
            if (response.user.role === 'Employer') {
              navigate('/my-gigs');
            } else {
              navigate(redirectTo);
            }
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : t('errors.linkedInLoginFailed'));
          navigate('/login');
        } finally {
          setIsLoading(false);
        }
      }
    }
    handleLinkedInCallback();
  }, [code, isLinkedInCallback, authLogin, navigate, redirectTo]);

  // If already logged in, redirect
  useEffect(() => {
    if (user && !isLinkedInCallback) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo, isLinkedInCallback]);

  const handleLinkedInLogin = () => {
    if (!LINKEDIN_CLIENT_ID) {
      setError(t('errors.linkedInNotConfigured'));
      return;
    }
    
    const scope = 'openid profile email';
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('linkedin_state', state);
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
    
    window.location.href = authUrl;
  };

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

  if (isLoading && isLinkedInCallback) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-400">{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

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

        {/* LinkedIn login */}
        <button
          onClick={handleLinkedInLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          {t('auth.continueWithLinkedIn')}
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-neutral-800"></div>
          <span className="text-neutral-500 text-sm">{t('common.or')}</span>
          <div className="flex-1 h-px bg-neutral-800"></div>
        </div>

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
