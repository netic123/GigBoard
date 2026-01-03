import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { registerPersonal, registerEmployer, registerWithLinkedIn } from '../services/api';
import type { LinkedInProfileData } from '../types';

type AccountType = 'personal' | 'employer';
type CandidateType = 'Freelance' | 'ConsultingFirm';

const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
const LINKEDIN_REDIRECT_URI = `${window.location.origin}/auth/linkedin/callback`;

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: authLogin } = useAuth();
  
  // Check if coming from LinkedIn
  const isLinkedInFlow = searchParams.get('linkedin') === 'true';
  const [linkedInData, setLinkedInData] = useState<LinkedInProfileData | null>(null);
  
  // Get initial type from URL or default to personal
  const initialType = (searchParams.get('type') as AccountType) || 'personal';
  const [accountType, setAccountType] = useState<AccountType>(initialType);
  const [candidateType, setCandidateType] = useState<CandidateType>('Freelance');
  
  const [step, setStep] = useState(isLinkedInFlow ? 2 : 1);
  
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
  
  // Load LinkedIn data from session storage
  useEffect(() => {
    if (isLinkedInFlow) {
      const storedData = sessionStorage.getItem('linkedInData');
      if (storedData) {
        const data: LinkedInProfileData = JSON.parse(storedData);
        setLinkedInData(data);
        setFormData(prev => ({
          ...prev,
          email: data.email || '',
          fullName: data.fullName || '',
        }));
        setAccountType('personal');
      } else {
        // No LinkedIn data, redirect to login
        navigate('/login');
      }
    }
  }, [isLinkedInFlow, navigate]);

  const handleLinkedInLogin = () => {
    if (!LINKEDIN_CLIENT_ID) {
      setError('LinkedIn integration is not configured');
      return;
    }
    
    const scope = 'openid profile email';
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('linkedin_state', state);
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
    
    window.location.href = authUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // LinkedIn flow - no password validation needed
    if (!linkedInData) {
      if (formData.password !== formData.confirmPassword) {
        setError(t('auth.passwordMismatch'));
        return;
      }

      if (formData.password.length < 6) {
        setError(t('auth.passwordTooShort'));
        return;
      }
    }

    setIsLoading(true);
    try {
      let response;
      
      if (linkedInData) {
        // LinkedIn registration - no password
        response = await registerWithLinkedIn({
          linkedInId: linkedInData.linkedInId,
          email: formData.email,
          fullName: formData.fullName,
          linkedInProfileUrl: linkedInData.profileUrl,
          profilePictureUrl: linkedInData.profilePictureUrl,
          phone: formData.phone || undefined,
          location: formData.location || undefined,
          headline: formData.headline || undefined,
          summary: formData.summary || undefined,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : undefined,
          yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
          companyName: candidateType === 'ConsultingFirm' ? formData.companyName : undefined,
          candidateType: candidateType,
        });
        
        // Clear LinkedIn data from session storage
        sessionStorage.removeItem('linkedInData');
      } else if (accountType === 'personal') {
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
        });
      }
      
      authLogin(response.token, response.user);
      
      if (accountType === 'employer') {
        navigate('/my-gigs');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
            {/* LinkedIn Option - for candidates */}
            <button
              onClick={handleLinkedInLogin}
              className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              {t('auth.continueWithLinkedIn')}
            </button>
            
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-neutral-800"></div>
              <span className="text-neutral-500 text-sm">{t('auth.orChooseAccountType')}</span>
              <div className="flex-1 h-px bg-neutral-800"></div>
            </div>

            {/* Account type selection */}
            <div className="space-y-3">
              {(['personal', 'employer'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setAccountType(type);
                    setStep(2);
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    accountType === type 
                      ? 'border-white bg-white/5' 
                      : 'border-neutral-800 hover:border-neutral-600'
                  }`}
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
            {!linkedInData && (
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
            )}

            {/* LinkedIn profile header */}
            {linkedInData && (
              <div className="bg-gradient-to-r from-[#0A66C2]/20 to-transparent border border-[#0A66C2]/30 rounded-lg p-4 mb-6 flex items-center gap-4">
                {linkedInData.profilePictureUrl ? (
                  <img 
                    src={linkedInData.profilePictureUrl} 
                    alt={linkedInData.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#0A66C2]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#0A66C2] flex items-center justify-center text-2xl font-bold">
                    {linkedInData.fullName?.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-medium text-lg">{linkedInData.fullName}</div>
                  <div className="text-sm text-neutral-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    {t('auth.linkedInConnected')}
                  </div>
                </div>
              </div>
            )}

            {!linkedInData && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
                <div className="font-medium">{t(`auth.accountTypes.${accountType}.title`)}</div>
                <div className="text-sm text-neutral-400">{t(`auth.accountTypes.${accountType}.description`)}</div>
              </div>
            )}

            {/* Candidate type selection - for LinkedIn flow */}
            {linkedInData && (
              <div className="space-y-3">
                <label className="label">{t('auth.candidateType')} *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCandidateType('Freelance')}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      candidateType === 'Freelance'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    <div className="font-medium">{t('auth.candidateTypes.freelance.title')}</div>
                    <div className="text-xs text-neutral-400 mt-1">{t('auth.candidateTypes.freelance.description')}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidateType('ConsultingFirm')}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      candidateType === 'ConsultingFirm'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    <div className="font-medium">{t('auth.candidateTypes.consultingFirm.title')}</div>
                    <div className="text-xs text-neutral-400 mt-1">{t('auth.candidateTypes.consultingFirm.description')}</div>
                  </button>
                </div>
              </div>
            )}

            {/* Company name for consulting firm */}
            {linkedInData && candidateType === 'ConsultingFirm' && (
              <div>
                <label className="label">{t('auth.consultingCompany')} *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="input"
                  placeholder="CGI, Capgemini, Knowit..."
                  required
                />
              </div>
            )}

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
                disabled={!!linkedInData}
              />
              {linkedInData && (
                <p className="text-xs text-neutral-500 mt-1">{t('auth.emailFromLinkedIn')}</p>
              )}
            </div>
            
            {/* Password fields - only for non-LinkedIn flow */}
            {!linkedInData && (
              <>
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
              </>
            )}

            {/* Company fields - for employer */}
            {accountType === 'employer' && !linkedInData && (
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

            {/* Location - for personal or LinkedIn */}
            {(accountType === 'personal' || linkedInData) && (
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

            {/* Profile fields - for personal or LinkedIn */}
            {(accountType === 'personal' || linkedInData) && (
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

            {/* Skills - for personal or LinkedIn */}
            {(accountType === 'personal' || linkedInData) && (
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
