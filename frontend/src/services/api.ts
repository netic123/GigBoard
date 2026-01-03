import type { 
  AuthResponse, 
  Gig, 
  GigListResponse, 
  Application, 
  User,
  RegisterPersonalRequest,
  RegisterCompanyRequest,
  RegisterEmployerRequest,
  LinkedInAuthResponse,
  RegisterWithLinkedInRequest,
  CandidateReviewsSummary,
  CreateReviewRequest,
  Review,
  CanReviewResponse
} from '../types';

// Use environment variable for API URL in production, fallback to /api for local development
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

function getAuthHeader(): HeadersInit {
  const headers: HeadersInit = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ett fel uppstod' }));
    throw new Error(error.error || 'Ett fel uppstod');
  }
  return response.json();
}

// Auth - LinkedIn (returns either login or registration data)
export async function loginWithLinkedIn(code: string, redirectUri: string): Promise<LinkedInAuthResponse> {
  const response = await fetch(`${API_BASE}/auth/linkedin`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code, redirectUri }),
  });
  return handleResponse(response);
}

// Auth - Register with LinkedIn data
export async function registerWithLinkedIn(data: RegisterWithLinkedInRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register/linkedin`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// Auth - Register Personal Account
export async function registerPersonal(data: RegisterPersonalRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register/personal`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// Auth - Register Company Account
export async function registerCompany(data: RegisterCompanyRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register/company`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// Auth - Register Employer Account
export async function registerEmployer(data: RegisterEmployerRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register/employer`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// Auth - Login
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

// Auth - Get current user
export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// Auth - Update profile
export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// Gigs
export async function getGigs(params?: {
  search?: string;
  location?: string;
  competenceArea?: string;
  type?: string;
  isRemote?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<GigListResponse> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
  }
  
  const response = await fetch(`${API_BASE}/gigs?${searchParams}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function getGig(id: number): Promise<Gig> {
  const response = await fetch(`${API_BASE}/gigs/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function getMyGigs(): Promise<Gig[]> {
  const response = await fetch(`${API_BASE}/gigs/my`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createGig(data: Omit<Gig, 'id' | 'createdAt' | 'applicationCount' | 'postedBy' | 'isActive'>): Promise<Gig> {
  const response = await fetch(`${API_BASE}/gigs`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateGig(id: number, data: Partial<Gig>): Promise<Gig> {
  const response = await fetch(`${API_BASE}/gigs/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteGig(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/gigs/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete gig');
  }
}

// Applications
export async function applyToGig(gigId: number, message?: string): Promise<Application> {
  const response = await fetch(`${API_BASE}/applications/gig/${gigId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message }),
  });
  return handleResponse(response);
}

export async function getMyApplications(): Promise<Application[]> {
  const response = await fetch(`${API_BASE}/applications/my`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function checkIfApplied(gigId: number): Promise<{ hasApplied: boolean }> {
  const response = await fetch(`${API_BASE}/applications/check/${gigId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function getGigApplications(gigId: number): Promise<Application[]> {
  const response = await fetch(`${API_BASE}/applications/gig/${gigId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function updateApplicationStatus(id: number, status: Application['status']): Promise<Application> {
  const response = await fetch(`${API_BASE}/applications/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(status),
  });
  return handleResponse(response);
}

// Reviews
export async function getCandidateReviews(candidateId: number): Promise<CandidateReviewsSummary> {
  const response = await fetch(`${API_BASE}/reviews/candidate/${candidateId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function canReviewCandidate(candidateId: number, gigId: number): Promise<CanReviewResponse> {
  const response = await fetch(`${API_BASE}/reviews/can-review/${candidateId}/${gigId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createReview(data: CreateReviewRequest): Promise<Review> {
  const response = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// Upload image
export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload/image`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });
  return handleResponse(response);
}
