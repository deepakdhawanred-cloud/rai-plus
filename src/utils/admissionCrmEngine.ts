import type {
  AdmissionLead,
  HomeVisitOutcome,
  HomeVisitRecord,
  HomeVisitStatus,
} from '../types';

export const ADMISSION_STAGES: AdmissionLead['stage'][] = [
  'New Enquiry',
  'Follow-up Scheduled',
  'Campus Visit',
  'Document Verification',
  'Confirmed',
];

export const ADMISSION_SOURCES: AdmissionLead['source'][] = [
  'Website',
  'Walk-in',
  'Referral',
  'Career Portal',
];

export const HOME_VISIT_STATUSES: HomeVisitStatus[] = [
  'Scheduled',
  'Completed',
  'Rescheduled',
  'Cancelled',
];

export const HOME_VISIT_OUTCOMES: HomeVisitOutcome[] = [
  'Proceed to Admission',
  'Scholarship / Fee Review',
  'Follow-up Visit Needed',
  'Not Proceeding',
];

export interface AdmissionCrmSummary {
  totalLeads: number;
  byStage: Record<AdmissionLead['stage'], number>;
  activePipelineCount: number;
  confirmedCount: number;
  conversionRatePct: number;
  followUpsDueCount: number;
  totalHomeVisits: number;
  scheduledHomeVisits: number;
  completedHomeVisits: number;
  leadsWithHomeVisitCount: number;
}

export type LeadHomeVisitFilter = 'ALL' | 'WITH_VISIT' | 'NEEDS_VISIT' | 'COMPLETED_VISIT';

export interface LeadFilterOptions {
  query?: string;
  stage?: AdmissionLead['stage'] | 'ALL';
  homeVisitFilter?: LeadHomeVisitFilter;
}

export interface HomeVisitFilterOptions {
  query?: string;
  status?: HomeVisitStatus | 'ALL';
  leadId?: string;
}

export interface LeadVisitSummary {
  totalVisits: number;
  latestVisit: HomeVisitRecord | null;
  hasCompletedVisit: boolean;
  hasActiveSchedule: boolean;
}

export function computeAdmissionCrmSummary(
  leads: AdmissionLead[],
  visits: HomeVisitRecord[],
  referenceDate: string = new Date().toISOString().slice(0, 10),
): AdmissionCrmSummary {
  const byStage: Record<AdmissionLead['stage'], number> = {
    'New Enquiry': 0,
    'Follow-up Scheduled': 0,
    'Campus Visit': 0,
    'Document Verification': 0,
    Confirmed: 0,
  };

  let followUpsDueCount = 0;
  for (const lead of leads) {
    byStage[lead.stage] = (byStage[lead.stage] ?? 0) + 1;
    if (lead.stage !== 'Confirmed' && lead.nextFollowUpDate && lead.nextFollowUpDate <= referenceDate) {
      followUpsDueCount += 1;
    }
  }

  const confirmedCount = byStage.Confirmed;
  const totalLeads = leads.length;
  const activePipelineCount = totalLeads - confirmedCount;
  const conversionRatePct =
    totalLeads > 0 ? Math.round((confirmedCount / totalLeads) * 1000) / 10 : 0;

  let scheduledHomeVisits = 0;
  let completedHomeVisits = 0;
  const coveredLeadIds = new Set<string>();
  const admissionVisits = visits.filter(
    (v) => v.visitCategory !== 'enrolled_student' && !v.studentId,
  );

  for (const visit of admissionVisits) {
    if (visit.status === 'Scheduled' || visit.status === 'Rescheduled') {
      scheduledHomeVisits += 1;
    } else if (visit.status === 'Completed') {
      completedHomeVisits += 1;
    }
    if (visit.status !== 'Cancelled' && visit.leadId) {
      coveredLeadIds.add(visit.leadId);
    }
  }

  return {
    totalLeads,
    byStage,
    activePipelineCount,
    confirmedCount,
    conversionRatePct,
    followUpsDueCount,
    totalHomeVisits: admissionVisits.length,
    scheduledHomeVisits,
    completedHomeVisits,
    leadsWithHomeVisitCount: coveredLeadIds.size,
  };
}

export function deriveLeadVisitSummary(
  leadId: string,
  visits: HomeVisitRecord[],
): LeadVisitSummary {
  const matching = visits
    .filter((v) => v.visitCategory !== 'enrolled_student' && !v.studentId && v.leadId === leadId)
    .slice()
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));

  return {
    totalVisits: matching.length,
    latestVisit: matching[0] ?? null,
    hasCompletedVisit: matching.some((v) => v.status === 'Completed'),
    hasActiveSchedule: matching.some(
      (v) => v.status === 'Scheduled' || v.status === 'Rescheduled',
    ),
  };
}

export function filterAdmissionLeads(
  leads: AdmissionLead[],
  visits: HomeVisitRecord[],
  options: LeadFilterOptions = {},
): AdmissionLead[] {
  const query = options.query?.trim().toLowerCase() ?? '';
  const stage = options.stage ?? 'ALL';
  const homeVisitFilter = options.homeVisitFilter ?? 'ALL';

  return leads.filter((lead) => {
    if (stage !== 'ALL' && lead.stage !== stage) return false;

    if (homeVisitFilter !== 'ALL') {
      const summary = deriveLeadVisitSummary(lead.id, visits);
      if (homeVisitFilter === 'WITH_VISIT' && summary.totalVisits === 0) return false;
      if (homeVisitFilter === 'NEEDS_VISIT' && (summary.hasCompletedVisit || summary.hasActiveSchedule)) {
        return false;
      }
      if (homeVisitFilter === 'COMPLETED_VISIT' && !summary.hasCompletedVisit) return false;
    }

    if (!query) return true;
    const haystack = [
      lead.studentName,
      lead.parentName,
      lead.phone,
      lead.email,
      lead.applyingClass,
      lead.assignedCounsellor,
      lead.locality ?? '',
      lead.previousSchool ?? '',
      lead.notes,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function filterHomeVisits(
  visits: HomeVisitRecord[],
  options: HomeVisitFilterOptions = {},
): HomeVisitRecord[] {
  const query = options.query?.trim().toLowerCase() ?? '';
  const status = options.status ?? 'ALL';
  const leadId = options.leadId;

  return visits
    .filter((visit) => {
      if (status !== 'ALL' && visit.status !== status) return false;
      if (leadId && visit.leadId !== leadId) return false;
      if (!query) return true;
      const haystack = [
        visit.studentName,
        visit.parentName,
        visit.applyingClass,
        visit.visitingStaff,
        visit.locality,
        visit.address,
        visit.guardianMet,
        visit.homeEnvironmentSummary,
        visit.learningSupportNotes,
        visit.outcome,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    })
    .slice()
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
}

export function validateLeadInput(input: Partial<AdmissionLead>): {
  valid: boolean;
  error?: string;
} {
  if (!input.studentName?.trim()) {
    return { valid: false, error: 'Student name is required.' };
  }
  if (!input.applyingClass?.trim()) {
    return { valid: false, error: 'Applying class is required.' };
  }
  if (!input.parentName?.trim()) {
    return { valid: false, error: 'Parent or guardian name is required.' };
  }
  if (!input.phone?.trim()) {
    return { valid: false, error: 'Contact phone number is required.' };
  }
  return { valid: true };
}

export function validateHomeVisitInput(input: Partial<HomeVisitRecord>): {
  valid: boolean;
  error?: string;
} {
  if (!input.leadId?.trim()) {
    return { valid: false, error: 'Please select an admission applicant.' };
  }
  if (!input.visitDate?.trim()) {
    return { valid: false, error: 'Home visit date is required.' };
  }
  if (!input.visitingStaff?.trim()) {
    return { valid: false, error: 'Visiting teacher or coordinator name is required.' };
  }
  if (!input.address?.trim() && !input.locality?.trim()) {
    return { valid: false, error: 'Residential address or locality is required.' };
  }
  if (!input.guardianMet?.trim()) {
    return { valid: false, error: 'Guardian met name is required.' };
  }
  return { valid: true };
}

export function normalizeClassSectionFromApplyingClass(applyingClass: string): string {
  const trimmed = applyingClass.trim();
  const match = trimmed.match(/Class\s+(\d+)(?:\s*\(([^)]+)\))?/i);
  if (match) {
    const num = match[1];
    const stream = match[2]?.trim();
    return stream ? `${num}-${stream}` : `${num}-A`;
  }
  return trimmed || '1-A';
}
