import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { createGig } from '../services/api';

const GIG_TYPE_KEYS = ['Contract', 'Freelance', 'PartTime', 'FullTime'] as const;

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

export default function CreateGigPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    isRemote: false,
    type: 'Contract' as typeof GIG_TYPE_KEYS[number],
    hourlyRate: '',
    duration: '',
    startDate: '',
    skills: '',
    competenceAreaKey: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await createGig({
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        startDate: formData.startDate || new Date().toISOString(),
        hourlyRate: formData.hourlyRate || undefined,
        duration: formData.duration || undefined,
        competenceArea: formData.competenceAreaKey ? AREA_KEY_TO_VALUE[formData.competenceAreaKey] : undefined,
        expiresAt: undefined,
      });
      navigate('/my-gigs');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">{t('createGig.title')}</h1>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">{t('createGig.form.title')} *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('createGig.form.titlePlaceholder')}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">{t('createGig.form.company')} *</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder={t('createGig.form.companyPlaceholder')}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('createGig.form.location')} *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('createGig.form.locationPlaceholder')}
                className="input"
                required
              />
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRemote}
                  onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                  className="w-5 h-5 rounded border-neutral-700 bg-black"
                />
                <span className="text-neutral-300">{t('createGig.form.remote')}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('createGig.form.type')}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                className="input"
              >
                {GIG_TYPE_KEYS.map(type => (
                  <option key={type} value={type}>{t(`gig.types.${type}`)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label">{t('createGig.form.competenceArea')}</label>
              <select
                value={formData.competenceAreaKey}
                onChange={(e) => setFormData({ ...formData, competenceAreaKey: e.target.value })}
                className="input"
              >
                <option value="">{t('createGig.form.selectCompetenceArea')}</option>
                {COMPETENCE_AREA_KEYS.map(areaKey => (
                  <option key={areaKey} value={areaKey}>{t(`home.filters.${areaKey}`)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('createGig.form.hourlyRate')}</label>
              <input
                type="text"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder={t('createGig.form.hourlyRatePlaceholder')}
                className="input"
              />
            </div>
            
            <div>
              <label className="label">{t('createGig.form.duration')}</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder={t('createGig.form.durationPlaceholder')}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">{t('createGig.form.startDate')}</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">{t('createGig.form.skills')}</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder={t('createGig.form.skillsPlaceholder')}
              className="input"
            />
          </div>

          <div>
            <label className="label">{t('createGig.form.description')} *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('createGig.form.descriptionPlaceholder')}
              rows={8}
              className="input resize-none"
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate('/my-gigs')}
              className="btn-secondary"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? t('createGig.form.creating') : t('createGig.form.submit')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
