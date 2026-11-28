import type { BoardType } from '../types';

export type SchoolWebsiteIconKey =
  | 'academics'
  | 'stem'
  | 'transport'
  | 'safety'
  | 'sports'
  | 'transparency'
  | 'leadership'
  | 'digital';

export type SchoolGalleryCategory =
  | 'Campus'
  | 'Classrooms'
  | 'Labs & STEM'
  | 'Events & Culture'
  | 'Sports & Guidance';

export type SchoolAccentTheme = 'royal_navy' | 'emerald_heritage' | 'crimson_scholar';

export interface SchoolWebsiteFeature {
  id: string;
  title: string;
  description: string;
  badge: string;
  iconKey: SchoolWebsiteIconKey;
  highlightMetric?: string;
  photoUrl?: string;
  category?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface SchoolManagementMember {
  id: string;
  name: string;
  roleTitle: string;
  qualification: string;
  bio: string;
  message?: string;
  initials: string;
  photoUrl?: string;
  email?: string;
  /** Role-based visibility toggle for public display of contact details */
  contactVisible?: boolean;
}

export interface SchoolFacilityCategory {
  id: string;
  category: string;
  summary: string;
  highlights: string[];
  photoUrl?: string;
  active: boolean;
}

export interface SchoolPhilosophyConfig {
  pillars: Array<{
    key: string;
    title: string;
    subtitle: string;
  }>;
  coreValues: string[];
  statements: string[];
}

export interface SchoolParentEngagementItem {
  id: string;
  title: string;
  description: string;
}

export interface SchoolVerificationFlag {
  id: string;
  fieldLabel: string;
  currentValue: string;
  discrepancyNote: string;
  status: 'Pending Approval' | 'Approved';
  approvedBy?: string;
  approvedAt?: string;
}

export interface SchoolGalleryItem {
  id: string;
  title: string;
  category: SchoolGalleryCategory;
  imageUrl: string;
  caption: string;
  tag: string;
}

export interface SchoolWebsiteCampusStat {
  label: string;
  value: number;
  suffix?: string;
  sublabel: string;
}

export interface SchoolWebsiteContact {
  address: string;
  phone: string;
  admissionsPhone: string;
  email: string;
  officeHours: string;
  websiteDomainLabel: string;
}

export interface SchoolWebsiteProfile {
  schoolId: string;
  slug: string;
  shortName: string;
  logoUrl?: string;
  tagline: string;
  motto: string;
  establishedYear: string;
  gradesOffered: string;
  hbseSchoolCode?: string;
  curriculum?: string;
  streams?: string[];
  prePrimaryConfigurable?: boolean;
  affiliationNote: string;
  heroImageUrl: string;
  heroHighlightBadge: string;
  accentTheme: SchoolAccentTheme;
  admissionsOpen: boolean;
  admissionsSession: string;
  admissionsHeadline: string;
  philosophy?: SchoolPhilosophyConfig;
  principalMessage: {
    authorName: string;
    roleTitle: string;
    quote: string;
    fullMessage: string;
    photoUrl?: string;
  };
  salientFeatures: SchoolWebsiteFeature[];
  managementTeam: SchoolManagementMember[];
  facilityCategories?: SchoolFacilityCategory[];
  parentEngagementHighlights?: SchoolParentEngagementItem[];
  pendingAdminVerification?: SchoolVerificationFlag[];
  gallery: SchoolGalleryItem[];
  campusStats: SchoolWebsiteCampusStat[];
  contact: SchoolWebsiteContact;
  updatedAt: string;
  updatedBy: string;
}

export interface PublicSchoolDirectoryCard {
  id: string;
  name: string;
  code: string;
  slug: string;
  city: string;
  state: string;
  board: BoardType;
  session: string;
  studentCount: number;
  teacherCount: number;
  tagline: string;
  heroImageUrl: string;
  admissionsOpen: boolean;
  gradesOffered: string;
}

export interface PublicSchoolWebsitePayload {
  school: {
    id: string;
    name: string;
    code: string;
    slug: string;
    city: string;
    state: string;
    board: BoardType;
    udiseCode: string;
    haryanaMisCode: string;
    session: string;
    studentCount: number;
    teacherCount: number;
    active: boolean;
  };
  profile: SchoolWebsiteProfile;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    category: string;
    venue: string;
  }>;
  transportCoverage: Array<{
    id: string;
    routeName: string;
    busNumber: string;
    stopsPreview: string;
  }>;
  allOnboardedSchools: PublicSchoolDirectoryCard[];
}
