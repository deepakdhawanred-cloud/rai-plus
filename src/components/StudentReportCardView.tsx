import React from 'react';
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { School } from '../types';
import type {
  AssessedSkillItem,
  CategoryScoreCell,
  StudentReportCardModel,
} from '../utils/marksReportCardEngine';
import { RAI_PLUS_LOGO_URL } from '../utils/transportEngine';

interface StudentReportCardViewProps {
  school: School;
  reportCard: StudentReportCardModel;
  onPrint?: () => void;
}

function bandTextClasses(
  band: 'Distinction' | 'Proficient' | 'Developing' | 'Needs Support' | 'Observed' | 'Pending',
): string {
  if (band === 'Distinction') return 'text-emerald-800 font-semibold';
  if (band === 'Proficient') return 'text-blue-900 font-semibold';
  if (band === 'Developing') return 'text-amber-800 font-semibold';
  if (band === 'Needs Support') return 'text-rose-700 font-semibold';
  return 'text-slate-500 font-medium';
}

function barFillClass(score: number | null): string {
  if (score === null) return 'bg-slate-300';
  if (score >= 82) return 'bg-emerald-600';
  if (score >= 68) return 'bg-blue-800';
  if (score >= 52) return 'bg-amber-500';
  return 'bg-rose-600';
}

function formatCategoryCell(cell: CategoryScoreCell): string {
  if (cell.count === 0 || cell.avgPct === null) return '—';
  return `${cell.obtainedTotal}/${cell.maxTotal} (${cell.avgPct}%)`;
}

const SkillRowList: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: AssessedSkillItem[];
  emptyMessage: string;
}> = ({ title, subtitle, icon, items, emptyMessage }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 print-avoid-break">
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
      <div className="flex items-center gap-2">
        <span className="text-blue-900">{icon}</span>
        <div>
          <h4 className="font-display text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <span className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
        {items.length} assessed
      </span>
    </div>

    {items.length === 0 ? (
      <p className="text-xs text-slate-500 py-2">{emptyMessage}</p>
    ) : (
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <div className="min-w-0">
                <span className="font-semibold text-slate-900">{item.skillName}</span>
                <span className="text-slate-400 mx-1.5">·</span>
                <span className="text-slate-500">{item.domain}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                <span className="font-semibold text-slate-900">{item.displayValue}</span>
                <span className={`text-[11px] font-sans ${bandTextClasses(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${barFillClass(item.score)}`}
                style={{ width: `${Math.max(4, Math.min(100, item.score ?? 0))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">{item.detail}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const StudentReportCardView: React.FC<StudentReportCardViewProps> = ({
  school,
  reportCard,
  onPrint,
}) => {
  const { student, academicSummary, subjectRows, chronologicalMarks, skillsSummary } = reportCard;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    window.print();
  };

  return (
    <article
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden print:border-slate-300 print:rounded-none"
      data-testid="student-report-card"
    >
      {/* Institutional Letterhead Banner */}
      <header className="bg-[#142B46] text-[#F3E6D8] px-6 py-5 border-b-2 border-[#D6B66D]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={RAI_PLUS_LOGO_URL}
              alt={`${school.name} emblem`}
              className="h-12 w-12 rounded-xl border border-[#D6B66D]/60 bg-[#FAF4EC] object-cover shrink-0"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D6B66D]">
                Official Academic & Holistic Skills Report Card
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight mt-0.5">
                {school.name}
              </h2>
              <p className="text-xs text-[#E5D6C3] mt-0.5">
                {school.city}, {school.state} · {school.board} · UDISE {school.udiseCode} · Session{' '}
                {school.session}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D6B66D] px-4 py-2 text-xs font-bold text-[#142B46] hover:bg-[#C5A255] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </header>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Student Identity & Executive Summary Strip */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 rounded-xl border border-slate-200 bg-[#FAF4EC]/60 p-4">
          <div className="lg:col-span-7 space-y-1.5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-display text-xl font-bold text-slate-900">{student.name}</h3>
              <span className="text-xs font-semibold text-blue-900">
                Class {student.classSection}
                {student.stream ? ` · ${student.stream}` : ''}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-mono tabular-nums">
              Roll No: {student.rollNo} · Admission No: {student.admissionNo} · House:{' '}
              <span className="font-sans text-slate-700">{student.house}</span>
            </p>
            <p className="text-xs text-slate-600">
              Parent / Guardian: <span className="font-semibold text-slate-800">{student.guardianName}</span>
              {' · '}Report Date:{' '}
              <span className="font-mono tabular-nums">{reportCard.generatedAt}</span>
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[11px] text-slate-500">Academic Aggregate</p>
              <p className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                {academicSummary.overallPct !== null ? `${academicSummary.overallPct}%` : '—'}
                {academicSummary.overallGrade ? (
                  <span className="ml-1.5 text-xs font-sans font-bold text-emerald-800">
                    {academicSummary.overallGrade.grade}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[11px] text-slate-500">Attendance</p>
              <p className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                {Math.round(student.attendancePct)}%
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[11px] text-slate-500">Learners 360° Index</p>
              <p className="font-mono text-lg font-bold text-blue-900 tabular-nums">
                {skillsSummary.learnersOverallScore !== null
                  ? `${skillsSummary.learnersOverallScore}/100`
                  : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[11px] text-slate-500">Skills Assessed</p>
              <p className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                {skillsSummary.totalSkillsAssessed}
                {skillsSummary.avgSkillScore !== null ? (
                  <span className="ml-1.5 text-xs font-sans text-slate-500">
                    ({skillsSummary.avgSkillScore}% avg)
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Subject-wise Marks Matrix (Class Test, UT, Semester Exam) */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-blue-900" />
              <h3 className="font-display text-base font-bold text-slate-900">
                1. Scholastic Performance (Class Tests · Unit Tests · Semester Exams)
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono tabular-nums">
              Class Test Avg:{' '}
              <strong className="text-slate-800">
                {academicSummary.classTestAvgPct !== null
                  ? `${academicSummary.classTestAvgPct}%`
                  : '—'}
              </strong>{' '}
              · UT Avg:{' '}
              <strong className="text-slate-800">
                {academicSummary.utAvgPct !== null ? `${academicSummary.utAvgPct}%` : '—'}
              </strong>{' '}
              · Semester Avg:{' '}
              <strong className="text-slate-800">
                {academicSummary.semesterExamAvgPct !== null
                  ? `${academicSummary.semesterExamAvgPct}%`
                  : '—'}
              </strong>
            </p>
          </div>

          {subjectRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center text-xs text-slate-600">
              No Class Test, Unit Test, or Semester Exam marks have been recorded for {student.name}{' '}
              yet. Marks entered by subject teachers appear here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3 text-right">Class Tests</th>
                    <th className="py-2.5 px-3 text-right">Unit Tests (UT)</th>
                    <th className="py-2.5 px-3 text-right">Semester Exams</th>
                    <th className="py-2.5 px-3 text-right">Combined</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3">Teacher Remarks & Focus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectRows.map((row) => (
                    <tr key={row.subject} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{row.subject}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {formatCategoryCell(row.classTest)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {formatCategoryCell(row.ut)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {formatCategoryCell(row.semesterExam)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {row.overallObtained}/{row.overallMax} ({row.overallPct}%)
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-mono font-bold ${bandTextClasses(row.grade.band)}`}>
                          {row.grade.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs">
                        {row.remarks[0] ||
                          (row.conceptualGaps[0] ? `Focus: ${row.conceptualGaps[0]}` : row.grade.remark)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#FAF4EC] border-t border-slate-200 font-bold text-slate-900">
                    <td className="py-2.5 px-3">Grand Total ({subjectRows.length} Subjects)</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {academicSummary.classTestAvgPct !== null
                        ? `${academicSummary.classTestAvgPct}% avg`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {academicSummary.utAvgPct !== null ? `${academicSummary.utAvgPct}% avg` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {academicSummary.semesterExamAvgPct !== null
                        ? `${academicSummary.semesterExamAvgPct}% avg`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {academicSummary.overallObtained}/{academicSummary.overallMax} (
                      {academicSummary.overallPct ?? 0}%)
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-800">
                      {academicSummary.overallGrade?.grade || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-normal text-slate-700">
                      {academicSummary.overallGrade?.remark || '—'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Individual Exam Log Summary (Compact) */}
          {chronologicalMarks.length > 0 && (
            <details className="rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-2.5 print:open">
              <summary className="cursor-pointer text-xs font-semibold text-blue-900 select-none">
                View All {chronologicalMarks.length} Individual Assessment Entries (Class Tests, UTs
                & Semester Exams)
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-1.5 pr-3">Date</th>
                      <th className="py-1.5 pr-3">Type</th>
                      <th className="py-1.5 pr-3">Exam / Test</th>
                      <th className="py-1.5 pr-3">Subject</th>
                      <th className="py-1.5 pr-3 text-right">Score</th>
                      <th className="py-1.5 pr-3 text-center">Grade</th>
                      <th className="py-1.5">Remarks / Focus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chronologicalMarks.map((m) => (
                      <tr key={m.id}>
                        <td className="py-1.5 pr-3 font-mono tabular-nums text-slate-600">
                          {m.date}
                        </td>
                        <td className="py-1.5 pr-3 font-semibold text-slate-800">{m.category}</td>
                        <td className="py-1.5 pr-3 text-slate-700">{m.examName}</td>
                        <td className="py-1.5 pr-3 text-slate-800">{m.subject}</td>
                        <td className="py-1.5 pr-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {m.obtainedMarks}/{m.maxMarks} ({m.pct}%)
                        </td>
                        <td className="py-1.5 pr-3 text-center font-mono font-bold text-blue-900">
                          {m.grade.grade}
                        </td>
                        <td className="py-1.5 text-slate-600">
                          {m.remarks || m.conceptualGap || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </section>

        {/* Section 2: Comprehensive All Skills Assessed */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-900" />
              <h3 className="font-display text-base font-bold text-slate-900">
                2. Comprehensive Skills Assessed Across All Domains
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {skillsSummary.totalSkillsAssessed} verified skill indicators assessed across academic,
              foundational, cognitive, behavioral & OLQ dimensions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkillRowList
              title="Learners 360° Core Skill Pillars"
              subtitle="Weighted multi-source holistic performance breakdown"
              icon={<TrendingUp className="h-4 w-4" />}
              items={skillsSummary.learnersPillars}
              emptyMessage="Core pillars will populate as verified classroom and assessment evidence is logged."
            />

            <SkillRowList
              title="Foundational Literacy, Numeracy & Digital Skills"
              subtitle="Reading fluency, tables/mental math, and computer literacy"
              icon={<BookOpen className="h-4 w-4" />}
              items={skillsSummary.foundationalSkills}
              emptyMessage="No Reading, Numeracy, or Computer Skill diagnostics recorded yet."
            />

            <SkillRowList
              title="Cognitive, Applied Thinking & Psychometric Skills"
              subtitle="Brain games, SRT/WAT/TAT/PPDT thinking tests, VCIP & aptitude"
              icon={<Brain className="h-4 w-4" />}
              items={skillsSummary.cognitiveAndThinkingSkills}
              emptyMessage="No cognitive games, thinking tests, or psychometric records available for this student yet."
            />

            <SkillRowList
              title="Classroom Learning Habits & Study Skills"
              subtitle="8 observed classroom work-habit indicators"
              icon={<ClipboardList className="h-4 w-4" />}
              items={skillsSummary.learningHabits}
              emptyMessage="Learning habit scores populate from teacher notebook and classroom observations."
            />
          </div>

          {/* All 15 Officer-Like Qualities (OLQs) Grid */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 print-avoid-break">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-900" />
                <div>
                  <h4 className="font-display text-sm font-bold text-slate-900">
                    15 Officer-Like Qualities (OLQ) Character & Leadership Skills
                  </h4>
                  <p className="text-xs text-slate-500">
                    Evidence-backed behavioral and leadership assessment across all four factor groups
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                15 Core Qualities
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillsSummary.olqGroups.map((grp) => (
                <div
                  key={grp.group}
                  className="rounded-lg border border-slate-200 bg-[#FAF4EC]/40 p-3 space-y-2"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    {grp.group}
                  </p>
                  <div className="divide-y divide-slate-200/70">
                    {grp.items.map((olq) => (
                      <div
                        key={olq.key}
                        className="py-1.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-slate-400 mr-1.5 tabular-nums">
                            {String(olq.index).padStart(2, '0')}
                          </span>
                          <span className="font-medium text-slate-800">{olq.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                          <span className="font-bold text-slate-900">
                            {olq.score !== null ? `${olq.score}/100` : '—'}
                          </span>
                          <span className={`text-[11px] font-sans ${bandTextClasses(olq.band)}`}>
                            {olq.band}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Yearly Skill Plan Targets */}
          {skillsSummary.yearlySkillTargets.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 print-avoid-break">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Target className="h-4 w-4 text-blue-900" />
                <div>
                  <h4 className="font-display text-sm font-bold text-slate-900">
                    Individual Yearly Skill Plan & Achievable Targets
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tracked skill milestones from baseline to annual target
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-3">Skill Target</th>
                      <th className="py-2 pr-3">Domain</th>
                      <th className="py-2 pr-3 text-right">Baseline</th>
                      <th className="py-2 pr-3 text-right">Current</th>
                      <th className="py-2 pr-3 text-right">Goal</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {skillsSummary.yearlySkillTargets.map((t) => (
                      <tr key={t.id}>
                        <td className="py-2 pr-3 font-semibold text-slate-900">{t.skillName}</td>
                        <td className="py-2 pr-3 text-slate-600">{t.domain}</td>
                        <td className="py-2 pr-3 text-right font-mono tabular-nums text-slate-600">
                          {t.baselineScore}%
                        </td>
                        <td className="py-2 pr-3 text-right font-mono tabular-nums font-bold text-slate-900">
                          {t.currentScore}%
                        </td>
                        <td className="py-2 pr-3 text-right font-mono tabular-nums text-blue-900 font-semibold">
                          {t.targetScore}%
                        </td>
                        <td className="py-2">
                          <span
                            className={
                              t.atRiskDueToAbsence
                                ? 'text-rose-700 font-semibold'
                                : t.status === 'Achieved'
                                  ? 'text-emerald-800 font-semibold'
                                  : 'text-slate-700 font-medium'
                            }
                          >
                            {t.status}
                            {t.atRiskDueToAbsence ? ' · Absence Risk' : ''}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Section 3: Strengths, Priority Focus, Co-Scholastic & Signatories */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-5 print-avoid-break">
          <div className="rounded-xl border border-slate-200 bg-emerald-50/40 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 font-display text-sm font-bold">
              <Sparkles className="h-4 w-4 text-emerald-700" />
              Observed Strengths & Achievements
            </div>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {(skillsSummary.strengths.length > 0
                ? skillsSummary.strengths
                : ['Demonstrates steady engagement across assigned classroom activities.']
              ).map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
              {student.achievements.map((ach, idx) => (
                <li key={`ach-${idx}`} className="flex items-start gap-2">
                  <Award className="h-3.5 w-3.5 text-amber-700 mt-0.5 shrink-0" />
                  <span>{ach}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-amber-50/40 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-display text-sm font-bold">
              <Compass className="h-4 w-4 text-amber-700" />
              Priority Growth Areas & Faculty Advisory
            </div>
            {skillsSummary.supportAreas.length > 0 && (
              <ul className="space-y-1 text-xs text-slate-800 list-disc pl-4">
                {skillsSummary.supportAreas.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-slate-700 leading-relaxed">{skillsSummary.advisoryNote}</p>
            {student.responsibilities.length > 0 && (
              <p className="text-xs text-slate-600 pt-1 border-t border-amber-200/70">
                <strong className="text-slate-800">Responsibilities:</strong>{' '}
                {student.responsibilities.join(' · ')}
              </p>
            )}
          </div>
        </section>

        {/* Official Signatory Row */}
        <footer className="grid grid-cols-3 gap-6 pt-8 pb-2 border-t border-slate-200 text-center text-xs text-slate-600 print-avoid-break">
          <div>
            <div className="h-8 border-b border-slate-300 mx-4 mb-1.5" />
            <p className="font-semibold text-slate-800">Class Teacher</p>
          </div>
          <div>
            <div className="h-8 border-b border-slate-300 mx-4 mb-1.5" />
            <p className="font-semibold text-slate-800">Principal / Head of School</p>
          </div>
          <div>
            <div className="h-8 border-b border-slate-300 mx-4 mb-1.5" />
            <p className="font-semibold text-slate-800">Parent / Guardian</p>
          </div>
        </footer>
      </div>
    </article>
  );
};
