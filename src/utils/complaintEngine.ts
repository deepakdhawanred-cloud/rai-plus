import type {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  ParentComplaint,
  UserRole,
} from '../types';

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Academic',
  'Teacher',
  'Transport',
  'Behaviour / Bullying',
  'Infrastructure',
  'Safety',
  'Fee',
  'Other',
];

export const COMPLAINT_PRIORITIES: ComplaintPriority[] = [
  'Standard',
  'Urgent',
  'Safeguarding Escalation',
];

export const COMPLAINT_STATUSES: ComplaintStatus[] = [
  'New',
  'Assigned',
  'Investigating',
  'Resolved',
  'Reopened',
];

/**
 * Strips staff-only internal investigation notes before returning complaints to parents or students.
 */
export function sanitizeComplaintForRole(
  complaint: ParentComplaint,
  role: UserRole,
): ParentComplaint {
  if (role === 'parent' || role === 'student') {
    const { internalStaffNote: _omitted, ...safe } = complaint;
    return safe;
  }
  return complaint;
}

export function buildComplaintRefNo(existingCount: number, year = 2026): string {
  const seq = String(existingCount + 101).padStart(4, '0');
  return `CMP-${year}-${seq}`;
}

export function validateNewComplaintInput(input: {
  studentId?: string;
  category?: string;
  title?: string;
  description?: string;
  photoDataUrl?: string;
}): { valid: boolean; error?: string } {
  if (!input.studentId?.trim()) {
    return { valid: false, error: 'Please select the student linked to this concern.' };
  }
  if (!input.category?.trim()) {
    return { valid: false, error: 'Please select a complaint category.' };
  }
  if (!input.title?.trim() || input.title.trim().length < 4) {
    return { valid: false, error: 'Please provide a concise subject (at least 4 characters).' };
  }
  if (!input.description?.trim() || input.description.trim().length < 10) {
    return {
      valid: false,
      error: 'Please describe the concern clearly (at least 10 characters).',
    };
  }
  if (input.photoDataUrl && input.photoDataUrl.length > 750_000) {
    return {
      valid: false,
      error: 'Attached photo is too large (maximum ~500 KB image allowed).',
    };
  }
  return { valid: true };
}

export function computeComplaintStats(complaints: ParentComplaint[]): {
  total: number;
  openCount: number;
  unassignedCount: number;
  safeguardingCount: number;
  resolvedCount: number;
} {
  const openCount = complaints.filter((c) => c.status !== 'Resolved').length;
  const unassignedCount = complaints.filter(
    (c) => c.status === 'New' || !c.assignedCoordinator.trim(),
  ).length;
  const safeguardingCount = complaints.filter(
    (c) => c.priority === 'Safeguarding Escalation' && c.status !== 'Resolved',
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return {
    total: complaints.length,
    openCount,
    unassignedCount,
    safeguardingCount,
    resolvedCount,
  };
}

export function filterComplaints(
  complaints: ParentComplaint[],
  filters: {
    query?: string;
    status?: ComplaintStatus | 'All';
    priority?: ComplaintPriority | 'All';
  },
): ParentComplaint[] {
  const q = (filters.query ?? '').trim().toLowerCase();
  return complaints.filter((c) => {
    if (filters.status && filters.status !== 'All' && c.status !== filters.status) return false;
    if (filters.priority && filters.priority !== 'All' && c.priority !== filters.priority) {
      return false;
    }
    if (!q) return true;
    return (
      c.refNo.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.studentName.toLowerCase().includes(q) ||
      c.parentName.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.assignedCoordinator.toLowerCase().includes(q)
    );
  });
}
