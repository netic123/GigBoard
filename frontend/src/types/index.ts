export type AccountType = 'Personal' | 'Company' | 'Employer';
export type UserRole = 'Candidate' | 'Employer' | 'Admin';

export interface User {
  id: number;
  email: string;
  fullName: string;
  profilePictureUrl?: string;
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  companyName?: string;
  companyWebsite?: string;
  linkedInProfileUrl?: string;
  skills: string[];
  yearsOfExperience?: number;
  accountType: AccountType;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Registration requests
export interface RegisterPersonalRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  skills?: string[];
  yearsOfExperience?: number;
}

export interface RegisterCompanyRequest {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  organizationNumber?: string;
  companyWebsite?: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
}

export interface RegisterEmployerRequest {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  organizationNumber?: string;
  companyWebsite?: string;
  phone?: string;
}

export interface Gig {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  isRemote: boolean;
  type: 'Contract' | 'Freelance' | 'PartTime' | 'FullTime';
  hourlyRate?: string;
  duration?: string;
  startDate: string;
  skills: string[];
  competenceArea?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  applicationCount: number;
  postedBy: {
    id: number;
    fullName: string;
    profilePictureUrl?: string;
  };
}

export interface GigListResponse {
  gigs: Gig[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface Application {
  id: number;
  message?: string;
  status: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
  appliedAt: string;
  applicant: {
    id: number;
    fullName: string;
    email: string;
    profilePictureUrl?: string;
    headline?: string;
    linkedInProfileUrl?: string;
    companyName?: string;
    accountType: AccountType;
  };
  gig: {
    id: number;
    title: string;
    company: string;
    location: string;
  };
}
