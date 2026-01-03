import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Gig } from '../types';

interface GigCardProps {
  gig: Gig;
}

export default function GigCard({ gig }: GigCardProps) {
  const { t } = useTranslation();
  
  const daysAgo = Math.floor(
    (Date.now() - new Date(gig.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getDaysAgoText = () => {
    if (daysAgo === 0) {
      return t('common.today');
    }
    return t('common.daysAgo', { count: daysAgo });
  };

  return (
    <Link
      to={`/gig/${gig.id}`}
      className="card p-5 block hover:border-neutral-700 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-white group-hover:text-neutral-200 transition-colors truncate">
            {gig.title}
          </h3>
          <p className="text-neutral-400 mt-1">{gig.company}</p>
        </div>
        
        {gig.postedBy.profilePictureUrl && (
          <img
            src={gig.postedBy.profilePictureUrl}
            alt={gig.company}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        )}
      </div>
      
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="badge-default">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {gig.location}
        </span>
        
        {gig.isRemote && (
          <span className="badge-remote">{t('gig.remote')}</span>
        )}
        
        <span className="badge-default">{t(`gig.types.${gig.type}`)}</span>
        
        {gig.hourlyRate && (
          <span className="badge-success">{gig.hourlyRate}</span>
        )}
      </div>
      
      {gig.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {gig.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="text-xs text-neutral-500 bg-neutral-800/50 px-2 py-1 rounded">
              {skill}
            </span>
          ))}
          {gig.skills.length > 4 && (
            <span className="text-xs text-neutral-600">+{gig.skills.length - 4}</span>
          )}
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-sm text-neutral-500">
        <span>{getDaysAgoText()}</span>
        {gig.duration && <span>{gig.duration}</span>}
      </div>
    </Link>
  );
}
