

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  dates: string;
  description: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  dates: string;
}

export interface Resume {
  contactInfo: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: {
    programming: string[];
    technical: string[];
    languages: string[];
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  relevanceScore: number;
  visaSponsorship: boolean;
  experienceLevel: string;
}

export enum ApplicationStatus {
  Applied = 'Applied',
  Interviewing = 'Interviewing',
  Offer = 'Offer',
  Rejected = 'Rejected',
  Wishlist = 'Wishlist'
}

export interface Application {
  job: Job;
  status: ApplicationStatus;
  appliedDate: string;
  coverLetterSnippet?: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingSource;
}

export interface JobSearchFilters {
  country: string;
  isRemote: boolean;
  visaSponsorship: boolean;
  experienceLevel: string;
}