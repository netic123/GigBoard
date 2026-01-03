import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getGig, applyToGig } from '../services/api';
import type { Gig } from '../types';

export default function GigDetailPage() {
  const { t } = useTranslation();
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
      } catch {
        console.error('Failed to load gig');
      } finally {
        setIsLoading(false);
      }
    }
    loadGig();
  }, [id]);

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
          {gig.postedBy.profilePictureUrl && (
            <img
              src={gig.postedBy.profilePictureUrl}
              alt={gig.company}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-8">
          <span className="badge-default text-base px-3 py-1">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {gig.location}
          </span>
          {gig.isRemote && <span className="badge-remote text-base px-3 py-1">{t('gig.remote')}</span>}
          <span className="badge-default text-base px-3 py-1">{t(`gig.types.${gig.type}`)}</span>
          {gig.hourlyRate && <span className="badge-success text-base px-3 py-1">{gig.hourlyRate}</span>}
          {gig.duration && <span className="badge-default text-base px-3 py-1">{gig.duration}</span>}
        </div>

        {/* Skills */}
        {gig.skills.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">{t('gig.skills')}</h3>
            <div className="flex flex-wrap gap-2">
              {gig.skills.map((skill) => (
                <span key={skill} className="bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-md text-sm">
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
              <button onClick={handleApply} className={user ? 'btn-primary' : 'btn-linkedin'}>
                {user ? (
                  t('gig.applyNow')
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    {t('auth.continueWithLinkedIn')}
                  </>
                )}
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
