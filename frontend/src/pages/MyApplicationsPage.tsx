import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { getMyApplications } from '../services/api';
import type { Application } from '../types';

export default function MyApplicationsPage() {
  const { t, i18n } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await getMyApplications();
        setApplications(data);
      } catch (error) {
        console.error('Failed to load applications:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadApplications();
  }, []);

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    Reviewed: 'bg-blue-900/50 text-blue-400 border-blue-800',
    Accepted: 'bg-green-900/50 text-green-400 border-green-800',
    Rejected: 'bg-red-900/50 text-red-400 border-red-800',
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      Pending: t('applications.status.pending'),
      Reviewed: t('applications.status.reviewed'),
      Accepted: t('applications.status.accepted'),
      Rejected: t('applications.status.rejected'),
    };
    return statusMap[status] || status;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">{t('myApplications.title')}</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-6 bg-neutral-800 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-neutral-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-400">{t('myApplications.noApplications')}</h3>
            <p className="text-neutral-500 mt-2">{t('errors.findGigDescription')}</p>
            <Link to="/" className="btn-primary mt-6 inline-flex">
              {t('errors.searchGigs')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Link
                key={app.id}
                to={`/gig/${app.gig.id}`}
                className="card p-5 block hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{app.gig.title}</h3>
                    <p className="text-neutral-400">{app.gig.company}</p>
                    <p className="text-neutral-500 text-sm mt-1">{app.gig.location}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge border ${statusColors[app.status]}`}>
                      {getStatusLabel(app.status)}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(app.appliedAt).toLocaleDateString(i18n.language === 'sv' ? 'sv-SE' : 'en-US')}
                    </span>
                  </div>
                </div>
                
                {app.message && (
                  <div className="mt-4 p-3 bg-neutral-800/50 rounded-lg">
                    <p className="text-sm text-neutral-400">
                      <span className="text-neutral-500">{t('common.yourMessage')}</span> {app.message}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

