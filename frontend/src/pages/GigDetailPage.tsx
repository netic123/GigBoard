import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getGig, applyToGig, checkIfApplied } from '../services/api';
import type { Gig } from '../types';

export default function GigDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState<Gig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [message, setMessage] = useState('');
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGig() {
      if (!id) return;
      try {
        const data = await getGig(parseInt(id));
        setGig(data);
        
        // Check if user has already applied (only if logged in)
        if (user) {
          try {
            const { hasApplied } = await checkIfApplied(parseInt(id));
            setApplied(hasApplied);
          } catch {
            // Ignore errors - user might not be authorized
          }
        }
      } catch {
        console.error('Failed to load gig');
      } finally {
        setIsLoading(false);
      }
    }
    loadGig();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/gig/${id}`);
      return;
    }

    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!id) return;
    setIsApplying(true);
    setError('');
    try {
      await applyToGig(parseInt(id), message);
      setApplied(true);
      setShowApplyModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-800 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-neutral-800 rounded w-1/2 mb-8"></div>
            <div className="h-40 bg-neutral-800 rounded mb-4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!gig) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-neutral-400">{t('home.noGigsFound')}</h1>
          <Link to="/" className="btn-primary mt-6 inline-flex">
            {t('gig.allGigs')}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <Link to="/" className="text-neutral-500 hover:text-white transition-colors text-sm flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('gig.allGigs')}
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{gig.title}</h1>
            <p className="text-xl text-neutral-400 mt-2">{gig.company}</p>
          </div>
          {gig.postedBy.profilePictureUrl ? (
            <img
              src={gig.postedBy.profilePictureUrl}
              alt={gig.company}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl font-bold text-white">
              {gig.company.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Contract Details - Key Information */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('gig.contractDetails')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hourly Rate */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">{t('gig.hourlyRate')}</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {gig.hourlyRate ? `${gig.hourlyRate}/h` : t('gig.negotiable')}
                </p>
              </div>
            </div>

            {/* Contract Type */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">{t('gig.contractType')}</p>
                <p className="text-lg font-semibold text-white">
                  {t(`gig.types.${gig.type}`)}
                  {gig.isRemote && <span className="text-cyan-400 ml-2">• {t('gig.remote')}</span>}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">{t('gig.duration')}</p>
                <p className="text-lg font-semibold text-white">
                  {gig.duration || t('gig.ongoing')}
                </p>
              </div>
            </div>

            {/* Start Date */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">{t('gig.startDate')}</p>
                <p className="text-lg font-semibold text-white">
                  {new Date(gig.startDate).toLocaleDateString(i18n.language === 'sv' ? 'sv-SE' : 'en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">{t('gig.location')}</p>
                <p className="text-lg font-semibold text-white">
                  {gig.location}
                  {gig.isRemote && <span className="text-cyan-400 text-sm ml-2">({t('gig.remoteAvailable')})</span>}
                </p>
              </div>
            </div>

            {/* Expires At (if set) */}
            {gig.expiresAt && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">{t('gig.applyBefore')}</p>
                  <p className="text-lg font-semibold text-yellow-400">
                    {new Date(gig.expiresAt).toLocaleDateString(i18n.language === 'sv' ? 'sv-SE' : 'en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Required Skills */}
        {gig.skills.length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {t('gig.requiredSkills')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {gig.skills.map((skill) => (
                <span key={skill} className="bg-neutral-800 text-neutral-200 px-4 py-2 rounded-lg text-sm font-medium border border-neutral-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">{t('gig.about')}</h3>
          <div className="prose prose-invert max-w-none">
            {gig.description.split('\n').map((paragraph, i) => (
              <p key={i} className="text-neutral-300 mb-3">{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Apply section */}
        <div className="card p-6">
          {applied ? (
            <div className="text-center py-4">
              <svg className="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-green-400">{t('apply.success')}</h3>
              <p className="text-neutral-400 mt-2">{t('apply.successDescription')}</p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">{t('gig.interested')}</h3>
              <p className="text-neutral-400 mb-4">
                {user 
                  ? t('gig.applyDescription')
                  : t('apply.loginDescription')}
              </p>
              <button onClick={handleApply} className="btn-primary">
                {user ? t('gig.applyNow') : t('auth.login')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="card max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">{t('apply.title')}</h2>
            <p className="text-neutral-400 mb-4">
              {t('apply.loginDescription')}
            </p>
            
            <div className="mb-4">
              <label className="label">{t('apply.message')}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('apply.messagePlaceholder')}
                rows={4}
                className="input resize-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowApplyModal(false)}
                className="btn-secondary"
                disabled={isApplying}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={submitApplication}
                className="btn-primary"
                disabled={isApplying}
              >
                {isApplying ? t('apply.submitting') : t('apply.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
