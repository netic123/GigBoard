import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { getCandidateReviews } from '../services/api';
import type { CandidateReviewsSummary } from '../types';

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<CandidateReviewsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const result = await getCandidateReviews(parseInt(id));
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.failedToLoadProfile'));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className={`${starSize} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className={`${starSize} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`halfGradient-${rating}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#374151" />
              </linearGradient>
            </defs>
            <path fill={`url(#halfGradient-${rating})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className={`${starSize} text-neutral-700`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-neutral-800"></div>
              <div className="flex-1">
                <div className="h-8 bg-neutral-800 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-neutral-800 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">{t('common.error')}</h1>
          <p className="text-neutral-400">{error || t('reviews.candidateNotFound')}</p>
          <Link to="/leaderboard" className="btn-primary mt-6 inline-block">
            {t('leaderboard.title')}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Profile header */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-6">
            {data.profilePictureUrl ? (
              <img
                src={data.profilePictureUrl}
                alt={data.fullName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-neutral-700 flex items-center justify-center text-3xl font-bold">
                {data.fullName.charAt(0)}
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{data.fullName}</h1>
                {data.candidateType === 'ConsultingFirm' && data.companyName && (
                  <span className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {data.companyName}
                  </span>
                )}
                {data.candidateType === 'Freelance' && (
                  <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {t('profile.freelancer')}
                  </span>
                )}
                {data.isActivelyLooking && (
                  <span className="text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    {t('profile.activelyLooking')}
                  </span>
                )}
              </div>
              
              {data.headline && (
                <p className="text-neutral-400 mb-2">{data.headline}</p>
              )}
              
              {/* Location and experience */}
              <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                {data.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {data.location}
                  </span>
                )}
                {data.yearsOfExperience && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {data.yearsOfExperience} {t('profile.yearsExperience')}
                  </span>
                )}
                {data.linkedInProfileUrl && (
                  <a 
                    href={data.linkedInProfileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  {renderStars(data.averageRating, 'lg')}
                  <span className="text-lg font-semibold text-white">
                    {data.averageRating.toFixed(1)}
                  </span>
                  <span className="text-neutral-400">
                    ({data.totalReviews} {t('reviews.reviews')})
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-white">{data.completedGigsCount}</span>
                  <span className="text-neutral-400">{t('reviews.completedGigs')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What they're looking for */}
        {(data.lookingFor || (data.preferredGigTypes && data.preferredGigTypes.length > 0) || data.availability) && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('profile.lookingFor')}
            </h2>
            
            {data.lookingFor && (
              <p className="text-neutral-300 mb-4">{data.lookingFor}</p>
            )}
            
            <div className="flex flex-wrap gap-4">
              {data.preferredGigTypes && data.preferredGigTypes.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-500 mb-2">{t('profile.preferredTypes')}</p>
                  <div className="flex flex-wrap gap-2">
                    {data.preferredGigTypes.map((type, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20">
                        {t(`gig.types.${type}`) || type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {data.availability && (
                <div>
                  <p className="text-sm text-neutral-500 mb-2">{t('profile.availability')}</p>
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm border border-green-500/20">
                    {t(`profile.availabilityValues.${data.availability}`, data.availability)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills section */}
        {data.skills && data.skills.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {t('profile.skills')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 text-sm border border-neutral-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* About section */}
        {data.summary && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('profile.about')}
            </h2>
            <p className="text-neutral-300 whitespace-pre-wrap">{data.summary}</p>
          </div>
        )}

        {/* Reviews section */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {t('reviews.title')}
          </h2>

          {data.reviews.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-xl">
              <svg className="w-16 h-16 mx-auto text-neutral-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h3 className="text-lg font-semibold text-neutral-400">{t('reviews.noReviews')}</h3>
              <p className="text-neutral-500 mt-2">{t('reviews.noReviewsDescription')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.reviews.map((review) => (
                <div key={review.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {review.reviewer.profilePictureUrl ? (
                        <img
                          src={review.reviewer.profilePictureUrl}
                          alt={review.reviewer.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center font-semibold">
                          {review.reviewer.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{review.reviewer.fullName}</p>
                        {review.reviewer.companyName && (
                          <p className="text-sm text-neutral-400">{review.reviewer.companyName}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString(i18n.language === 'sv' ? 'sv-SE' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Gig context - shows what gig this review is for */}
                  {review.gig && (
                    <div className="mb-3 px-3 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                      <p className="text-xs text-neutral-500 mb-1">{t('reviews.forGig')}:</p>
                      <Link 
                        to={`/gig/${review.gig.id}`}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {review.gig.title}
                      </Link>
                    </div>
                  )}
                  
                  {review.comment && (
                    <p className="text-neutral-300">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

