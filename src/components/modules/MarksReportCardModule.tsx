import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit3,
  FileSpreadsheet,
  Filter,
  MessageSquare,
  Printer,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ExamCategory, ExamMark } from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import {
  buildStudentReportCard,
  computeGrade,
  EXAM_CATEGORIES,
  EXAM_PRESETS_BY_CATEGORY,
  EXAM_TERMS,
  inferExamCategory,
} from '../../utils/marksReportCardEngine';
import { resolveTodayIsoDate } from '../../utils/visAcademicProgressEngine';
import { StudentReportCardView } from '../StudentReportCardView';
import { pushToast } from '../ToastProvider';

interface MarksReportCardModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  initialStudentId?: string;
}

const DEFAULT_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Hindi',
  'Social Science',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Accountancy',
  'Business Studies',
  'History',
  'Political Science',
  'Geography',
  'Sanskrit',
];

interface DraftRowState {
  obtained: string;
  remarks: string;
  conceptualGap: string;
}

type StaffSubTab = 'entry' | 'ledger' | 'report_card';
type FamilySubTab = 'overview' | 'report_card';
type RosterQuickFilter = 'all' | 'ungraded' | 'needs_support';

function scoreToneClass(pct: number): string {
  if (pct >= 80) return 'text-emerald-700';
  if (pct >= 60) return 'text-[#142B46]';
  if (pct >= 45) return 'text-amber-700';
  return 'text-rose-700';
}

function barFillClass(pct: number): string {
  if (pct >= 80) return 'bg-[#3D6349]';
  if (pct >= 60) return 'bg-[#2B547E]';
  if (pct >= 45) return 'bg-[#C49A3D]';
  return 'bg-rose-600';
}

export const MarksReportCardModule: React.FC<MarksReportCardModuleProps> = ({
  data,
  token,
  onRefresh,
  initialStudentId,
}) => {
  const role = data.user.role;
  const isFamily = role === 'parent' || role === 'student';
  const canEditMarks = ['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher'].includes(
    role,
  );

  // Focused sub-views (eliminates vertical scroll wall between entry and ledger)
  const [staffSubTab, setStaffSubTab] = useState<StaffSubTab>(canEditMarks ? 'entry' : 'ledger');
  const [familySubTab, setFamilySubTab] = useState<FamilySubTab>('overview');

  // Available classes & subjects scoped to user's visible students / timetable
  const classList = useMemo(() => {
    const set = new Set<string>();
    for (const s of data.students) set.add(s.classSection);
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [data.students]);

  const [selectedClass, setSelectedClass] = useState<string>(
    () => data.user.classTeacherOf || classList[0] || '',
  );

  useEffect(() => {
    if (classList.length > 0 && !classList.includes(selectedClass)) {
      setSelectedClass(
        data.user.classTeacherOf && classList.includes(data.user.classTeacherOf)
          ? data.user.classTeacherOf
          : classList[0],
      );
    }
  }, [classList, selectedClass, data.user.classTeacherOf]);

  const classSubjects = useMemo(() => {
    const set = new Set<string>();
    for (const slot of data.timetable || []) {
      if (!selectedClass || slot.classSection === selectedClass) {
        if (slot.subject?.trim()) set.add(slot.subject.trim());
      }
    }
    if (data.user.subjectSpecialty?.trim()) {
      set.add(data.user.subjectSpecialty.trim());
    }
    for (const m of data.examMarks || []) {
      if (m.subject?.trim()) set.add(m.subject.trim());
    }
    for (const sub of DEFAULT_SUBJECTS) set.add(sub);
    return Array.from(set);
  }, [data.timetable, data.user.subjectSpecialty, data.examMarks, selectedClass]);

  // Bulk Marks Entry Form State (Teachers / Leadership)
  const [examType, setExamType] = useState<ExamCategory>('Class Test');
  const [examName, setExamName] = useState<string>('Class Test 1');
  const [subject, setSubject] = useState<string>(
    () => data.user.subjectSpecialty || classSubjects[0] || 'Mathematics',
  );
  const [term, setTerm] = useState<string>('Term 1');
  const [maxMarks, setMaxMarks] = useState<number>(20);
  const [examDate, setExamDate] = useState<string>(() => resolveTodayIsoDate());
  const [draftRows, setDraftRows] = useState<Record<string, DraftRowState>>({});
  const [baselineRows, setBaselineRows] = useState<Record<string, DraftRowState>>({});
  const [savingBatch, setSavingBatch] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  // Rapid grading UX controls
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const [rosterFilter, setRosterFilter] = useState<RosterQuickFilter>('all');
  const [showRemarksCols, setShowRemarksCols] = useState<boolean>(false);
  const [expandedNoteIds, setExpandedNoteIds] = useState<Record<string, boolean>>({});
  const markInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Ledger Filter State
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState<'All' | ExamCategory>('All');
  const [ledgerClassFilter, setLedgerClassFilter] = useState<string>('All');
  const [ledgerSubjectFilter, setLedgerSubjectFilter] = useState<string>('All');
  const [ledgerSearch, setLedgerSearch] = useState<string>('');

  // Inline Edit & Two-step Delete State
  const [editingMark, setEditingMark] = useState<ExamMark | null>(null);
  const [editObtained, setEditObtained] = useState<string>('');
  const [editMax, setEditMax] = useState<string>('');
  const [editExamName, setEditExamName] = useState<string>('');
  const [editExamType, setEditExamType] = useState<ExamCategory>('Class Test');
  const [editRemarks, setEditRemarks] = useState<string>('');
  const [editGap, setEditGap] = useState<string>('');
  const [editBusy, setEditBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);

  // Selected Student for Report Card (and Parent Child Switcher)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    () => initialStudentId || data.students[0]?.id || '',
  );

  useEffect(() => {
    if (data.students.length > 0 && !data.students.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(data.students[0].id);
    }
  }, [data.students, selectedStudentId]);

  const studentsById = useMemo(() => {
    return new Map(data.students.map((s) => [s.id, s]));
  }, [data.students]);

  const classRoster = useMemo(
    () =>
      data.students
        .filter((s) => s.classSection === selectedClass)
        .sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true })),
    [data.students, selectedClass],
  );

  // Pre-fill draft rows from existing marks whenever class / examType / examName / subject changes
  useEffect(() => {
    if (!canEditMarks) return;
    const nextDraft: Record<string, DraftRowState> = {};
    for (const stu of classRoster) {
      const existing = (data.examMarks || []).find(
        (m) =>
          m.studentId === stu.id &&
          inferExamCategory(m) === examType &&
          m.examName.toLowerCase() === examName.trim().toLowerCase() &&
          m.subject.toLowerCase() === subject.trim().toLowerCase(),
      );
      nextDraft[stu.id] = {
        obtained: existing ? String(existing.obtainedMarks) : '',
        remarks: existing?.remarks || '',
        conceptualGap: existing?.conceptualGap || '',
      };
    }
    setDraftRows(nextDraft);
    setBaselineRows(nextDraft);
    setBatchError(null);
  }, [canEditMarks, classRoster, data.examMarks, examType, examName, subject]);

  // Live telemetry for the active grading sheet
  const draftTelemetry = useMemo(() => {
    let graded = 0;
    let dirtyCount = 0;
    let invalidCount = 0;
    let needsSupport = 0;
    let sumPct = 0;
    let highest: number | null = null;
    let lowest: number | null = null;

    for (const stu of classRoster) {
      const d = draftRows[stu.id] || { obtained: '', remarks: '', conceptualGap: '' };
      const b = baselineRows[stu.id] || { obtained: '', remarks: '', conceptualGap: '' };
      if (
        d.obtained !== b.obtained ||
        d.remarks !== b.remarks ||
        d.conceptualGap !== b.conceptualGap
      ) {
        dirtyCount++;
      }
      if (d.obtained.trim() !== '') {
        const val = Number(d.obtained);
        if (Number.isFinite(val) && val >= 0 && val <= maxMarks) {
          graded++;
          const pct = (val / maxMarks) * 100;
          sumPct += pct;
          if (pct < 50) needsSupport++;
          highest = highest === null ? val : Math.max(highest, val);
          lowest = lowest === null ? val : Math.min(lowest, val);
        } else {
          invalidCount++;
        }
      }
    }

    const total = classRoster.length;
    const avgPct = graded > 0 ? Math.round(sumPct / graded) : null;
    const progressPct = total > 0 ? Math.round((graded / total) * 100) : 0;

    return {
      total,
      graded,
      ungraded: Math.max(0, total - graded),
      dirtyCount,
      invalidCount,
      needsSupport,
      avgPct,
      highest,
      lowest,
      progressPct,
    };
  }, [classRoster, draftRows, baselineRows, maxMarks]);

  const visibleRoster = useMemo(() => {
    const q = rosterSearch.trim().toLowerCase();
    return classRoster.filter((stu) => {
      if (q && !stu.name.toLowerCase().includes(q) && !stu.rollNo.toLowerCase().includes(q)) {
        return false;
      }
      const d = draftRows[stu.id];
      const raw = d?.obtained.trim() || '';
      if (rosterFilter === 'ungraded') return raw === '';
      if (rosterFilter === 'needs_support') {
        if (raw === '') return false;
        const val = Number(raw);
        return Number.isFinite(val) && (val / maxMarks) * 100 < 50;
      }
      return true;
    });
  }, [classRoster, draftRows, maxMarks, rosterFilter, rosterSearch]);

  const handleCategorySwitch = (nextCat: ExamCategory) => {
    setExamType(nextCat);
    const preset = EXAM_PRESETS_BY_CATEGORY[nextCat];
    setExamName(preset.presets[0]);
    setMaxMarks(preset.defaultMax);
  };

  const handleResetDraft = () => {
    setDraftRows(baselineRows);
    setBatchError(null);
    pushToast('Unsaved draft edits reverted to last saved marks.', 'info');
  };

  const jumpToNextUngraded = () => {
    const target = visibleRoster.find((stu) => !(draftRows[stu.id]?.obtained || '').trim());
    if (!target) {
      pushToast('All visible students in this sheet have marks entered.', 'info');
      return;
    }
    const inputEl = markInputRefs.current[target.id];
    if (inputEl) {
      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputEl.focus();
      inputEl.select();
    }
  };

  const handleMarkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, visibleIdx: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextStu = visibleRoster[visibleIdx + 1];
      if (nextStu) {
        const nextEl = markInputRefs.current[nextStu.id];
        nextEl?.focus();
        nextEl?.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevStu = visibleRoster[visibleIdx - 1];
      if (prevStu) {
        const prevEl = markInputRefs.current[prevStu.id];
        prevEl?.focus();
        prevEl?.select();
      }
    }
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchError(null);
    const cleanExam = examName.trim();
    const cleanSubject = subject.trim();
    if (!selectedClass || !cleanExam || !cleanSubject) {
      setBatchError('Please choose a class, exam title, and subject.');
      return;
    }

    const rows: Array<{
      studentId: string;
      obtainedMarks: number;
      remarks?: string;
      conceptualGap?: string;
    }> = [];

    for (const stu of classRoster) {
      const draft = draftRows[stu.id];
      if (!draft || draft.obtained.trim() === '') continue;
      const val = Number(draft.obtained);
      if (!Number.isFinite(val) || val < 0 || val > maxMarks) {
        setBatchError(
          `Invalid mark for ${stu.name} (Roll ${stu.rollNo}): must be between 0 and ${maxMarks}.`,
        );
        return;
      }
      rows.push({
        studentId: stu.id,
        obtainedMarks: val,
        remarks: draft.remarks.trim() || undefined,
        conceptualGap: draft.conceptualGap.trim() || undefined,
      });
    }

    if (rows.length === 0) {
      setBatchError('Enter marks for at least one student before saving.');
      return;
    }

    setSavingBatch(true);
    try {
      await apiRequest(
        '/api/marks/batch',
        {
          method: 'POST',
          body: JSON.stringify({
            classSection: selectedClass,
            examType,
            examName: cleanExam,
            subject: cleanSubject,
            term,
            maxMarks,
            date: examDate,
            rows,
          }),
        },
        token,
      );
      await onRefresh();
      pushToast(
        `${examType} saved: ${rows.length} mark${rows.length === 1 ? '' : 's'} for ${cleanExam} (${cleanSubject}, Class ${selectedClass}) synced to parent portals.`,
        'success',
      );
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : 'Unable to save marks right now.');
    } finally {
      setSavingBatch(false);
    }
  };

  const openEditMark = (mark: ExamMark) => {
    setEditingMark(mark);
    setEditObtained(String(mark.obtainedMarks));
    setEditMax(String(mark.maxMarks));
    setEditExamName(mark.examName);
    setEditExamType(inferExamCategory(mark));
    setEditRemarks(mark.remarks || '');
    setEditGap(mark.conceptualGap || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMark) return;
    setEditBusy(true);
    try {
      await apiRequest(
        `/api/marks/${editingMark.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            examName: editExamName.trim(),
            examType: editExamType,
            maxMarks: Number(editMax),
            obtainedMarks: Number(editObtained),
            remarks: editRemarks.trim(),
            conceptualGap: editGap.trim(),
          }),
        },
        token,
      );
      setEditingMark(null);
      await onRefresh();
      pushToast('Mark updated and student report card recalculated.', 'success');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Could not update mark.', 'error');
    } finally {
      setEditBusy(false);
    }
  };

  const handleDeleteMark = async (markId: string) => {
    setDeleteBusyId(markId);
    try {
      await apiRequest(`/api/marks/${markId}`, { method: 'DELETE' }, token);
      setConfirmDeleteId(null);
      await onRefresh();
      pushToast('Exam mark entry removed from the ledger.', 'info');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Could not delete mark.', 'error');
    } finally {
      setDeleteBusyId(null);
    }
  };

  // Enriched marks list for tables & analytics
  const enrichedMarks = useMemo(() => {
    const scopeStudentId = isFamily ? selectedStudentId : null;
    return (data.examMarks || [])
      .filter((m) => (!scopeStudentId || m.studentId === scopeStudentId) && m.maxMarks > 0)
      .map((m) => {
        const student = studentsById.get(m.studentId);
        const category = inferExamCategory(m);
        const pct = Math.round((m.obtainedMarks / m.maxMarks) * 100);
        return {
          ...m,
          studentName: student?.name || 'Student',
          classSection: student?.classSection || '—',
          rollNo: student?.rollNo || '—',
          category,
          pct,
          grade: computeGrade(pct),
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.examMarks, isFamily, selectedStudentId, studentsById]);

  const filteredLedgerMarks = useMemo(() => {
    const q = ledgerSearch.trim().toLowerCase();
    return enrichedMarks.filter((m) => {
      if (ledgerCategoryFilter !== 'All' && m.category !== ledgerCategoryFilter) return false;
      if (!isFamily && ledgerClassFilter !== 'All' && m.classSection !== ledgerClassFilter) {
        return false;
      }
      if (ledgerSubjectFilter !== 'All' && m.subject !== ledgerSubjectFilter) return false;
      if (
        q &&
        !m.studentName.toLowerCase().includes(q) &&
        !m.examName.toLowerCase().includes(q) &&
        !m.subject.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [
    enrichedMarks,
    ledgerCategoryFilter,
    ledgerClassFilter,
    ledgerSubjectFilter,
    ledgerSearch,
    isFamily,
  ]);

  const kpiSummary = useMemo(() => {
    const source = isFamily ? enrichedMarks : filteredLedgerMarks;
    const calc = (list: typeof enrichedMarks) => {
      if (list.length === 0) return { count: 0, avg: null as number | null };
      const avg = Math.round(list.reduce((s, m) => s + m.pct, 0) / list.length);
      return { count: list.length, avg };
    };
    return {
      all: calc(source),
      classTest: calc(source.filter((m) => m.category === 'Class Test')),
      ut: calc(source.filter((m) => m.category === 'UT')),
      semester: calc(source.filter((m) => m.category === 'Semester Exam')),
    };
  }, [enrichedMarks, filteredLedgerMarks, isFamily]);

  const gradeDistribution = useMemo(() => {
    const total = filteredLedgerMarks.length;
    const buckets = [
      { key: 'distinction', label: 'A1–A2 · Distinction (81–100%)', color: 'bg-[#3D6349]', count: 0 },
      { key: 'proficient', label: 'B1–B2 · Proficient (61–80%)', color: 'bg-[#2B547E]', count: 0 },
      { key: 'developing', label: 'C1–C2 · Developing (41–60%)', color: 'bg-[#C49A3D]', count: 0 },
      { key: 'focus', label: 'D–E · Needs Focus (<41%)', color: 'bg-rose-600', count: 0 },
    ];
    for (const m of filteredLedgerMarks) {
      if (m.pct >= 81) buckets[0].count++;
      else if (m.pct >= 61) buckets[1].count++;
      else if (m.pct >= 41) buckets[2].count++;
      else buckets[3].count++;
    }
    return buckets.map((b) => ({
      ...b,
      share: total > 0 ? Math.round((b.count / total) * 100) : 0,
    }));
  }, [filteredLedgerMarks]);

  const availableLedgerSubjects = useMemo(
    () => Array.from(new Set(enrichedMarks.map((m) => m.subject))).sort(),
    [enrichedMarks],
  );

  // Comprehensive Student Report Card Model for Selected Student
  const selectedStudent = useMemo(
    () => data.students.find((s) => s.id === selectedStudentId) || data.students[0] || null,
    [data.students, selectedStudentId],
  );

  const reportCardModel = useMemo(() => {
    if (!selectedStudent) return null;
    return buildStudentReportCard({
      student: selectedStudent,
      examMarks: data.examMarks || [],
      breakdown: data.studentBreakdowns?.[selectedStudent.id] || null,
      readingReports: data.readingReports || [],
      numeracyReports: data.numeracyReports || [],
      computerSkillAttempts: data.computerSkillAttempts || [],
      cognitiveAttempts: data.cognitiveAttempts || [],
      thinkingAssessments: data.thinkingAssessments || [],
      vcipAttempts: data.vcipAttempts || [],
      psychometricRecords: data.psychometricRecords || [],
      yearlyPlan:
        (data.studentYearlyPlans || []).find((p) => p.studentId === selectedStudent.id) || null,
    });
  }, [selectedStudent, data]);

  // Parent Subject Comparison Chart Data & Highlights
  const subjectChartData = useMemo(() => {
    if (!reportCardModel) return [];
    return reportCardModel.subjectRows.map((row) => ({
      subject: row.subject.length > 13 ? `${row.subject.slice(0, 12)}…` : row.subject,
      fullSubject: row.subject,
      'Class Test': row.classTest.avgPct ?? 0,
      'Unit Test (UT)': row.ut.avgPct ?? 0,
      'Semester Exam': row.semesterExam.avgPct ?? 0,
    }));
  }, [reportCardModel]);

  const familyHighlights = useMemo(() => {
    if (!reportCardModel || reportCardModel.subjectRows.length === 0) {
      return { strongest: null as string | null, strongestPct: null as number | null, focus: null as string | null, focusPct: null as number | null };
    }
    const sorted = [...reportCardModel.subjectRows].sort(
      (a, b) => (b.overallPct ?? 0) - (a.overallPct ?? 0),
    );
    const best = sorted[0];
    const lowest = sorted[sorted.length - 1];
    return {
      strongest: best.subject,
      strongestPct: best.overallPct,
      focus: sorted.length > 1 ? lowest.subject : null,
      focusPct: sorted.length > 1 ? lowest.overallPct : null,
    };
  }, [reportCardModel]);

  const openStudentReportCard = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (isFamily) setFamilySubTab('report_card');
    else setStaffSubTab('report_card');
  };

  if (data.students.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-2.5">
        <FileSpreadsheet className="h-8 w-8 text-slate-400 mx-auto" />
        <h2 className="font-display text-lg font-bold text-[#142B46]">
          Exam Marks &amp; Holistic Report Cards
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          No students are currently assigned to your view. Once students are enrolled in your
          classes, assessment marks and skills report cards will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="marks-report-card-module">
      {/* ==================== TOP WORKSPACE HEADER & MODE SWITCHER ==================== */}
      <header className="rounded-xl border border-[#E5D7C3] bg-white px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7B5D1C]">
            {isFamily
              ? 'Academic Progress & Assessment Transcript'
              : 'Faculty Grading Studio & Assessment Ledger'}
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#142B46] mt-0.5 truncate">
            {isFamily
              ? 'Exam Marks & Skills Report Card'
              : 'Exam Marks & Report Cards'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isFamily
              ? 'Track Class Tests, Unit Tests (UT), Semester Exams, teacher feedback, and the complete skills-assessed report card.'
              : 'Enter Class Test, UT, and Semester Exam marks with keyboard-fast entry — synced live to parent portals and report cards.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Child switcher for parents with multiple children */}
          {isFamily && data.students.length > 1 && (
            <select
              aria-label="Select child"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="rounded-lg border border-[#E5D7C3] bg-[#FAF4EC] px-3 py-2 text-xs font-semibold text-[#142B46] focus:outline-none focus:ring-2 focus:ring-[#142B46]"
            >
              {data.students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} (Class {st.classSection})
                </option>
              ))}
            </select>
          )}

          {/* Role-appropriate segmented tab rail */}
          {isFamily ? (
            <div
              className="inline-flex items-center rounded-lg border border-[#E5D7C3] bg-[#FAF4EC] p-0.5"
              role="tablist"
              aria-label="Exam Marks Views"
            >
              <button
                type="button"
                role="tab"
                aria-selected={familySubTab === 'overview'}
                onClick={() => setFamilySubTab('overview')}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  familySubTab === 'overview'
                    ? 'bg-[#142B46] text-white'
                    : 'text-[#142B46]/80 hover:bg-white'
                }`}
              >
                Exam Marks &amp; Insights
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={familySubTab === 'report_card'}
                onClick={() => setFamilySubTab('report_card')}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  familySubTab === 'report_card'
                    ? 'bg-[#142B46] text-white'
                    : 'text-[#142B46]/80 hover:bg-white'
                }`}
              >
                Report Card (All Skills)
              </button>
            </div>
          ) : (
            <div
              className="inline-flex items-center rounded-lg border border-[#E5D7C3] bg-[#FAF4EC] p-0.5"
              role="tablist"
              aria-label="Faculty Marks Views"
            >
              {canEditMarks && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={staffSubTab === 'entry'}
                  onClick={() => setStaffSubTab('entry')}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    staffSubTab === 'entry'
                      ? 'bg-[#142B46] text-white'
                      : 'text-[#142B46]/80 hover:bg-white'
                  }`}
                >
                  Record Marks
                </button>
              )}
              <button
                type="button"
                role="tab"
                aria-selected={staffSubTab === 'ledger'}
                onClick={() => setStaffSubTab('ledger')}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  staffSubTab === 'ledger'
                    ? 'bg-[#142B46] text-white'
                    : 'text-[#142B46]/80 hover:bg-white'
                }`}
              >
                Marks Ledger ({enrichedMarks.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={staffSubTab === 'report_card'}
                onClick={() => setStaffSubTab('report_card')}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  staffSubTab === 'report_card'
                    ? 'bg-[#142B46] text-white'
                    : 'text-[#142B46]/80 hover:bg-white'
                }`}
              >
                Report Cards
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ==================== STAFF VIEW 1: RAPID KEYBOARD-FIRST GRADING STUDIO ==================== */}
      {!isFamily && canEditMarks && staffSubTab === 'entry' && (
        <form
          onSubmit={handleSaveBatch}
          className="rounded-xl border border-[#E5D7C3] bg-white overflow-hidden"
          data-testid="teacher-marks-entry-form"
        >
          {/* Assessment Context Header */}
          <div className="border-b border-[#E5D7C3] bg-[#FAF4EC]/75 px-5 py-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-[#142B46]">
                  Class Marks Entry Sheet
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Press <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 font-mono text-[10px]">Enter</kbd> or{' '}
                  <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 font-mono text-[10px]">↓</kbd> to advance row by row. Existing marks load automatically.
                </p>
              </div>

              {/* Assessment Category Segmented Control */}
              <div className="inline-flex items-center rounded-lg border border-[#E5D7C3] bg-white p-0.5 shrink-0 self-start sm:self-auto">
                {EXAM_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySwitch(cat)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      examType === cat
                        ? 'bg-[#142B46] text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Assessment Setup Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              <label className="space-y-1 text-xs lg:col-span-2">
                <span className="font-semibold text-slate-700">Class</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-[#142B46] focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                >
                  {classList.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs lg:col-span-2">
                <span className="font-semibold text-slate-700">Subject</span>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-[#142B46] focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                >
                  {classSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs lg:col-span-3">
                <span className="font-semibold text-slate-700">Assessment Title</span>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder={`e.g. ${EXAM_PRESETS_BY_CATEGORY[examType].presets[0]}`}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-[#142B46] focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                />
              </label>

              <label className="space-y-1 text-xs lg:col-span-1">
                <span className="font-semibold text-slate-700">Max</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Math.max(1, Number(e.target.value) || 20))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-mono font-semibold tabular-nums text-[#142B46] focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                />
              </label>

              <label className="space-y-1 text-xs lg:col-span-2">
                <span className="font-semibold text-slate-700">Assessment Date</span>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-mono tabular-nums text-[#142B46] focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                />
              </label>

              <label className="space-y-1 text-xs lg:col-span-2">
                <span className="font-semibold text-slate-700">Term</span>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-[#142B46] focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                >
                  {EXAM_TERMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Quick Title Presets Row */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium mr-1">Quick presets:</span>
              {EXAM_PRESETS_BY_CATEGORY[examType].presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setExamName(preset)}
                  className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    examName === preset
                      ? 'border-[#142B46] bg-[#142B46] text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Live Grading Telemetry Hairline Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200 border-b border-slate-200 bg-white">
            <div className="px-5 py-3">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>Completion</span>
                <span className="font-mono font-semibold text-[#142B46] tabular-nums">
                  {draftTelemetry.progressPct}%
                </span>
              </div>
              <p className="font-mono text-lg font-bold text-[#142B46] tabular-nums mt-0.5">
                {draftTelemetry.graded} / {draftTelemetry.total}
                <span className="text-xs font-sans font-normal text-slate-500 ml-1.5">graded</span>
              </p>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#3D6349] transition-all duration-300"
                  style={{ width: `${draftTelemetry.progressPct}%` }}
                />
              </div>
            </div>

            <div className="px-5 py-3">
              <p className="text-[11px] font-medium text-slate-500">Live Sheet Average</p>
              <p className="font-mono text-lg font-bold text-[#142B46] tabular-nums mt-0.5">
                {draftTelemetry.avgPct !== null ? `${draftTelemetry.avgPct}%` : '—'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {draftTelemetry.avgPct !== null
                  ? `Mean Grade: ${computeGrade(draftTelemetry.avgPct).grade}`
                  : 'Enter marks to preview mean'}
              </p>
            </div>

            <div className="px-5 py-3">
              <p className="text-[11px] font-medium text-slate-500">Highest / Lowest</p>
              <p className="font-mono text-lg font-bold text-[#142B46] tabular-nums mt-0.5">
                {draftTelemetry.highest !== null && draftTelemetry.lowest !== null
                  ? `${draftTelemetry.highest} / ${draftTelemetry.lowest}`
                  : '—'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                Out of {maxMarks} max marks
              </p>
            </div>

            <div className="px-5 py-3">
              <p className="text-[11px] font-medium text-slate-500">Needs Focus (&lt;50%)</p>
              <p
                className={`font-mono text-lg font-bold tabular-nums mt-0.5 ${
                  draftTelemetry.needsSupport > 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                {draftTelemetry.needsSupport}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {draftTelemetry.ungraded > 0
                  ? `${draftTelemetry.ungraded} student${draftTelemetry.ungraded === 1 ? '' : 's'} remaining`
                  : 'All students scored'}
              </p>
            </div>
          </div>

          {/* Toolbar: Search + Quick Filter + Next Ungraded + Toggle Remarks */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[220px]">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Find student or roll no..."
                  className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                />
              </div>

              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
                {(
                  [
                    { id: 'all', label: `All (${classRoster.length})` },
                    { id: 'ungraded', label: `Ungraded (${draftTelemetry.ungraded})` },
                    { id: 'needs_support', label: `Below 50% (${draftTelemetry.needsSupport})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRosterFilter(tab.id)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                      rosterFilter === tab.id
                        ? 'bg-[#142B46] text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {draftTelemetry.ungraded > 0 && (
                <button
                  type="button"
                  onClick={jumpToNextUngraded}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                  Next Ungraded
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowRemarksCols((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  showRemarksCols
                    ? 'border-[#142B46] bg-[#142B46] text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {showRemarksCols ? 'Hide Remarks Columns' : 'Add Remarks & Focus'}
              </button>
            </div>
          </div>

          {batchError && (
            <div className="mx-5 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{batchError}</span>
            </div>
          )}

          {/* High-Density Keyboard-Fast Grading Table */}
          <div className="overflow-x-auto">
            {visibleRoster.length === 0 ? (
              <div className="p-10 text-center space-y-1.5">
                <p className="text-sm font-semibold text-slate-800">No students match this filter</p>
                <p className="text-xs text-slate-500">
                  Switch back to All students or clear the search box to continue entering marks.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-4 w-16">Roll</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3 w-40 text-right">Marks (/ {maxMarks})</th>
                    <th className="py-2.5 px-3 w-44">Performance · Grade</th>
                    {showRemarksCols && (
                      <>
                        <th className="py-2.5 px-3">Conceptual Focus</th>
                        <th className="py-2.5 px-3">Parent Remark</th>
                      </>
                    )}
                    <th className="py-2.5 px-4 w-36 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleRoster.map((stu, idx) => {
                    const draft = draftRows[stu.id] || {
                      obtained: '',
                      remarks: '',
                      conceptualGap: '',
                    };
                    const raw = draft.obtained.trim();
                    const parsed = raw === '' ? null : Number(raw);
                    const isInvalid =
                      parsed !== null && (!Number.isFinite(parsed) || parsed < 0 || parsed > maxMarks);
                    const validNum = parsed !== null && !isInvalid;
                    const pct = validNum ? Math.round((parsed / maxMarks) * 100) : null;
                    const grade = pct !== null ? computeGrade(pct) : null;
                    const hasNote = Boolean(draft.remarks.trim() || draft.conceptualGap.trim());
                    const isNoteExpanded = !showRemarksCols && Boolean(expandedNoteIds[stu.id]);

                    return (
                      <React.Fragment key={stu.id}>
                        <tr
                          className={`transition-colors ${
                            isInvalid
                              ? 'bg-rose-50/60'
                              : 'hover:bg-[#FAF4EC]/50'
                          }`}
                        >
                          <td className="py-2 px-4 font-mono tabular-nums text-slate-500">
                            {stu.rollNo}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#142B46]">{stu.name}</span>
                              {hasNote && !showRemarksCols && (
                                <span
                                  className="text-[11px] font-medium text-[#7B5D1C]"
                                  title="Parent remark or conceptual focus added"
                                >
                                  · Note added
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <input
                                ref={(el) => {
                                  markInputRefs.current[stu.id] = el;
                                }}
                                type="number"
                                min={0}
                                max={maxMarks}
                                step="0.5"
                                placeholder="—"
                                aria-label={`Marks for ${stu.name}`}
                                value={draft.obtained}
                                onKeyDown={(e) => handleMarkKeyDown(e, idx)}
                                onChange={(e) =>
                                  setDraftRows((prev) => ({
                                    ...prev,
                                    [stu.id]: { ...draft, obtained: e.target.value },
                                  }))
                                }
                                className={`w-24 rounded-md border bg-white px-2.5 py-1.5 text-right font-mono font-semibold tabular-nums text-[#142B46] focus:outline-none focus:ring-2 ${
                                  isInvalid
                                    ? 'border-rose-500 focus:ring-rose-500 text-rose-700'
                                    : 'border-slate-200 focus:ring-[#142B46]'
                                }`}
                              />
                              <span className="font-mono text-[11px] text-slate-400 tabular-nums w-8 text-left">
                                /{maxMarks}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            {isInvalid ? (
                              <span className="text-[11px] font-semibold text-rose-700">
                                Max {maxMarks}
                              </span>
                            ) : pct !== null && grade ? (
                              <div className="flex items-center gap-2.5">
                                <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden shrink-0">
                                  <div
                                    className={`h-full ${barFillClass(pct)}`}
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  />
                                </div>
                                <span
                                  className={`font-mono font-bold tabular-nums whitespace-nowrap ${scoreToneClass(pct)}`}
                                >
                                  {pct}% · {grade.grade}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">Not graded</span>
                            )}
                          </td>

                          {showRemarksCols && (
                            <>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  placeholder="e.g. Fraction word problems"
                                  value={draft.conceptualGap}
                                  onChange={(e) =>
                                    setDraftRows((prev) => ({
                                      ...prev,
                                      [stu.id]: { ...draft, conceptualGap: e.target.value },
                                    }))
                                  }
                                  className="w-full min-w-[150px] rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  placeholder="Feedback visible to parents"
                                  value={draft.remarks}
                                  onChange={(e) =>
                                    setDraftRows((prev) => ({
                                      ...prev,
                                      [stu.id]: { ...draft, remarks: e.target.value },
                                    }))
                                  }
                                  className="w-full min-w-[160px] rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                                />
                              </td>
                            </>
                          )}

                          <td className="py-2 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-3">
                              {!showRemarksCols && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedNoteIds((prev) => ({
                                      ...prev,
                                      [stu.id]: !prev[stu.id],
                                    }))
                                  }
                                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-600 hover:text-[#142B46] cursor-pointer"
                                >
                                  {isNoteExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  )}
                                  {hasNote ? 'Edit Note' : 'Note'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openStudentReportCard(stu.id)}
                                className="text-xs font-semibold text-[#142B46] hover:underline cursor-pointer"
                              >
                                Card →
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Optional Per-Student Expandable Note Row (keeps default sheet fast & uncluttered) */}
                        {isNoteExpanded && (
                          <tr className="bg-[#FAF4EC]/50">
                            <td colSpan={5} className="px-4 py-2.5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-10">
                                <label className="space-y-1 text-[11px]">
                                  <span className="font-semibold text-slate-600">
                                    Conceptual Focus Area (Optional)
                                  </span>
                                  <input
                                    type="text"
                                    placeholder="e.g. Revise linear equations word problems"
                                    value={draft.conceptualGap}
                                    onChange={(e) =>
                                      setDraftRows((prev) => ({
                                        ...prev,
                                        [stu.id]: { ...draft, conceptualGap: e.target.value },
                                      }))
                                    }
                                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                                  />
                                </label>
                                <label className="space-y-1 text-[11px]">
                                  <span className="font-semibold text-slate-600">
                                    Parent-Visible Remark (Optional)
                                  </span>
                                  <input
                                    type="text"
                                    placeholder="e.g. Strong step-by-step clarity in geometry"
                                    value={draft.remarks}
                                    onChange={(e) =>
                                      setDraftRows((prev) => ({
                                        ...prev,
                                        [stu.id]: { ...draft, remarks: e.target.value },
                                      }))
                                    }
                                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                                  />
                                </label>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Sticky / Anchored Action Footer */}
          <div className="sticky bottom-0 z-10 border-t border-[#E5D7C3] bg-[#FAF4EC]/95 backdrop-blur-xs px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-700">
              <span className="font-semibold text-[#142B46] font-mono tabular-nums">
                {draftTelemetry.graded}
              </span>{' '}
              mark{draftTelemetry.graded === 1 ? '' : 's'} ready for{' '}
              <span className="font-semibold text-[#142B46]">
                {examName || examType} · {subject} (Class {selectedClass})
              </span>
              {draftTelemetry.dirtyCount > 0 && (
                <span className="ml-2 font-semibold text-amber-800 font-mono tabular-nums">
                  · {draftTelemetry.dirtyCount} unsaved edit{draftTelemetry.dirtyCount === 1 ? '' : 's'}
                </span>
              )}
              {draftTelemetry.invalidCount > 0 && (
                <span className="ml-2 font-semibold text-rose-700 font-mono tabular-nums">
                  · {draftTelemetry.invalidCount} invalid score{draftTelemetry.invalidCount === 1 ? '' : 's'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {draftTelemetry.dirtyCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetDraft}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Draft
                </button>
              )}
              <button
                type="submit"
                disabled={savingBatch || draftTelemetry.invalidCount > 0}
                className="inline-flex items-center gap-2 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-white hover:bg-[#1D3A5C] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {savingBatch ? 'Saving & Syncing...' : `Save ${examType} & Sync to Parents`}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ==================== STAFF VIEW 2: MARKS LEDGER & ANALYTICS ==================== */}
      {!isFamily && staffSubTab === 'ledger' && (
        <div className="space-y-5">
          {/* Filtered KPI Hairline Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-[#E5D7C3] rounded-xl border border-[#E5D7C3] bg-white overflow-hidden">
            <div className="p-4">
              <p className="text-xs font-medium text-slate-500">Class Tests Avg</p>
              <p className="font-mono text-2xl font-bold text-[#142B46] tabular-nums mt-1">
                {kpiSummary.classTest.avg !== null ? `${kpiSummary.classTest.avg}%` : '—'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                {kpiSummary.classTest.count} mark{kpiSummary.classTest.count === 1 ? '' : 's'}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs font-medium text-slate-500">Unit Tests (UT) Avg</p>
              <p className="font-mono text-2xl font-bold text-[#2B547E] tabular-nums mt-1">
                {kpiSummary.ut.avg !== null ? `${kpiSummary.ut.avg}%` : '—'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                {kpiSummary.ut.count} mark{kpiSummary.ut.count === 1 ? '' : 's'}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs font-medium text-slate-500">Semester Exams Avg</p>
              <p className="font-mono text-2xl font-bold text-[#3D6349] tabular-nums mt-1">
                {kpiSummary.semester.avg !== null ? `${kpiSummary.semester.avg}%` : '—'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                {kpiSummary.semester.count} mark{kpiSummary.semester.count === 1 ? '' : 's'}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs font-medium text-slate-500">Overall Combined Avg</p>
              <p className="font-mono text-2xl font-bold text-[#142B46] tabular-nums mt-1">
                {kpiSummary.all.avg !== null ? `${kpiSummary.all.avg}%` : '—'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                {kpiSummary.all.count} matching entries
              </p>
            </div>
          </div>

          {/* Grade Distribution Band Strip */}
          {filteredLedgerMarks.length > 0 && (
            <div className="rounded-xl border border-[#E5D7C3] bg-white p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-sm font-bold text-[#142B46]">
                  Score Distribution (Filtered Cohort)
                </h2>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {filteredLedgerMarks.length} assessments
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                {gradeDistribution.map((b) =>
                  b.share > 0 ? (
                    <div
                      key={b.key}
                      className={`h-full ${b.color}`}
                      style={{ width: `${b.share}%` }}
                      title={`${b.label}: ${b.count} (${b.share}%)`}
                    />
                  ) : null,
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {gradeDistribution.map((b) => (
                  <div key={b.key} className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-xs shrink-0 ${b.color}`} />
                    <span className="text-slate-600 truncate">{b.label.split(' · ')[1]}</span>
                    <span className="ml-auto font-mono font-bold text-[#142B46] tabular-nums">
                      {b.count} ({b.share}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recorded Marks Ledger Table */}
          <div className="rounded-xl border border-[#E5D7C3] bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder="Search student, exam title, or subject..."
                    className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    aria-label="Filter by class"
                    value={ledgerClassFilter}
                    onChange={(e) => setLedgerClassFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                  >
                    <option value="All">All Classes</option>
                    {classList.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  aria-label="Filter by subject"
                  value={ledgerSubjectFilter}
                  onChange={(e) => setLedgerSubjectFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                >
                  <option value="All">All Subjects</option>
                  {availableLedgerSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0">
                {(['All', ...EXAM_CATEGORIES] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLedgerCategoryFilter(cat)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap cursor-pointer ${
                      ledgerCategoryFilter === cat
                        ? 'bg-[#142B46] text-white'
                        : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredLedgerMarks.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <BookOpen className="h-6 w-6 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">No matching marks found</p>
                <p className="text-xs text-slate-500">
                  Adjust the filters above or switch to Record Marks to add new scores.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-3">Student · Class</th>
                      <th className="py-2.5 px-3">Assessment</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3 text-right">Score</th>
                      <th className="py-2.5 px-3 w-32">Grade</th>
                      <th className="py-2.5 px-3">Remarks / Focus</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLedgerMarks.slice(0, 100).map((m) => (
                      <tr key={m.id} className="hover:bg-[#FAF4EC]/50">
                        <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                          {m.date}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-semibold text-[#142B46]">{m.studentName}</span>
                          <span className="text-slate-400 mx-1">·</span>
                          <span className="text-slate-600">{m.classSection}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-slate-900">{m.examName}</span>
                          <span className="block text-[11px] text-slate-500">{m.category}</span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{m.subject}</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-[#142B46] whitespace-nowrap">
                          {m.obtainedMarks}/{m.maxMarks}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-12 rounded-full bg-slate-100 overflow-hidden shrink-0">
                              <div
                                className={`h-full ${barFillClass(m.pct)}`}
                                style={{ width: `${Math.min(100, m.pct)}%` }}
                              />
                            </div>
                            <span
                              className={`font-mono font-bold tabular-nums ${scoreToneClass(m.pct)}`}
                            >
                              {m.pct}% · {m.grade.grade}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                          {m.remarks || m.conceptualGap || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openStudentReportCard(m.studentId)}
                              className="text-xs font-semibold text-[#142B46] hover:underline cursor-pointer"
                            >
                              Card
                            </button>
                            {canEditMarks && (
                              <>
                                <button
                                  type="button"
                                  aria-label={`Edit mark for ${m.studentName}`}
                                  onClick={() => openEditMark(m)}
                                  className="text-slate-500 hover:text-[#142B46] p-1 cursor-pointer"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                {confirmDeleteId === m.id ? (
                                  <span className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={deleteBusyId === m.id}
                                      onClick={() => handleDeleteMark(m.id)}
                                      className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    aria-label={`Delete mark for ${m.studentName}`}
                                    onClick={() => setConfirmDeleteId(m.id)}
                                    className="text-slate-400 hover:text-rose-700 p-1 cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== FAMILY VIEW 1: EXAM MARKS & INSIGHTS ==================== */}
      {isFamily && familySubTab === 'overview' && (
        <div className="space-y-5">
          {/* Executive Academic Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 divide-x divide-[#E5D7C3] rounded-xl border border-[#E5D7C3] bg-white overflow-hidden">
            <div className="p-4">
              <p className="text-xs font-medium text-slate-500">Overall Academic</p>
              <p className="font-mono text-2xl font-bold text-[#142B46] tabular-nums mt-1">
                {kpiSummary.all.avg !== null ? `${kpiSummary.all.avg}%` : '—'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {kpiSummary.all.avg !== null
                  ? `Grade ${computeGrade(kpiSummary.all.avg).grade} · ${computeGrade(kpiSummary.all.avg).remark}`
                  : 'No exams graded yet'}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs font-medium text-slate-500">Class Tests</p>
              <p className="font-mono text-2xl font-bold text-[#142B46] tabular-nums mt-1">
                {kpiSummary.classTest.avg !== null ? `${kpiSummary.classTest.avg}%` : '—'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                {kpiSummary.classTest.count} test{kpiSummary.classTest.count === 1 ? '' : 's'}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs font-medium text-slate-500">Unit Tests (UT)</p>
              <p className="font-mono text-2xl font-bold text-[#2B547E] tabular-nums mt-1">
                {kpiSummary.ut.avg !== null ? `${kpiSummary.ut.avg}%` : '—'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                {kpiSummary.ut.count} test{kpiSummary.ut.count === 1 ? '' : 's'}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs font-medium text-slate-500">Semester Exams</p>
              <p className="font-mono text-2xl font-bold text-[#3D6349] tabular-nums mt-1">
                {kpiSummary.semester.avg !== null ? `${kpiSummary.semester.avg}%` : '—'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                {kpiSummary.semester.count} exam{kpiSummary.semester.count === 1 ? '' : 's'}
              </p>
            </div>
            <div className="p-4 bg-[#FAF4EC]/60 col-span-2 lg:col-span-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Skills Assessed</p>
                <p className="font-mono text-2xl font-bold text-[#142B46] tabular-nums mt-0.5">
                  {reportCardModel?.skillsSummary.totalSkillsAssessed ?? 0}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFamilySubTab('report_card')}
                className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D3A5C] whitespace-nowrap cursor-pointer"
              >
                <Award className="h-3.5 w-3.5 text-[#D6B66D]" />
                Full Report Card
              </button>
            </div>
          </div>

          {/* Subject Highlights & Performance Chart */}
          {subjectChartData.length > 0 && reportCardModel && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              {/* Bar Chart */}
              <div className="xl:col-span-7 rounded-xl border border-[#E5D7C3] bg-white p-5 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="font-display text-base font-bold text-[#142B46]">
                      Subject-Wise Comparison
                    </h2>
                    <p className="text-xs text-slate-500">
                      Class Test vs Unit Test (UT) vs Semester Exam for {selectedStudent?.name}
                    </p>
                  </div>
                  {familyHighlights.strongest && (
                    <div className="text-xs text-slate-600">
                      Top:{' '}
                      <span className="font-semibold text-emerald-700">
                        {familyHighlights.strongest} ({familyHighlights.strongestPct}%)
                      </span>
                      {familyHighlights.focus && (
                        <>
                          {' · '}Focus:{' '}
                          <span className="font-semibold text-amber-800">
                            {familyHighlights.focus} ({familyHighlights.focusPct}%)
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subjectChartData}
                      margin={{ top: 8, right: 12, left: -14, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6D8C6" />
                      <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#4A6078' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#4A6078' }} unit="%" />
                      <Tooltip
                        formatter={(value) => [`${value ?? 0}%`, '']}
                        contentStyle={{
                          borderRadius: '10px',
                          borderColor: '#E6D8C6',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="Class Test" fill="#D6B66D" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Unit Test (UT)" fill="#35618D" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Semester Exam" fill="#3D6349" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="xl:col-span-5 rounded-xl border border-[#E5D7C3] bg-white overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-slate-200">
                  <h2 className="font-display text-base font-bold text-[#142B46]">
                    Subject Averages
                  </h2>
                  <p className="text-xs text-slate-500">Consolidated percentage and grade by subject</p>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-4">Subject</th>
                        <th className="py-2.5 px-2 text-right">CT</th>
                        <th className="py-2.5 px-2 text-right">UT</th>
                        <th className="py-2.5 px-2 text-right">Sem</th>
                        <th className="py-2.5 px-4 text-right">Overall</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportCardModel.subjectRows.map((row) => (
                        <tr key={row.subject} className="hover:bg-[#FAF4EC]/50">
                          <td className="py-2.5 px-4 font-semibold text-[#142B46]">
                            {row.subject}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">
                            {row.classTest.avgPct !== null ? `${row.classTest.avgPct}%` : '—'}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">
                            {row.ut.avgPct !== null ? `${row.ut.avgPct}%` : '—'}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">
                            {row.semesterExam.avgPct !== null ? `${row.semesterExam.avgPct}%` : '—'}
                          </td>
                          <td
                            className={`py-2.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                              row.overallPct !== null ? scoreToneClass(row.overallPct) : 'text-slate-400'
                            }`}
                          >
                            {row.overallPct !== null
                              ? `${row.overallPct}% · ${row.grade}`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Student's Recorded Assessments Ledger */}
          <div className="rounded-xl border border-[#E5D7C3] bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-[#142B46]">
                  {selectedStudent?.name}&apos;s Assessment History
                </h2>
                <p className="text-xs text-slate-500">
                  Every graded test and exam with teacher remarks and conceptual focus
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px]">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder="Search exam or subject..."
                    className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#142B46]"
                  />
                </div>
                <select
                  aria-label="Filter by subject"
                  value={ledgerSubjectFilter}
                  onChange={(e) => setLedgerSubjectFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                >
                  <option value="All">All Subjects</option>
                  {availableLedgerSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  {(['All', ...EXAM_CATEGORIES] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setLedgerCategoryFilter(cat)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap cursor-pointer ${
                        ledgerCategoryFilter === cat
                          ? 'bg-[#142B46] text-white'
                          : 'text-slate-600 hover:bg-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredLedgerMarks.length === 0 ? (
              <div className="p-10 text-center space-y-1.5">
                <BookOpen className="h-6 w-6 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">No assessments recorded yet</p>
                <p className="text-xs text-slate-500">
                  Marks published by teachers for Class Tests, Unit Tests, and Semester Exams appear here instantly.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-3">Assessment</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3 text-right">Score</th>
                      <th className="py-2.5 px-3 w-36">Grade</th>
                      <th className="py-2.5 px-4">Teacher Feedback / Conceptual Focus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLedgerMarks.map((m) => (
                      <tr key={m.id} className="hover:bg-[#FAF4EC]/50">
                        <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                          {m.date}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-[#142B46]">{m.examName}</span>
                          <span className="block text-[11px] text-slate-500">{m.category}</span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{m.subject}</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-[#142B46] whitespace-nowrap">
                          {m.obtainedMarks}/{m.maxMarks}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden shrink-0">
                              <div
                                className={`h-full ${barFillClass(m.pct)}`}
                                style={{ width: `${Math.min(100, m.pct)}%` }}
                              />
                            </div>
                            <span
                              className={`font-mono font-bold tabular-nums ${scoreToneClass(m.pct)}`}
                            >
                              {m.pct}% · {m.grade.grade}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {m.remarks && <span className="block text-slate-800">{m.remarks}</span>}
                          {m.conceptualGap && (
                            <span className="block text-[11px] text-[#7B5D1C]">
                              Focus: {m.conceptualGap}
                            </span>
                          )}
                          {!m.remarks && !m.conceptualGap && '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== REPORT CARD VIEW (SHARED STAFF & FAMILY) ==================== */}
      {((isFamily && familySubTab === 'report_card') ||
        (!isFamily && staffSubTab === 'report_card')) && (
        <div className="space-y-4">
          {/* Student Selector Toolbar (Hidden on Print) */}
          <div className="rounded-xl border border-[#E5D7C3] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div className="flex flex-wrap items-center gap-2.5">
              <Users className="h-4 w-4 text-[#142B46] shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Student Report Card:</span>
              {!isFamily && (
                <select
                  aria-label="Filter report card by class"
                  value={selectedClass}
                  onChange={(e) => {
                    const cls = e.target.value;
                    setSelectedClass(cls);
                    const firstInClass = data.students.find((s) => s.classSection === cls);
                    if (firstInClass) setSelectedStudentId(firstInClass.id);
                  }}
                  className="rounded-lg border border-[#E5D7C3] bg-[#FAF4EC] px-2.5 py-1.5 text-xs font-semibold text-[#142B46]"
                >
                  {classList.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              )}
              <select
                aria-label="Select student for report card"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46]"
              >
                {(isFamily ? data.students : classRoster.length > 0 ? classRoster : data.students).map(
                  (st) => (
                    <option key={st.id} value={st.id}>
                      {st.rollNo} · {st.name} (Class {st.classSection})
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#3D6349] font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Live Marks + All Skills Synced
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1D3A5C] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Report Card
              </button>
            </div>
          </div>

          {reportCardModel && (
            <StudentReportCardView school={data.activeSchool} reportCard={reportCardModel} />
          )}
        </div>
      )}

      {/* ==================== INLINE EDIT MODAL FOR INDIVIDUAL MARK ==================== */}
      {editingMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 print:hidden">
          <div className="w-full max-w-md rounded-2xl border border-[#E5D7C3] bg-white p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-[#142B46]">Edit Exam Mark</h3>
                <p className="text-xs text-slate-500">
                  {studentsById.get(editingMark.studentId)?.name || 'Student'} · {editingMark.subject}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close edit modal"
                onClick={() => setEditingMark(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="font-semibold text-slate-700">Exam Category</span>
                  <select
                    value={editExamType}
                    onChange={(e) => setEditExamType(e.target.value as ExamCategory)}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-slate-900"
                  >
                    {EXAM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="font-semibold text-slate-700">Exam Title</span>
                  <input
                    type="text"
                    required
                    value={editExamName}
                    onChange={(e) => setEditExamName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-slate-900"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="font-semibold text-slate-700">Obtained Marks</span>
                  <input
                    type="number"
                    required
                    min={0}
                    max={Number(editMax) || 500}
                    step="0.5"
                    value={editObtained}
                    onChange={(e) => setEditObtained(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-2 font-mono tabular-nums text-slate-900"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold text-slate-700">Max Marks</span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={500}
                    value={editMax}
                    onChange={(e) => setEditMax(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-2 font-mono tabular-nums text-slate-900"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="font-semibold text-slate-700">Conceptual Focus (Optional)</span>
                <input
                  type="text"
                  value={editGap}
                  onChange={(e) => setEditGap(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-slate-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-semibold text-slate-700">Parent-Visible Remark</span>
                <textarea
                  rows={2}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-slate-900"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMark(null)}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editBusy}
                  className="rounded-lg bg-[#142B46] px-4 py-2 font-semibold text-white hover:bg-[#1D3A5C] disabled:opacity-50 cursor-pointer"
                >
                  {editBusy ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
