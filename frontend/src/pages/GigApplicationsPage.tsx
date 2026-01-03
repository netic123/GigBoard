import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { getGig, getGigApplications, updateApplicationStatus, canReviewCandidate, createReview } from '../services/api';
import type { Gig, Application, CanReviewResponse } from '../types';

export default function GigApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [gig, setGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewStates, setReviewStates] = useState<Record<number, CanReviewResponse>>({});
  const [showReviewModal, setShowReviewModal] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [gigData, appsData] = await Promise.all([
          getGig(parseInt(id)),
          getGigApplications(parseInt(id)),
        ]);
        setGig(gigData);
        setApplications(appsData);

        // Check review status for accepted applications
        const acceptedApps = appsData.filter(a => a.status === 'Accepted');
        const reviewChecks = await Promise.all(
          acceptedApps.map(async (app) => {
            try {
              const result = await canReviewCandidate(app.applicant.id, parseInt(id));
              return { applicantId: app.applicant.id, result };
            } catch {
              return { applicantId: app.applicant.id, result: { canReview: false, hasAlreadyReviewed: false, message: 'Error' } };
            }
          })
        );

        const states: Record<number, CanReviewResponse> = {};
        reviewChecks.forEach(({ applicantId, result }) => {
          states[applicantId] = result;
        });
        setReviewStates(states);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleStatusChange = async (appId: number, status: Application['status']) => {
    try {
      const updated = await updateApplicationStatus(appId, status);
      setApplications(applications.map(a => a.id === appId ? updated : a));

      // If status changed to Accepted, check if can review
      if (status === 'Accepted' && id) {
        const app = applications.find(a => a.id === appId);
        if (app) {
          const result = await canReviewCandidate(app.applicant.id, parseInt(id));
          setReviewStates(prev => ({ ...prev, [app.applicant.id]: result }));
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSubmitReview = async (applicantId: number) => {
    if (!id) return;
    setIsSubmittingReview(true);
    try {
      await createReview({
        candidateId: applicantId,
        gigId: parseInt(id),
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      
      // Update review state
      setReviewStates(prev => ({
        ...prev,
        [applicantId]: { canReview: false, hasAlreadyReviewed: true, message: null }
      }));
      
      setShowReviewModal(null);
      setReviewRating(5);
      setReviewComment('');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    Reviewed: 'bg-blue-900/50 text-blue-400 border-blue-800',
    Accepted: 'bg-green-900/50 text-green-400 border-green-800',
    Rejected: 'bg-red-900/50 text-red-400 border-red-800',
  };

  const statusLabels: Record<string, string> = {
    Pending: t('applications.status.pending'),
    Reviewed: t('applications.status.reviewed'),
    Accepted: t('applications.status.accepted'),
    Rejected: t('applications.status.rejected'),
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-800 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-5">
                  <div className="h-6 bg-neutral-800 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-neutral-800 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link to="/my-gigs" className="text-neutral-500 hover:text-white transition-colors text-sm flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('applications.backToMyGigs')}
        </Link>

        <h1 className="text-3xl font-bold mb-2">{t('applications.title')}</h1>
        {gig && <p className="text-neutral-400 mb-8">{gig.title}</p>}

        {applications.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-neutral-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-400">{t('applications.noApplications')}</h3>
            <p className="text-neutral-500 mt-2">{t('applications.shareToGetMore')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Link to={`/candidate/${app.applicant.id}`}>
                      {app.applicant.profilePictureUrl ? (
                        <img
                          src={app.applicant.profilePictureUrl}
                          alt={app.applicant.fullName}
                          className="w-12 h-12 rounded-full hover:ring-2 hover:ring-white/50 transition-all"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center text-lg hover:ring-2 hover:ring-white/50 transition-all">
                          {app.applicant.fullName.charAt(0)}
                        </div>
                      )}
                    </Link>
                    
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link 
                          to={`/candidate/${app.applicant.id}`}
                          className="font-semibold text-lg hover:text-blue-400 transition-colors"
                        >
                          {app.applicant.fullName}
                        </Link>
                        {app.applicant.isActivelyLooking ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            {t('profile.available')}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-600/20 text-neutral-400 border border-neutral-600/30">
                            {t('profile.notAvailable')}
                          </span>
                        )}
                      </div>
                      {app.applicant.headline && (
                        <p className="text-neutral-400">{app.applicant.headline}</p>
                      )}
                      <p className="text-neutral-500 text-sm mt-1">{app.applicant.email}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        {app.applicant.linkedInProfileUrl && (
                          <a
                            href={app.applicant.linkedInProfileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#0077B5] hover:underline text-sm"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                          </a>
                        )}
                        
                        <Link 
                          to={`/candidate/${app.applicant.id}`}
                          className="inline-flex items-center gap-1 text-yellow-400 hover:text-yellow-300 text-sm"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {t('applications.viewReviews')}
                        </Link>
                      </div>
                      
                      {app.message && (
                        <div className="mt-4 p-3 bg-neutral-800/50 rounded-lg">
                          <p className="text-sm text-neutral-300">{app.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge border ${statusColors[app.status]}`}>
                      {statusLabels[app.status]}
                    </span>
                    
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as Application['status'])}
                      className="text-sm bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-300"
                    >
                      <option value="Pending">{t('applications.status.pending')}</option>
                      <option value="Reviewed">{t('applications.status.reviewed')}</option>
                      <option value="Accepted">{t('applications.status.accepted')}</option>
                      <option value="Rejected">{t('applications.status.rejected')}</option>
                    </select>
                    
                    <span className="text-xs text-neutral-500">
                      {new Date(app.appliedAt).toLocaleDateString('sv-SE')}
                    </span>
                    
                    {/* Review button - only for accepted applications */}
                    {app.status === 'Accepted' && reviewStates[app.applicant.id] && (
                      <div className="mt-2">
                        {reviewStates[app.applicant.id].canReview ? (
                          <button
                            onClick={() => setShowReviewModal(app.applicant.id)}
                            className="text-sm px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {t('reviews.leaveReview')}
                          </button>
                        ) : reviewStates[app.applicant.id].hasAlreadyReviewed ? (
                          <span className="text-sm text-emerald-400 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {t('reviews.alreadyReviewed')}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('reviews.writeReview')}</h2>
            
            {/* Star Rating */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-400 mb-2">{t('reviews.rating')}</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg 
                      className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400' : 'text-neutral-700'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm text-neutral-400 mb-2">{t('reviews.comment')} ({t('common.optional')})</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                rows={4}
                placeholder={t('reviews.commentPlaceholder')}
              />
            </div>

            {/* Info box */}
            <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('reviews.infoText')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(null);
                  setReviewRating(5);
                  setReviewComment('');
                }}
                className="flex-1 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleSubmitReview(showReviewModal)}
                disabled={isSubmittingReview}
                className="flex-1 px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {isSubmittingReview ? t('common.submitting') : t('reviews.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
