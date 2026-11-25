import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Calculator, History, TrendingUp } from 'lucide-react';
import type { AcademicMonthKey } from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import {
  ACTIVE_SESSION_MONTHS,
  compareClassSections,
} from '../../utils/visAcademicProgressEngine';
import { GrowthLeaderboardCard } from '../GrowthLeaderboardCard';
import { SkillMonthlyGrowthLeaderboard } from '../SkillMonthlyGrowthLeaderboard';
import { ReadingTestArena } from '../ReadingTestArena';
import { NumeracyTablesArena } from '../NumeracyTablesArena';

export type AssessmentLabMode = 'reading' | 'numeracy' | 'leaderboard' | 'history';

interface ReadingNumeracyLabModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  initialMode?: AssessmentLabMode;
  initialStudentId?: string | null;
  modeNonce?: number;
}

export const ReadingNumeracyLabModule: React.FC<ReadingNumeracyLabModuleProps> = ({
  data,
  token,
  onRefresh,
  initialMode = 'reading',
  initialStudentId,
  modeNonce = 0,
}) => {
  const isStaff = !['parent', 'student'].includes(data.user.role);
  const [mode, setMode] = useState<AssessmentLabMode>(initialMode);
  const [selectedMonth, setSelectedMonth] = useState<AcademicMonthKey>('November');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    () => initialStudentId || data.students[0]?.id || '',
  );

  useEffect(() => {
    if (modeNonce > 0) {
      setMode(initialMode);
      if (initialStudentId) setSelectedStudentId(initialStudentId);
    }
  }, [modeNonce, initialMode, initialStudentId]);

  const classOptions = useMemo(() => {
    const set = new Set<string>(data.students.map((s) => s.classSection));
    return Array.from(set).sort(compareClassSections);
  }, [data.students]);

  const filteredStudents = useMemo(() => {
    if (classFilter === 'All') return data.students;
    return data.students.filter((s) => s.classSection === classFilter);
  }, [data.students, classFilter]);

  useEffect(() => {
    if (!filteredStudents.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(filteredStudents[0]?.id || data.students[0]?.id || '');
    }
  }, [filteredStudents, selectedStudentId, data.students]);

  const activeStudent = useMemo(
    () =>
      data.students.find((s) => s.id === selectedStudentId) ||
      filteredStudents[0] ||
      data.students[0] ||
      null,
    [data.students, filteredStudents, selectedStudentId],
  );

  const studentReadingSessions = useMemo(
    () =>
      (data.readingTestSessions || []).filter((s) =>
        activeStudent ? s.studentId === activeStudent.id : true,
      ),
    [data.readingTestSessions, activeStudent],
  );

  const studentNumeracySessions = useMemo(
    () =>
      (data.numeracyTestSessions || []).filter((s) =>
        activeStudent ? s.studentId === activeStudent.id : true,
      ),
    [data.numeracyTestSessions, activeStudent],
  );

  if (!activeStudent) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-2">
        <h1 className="font-display text-lg font-bold text-slate-900">
          Reading &amp; Numeracy Live Lab
        </h1>
        <p className="text-sm text-slate-600">
          No active student records are visible inside your current scope.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="reading-numeracy-lab">
      {/* Header + Student & Month Context Strip */}
      <div className="border-b border-slate-200 pb-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Reading &amp; Numeracy Live Diagnostic Lab
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Real-time class-leveled reading speed, pronunciation, chunk fluency, comprehension, bilingual sentence translation, and time-bound jumbled tables.
            </p>
          </div>

          <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setMode('reading')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                mode === 'reading'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Live Reading Test
            </button>
            <button
              type="button"
              onClick={() => setMode('numeracy')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                mode === 'numeracy'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              Timed Tables Test
            </button>
            <button
              type="button"
              onClick={() => setMode('leaderboard')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                mode === 'leaderboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Growth Leaderboard
            </button>
            <button
              type="button"
              onClick={() => setMode('history')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                mode === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              Session History ({studentReadingSessions.length + studentNumeracySessions.length})
            </button>
          </div>
        </div>

        {/* Target Student + Target Academic Month */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {isStaff ? (
              <>
                <label className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800">Class:</span>
                  <select
                    aria-label="Filter assessment students by class"
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900"
                  >
                    <option value="All">All Classes ({data.students.length})</option>
                    {classOptions.map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800">Student:</span>
                  <select
                    aria-label="Select student for live diagnostic"
                    value={activeStudent.id}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 max-w-xs"
                  >
                    {filteredStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · Class {s.classSection} ({s.admissionNo})
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-semibold text-slate-900">
                  {activeStudent.name} · Class {activeStudent.classSection}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-600">Adm {activeStudent.admissionNo}</span>
                {data.students.length > 1 && (
                  <select
                    aria-label="Switch linked child"
                    value={activeStudent.id}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900"
                  >
                    {data.students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Class {s.classSection})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600 mr-1">Sync Report Month:</span>
            {ACTIVE_SESSION_MONTHS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMonth(m)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                  selectedMonth === m
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mode 1: Real-Time Reading Diagnostic */}
      {mode === 'reading' && (
        <ReadingTestArena
          student={activeStudent}
          month={selectedMonth}
          token={token}
          existingSessions={studentReadingSessions}
          existingReports={(data.readingReports || []).filter(
            (r) => r.studentId === activeStudent.id,
          )}
          onSaved={async () => {
            await onRefresh();
          }}
        />
      )}

      {/* Mode 2: Timed Jumbled Multiplication Tables */}
      {mode === 'numeracy' && (
        <NumeracyTablesArena
          student={activeStudent}
          month={selectedMonth}
          token={token}
          onSaved={async () => {
            await onRefresh();
          }}
        />
      )}

      {/* Mode 3: Class-Level Monthly Growth Leaderboards (Reading & Numeracy) */}
      {mode === 'leaderboard' && (
        <div className="space-y-6">
          {isStaff && (
            <>
              <SkillMonthlyGrowthLeaderboard
                data={data}
                skillKey="reading"
                defaultClassSection={classFilter !== 'All' ? classFilter : activeStudent.classSection}
                defaultMonth={selectedMonth}
                onInspectStudent={(sid) => setSelectedStudentId(sid)}
              />
              <SkillMonthlyGrowthLeaderboard
                data={data}
                skillKey="numeracy"
                defaultClassSection={classFilter !== 'All' ? classFilter : activeStudent.classSection}
                defaultMonth={selectedMonth}
                onInspectStudent={(sid) => setSelectedStudentId(sid)}
              />
            </>
          )}
          {data.growthLeaderboards && (
            <GrowthLeaderboardCard
              leaderboards={data.growthLeaderboards}
              activeStudentId={activeStudent.id}
              defaultClassSection={activeStudent.classSection}
              isStaff={isStaff}
              onInspectStudent={(sid) => {
                setSelectedStudentId(sid);
              }}
              onLaunchReadingTest={() => setMode('reading')}
              onLaunchNumeracyTest={() => setMode('numeracy')}
            />
          )}
        </div>
      )}

      {/* Mode 4: Recorded Diagnostic Sessions History */}
      {mode === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="assessment-session-history">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-slate-900">
                Recorded Reading Diagnostics ({studentReadingSessions.length})
              </h2>
              <button
                type="button"
                onClick={() => setMode('reading')}
                className="text-xs font-semibold text-blue-900 hover:underline"
              >
                + New Reading Test
              </button>
            </div>
            {studentReadingSessions.length === 0 ? (
              <p className="p-5 text-xs text-slate-500">
                No live reading sessions saved for {activeStudent.name} yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-200">
                {studentReadingSessions.map((rs) => (
                  <div key={rs.id} className="p-4 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">{rs.passageTitle}</span>
                      <span className="font-mono font-bold text-blue-900 tabular-nums">
                        {rs.wpm} WPM · {rs.overallPct}% ({rs.readingBand})
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Fluency: <strong className="text-slate-800">{rs.dominantFluencyStyle}</strong> (Avg{' '}
                      <span className="font-mono tabular-nums">{rs.avgBurstWords}</span> words/go)
                    </p>
                    <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                      Pronunciation {rs.pronunciationPct}% · Comprehension {rs.comprehensionPct}% · Translation{' '}
                      {rs.translationPct}% · {rs.month} {rs.year} · {rs.assessedAt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-slate-900">
                Recorded Timed Tables Sprints ({studentNumeracySessions.length})
              </h2>
              <button
                type="button"
                onClick={() => setMode('numeracy')}
                className="text-xs font-semibold text-blue-900 hover:underline"
              >
                + New Tables Sprint
              </button>
            </div>
            {studentNumeracySessions.length === 0 ? (
              <p className="p-5 text-xs text-slate-500">
                No timed tables sprints saved for {activeStudent.name} yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-200">
                {studentNumeracySessions.map((ns) => (
                  <div key={ns.id} className="p-4 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">{ns.tableRangeLabel}</span>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums">
                        {ns.accuracyPct}% Acc · {ns.questionsPerMinute} QPM
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-600 tabular-nums">
                      {ns.correctCount}/{ns.totalQuestions} correct · Avg{' '}
                      {(ns.avgResponseMs / 1000).toFixed(1)}s/q · Tables Fluency {ns.tablesFluencyPct}%
                    </p>
                    {ns.weakTables.length > 0 && (
                      <p className="text-amber-800">
                        Weak Tables: {ns.weakTables.map((t) => `${t}×`).join(', ')}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500">
                      {ns.month} {ns.year} · {ns.assessedBy} · {ns.assessedAt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
