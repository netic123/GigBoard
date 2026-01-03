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

// LinkedIn profile data for pre-filling registration
export interface LinkedInProfileData {
  linkedInId: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  profileUrl?: string;
}

// LinkedIn auth response - can be existing user login or new user data
export interface LinkedInAuthResponse {
  isNewUser: boolean;
  token?: string;
  user?: User;
  linkedInData?: LinkedInProfileData;
}

// Registration with LinkedIn data (no password needed)
export interface RegisterWithLinkedInRequest {
  linkedInId: string;
  email: string;
  fullName: string;
  linkedInProfileUrl?: string;
  profilePictureUrl?: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  skills?: string[];
  yearsOfExperience?: number;
  companyName?: string;
  candidateType?: 'Freelance' | 'ConsultingFirm';
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
  profilePictureUrl?: string;
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
  profilePictureUrl?: string;
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
    isActivelyLooking: boolean;
    availability?: string;
  };
  gig: {
    id: number;
    title: string;
    company: string;
    location: string;
  };
}

// Review types
export interface ReviewerInfo {
  id: number;
  fullName: string;
  companyName?: string;
  profilePictureUrl?: string;
}

export interface GigInfo {
  id: number;
  title: string;
  companyName?: string;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: ReviewerInfo;
  gig?: GigInfo;
}

export interface CandidateReviewsSummary {
  candidateId: number;
  fullName: string;
  profilePictureUrl?: string;
  headline?: string;
  companyName?: string;
  candidateType?: 'Freelance' | 'ConsultingFirm';
  averageRating: number;
  totalReviews: number;
  completedGigsCount: number;
  reviews: Review[];
  // Extended profile info
  summary?: string;
  location?: string;
  skills: string[];
  yearsOfExperience?: number;
  linkedInProfileUrl?: string;
  // What they're looking for
  isActivelyLooking: boolean;
  lookingFor?: string;
  preferredGigTypes: string[];
  availability?: string;
}

export interface CreateReviewRequest {
  candidateId: number;
  gigId: number;
  rating: number;
  comment?: string;
}

export interface CanReviewResponse {
  canReview: boolean;
  hasAlreadyReviewed: boolean;
  message?: string;
}
