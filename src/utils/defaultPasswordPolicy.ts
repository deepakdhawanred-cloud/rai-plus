import type { UserAccount, UserRole } from '../types';

const ROLE_DEFAULT_PREFIX: Record<UserRole, string> = {
  super_admin: 'superadmin',
  school_admin: 'admin',
  principal: 'principal',
  coordinator: 'coordinator',
  teacher: 'teacher',
  parent: 'parent',
  student: 'student',
  counsellor: 'counsellor',
  accountant: 'accountant',
  transport_incharge: 'transport',
  clinical_psychologist: 'psychologist',
  slp: 'slp',
  audiologist: 'audiologist',
  special_educator: 'specialeducator',
  ssb_student: 'ssbstudent',
  career_user: 'career',
  ssb_admin: 'ssbadmin',
  career_admin: 'careeradmin',
};

/**
 * Returns the canonical default first-login password for any Rai Plus user:
 * their designation/role prefix followed by "123" (e.g., deputydirector123, principal123, viceprincipal123, teacher123).
 */
export function getDefaultDesignationPassword(
  user: Pick<UserAccount, 'role' | 'designation' | 'isPlatformCoo'>,
): string {
  if (user.role === 'super_admin' && user.isPlatformCoo) {
    return 'coo123';
  }
  const desig = String(user.designation || '').toLowerCase();
  if (desig.includes('chairman')) return 'chairman123';
  if (desig.includes('deputy director')) return 'deputydirector123';
  if (desig.includes('director')) return 'director123';
  if (desig.includes('vice principal')) return 'viceprincipal123';
  const prefix = ROLE_DEFAULT_PREFIX[user.role] || 'user';
  return `${prefix}123`;
}

/**
 * Returns all accepted first-login default password variants (lowercased) for a user so
 * both short designation (e.g. "admin123") and full role/designation slug (e.g. "schooladmin123")
 * work seamlessly on first login before the user sets their own custom password.
 */
export function getAcceptedDefaultPasswords(
  user: Pick<UserAccount, 'role' | 'designation' | 'isPlatformCoo'>,
): string[] {
  const candidates = new Set<string>();
  const canonical = getDefaultDesignationPassword(user).toLowerCase();
  candidates.add(canonical);

  // Role name without underscores + 123 (e.g. schooladmin123, transportincharge123)
  const roleFlat = String(user.role || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  if (roleFlat) {
    candidates.add(`${roleFlat}123`);
  }

  // First clean title segment from designation (before "(" or "·" or "—") + 123
  const baseDesignation = String(user.designation || '')
    .split(/[·(—-]/)[0]
    .trim()
    .toLowerCase();
  const compactDesignation = baseDesignation.replace(/[^a-z0-9]/g, '');
  if (compactDesignation && compactDesignation.length >= 3 && compactDesignation.length <= 28) {
    candidates.add(`${compactDesignation}123`);
  }

  // Common Indian school aliases
  if (user.role === 'school_admin') {
    candidates.add('schooladmin123');
    candidates.add('administrator123');
  }
  if (user.role === 'transport_incharge') {
    candidates.add('transportincharge123');
  }
  if (user.role === 'counsellor') {
    candidates.add('counselor123');
  }
  if (user.role === 'ssb_student') {
    candidates.add('ssb123');
    candidates.add('aspirant123');
  }
  if (user.role === 'career_user') {
    candidates.add('careeruser123');
    candidates.add('explorer123');
  }

  return Array.from(candidates);
}

/**
 * Case-insensitive check whether `candidatePassword` matches the user's default designation+123 password.
 */
export function matchesDefaultDesignationPassword(
  user: Pick<UserAccount, 'role' | 'designation' | 'isPlatformCoo'>,
  candidatePassword: string | undefined,
): boolean {
  const clean = String(candidatePassword || '').trim().toLowerCase();
  if (!clean) return false;
  return getAcceptedDefaultPasswords(user).includes(clean);
}
