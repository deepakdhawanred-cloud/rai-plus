import React, { useMemo, useState } from 'react';
import { CheckCircle2, Download, ExternalLink, FileText, FolderOpen, X } from 'lucide-react';
import type {
  ProductionRegisterRow,
  RegisterApprovalRecord,
  ResourceCategory,
  ViratDriveFileItem,
  ViratResourcePack,
} from '../types';
import { apiRequest } from '../utils/api';
import { triggerCsvDownload } from '../utils/csvExport';
import {
  computeRegisterStats,
  filterDriveResourcePacks,
  filterRegisterRows,
  resolveRegisterApprovalState,
} from '../utils/viratCurriculumEngine';

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'Presentations',
  'Teacher Guides',
  'Worksheets',
  'Answer Keys',
  'Assessments and Rubrics',
];

interface ViratDriveRepositoryViewProps {
  packs: ViratResourcePack[];
}

export const ViratDriveRepositoryView: React.FC<ViratDriveRepositoryViewProps> = ({ packs }) => {
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ResourceCategory>('All');
  const [query, setQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<{
    file: ViratDriveFileItem;
    pack: ViratResourcePack;
  } | null>(null);

  const totalFilesCount = useMemo(
    () => packs.reduce((sum, p) => sum + p.totalFiles, 0),
    [packs],
  );

  const classes = useMemo(
    () => ['All', ...Array.from(new Set(packs.map((p) => p.className)))],
    [packs],
  );

  const subjects = useMemo(
    () => ['All', ...Array.from(new Set(packs.map((p) => p.subject))).sort()],
    [packs],
  );

  const filteredPacks = useMemo(
    () =>
      filterDriveResourcePacks(packs, {
        className: selectedClass,
        subject: selectedSubject,
        category: selectedCategory,
        query,
      }),
    [packs, selectedClass, selectedSubject, selectedCategory, query],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Rai Plus Academic Resources — 5-Category Curriculum Repository
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {packs.length} produced chapter & HBSE board-revision packs containing{' '}
              <strong className="font-mono text-slate-900">{totalFilesCount}</strong> slides, teacher guides, worksheets, answer keys, and rubrics linked directly to Google Drive.
            </p>
          </div>
          <a
            href="https://drive.google.com/drive/folders/1c0E9-mwQ0XofVDmdw3YNHirXelUrc7ml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 self-start"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Open Master Drive Folder
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="search"
            aria-label="Search curriculum chapters and files"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapter, board cycle, or filename..."
            className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-900 focus:outline-none"
          />
          <select
            aria-label="Filter repository by class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Classes' : c}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter repository by subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Subjects' : s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {(['All', ...RESOURCE_CATEGORIES] as const).map((cat) => (
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

      <div className="space-y-4">
        {filteredPacks.map((pack) => {
          const catsToShow =
            selectedCategory === 'All' ? RESOURCE_CATEGORIES : [selectedCategory];
          return (
            <div
              key={pack.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-blue-900">
                    {pack.className} · {pack.subject}
                  </p>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    {pack.chapterTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  <span className="font-mono text-slate-600 tabular-nums">
                    {pack.totalFiles} files
                  </span>
                  {pack.folderHref && (
                    <a
                      href={pack.folderHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-900 hover:underline whitespace-nowrap"
                    >
                      Open Pack Folder
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {catsToShow.map((cat) => {
                  const files = pack.filesByCategory[cat] || [];
                  if (files.length === 0) return null;
                  return (
                    <div key={cat} className="px-6 py-3 space-y-2">
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
                              <p className="font-medium text-slate-900 truncate">{file.title}</p>
                              <p className="font-mono text-[11px] text-slate-400 uppercase">
                                {file.extension}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {file.extractedPreview && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewItem({ file, pack })}
                                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-900 hover:bg-blue-100 whitespace-nowrap"
                                >
                                  <FileText className="h-3 w-3" />
                                  Preview Content
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
        {filteredPacks.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            No chapter packs match the active filter.
          </div>
        )}
      </div>

      {/* Resource Content Preview Dialog */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resource-preview-title"
        >
          <div className="w-full max-w-3xl max-h-[88vh] flex flex-col rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold text-blue-900">
                  {previewItem.pack.className} · {previewItem.pack.subject} · {previewItem.file.category}
                </p>
                <h3 id="resource-preview-title" className="font-display text-base font-bold text-slate-900 mt-0.5">
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
                  aria-label="Close resource preview"
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

interface ProductionRegisterViewProps {
  rows: ProductionRegisterRow[];
  approvals: Record<string, RegisterApprovalRecord>;
  canConfirmApproval: boolean;
  token: string;
  onRefresh: () => Promise<void>;
}

export const ProductionRegisterView: React.FC<ProductionRegisterViewProps> = ({
  rows,
  approvals,
  canConfirmApproval,
  token,
  onRefresh,
}) => {
  const [statusFilter, setStatusFilter] = useState<
    'active' | 'qa_passed' | 'teacher_approved' | 'all' | 'not_produced'
  >('active');
  const [selectedClass, setSelectedClass] = useState('All');
  const [query, setQuery] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const stats = useMemo(() => computeRegisterStats(rows, approvals), [rows, approvals]);

  const classes = useMemo(
    () => ['All', ...Array.from(new Set(rows.map((r) => r.classLabel)))],
    [rows],
  );

  const filtered = useMemo(
    () =>
      filterRegisterRows(rows, approvals, {
        classLabel: selectedClass,
        statusFilter,
        query,
      }),
    [rows, approvals, selectedClass, statusFilter, query],
  );

  async function handleConfirmApproval(row: ProductionRegisterRow) {
    setApprovingId(row.rowId);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/production-register/${encodeURIComponent(row.rowId)}/approve`,
        { method: 'POST', body: JSON.stringify({}) },
        token,
      );
      await onRefresh();
      setFeedback(
        `Teacher Approval recorded for Class ${row.classLabel} ${row.subject} — ${row.chapterTitle}.`,
      );
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Syllabus Chapters</p>
          <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {stats.totalChapters}
          </p>
          <p className="text-[11px] text-slate-500">Classes 6–12</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Active Produced Packs</p>
          <p className="font-mono text-2xl font-bold text-blue-900 tabular-nums mt-1">
            {stats.producedOrActive}
          </p>
          <p className="text-[11px] text-slate-500">Chapters & revision cycles</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">AI QA Passed</p>
          <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {stats.aiQaPassedCount}
          </p>
          <p className="text-[11px] text-slate-500">Independent recheck</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Awaiting Teacher Approval</p>
          <p className="font-mono text-2xl font-bold text-amber-700 tabular-nums mt-1">
            {stats.awaitingTeacherApprovalCount}
          </p>
          <p className="text-[11px] text-slate-500">AI QA != Approval</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Teacher Approved</p>
          <p
            className="font-mono text-2xl font-bold text-emerald-700 tabular-nums mt-1"
            data-testid="teacher-approved-count"
          >
            {stats.teacherApprovedCount}
          </p>
          <p className="text-[11px] text-slate-500">Classroom ready</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Curriculum Production Register & Teacher Approval Gate
            </h2>
            <p className="text-xs text-slate-600">
              AI QA is not Teacher Approval; approval is recorded only when a teacher confirms classroom readiness.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              triggerCsvDownload(
                'vis-curriculum-production-register.csv',
                ['Class', 'Subject', 'Book', 'Chapter', 'Deliverables', 'AI QA', 'Governance State'],
                filtered.map((row) => [
                  row.classLabel,
                  row.subject,
                  row.book,
                  row.chapterNum ? `Ch. ${row.chapterNum}: ${row.chapterTitle}` : row.chapterTitle,
                  row.deliverablesCompleted,
                  row.aiQaStatus || 'Not produced',
                  resolveRegisterApprovalState(row, approvals),
                ]),
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            Export Register CSV
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="search"
            aria-label="Search production register"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subject, book, or chapter..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-900 focus:outline-none"
          />
          <select
            aria-label="Filter register by class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Classes' : `Class ${c}`}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter register by approval status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
          >
            <option value="active">Active & Produced Packs ({stats.producedOrActive})</option>
            <option value="qa_passed">AI QA Passed ({stats.aiQaPassedCount})</option>
            <option value="teacher_approved">Teacher Approved ({stats.teacherApprovedCount})</option>
            <option value="all">All Syllabus Chapters ({stats.totalChapters})</option>
            <option value="not_produced">Not Yet Produced</option>
          </select>
        </div>

        {feedback && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {feedback}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.slice(0, 100).map((row) => {
            const state = resolveRegisterApprovalState(row, approvals);
            const approvalRec = approvals[row.rowId];
            return (
              <div
                key={row.rowId}
                className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-blue-900">Class {row.classLabel}</span> ·{' '}
                    {row.subject} · {row.book || 'Curriculum Syllabus'}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {row.chapterNum ? `Ch. ${row.chapterNum}: ` : ''}
                    {row.chapterTitle}
                  </p>
                  {row.deliverablesCompleted && (
                    <p className="font-mono text-xs text-slate-700">
                      Deliverables: {row.deliverablesCompleted}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    AI QA: {row.aiQaStatus || 'Not produced'}
                    {row.notes ? ` · ${row.notes}` : ''}
                  </p>
                  {approvalRec && (
                    <p className="text-xs font-medium text-emerald-700">
                      Confirmed by {approvalRec.approvedBy} on {approvalRec.approvedAt.slice(0, 10)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-semibold ${
                      state === 'Teacher Approved'
                        ? 'text-emerald-700'
                        : state === 'Not Produced'
                          ? 'text-slate-400'
                          : 'text-amber-700'
                    }`}
                  >
                    {state}
                  </span>
                  {canConfirmApproval &&
                    state !== 'Teacher Approved' &&
                    state !== 'Not Produced' && (
                      <button
                        type="button"
                        disabled={approvingId === row.rowId}
                        onClick={() => void handleConfirmApproval(row)}
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 whitespace-nowrap"
                      >
                        {approvingId === row.rowId ? 'Saving...' : 'Confirm Teacher Approval'}
                      </button>
                    )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-6 py-8 text-center text-xs text-slate-500">
              No curriculum chapters match the active filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
