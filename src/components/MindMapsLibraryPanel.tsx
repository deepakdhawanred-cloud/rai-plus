import React, { useMemo, useState } from 'react';
import {
  BookMarked,
  Bookmark,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  GitBranch,
  History,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import type {
  MindMapApprovalStatus,
  MindMapResourceItem,
  MindMapResourceType,
  MindMapStructure,
  UserAccount,
} from '../types';
import {
  MIND_MAP_RESOURCE_TYPE_META,
  SUPPORTED_MINDMAP_EXTENSIONS,
  filterMindMapLibrary,
} from '../utils/mindMapResourceEngine';

interface Props {
  resources: MindMapResourceItem[];
  user: UserAccount;
  token: string;
  availableClasses: string[];
  onRefresh: () => Promise<void>;
}

const STATUS_BADGE: Record<MindMapApprovalStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-700' },
  pending_review: { label: 'Pending Review', cls: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Approved & Published', cls: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Revision Requested', cls: 'bg-rose-100 text-rose-800' },
};

const BRANCH_COLORS = [
  'border-indigo-200 bg-indigo-50/70 text-indigo-950',
  'border-emerald-200 bg-emerald-50/70 text-emerald-950',
  'border-amber-200 bg-amber-50/70 text-amber-950',
  'border-sky-200 bg-sky-50/70 text-sky-950',
];

export const MindMapsLibraryPanel: React.FC<Props> = ({
  resources,
  user,
  token,
  availableClasses,
  onRefresh,
}) => {
  const isStudentOrParent = user.role === 'student' || user.role === 'parent';
  const canAuthor = [
    'super_admin',
    'school_admin',
    'principal',
    'coordinator',
    'teacher',
  ].includes(user.role);
  const canApprove = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    user.role,
  );

  // Filters
  const [sessionFilter, setSessionFilter] = useState<string>('All');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [chapterFilter, setChapterFilter] = useState<string>('All');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [teacherFilter, setTeacherFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | MindMapApprovalStatus>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false);

  // Selected item for interactive viewing / version history
  const [activeItem, setActiveItem] = useState<MindMapResourceItem | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState<boolean>(false);

  // Upload & AI-Assisted Creator Modal State
  const [showCreator, setShowCreator] = useState<boolean>(false);
  const [creatorSession, setCreatorSession] = useState<string>('2026-27');
  const [creatorClass, setCreatorClass] = useState<string>(availableClasses[0] || '10-A');
  const [creatorSubject, setCreatorSubject] = useState<string>('Science');
  const [creatorChapter, setCreatorChapter] = useState<string>('');
  const [creatorTopic, setCreatorTopic] = useState<string>('');
  const [creatorLanguage, setCreatorLanguage] = useState<'English' | 'Hindi' | 'Bilingual'>(
    'English',
  );
  const [creatorType, setCreatorType] = useState<MindMapResourceType>('mind_map');
  const [creatorTitle, setCreatorTitle] = useState<string>('');
  const [creatorDescription, setCreatorDescription] = useState<string>('');
  const [creatorKeywords, setCreatorKeywords] = useState<string>('');
  const [creatorObjectives, setCreatorObjectives] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState<string>('');
  const [aiSourceText, setAiSourceText] = useState<string>('');
  const [aiAssisted, setAiAssisted] = useState<boolean>(false);
  const [aiReviewedByTeacher, setAiReviewedByTeacher] = useState<boolean>(false);
  const [draftStructure, setDraftStructure] = useState<MindMapStructure | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<string>('');
  const [decisionBusy, setDecisionBusy] = useState<boolean>(false);

  // Dynamic filter dropdown values
  const filterOptions = useMemo(() => {
    const sessions = new Set<string>(['2026-27']);
    const classes = new Set<string>(availableClasses);
    const subjects = new Set<string>();
    const chapters = new Set<string>();
    const teachers = new Set<string>();
    for (const r of resources) {
      sessions.add(r.academicSession);
      classes.add(r.classSection);
      subjects.add(r.subject);
      chapters.add(r.chapter);
      teachers.add(r.teacherName);
    }
    return {
      sessions: Array.from(sessions),
      classes: Array.from(classes).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
      subjects: Array.from(subjects).sort(),
      chapters: Array.from(chapters).sort(),
      teachers: Array.from(teachers).sort(),
    };
  }, [resources, availableClasses]);

  const filteredItems = useMemo(() => {
    return filterMindMapLibrary({
      items: resources,
      role: user.role,
      userId: user.id,
      academicSession: sessionFilter,
      classSection: classFilter,
      subject: subjectFilter,
      chapter: chapterFilter,
      language: languageFilter,
      teacherName: teacherFilter,
      resourceType: typeFilter,
      statusFilter,
      searchQuery,
      bookmarkedOnly,
    });
  }, [
    resources,
    user.role,
    user.id,
    sessionFilter,
    classFilter,
    subjectFilter,
    chapterFilter,
    languageFilter,
    teacherFilter,
    typeFilter,
    statusFilter,
    searchQuery,
    bookmarkedOnly,
  ]);

  const pendingCount = useMemo(
    () => resources.filter((r) => r.status === 'pending_review').length,
    [resources],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    if (file.size <= 1.5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUploadedFileDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedFileDataUrl('');
    }
  };

  const handleGenerateAiDraft = async () => {
    if (!creatorSubject.trim() || !creatorChapter.trim()) {
      setFeedback('Enter Subject and Chapter before generating an AI-assisted Mind Map draft.');
      return;
    }
    setAiLoading(true);
    setFeedback(null);
    try {
      const res = await apiRequest<{
        draft: {
          suggestedTitle: string;
          suggestedKeywords: string[];
          suggestedObjectives: string[];
          structure: MindMapStructure;
        };
        notice: string;
      }>(
        '/api/mindmaps/ai-suggest',
        {
          method: 'POST',
          body: JSON.stringify({
            subject: creatorSubject,
            classSection: creatorClass,
            chapter: creatorChapter,
            topic: creatorTopic,
            sourceMaterialText: aiSourceText,
            fileName: uploadedFileName || undefined,
          }),
        },
        token,
      );
      setDraftStructure(res.draft.structure);
      if (!creatorTitle.trim()) setCreatorTitle(res.draft.suggestedTitle);
      if (!creatorKeywords.trim()) setCreatorKeywords(res.draft.suggestedKeywords.join(', '));
      if (!creatorObjectives.trim()) {
        setCreatorObjectives(res.draft.suggestedObjectives.join('\n'));
      }
      if (!creatorDescription.trim()) {
        setCreatorDescription(
          `Visual concept map and revision flow for ${creatorChapter} (${creatorSubject}, Class ${creatorClass}).`,
        );
      }
      setAiAssisted(true);
      setAiReviewedByTeacher(false);
      setFeedback(res.notice);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to generate AI draft.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveResource = async (submitForReview: boolean) => {
    if (!creatorTitle.trim() || !creatorSubject.trim() || !creatorChapter.trim()) {
      setFeedback('Title, Subject, and Chapter are required.');
      return;
    }
    if (aiAssisted && submitForReview && !aiReviewedByTeacher) {
      setFeedback(
        'Please confirm that you have reviewed and verified the AI-assisted mind map draft before submitting for approval.',
      );
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/mindmaps',
        {
          method: 'POST',
          body: JSON.stringify({
            academicSession: creatorSession,
            classSection: creatorClass,
            subject: creatorSubject,
            chapter: creatorChapter,
            topic: creatorTopic || creatorChapter,
            language: creatorLanguage,
            resourceType: creatorType,
            title: creatorTitle,
            description: creatorDescription,
            fileName: uploadedFileName || undefined,
            fileDataUrl: uploadedFileDataUrl || undefined,
            keywords: creatorKeywords
              .split(',')
              .map((k) => k.trim())
              .filter(Boolean),
            learningObjectives: creatorObjectives
              .split('\n')
              .map((o) => o.trim())
              .filter(Boolean),
            aiAssisted,
            aiDraftApprovedByTeacher: aiAssisted ? aiReviewedByTeacher : true,
            structure: draftStructure || undefined,
            submitForReview,
          }),
        },
        token,
      );
      setShowCreator(false);
      setCreatorTitle('');
      setCreatorChapter('');
      setCreatorTopic('');
      setCreatorDescription('');
      setCreatorKeywords('');
      setCreatorObjectives('');
      setUploadedFileName('');
      setUploadedFileDataUrl('');
      setAiSourceText('');
      setDraftStructure(null);
      setAiAssisted(false);
      setAiReviewedByTeacher(false);
      await onRefresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to save Mind Map resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (item: MindMapResourceItem, decision: 'approved' | 'rejected') => {
    setDecisionBusy(true);
    try {
      await apiRequest(
        `/api/mindmaps/${item.id}/decision`,
        {
          method: 'POST',
          body: JSON.stringify({
            decision,
            reviewNote:
              reviewNote.trim() ||
              (decision === 'approved'
                ? 'Verified chapter accuracy and visual clarity.'
                : 'Please refine subtopic labels and resubmit.'),
          }),
        },
        token,
      );
      setReviewNote('');
      setActiveItem(null);
      await onRefresh();
    } finally {
      setDecisionBusy(false);
    }
  };

  const handleToggleBookmark = async (itemId: string) => {
    await apiRequest(`/api/mindmaps/${itemId}/bookmark`, { method: 'POST' }, token);
    await onRefresh();
  };

  const handleDownloadResource = (item: MindMapResourceItem) => {
    if (item.fileDataUrl) {
      const a = document.createElement('a');
      a.href = item.fileDataUrl;
      a.download = item.fileName || `${item.title.replace(/\s+/g, '_')}.png`;
      a.click();
      return;
    }
    const textLines = [
      `RAI PLUS — MIND MAP & CONCEPT SUMMARY`,
      `Title: ${item.title}`,
      `Class: ${item.classSection} | Subject: ${item.subject} | Chapter: ${item.chapter}`,
      `Teacher: ${item.teacherName} | Language: ${item.language} | Version: v${item.version}`,
      ``,
      `Description: ${item.description}`,
      ...(item.structure
        ? [
            ``,
            `CENTRAL CONCEPT: ${item.structure.centralConcept}`,
            ...item.structure.branches.flatMap((b) => [
              `\n[${b.title}] (${b.relationLabel}):`,
              ...b.subtopics.map((s) => `  - ${s}`),
            ]),
            `\nKEY DEFINITIONS:`,
            ...item.structure.definitions.map((d) => `  • ${d.term}: ${d.meaning}`),
            `\nFLOWCHART / PROCESS STEPS:`,
            ...item.structure.flowchartSteps.map((st, i) => `  ${i + 1}. ${st}`),
            `\nREVISION SUMMARY:`,
            ...item.structure.revisionSummary.map((r) => `  * ${r}`),
          ]
        : []),
    ];
    const blob = new Blob([textLines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]+/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <GitBranch className="h-4 w-4" />
              Academic Resources → Mind Maps Library
            </div>
            <h3 className="mt-1 text-xl font-bold text-slate-900">
              Visual Mind Maps, Concept Diagrams & Chapter Revision Maps
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {isStudentOrParent
                ? 'Explore teacher-approved visual mind maps, definitions, and flowcharts for faster chapter understanding and revision.'
                : 'Upload visual mind maps or draft structured chapter concept maps with AI assistance. All AI drafts require human teacher review and approval before students see them.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canApprove && pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('pending_review')}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
              >
                <Clock className="h-4 w-4" />
                {pendingCount} Pending Approval
              </button>
            )}
            {canAuthor && (
              <button
                type="button"
                onClick={() => {
                  setFeedback(null);
                  setShowCreator(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Upload / Create Mind Map
              </button>
            )}
          </div>
        </div>

        {/* Multi-Dimensional Filter Bar */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <div className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic, chapter, keyword..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800"
            />
          </div>
          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800"
          >
            <option value="All">All Sessions</option>
            {filterOptions.sessions.map((s) => (
              <option key={s} value={s}>
                Session {s}
              </option>
            ))}
          </select>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800"
          >
            <option value="All">All Classes</option>
            {filterOptions.classes.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800"
          >
            <option value="All">All Subjects</option>
            {filterOptions.subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800"
          >
            <option value="All">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Bilingual">Bilingual</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800"
          >
            <option value="All">All Resource Types</option>
            {Object.entries(MIND_MAP_RESOURCE_TYPE_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setBookmarkedOnly((b) => !b)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              bookmarkedOnly
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Bookmarks
          </button>
        </div>

        {/* Secondary filter row for Chapter, Teacher, Status */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="All">All Chapters</option>
            {filterOptions.chapters.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="All">All Teachers</option>
            {filterOptions.teachers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {!isStudentOrParent && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | MindMapApprovalStatus)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              <option value="All">All Review Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending_review">Pending Review</option>
              <option value="draft">Drafts</option>
              <option value="rejected">Revision Requested</option>
            </select>
          )}
        </div>
      </div>

      {/* Mind Map Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No mind maps match your current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const bookmarked = item.bookmarkedByUserIds.includes(user.id);
            const badge = STATUS_BADGE[item.status];
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                        Class {item.classSection} · {item.subject}
                      </span>
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {MIND_MAP_RESOURCE_TYPE_META[item.resourceType]?.shortLabel || 'Mind Map'}
                      </span>
                      {item.aiAssisted && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          <Sparkles className="h-3 w-3" />
                          AI-Assisted
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(item.id)}
                      title={bookmarked ? 'Remove bookmark' : 'Bookmark for revision'}
                      className={`rounded-lg p-1.5 transition ${
                        bookmarked
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      <BookMarked className="h-4 w-4" />
                    </button>
                  </div>

                  <h4 className="mt-3 text-base font-bold text-slate-900">{item.title}</h4>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    {item.chapter} · {item.topic}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {item.description}
                  </p>

                  {item.structure && (
                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs">
                      <div className="font-bold text-slate-800">
                        Core Concept: {item.structure.centralConcept}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.structure.branches.slice(0, 3).map((b) => (
                          <span
                            key={b.id}
                            className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-xs"
                          >
                            {b.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>By {item.teacherName}</span>
                    <span>·</span>
                    <span>{item.language}</span>
                    <span>·</span>
                    <span>{item.fileFormat}</span>
                    <span>·</span>
                    <span>v{item.version}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveItem(item);
                        setShowVersionHistory(false);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Explore
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadResource(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      title="Download Mind Map"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INTERACTIVE MIND MAP EXPLORER + APPROVAL MODAL */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
                    Class {activeItem.classSection} · {activeItem.subject}
                  </span>
                  <span
                    className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${STATUS_BADGE[activeItem.status].cls}`}
                  >
                    {STATUS_BADGE[activeItem.status].label}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    v{activeItem.version} · {activeItem.language}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{activeItem.title}</h3>
                <p className="text-xs text-slate-500">
                  {activeItem.chapter} · {activeItem.topic} · Created by {activeItem.teacherName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowVersionHistory((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <History className="h-3.5 w-3.5" />
                  History ({activeItem.versionHistory.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadResource(activeItem)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showVersionHistory && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Version & Review History
                </h4>
                <div className="mt-2 space-y-2">
                  {activeItem.versionHistory.map((vh, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">v{vh.version}</span> ·{' '}
                        <span className="font-semibold text-indigo-700">{vh.status}</span> —{' '}
                        {vh.changeNote}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {vh.updatedBy} · {new Date(vh.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-5">
              <p className="text-sm text-slate-700">{activeItem.description}</p>

              {activeItem.fileDataUrl && activeItem.fileDataUrl.startsWith('data:image/') && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={activeItem.fileDataUrl}
                    alt={activeItem.title}
                    className="mx-auto max-h-80 rounded-lg object-contain"
                  />
                </div>
              )}

              {activeItem.structure && (
                <div className="space-y-5">
                  {/* Visual Central Node + Branches */}
                  <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white p-5">
                    <div className="mx-auto max-w-md rounded-2xl bg-indigo-600 px-5 py-3 text-center text-base font-bold text-white shadow-md">
                      {activeItem.structure.centralConcept}
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {activeItem.structure.branches.map((branch, idx) => (
                        <div
                          key={branch.id}
                          className={`rounded-xl border p-4 ${BRANCH_COLORS[idx % BRANCH_COLORS.length]}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-sm font-bold">{branch.title}</h5>
                            <span className="rounded bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                              {branch.relationLabel}
                            </span>
                          </div>
                          <ul className="mt-2.5 space-y-1.5 text-xs">
                            {branch.subtopics.map((sub, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                                <span>{sub}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Definitions + Flowchart + Revision Summary */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Key Definitions
                      </h5>
                      <div className="mt-2.5 space-y-2">
                        {activeItem.structure.definitions.map((d, i) => (
                          <div key={i} className="rounded-lg bg-slate-50 p-2.5 text-xs">
                            <div className="font-bold text-slate-900">{d.term}</div>
                            <div className="mt-0.5 text-slate-600">{d.meaning}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Step-by-Step Process Flowchart
                      </h5>
                      <ol className="mt-2.5 space-y-2 text-xs text-slate-700">
                        {activeItem.structure.flowchartSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2.5 rounded-lg bg-emerald-50/60 p-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {activeItem.structure.revisionSummary.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        Quick Revision Summary
                      </h5>
                      <ul className="mt-2 space-y-1 text-xs text-amber-950">
                        {activeItem.structure.revisionSummary.map((line, i) => (
                          <li key={i}>• {line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Approver Review Panel */}
              {canApprove && activeItem.status !== 'approved' && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
                  <h5 className="flex items-center gap-2 text-sm font-bold text-indigo-950">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    Coordinator / Principal Quality Review
                  </h5>
                  <input
                    type="text"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Optional academic review comment..."
                    className="mt-2.5 w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs text-slate-800"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={decisionBusy}
                      onClick={() => handleDecision(activeItem, 'approved')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Publish to Students
                    </button>
                    <button
                      type="button"
                      disabled={decisionBusy}
                      onClick={() => handleDecision(activeItem, 'rejected')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      Request Revision
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TEACHER UPLOAD & AI-ASSISTED MIND MAP CREATOR MODAL */}
      {showCreator && canAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Upload Educational Resource or Draft AI-Assisted Mind Map
                </h3>
                <p className="text-xs text-slate-500">
                  Supported formats: {SUPPORTED_MINDMAP_EXTENSIONS.join(', ')} · Human review is
                  always enforced before publishing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreator(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    value={creatorSession}
                    onChange={(e) => setCreatorSession(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Class & Section
                  </label>
                  <select
                    value={creatorClass}
                    onChange={(e) => setCreatorClass(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    {filterOptions.classes.map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={creatorSubject}
                    onChange={(e) => setCreatorSubject(e.target.value)}
                    placeholder="e.g., Science, Mathematics"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Chapter Name *
                  </label>
                  <input
                    type="text"
                    value={creatorChapter}
                    onChange={(e) => setCreatorChapter(e.target.value)}
                    placeholder="e.g., Chapter 6: Life Processes"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Topic / Subtopic
                  </label>
                  <input
                    type="text"
                    value={creatorTopic}
                    onChange={(e) => setCreatorTopic(e.target.value)}
                    placeholder="e.g., Photosynthesis & Nutrition"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Language
                    </label>
                    <select
                      value={creatorLanguage}
                      onChange={(e) =>
                        setCreatorLanguage(e.target.value as 'English' | 'Hindi' | 'Bilingual')
                      }
                      className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Bilingual">Bilingual</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Type
                    </label>
                    <select
                      value={creatorType}
                      onChange={(e) => setCreatorType(e.target.value as MindMapResourceType)}
                      className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm"
                    >
                      {Object.entries(MIND_MAP_RESOURCE_TYPE_META).map(([k, m]) => (
                        <option key={k} value={k}>
                          {m.shortLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Upload Existing Mind Map / Diagram / Notes (Optional)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Accepts PDF, PNG, JPG, JPEG, PPT/PPTX, DOC/DOCX
                      </div>
                    </div>
                  </div>
                  <label className="cursor-pointer rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-xs ring-1 ring-slate-200 hover:bg-indigo-50">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.ppt,.pptx,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadedFileName && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <FileText className="h-4 w-4" />
                    Attached: {uploadedFileName}
                  </div>
                )}
              </div>

              {/* AI-Assisted Mind Map Draft Builder */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    AI-Assisted Mind Map Structure Builder (Draft Only — Teacher Editable)
                  </div>
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleGenerateAiDraft}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-60"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {aiLoading ? 'Drafting Structure...' : 'Generate Editable Mind Map Draft'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={aiSourceText}
                  onChange={(e) => setAiSourceText(e.target.value)}
                  placeholder="Paste chapter notes, bullet points, or textbook summary here to generate editable concepts, branches, definitions, and flowchart steps..."
                  className="mt-2.5 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs text-slate-800"
                />

                {draftStructure && (
                  <div className="mt-3 space-y-3 rounded-xl border border-purple-200 bg-white p-3.5">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-600">
                        Central Concept (Editable)
                      </label>
                      <input
                        type="text"
                        value={draftStructure.centralConcept}
                        onChange={(e) =>
                          setDraftStructure({ ...draftStructure, centralConcept: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                      {draftStructure.branches.map((br, idx) => (
                        <div key={br.id} className="rounded-lg border border-slate-200 p-2.5">
                          <input
                            type="text"
                            value={br.title}
                            onChange={(e) => {
                              const next = [...draftStructure.branches];
                              next[idx] = { ...br, title: e.target.value };
                              setDraftStructure({ ...draftStructure, branches: next });
                            }}
                            className="w-full rounded border border-slate-200 px-2 py-1 text-xs font-bold"
                          />
                          <textarea
                            rows={2}
                            value={br.subtopics.join('\n')}
                            onChange={(e) => {
                              const next = [...draftStructure.branches];
                              next[idx] = {
                                ...br,
                                subtopics: e.target.value
                                  .split('\n')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              };
                              setDraftStructure({ ...draftStructure, branches: next });
                            }}
                            className="mt-1.5 w-full rounded border border-slate-200 px-2 py-1 text-[11px]"
                          />
                        </div>
                      ))}
                    </div>

                    <label className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                      <input
                        type="checkbox"
                        checked={aiReviewedByTeacher}
                        onChange={(e) => setAiReviewedByTeacher(e.target.checked)}
                        className="h-4 w-4 rounded border-amber-400 text-indigo-600"
                      />
                      I have reviewed, edited, and verified this AI-assisted draft for syllabus
                      accuracy (required before submission).
                    </label>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    value={creatorTitle}
                    onChange={(e) => setCreatorTitle(e.target.value)}
                    placeholder="e.g., Life Processes — Visual Concept Map"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={creatorKeywords}
                    onChange={(e) => setCreatorKeywords(e.target.value)}
                    placeholder="Photosynthesis, Respiration, NCERT"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={creatorDescription}
                    onChange={(e) => setCreatorDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Learning Objectives (one per line)
                  </label>
                  <textarea
                    rows={2}
                    value={creatorObjectives}
                    onChange={(e) => setCreatorObjectives(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {feedback && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-semibold text-sky-900">
                  {feedback}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveResource(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveResource(true)}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit for Coordinator / Principal Approval'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
