import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  FolderOpen,
  Layers,
  X,
} from 'lucide-react';
import type {
  AcademicResource,
  ProductionRegisterRow,
  RegisterApprovalRecord,
  ResourceCategory,
  UserRole,
  ViratDriveFileItem,
  ViratResourcePack,
} from '../types';
import {
  buildClassSubjectResourceIndex,
  RESOURCE_CATEGORIES_ORDER,
} from '../utils/academicOperationsEngine';
import { apiRequest } from '../utils/api';
import { resolveRegisterApprovalState } from '../utils/viratCurriculumEngine';

interface ClassSubjectResourceHubProps {
  packs: ViratResourcePack[];
  registerRows: ProductionRegisterRow[];
  registerApprovals: Record<string, RegisterApprovalRecord>;
  schoolResources: AcademicResource[];
  schoolName?: string;
  board?: string;
  userRole?: UserRole;
  subjectSpecialty?: string;
  canEdit: boolean;
  canApprove: boolean;
  token: string;
  onRefresh: () => Promise<void>;
  requestedClassKey?: string | null;
  requestedSubjectKey?: string | null;
  requestNonce?: number;
}

export const ClassSubjectResourceHub: React.FC<ClassSubjectResourceHubProps> = ({
  packs,
  registerRows,
  registerApprovals,
  schoolResources,
  schoolName,
  board,
  userRole,
  subjectSpecialty,
  canEdit,
  canApprove,
  token,
  onRefresh,
  requestedClassKey,
  requestedSubjectKey,
  requestNonce = 0,
}) => {
  const isParentOrStudent = userRole === 'parent' || userRole === 'student';
  const isLeadership = !userRole || ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(userRole);
  const groups = useMemo(
    () =>
      buildClassSubjectResourceIndex({
        packs,
        registerRows,
        registerApprovals,
        schoolResources,
      }),
    [packs, registerRows, registerApprovals, schoolResources],
  );

  const [selectedClassKey, setSelectedClassKey] = useState<string>(() => {
    if (requestedClassKey && groups.some((g) => g.classKey === requestedClassKey)) {
      return requestedClassKey;
    }
    return groups[0]?.classKey || '';
  });

  const activeClassGroup = useMemo(
    () => groups.find((g) => g.classKey === selectedClassKey) || groups[0],
    [groups, selectedClassKey],
  );

  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    const initGroup =
      (requestedClassKey ? groups.find((g) => g.classKey === requestedClassKey) : undefined) ||
      groups[0];
    if (!initGroup) return '';
    if (requestedSubjectKey && initGroup.subjects.some((s) => s.subject === requestedSubjectKey)) {
      return requestedSubjectKey;
    }
    return initGroup.subjects[0]?.subject || '';
  });
  const [selectedCategory, setSelectedCategory] = useState<'All' | ResourceCategory>('All');
  const [previewItem, setPreviewItem] = useState<{
    file: ViratDriveFileItem;
    pack: ViratResourcePack;
  } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const lastHandledNonceRef = React.useRef<number>(requestNonce);

  useEffect(() => {
    if (requestNonce === 0 || requestNonce === lastHandledNonceRef.current) return;
    lastHandledNonceRef.current = requestNonce;
    if (requestedClassKey && groups.some((g) => g.classKey === requestedClassKey)) {
      setSelectedClassKey(requestedClassKey);
      const targetGroup = groups.find((g) => g.classKey === requestedClassKey);
      if (
        targetGroup &&
        requestedSubjectKey &&
        targetGroup.subjects.some((s) => s.subject === requestedSubjectKey)
      ) {
        setSelectedSubject(requestedSubjectKey);
      } else if (targetGroup) {
        setSelectedSubject(targetGroup.subjects[0]?.subject || '');
      }
    }
  }, [requestNonce, requestedClassKey, requestedSubjectKey, groups]);

  const activeSubjectNode = useMemo(
    () =>
      activeClassGroup?.subjects.find((s) => s.subject === selectedSubject) ||
      activeClassGroup?.subjects[0],
    [activeClassGroup, selectedSubject],
  );

  async function handleConfirmRegisterApproval(row: ProductionRegisterRow) {
    setBusyId(row.rowId);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/production-register/${encodeURIComponent(row.rowId)}/approve`,
        { method: 'POST', body: JSON.stringify({}) },
        token,
      );
      await onRefresh();
      setFeedback(
        `Confirmed Teacher Approval for Class ${row.classLabel} ${row.subject} — ${row.chapterTitle}.`,
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleApproveSchoolResource(id: string) {
    setBusyId(id);
    setFeedback(null);
    try {
      await apiRequest(`/api/resources/${id}/approve`, { method: 'POST' }, token);
      await onRefresh();
      setFeedback('School academic resource approved for student & parent visibility.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleTogglePushResource(res: AcademicResource) {
    setBusyId(res.id);
    setFeedback(null);
    const nextPush = !Boolean(res.pushedToStudents);
    try {
      await apiRequest(
        `/api/resources/${res.id}/push`,
        {
          method: 'POST',
          body: JSON.stringify({ pushed: nextPush }),
        },
        token,
      );
      await onRefresh();
      setFeedback(
        nextPush
          ? `Pushed "${res.title}" to Class ${res.classSection} students & parents.`
          : `Recalled "${res.title}" from Class ${res.classSection} student view.`,
      );
    } finally {
      setBusyId(null);
    }
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
        {isParentOrStudent
          ? `No teacher-pushed resources have been released for your dedicated class at ${schoolName || 'your school'} yet.`
          : 'No approved resources indexed yet for your assigned class/subject scope.'}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header & Class Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-900" />
              {schoolName ? `${schoolName} · ` : ''}Class-Specific Academic Resources
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {isParentOrStudent
                ? `Showing strictly resources pushed by teachers for your dedicated class (${board || 'School'} curriculum).`
                : userRole === 'teacher'
                  ? `Restricted strictly to your assigned teaching classes & subjects${subjectSpecialty ? ` (${subjectSpecialty})` : ''}. Push resources to release them to your class students.`
                  : `${schoolName || 'School'}-specific ${board || 'HBSE/NCERT'} curriculum packs and repository items. Only items pushed by teachers appear to students of that class.`}
            </p>
          </div>
          {isLeadership && (
            <a
              href="https://drive.google.com/drive/folders/1c0E9-mwQ0XofVDmdw3YNHirXelUrc7ml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap self-start"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Open Master Drive Folder
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Class Chips */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            1. Select Class
          </p>
          <div className="flex flex-wrap gap-2">
            {groups.map((grp) => {
              const active = grp.classKey === activeClassGroup?.classKey;
              return (
                <button
                  key={grp.classKey}
                  type="button"
                  onClick={() => {
                    setSelectedClassKey(grp.classKey);
                    setSelectedSubject(grp.subjects[0]?.subject || '');
                  }}
                  className={`rounded-lg border px-3 py-2 text-left ${
                    active
                      ? 'border-blue-900 bg-blue-900 text-white'
                      : 'border-slate-200 bg-slate-50/70 text-slate-800 hover:border-blue-900/40 hover:bg-blue-50/40'
                  }`}
                >
                  <p className="text-xs font-bold whitespace-nowrap">{grp.classKey}</p>
                  <p
                    className={`font-mono text-[10px] tabular-nums ${
                      active ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {grp.subjects.length} subj · {grp.totalDriveFiles} Drive files
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Selector within Active Class */}
        {activeClassGroup && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              2. Select Subject in {activeClassGroup.classKey}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {activeClassGroup.subjects.map((sub) => {
                const active = sub.subject === activeSubjectNode?.subject;
                return (
                  <button
                    key={sub.subject}
                    type="button"
                    onClick={() => setSelectedSubject(sub.subject)}
                    className={`rounded-lg border px-3 py-2 text-left ${
                      active
                        ? 'border-blue-900 bg-blue-50 text-blue-950'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold truncate">{sub.subject}</p>
                    <p className="font-mono text-[10px] text-slate-500 tabular-nums mt-0.5">
                      {sub.totalDriveFiles} files · {sub.registerRows.length} ch
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {feedback}
        </div>
      )}

      {/* Active Class × Subject Detail */}
      {activeSubjectNode && (
        <div className="space-y-5">
          {/* Summary Bar + 5-Category Filter */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-blue-900">
                  {activeSubjectNode.classKey} · {activeSubjectNode.subject}
                </p>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {activeSubjectNode.books[0] || `${activeSubjectNode.subject} Curriculum Pack`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeSubjectNode.packs.length} Google Drive pack(s) ·{' '}
                  {activeSubjectNode.totalDriveFiles} Drive files ·{' '}
                  {activeSubjectNode.registerRows.length} syllabus chapters ·{' '}
                  {activeSubjectNode.schoolResources.length} school bank entries
                </p>
              </div>
              <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
                {(['All', ...RESOURCE_CATEGORIES_ORDER] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
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
          </div>

          {/* 1. Google Drive Resource Packs */}
          {activeSubjectNode.packs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600 px-1">
                Google Drive Resource Packs ({activeSubjectNode.packs.length})
              </h4>
              {activeSubjectNode.packs.map((pack) => {
                const cats =
                  selectedCategory === 'All' ? RESOURCE_CATEGORIES_ORDER : [selectedCategory];
                return (
                  <div
                    key={pack.id}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                  >
                    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-blue-900">
                          {pack.className} · {pack.subject}
                        </p>
                        <p className="text-sm font-bold text-slate-900">{pack.chapterTitle}</p>
                      </div>
                      {pack.folderHref && (
                        <a
                          href={pack.folderHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap"
                        >
                          Open Drive Folder ({pack.totalFiles} files)
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="divide-y divide-slate-100">
                      {cats.map((cat) => {
                        const files = pack.filesByCategory[cat] || [];
                        if (files.length === 0) return null;
                        return (
                          <div key={cat} className="px-5 py-3 space-y-2">
                            <p className="text-xs font-semibold text-slate-700">
                              {cat} ({files.length})
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {files.map((file) => (
                                <div
                                  key={file.id}
                                  className="rounded-lg border border-slate-200 px-3 py-2 flex items-center justify-between gap-2 text-xs"
                                >
                                  <div className="min-w-0">
                                    <p className="font-medium text-slate-900 truncate">
                                      {file.title}
                                    </p>
                                    <p className="font-mono text-[11px] text-slate-400 uppercase">
                                      {file.extension}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {file.extractedPreview && (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewItem({ file, pack })}
                                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-900 hover:bg-blue-100 whitespace-nowrap"
                                      >
                                        <FileText className="h-3 w-3" />
                                        Preview
                                      </button>
                                    )}
                                    <a
                                      href={file.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                                    >
                                      Drive
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. School Repository Items for this Class × Subject */}
          {activeSubjectNode.schoolResources.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  School Resource Repository ({activeSubjectNode.schoolResources.length})
                </h4>
              </div>
              <div className="divide-y divide-slate-100">
                {activeSubjectNode.schoolResources
                  .filter(
                    (res) => selectedCategory === 'All' || res.category === selectedCategory,
                  )
                  .map((res) => (
                    <div
                      key={res.id}
                      className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-slate-500">
                          <span className="font-semibold text-amber-700">{res.category}</span> ·{' '}
                          {res.chapter} · Class {res.classSection} · {res.board}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">{res.title}</p>
                        <p className="text-slate-600">{res.contentSummary}</p>
                        {res.pushedToStudents && (
                          <p className="text-[11px] font-semibold text-emerald-700">
                            Pushed to Class {res.classSection} students by {res.pushedBy || res.createdBy}
                            {res.pushedAt ? ` (${res.pushedAt})` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span
                          className={`font-semibold ${
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
                            disabled={busyId === res.id}
                            data-testid={`push-resource-btn-${res.id}`}
                            onClick={() => void handleTogglePushResource(res)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                              res.pushedToStudents
                                ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                : 'bg-[#142B46] text-white hover:bg-[#1e3d63]'
                            }`}
                          >
                            {busyId === res.id
                              ? 'Updating...'
                              : res.pushedToStudents
                                ? 'Recall from Class'
                                : `Push to Class ${res.classSection}`}
                          </button>
                        )}
                        {canApprove && res.status !== 'Approved' && (
                          <button
                            type="button"
                            disabled={busyId === res.id}
                            onClick={() => void handleApproveSchoolResource(res.id)}
                            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 whitespace-nowrap"
                          >
                            {busyId === res.id ? 'Saving...' : 'Approve'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 3. Chapter Syllabus Index (Production Register) */}
          {activeSubjectNode.registerRows.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-blue-900" />
                  Chapter-Wise Syllabus & Production Register ({activeSubjectNode.registerRows.length} Chapters)
                </h4>
                <span className="text-[11px] text-slate-500">
                  AI QA != Teacher Approval
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {activeSubjectNode.registerRows.map((row) => {
                  const state = resolveRegisterApprovalState(row, registerApprovals);
                  const approvalRec = registerApprovals[row.rowId];
                  return (
                    <div
                      key={row.rowId}
                      className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/70"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-slate-900">
                          {row.chapterNum ? `Ch. ${row.chapterNum}: ` : ''}
                          {row.chapterTitle}
                        </p>
                        <p className="text-slate-500">
                          {row.book || row.subject} · AI QA: {row.aiQaStatus || 'Not produced'}
                          {row.deliverablesCompleted
                            ? ` · Deliverables: ${row.deliverablesCompleted}`
                            : ''}
                        </p>
                        {approvalRec && (
                          <p className="text-emerald-700 font-medium">
                            Confirmed by {approvalRec.approvedBy} ({approvalRec.approvedAt.slice(0, 10)})
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-semibold ${
                            state === 'Teacher Approved'
                              ? 'text-emerald-700'
                              : state === 'Not Produced'
                                ? 'text-slate-400'
                                : 'text-amber-700'
                          }`}
                        >
                          {state}
                        </span>
                        {canEdit &&
                          state !== 'Teacher Approved' &&
                          state !== 'Not Produced' && (
                            <button
                              type="button"
                              disabled={busyId === row.rowId}
                              onClick={() => void handleConfirmRegisterApproval(row)}
                              className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 whitespace-nowrap"
                            >
                              {busyId === row.rowId ? 'Saving...' : 'Confirm Teacher Approval'}
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Dialog */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hub-preview-title"
        >
          <div className="w-full max-w-3xl max-h-[88vh] flex flex-col rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold text-blue-900">
                  {previewItem.pack.className} · {previewItem.pack.subject} · {previewItem.file.category}
                </p>
                <h3 id="hub-preview-title" className="font-display text-base font-bold text-slate-900 mt-0.5">
                  {previewItem.file.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewItem.file.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
                >
                  Open in Google Drive
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  aria-label="Close preview"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-4">
                {previewItem.file.extractedPreview}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
