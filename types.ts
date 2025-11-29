export interface Lead {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  socials?: string[]; // New field for social media links
  rating: number;
  reviewCount: number;
  status: 'New' | 'Contacted' | 'Qualified' | 'Closed';
  mapUrl?: string;
  isSaved?: boolean; // Track if saved to "My Leads"
}

export interface Task {
  id: string;
  leadId?: string;
  leadName?: string;
  title: string;
  dueDate: string;
  priority: 'High' | 'Normal' | 'Low';
  completed: boolean;
}

export interface ScrapeStats {
  totalLeads: number;
  emailsFound: number;
  phonesFound: number;
  websitesFound: number;
}

export enum ScrapeStatus {
  IDLE = 'IDLE',
  SCRAPING = 'SCRAPING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ScrapeRequest {
  keywords: string;
  location: string;
  limit: number;
}

export type View = 'dashboard' | 'leads' | 'tasks' | 'settings';