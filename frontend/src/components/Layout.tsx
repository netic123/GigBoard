import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setShowLangMenu(false);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            GigBoard
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-neutral-400 hover:text-white transition-colors">
              {t('nav.gigs')}
            </Link>
            <Link to="/leaderboard" className="text-neutral-400 hover:text-white transition-colors">
              {t('nav.leaderboard')}
            </Link>
            
            {user ? (
              <>
                {user.role === 'Employer' && (
                  <Link to="/my-gigs" className="text-neutral-400 hover:text-white transition-colors">
                    {t('nav.myGigs')}
                  </Link>
                )}
                {user.role === 'Candidate' && (
                  <Link to="/my-applications" className="text-neutral-400 hover:text-white transition-colors">
                    {t('nav.myApplications')}
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-sm">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm text-neutral-300">{user.fullName}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-neutral-500 hover:text-white transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-secondary text-sm">
                {t('nav.login')}
              </Link>
            )}

            {/* Language Switcher */}
            <div className="relative inline-block">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>{t(`language.${i18n.language}`)}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-1 min-w-full bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl py-1 z-50">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                      i18n.language === 'en' ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {t('language.en')}
                  </button>
                  <button
                    onClick={() => changeLanguage('sv')}
                    className={`w-full text-left px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                      i18n.language === 'sv' ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {t('language.sv')}
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      
      {/* Main content */}
      <main>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-neutral-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <div>
              <span className="font-bold text-white">GigBoard</span>
              <span className="ml-2">{t('footer.copyright', { year: new Date().getFullYear() })}</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">{t('footer.about')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
