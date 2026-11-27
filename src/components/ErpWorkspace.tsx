import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  BookOpenCheck,
  Brain,
  Briefcase,
  Building2,
  Bus,
  Calendar,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Compass,
  Cpu,
  FileSpreadsheet,
  GitMerge,
  HeartHandshake,
  IndianRupee,
  Keyboard,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sliders,
  Stethoscope,
  UserCheck,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';
import { apiRequest } from '../utils/api';
import {
  loadParentLangPreference,
  saveParentLangPreference,
  type ParentLang,
} from '../utils/parentTranslations';
import { DashboardOverview } from './modules/DashboardOverview';
import { NotebookCheckModule } from './modules/NotebookCheckModule';
import { Student360Module } from './modules/Student360Module';
import { IntelligenceGamesModule } from './modules/IntelligenceGamesModule';
import { AcademicResourcesModule } from './modules/AcademicResourcesModule';
import { AcademicsModule } from './modules/AcademicsModule';
import { AdmissionsAndCareerModule } from './modules/AdmissionsAndCareerModule';
import { FinancialDashboardModule } from './modules/FinancialDashboardModule';
import { FamilyManagementModule } from './modules/FamilyManagementModule';
import { OperationsAndGovernanceModule } from './modules/OperationsAndGovernanceModule';
import {
  ReadingNumeracyLabModule,
  type AssessmentLabMode,
} from './modules/ReadingNumeracyLabModule';
import { DevelopmentalRemedialDashboardModule } from './modules/DevelopmentalRemedialDashboardModule';
import { UnifiedThinkingModule } from './modules/UnifiedThinkingModule';
import { CognitiveIntelligenceModule } from './modules/CognitiveIntelligenceModule';
import { PsychometricSuiteModule } from './modules/PsychometricSuiteModule';
import { ComputerSkillTestModule } from './modules/ComputerSkillTestModule';
import { SmartTimetableLeaveModule } from './modules/SmartTimetableLeaveModule';
import { TeacherProductivityModule } from './modules/TeacherProductivityModule';
import { AttendanceHeatmapModule } from './modules/AttendanceHeatmapModule';
import { CareerIntelligenceWorkspace } from './CareerIntelligenceWorkspace';
import { ClinicalCareCenterModule } from './clinical/ClinicalCareCenterModule';
import { TransportManagementModule } from './modules/TransportManagementModule';
import { SchoolEventsModule } from './modules/SchoolEventsModule';
import { MarksReportCardModule } from './modules/MarksReportCardModule';
import { SuperAdminFeatureAllotmentModule } from './modules/SuperAdminFeatureAllotmentModule';
import { StaffAttendanceSalaryModule } from './modules/StaffAttendanceSalaryModule';
import { CampusGateVisitorsModule } from './modules/CampusGateVisitorsModule';
import { GlobalQuickJump } from './GlobalQuickJump';
import { AlertsCenterPanel } from './AlertsCenterPanel';
import { RoleNavigationDock } from './RoleNavigationDock';
import { RevisionStreakReminderBell } from './RevisionStreakReminderBell';
import { pushToast, ToastViewport } from './ToastProvider';
import {
  buildUnifiedWorkspaceAlerts,
  computeAlertCenterCounts,
  loadLocallyAcknowledgedAlertIds,
  saveLocallyAcknowledgedAlertIds,
} from '../utils/alertsCenterEngine';
import { clearAllDirtyStates, getActiveDirtyWarning } from '../utils/dirtyGuard';
import { RAI_PLUS_LOGO_URL } from '../utils/transportEngine';
import { isWorkspaceTabEnabledForSchool } from '../utils/subscriptionEntitlements';
import {
  buildRoleQuickDockItems,
  getRoleWorkspaceIdentity,
  type RoleQuickDockItem,
} from '../utils/roleNavigationConfig';
import {
  buildWorkspaceRevisionStreakStatus,
  clearStreakReminderSnooze,
  dismissStreakReminderForToday,
  evaluateRevisionStreakReminder,
  loadReminderPrefs,
  recordLoginVisitAndGetGap,
  REVISION_STREAK_UPDATED_EVENT,
  saveReminderPrefs,
  snoozeStreakReminder,
  type RevisionStreakPrefs,
} from '../utils/revisionStreakReminderEngine';

interface ErpWorkspaceProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onSwitchUser: () => void;
  onLogout: () => void;
}

type NavSectionId =
  | 'Daily Desk'
  | 'Assessments & Growth'
  | 'Student Care & Guidance'
  | 'School Operations';

const NAV_SECTION_ORDER: NavSectionId[] = [
  'Daily Desk',
  'Assessments & Growth',
  'Student Care & Guidance',
  'School Operations',
];

const NAV_ITEMS: Array<{
  id: WorkspaceTab;
  label: string;
  section: NavSectionId;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}> = [
  {
    id: 'feature_allotment',
    label: 'Plan & Feature Allotment',
    section: 'School Operations',
    icon: Sliders,
    roles: ['super_admin'],
  },
  {
    id: 'today_workspace',
    label: 'Today Workspace',
    section: 'Daily Desk',
    icon: LayoutDashboard,
    roles: ['teacher'],
  },
  {
    id: 'overview',
    label: 'Overview',
    section: 'Daily Desk',
    icon: LayoutDashboard,
    roles: [
      'school_admin',
      'principal',
      'coordinator',
      'parent',
      'student',
      'counsellor',
      'accountant',
    ],
  },
  {
    id: 'alerts',
    label: 'Alerts Center',
    section: 'Daily Desk',
    icon: Bell,
    roles: [
      'school_admin',
      'principal',
      'coordinator',
      'teacher',
      'parent',
      'student',
      'counsellor',
      'accountant',
      'transport_incharge',
      'clinical_psychologist',
      'slp',
      'audiologist',
      'special_educator',
    ],
  },
  {
    id: 'attendance_heatmap',
    label: 'Attendance Heatmap',
    section: 'Daily Desk',
    icon: Calendar,
    roles: [
      'school_admin',
      'principal',
      'coordinator',
      'teacher',
      'counsellor',
      'clinical_psychologist',
      'special_educator',
    ],
  },
  {
    id: 'notebook',
    label: 'Notebook & Homework',
    section: 'Daily Desk',
    icon: ClipboardCheck,
    roles: ['school_admin', 'principal', 'coordinator', 'teacher'],
  },
  {
    id: 'marks_report_card',
    label: 'Marks & Report Cards',
    section: 'Daily Desk',
    icon: FileSpreadsheet,
    roles: [
      'school_admin',
      'principal',
      'coordinator',
      'teacher',
      'parent',
      'student',
    ],
  },
  {
    id: 'timetable_leave',
    label: 'Timetable & Leave',
    section: 'Daily Desk',
    icon: CalendarClock,
    roles: ['school_admin', 'principal', 'coordinator', 'teacher'],
  },
  {
    id: 'academics',
    label: 'Class Learning Hub',
    section: 'Daily Desk',
    icon: BookOpen,
    roles: [
      'school_admin',
      'principal',
      'coordinator',
      'teacher',
      'parent',
      'student',
    ],
  },
  {
    id: 'students',
    label: 'Students 360°',
    section: 'Daily Desk',
    icon: Users,
    roles: [
      'school_admin',
      'principal',
      'coordinator',
      'teacher',
      'parent',
      'student',
      'counsellor',
      'clinical_psychologist',
      'slp',
      'audiologist',
      'special_educator',
    ],
  },
  {
    id: 'events',
    label: 'Events & Calendar',
    section: 'Daily Desk',
    icon: Calendar,
    roles: [
      'school_admin',
      'principal',
      'coordinator',
      'teacher',
      'parent',
      'student',
    ],
  },
  {
    id: 'assessments',
    label: 'Reading & Numeracy Lab',
    section: 'Assessments & Growth',
    icon: BookOpenCheck,
    roles: ['school_admin', 'principal', 'coordinator', 'teacher', 'student'],
  },
  {
    id: 'games',
    label: 'Intelligence Games',
    section: 'Assessments & Growth',
    icon: Brain,
    roles: ['school_admin', 'principal', 'coordinator', 'student', 'counsellor'],
  },
  {
    id: 'cognitive_profile',
    label: 'Cognitive Profile (VCIP)',
    section: 'Assessments & Growth',
    icon: Cpu,
    roles: ['school_admin', 'principal', 'coordinator', 'counsellor', 'student'],
  },
  {
    id: 'thinking',
    label: 'Thinking Tests & OLQ',
    section: 'Assessments & Growth',
    icon: Lightbulb,
    roles: ['school_admin', 'principal', 'coordinator', 'counsellor', 'student'],
  },
  {
    id: 'psychometric',
    label: 'Psychometric Suite',
    section: 'Assessments & Growth',
    icon: Activity,
    roles: ['school_admin', 'principal', 'coordinator', 'counsellor'],
  },
  {
    id: 'computer_skills',
    label: 'Computer Skill Test',
    section: 'Assessments & Growth',
    icon: Keyboard,
    roles: ['school_admin', 'principal', 'coordinator', 'counsellor', 'student'],
  },
  {
    id: 'clinical_care',
    label: 'Clinical & Care 360°',
    section: 'Student Care & Guidance',
    icon: Stethoscope,
    roles: [
      'clinical_psychologist',
      'slp',
      'audiologist',
      'special_educator',
      'counsellor',
      'school_admin',
      'principal',
      'coordinator',
    ],
  },
  {
    id: 'remedials',
    label: 'Developmental Remedials',
    section: 'Student Care & Guidance',
    icon: HeartHandshake,
    roles: [
      'school_admin',
      'principal',
      'coordinator',
      'teacher',
      'counsellor',
      'clinical_psychologist',
      'slp',
      'special_educator',
    ],
  },
  {
    id: 'career',
    label: 'Career Intelligence',
    section: 'Student Care & Guidance',
    icon: Briefcase,
    roles: ['school_admin', 'principal', 'coordinator', 'counsellor', 'student', 'parent'],
  },
  {
    id: 'finance',
    label: 'Finance 360° & Fees',
    section: 'School Operations',
    icon: IndianRupee,
    roles: ['school_admin', 'principal', 'coordinator', 'accountant'],
  },
  {
    id: 'admissions',
    label: 'Admissions & Career',
    section: 'School Operations',
    icon: Compass,
    roles: ['school_admin', 'principal', 'coordinator', 'counsellor'],
  },
  {
    id: 'families',
    label: 'Family Management',
    section: 'School Operations',
    icon: GitMerge,
    roles: ['school_admin', 'principal', 'coordinator'],
  },
  {
    id: 'transport',
    label: 'Transport & Live GPS',
    section: 'School Operations',
    icon: Bus,
    roles: [
      'school_admin',
      'principal',
      'transport_incharge',
      'coordinator',
      'parent',
      'student',
    ],
  },
  {
    id: 'productivity',
    label: 'Teacher Productivity',
    section: 'School Operations',
    icon: BarChart3,
    roles: ['school_admin', 'principal', 'coordinator'],
  },
  {
    id: 'staff_payroll',
    label: 'Staff Attendance & Salary',
    section: 'School Operations',
    icon: WalletCards,
    roles: [
      'school_admin',
      'principal',
      'accountant',
      'teacher',
      'coordinator',
      'counsellor',
      'transport_incharge',
      'clinical_psychologist',
      'slp',
      'audiologist',
      'special_educator',
    ],
  },
  {
    id: 'campus_gate',
    label: 'Gate Pass & Visitors',
    section: 'School Operations',
    icon: ShieldCheck,
    roles: [
      'school_admin',
      'principal',
      'coordinator',
      'transport_incharge',
      'teacher',
      'accountant',
      'counsellor',
      'parent',
    ],
  },
  {
    id: 'operations',
    label: 'Fees, Ops & Governance',
    section: 'School Operations',
    icon: Settings2,
    roles: ['school_admin', 'principal', 'coordinator', 'parent'],
  },
];

function buildInitialCollapsedSections(role: string): Record<string, boolean> {
  if (
    role === 'parent' ||
    role === 'student' ||
    role === 'accountant' ||
    role === 'transport_incharge' ||
    role === 'super_admin'
  ) {
    return {};
  }
  return {
    'Assessments & Growth': true,
    'Student Care & Guidance': true,
    'School Operations': true,
  };
}

function resolveNavSectionForRole(
  item: (typeof NAV_ITEMS)[number],
  role: string,
): NavSectionId {
  if (role === 'parent') return 'Daily Desk';
  if (role === 'teacher') {
    if (item.id === 'attendance_heatmap') {
      return 'Assessments & Growth';
    }
    if (item.id === 'remedials') return 'Assessments & Growth';
  }
  if (role === 'student') {
    if (item.id === 'transport' || item.id === 'career') {
      return 'Assessments & Growth';
    }
  }
  if (['school_admin', 'principal', 'coordinator'].includes(role)) {
    if (item.id === 'finance' || item.id === 'staff_payroll' || item.id === 'campus_gate') {
      return 'Daily Desk';
    }
    if (item.id === 'notebook') {
      return 'Assessments & Growth';
    }
  }
  if (role === 'accountant' && item.id === 'staff_payroll') {
    return 'Daily Desk';
  }
  if (role === 'transport_incharge' && item.id === 'campus_gate') {
    return 'Daily Desk';
  }
  return item.section;
}

function getSectionDisplayLabel(section: NavSectionId, role: string): string {
  if (section === 'Daily Desk') {
    if (role === 'student') return 'Daily Learning';
    if (role === 'teacher') return 'Daily Work';
    return 'Daily Desk';
  }
  if (section === 'Assessments & Growth') {
    if (role === 'student') return 'Skill Labs & More';
    if (role === 'teacher') return 'Labs & Remedials';
    return 'Academics & Skill Labs';
  }
  return section;
}

export const ErpWorkspace: React.FC<ErpWorkspaceProps> = ({
  data,
  token,
  onRefresh,
  onSwitchUser,
  onLogout,
}) => {
  const isSuperAdmin = data.user.role === 'super_admin';
  const defaultTabForRole: WorkspaceTab = isSuperAdmin
    ? 'feature_allotment'
    : [
          'clinical_psychologist',
          'slp',
          'audiologist',
          'special_educator',
        ].includes(data.user.role)
      ? 'clinical_care'
      : data.user.role === 'transport_incharge'
        ? 'transport'
        : data.user.role === 'teacher'
          ? 'today_workspace'
          : 'overview';

  const [activeTab, setActiveTab] = useState<WorkspaceTab>(defaultTabForRole);
  const [todayFocusRequest, setTodayFocusRequest] = useState<{
    mode: 'all' | 'attendance' | 'schedule_tasks' | 'lesson_plans';
    nonce: number;
  }>({ mode: 'all', nonce: 0 });
  const [notebookSubTabRequest, setNotebookSubTabRequest] = useState<{
    tab: 'notebook' | 'homework';
    nonce: number;
  }>({ tab: 'notebook', nonce: 0 });
  const [assessmentLabRequest, setAssessmentLabRequest] = useState<{
    mode: AssessmentLabMode;
    studentId?: string | null;
    nonce: number;
  }>({ mode: 'reading', nonce: 0 });
  const [academicsTabRequest, setAcademicsTabRequest] = useState<{
    tab: 'study_game' | 'interactive_lab' | 'hub' | 'presentations';
    nonce: number;
  }>({ tab: 'study_game', nonce: 0 });
  const [vcipSubTabRequest, setVcipSubTabRequest] = useState<{
    tab: 'dashboard' | 'brain_gym';
    nonce: number;
  }>({ tab: 'dashboard', nonce: 0 });
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    data.students[0]?.id ?? null,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rai_sidebar_compact_v1') === '1';
    } catch {
      return false;
    }
  });
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [tabHistory, setTabHistory] = useState<WorkspaceTab[]>([]);
  const [recentTabs, setRecentTabs] = useState<WorkspaceTab[]>([]);
  const [refreshingWorkspace, setRefreshingWorkspace] = useState(false);
  const [parentLang, setParentLang] = useState<ParentLang>(() => loadParentLangPreference());
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() =>
    buildInitialCollapsedSections(data.user.role),
  );
  const [pendingNavAction, setPendingNavAction] = useState<{
    warning: string;
    proceed: () => void;
  } | null>(null);
  const [locallyAcknowledgedAlertIds, setLocallyAcknowledgedAlertIds] = useState<Set<string>>(() =>
    loadLocallyAcknowledgedAlertIds(data.activeSchool.id, data.user.id),
  );

  const isRevisionReminderRole = data.user.role === 'student' || data.user.role === 'parent';
  const streakSessionKey = `${data.activeSchool.id}:${data.user.id}`;
  const [streakPrefs, setStreakPrefs] = useState<RevisionStreakPrefs>(() =>
    loadReminderPrefs(data.activeSchool.id, data.user.id),
  );
  const [hoursSinceLastLogin, setHoursSinceLastLogin] = useState<number | null>(null);
  const [loadedStreakSessionKey, setLoadedStreakSessionKey] = useState<string | null>(null);
  const [streakRefreshNonce, setStreakRefreshNonce] = useState(0);
  const lastAutoPromptKeyRef = useRef<string | null>(null);

  function toggleNavSection(section: NavSectionId) {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  function guardNavigation(action: () => void) {
    const warning = getActiveDirtyWarning();
    if (warning) {
      setPendingNavAction({ warning, proceed: action });
      return;
    }
    action();
  }

  function toggleSidebarCompact() {
    setSidebarCompact((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rai_sidebar_compact_v1', next ? '1' : '0');
      } catch {
        // ignore storage errors
      }
      if (next) setNavSearchQuery('');
      return next;
    });
  }

  async function handleManualRefresh() {
    if (refreshingWorkspace) return;
    setRefreshingWorkspace(true);
    try {
      await onRefresh();
      pushToast('Workspace synced with latest school data.', 'success');
    } catch {
      pushToast('Unable to refresh workspace right now.', 'error');
    } finally {
      setRefreshingWorkspace(false);
    }
  }

  useEffect(() => {
    setActiveTab(defaultTabForRole);
    setTodayFocusRequest({ mode: 'all', nonce: 0 });
    setSelectedStudentId(data.students[0]?.id ?? null);
    setCollapsedSections(buildInitialCollapsedSections(data.user.role));
    setTabHistory([]);
    setRecentTabs([]);
    setNavSearchQuery('');
    setLocallyAcknowledgedAlertIds(
      loadLocallyAcknowledgedAlertIds(data.activeSchool.id, data.user.id),
    );
  }, [data.activeSchool.id, data.user.id, data.user.role, defaultTabForRole]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  // Listen for immediate Quick Revise / Interactive Learning streak completions
  useEffect(() => {
    const handleStreakUpdated = () => setStreakRefreshNonce((n) => n + 1);
    window.addEventListener(REVISION_STREAK_UPDATED_EVENT, handleStreakUpdated);
    return () => window.removeEventListener(REVISION_STREAK_UPDATED_EVENT, handleStreakUpdated);
  }, []);

  // Load reminder preferences & measure login gap when student/parent enters workspace
  useEffect(() => {
    if (!isRevisionReminderRole) return;
    setStreakPrefs(loadReminderPrefs(data.activeSchool.id, data.user.id));
    const gap = recordLoginVisitAndGetGap(data.activeSchool.id, data.user.id);
    setHoursSinceLastLogin(gap.hoursSinceLastLogin);
    setLoadedStreakSessionKey(streakSessionKey);
  }, [data.activeSchool.id, data.user.id, isRevisionReminderRole, streakSessionKey]);

  const revisionStreakStatus = useMemo(() => {
    void streakRefreshNonce;
    return buildWorkspaceRevisionStreakStatus(data, hoursSinceLastLogin);
  }, [data, hoursSinceLastLogin, streakRefreshNonce]);

  const openRevisionTask = useCallback((targetTab: 'academics' | 'interactive_learning') => {
    guardNavigation(() => {
      if (targetTab === 'interactive_learning') {
        const labAllowed = isWorkspaceTabEnabledForSchool(data.activeSchool, 'interactive_learning');
        setAcademicsTabRequest((prev) => ({
          tab: labAllowed ? 'interactive_lab' : 'study_game',
          nonce: prev.nonce + 1,
        }));
      } else {
        setAcademicsTabRequest((prev) => ({ tab: 'study_game', nonce: prev.nonce + 1 }));
      }
      setActiveTab('academics');
    });
  }, [data.activeSchool]);

  const triggerRevisionStreakToast = useCallback(
    (forcePreview = false) => {
      if (!isRevisionReminderRole) return;
      const learnerName = data.students[0]?.name || data.user.name;
      const evaluation = evaluateRevisionStreakReminder({
        role: data.user.role,
        learnerName,
        status: revisionStreakStatus,
        prefs: streakPrefs,
        forcePreview,
      });

      if (!evaluation.shouldShow) return;

      pushToast(evaluation.message, 'streak', {
        id: `revision-streak-${data.activeSchool.id}-${data.user.id}`,
        title: evaluation.title,
        badge: evaluation.badge,
        durationMs: 12000,
        primaryAction: {
          label: evaluation.ctaLabel,
          onClick: () => openRevisionTask(evaluation.status.suggestedTask.targetTab),
        },
        secondaryAction: {
          label: 'Snooze 4h',
          onClick: () => {
            const next = snoozeStreakReminder(data.activeSchool.id, data.user.id, 4);
            setStreakPrefs(next);
            pushToast('Revision Streak reminder snoozed for 4 hours.', 'info');
          },
        },
        onDismiss: () => {
          if (!forcePreview) {
            const next = dismissStreakReminderForToday(data.activeSchool.id, data.user.id);
            setStreakPrefs(next);
          }
        },
      });
    },
    [
      data.activeSchool.id,
      data.students,
      data.user.id,
      data.user.name,
      data.user.role,
      isRevisionReminderRole,
      openRevisionTask,
      revisionStreakStatus,
      streakPrefs,
    ],
  );

  // Trigger automatic non-blocking Revision Streak reminder toast once per user session when due
  useEffect(() => {
    if (!isRevisionReminderRole) return;
    if (loadedStreakSessionKey !== streakSessionKey) return;
    if (lastAutoPromptKeyRef.current === streakSessionKey) return;

    const timerId = window.setTimeout(() => {
      lastAutoPromptKeyRef.current = streakSessionKey;
      triggerRevisionStreakToast(false);
    }, 900);

    return () => window.clearTimeout(timerId);
  }, [
    isRevisionReminderRole,
    loadedStreakSessionKey,
    streakSessionKey,
    triggerRevisionStreakToast,
  ]);

  function handleParentLangChange(next: ParentLang) {
    setParentLang(next);
    saveParentLangPreference(next);
  }

  const allowedNav = NAV_ITEMS.filter((item) => {
    if (!item.roles.includes(data.user.role)) return false;
    if (isSuperAdmin) return item.id === 'feature_allotment';
    if (item.id === 'academics') {
      return (
        isWorkspaceTabEnabledForSchool(data.activeSchool, 'academics') ||
        isWorkspaceTabEnabledForSchool(data.activeSchool, 'interactive_learning')
      );
    }
    return isWorkspaceTabEnabledForSchool(data.activeSchool, item.id);
  }).map((item) => {
    const section = resolveNavSectionForRole(item, data.user.role);
    let label = item.label;
    if (item.id === 'overview' && data.user.role === 'accountant') {
      label = 'Accounts Overview';
    } else if (item.id === 'overview' && (data.user.role === 'parent' || data.user.role === 'student')) {
      label = 'Home';
    } else if (item.id === 'marks_report_card' && (data.user.role === 'parent' || data.user.role === 'student')) {
      label = 'Marks & Report Card';
    } else if (item.id === 'students' && data.user.role === 'parent') {
      label = 'Child Progress 360°';
    } else if (item.id === 'students' && data.user.role === 'student') {
      label = 'My Profile & Plan';
    } else if (item.id === 'students' && data.user.role === 'teacher') {
      label = 'My Students (360°)';
    } else if (item.id === 'academics' && data.user.role === 'parent') {
      label = 'Study Games & Class Hub';
    } else if (item.id === 'academics') {
      label = 'Class Learning Hub';
    } else if (item.id === 'transport' && (data.user.role === 'parent' || data.user.role === 'student')) {
      label = 'Bus Live GPS';
    } else if (item.id === 'operations' && data.user.role === 'parent') {
      label = 'Fees & Messages';
    } else if (item.id === 'cognitive_profile' && data.user.role === 'student') {
      label = 'Daily Brain Gym';
    } else if (item.id === 'career' && data.user.role === 'student') {
      label = 'Career Explorer';
    } else if (
      item.id === 'staff_payroll' &&
      !['school_admin', 'principal', 'accountant'].includes(data.user.role)
    ) {
      label = 'My Attendance & Payslip';
    } else if (item.id === 'campus_gate' && data.user.role === 'parent') {
      label = 'Early Exit Gate Pass';
    } else if (
      item.id === 'campus_gate' &&
      !['school_admin', 'principal', 'coordinator', 'transport_incharge'].includes(data.user.role)
    ) {
      label = 'My Gate Pass';
    }
    return { ...item, label, section };
  });

  const normalizedNavQuery = navSearchQuery.trim().toLowerCase();
  const filteredNav = normalizedNavQuery
    ? allowedNav.filter(
        (item) =>
          item.label.toLowerCase().includes(normalizedNavQuery) ||
          item.section.toLowerCase().includes(normalizedNavQuery),
      )
    : allowedNav;

  const groupedNavSections = NAV_SECTION_ORDER.map((section) => ({
    section,
    displayLabel: getSectionDisplayLabel(section, data.user.role),
    items: filteredNav.filter((item) => item.section === section),
  })).filter((g) => g.items.length > 0);

  const showSectionHeaders =
    groupedNavSections.length > 1 &&
    allowedNav.length > 7 &&
    !['parent', 'accountant', 'transport_incharge'].includes(data.user.role);
  const showSidebarQuickFilter = !isSuperAdmin && allowedNav.length > 8 && !sidebarCompact;

  const roleIdentity = getRoleWorkspaceIdentity(data.user.role);
  const allowedTabIdSet = new Set<WorkspaceTab>(allowedNav.map((n) => n.id));
  const onCampusVisitorsCount = (data.visitorLogs || []).filter(
    (v) => v.status === 'On Campus',
  ).length;
  const pendingGatePassesCount = (data.gatePasses || []).filter(
    (g) => g.status === 'Pending Approval',
  ).length;
  const gateLiveCount = onCampusVisitorsCount + pendingGatePassesCount;

  const currentTabLabel = isSuperAdmin
    ? 'Plan & Feature Allotment'
    : activeTab === 'today_workspace' && todayFocusRequest.mode === 'attendance'
      ? 'Today Workspace · One-Go Attendance'
      : activeTab === 'academic_resources'
        ? 'Quick Revise & Resources'
        : allowedNav.find((n) => n.id === activeTab)?.label ??
          (data.user.role === 'teacher' ? 'Today Workspace' : 'Overview');

  const unreadAttendanceCount = ['parent', 'student'].includes(data.user.role)
    ? (data.attendanceNotifications || []).filter((n) => !n.readByParent).length +
      (data.notebookNotifications || []).filter((n) => {
        if (n.status !== 'Active') return false;
        return data.user.role === 'student' ? !n.readByStudent : !n.readByParent;
      }).length
    : 0;

  const unifiedAlerts = useMemo(
    () =>
      isSuperAdmin
        ? []
        : buildUnifiedWorkspaceAlerts({
            data,
            allowedTabIds: allowedTabIdSet,
            locallyAcknowledgedIds: locallyAcknowledgedAlertIds,
          }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, isSuperAdmin, locallyAcknowledgedAlertIds],
  );

  const alertCounts = useMemo(() => computeAlertCenterCounts(unifiedAlerts), [unifiedAlerts]);

  function handleLocalAcknowledgeAlerts(alertIds: string[]) {
    if (alertIds.length === 0) return;
    setLocallyAcknowledgedAlertIds((prev) => {
      const next = new Set(prev);
      for (const id of alertIds) next.add(id);
      saveLocallyAcknowledgedAlertIds(data.activeSchool.id, data.user.id, next);
      return next;
    });
  }

  function handleLocalReopenAlert(alertId: string) {
    setLocallyAcknowledgedAlertIds((prev) => {
      const next = new Set(prev);
      next.delete(alertId);
      saveLocallyAcknowledgedAlertIds(data.activeSchool.id, data.user.id, next);
      return next;
    });
  }

  // Global Alt+A keyboard shortcut to jump directly to Alerts Center
  useEffect(() => {
    if (isSuperAdmin) return;
    function onKeyDown(e: KeyboardEvent) {
      if (!e.altKey || e.metaKey || e.ctrlKey || e.key.toLowerCase() !== 'a') return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      handleNavigateTab('alerts');
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, activeTab, data.activeSchool, data.user.role]);

  const quickDockItems = isSuperAdmin
    ? []
    : buildRoleQuickDockItems({
        data,
        allowedTabIds: allowedTabIdSet,
        unreadParentCount: unreadAttendanceCount,
      });

  const canSwitchTenant = data.user.role === 'counsellor';

  async function handleTenantSwitch(schoolId: string) {
    await apiRequest(
      '/api/auth/switch-school',
      { method: 'POST', body: JSON.stringify({ schoolId }) },
      token,
    );
    await onRefresh();
  }

  async function handleApproveReport(studentId: string) {
    await apiRequest(
      `/api/students/${studentId}/approve-report`,
      { method: 'POST', body: JSON.stringify({ status: 'Approved' }) },
      token,
    );
    await onRefresh();
  }

  function openStudentProfile(studentId: string) {
    guardNavigation(() => {
      setSelectedStudentId(studentId);
      commitTabChange('students');
    });
  }

  function openDailyHomeworkWorkspace() {
    guardNavigation(() => {
      setNotebookSubTabRequest((prev) => ({ tab: 'homework', nonce: prev.nonce + 1 }));
      commitTabChange('notebook');
    });
  }

  function openAssessmentLab(mode: AssessmentLabMode, studentId?: string | null) {
    guardNavigation(() => {
      setAssessmentLabRequest((prev) => ({
        mode,
        studentId: studentId ?? selectedStudentId ?? data.students[0]?.id ?? null,
        nonce: prev.nonce + 1,
      }));
      commitTabChange('assessments');
    });
  }

  function openPresentationStudio() {
    guardNavigation(() => {
      setAcademicsTabRequest((prev) => ({ tab: 'presentations', nonce: prev.nonce + 1 }));
      commitTabChange('academics');
    });
  }

  function openTodayWorkspace(mode: 'all' | 'attendance' = 'all') {
    const isSameView = activeTab === 'today_workspace' && todayFocusRequest.mode === mode;
    if (isSameView) return;
    guardNavigation(() => {
      setTodayFocusRequest((prev) => ({ mode, nonce: prev.nonce + 1 }));
      commitTabChange('today_workspace');
    });
  }

  function openDailyBrainGym() {
    guardNavigation(() => {
      setVcipSubTabRequest((prev) => ({ tab: 'brain_gym', nonce: prev.nonce + 1 }));
      commitTabChange('cognitive_profile');
    });
  }

  function commitTabChange(nextTab: WorkspaceTab, recordHistory = true) {
    if (recordHistory && nextTab !== activeTab) {
      setTabHistory((prev) => [...prev.slice(-11), activeTab]);
      setRecentTabs((prev) => [nextTab, ...prev.filter((t) => t !== nextTab)].slice(0, 5));
    }
    setActiveTab(nextTab);
  }

  function handleNavigateBack() {
    if (tabHistory.length === 0) return;
    const prevTab = tabHistory[tabHistory.length - 1];
    guardNavigation(() => {
      setTabHistory((prev) => prev.slice(0, -1));
      setActiveTab(prevTab);
    });
  }

  function handleNavigateTab(tab: WorkspaceTab) {
    if (isSuperAdmin) {
      setActiveTab('feature_allotment');
      return;
    }
    const tabEnabled =
      tab === 'academics'
        ? isWorkspaceTabEnabledForSchool(data.activeSchool, 'academics') ||
          isWorkspaceTabEnabledForSchool(data.activeSchool, 'interactive_learning')
        : isWorkspaceTabEnabledForSchool(data.activeSchool, tab);
    if (!tabEnabled) {
      pushToast(
        'This module is not included in your school’s allotted plan. Contact Super Admin for customization.',
        'info',
      );
      return;
    }
    if (data.user.role === 'accountant') {
      const allowedAcctTabs: WorkspaceTab[] = [
        'overview',
        'alerts',
        'finance',
        'staff_payroll',
        'campus_gate',
      ];
      const targetTab: WorkspaceTab = allowedAcctTabs.includes(tab) ? tab : 'overview';
      if (targetTab === activeTab) return;
      guardNavigation(() => commitTabChange(targetTab));
      return;
    }
    if (tab === 'overview' && data.user.role === 'teacher') {
      openTodayWorkspace('all');
      return;
    }
    if (tab === 'today_workspace') {
      openTodayWorkspace('all');
      return;
    }
    if (tab === 'interactive_learning') {
      guardNavigation(() => {
        setAcademicsTabRequest((prev) => ({ tab: 'interactive_lab', nonce: prev.nonce + 1 }));
        commitTabChange('academics');
      });
      return;
    }
    if (tab === activeTab) return;
    guardNavigation(() => commitTabChange(tab));
  }

  function handleSelectDockItem(item: RoleQuickDockItem) {
    if (item.actionMode === 'one_go_attendance') {
      openTodayWorkspace('attendance');
      return;
    }
    if (item.actionMode === 'study_games') {
      openRevisionTask('academics');
      return;
    }
    handleNavigateTab(item.tab);
  }

  const mobileBottomItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    active: boolean;
    onClick: () => void;
  }> = (() => {
    if (isSuperAdmin) {
      return [
        {
          id: 'feature_allotment',
          label: 'Plan & Features',
          icon: Sliders,
          active: true,
          onClick: () => setActiveTab('feature_allotment'),
        },
      ];
    }
    if (data.user.role === 'teacher') {
      return [
        {
          id: 'today',
          label: 'Today',
          icon: LayoutDashboard,
          active: activeTab === 'today_workspace' && todayFocusRequest.mode !== 'attendance',
          onClick: () => openTodayWorkspace('all'),
        },
        {
          id: 'attendance',
          label: 'Attendance',
          icon: UserCheck,
          active: activeTab === 'today_workspace' && todayFocusRequest.mode === 'attendance',
          onClick: () => openTodayWorkspace('attendance'),
        },
        {
          id: 'marks',
          label: 'Marks',
          icon: FileSpreadsheet,
          active: activeTab === 'marks_report_card',
          onClick: () => handleNavigateTab('marks_report_card'),
        },
        {
          id: 'notebook',
          label: 'Notebooks',
          icon: ClipboardCheck,
          active: activeTab === 'notebook',
          onClick: () => handleNavigateTab('notebook'),
        },
        {
          id: 'menu',
          label: 'More',
          icon: Menu,
          active: mobileMenuOpen,
          onClick: () => setMobileMenuOpen(true),
        },
      ];
    }
    if (data.user.role === 'parent') {
      return [
        {
          id: 'home',
          label: 'Home',
          icon: LayoutDashboard,
          active: activeTab === 'overview',
          onClick: () => handleNavigateTab('overview'),
        },
        {
          id: 'marks',
          label: 'Marks',
          icon: FileSpreadsheet,
          active: activeTab === 'marks_report_card',
          onClick: () => handleNavigateTab('marks_report_card'),
        },
        {
          id: 'students',
          label: 'Progress',
          icon: Users,
          active: activeTab === 'students',
          onClick: () => handleNavigateTab('students'),
        },
        {
          id: 'events',
          label: 'Events',
          icon: Calendar,
          active: activeTab === 'events',
          onClick: () => handleNavigateTab('events'),
        },
        {
          id: 'ops',
          label: 'Fees',
          icon: Settings2,
          active: activeTab === 'operations',
          onClick: () => handleNavigateTab('operations'),
        },
      ];
    }
    if (data.user.role === 'student') {
      return [
        {
          id: 'home',
          label: 'Home',
          icon: LayoutDashboard,
          active: activeTab === 'overview',
          onClick: () => handleNavigateTab('overview'),
        },
        {
          id: 'games',
          label: 'Games',
          icon: BookOpen,
          active: activeTab === 'academics',
          onClick: () => openRevisionTask('academics'),
        },
        {
          id: 'marks',
          label: 'Marks',
          icon: FileSpreadsheet,
          active: activeTab === 'marks_report_card',
          onClick: () => handleNavigateTab('marks_report_card'),
        },
        {
          id: 'events',
          label: 'Events',
          icon: Calendar,
          active: activeTab === 'events',
          onClick: () => handleNavigateTab('events'),
        },
        {
          id: 'menu',
          label: 'More',
          icon: Menu,
          active: mobileMenuOpen,
          onClick: () => setMobileMenuOpen(true),
        },
      ];
    }
    if (data.user.role === 'transport_incharge') {
      return [
        {
          id: 'transport',
          label: 'Bus GPS',
          icon: Bus,
          active: activeTab === 'transport',
          onClick: () => handleNavigateTab('transport'),
        },
        {
          id: 'campus_gate',
          label: 'Gate & Visitors',
          icon: ShieldCheck,
          active: activeTab === 'campus_gate',
          onClick: () => handleNavigateTab('campus_gate'),
        },
        {
          id: 'staff_payroll',
          label: 'My Payslip',
          icon: WalletCards,
          active: activeTab === 'staff_payroll',
          onClick: () => handleNavigateTab('staff_payroll'),
        },
      ];
    }
    if (data.user.role === 'accountant') {
      return [
        {
          id: 'overview',
          label: 'Overview',
          icon: LayoutDashboard,
          active: activeTab === 'overview',
          onClick: () => handleNavigateTab('overview'),
        },
        {
          id: 'finance',
          label: 'Finance',
          icon: IndianRupee,
          active: activeTab === 'finance',
          onClick: () => handleNavigateTab('finance'),
        },
        {
          id: 'staff_payroll',
          label: 'Salary',
          icon: WalletCards,
          active: activeTab === 'staff_payroll',
          onClick: () => handleNavigateTab('staff_payroll'),
        },
        {
          id: 'campus_gate',
          label: 'Gate Pass',
          icon: ShieldCheck,
          active: activeTab === 'campus_gate',
          onClick: () => handleNavigateTab('campus_gate'),
        },
      ];
    }
    if (['school_admin', 'principal', 'coordinator'].includes(data.user.role)) {
      return [
        {
          id: 'overview',
          label: 'Overview',
          icon: LayoutDashboard,
          active: activeTab === 'overview',
          onClick: () => handleNavigateTab('overview'),
        },
        {
          id: 'attendance_heatmap',
          label: 'Attendance',
          icon: Calendar,
          active: activeTab === 'attendance_heatmap',
          onClick: () => handleNavigateTab('attendance_heatmap'),
        },
        {
          id: 'staff_payroll',
          label: data.user.role === 'coordinator' ? 'Payslip' : 'Salary',
          icon: WalletCards,
          active: activeTab === 'staff_payroll',
          onClick: () => handleNavigateTab('staff_payroll'),
        },
        {
          id: 'campus_gate',
          label: 'Gate',
          icon: ShieldCheck,
          active: activeTab === 'campus_gate',
          onClick: () => handleNavigateTab('campus_gate'),
        },
        {
          id: 'menu',
          label: 'More',
          icon: Menu,
          active: mobileMenuOpen,
          onClick: () => setMobileMenuOpen(true),
        },
      ];
    }
    const isClinicalOnly = ['clinical_psychologist', 'slp', 'audiologist', 'special_educator'].includes(
      data.user.role,
    );
    const items: Array<{
      id: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      active: boolean;
      onClick: () => void;
    }> = [
      {
        id: 'primary',
        label: isClinicalOnly ? 'Clinical' : 'Overview',
        icon: isClinicalOnly ? Stethoscope : LayoutDashboard,
        active: activeTab === (isClinicalOnly ? 'clinical_care' : 'overview'),
        onClick: () => handleNavigateTab(isClinicalOnly ? 'clinical_care' : 'overview'),
      },
    ];
    if (allowedNav.some((n) => n.id === 'students')) {
      items.push({
        id: 'students',
        label: '360°',
        icon: Users,
        active: activeTab === 'students',
        onClick: () => handleNavigateTab('students'),
      });
    }
    if (!isClinicalOnly && allowedNav.some((n) => n.id === 'clinical_care')) {
      items.push({
        id: 'clinical_care',
        label: 'Care',
        icon: Stethoscope,
        active: activeTab === 'clinical_care',
        onClick: () => handleNavigateTab('clinical_care'),
      });
    }
    items.push({
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      active: mobileMenuOpen,
      onClick: () => setMobileMenuOpen(true),
    });
    return items;
  })();

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex">
      {/* Desktop Sidebar (Collapsible 256px <-> 68px Rail) — Midnight Navy Authority Surface */}
      <aside
        className={`hidden lg:flex shrink-0 flex-col border-r border-[#0D1E33] bg-[#142B46] text-[#F1F5F9] print:hidden transition-[width] duration-200 ${
          sidebarCompact ? 'w-[68px]' : 'w-64'
        }`}
      >
        <div
          className={`border-b border-[#254264] py-4 flex items-center ${
            sidebarCompact ? 'justify-center px-2' : 'justify-between gap-2 px-4'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={RAI_PLUS_LOGO_URL}
              alt="Rai Plus Logo"
              className="h-9 w-9 rounded-lg border border-[#D6B66D]/50 object-cover bg-[#F8FAFC] shrink-0"
            />
            {!sidebarCompact && (
              <div className="min-w-0">
                <p className="font-display text-base font-extrabold tracking-tight text-white whitespace-nowrap inline-flex items-baseline gap-1">
                  <span>RAI</span>
                  <span className="text-[#D6B66D]">PLUS</span>
                  <span className="text-[#D6B66D] font-black leading-none" aria-hidden="true">+</span>
                </p>
                <p className="text-[11px] text-[#94B8D3] truncate mt-0.5">
                  {roleIdentity.workspaceName}
                </p>
              </div>
            )}
          </div>
          {!sidebarCompact && (
            <button
              type="button"
              onClick={toggleSidebarCompact}
              title="Collapse sidebar for wider workspace"
              aria-label="Collapse sidebar"
              className="rounded-md p-1.5 text-[#A9C5D8] hover:bg-[#1E3B5C] hover:text-white transition-colors shrink-0"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {sidebarCompact && (
          <div className="border-b border-[#254264] py-2 flex justify-center bg-[#0F2238]/60">
            <button
              type="button"
              onClick={toggleSidebarCompact}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="rounded-md p-1.5 text-[#A9C5D8] hover:bg-[#1E3B5C] hover:text-white transition-colors"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tenant Switcher / Indicator */}
        {!sidebarCompact && (
          <div className="border-b border-[#254264] px-4 py-3 space-y-1.5 bg-[#0F2238]/60">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#A9C5D8]">
              <Building2 className="h-3.5 w-3.5 text-[#D6B66D] shrink-0" />
              <span>{isSuperAdmin ? 'Platform Scope' : 'Active School Tenant'}</span>
            </div>
            {isSuperAdmin ? (
              <p className="text-xs font-semibold text-white leading-snug">
                Multi-School Plan Control
                <span className="block font-normal text-[#A9C5D8]">
                  {data.availableSchools.length} subscribed{' '}
                  {data.availableSchools.length === 1 ? 'school' : 'schools'}
                </span>
              </p>
            ) : canSwitchTenant ? (
              <select
                aria-label="Switch active school tenant"
                value={data.activeSchool.id}
                onChange={(e) => void handleTenantSwitch(e.target.value)}
                className="w-full rounded-lg border border-[#2F5076] bg-[#142B46] px-2.5 py-1.5 text-xs font-medium text-[#F3E6D8] focus:border-[#D6B66D]"
              >
                {data.availableSchools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs font-semibold text-white leading-snug">
                {data.activeSchool.name}
                <span className="block font-normal text-[#A9C5D8]">
                  {data.activeSchool.city} · {data.activeSchool.board}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Inline Sidebar Filter for Multi-Module Roles */}
        {showSidebarQuickFilter && (
          <div className="px-3 pt-3 pb-1">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-[#A9C5D8]/70 absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="search"
                aria-label="Filter navigation modules"
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                placeholder="Filter menu..."
                className="w-full rounded-lg border border-[#254264] bg-[#0F2238]/80 pl-8 pr-7 py-1.5 text-xs text-[#F3E6D8] placeholder:text-[#A9C5D8]/60 focus:border-[#D6B66D]"
              />
              {navSearchQuery && (
                <button
                  type="button"
                  aria-label="Clear menu filter"
                  onClick={() => setNavSearchQuery('')}
                  className="absolute right-2 top-1.5 text-[#A9C5D8] hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto rai-sidebar-scroll p-2.5 space-y-3" aria-label="Workspace modules">
          {groupedNavSections.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-[#A9C5D8]/80">
              No menu items match &ldquo;{navSearchQuery}&rdquo;.
            </p>
          ) : (
            groupedNavSections.map(({ section, displayLabel, items }) => {
              const hasActiveItem = items.some(
                (item) =>
                  item.id === activeTab ||
                  (item.id === 'academics' && activeTab === 'academic_resources'),
              );
              const isCollapsed =
                !sidebarCompact &&
                !normalizedNavQuery &&
                showSectionHeaders &&
                Boolean(collapsedSections[section]) &&
                !hasActiveItem;
              return (
                <div key={section} className="space-y-1">
                  {showSectionHeaders && !sidebarCompact && (
                    <button
                      type="button"
                      onClick={() => toggleNavSection(section)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold text-[#A9C5D8]/85 hover:text-[#F3E6D8] transition-colors"
                    >
                      <span className="truncate">{displayLabel}</span>
                      <span className="inline-flex items-center gap-1 shrink-0">
                        {isCollapsed && (
                          <span className="font-mono text-[10px] text-[#A9C5D8]/60 tabular-nums">
                            {items.length}
                          </span>
                        )}
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                        )}
                      </span>
                    </button>
                  )}
                  {!isCollapsed &&
                    items.map((item) => {
                      const Icon = item.icon;
                      const active =
                        activeTab === item.id ||
                        (item.id === 'academics' && activeTab === 'academic_resources');
                      const isTodayOneGoActive =
                        item.id === 'today_workspace' &&
                        activeTab === 'today_workspace' &&
                        todayFocusRequest.mode === 'attendance';
                      return (
                        <React.Fragment key={item.id}>
                          <button
                            type="button"
                            title={sidebarCompact ? item.label : undefined}
                            aria-current={active && !isTodayOneGoActive ? 'page' : undefined}
                            onClick={() => handleNavigateTab(item.id)}
                            className={`w-full flex items-center rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
                              sidebarCompact
                                ? 'justify-center p-2.5'
                                : 'gap-2.5 px-3 py-2'
                            } ${
                              active && !isTodayOneGoActive
                                ? 'bg-[#D6B66D] text-[#0D1E33] font-semibold'
                                : 'text-slate-200 hover:bg-[#1E3B5C] hover:text-white'
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {!sidebarCompact && <span className="truncate">{item.label}</span>}
                            {!sidebarCompact && item.id === 'alerts' && alertCounts.active > 0 && (
                              <span
                                className={`ml-auto font-mono text-[11px] tabular-nums ${
                                  active
                                    ? 'text-[#0D1E33] font-bold'
                                    : alertCounts.critical > 0
                                      ? 'text-rose-300 font-bold'
                                      : 'text-[#D6B66D] font-bold'
                                }`}
                              >
                                ({alertCounts.active})
                              </span>
                            )}
                            {!sidebarCompact &&
                              item.id === 'campus_gate' &&
                              gateLiveCount > 0 &&
                              ['school_admin', 'principal', 'coordinator', 'transport_incharge'].includes(
                                data.user.role,
                              ) && (
                                <span
                                  className={`ml-auto font-mono text-[11px] tabular-nums ${
                                    active ? 'text-[#0D1E33] font-bold' : 'text-[#D6B66D] font-bold'
                                  }`}
                                >
                                  ({gateLiveCount})
                                </span>
                              )}
                          </button>
                          {!sidebarCompact && item.id === 'today_workspace' && data.user.role === 'teacher' && (
                            <button
                              type="button"
                              data-testid="nav-today-one-go-attendance"
                              aria-current={isTodayOneGoActive ? 'page' : undefined}
                              onClick={() => openTodayWorkspace('attendance')}
                              className={`w-full flex items-center gap-2 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                                isTodayOneGoActive
                                  ? 'bg-[#D6B66D] text-[#142B46] font-semibold'
                                  : 'text-[#A9C5D8] hover:bg-[#1E3B5C] hover:text-white'
                              }`}
                            >
                              <UserCheck className="h-3.5 w-3.5 shrink-0" />
                              <span>One-Go Attendance</span>
                            </button>
                          )}
                        </React.Fragment>
                      );
                    })}
                </div>
              );
            })
          )}
        </nav>

        <div
          className={`border-t border-[#254264] bg-[#0F2238]/60 ${
            sidebarCompact ? 'p-2.5 space-y-2 flex flex-col items-center' : 'p-4 space-y-2'
          }`}
        >
          {sidebarCompact ? (
            <>
              <button
                type="button"
                onClick={onSwitchUser}
                title="Switch Role Pathway"
                aria-label="Switch Role Pathway"
                className="w-full flex items-center justify-center rounded-lg border border-[#D6B66D]/50 bg-[#142B46] p-2 text-[#F3E6D8] hover:bg-[#1E3B5C] transition-colors"
              >
                <Users className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onLogout}
                title="Return to Public Site"
                aria-label="Return to Public Site"
                className="w-full flex items-center justify-center rounded-lg p-2 text-[#A9C5D8] hover:bg-[#1E3B5C] hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onSwitchUser}
                className="w-full rounded-lg border border-[#D6B66D]/50 bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-[#F3E6D8] hover:bg-[#1E3B5C] transition-colors"
              >
                Switch Role Pathway
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#A9C5D8] hover:bg-[#1E3B5C] hover:text-white transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Return to Public Site
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Workspace Header — Contextual Breadcrumb + Quick Actions */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open workspace navigation"
              className="lg:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            {tabHistory.length > 0 && !isSuperAdmin && (
              <button
                type="button"
                onClick={handleNavigateBack}
                title="Go back to previous view"
                aria-label="Go back to previous view"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-slate-500 truncate flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                onClick={() => handleNavigateTab(defaultTabForRole)}
                className="font-semibold text-slate-900 hover:text-[#1D3A5C] transition-colors whitespace-nowrap shrink-0"
              >
                {isSuperAdmin ? 'RAI PLUS PLATFORM' : data.activeSchool.code}
              </button>
              <span aria-hidden="true" className="text-slate-300 shrink-0">/</span>
              <span className="truncate font-medium text-slate-700">{currentTabLabel}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Single Role-Focused Daily Quick Action */}
            {!isSuperAdmin && data.user.role === 'teacher' && activeTab !== 'marks_report_card' && (
              <button
                type="button"
                onClick={() => handleNavigateTab('marks_report_card')}
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D3A5C] transition-colors whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#D6B66D]" />
                Enter Marks
              </button>
            )}
            {!isSuperAdmin && data.user.role === 'student' && activeTab !== 'academics' && (
              <button
                type="button"
                onClick={() => openRevisionTask('academics')}
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D3A5C] transition-colors whitespace-nowrap shrink-0"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#D6B66D]" />
                Study Games
              </button>
            )}
            {!isSuperAdmin && data.user.role === 'parent' && activeTab !== 'marks_report_card' && (
              <button
                type="button"
                onClick={() => handleNavigateTab('marks_report_card')}
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D3A5C] transition-colors whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#D6B66D]" />
                Report Card
              </button>
            )}
            {!isSuperAdmin &&
              ['school_admin', 'principal', 'coordinator'].includes(data.user.role) &&
              activeTab !== 'attendance_heatmap' && (
                <button
                  type="button"
                  onClick={() => handleNavigateTab('attendance_heatmap')}
                  className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D3A5C] transition-colors whitespace-nowrap shrink-0"
                >
                  <Calendar className="h-3.5 w-3.5 text-[#D6B66D]" />
                  Attendance
                </button>
              )}

            {isRevisionReminderRole && (
              <RevisionStreakReminderBell
                role={data.user.role === 'parent' ? 'parent' : 'student'}
                learnerName={data.students[0]?.name || data.user.name}
                status={revisionStreakStatus}
                prefs={streakPrefs}
                onStartRevision={openRevisionTask}
                onSnoozeHours={(hours) => {
                  const next = snoozeStreakReminder(data.activeSchool.id, data.user.id, hours);
                  setStreakPrefs(next);
                  pushToast(`Revision Streak reminder snoozed for ${hours} hours.`, 'info');
                }}
                onDismissToday={() => {
                  const next = dismissStreakReminderForToday(data.activeSchool.id, data.user.id);
                  setStreakPrefs(next);
                  pushToast('We will remind you again tomorrow for your daily Revision Streak.', 'info');
                }}
                onResumeReminders={() => {
                  const next = clearStreakReminderSnooze(data.activeSchool.id, data.user.id);
                  setStreakPrefs(next);
                  pushToast('Daily Revision Streak reminders resumed.', 'success');
                }}
                onToggleEnabled={(enabled) => {
                  const next = { ...streakPrefs, enabled };
                  saveReminderPrefs(data.activeSchool.id, data.user.id, next);
                  setStreakPrefs(next);
                  pushToast(
                    enabled
                      ? 'Daily Revision Streak reminders turned on.'
                      : 'Daily Revision Streak reminders paused.',
                    'info',
                  );
                }}
                onChangeThresholdHours={(hours) => {
                  const next = { ...streakPrefs, inactivityThresholdHours: hours };
                  saveReminderPrefs(data.activeSchool.id, data.user.id, next);
                  setStreakPrefs(next);
                }}
                onPreviewToast={() => triggerRevisionStreakToast(true)}
              />
            )}

            {!isSuperAdmin && (
              <button
                type="button"
                data-testid="header-alerts-center-btn"
                onClick={() => handleNavigateTab('alerts')}
                title="Open Alerts Center (Alt+A)"
                aria-label={`Open Alerts Center (${alertCounts.active} active)`}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'alerts'
                    ? 'border-[#142B46] bg-[#142B46] text-white'
                    : alertCounts.critical > 0
                      ? 'border-red-200 bg-red-50/70 text-red-800 hover:bg-red-50'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Bell
                  className={`h-3.5 w-3.5 shrink-0 ${
                    activeTab === 'alerts'
                      ? 'text-[#D6B66D]'
                      : alertCounts.critical > 0
                        ? 'text-red-700'
                        : 'text-slate-500'
                  }`}
                />
                <span className="hidden sm:inline">Alerts</span>
                {alertCounts.active > 0 && (
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      activeTab === 'alerts'
                        ? 'text-[#D6B66D]'
                        : alertCounts.critical > 0
                          ? 'text-red-700 font-bold'
                          : 'text-[#142B46] font-bold'
                    }`}
                  >
                    ({alertCounts.active})
                  </span>
                )}
              </button>
            )}

            {!isSuperAdmin && (
              <GlobalQuickJump
                data={data}
                allowedNav={allowedNav.map((n) => ({
                  id: n.id,
                  label: n.label,
                  section: n.section,
                }))}
                recentTabs={recentTabs}
                activeAlertCount={alertCounts.active}
                criticalAlertCount={alertCounts.critical}
                urgentAlerts={unifiedAlerts}
                onNavigate={handleNavigateTab}
                onOpenStudent={openStudentProfile}
                onOpenOneGoAttendance={
                  data.user.role === 'teacher' ? () => openTodayWorkspace('attendance') : undefined
                }
                onOpenStudyGames={
                  ['student', 'parent'].includes(data.user.role)
                    ? () => openRevisionTask('academics')
                    : undefined
                }
              />
            )}

            <button
              type="button"
              onClick={() => void handleManualRefresh()}
              disabled={refreshingWorkspace}
              title="Sync latest workspace data"
              aria-label="Sync latest workspace data"
              className="hidden sm:inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshingWorkspace ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onSwitchUser}
              title={`Signed in as ${data.user.name} · Click to switch role`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <span className="hidden xl:inline max-w-[120px] truncate text-slate-600 font-medium">
                {data.user.name.split(' ')[0]}
              </span>
              <span className="hidden xl:inline text-slate-300" aria-hidden="true">·</span>
              <span>Switch Role</span>
            </button>
          </div>
        </header>

        {/* Persistent 1-Click Role Daily Quick-Dock */}
        {!isSuperAdmin && (
          <RoleNavigationDock
            items={quickDockItems}
            activeTab={activeTab}
            isOneGoAttendanceActive={
              activeTab === 'today_workspace' && todayFocusRequest.mode === 'attendance'
            }
            onSelect={handleSelectDockItem}
          />
        )}

        <main className="flex-1 p-4 pb-20 sm:px-6 sm:py-6 lg:px-8 lg:py-7 lg:pb-10 max-w-7xl w-full mx-auto">
          {/* Automatic Office-Ready Print Letterhead */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={RAI_PLUS_LOGO_URL}
                  alt="Rai Plus"
                  className="h-10 w-10 rounded-lg border border-[#D6B66D] object-cover"
                />
                <div>
                  <p className="font-display text-lg font-bold text-slate-900">
                    {data.activeSchool.name}
                  </p>
                  <p className="text-xs text-slate-700 mt-0.5">
                    {data.activeSchool.city}, {data.activeSchool.state} · {data.activeSchool.board} ·
                    UDISE: {data.activeSchool.udiseCode} · MIS: {data.activeSchool.haryanaMisCode}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-700">
                <p className="font-semibold text-slate-900">{currentTabLabel}</p>
                <p className="font-mono tabular-nums mt-0.5">
                  Session {data.activeSchool.session} · Printed{' '}
                  {new Date().toISOString().slice(0, 10)}
                </p>
              </div>
            </div>
          </div>

          {isSuperAdmin ? (
            <SuperAdminFeatureAllotmentModule data={data} token={token} onRefresh={onRefresh} />
          ) : (
            <>
              {(activeTab === 'overview' || activeTab === 'today_workspace') && (
                <DashboardOverview
                  data={data}
                  token={token}
                  onRefresh={onRefresh}
                  onNavigate={handleNavigateTab}
                  onApproveStudentReport={handleApproveReport}
                  onOpenStudent={openStudentProfile}
                  onOpenDailyHomework={openDailyHomeworkWorkspace}
                  onOpenAssessmentLab={openAssessmentLab}
                  onOpenPresentationStudio={openPresentationStudio}
                  onOpenDailyBrainGym={openDailyBrainGym}
                  onOpenStudyGames={() => openRevisionTask('academics')}
                  parentLang={parentLang}
                  onChangeParentLang={handleParentLangChange}
                  initialTodayFocusMode={todayFocusRequest.mode}
                  todayFocusNonce={todayFocusRequest.nonce}
                  alertCounts={alertCounts}
                />
              )}
              {activeTab === 'alerts' && (
                <AlertsCenterPanel
                  data={data}
                  token={token}
                  alerts={unifiedAlerts}
                  counts={alertCounts}
                  onRefresh={onRefresh}
                  onNavigateTab={handleNavigateTab}
                  onOpenStudent={openStudentProfile}
                  onLocalAcknowledge={handleLocalAcknowledgeAlerts}
                  onLocalReopen={handleLocalReopenAlert}
                />
              )}
              {activeTab === 'clinical_care' && (
                <ClinicalCareCenterModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'attendance_heatmap' && (
                <AttendanceHeatmapModule
                  workspace={data}
                  user={data.user}
                  token={token}
                  onRefresh={onRefresh}
                />
              )}
              {activeTab === 'notebook' && (
                <NotebookCheckModule
                  data={data}
                  token={token}
                  onRefresh={onRefresh}
                  onOpenStudent={openStudentProfile}
                  initialSubTab={notebookSubTabRequest.tab}
                  initialSubTabNonce={notebookSubTabRequest.nonce}
                />
              )}
              {activeTab === 'marks_report_card' && (
                <MarksReportCardModule
                  data={data}
                  token={token}
                  onRefresh={onRefresh}
                  initialStudentId={selectedStudentId || undefined}
                />
              )}
              {activeTab === 'students' && (
                <Student360Module
                  data={data}
                  token={token}
                  selectedStudentId={selectedStudentId}
                  onSelectStudent={setSelectedStudentId}
                  onRefresh={onRefresh}
                  onApproveStudentReport={handleApproveReport}
                  onOpenGames={() => handleNavigateTab('games')}
                  onOpenAssessmentLab={openAssessmentLab}
                  parentLang={parentLang}
                />
              )}
              {activeTab === 'remedials' && (
                <DevelopmentalRemedialDashboardModule
                  data={data}
                  token={token}
                  onRefresh={onRefresh}
                  onOpenStudent={openStudentProfile}
                  onOpenAssessmentLab={openAssessmentLab}
                />
              )}
              {activeTab === 'games' && (
                <IntelligenceGamesModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'assessments' && (
                <ReadingNumeracyLabModule
                  data={data}
                  token={token}
                  onRefresh={onRefresh}
                  initialMode={assessmentLabRequest.mode}
                  initialStudentId={assessmentLabRequest.studentId}
                  modeNonce={assessmentLabRequest.nonce}
                />
              )}
              {activeTab === 'academic_resources' && (
                <AcademicResourcesModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {(activeTab === 'academics' || activeTab === 'interactive_learning') && (
                <AcademicsModule
                  data={data}
                  token={token}
                  onRefresh={onRefresh}
                  initialSubTab={
                    activeTab === 'interactive_learning'
                      ? 'interactive_lab'
                      : academicsTabRequest.tab
                  }
                  initialSubTabNonce={academicsTabRequest.nonce}
                  interactiveLabEnabled={isWorkspaceTabEnabledForSchool(
                    data.activeSchool,
                    'interactive_learning',
                  )}
                  onOpenOneGoAttendance={
                    data.user.role === 'teacher'
                      ? () => openTodayWorkspace('attendance')
                      : undefined
                  }
                />
              )}
              {activeTab === 'cognitive_profile' && (
                <CognitiveIntelligenceModule
                  data={data}
                  token={token}
                  onRefresh={onRefresh}
                  onNavigateCareer={() => handleNavigateTab('career')}
                  initialSubTab={vcipSubTabRequest.tab}
                  initialSubTabNonce={vcipSubTabRequest.nonce}
                />
              )}
              {activeTab === 'thinking' && (
                <UnifiedThinkingModule
                  data={data}
                  token={token}
                  onRefresh={onRefresh}
                  onOpenStudent={openStudentProfile}
                />
              )}
              {activeTab === 'psychometric' && (
                <PsychometricSuiteModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'computer_skills' && (
                <ComputerSkillTestModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'timetable_leave' && (
                <SmartTimetableLeaveModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'productivity' && (
                <TeacherProductivityModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'career' && (
                <CareerIntelligenceWorkspace data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'admissions' && (
                <AdmissionsAndCareerModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'finance' && (
                <FinancialDashboardModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'families' && (
                <FamilyManagementModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'events' && (
                <SchoolEventsModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'transport' && (
                <TransportManagementModule data={data} token={token} onRefresh={onRefresh} />
              )}
              {activeTab === 'staff_payroll' && (
                <StaffAttendanceSalaryModule
                  data={data}
                  token={token}
                  onRefresh={onRefresh}
                />
              )}
              {activeTab === 'campus_gate' && (
                <CampusGateVisitorsModule
                  data={data}
                  token={token}
                  onRefresh={onRefresh}
                />
              )}
              {activeTab === 'operations' && (
                <OperationsAndGovernanceModule
                  data={data}
                  token={token}
                  onRefresh={onRefresh}
                  parentLang={parentLang}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-[#142B46] text-[#F3E6D8] h-full flex flex-col border-r border-[#0E2036] z-10 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#254264] pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={RAI_PLUS_LOGO_URL}
                  alt="Rai Plus Logo"
                  className="h-8 w-8 rounded-lg border border-[#D6B66D]/50 object-cover bg-[#F3E6D8]"
                />
                <span className="font-display font-extrabold tracking-tight text-white inline-flex items-baseline gap-1">
                  <span>RAI</span>
                  <span className="text-[#D6B66D]">PLUS</span>
                  <span className="text-[#D6B66D] font-black leading-none" aria-hidden="true">+</span>
                </span>
              </div>
              <button
                type="button"
                aria-label="Close workspace navigation"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-[#A9C5D8] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-3 flex-1 overflow-y-auto rai-sidebar-scroll" aria-label="Mobile workspace modules">
              {groupedNavSections.map(({ section, displayLabel, items }) => (
                <div key={section} className="space-y-1">
                  {showSectionHeaders && (
                    <p className="px-2.5 pt-1 text-[11px] font-semibold text-[#A9C5D8]/80">
                      {displayLabel}
                    </p>
                  )}
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      activeTab === item.id ||
                      (item.id === 'academics' && activeTab === 'academic_resources');
                    const isTodayOneGoActive =
                      item.id === 'today_workspace' &&
                      activeTab === 'today_workspace' &&
                      todayFocusRequest.mode === 'attendance';
                    return (
                      <React.Fragment key={item.id}>
                        <button
                          type="button"
                          aria-current={active && !isTodayOneGoActive ? 'page' : undefined}
                          onClick={() => {
                            handleNavigateTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                            active && !isTodayOneGoActive
                              ? 'bg-[#D6B66D] text-[#142B46]'
                              : 'text-[#F3E6D8]/90 hover:bg-[#1E3B5C] hover:text-white'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {item.id === 'alerts' && alertCounts.active > 0 && (
                            <span
                              className={`ml-auto font-mono text-[11px] tabular-nums ${
                                active
                                  ? 'text-[#142B46] font-bold'
                                  : alertCounts.critical > 0
                                    ? 'text-rose-300 font-bold'
                                    : 'text-[#D6B66D] font-bold'
                              }`}
                            >
                              ({alertCounts.active})
                            </span>
                          )}
                        </button>
                        {item.id === 'today_workspace' && data.user.role === 'teacher' && (
                          <button
                            type="button"
                            aria-current={isTodayOneGoActive ? 'page' : undefined}
                            onClick={() => {
                              openTodayWorkspace('attendance');
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium ${
                              isTodayOneGoActive
                                ? 'bg-[#D6B66D] text-[#142B46] font-semibold'
                                : 'text-[#A9C5D8] hover:bg-[#1E3B5C] hover:text-white'
                            }`}
                          >
                            <UserCheck className="h-3.5 w-3.5 shrink-0" />
                            <span>One-Go Attendance</span>
                          </button>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="border-t border-[#254264] pt-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSwitchUser();
                }}
                className="w-full rounded-lg border border-[#D6B66D]/50 bg-[#142B46] px-3 py-2 text-xs font-semibold text-[#F3E6D8] hover:bg-[#1E3B5C] transition-colors"
              >
                Switch Role Pathway
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[#A9C5D8] hover:bg-[#1E3B5C] hover:text-white transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Return to Public Site
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thumb-Friendly Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile quick workspace navigation"
        data-testid="erp-mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-14 border-t border-slate-200 bg-white/95 backdrop-blur-xs flex items-stretch print:hidden"
      >
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                item.active ? 'text-blue-900 bg-blue-50/60' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate max-w-full px-1">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Unsaved-Changes Tab Switch Guard Modal */}
      {pendingNavAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsaved-changes-title"
          data-testid="unsaved-changes-guard-modal"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-amber-800">Unsaved Roster Edits</p>
              <h3
                id="unsaved-changes-title"
                className="font-display text-lg font-bold text-slate-900"
              >
                Leave without saving?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{pendingNavAction.warning}</p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingNavAction(null)}
                className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                Stay &amp; Save
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = pendingNavAction.proceed;
                  clearAllDirtyStates();
                  setPendingNavAction(null);
                  next();
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Discard &amp; Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Non-Blocking Toast Viewport */}
      <ToastViewport />
    </div>
  );
};
