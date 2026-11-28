import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import type {
  AcademicVisitQuarter,
  EnrolledHomeVisitOutcome,
  HomeVisitRecord,
  HomeVisitStatus,
  StudentRecord,
} from '../types';
import { apiRequest } from '../utils/api';
import {
  ACADEMIC_VISIT_QUARTERS,
  ENROLLED_VISIT_OUTCOMES,
  buildEnrolledStudentQuarterlyMatrix,
  inferQuarterFromDate,
  validateEnrolledStudentVisitInput,
} from '../utils/studentHomeVisitEngine';
import {
  AnimatedNumber,
  AnimatedProgressBar,
  StaggerCard,
  StaggerGrid,
} from './motion/RaiMotionSystem';

interface EnrolledStudentHomeVisitsPanelProps {
  students: StudentRecord[];
  visits: HomeVisitRecord[];
  academicSession: string;
  defaultStaffName: string;
  token: string;
  onRefresh: () => Promise<void>;
}

type MatrixFilter = 'all' | 'needs_visit' | 'missing_q1' | 'missing_q2' | 'missing_q3' | 'missing_q4' | 'complete_4';

export const EnrolledStudentHomeVisitsPanel: React.FC<EnrolledStudentHomeVisitsPanelProps> = ({
  students,
  visits,
  academicSession,
  defaultStaffName,
  token,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [matrixFilter, setMatrixFilter] = useState<MatrixFilter>('all');
  const [showLogForm, setShowLogForm] = useState(false);

  // Log quarterly home visit form state
  const [studentId, setStudentId] = useState<string>(students[0]?.id || '');
  const [academicQuarter, setAcademicQuarter] = useState<AcademicVisitQuarter>(() =>
    inferQuarterFromDate(new Date().toISOString().slice(0, 10)),
  );
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [visitSlot, setVisitSlot] = useState('04:00 PM – 04:45 PM');
  const [visitingStaff, setVisitingStaff] = useState(defaultStaffName);
  const [guardianMet, setGuardianMet] = useState(students[0]?.guardianName || '');
  const [address, setAddress] = useState(students[0]?.address || '');
  const [status, setStatus] = useState<HomeVisitStatus>('Completed');
  const [enrolledOutcome, setEnrolledOutcome] = useState<EnrolledHomeVisitOutcome>('Thriving & On Track');
  const [homeEnvironmentSummary, setHomeEnvironmentSummary] = useState('');
  const [learningSupportNotes, setLearningSupportNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const summary = useMemo(
    () => buildEnrolledStudentQuarterlyMatrix(students, visits, academicSession),
    [students, visits, academicSession],
  );

  const classOptions = useMemo(
    () => Array.from(new Set(students.map((s) => s.classSection))).sort(),
    [students],
  );

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return summary.rows.filter((row) => {
      if (classFilter !== 'ALL' && row.classSection !== classFilter) return false;
      if (matrixFilter === 'needs_visit' && row.completedCount >= 4) return false;
      if (matrixFilter === 'complete_4' && row.completedCount < 4) return false;
      if (matrixFilter === 'missing_q1' && row.quarters.Q1?.status === 'Completed') return false;
      if (matrixFilter === 'missing_q2' && row.quarters.Q2?.status === 'Completed') return false;
      if (matrixFilter === 'missing_q3' && row.quarters.Q3?.status === 'Completed') return false;
      if (matrixFilter === 'missing_q4' && row.quarters.Q4?.status === 'Completed') return false;
      if (q) {
        const hay = `${row.studentName} ${row.admissionNo} ${row.classSection} ${row.guardianName} ${row.guardianPhone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [summary.rows, classFilter, matrixFilter, searchQuery]);

  function openFormForStudent(targetStudentId: string, quarter: AcademicVisitQuarter) {
    const stu = students.find((s) => s.id === targetStudentId);
    setStudentId(targetStudentId);
    setAcademicQuarter(quarter);
    setGuardianMet(stu?.guardianName || '');
    setAddress(stu?.address || '');
    setFormError(null);
    setStatusNotice(null);
    setShowLogForm(true);
  }

  async function handleSubmitVisit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setStatusNotice(null);

    const check = validateEnrolledStudentVisitInput({
      studentId,
      academicQuarter,
      visitDate,
      visitingStaff,
      guardianMet,
    });
    if (!check.valid) {
      setFormError(check.error || 'Please fill all required quarterly home visit fields.');
      return;
    }

    setSaving(true);
    try {
      await apiRequest(
        `/api/students/${studentId}/home-visits`,
        {
          method: 'POST',
          body: JSON.stringify({
            academicQuarter,
            academicSession,
            visitDate,
            visitSlot,
            visitingStaff,
            guardianMet,
            address,
            status,
            enrolledVisitOutcome: enrolledOutcome,
            homeEnvironmentSummary,
            learningSupportNotes,
          }),
        },
        token || undefined,
      );
      const stuName = students.find((s) => s.id === studentId)?.name || 'student';
      setStatusNotice(
        `${academicQuarter} quarterly home visit (${status}) saved for enrolled student ${stuName}!`,
      );
      setHomeEnvironmentSummary('');
      setLearningSupportNotes('');
      setShowLogForm(false);
      await onRefresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save enrolled student home visit.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5" data-testid="enrolled-student-home-visits-panel">
      {/* Scope Banner */}
      <div className="rounded-2xl border border-[#D6B66D]/60 bg-gradient-to-r from-[#FAF4EC] via-white to-emerald-50/40 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#142B46] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D6B66D]">
              <Home className="h-3 w-3" />
              Enrolled Students · 4 Visits / Year Mandate
            </span>
            <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              Session {academicSession} · Q1 · Q2 · Q3 · Q4
            </span>
          </div>
          <h2 className="font-display text-lg font-extrabold text-[#142B46]">
            Existing Student Quarterly Home Visits (4 Meetings / Academic Year)
          </h2>
          <p className="text-xs text-slate-600">
            Strictly for <strong>already enrolled students</strong> — tracks all 4 mandatory parent-family home interactions per year (separate from prospective Admission CRM lead visits).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!studentId && students[0]) setStudentId(students[0].id);
            setShowLogForm((v) => !v);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B46] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1E3B5C] shadow-xs whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5 text-[#D6B66D]" />
          Log Quarterly Student Visit
        </button>
      </div>

      {/* KPI Strip */}
      <StaggerGrid className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StaggerCard className="rai-card-interactive rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase text-slate-500">Enrolled Students</p>
          <p className="mt-1 text-2xl font-extrabold text-[#142B46]">
            <AnimatedNumber value={summary.totalStudents} />
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Target: 4 visits / student</p>
        </StaggerCard>
        <StaggerCard className="rai-card-interactive rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-[11px] font-semibold uppercase text-emerald-800">Completed Quarterly Visits</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-800">
            <AnimatedNumber value={summary.completedVisitsCount} />
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Q1: {summary.byQuarterCompleted.Q1} · Q2: {summary.byQuarterCompleted.Q2} · Q3: {summary.byQuarterCompleted.Q3} · Q4: {summary.byQuarterCompleted.Q4}
          </p>
        </StaggerCard>
        <StaggerCard className="rai-card-interactive rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <p className="text-[11px] font-semibold uppercase text-amber-800">Students Needing Next Visit</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-800">
            <AnimatedNumber value={summary.studentsNeedingVisitCount} />
          </p>
          <p className="text-[11px] text-amber-800/80 mt-0.5">
            {summary.scheduledVisitsCount} scheduled upcoming
          </p>
        </StaggerCard>
        <StaggerCard className="rai-card-interactive rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase text-slate-500">4×/Year Annual Coverage</p>
          <p className="mt-1 text-2xl font-extrabold text-[#142B46]">
            <AnimatedNumber value={summary.overallCompliancePct} suffix="%" />
          </p>
          <div className="mt-1.5">
            <AnimatedProgressBar
              value={summary.overallCompliancePct}
              heightClassName="h-1.5"
              className="bg-slate-100"
              barClassName="bg-emerald-600"
            />
          </div>
        </StaggerCard>
      </StaggerGrid>

      {statusNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {statusNotice}
          </span>
          <button type="button" onClick={() => setStatusNotice(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Log Quarterly Visit Form */}
      {showLogForm && (
        <form
          onSubmit={handleSubmitVisit}
          className="rounded-2xl border border-[#142B46]/20 bg-white p-5 shadow-sm space-y-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display text-sm font-extrabold text-[#142B46]">
                Record Enrolled Student Quarterly Home Visit ({academicQuarter})
              </h3>
              <p className="text-[11px] text-slate-500">
                Counts directly toward the student’s 4 annual parent-school family visits.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {formError && (
            <div className="rai-shake rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 font-semibold text-rose-800">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block space-y-1">
              <span className="font-bold text-slate-700">Enrolled Student *</span>
              <select
                value={studentId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setStudentId(nextId);
                  const matched = students.find((s) => s.id === nextId);
                  if (matched) {
                    setGuardianMet(matched.guardianName);
                    setAddress(matched.address || '');
                  }
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold"
              >
                {students.slice(0, 120).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.classSection} · {s.admissionNo})
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="font-bold text-slate-700">Quarterly Visit Cycle (4×/Year) *</span>
              <select
                value={academicQuarter}
                onChange={(e) => setAcademicQuarter(e.target.value as AcademicVisitQuarter)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold"
              >
                {ACADEMIC_VISIT_QUARTERS.map((q) => (
                  <option key={q.quarter} value={q.quarter}>
                    {q.label} · {q.months}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="font-bold text-slate-700">Visit Date *</span>
              <input
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <label className="block space-y-1">
              <span className="font-bold text-slate-700">Visiting Faculty / Leader *</span>
              <input
                type="text"
                required
                value={visitingStaff}
                onChange={(e) => setVisitingStaff(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold text-slate-700">Parent / Guardian Met *</span>
              <input
                type="text"
                required
                value={guardianMet}
                onChange={(e) => setGuardianMet(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold text-slate-700">Visit Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as HomeVisitStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold"
              >
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="font-bold text-slate-700">Student Care Outcome</span>
              <select
                value={enrolledOutcome}
                onChange={(e) => setEnrolledOutcome(e.target.value as EnrolledHomeVisitOutcome)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold"
              >
                {ENROLLED_VISIT_OUTCOMES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="font-bold text-slate-700">Home Environment &amp; Study Routine Notes</span>
              <textarea
                rows={2}
                value={homeEnvironmentSummary}
                onChange={(e) => setHomeEnvironmentSummary(e.target.value)}
                placeholder="Evening revision habit, parent engagement, wellbeing..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold text-slate-700">Academic / Parent Action Plan</span>
              <textarea
                rows={2}
                value={learningSupportNotes}
                onChange={(e) => setLearningSupportNotes(e.target.value)}
                placeholder="Homework follow-up, remedial support, exam readiness goals..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#142B46] px-4 py-2 font-bold text-white hover:bg-[#1E3B5C] disabled:opacity-60"
            >
              {saving ? 'Saving…' : `Save ${academicQuarter} Home Visit`}
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ['all', `All Students (${summary.totalStudents})`],
              ['needs_visit', `Pending <4 (${summary.studentsNeedingVisitCount})`],
              ['missing_q1', 'Pending Q1'],
              ['missing_q2', 'Pending Q2'],
              ['missing_q3', 'Pending Q3'],
              ['missing_q4', 'Pending Q4'],
              ['complete_4', `4/4 Complete (${summary.fullyCompletedStudentsCount})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMatrixFilter(id)}
              className={`rounded-full px-3 py-1 font-bold transition-colors ${
                matrixFilter === id
                  ? 'bg-[#142B46] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by class"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold"
          >
            <option value="ALL">All Classes</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, parent..."
              className="rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 4x/Year Student Matrix Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Enrolled Student</th>
                <th className="px-4 py-3">Guardian Contact</th>
                <th className="px-4 py-3 text-center">Annual Progress</th>
                {ACADEMIC_VISIT_QUARTERS.map((q) => (
                  <th key={q.quarter} className="px-3 py-3 text-center">
                    <div>{q.label}</div>
                    <div className="text-[9px] font-normal text-slate-400">{q.months}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.slice(0, 40).map((row) => (
                <tr key={row.studentId} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{row.studentName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {row.classSection} · {row.admissionNo}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{row.guardianName}</p>
                    <p className="text-[11px] text-slate-500">{row.guardianPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold font-mono ${
                        row.completedCount >= 4
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.completedCount >= 2
                            ? 'bg-blue-50 text-blue-900'
                            : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {row.completedCount} / 4
                    </span>
                  </td>
                  {ACADEMIC_VISIT_QUARTERS.map((meta) => {
                    const rec = row.quarters[meta.quarter];
                    if (rec?.status === 'Completed') {
                      return (
                        <td key={meta.quarter} className="px-3 py-3 text-center">
                          <span
                            title={`${rec.visitDate} by ${rec.visitingStaff}: ${rec.homeEnvironmentSummary}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1 text-[10px] font-bold text-emerald-800"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {rec.visitDate.slice(5)}
                          </span>
                        </td>
                      );
                    }
                    if (rec && (rec.status === 'Scheduled' || rec.status === 'Rescheduled')) {
                      return (
                        <td key={meta.quarter} className="px-3 py-3 text-center">
                          <span
                            title={`Scheduled ${rec.visitDate} with ${rec.visitingStaff}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2 py-1 text-[10px] font-bold text-blue-900"
                          >
                            <Clock className="h-3 w-3" />
                            {rec.visitDate.slice(5)}
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td key={meta.quarter} className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openFormForStudent(row.studentId, meta.quarter)}
                          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 hover:border-[#142B46] hover:text-[#142B46] transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          Log {meta.quarter}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No enrolled students match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredRows.length > 40 && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Showing first 40 of {filteredRows.length} enrolled students — filter by class or search to narrow down.</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#142B46]">
              <Users className="h-3.5 w-3.5" />
              <Sparkles className="h-3 w-3 text-amber-600" />4 Visits / Year Mandate
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
