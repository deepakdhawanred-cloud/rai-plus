import React, { useEffect, useState } from 'react';
import { BookOpenCheck, CheckCircle2, Gamepad2, Plus, Sparkles } from 'lucide-react';
import type { ResourceCategory } from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { AcademicProgressLedgerPanel } from '../AcademicProgressLedgerPanel';
import { ChapterStudyGameWorkspace } from '../ChapterStudyGameWorkspace';
import { ClassSubjectResourceHub } from '../ClassSubjectResourceHub';
import { PresentationStudioWorkspace } from '../PresentationStudioWorkspace';
import { TimetableExplorerPanel } from '../TimetableExplorerPanel';
import {
  ProductionRegisterView,
  ViratDriveRepositoryView,
} from '../ViratDriveCurriculumViews';
import { InteractiveLearningModule } from '../interactiveLearning/InteractiveLearningModule';
import { LearningPortalModule } from './LearningPortalModule';

interface AcademicsModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  initialSubTab?: 'learning_portal' | 'study_game' | 'interactive_lab' | 'hub' | 'presentations';
  initialSubTabNonce?: number;
  interactiveLabEnabled?: boolean;
  onOpenOneGoAttendance?: () => void;
}

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'Presentations',
  'Teacher Guides',
  'Worksheets',
  'Answer Keys',
  'Assessments and Rubrics',
];

type AcademicsTab =
  | 'learning_portal'
  | 'study_game'
  | 'interactive_lab'
  | 'hub'
  | 'presentations'
  | 'timetable'
  | 'progress'
  | 'school'
  | 'drive'
  | 'register';

export const AcademicsModule: React.FC<AcademicsModuleProps> = ({
  data,
  token,
  onRefresh,
  initialSubTab,
  initialSubTabNonce = 0,
  interactiveLabEnabled = true,
  onOpenOneGoAttendance,
}) => {
  const drivePacks = data.viratResourcePacks || [];
  const registerRows = data.productionRegister || [];
  const registerApprovals = data.registerApprovals || {};
  const driveTotalFiles = drivePacks.reduce((s, p) => s + p.totalFiles, 0);
  const redesignedDeckCount = (data.redesignedDecks || []).length;

  const [viewTab, setViewTab] = useState<AcademicsTab>(
    initialSubTabNonce > 0 && initialSubTab ? initialSubTab : 'learning_portal',
  );

  useEffect(() => {
    if (initialSubTabNonce > 0 && initialSubTab) {
      setViewTab(initialSubTab);
    }
  }, [initialSubTab, initialSubTabNonce]);
  const [requestedClassKey, setRequestedClassKey] = useState<string | null>(null);
  const [requestedSubjectKey, setRequestedSubjectKey] = useState<string | null>(null);
  const [requestNonce, setRequestNonce] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<'All' | ResourceCategory>('All');
  const [title, setTitle] = useState('');
  const [classSection, setClassSection] = useState(data.user.classTeacherOf || '9-A');
  const [subject, setSubject] = useState('Mathematics');
  const [chapter, setChapter] = useState('Ch. 4: Linear Equations');
  const [category, setCategory] = useState<ResourceCategory>('Worksheets');
  const [contentSummary, setContentSummary] = useState('');
  const [pushToStudentsNow, setPushToStudentsNow] = useState(true);
  const [pushBusyId, setPushBusyId] = useState<string | null>(null);
  const [aiAssisted, setAiAssisted] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const isParentOrStudent = ['parent', 'student'].includes(data.user.role);
  const canEdit = ['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher'].includes(
    data.user.role,
  );
  const canApprove = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    data.user.role,
  );

  const visibleResources =
    selectedCategory === 'All'
      ? data.resources
      : data.resources.filter((r) => r.category === selectedCategory);

  async function handleAiDraft() {
    setErr(null);
    setAiLoading(true);
    try {
      const res = await apiRequest<{ title: string; summary: string }>(
        '/api/ai/generate-resource',
        {
          method: 'POST',
          body: JSON.stringify({
            board: data.activeSchool.board,
            classSection,
            subject,
            chapter,
            category,
          }),
        },
        token,
      );
      setTitle(res.title);
      setContentSummary(res.summary);
      setAiAssisted(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unable to draft resource');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleCreateResource(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!title.trim() || !subject.trim() || !chapter.trim()) {
      setErr('Resource title, subject, and chapter are required.');
      return;
    }
    setSaving(true);
    try {
      await apiRequest(
        '/api/resources',
        {
          method: 'POST',
          body: JSON.stringify({
            title,
            classSection,
            subject,
            chapter,
            category,
            contentSummary,
            aiAssisted,
            pushedToStudents: pushToStudentsNow,
          }),
        },
        token,
      );
      setTitle('');
      setContentSummary('');
      setAiAssisted(false);
      await onRefresh();
      setMsg(
        pushToStudentsNow
          ? `Academic resource saved and pushed to Class ${classSection} students.`
          : 'Academic resource saved as staff-only library item.',
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save resource');
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePushResource(id: string, nextPush: boolean) {
    setPushBusyId(id);
    try {
      await apiRequest(
        `/api/resources/${id}/push`,
        {
          method: 'POST',
          body: JSON.stringify({ pushed: nextPush }),
        },
        token,
      );
      await onRefresh();
    } finally {
      setPushBusyId(null);
    }
  }

  async function handleApproveResource(id: string) {
    await apiRequest(`/api/resources/${id}/approve`, { method: 'POST' }, token);
    await onRefresh();
  }

  async function handleApprovePlan(id: string) {
    await apiRequest(`/api/lesson-plans/${id}/approve-change`, { method: 'POST' }, token);
    await onRefresh();
  }

  const canUseInteractiveLab = interactiveLabEnabled;

  const effectiveTab: AcademicsTab = (() => {
    if (viewTab === 'interactive_lab' && !canUseInteractiveLab) {
      return 'study_game';
    }
    if (isParentOrStudent) {
      if (
        viewTab === 'study_game' ||
        viewTab === 'interactive_lab' ||
        viewTab === 'hub' ||
        viewTab === 'timetable' ||
        viewTab === 'progress'
      ) {
        return viewTab;
      }
      return 'study_game';
    }
    return viewTab;
  })();

  const defaultStudentClassLabel =
    data.user.classTeacherOf ||
    data.students[0]?.classSection ||
    'Class 10';

  const activeLearnerName =
    data.user.role === 'parent' || data.user.role === 'student'
      ? data.students[0]?.name || data.user.name
      : data.user.name;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 space-y-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#142B46]">
            Class Learning Hub
          </h1>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              {isParentOrStudent
                ? `All class work in one place — Classes 6–12 Interactive Learning Portal (127 chapters & 394 visuals/3D models), Quick Revise games, Interactive Learning Lab, ${data.activeSchool.board} notes, timetable, and progress.`
                : data.user.role === 'teacher'
                  ? `All class teaching & revision tools in one place — 127-Chapter Learning Portal & Syllabus Monitor, Quick Revise games, Interactive Learning Lab, class resources, presentations, and lesson plans (${data.user.subjectSpecialty || data.user.designation}).`
                  : `${data.activeSchool.board} unified Class Learning Hub — 127-Chapter Interactive Learning Portal (394 visuals & 3D models), Syllabus Monitor, Quick Revise games, Interactive Learning Lab, class resources, and curriculum governance.`}
            </p>
            {data.user.role === 'teacher' && onOpenOneGoAttendance && (
              <button
                type="button"
                onClick={onOpenOneGoAttendance}
                className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0"
              >
                Open One-Go Attendance in Today Workspace →
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E5D7C3] bg-[#F3E6D8]/75 p-1">
          <button
            type="button"
            onClick={() => setViewTab('learning_portal')}
            data-testid="academics-tab-learning-portal"
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              effectiveTab === 'learning_portal'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-[#142B46] hover:bg-white/80'
            }`}
          >
            <BookOpenCheck className="h-3.5 w-3.5 text-amber-300" />
            Learning Portal (127 Chapters)
          </button>
          <button
            type="button"
            onClick={() => setViewTab('study_game')}
            data-testid="academics-tab-chapter-mastery"
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              effectiveTab === 'study_game'
                ? 'bg-[#142B46] text-[#FAF4EC] shadow-xs'
                : 'text-[#142B46] hover:bg-white/80'
            }`}
          >
            <Gamepad2 className="h-3.5 w-3.5 text-[#D6B66D]" />
            Quick Revise Games
          </button>
          {canUseInteractiveLab && (
            <button
              type="button"
              onClick={() => setViewTab('interactive_lab')}
              data-testid="academics-tab-interactive-lab"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                effectiveTab === 'interactive_lab'
                  ? 'bg-[#142B46] text-[#FAF4EC] shadow-xs'
                  : 'text-[#142B46] hover:bg-white/80'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#D6B66D]" />
              Interactive Learning Lab
            </button>
          )}
          <button
            type="button"
            onClick={() => setViewTab('hub')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              effectiveTab === 'hub'
                ? 'bg-white text-[#142B46] shadow-xs'
                : 'text-slate-700 hover:bg-white/60 hover:text-[#142B46]'
            }`}
          >
            Class Resources &amp; Notes
          </button>
          <button
            type="button"
            onClick={() => setViewTab('timetable')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              effectiveTab === 'timetable'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            Timetable ({data.timetable.length})
          </button>
          <button
            type="button"
            onClick={() => setViewTab('progress')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              effectiveTab === 'progress'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            Progress &amp; Skills
          </button>
          {!isParentOrStudent && (
            <>
              <span className="hidden sm:inline-block h-4 w-px bg-[#D6B66D]/50 mx-1" aria-hidden="true" />
              <button
                type="button"
                onClick={() => setViewTab('presentations')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  effectiveTab === 'presentations'
                    ? 'bg-white text-[#142B46] shadow-xs'
                    : 'text-slate-700 hover:bg-white/60 hover:text-[#142B46]'
                }`}
              >
                Presentations ({redesignedDeckCount})
              </button>
              <button
                type="button"
                onClick={() => setViewTab('school')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  effectiveTab === 'school'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                Upload &amp; Lesson Plans
              </button>
              {drivePacks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewTab('drive')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    effectiveTab === 'drive'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  }`}
                >
                  Drive ({driveTotalFiles.toLocaleString()})
                </button>
              )}
              {registerRows.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewTab('register')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    effectiveTab === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  }`}
                >
                  Curriculum Register ({registerRows.length})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {effectiveTab === 'learning_portal' ? (
        <LearningPortalModule data={data} token={token} embedded />
      ) : effectiveTab === 'study_game' ? (
        <ChapterStudyGameWorkspace
          board={data.activeSchool.board}
          userId={data.user.id}
          userRole={data.user.role}
          token={token}
          studentName={activeLearnerName}
          defaultClassLabel={defaultStudentClassLabel}
          subjectSpecialty={data.user.subjectSpecialty}
          registerRows={registerRows}
          schoolResources={data.resources}
        />
      ) : effectiveTab === 'interactive_lab' && canUseInteractiveLab ? (
        <InteractiveLearningModule
          data={data}
          token={token}
          onRefresh={onRefresh}
          embedded
        />
      ) : effectiveTab === 'hub' ? (
        <ClassSubjectResourceHub
          packs={drivePacks}
          registerRows={registerRows}
          registerApprovals={registerApprovals}
          schoolResources={data.resources}
          schoolName={data.activeSchool.name}
          board={data.activeSchool.board}
          userRole={data.user.role}
          subjectSpecialty={data.user.subjectSpecialty}
          canEdit={canEdit}
          canApprove={canApprove}
          token={token}
          onRefresh={onRefresh}
          requestedClassKey={requestedClassKey}
          requestedSubjectKey={requestedSubjectKey}
          requestNonce={requestNonce}
        />
      ) : effectiveTab === 'presentations' && !isParentOrStudent ? (
        <PresentationStudioWorkspace data={data} token={token} onRefresh={onRefresh} />
      ) : effectiveTab === 'timetable' ? (
        <TimetableExplorerPanel
          timetable={data.timetable}
          user={data.user}
          schoolId={data.activeSchool.id}
          canEdit={canEdit}
          token={token}
          onRefresh={onRefresh}
          onOpenClassSubjectResources={(classKey, subjectKey) => {
            setRequestedClassKey(classKey);
            setRequestedSubjectKey(subjectKey);
            setRequestNonce((n) => n + 1);
            setViewTab('hub');
          }}
        />
      ) : effectiveTab === 'progress' ? (
        <AcademicProgressLedgerPanel
          data={data}
          token={token}
          canEdit={canEdit}
          onRefresh={onRefresh}
        />
      ) : effectiveTab === 'drive' && !isParentOrStudent && drivePacks.length > 0 ? (
        <ViratDriveRepositoryView packs={drivePacks} />
      ) : effectiveTab === 'register' && !isParentOrStudent && registerRows.length > 0 ? (
        <ProductionRegisterView
          rows={registerRows}
          approvals={registerApprovals}
          canConfirmApproval={canEdit}
          token={token}
          onRefresh={onRefresh}
        />
      ) : (
        <div className="space-y-8">
          {/* 5-Category Resource Bank + Upload */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Academic Resource Repository (5 Approved Categories)
                </h2>
                <p className="text-xs text-slate-500">
                  Existing approved resources are preserved without unnecessary duplication.
                </p>
              </div>
              <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
                {(['All', ...RESOURCE_CATEGORIES] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      selectedCategory === cat
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
              {visibleResources.slice(0, 60).map((res) => (
                <div
                  key={res.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-amber-700">{res.category}</span> · Class{' '}
                      {res.classSection} · {res.subject} · {res.chapter} · {res.board}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{res.title}</p>
                    <p className="text-xs text-slate-600">{res.contentSummary}</p>
                    <p className="text-xs text-slate-400">
                      By {res.createdBy} · Updated {res.updatedAt}
                      {res.aiAssisted ? ' · AI-assisted draft' : ''}
                      {res.pushedToStudents
                        ? ` · Pushed to Class ${res.classSection} by ${res.pushedBy || res.createdBy}`
                        : ' · Not pushed to students yet'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-semibold ${
                        res.pushedToStudents
                          ? 'text-emerald-700'
                          : res.status === 'Approved'
                            ? 'text-slate-600'
                            : 'text-amber-700'
                      }`}
                    >
                      {res.pushedToStudents ? 'Pushed to Class' : `${res.status} · Staff Only`}
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        disabled={pushBusyId === res.id}
                        onClick={() =>
                          void handleTogglePushResource(res.id, !Boolean(res.pushedToStudents))
                        }
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                          res.pushedToStudents
                            ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            : 'bg-[#142B46] text-white hover:bg-[#1e3d63]'
                        }`}
                      >
                        {pushBusyId === res.id
                          ? 'Saving...'
                          : res.pushedToStudents
                            ? 'Recall'
                            : `Push to Class ${res.classSection}`}
                      </button>
                    )}
                    {canApprove && res.status !== 'Approved' && (
                      <button
                        type="button"
                        onClick={() => void handleApproveResource(res.id)}
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 whitespace-nowrap"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {canEdit && (
              <form
                onSubmit={handleCreateResource}
                className="border-t border-slate-200 bg-slate-50/70 p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Upload or AI-Draft Academic Resource
                  </h3>
                  <button
                    type="button"
                    onClick={() => void handleAiDraft()}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-900/30 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap shrink-0 self-start"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {aiLoading ? 'Generating Outline...' : 'Generate AI Resource Draft'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <select
                    aria-label="Resource category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  >
                    {RESOURCE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    aria-label="Class section"
                    value={classSection}
                    onChange={(e) => setClassSection(e.target.value)}
                    placeholder="Class (e.g. 9-A)"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    aria-label="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    aria-label="Chapter"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="Chapter"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </div>

                <input
                  type="text"
                  aria-label="Resource title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Resource Title"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
                <textarea
                  rows={2}
                  aria-label="Resource content summary"
                  value={contentSummary}
                  onChange={(e) => setContentSummary(e.target.value)}
                  placeholder="Teaching outline, key concepts, or rubric notes..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#142B46] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushToStudentsNow}
                    onChange={(e) => setPushToStudentsNow(e.target.checked)}
                    className="rounded accent-[#142B46]"
                  />
                  Push immediately to Class {classSection || 'assigned'} students &amp; parents at{' '}
                  {data.activeSchool.name}
                </label>

                {err && <p className="text-xs text-red-700">{err}</p>}
                {msg && (
                  <p className="text-xs text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {msg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e3d63]"
                >
                  <Plus className="h-3.5 w-3.5 text-[#D6B66D]" />
                  {saving
                    ? 'Saving...'
                    : pushToStudentsNow
                      ? `Save & Push to Class ${classSection}`
                      : 'Save to Staff Library'}
                </button>
              </form>
            )}
          </div>

          {/* Lesson Planning & Calendar Approvals */}
          {data.lessonPlans.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Yearly, Monthly, Weekly &amp; Daily Academic Plans
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {data.lessonPlans.map((lp) => (
                  <div
                    key={lp.id}
                    className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {lp.level} Plan · Class {lp.classSection} · {lp.subject} — {lp.topic}
                      </p>
                      <p className="text-slate-600 mt-0.5">{lp.learningOutcome}</p>
                      <p className="text-slate-400 mt-0.5">
                        Teacher: {lp.teacherName} · Target: {lp.targetDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`font-semibold ${
                          lp.approvalRequired ? 'text-amber-700' : 'text-slate-700'
                        }`}
                      >
                        {lp.status}
                      </span>
                      {canApprove && lp.approvalRequired && (
                        <button
                          type="button"
                          onClick={() => void handleApprovePlan(lp.id)}
                          className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                        >
                          Approve Calendar Change
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
