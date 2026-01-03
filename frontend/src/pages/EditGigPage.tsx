import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { getGig, updateGig } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

const VALUE_TO_AREA_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(AREA_KEY_TO_VALUE).map(([k, v]) => [v, k])
);

export default function EditGigPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    isActive: true,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== 'Employer') {
      navigate('/');
      return;
    }

    async function loadGig() {
      if (!id) return;
      try {
        const gig = await getGig(parseInt(id));

        if (gig.postedBy.id !== user?.id) {
          navigate('/my-gigs');
          return;
        }

        setFormData({
          title: gig.title,
          description: gig.description,
          company: gig.company,
          location: gig.location,
          isRemote: gig.isRemote,
          type: gig.type as typeof GIG_TYPE_KEYS[number],
          hourlyRate: gig.hourlyRate || '',
          duration: gig.duration || '',
          startDate: gig.startDate ? gig.startDate.split('T')[0] : '',
          skills: gig.skills.join(', '),
          competenceAreaKey: gig.competenceArea ? VALUE_TO_AREA_KEY[gig.competenceArea] || '' : '',
          isActive: gig.isActive,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error'));
      } finally {
        setIsLoading(false);
      }
    }
    loadGig();
  }, [id, user, navigate, t, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError('');
    setIsSaving(true);

    try {
      await updateGig(parseInt(id), {
        title: formData.title,
        description: formData.description,
        company: formData.company,
        location: formData.location,
        isRemote: formData.isRemote,
        type: formData.type,
        hourlyRate: formData.hourlyRate || undefined,
        duration: formData.duration || undefined,
        startDate: formData.startDate || new Date().toISOString(),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        competenceArea: formData.competenceAreaKey ? AREA_KEY_TO_VALUE[formData.competenceAreaKey] : undefined,
        isActive: formData.isActive,
      });
      navigate('/my-gigs');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
            <div className="h-12 bg-neutral-800 rounded"></div>
            <div className="h-12 bg-neutral-800 rounded"></div>
            <div className="h-32 bg-neutral-800 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">{t('editGig.title')}</h1>

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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-neutral-700 bg-black"
            />
            <label htmlFor="isActive" className="text-neutral-300 cursor-pointer">
              {t('editGig.active')}
            </label>
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
              disabled={isSaving}
            >
              {isSaving ? t('editGig.saving') : t('editGig.save')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
