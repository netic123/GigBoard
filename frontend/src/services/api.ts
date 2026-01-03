import type { 
  AuthResponse, 
  Gig, 
  GigListResponse, 
  Application, 
  User,
  RegisterPersonalRequest,
  RegisterCompanyRequest,
  RegisterEmployerRequest
} from '../types';

const API_BASE = '/api';

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ett fel uppstod' }));
    throw new Error(error.error || 'Ett fel uppstod');
  }
  return response.json();
}

// Auth - LinkedIn
export async function loginWithLinkedIn(code: string, redirectUri: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/linkedin`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code, redirectUri }),
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
