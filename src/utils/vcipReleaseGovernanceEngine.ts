import type { UserAccount, UserRole } from '../types';
import type {
  VcipProfileReleaseRecord,
  VcipProfileReleaseStatus,
} from '../types/vcip';

export const VCIP_RELEASE_STATUS_META: Record<
  VcipProfileReleaseStatus,
  { label: string; studentParentVisible: boolean }
> = {
  draft: { label: 'Draft', studentParentVisible: false },
  under_review: { label: 'Under Counsellor Review', studentParentVisible: false },
  pending_approval: { label: 'Pending Management Approval', studentParentVisible: false },
  approved: { label: 'Approved for Family Access', studentParentVisible: true },
  published: { label: 'Published to Student & Parent', studentParentVisible: true },
  rejected: { label: 'Returned for Revision', studentParentVisible: false },
  revoked: { label: 'Access Revoked', studentParentVisible: false },
};

export function isVcipReleaseVisibleToFamily(
  record?: VcipProfileReleaseRecord | null,
): boolean {
  if (!record) return false;
  return record.status === 'approved' || record.status === 'published';
}

/**
 * Enforces Part 6 Access Control:
 * - Super Admin, School Admin, Principal, Counsellor: full clinical/review visibility (within school tenant).
 * - Coordinator: review oversight visibility.
 * - Teacher: does NOT automatically gain access to every student's full cognitive profile.
 * - Student: ONLY their own studentId AND ONLY when status is approved or published.
 * - Parent: ONLY their linkedStudentIds AND ONLY when status is approved or published.
 * - Accountant: NO access to cognitive profiles.
 */
export function canUserViewStudentVcipProfile(params: {
  user: UserAccount;
  studentId: string;
  releaseRecord?: VcipProfileReleaseRecord | null;
}): { allowed: boolean; reason: string; includeInternalNotes: boolean } {
  const { user, studentId, releaseRecord } = params;

  if (user.role === 'accountant') {
    return {
      allowed: false,
      reason: 'Financial roles do not have access to student cognitive profiles.',
      includeInternalNotes: false,
    };
  }

  if (
    user.role === 'super_admin' ||
    user.role === 'school_admin' ||
    user.role === 'principal' ||
    user.role === 'counsellor'
  ) {
    return {
      allowed: true,
      reason: 'Authorized counselling/management review access.',
      includeInternalNotes: true,
    };
  }

  if (user.role === 'coordinator') {
    return {
      allowed: true,
      reason: 'Academic coordinator oversight access (internal counsellor notes restricted).',
      includeInternalNotes: false,
    };
  }

  if (user.role === 'teacher') {
    return {
      allowed: false,
      reason:
        'Complete cognitive profiles are confidential and restricted to Counsellors and authorised Management. Teachers receive classroom support strategies via Developmental Remedials.',
      includeInternalNotes: false,
    };
  }

  if (user.role === 'student' || user.role === 'parent') {
    const linkedIds = user.linkedStudentIds || [];
    if (!linkedIds.includes(studentId)) {
      return {
        allowed: false,
        reason: 'Access denied: you may only view cognitive profiles linked to your own account.',
        includeInternalNotes: false,
      };
    }
    if (!isVcipReleaseVisibleToFamily(releaseRecord)) {
      return {
        allowed: false,
        reason:
          'This Cognitive Intelligence Profile is awaiting Counsellor review and Principal publication approval before becoming visible to students and parents.',
        includeInternalNotes: false,
      };
    }
    return {
      allowed: true,
      reason: 'Approved and published cognitive profile.',
      includeInternalNotes: false,
    };
  }

  return {
    allowed: false,
    reason: 'Unauthorized role.',
    includeInternalNotes: false,
  };
}

/**
 * Strips strictly internal counsellor notes from release records whenever
 * sent to non-counsellor/non-principal roles (especially students and parents).
 */
export function sanitizeVcipReleaseRecordForRole(
  record: VcipProfileReleaseRecord,
  role: UserRole,
): VcipProfileReleaseRecord {
  const canSeeInternal =
    role === 'super_admin' ||
    role === 'school_admin' ||
    role === 'principal' ||
    role === 'counsellor';

  if (canSeeInternal) return record;
  const { internalCounsellorNote: _omit, ...safeRecord } = record;
  return safeRecord;
}

export function canRoleTransitionVcipStatus(params: {
  role: UserRole;
  targetStatus: VcipProfileReleaseStatus;
}): { allowed: boolean; reason: string } {
  const { role, targetStatus } = params;

  const isCounsellor = role === 'counsellor';
  const isManagement = ['super_admin', 'school_admin', 'principal'].includes(role);

  if (targetStatus === 'draft' || targetStatus === 'under_review' || targetStatus === 'pending_approval') {
    if (isCounsellor || isManagement) {
      return { allowed: true, reason: 'Authorized review stage update.' };
    }
    return {
      allowed: false,
      reason: 'Only Counsellors or Management can submit a cognitive profile for approval.',
    };
  }

  if (
    targetStatus === 'approved' ||
    targetStatus === 'published' ||
    targetStatus === 'rejected' ||
    targetStatus === 'revoked'
  ) {
    if (isManagement) {
      return { allowed: true, reason: 'Authorized management publication decision.' };
    }
    return {
      allowed: false,
      reason:
        'Only Principal or authorised School Management may approve, publish, reject, or revoke family access to a Cognitive Profile.',
    };
  }

  return { allowed: false, reason: 'Invalid transition.' };
}
