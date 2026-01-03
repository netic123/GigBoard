import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getMyGigs, deleteGig } from '../services/api';
import type { Gig } from '../types';

export default function MyGigsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'Employer') {
      navigate('/');
      return;
    }
    
    async function loadGigs() {
      try {
        const data = await getMyGigs();
        setGigs(data);
      } catch (error) {
        console.error('Failed to load gigs:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadGigs();
  }, [user, navigate]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('gig.confirmDelete'))) return;
    
    try {
      await deleteGig(id);
      setGigs(gigs.filter(g => g.id !== id));
    } catch (error) {
      console.error('Failed to delete gig:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'sv' ? 'sv-SE' : 'en-US');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{t('myGigs.title')}</h1>
          <Link to="/create-gig" className="btn-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('myGigs.createNew')}
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-6 bg-neutral-800 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-neutral-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-400">{t('myGigs.noGigs')}</h3>
            <p className="text-neutral-500 mt-2">{t('myGigs.noGigsDescription')}</p>
            <Link to="/create-gig" className="btn-primary mt-6 inline-flex">
              {t('myGigs.createNew')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {gigs.map((gig) => (
              <div key={gig.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{gig.title}</h3>
                      {!gig.isActive && (
                        <span className="badge bg-neutral-700 text-neutral-400">{t('myGigs.inactive')}</span>
                      )}
                    </div>
                    <p className="text-neutral-400 mt-1">{gig.location}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500">
                      <span>{gig.applicationCount} {t('gig.applications')}</span>
                      <span>{formatDate(gig.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/gig/${gig.id}/applications`}
                      className="btn-secondary text-sm py-2"
                    >
                      {t('gig.viewApplications')}
                    </Link>
                    <Link
                      to={`/edit-gig/${gig.id}`}
                      className="btn-secondary text-sm py-2"
                    >
                      {t('gig.edit')}
                    </Link>
                    <button
                      onClick={() => handleDelete(gig.id)}
                      className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
