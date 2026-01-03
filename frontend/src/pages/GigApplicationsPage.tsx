import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getGig, getGigApplications, updateApplicationStatus } from '../services/api';
import type { Gig, Application } from '../types';

export default function GigApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const [gig, setGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [gigData, appsData] = await Promise.all([
          getGig(parseInt(id)),
          getGigApplications(parseInt(id)),
        ]);
        setGig(gigData);
        setApplications(appsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleStatusChange = async (appId: number, status: Application['status']) => {
    try {
      const updated = await updateApplicationStatus(appId, status);
      setApplications(applications.map(a => a.id === appId ? updated : a));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    Reviewed: 'bg-blue-900/50 text-blue-400 border-blue-800',
    Accepted: 'bg-green-900/50 text-green-400 border-green-800',
    Rejected: 'bg-red-900/50 text-red-400 border-red-800',
  };

  const statusLabels: Record<string, string> = {
    Pending: 'Ny',
    Reviewed: 'Granskad',
    Accepted: 'Godkänd',
    Rejected: 'Avvisad',
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-800 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-5">
                  <div className="h-6 bg-neutral-800 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-neutral-800 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link to="/my-gigs" className="text-neutral-500 hover:text-white transition-colors text-sm flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Mina uppdrag
        </Link>

        <h1 className="text-3xl font-bold mb-2">Ansökningar</h1>
        {gig && <p className="text-neutral-400 mb-8">{gig.title}</p>}

        {applications.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-neutral-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-400">Inga ansökningar ännu</h3>
            <p className="text-neutral-500 mt-2">Dela ditt uppdrag för att få fler ansökningar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {app.applicant.profilePictureUrl ? (
                      <img
                        src={app.applicant.profilePictureUrl}
                        alt={app.applicant.fullName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center text-lg">
                        {app.applicant.fullName.charAt(0)}
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-lg">{app.applicant.fullName}</h3>
                      {app.applicant.headline && (
                        <p className="text-neutral-400">{app.applicant.headline}</p>
                      )}
                      <p className="text-neutral-500 text-sm mt-1">{app.applicant.email}</p>
                      
                      {app.applicant.linkedInProfileUrl && (
                        <a
                          href={app.applicant.linkedInProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#0077B5] hover:underline text-sm mt-2"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          Se LinkedIn-profil
                        </a>
                      )}
                      
                      {app.message && (
                        <div className="mt-4 p-3 bg-neutral-800/50 rounded-lg">
                          <p className="text-sm text-neutral-300">{app.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge border ${statusColors[app.status]}`}>
                      {statusLabels[app.status]}
                    </span>
                    
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as Application['status'])}
                      className="text-sm bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-300"
                    >
                      <option value="Pending">Ny</option>
                      <option value="Reviewed">Granskad</option>
                      <option value="Accepted">Godkänd</option>
                      <option value="Rejected">Avvisad</option>
                    </select>
                    
                    <span className="text-xs text-neutral-500">
                      {new Date(app.appliedAt).toLocaleDateString('sv-SE')}
                    </span>
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

