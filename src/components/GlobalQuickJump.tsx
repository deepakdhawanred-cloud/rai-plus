import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Command,
  FileSpreadsheet,
  IndianRupee,
  LayoutGrid,
  Search,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';

export interface QuickJumpNavItem {
  id: WorkspaceTab;
  label: string;
  section: string;
}

interface GlobalQuickJumpProps {
  data: WorkspaceData;
  allowedNav: QuickJumpNavItem[];
  recentTabs?: WorkspaceTab[];
  onNavigate: (tab: WorkspaceTab) => void;
  onOpenStudent: (studentId: string) => void;
  onOpenOneGoAttendance?: () => void;
  onOpenStudyGames?: () => void;
}

interface JumpResult {
  id: string;
  category: 'Recent' | 'Quick Action' | 'Module' | 'Student' | 'Fee Ledger';
  title: string;
  subtitle: string;
  icon: 'recent' | 'attendance' | 'marks' | 'games' | 'finance' | 'module' | 'student';
  onSelect: () => void;
}

export const GlobalQuickJump: React.FC<GlobalQuickJumpProps> = ({
  data,
  allowedNav,
  recentTabs = [],
  onNavigate,
  onOpenStudent,
  onOpenOneGoAttendance,
  onOpenStudyGames,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const role = data.user.role;
  const isAccountant = role === 'accountant';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  const isParent = role === 'parent';
  const isLeadership = ['school_admin', 'principal', 'coordinator'].includes(role);
  const canOpenStudents = !isAccountant && allowedNav.some((n) => n.id === 'students');
  const hasTab = (tabId: WorkspaceTab) => allowedNav.some((n) => n.id === tabId);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo<JumpResult[]>(() => {
    const q = query.trim().toLowerCase();
    const list: JumpResult[] = [];

    // 1. Recently visited modules when query is empty
    if (!q && recentTabs.length > 0) {
      for (const tabId of recentTabs.slice(0, 3)) {
        const navItem = allowedNav.find((n) => n.id === tabId);
        if (!navItem) continue;
        list.push({
          id: `recent-${navItem.id}`,
          category: 'Recent',
          title: navItem.label,
          subtitle: `Jump back · ${navItem.section}`,
          icon: 'recent',
          onSelect: () => {
            onNavigate(navItem.id);
            setOpen(false);
          },
        });
      }
    }

    // 2. Role-scoped Quick Actions
    const quickActions: Array<JumpResult & { keywords: string }> = [];
    if (isTeacher && onOpenOneGoAttendance) {
      quickActions.push({
        id: 'qa-one-go-attendance',
        category: 'Quick Action',
        title: 'Mark Class Attendance (Manual / RFID / Bio)',
        subtitle: 'Whole-class roll call & live scan desk inside Today Workspace',
        icon: 'attendance',
        keywords: 'attendance roll call rfid biometric scan present absent',
        onSelect: () => {
          onOpenOneGoAttendance();
          setOpen(false);
        },
      });
    }
    if ((isTeacher || isLeadership) && hasTab('marks_report_card')) {
      quickActions.push({
        id: 'qa-marks',
        category: 'Quick Action',
        title: 'Enter Exam Marks & Report Cards',
        subtitle: 'Add Class Test, UT, Half-Yearly, or Annual marks & print reports',
        icon: 'marks',
        keywords: 'marks exam ut unit test semester report card grade',
        onSelect: () => {
          onNavigate('marks_report_card');
          setOpen(false);
        },
      });
    }
    if (isLeadership && hasTab('attendance_heatmap')) {
      quickActions.push({
        id: 'qa-leader-attendance',
        category: 'Quick Action',
        title: 'School Attendance & RFID/Biometric Desk',
        subtitle: 'Review campus attendance heatmap or mark class attendance',
        icon: 'attendance',
        keywords: 'attendance heatmap rfid biometric present absent',
        onSelect: () => {
          onNavigate('attendance_heatmap');
          setOpen(false);
        },
      });
    }
    if ((isStudent || isParent) && hasTab('academics')) {
      quickActions.push({
        id: 'qa-study-games',
        category: 'Quick Action',
        title: 'Open Study Games & Interactive Lab',
        subtitle: 'Quick Revise games, chapter simulations, and class resources',
        icon: 'games',
        keywords: 'games quick revise study lab interactive chapter quiz',
        onSelect: () => {
          if (onOpenStudyGames) {
            onOpenStudyGames();
          } else {
            onNavigate('academics');
          }
          setOpen(false);
        },
      });
    }
    if ((isStudent || isParent) && hasTab('marks_report_card')) {
      quickActions.push({
        id: 'qa-family-report-card',
        category: 'Quick Action',
        title: isParent ? 'View Child Report Card & Marks' : 'View My Report Card & Marks',
        subtitle: 'Term scores, skill evaluations, and printable progress report',
        icon: 'marks',
        keywords: 'report card marks exam result skills grade',
        onSelect: () => {
          onNavigate('marks_report_card');
          setOpen(false);
        },
      });
    }
    if (isAccountant) {
      quickActions.push({
        id: 'qa-finance-360',
        category: 'Quick Action',
        title: 'Open Finance 360° & Fee Ledgers',
        subtitle: 'Collect fees, review receipts, payroll, and bank reconciliation',
        icon: 'finance',
        keywords: 'fee ledger receipt payroll accounts reconciliation',
        onSelect: () => {
          onNavigate('finance');
          setOpen(false);
        },
      });
    }

    for (const qa of quickActions) {
      if (!q || `${qa.title} ${qa.subtitle} ${qa.keywords}`.toLowerCase().includes(q)) {
        list.push(qa);
      }
    }

    // 3. Allowed Navigation Modules
    for (const item of allowedNav) {
      const hay = `${item.label} ${item.section} ${item.id}`.toLowerCase();
      if (!q || hay.includes(q)) {
        list.push({
          id: `mod-${item.id}`,
          category: 'Module',
          title: item.label,
          subtitle: item.section,
          icon: 'module',
          onSelect: () => {
            onNavigate(item.id);
            setOpen(false);
          },
        });
      }
    }

    // 4. Students (for non-accountant roles) OR Fee Accounts (for accountant)
    if (isAccountant) {
      const accounts = data.feeAccounts || [];
      const matchedAccounts = accounts
        .filter((acc) => {
          if (!q) return acc.balanceFeesInr > 0;
          const hay = `${acc.studentName} ${acc.className} ${acc.admissionNo} ${acc.fatherName || ''}`.toLowerCase();
          return hay.includes(q);
        })
        .slice(0, q ? 10 : 5);

      for (const acc of matchedAccounts) {
        list.push({
          id: `fee-${acc.id}`,
          category: 'Fee Ledger',
          title: `${acc.studentName} · Class ${acc.className}`,
          subtitle: `Adm ${acc.admissionNo} · Balance ₹${acc.balanceFeesInr.toLocaleString('en-IN')}`,
          icon: 'finance',
          onSelect: () => {
            onNavigate('finance');
            setOpen(false);
          },
        });
      }
    } else if (canOpenStudents) {
      const matchedStudents = data.students
        .filter((st) => {
          if (!q) return true;
          const hay = `${st.name} ${st.classSection} ${st.admissionNo} ${st.rollNo} ${st.guardianName}`.toLowerCase();
          return hay.includes(q);
        })
        .slice(0, q ? 12 : 6);

      for (const st of matchedStudents) {
        list.push({
          id: `stu-${st.id}`,
          category: 'Student',
          title: `${st.name} · Class ${st.classSection}`,
          subtitle: `Roll ${st.rollNo} · Adm ${st.admissionNo} · Guardian: ${st.guardianName}`,
          icon: 'student',
          onSelect: () => {
            onOpenStudent(st.id);
            setOpen(false);
          },
        });
      }
    }

    return list.slice(0, 20);
  }, [
    query,
    recentTabs,
    isTeacher,
    isLeadership,
    isStudent,
    isParent,
    isAccountant,
    canOpenStudents,
    allowedNav,
    data.students,
    data.feeAccounts,
    onNavigate,
    onOpenStudent,
    onOpenOneGoAttendance,
    onOpenStudyGames,
  ]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  function handleModalKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      results[activeIndex].onSelect();
    }
  }

  function renderResultIcon(icon: JumpResult['icon']) {
    switch (icon) {
      case 'recent':
        return <Clock className="h-4 w-4 text-amber-700" />;
      case 'attendance':
        return <UserCheck className="h-4 w-4 text-[#142B46]" />;
      case 'marks':
        return <FileSpreadsheet className="h-4 w-4 text-[#142B46]" />;
      case 'games':
        return <BookOpen className="h-4 w-4 text-[#142B46]" />;
      case 'finance':
        return <IndianRupee className="h-4 w-4 text-emerald-700" />;
      case 'student':
        return <User className="h-4 w-4 text-slate-500" />;
      default:
        return <LayoutGrid className="h-4 w-4 text-slate-400" />;
    }
  }

  return (
    <>
      <button
        type="button"
        data-testid="global-quick-jump-trigger"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900 transition-colors max-w-[200px] sm:max-w-[250px] whitespace-nowrap shrink-0"
      >
        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span className="truncate hidden sm:inline">
          {isAccountant ? 'Search fee ledgers...' : 'Quick jump...'}
        </span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 shrink-0">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 backdrop-blur-[1px] px-4 pt-14 sm:pt-20"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Quick Jump Search"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleModalKeyDown}
            className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isAccountant
                    ? 'Search student ledger, admission no, or finance tool...'
                    : 'Jump to student, class (e.g. 6-A), action, or module...'
                }
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-100"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                aria-label="Close quick jump"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto py-1">
              {results.length === 0 ? (
                <div className="px-4 py-10 text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-700">
                    No matching items for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Try searching a student name, roll number, class section, or module name.
                  </p>
                </div>
              ) : (
                results.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  const showCategoryHeader =
                    idx === 0 || results[idx - 1].category !== item.category;
                  return (
                    <React.Fragment key={item.id}>
                      {showCategoryHeader && (
                        <div className="px-4 pt-2.5 pb-1 text-[11px] font-semibold text-slate-400 bg-white">
                          {item.category}
                        </div>
                      )}
                      <button
                        ref={(el) => {
                          itemRefs.current[idx] = el;
                        }}
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={item.onSelect}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                          isActive ? 'bg-[#FAF4EC] text-[#142B46]' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0">{renderResultIcon(item.icon)}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate tabular-nums">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>
                        <ArrowRight
                          className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                            isActive ? 'text-[#142B46] translate-x-0.5' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5 truncate">
                <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                {data.activeSchool.code} · {results.length} results
              </span>
              <span className="font-mono shrink-0">↑ ↓ Navigate · Enter Open · Esc Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
