import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';

interface LeaderboardEntry {
  userId: number;
  fullName: string;
  profilePictureUrl?: string;
  headline?: string;
  companyName?: string;
  candidateType: 'Freelance' | 'ConsultingFirm';
  completedGigsCount: number;
  averageRating: number;
  totalReviews: number;
  topSkills: string[];
  isActivelyLooking: boolean;
  availability?: string;
}

interface LeaderboardResponse {
  topCandidates: LeaderboardEntry[];
  totalCandidates: number;
}

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/leaderboard?limit=50');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="halfGradient">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#374151" />
              </linearGradient>
            </defs>
            <path fill="url(#halfGradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-neutral-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1.5 text-sm text-neutral-400">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('leaderboard.title')}</h1>
          <p className="text-neutral-400">{t('leaderboard.subtitle')}</p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-400">{t('common.loading')}</p>
          </div>
        )}

        {/* Leaderboard list */}
        {!isLoading && data && (
          <div className="space-y-4">
            {data.topCandidates.map((candidate, index) => (
              <Link
                to={`/candidate/${candidate.userId}`}
                key={candidate.userId}
                className={`block bg-neutral-900 border rounded-xl p-5 transition-all hover:border-neutral-600 cursor-pointer ${
                  index === 0 ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-transparent' :
                  index === 1 ? 'border-neutral-400/50 bg-gradient-to-r from-neutral-400/10 to-transparent' :
                  index === 2 ? 'border-amber-600/50 bg-gradient-to-r from-amber-600/10 to-transparent' :
                  'border-neutral-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="text-2xl font-bold min-w-[40px] text-center">
                    {getMedalEmoji(index)}
                  </div>

                  {/* Profile picture */}
                  {candidate.profilePictureUrl ? (
                    <img
                      src={candidate.profilePictureUrl}
                      alt={candidate.fullName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-neutral-700 flex items-center justify-center text-xl font-bold">
                      {candidate.fullName.charAt(0)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-lg truncate">{candidate.fullName}</h3>
                      {candidate.candidateType === 'ConsultingFirm' && candidate.companyName && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {candidate.companyName}
                        </span>
                      )}
                      {candidate.candidateType === 'Freelance' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Freelance
                        </span>
                      )}
                      {candidate.isActivelyLooking ? (
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
                    
                    {candidate.headline && (
                      <p className="text-sm text-neutral-400 mb-2">{candidate.headline}</p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">
                          <span className="font-semibold text-white">{candidate.completedGigsCount}</span>
                          <span className="text-neutral-400"> {t('leaderboard.completedGigs')}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {renderStars(candidate.averageRating)}
                        <span className="text-sm text-neutral-400">
                          ({candidate.totalReviews} {t('leaderboard.reviews')})
                        </span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.topSkills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && data && data.topCandidates.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <p>{t('leaderboard.noCandidates')}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
