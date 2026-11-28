import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Clock, Search, ShieldCheck, X } from 'lucide-react';
import type { UserAccount, UserRole } from '../types';
import { apiRequest } from '../utils/api';
import { RAI_PLUS_LOGO_URL } from '../utils/transportEngine';

export interface PublicDemoAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string | null;
  designation: string;
  subjectSpecialty?: string;
  classTeacherOf?: string;
}

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoAccounts: PublicDemoAccount[];
  demoLoginEnabled?: boolean;
  schools: Array<{ id: string; name: string; city: string; board: string }>;
  onLoginSuccess: (payload: { token: string; user: UserAccount; activeSchoolId: string | null }) => void;
}

type RoleCategoryTab = 'leadership' | 'teachers' | 'accounts' | 'clinical' | 'family' | 'flagship';

const RECENT_STORAGE_KEY = 'vs360_recent_logins_v1';

const CATEGORY_TABS: Array<{
  id: RoleCategoryTab;
  label: string;
  roles: UserRole[];
}> = [
  {
    id: 'leadership',
    label: 'Leadership & Ops',
    roles: ['principal', 'coordinator', 'transport_incharge', 'school_admin', 'super_admin', 'counsellor'],
  },
  { id: 'teachers', label: 'Teachers', roles: ['teacher'] },
  { id: 'accounts', label: 'Accounts', roles: ['accountant'] },
  {
    id: 'clinical',
    label: 'Clinical (RCI)',
    roles: ['clinical_psychologist', 'slp', 'audiologist', 'special_educator'],
  },
  { id: 'family', label: 'Parents & Students', roles: ['parent', 'student'] },
  {
    id: 'flagship',
    label: 'SSB & Free Career',
    roles: ['ssb_student', 'career_user', 'ssb_admin', 'career_admin'],
  },
];

function loadRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, 4) : [];
  } catch {
    return [];
  }
}

function saveRecentId(userId: string) {
  try {
    const existing = loadRecentIds().filter((id) => id !== userId);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify([userId, ...existing].slice(0, 4)));
  } catch {
    // ignore storage errors
  }
}

export const UnifiedLoginModal: React.FC<UnifiedLoginModalProps> = ({
  isOpen,
  onClose,
  demoAccounts,
  demoLoginEnabled = true,
  schools,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>('school-vis-jjr');
  const [activeCategory, setActiveCategory] = useState<RoleCategoryTab>('leadership');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>(() => loadRecentIds());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const recentAccounts = useMemo(
    () =>
      recentIds
        .map((id) => demoAccounts.find((a) => a.id === id))
        .filter((a): a is PublicDemoAccount => Boolean(a)),
    [recentIds, demoAccounts],
  );

  const filteredAccounts = useMemo(() => {
    const tabConfig = CATEGORY_TABS.find((t) => t.id === activeCategory) || CATEGORY_TABS[0];
    const q = searchQuery.trim().toLowerCase();

    return demoAccounts.filter((acc) => {
      if (!tabConfig.roles.includes(acc.role)) return false;
      if (schoolFilter !== 'all' && acc.schoolId && acc.schoolId !== schoolFilter) return false;
      if (q) {
        const hay = `${acc.name} ${acc.designation} ${acc.subjectSpecialty || ''} ${acc.classTeacherOf || ''} ${acc.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [demoAccounts, activeCategory, schoolFilter, searchQuery]);

  if (!isOpen) return null;

  const schoolNameFor = (schoolId: string | null) => {
    if (!schoolId) return 'Multi-School Platform / Advisory';
    const match = schools.find((s) => s.id === schoolId);
    return match ? `${match.name} · ${match.city}` : schoolId;
  };

  async function handleLogin(
    body: { userId?: string; email?: string; password?: string },
    labelId: string,
  ) {
    setError(null);
    setLoadingId(labelId);
    try {
      const data = await apiRequest<{
        token: string;
        user: UserAccount;
        activeSchoolId: string | null;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      saveRecentId(data.user.id);
      setRecentIds(loadRecentIds());
      setPassword('');
      onLoginSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoadingId(null);
    }
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered institutional email address.');
      return;
    }
    if (!demoLoginEnabled && !password) {
      setError('Please enter your password to sign in.');
      return;
    }
    void handleLogin(
      { email: email.trim(), ...(password ? { password } : {}) },
      'email-form',
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unified-login-heading"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[#254264] px-6 py-4 sticky top-0 bg-[#142B46] text-[#F3E6D8] z-10">
          <div className="flex items-center gap-3.5">
            <img
              src={RAI_PLUS_LOGO_URL}
              alt="Rai Plus Logo"
              className="h-11 w-11 rounded-lg border border-[#D6B66D]/60 object-cover bg-[#F3E6D8] shrink-0"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D6B66D]">
                RAI PLUS · The Complete Education Intelligence Platform
              </p>
              <h2 id="unified-login-heading" className="text-lg font-bold text-white mt-0.5">
                Unified Portal Login
              </h2>
              <p className="text-xs text-[#A9C5D8]">
                Sign in with your school email or choose an authorised role pathway.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login modal"
            className="rounded-lg p-2 text-[#A9C5D8] hover:bg-[#1E3B5C] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Email & Password Login Form */}
          <form onSubmit={handleEmailSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label htmlFor="portal-email-input" className="sr-only">
                Institutional Email Address
              </label>
              <input
                id="portal-email-input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Registered school or parent email"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
              />
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="portal-password-input" className="sr-only">
                Password
              </label>
              <input
                id="portal-password-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={demoLoginEnabled ? 'Password (if configured)' : 'Password (required)'}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
              />
            </div>
            <button
              type="submit"
              disabled={loadingId !== null}
              className="sm:col-span-3 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap shrink-0 transition-colors"
            >
              {loadingId === 'email-form' ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {!demoLoginEnabled && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900 flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                Production Security Mode Active: Sign in with your verified school email and password. Sessions are protected with encrypted HttpOnly cookies.
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Recently Used 1-Tap Switch Strip (Demo Sandbox Mode Only) */}
          {demoLoginEnabled && recentAccounts.length > 0 && (
            <div className="space-y-2" data-testid="login-recent-accounts">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Recently Used</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {recentAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    disabled={loadingId !== null}
                    onClick={() => void handleLogin({ userId: acc.id }, acc.id)}
                    className="rounded-lg border border-blue-200 bg-blue-50/40 px-3 py-2 text-left hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-xs font-bold text-slate-900 truncate">{acc.name}</p>
                    <p className="text-[11px] text-slate-600 truncate">{acc.designation}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabbed Role Directory (Demo Sandbox Mode Only) */}
          {demoLoginEnabled && demoAccounts.length > 0 && (
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <ShieldCheck className="h-4 w-4 text-blue-900 shrink-0" />
                <span>Role-Isolated School Pathways</span>
              </div>
              <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSchoolFilter('school-vis-jjr')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                    schoolFilter === 'school-vis-jjr'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  VIS Jhajjar
                </button>
                <button
                  type="button"
                  onClick={() => setSchoolFilter('all')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                    schoolFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Schools
                </button>
              </div>
            </div>

            {/* Category Tabs + Filter Input */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="Portal login role categories"
                className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
              >
                {CATEGORY_TABS.map((tab) => {
                  const count = demoAccounts.filter((acc) => {
                    if (!tab.roles.includes(acc.role)) return false;
                    if (schoolFilter !== 'all' && acc.schoolId && acc.schoolId !== schoolFilter) {
                      return false;
                    }
                    return true;
                  }).length;
                  const active = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        setActiveCategory(tab.id);
                        setSearchQuery('');
                      }}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors tabular-nums ${
                        active
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full lg:w-64">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="search"
                  aria-label="Filter role accounts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeCategory === 'teachers'
                      ? 'Filter teacher, class (10-A), subject...'
                      : 'Search name, role, or email...'
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs focus:border-blue-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Active Tab Account Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  disabled={loadingId !== null}
                  onClick={() => void handleLogin({ userId: acc.id }, acc.id)}
                  className="text-left rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 hover:border-blue-900/50 hover:bg-blue-50/40 transition-colors flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{acc.name}</p>
                    {acc.classTeacherOf && (
                      <span className="font-mono text-[10px] font-semibold text-blue-900 whitespace-nowrap shrink-0">
                        CT {acc.classTeacherOf}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">
                    {acc.subjectSpecialty || acc.designation}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px]">
                    <span className="text-slate-500 truncate">{schoolNameFor(acc.schoolId)}</span>
                    <span className="text-xs font-semibold text-blue-900 whitespace-nowrap shrink-0">
                      {loadingId === acc.id ? '...' : 'Enter →'}
                    </span>
                  </div>
                </button>
              ))}
              {filteredAccounts.length === 0 && (
                <p className="col-span-full text-xs text-slate-500 py-6 text-center">
                  No accounts match &ldquo;{searchQuery}&rdquo; in this role group.
                </p>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
