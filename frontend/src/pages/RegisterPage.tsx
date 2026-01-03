import { useState, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { registerPersonal, registerEmployer, uploadImage } from '../services/api';

type AccountType = 'personal' | 'employer';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: authLogin } = useAuth();

  // Get initial type from URL, or null if not specified
  const initialType = searchParams.get('type') as AccountType | null;
  const [accountType, setAccountType] = useState<AccountType | null>(initialType);

  const [step, setStep] = useState(1);

  // Form data for all types
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    location: '',
    headline: '',
    summary: '',
    companyName: '',
    organizationNumber: '',
    companyWebsite: '',
    skills: '',
    yearsOfExperience: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('auth.profilePictureTooLarge'));
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setIsLoading(true);
    try {
      // Upload profile picture if selected
      let profilePictureUrl: string | undefined;
      if (profilePicture) {
        const uploadResult = await uploadImage(profilePicture);
        profilePictureUrl = uploadResult.url;
      }

      let response;

      if (accountType === 'personal') {
        response = await registerPersonal({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone || undefined,
          location: formData.location || undefined,
          headline: formData.headline || undefined,
          summary: formData.summary || undefined,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : undefined,
          yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
          profilePictureUrl: profilePictureUrl,
        });
      } else {
        response = await registerEmployer({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          companyName: formData.companyName,
          organizationNumber: formData.organizationNumber || undefined,
          companyWebsite: formData.companyWebsite || undefined,
          phone: formData.phone || undefined,
          profilePictureUrl: profilePictureUrl,
        });
      }

      authLogin(response.token, response.user);

      if (accountType === 'employer') {
        navigate('/my-gigs');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{t('auth.registerTitle')}</h1>
          <p className="text-neutral-400 mt-2">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-neutral-400 text-center mb-4">{t('auth.chooseAccountType')}</p>

            {/* Account type selection */}
            <div className="space-y-3">
              {(['personal', 'employer'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setAccountType(type);
                    setStep(2);
                  }}
                  className="w-full text-left p-4 rounded-lg border border-neutral-800 hover:border-neutral-400 transition-all"
                >
                  <div className="font-medium">{t(`auth.accountTypes.${type}.title`)}</div>
                  <div className="text-sm text-neutral-400">{t(`auth.accountTypes.${type}.description`)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-neutral-400 hover:text-white flex items-center gap-2 mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('auth.back')}
            </button>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
              <div className="font-medium">{t(`auth.accountTypes.${accountType}.title`)}</div>
              <div className="text-sm text-neutral-400">{t(`auth.accountTypes.${accountType}.description`)}</div>
            </div>

            {/* Profile Picture Upload */}
            <div className="mb-6">
              <label className="label">{t('auth.profilePicture')}</label>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-dashed border-neutral-600 hover:border-neutral-400 flex items-center justify-center cursor-pointer overflow-hidden transition-colors"
                >
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-white hover:text-neutral-300 underline"
                  >
                    {profilePicturePreview ? t('auth.changePhoto') : t('auth.uploadPhoto')}
                  </button>
                  <p className="text-xs text-neutral-500 mt-1">{t('auth.profilePictureHint')}</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Basic info - all types */}
            <div>
              <label className="label">{t('auth.fullName')} *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">{t('auth.email')} *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">{t('auth.password')} *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="label">{t('auth.confirmPassword')} *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input"
                required
              />
            </div>

            {/* Company fields - for employer */}
            {accountType === 'employer' && (
              <>
                <div>
                  <label className="label">{t('auth.companyName')} *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">{t('auth.organizationNumber')}</label>
                  <input
                    type="text"
                    value={formData.organizationNumber}
                    onChange={(e) => setFormData({ ...formData, organizationNumber: e.target.value })}
                    className="input"
                    placeholder={t('auth.orgNumberPlaceholder')}
                  />
                </div>

                <div>
                  <label className="label">{t('auth.website')}</label>
                  <input
                    type="url"
                    value={formData.companyWebsite}
                    onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                    className="input"
                    placeholder={t('auth.websitePlaceholder')}
                  />
                </div>
              </>
            )}

            <div>
              <label className="label">{t('auth.phone')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
              />
            </div>

            {/* Location - for personal */}
            {accountType === 'personal' && (
              <div>
                <label className="label">{t('auth.location')}</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input"
                  placeholder={t('auth.locationPlaceholder')}
                />
              </div>
            )}

            {/* Profile fields - for personal */}
            {accountType === 'personal' && (
              <>
                <div>
                  <label className="label">{t('auth.headline')}</label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="input"
                    placeholder={t('auth.headlinePlaceholder')}
                  />
                </div>

                <div>
                  <label className="label">{t('auth.summary')}</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="input min-h-[100px]"
                    placeholder={t('auth.summaryPlaceholder')}
                  />
                </div>
              </>
            )}

            {/* Skills - for personal */}
            {accountType === 'personal' && (
              <>
                <div>
                  <label className="label">{t('auth.skills')}</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="input"
                    placeholder={t('auth.skillsPlaceholder')}
                  />
                </div>

                <div>
                  <label className="label">{t('auth.yearsOfExperience')}</label>
                  <input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    className="input"
                    min="0"
                    max="50"
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </button>
          </form>
        )}

        <p className="text-center text-neutral-500 mt-6">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-white hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </Layout>
  );
}
