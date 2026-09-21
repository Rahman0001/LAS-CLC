export interface SiteSettings {
  societyName: string;
  institutionName: string;
  departmentName: string;
  universityName: string;
  shortTagline: string;
  missionPlaceholder: string;
  descriptionPlaceholder: string;
  visionPlaceholder: string;
  objectives: string[];
  philosophyPlaceholder: string;
  email: string;
  phone: string;
  address: string;
  officeHours: string;
  stats: {
    programmes: string;
    outreach: string;
    beneficiaries: string;
    workshops: string;
  };
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
  legalDisclaimer: string;
}

export type TeamCategory =
  | 'Faculty Coordinator'
  | 'Faculty Members'
  | 'Office Bearers'
  | 'Executive Members'
  | 'Student Volunteers'
  | 'Advisory Members';

export interface TeamMember {
  id: string;
  name: string;
  category: TeamCategory;
  designation: string;
  session: string;
  bio: string;
  areasOfResponsibility: string[];
  photoUrl?: string;
  email?: string;
  linkedin?: string;
  published: boolean;
  order: number;
}

export type NotificationCategory =
  | 'General'
  | 'Events'
  | 'Workshops'
  | 'Recruitment'
  | 'Legal Awareness'
  | 'Reports'
  | 'Announcements';

export interface NotificationItem {
  id: string;
  title: string;
  date: string;
  category: NotificationCategory;
  shortDescription: string;
  content: string;
  attachmentTitle?: string;
  attachmentUrl?: string;
  externalLink?: string;
  isPinned: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportItem {
  id: string;
  title: string;
  academicYear: string;
  calendarYear: string;
  category: string;
  description: string;
  highlights: string[];
  coverImage?: string;
  pdfUrl: string;
  fileSize?: string;
  status: 'Published' | 'Archived' | 'Draft';
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  description: string;
  keyOutcomes: string[];
  imageUrl?: string;
  reportUrl?: string;
  relatedNotificationId?: string;
  status: 'Published' | 'Draft' | 'Archived';
}

export interface GalleryItem {
  id: string;
  title: string;
  album: string;
  year: string;
  imageUrl: string;
  caption: string;
  published: boolean;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  order: number;
}

export interface LegalResourceItem {
  id: string;
  title: string;
  category: 'Know Your Rights' | 'Legal Literacy Guides' | 'Statutory Resources' | 'Public Legal Aid' | 'FAQs';
  summary: string;
  keyPoints: string[];
  officialLink?: string;
  documentUrl?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  subject: string;
  message: string;
  isRead: boolean;
  status: 'Pending' | 'In Review' | 'Resolved' | 'Archived';
  createdAt: string;
}

export type BlogCategory =
  | 'Constitutional Law'
  | 'Access to Justice'
  | 'Prison Reforms'
  | 'Human Rights'
  | 'Field Insights'
  | 'Case Commentary'
  | 'Women & Child Rights'
  | 'General Legal Aid';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  author: string;
  authorRole: string;
  category: BlogCategory;
  tags: string[];
  readTime: string;
  date: string;
  coverImage?: string;
  excerpt: string;
  content: string;
  status: 'Published' | 'Draft';
  featured?: boolean;
  views?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  resource: string;
  details: string;
}

export type AuditLogEntry = AuditLog;

export type ClinicConsultationMode = 'In-Person (CLC Campus Clinic)' | 'Telephonic / Online';
export type ClinicAppointmentStatus =
  | 'Received'
  | 'In Review'
  | 'Scheduled'
  | 'Documents Required'
  | 'Completed'
  | 'Referred to DSLSA';

export interface ClinicAppointment {
  id: string;
  trackingToken: string;
  fullName: string;
  isRepresentative: boolean;
  representativeName?: string;
  relationshipToLitigant?: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  consultationMode: ClinicConsultationMode;
  preferredDate: string;
  preferredTimeSlot: string;
  legalDomain: string;
  caseDescription: string;
  hasExistingCourtCase: boolean;
  courtCaseDetails?: string;
  qualifiesUnderSection12: boolean;
  section12Category?: string;
  documentsSummary?: string;
  status: ClinicAppointmentStatus;
  scheduledDate?: string;
  assignedVolunteers?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AawazSubmissionStatus =
  | 'Submitted'
  | 'Under Editorial Review'
  | 'Revision Requested'
  | 'Accepted for Publication'
  | 'Declined';

export interface AawazSubmission {
  id: string;
  trackingToken: string;
  authorName: string;
  authorEmail: string;
  authorPhone: string;
  authorInstitution: string;
  authorDesignation: string;
  authorBio?: string;
  hasCoAuthor: boolean;
  coAuthorName?: string;
  coAuthorEmail?: string;
  coAuthorInstitution?: string;
  coAuthorDesignation?: string;
  title: string;
  category: string;
  themeOrCFP: string;
  abstract: string;
  wordCount: number;
  manuscriptUrl?: string;
  manuscriptFileName?: string;
  fileUrl?: string;
  fileName?: string;
  originalityDeclaration: boolean;
  status: AawazSubmissionStatus;
  editorNotes?: string;
  reviewNotes?: string;
  editorFeedback?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface AppDatabase {
  settings: SiteSettings;
  team: TeamMember[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  activities: ActivityItem[];
  gallery: GalleryItem[];
  timeline: TimelineItem[];
  resources: LegalResourceItem[];
  blogs: BlogPost[];
  contactSubmissions: ContactSubmission[];
  auditLogs: AuditLog[];
  clinicAppointments?: ClinicAppointment[];
  aawazSubmissions?: AawazSubmission[];
}
