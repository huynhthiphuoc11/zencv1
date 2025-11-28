export interface Skill {
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  appliedDate: string;
  skills: string[];
  experiences: Experience[];
  matchScore: number;
  matchLevel: 'High' | 'Medium' | 'Low' | 'Potential';
  missingSkills: string[];
  matchedSkills: string[];
  explanation: string[];
  status: 'New' | 'Shortlisted' | 'Rejected' | 'Reviewed';
  resumeUrl?: string; // URL to the file (Blob URL for local uploads)
  fileType?: string; // MIME type of the file
  desiredSalary?: number; // monthly or annual expected salary
  remoteReady?: boolean; // willing to work remotely
}

export interface JobCriteria {
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  domain: string;
  seniority: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: 'Active' | 'Draft' | 'Closed';
  candidateCount: number;
  lastUpdated: string;
  description: string; // The raw description
  criteria: JobCriteria; // Structured criteria for matching
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system' | 'assistant';
  content: string;
  isThinking?: boolean;
}

export enum Page {
  LANDING = 'LANDING',
  WORKSPACE = 'WORKSPACE', // Replaces JobDetail/Dashboard as the main view
}

export interface User {
  name: string;
  avatar: string;
  company: string;
}