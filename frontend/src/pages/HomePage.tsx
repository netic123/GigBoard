import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import GigCard from '../components/GigCard';
import SearchBar from '../components/SearchBar';
import { getGigs } from '../services/api';
import type { Gig } from '../types';

const COMPETENCE_AREA_KEYS = [
  'itTech',
  'management',
  'finance',
  'marketing',
  'hr',
  'legal',
  'construction',
  'healthcare',
];

// Map translation keys to actual area values (stored in backend)
const AREA_KEY_TO_VALUE: Record<string, string> = {
  'itTech': 'IT & Tech',
  'management': 'Management & Strategi',
  'finance': 'Ekonomi & Finans',
  'marketing': 'Marknadsföring',
  'hr': 'HR & Rekrytering',
  'legal': 'Juridik',
  'construction': 'Bygg & Teknik',
  'healthcare': 'Vård & Omsorg',
};

export default function HomePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAreaKey, setSelectedAreaKey] = useState(searchParams.get('competenceArea') || '');

  const search = searchParams.get('search') || '';

  useEffect(() => {
    async function loadGigs() {
      setIsLoading(true);
      try {
        const areaValue = selectedAreaKey ? AREA_KEY_TO_VALUE[selectedAreaKey] : undefined;
        const response = await getGigs({
          search: search || undefined,
          competenceArea: areaValue,
          pageSize: 50,
        });
        setGigs(response.gigs);
        setTotalCount(response.totalCount);
      } catch (error) {
        console.error('Failed to load gigs:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadGigs();
  }, [search, selectedAreaKey]);

  const handleSearch = (query: string) => {
    setSearchParams(prev => {
      if (query) {
        prev.set('search', query);
      } else {
        prev.delete('search');
      }
      return prev;
    });
  };

  const handleAreaChange = (areaKey: string) => {
    setSelectedAreaKey(areaKey);
    setSearchParams(prev => {
      if (areaKey) {
        prev.set('competenceArea', areaKey);
      } else {
        prev.delete('competenceArea');
      }
      return prev;
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-b from-neutral-900 to-black border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center">
            {t('home.title')}
          </h1>
          <p className="text-neutral-400 text-lg text-center mt-4 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
          
          <div className="max-w-2xl mx-auto mt-8">
            <SearchBar
              onSearch={handleSearch}
              placeholder={t('home.searchPlaceholder')}
              initialValue={search}
            />
          </div>
          
          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <button
              onClick={() => handleAreaChange('')}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedAreaKey === ''
                  ? 'bg-white text-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {t('home.filters.all')}
            </button>
            {COMPETENCE_AREA_KEYS.map((areaKey) => (
              <button
                key={areaKey}
                onClick={() => handleAreaChange(areaKey)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedAreaKey === areaKey
                    ? 'bg-white text-black'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {t(`home.filters.${areaKey}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Gig list */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {isLoading ? t('common.loading') : t('home.gigsCount', { count: totalCount })}
            {search && <span className="text-neutral-500 font-normal ml-2">{t('common.forSearch', { query: search })}</span>}
          </h2>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-6 bg-neutral-800 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-neutral-800 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-neutral-800 rounded w-20"></div>
                  <div className="h-6 bg-neutral-800 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-neutral-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-400">{t('home.noGigsFound')}</h3>
            <p className="text-neutral-500 mt-2">{t('home.noGigsHint')}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
