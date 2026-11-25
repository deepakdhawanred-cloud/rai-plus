import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  GitBranch,
  Headphones,
  Layers,
  Lightbulb,
  Network,
  Printer,
  RotateCcw,
  Search,
  Star,
  Zap,
} from 'lucide-react';
import type {
  AcademicResource,
  ProductionRegisterRow,
  SchoolClassNumber,
  ViratResourcePack,
} from '../types';
import {
  ALL_CLASS_NUMBERS,
  STUDY_FORMAT_OPTIONS,
  computeFlashcardMasteryPercent,
  extractClassNumFromLabel,
  generateChapterVisualStudyPack,
  getChaptersForClassSubject,
  getSubjectsForClass,
  type MindmapBranch,
  type StudyResourceFormat,
} from '../utils/chapterVisualStudyEngine';

interface ChapterVisualRevisionStudioProps {
  board: string;
  userId: string;
  userRole: string;
  defaultClassLabel?: string | null;
  subjectSpecialty?: string | null;
  registerRows: ProductionRegisterRow[];
  schoolResources: AcademicResource[];
  drivePacks: ViratResourcePack[];
  onOpenSchoolHub?: (classKey: string, subjectKey: string) => void;
}

interface SavedNotebookLmNote {
  notebookUrl: string;
  customNotes: string;
  updatedAt: string;
}

const PREF_STORAGE_PREFIX = 'virat_study_pref_format_v1_';
const NOTES_STORAGE_PREFIX = 'virat_notebooklm_notes_v1_';
const MASTERY_STORAGE_PREFIX = 'virat_flashcard_mastery_v1_';

const BRANCH_SVG_PALETTE: Record<
  MindmapBranch['colorKey'],
  { fill: string; stroke: string; text: string; subFill: string }
> = {
  blue: { fill: '#EFF6FF', stroke: '#2563EB', text: '#1E3A8A', subFill: '#F8FAFC' },
  emerald: { fill: '#ECFDF5', stroke: '#059669', text: '#064E3B', subFill: '#F8FAFC' },
  amber: { fill: '#FFFBEB', stroke: '#D97706', text: '#78350F', subFill: '#F8FAFC' },
  violet: { fill: '#F5F3FF', stroke: '#7C3AED', text: '#4C1D95', subFill: '#F8FAFC' },
  rose: { fill: '#FFF1F2', stroke: '#E11D48', text: '#881337', subFill: '#F8FAFC' },
};

const FORMAT_ICONS: Record<StudyResourceFormat, React.ComponentType<{ className?: string }>> = {
  mindmap: Network,
  flowchart: GitBranch,
  quick_revision: Zap,
  notebooklm: Headphones,
  flashcards: Layers,
  exam_guide: BookMarked,
};

function truncateSvgText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars - 1)}…`;
}

function loadSavedPreference(userId: string): StudyResourceFormat | 'recommended' {
  try {
    const raw = window.localStorage.getItem(`${PREF_STORAGE_PREFIX}${userId}`);
    if (
      raw === 'recommended' ||
      raw === 'mindmap' ||
      raw === 'flowchart' ||
      raw === 'quick_revision' ||
      raw === 'notebooklm' ||
      raw === 'flashcards' ||
      raw === 'exam_guide'
    ) {
      return raw;
    }
  } catch {
    // ignore storage errors
  }
  return 'recommended';
}

function loadNotebookLmNote(chapterId: string): SavedNotebookLmNote {
  try {
    const raw = window.localStorage.getItem(`${NOTES_STORAGE_PREFIX}${chapterId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedNotebookLmNote>;
      return {
        notebookUrl: parsed.notebookUrl || '',
        customNotes: parsed.customNotes || '',
        updatedAt: parsed.updatedAt || '',
      };
    }
  } catch {
    // ignore
  }
  return { notebookUrl: '', customNotes: '', updatedAt: '' };
}

function loadMasteredCards(chapterId: string): string[] {
  try {
    const raw = window.localStorage.getItem(`${MASTERY_STORAGE_PREFIX}${chapterId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string');
    }
  } catch {
    // ignore
  }
  return [];
}

export const ChapterVisualRevisionStudio: React.FC<ChapterVisualRevisionStudioProps> = ({
  board,
  userId,
  userRole,
  defaultClassLabel,
  subjectSpecialty,
  registerRows,
  schoolResources,
  drivePacks,
  onOpenSchoolHub,
}) => {
  const initialClass = useMemo(
    () => extractClassNumFromLabel(defaultClassLabel || 'Class 10'),
    [defaultClassLabel],
  );

  const [selectedClass, setSelectedClass] = useState<SchoolClassNumber>(initialClass);
  const subjects = useMemo(
    () => getSubjectsForClass(selectedClass, registerRows, schoolResources),
    [selectedClass, registerRows, schoolResources],
  );

  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    if (subjectSpecialty) {
      const match = subjects.find((s) =>
        subjectSpecialty.toLowerCase().includes(s.toLowerCase()),
      );
      if (match) return match;
    }
    return subjects[0] || 'Mathematics';
  });

  useEffect(() => {
    if (!subjects.includes(selectedSubject)) {
      setSelectedSubject(subjects[0] || 'Mathematics');
    }
  }, [subjects, selectedSubject]);

  const chapters = useMemo(
    () => getChaptersForClassSubject(selectedClass, selectedSubject, registerRows, schoolResources),
    [selectedClass, selectedSubject, registerRows, schoolResources],
  );

  const [chapterSearch, setChapterSearch] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapters[0]?.id || '');

  useEffect(() => {
    if (!chapters.some((c) => c.id === selectedChapterId)) {
      setSelectedChapterId(chapters[0]?.id || '');
    }
  }, [chapters, selectedChapterId]);

  const filteredChapters = useMemo(() => {
    const q = chapterSearch.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.keyTopics.some((t) => t.toLowerCase().includes(q)),
    );
  }, [chapters, chapterSearch]);

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === selectedChapterId) || chapters[0],
    [chapters, selectedChapterId],
  );

  const studyPack = useMemo(
    () => generateChapterVisualStudyPack(activeChapter, board),
    [activeChapter, board],
  );

  // Student Preference vs Auto-Recommended Mode
  const [preferredMode, setPreferredMode] = useState<StudyResourceFormat | 'recommended'>(() =>
    loadSavedPreference(userId),
  );
  const [activeFormat, setActiveFormat] = useState<StudyResourceFormat>(() =>
    preferredMode === 'recommended' ? studyPack.recommendedFormat : preferredMode,
  );

  useEffect(() => {
    if (preferredMode === 'recommended') {
      setActiveFormat(studyPack.recommendedFormat);
    } else {
      setActiveFormat(preferredMode);
    }
  }, [activeChapter.id, preferredMode, studyPack.recommendedFormat]);

  // Interactive State: Mindmap branch inspector
  const [selectedBranchId, setSelectedBranchId] = useState<string>('b_foundation');
  useEffect(() => {
    setSelectedBranchId(studyPack.mindmap.branches[0]?.id || 'b_foundation');
  }, [studyPack.chapter.id]);

  // Interactive State: Flowchart self-check answers revealed
  const [revealedFlowSteps, setRevealedFlowSteps] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setRevealedFlowSteps({});
  }, [studyPack.chapter.id]);

  // Interactive State: Flashcards
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>(() =>
    loadMasteredCards(activeChapter.id),
  );

  useEffect(() => {
    setCardIndex(0);
    setCardFlipped(false);
    setShowHint(false);
    setMasteredIds(loadMasteredCards(activeChapter.id));
  }, [activeChapter.id]);

  // Interactive State: NotebookLM copy feedback & saved note
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [notebookUrlDraft, setNotebookUrlDraft] = useState('');
  const [customNotesDraft, setCustomNotesDraft] = useState('');
  const [noteSavedAt, setNoteSavedAt] = useState('');
  const [noteSaveBanner, setNoteSaveBanner] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadNotebookLmNote(activeChapter.id);
    setNotebookUrlDraft(saved.notebookUrl);
    setCustomNotesDraft(saved.customNotes);
    setNoteSavedAt(saved.updatedAt);
    setNoteSaveBanner(null);
  }, [activeChapter.id]);

  // Matching school resources for current class & subject
  const matchedSchoolResources = useMemo(() => {
    return schoolResources.filter(
      (res) =>
        extractClassNumFromLabel(res.classSection) === selectedClass &&
        res.subject.toLowerCase().includes(selectedSubject.toLowerCase().slice(0, 4)),
    );
  }, [schoolResources, selectedClass, selectedSubject]);

  const matchedDrivePack = useMemo(() => {
    return drivePacks.find(
      (p) =>
        extractClassNumFromLabel(p.className) === selectedClass &&
        p.subject.toLowerCase().includes(selectedSubject.toLowerCase().slice(0, 4)),
    );
  }, [drivePacks, selectedClass, selectedSubject]);

  function handleSavePreferredFormat(next: StudyResourceFormat | 'recommended') {
    setPreferredMode(next);
    if (next === 'recommended') {
      setActiveFormat(studyPack.recommendedFormat);
    } else {
      setActiveFormat(next);
    }
    try {
      window.localStorage.setItem(`${PREF_STORAGE_PREFIX}${userId}`, next);
    } catch {
      // ignore
    }
  }

  async function handleCopyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback textarea copy for restricted iframe clipboard contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2200);
  }

  function handleSaveNotebookNote(e: React.FormEvent) {
    e.preventDefault();
    const updatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const payload: SavedNotebookLmNote = {
      notebookUrl: notebookUrlDraft.trim(),
      customNotes: customNotesDraft.trim(),
      updatedAt,
    };
    try {
      window.localStorage.setItem(`${NOTES_STORAGE_PREFIX}${activeChapter.id}`, JSON.stringify(payload));
    } catch {
      // ignore
    }
    setNoteSavedAt(updatedAt);
    setNoteSaveBanner('NotebookLM link & chapter study notes saved.');
  }

  function toggleCardMastery(cardId: string, mastered: boolean) {
    setMasteredIds((prev) => {
      const next = mastered
        ? Array.from(new Set([...prev, cardId]))
        : prev.filter((id) => id !== cardId);
      try {
        window.localStorage.setItem(`${MASTERY_STORAGE_PREFIX}${activeChapter.id}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const activeBranch =
    studyPack.mindmap.branches.find((b) => b.id === selectedBranchId) ||
    studyPack.mindmap.branches[0];

  const activeCard = studyPack.flashcards[cardIndex] || studyPack.flashcards[0];
  const masteryPct = computeFlashcardMasteryPercent(studyPack.flashcards.length, masteredIds);

  // Mindmap SVG coordinates for 5 symmetrically balanced radial nodes around center (460, 235)
  const branchPositions = [
    { x: 145, y: 132, align: 'left' as const },
    { x: 775, y: 82, align: 'right' as const },
    { x: 775, y: 235, align: 'right' as const },
    { x: 775, y: 388, align: 'right' as const },
    { x: 145, y: 338, align: 'left' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigator Bar: Class 1-12 + Subject Picker + Learning Preference */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Visual Mindmaps, Complete-Chapter Flowcharts &amp; NotebookLM Studio
            </h2>
            <p className="text-sm text-slate-600">
              Every Class (1–12) · Every Subject · Every Chapter — pick the recommended visual path or choose your favourite study format.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="student-preferred-format"
              className="text-xs font-medium text-slate-600 whitespace-nowrap"
            >
              My Default Format:
            </label>
            <select
              id="student-preferred-format"
              value={preferredMode}
              onChange={(e) =>
                handleSavePreferredFormat(e.target.value as StudyResourceFormat | 'recommended')
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="recommended">Auto (Best Recommended per Chapter)</option>
              {STUDY_FORMAT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  Always Open: {opt.shortLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Class 1 to Class 12 Selector Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Select Class (1 to 12)</span>
            <span>{studyPack.stageLabel}</span>
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Class selector from Class 1 to Class 12"
          >
            {ALL_CLASS_NUMBERS.map((cls) => {
              const active = selectedClass === cls;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => {
                    setSelectedClass(cls);
                    setChapterSearch('');
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors tabular-nums ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Class {cls}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Selector Strip */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              Subjects for Class {selectedClass} ({subjects.length})
            </span>
            <span>
              {chapters.length} Chapters · {board}
            </span>
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label={`Subjects for Class ${selectedClass}`}
          >
            {subjects.map((subj) => {
              const active = selectedSubject === subj;
              return (
                <button
                  key={subj}
                  type="button"
                  onClick={() => {
                    setSelectedSubject(subj);
                    setChapterSearch('');
                  }}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {subj}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Two-Zone Educational Layout: Left Chapter Rail (3 cols) + Right Visual Canvas (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Chapter Explorer */}
        <aside className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Class {selectedClass} · {selectedSubject}
            </h3>
            <span className="text-xs text-slate-500 tabular-nums">{chapters.length} ch.</span>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              placeholder="Filter chapters or topics..."
              aria-label="Filter chapters or topics"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <nav
            className="space-y-1 max-h-[540px] overflow-y-auto pr-1"
            aria-label="Chapter list"
          >
            {filteredChapters.map((ch) => {
              const isSelected = ch.id === activeChapter.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors border ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 text-slate-900'
                      : 'border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-bold tabular-nums text-blue-700">
                      Ch. {ch.chapterNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {ch.keyTopics.length} pillars
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5 leading-snug">
                    {ch.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {ch.keyTopics.slice(0, 2).join(' · ')}
                  </p>
                </button>
              );
            })}
            {filteredChapters.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-500">
                No chapter matched “{chapterSearch}”.
              </p>
            )}
          </nav>
        </aside>

        {/* Right Zone: Interactive Visual Study Canvas */}
        <div className="lg:col-span-9 space-y-5">
          {/* Chapter Header + Best Recommended Callout + Student Resource Choice Bar */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">
                  Class {activeChapter.classNumber} · {activeChapter.subject} · Chapter{' '}
                  {activeChapter.chapterNumber} · {activeChapter.sourceTag}
                </p>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {activeChapter.title}
                </h3>
                <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                  {studyPack.centralIdea}
                </p>
              </div>

              {activeFormat !== preferredMode && (
                <button
                  type="button"
                  onClick={() => handleSavePreferredFormat(activeFormat)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0 transition-colors"
                >
                  <Star className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  Pin as My Favourite Format
                </button>
              )}
            </div>

            {/* Recommended Primary Path Guidance */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{studyPack.recommendedReason}</span>
              </div>
              {activeFormat !== studyPack.recommendedFormat && (
                <button
                  type="button"
                  onClick={() => setActiveFormat(studyPack.recommendedFormat)}
                  className="text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap shrink-0"
                >
                  Open Recommended View
                </button>
              )}
            </div>

            {/* Student Choice Format Switcher (6 Modes, Single-Line Controls) */}
            <div
              className="flex flex-wrap gap-1.5 pt-1"
              role="tablist"
              aria-label="Choose chapter study resource format"
            >
              {STUDY_FORMAT_OPTIONS.map((opt) => {
                const Icon = FORMAT_ICONS[opt.id];
                const isSelected = activeFormat === opt.id;
                const isRecommended = studyPack.recommendedFormat === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveFormat(opt.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{opt.shortLabel}</span>
                    {isRecommended && (
                      <span
                        className={`text-[11px] font-medium ${
                          isSelected ? 'text-blue-200' : 'text-blue-600'
                        }`}
                      >
                        · Best
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 1. INTERACTIVE CHAPTER MINDMAP */}
          {activeFormat === 'mindmap' && (
            <section
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-5"
              data-testid="chapter-mindmap-view"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-lg font-bold text-slate-900">
                    Interactive Chapter Mindmap
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any branch node on the map to inspect its key points, definitions, and exam cues.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveFormat('flowchart')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  Next: Complete Chapter Flowchart
                </button>
              </div>

              {/* Crisp Interactive SVG Mindmap Canvas */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <svg
                  viewBox="0 0 920 470"
                  className="w-full min-w-[680px] h-auto"
                  role="img"
                  aria-label={`Visual concept mindmap for ${activeChapter.title}`}
                >
                  {/* Soft dot grid backdrop */}
                  <defs>
                    <pattern id="mindmapGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#CBD5E1" opacity="0.6" />
                    </pattern>
                  </defs>
                  <rect width="920" height="470" rx="10" fill="url(#mindmapGrid)" />

                  {/* Connecting Bezier Branches from Center Hub Edges to Branch Inner Edges */}
                  {studyPack.mindmap.branches.map((branch, idx) => {
                    const pos = branchPositions[idx] || branchPositions[0];
                    const palette = BRANCH_SVG_PALETTE[branch.colorKey];
                    const isFocused = branch.id === activeBranch.id;
                    const startX = pos.align === 'left' ? 335 : 585;
                    const endX = pos.align === 'left' ? pos.x + 123 : pos.x - 123;
                    const ctrlX = (startX + endX) / 2;
                    return (
                      <g key={`link-${branch.id}`}>
                        <path
                          d={`M ${startX} 235 C ${ctrlX} 235, ${ctrlX} ${pos.y}, ${endX} ${pos.y}`}
                          fill="none"
                          stroke={palette.stroke}
                          strokeWidth={isFocused ? 3.2 : 2}
                          strokeOpacity={isFocused ? 0.95 : 0.5}
                        />
                        <circle
                          cx={endX}
                          cy={pos.y}
                          r={isFocused ? 4.5 : 3}
                          fill={palette.stroke}
                        />
                      </g>
                    );
                  })}

                  {/* Central Chapter Hub */}
                  <g>
                    <rect
                      x="335"
                      y="183"
                      width="250"
                      height="104"
                      rx="14"
                      fill="#0F172A"
                      stroke="#1E293B"
                      strokeWidth="2"
                    />
                    <text
                      x="460"
                      y="214"
                      textAnchor="middle"
                      fill="#93C5FD"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {truncateSvgText(studyPack.mindmap.centerSubtitle, 34)}
                    </text>
                    <text
                      x="460"
                      y="241"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="14.5"
                      fontWeight="700"
                    >
                      {truncateSvgText(studyPack.mindmap.centerTitle, 28)}
                    </text>
                    <text
                      x="460"
                      y="266"
                      textAnchor="middle"
                      fill="#CBD5E1"
                      fontSize="11"
                    >
                      5 Core Branches · Click to Explore
                    </text>
                  </g>

                  {/* 5 Interactive Radial Branch Nodes */}
                  {studyPack.mindmap.branches.map((branch, idx) => {
                    const pos = branchPositions[idx] || branchPositions[0];
                    const palette = BRANCH_SVG_PALETTE[branch.colorKey];
                    const isFocused = branch.id === activeBranch.id;
                    const boxW = 246;
                    const boxH = 104;
                    const boxX = pos.x - boxW / 2;
                    const boxY = pos.y - boxH / 2;

                    return (
                      <g
                        key={branch.id}
                        onClick={() => setSelectedBranchId(branch.id)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={boxX}
                          y={boxY}
                          width={boxW}
                          height={boxH}
                          rx="10"
                          fill={isFocused ? palette.fill : '#FFFFFF'}
                          stroke={palette.stroke}
                          strokeWidth={isFocused ? 2.5 : 1.3}
                        />
                        <text
                          x={boxX + 14}
                          y={boxY + 24}
                          fill={palette.text}
                          fontSize="12.5"
                          fontWeight="700"
                        >
                          {truncateSvgText(branch.title, 28)}
                        </text>
                        {branch.subNodes.slice(0, 3).map((sub, sIdx) => (
                          <text
                            key={`${branch.id}-sub-${sIdx}`}
                            x={boxX + 14}
                            y={boxY + 46 + sIdx * 18}
                            fill="#334155"
                            fontSize="11"
                          >
                            • {truncateSvgText(sub, 32)}
                          </text>
                        ))}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Accessible Branch Buttons + Active Branch Deep-Dive Inspector */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {studyPack.mindmap.branches.map((branch) => {
                    const active = branch.id === activeBranch.id;
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => setSelectedBranchId(branch.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border ${
                          active
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {branch.title}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h5 className="text-sm font-bold text-slate-900">{activeBranch.title}</h5>
                    <span className="text-xs text-slate-500">
                      {activeBranch.subNodes.length} connected sub-nodes
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{activeBranch.summary}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {activeBranch.subNodes.map((node, idx) => (
                      <li
                        key={idx}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                      >
                        {idx + 1}. {node}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 2. COMPLETE-CHAPTER FLOWCHART */}
          {activeFormat === 'flowchart' && (
            <section
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-5"
              data-testid="chapter-flowchart-view"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-lg font-bold text-slate-900">
                    Complete-Chapter Visual Flowchart
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Follow Stages 1 to 5 in order to understand the entire chapter end-to-end without missing a link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveFormat('quick_revision')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Next: 5-Min Quick Revision
                </button>
              </div>

              <div className="space-y-3">
                {studyPack.flowchart.map((stage, idx) => {
                  const isRevealed = !!revealedFlowSteps[stage.id];
                  const stageStyle =
                    stage.nodeType === 'start'
                      ? 'border-blue-300 bg-blue-50/40'
                      : stage.nodeType === 'decision'
                        ? 'border-amber-300 bg-amber-50/40'
                        : stage.nodeType === 'checkpoint'
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : 'border-slate-200 bg-white';

                  return (
                    <div key={stage.id} className="flex flex-col items-stretch">
                      <div className={`rounded-xl border p-4 space-y-3 ${stageStyle}`}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-2.5">
                            <span className="font-mono text-xs font-bold text-slate-500 tabular-nums">
                              STEP 0{stage.stepNumber}
                            </span>
                            <h5 className="text-sm font-bold text-slate-900">{stage.title}</h5>
                          </div>
                          <span className="text-xs font-medium text-slate-500 capitalize">
                            {stage.nodeType === 'decision' ? 'Process & Decision' : stage.nodeType}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-800">{stage.headline}</p>

                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {stage.details.map((line, dIdx) => (
                            <li key={dIdx} className="leading-relaxed">
                              • {line}
                            </li>
                          ))}
                        </ul>

                        {/* Interactive Step Self-Check */}
                        <div className="border-t border-slate-200/80 pt-3 flex flex-col gap-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-medium text-slate-700">
                              Check Understanding: {stage.keyQuestion}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedFlowSteps((prev) => ({
                                  ...prev,
                                  [stage.id]: !prev[stage.id],
                                }))
                              }
                              className="text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap shrink-0"
                            >
                              {isRevealed ? 'Hide Answer' : 'Reveal Key Answer'}
                            </button>
                          </div>
                          {isRevealed && (
                            <p className="rounded-md border border-blue-200 bg-white px-3 py-2 text-xs text-slate-800">
                              {stage.quickAnswer}
                            </p>
                          )}
                        </div>
                      </div>

                      {idx < studyPack.flowchart.length - 1 && (
                        <div className="flex flex-col items-center py-1.5 text-slate-500">
                          <div className="h-3 w-px bg-slate-300" />
                          <span className="text-[11px] font-medium text-slate-500 px-2">
                            {stage.connectorLabel}
                          </span>
                          <ArrowDown className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 3. 5-MINUTE QUICK REVISION SHEET */}
          {activeFormat === 'quick_revision' && (
            <section
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-5"
              data-testid="chapter-quick-revision-view"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-lg font-bold text-slate-900">
                    {studyPack.quickRevision.estimatedMinutes}-Minute Quick Revision Sheet
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rapid exam-ready sheet covering every high-yield concept, key term, and mistake to avoid.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'quick_sheet',
                        [
                          `Quick Revision: Class ${activeChapter.classNumber} ${activeChapter.subject} — Ch. ${activeChapter.chapterNumber}: ${activeChapter.title}`,
                          '',
                          'Key Takeaways:',
                          ...studyPack.quickRevision.highYieldBullets.map((b) => `- ${b}`),
                          '',
                          `Memory Chain: ${studyPack.quickRevision.mnemonic}`,
                          '',
                          'Avoid These Mistakes:',
                          ...studyPack.quickRevision.commonMistakes.map((m) => `- ${m}`),
                        ].join('\n'),
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    {copiedKey === 'quick_sheet' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Copied Sheet
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Sheet
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0 print:hidden"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print Sheet
                  </button>
                </div>
              </div>

              {/* 1-Minute Memory Mnemonic */}
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                <p className="text-xs font-semibold text-blue-800">1-Minute Memory Chain</p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {studyPack.quickRevision.mnemonic}
                </p>
              </div>

              {/* High-Yield Takeaways */}
              <div className="space-y-2">
                <h5 className="text-sm font-bold text-slate-900">High-Yield Revision Points</h5>
                <ul className="space-y-2">
                  {studyPack.quickRevision.highYieldBullets.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed"
                    >
                      <span className="font-mono text-xs font-bold text-blue-700 mt-0.5 tabular-nums">
                        0{idx + 1}.
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Terms & Formulas Table */}
              <div className="space-y-2">
                <h5 className="text-sm font-bold text-slate-900">Key Concepts, Rules &amp; Memory Cues</h5>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-3.5 py-2.5 font-semibold">Core Pillar / Term</th>
                        <th className="px-3.5 py-2.5 font-semibold">What It Means / Rule</th>
                        <th className="px-3.5 py-2.5 font-semibold">Quick Memory Anchor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studyPack.quickRevision.keyItems.map((item, idx) => (
                        <tr key={idx} className="align-top">
                          <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                            {item.term}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-700 leading-relaxed">
                            {item.definitionOrFormula}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600 leading-relaxed">
                            {item.memoryCue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Common Mistakes */}
              <div className="space-y-2">
                <h5 className="text-sm font-bold text-slate-900">Common Exam Traps to Avoid</h5>
                <ul className="space-y-1.5">
                  {studyPack.quickRevision.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="text-xs text-slate-700 leading-relaxed">
                      {idx + 1}. {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* 4. NOTEBOOKLM ALIGNED STUDIO PACK */}
          {activeFormat === 'notebooklm' && (
            <section
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-5"
              data-testid="chapter-notebooklm-view"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-lg font-bold text-slate-900">
                    NotebookLM Aligned Study &amp; Audio Overview Pack
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Copy this chapter’s structured Source Brief or Prompts straight into Google NotebookLM, or study the built-in Audio Overview &amp; Briefing FAQ right here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText('nlm_brief', studyPack.notebookLm.sourceBriefMarkdown)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  {copiedKey === 'nlm_brief' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Source Brief Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy NotebookLM Source Brief
                    </>
                  )}
                </button>
              </div>

              {/* Built-In Audio Overview Script Preview */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-blue-600" />
                    <h5 className="text-sm font-bold text-slate-900">
                      Audio Overview Dialogue Preview (2-Host Revision Walkthrough)
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText('nlm_audio', studyPack.notebookLm.audioOverviewPrompt)
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap shrink-0"
                  >
                    {copiedKey === 'nlm_audio' ? 'Copied Audio Prompt' : 'Copy Audio Overview Prompt'}
                  </button>
                </div>

                <div className="space-y-2.5">
                  {studyPack.notebookLm.audioOverviewDialoguePreview.map((turn, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs leading-relaxed text-slate-700"
                    >
                      <span className="font-bold text-slate-900 mr-2">{turn.host}:</span>
                      <span>{turn.line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready-to-Paste NotebookLM Studio Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900">
                      NotebookLM Mindmap &amp; Study Guide Prompt
                    </h5>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText('nlm_guide', studyPack.notebookLm.mindmapStudyGuidePrompt)
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap shrink-0"
                    >
                      <Copy className="h-3 w-3" />
                      {copiedKey === 'nlm_guide' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {studyPack.notebookLm.mindmapStudyGuidePrompt}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900">
                      Structured Source Brief (Markdown)
                    </h5>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText('nlm_md', studyPack.notebookLm.sourceBriefMarkdown)
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap shrink-0"
                    >
                      <FileText className="h-3 w-3" />
                      {copiedKey === 'nlm_md' ? 'Copied' : 'Copy Markdown'}
                    </button>
                  </div>
                  <pre className="max-h-36 overflow-y-auto rounded bg-slate-50 p-2.5 text-[11px] text-slate-700 whitespace-pre-wrap font-mono">
                    {studyPack.notebookLm.sourceBriefMarkdown}
                  </pre>
                </div>
              </div>

              {/* NotebookLM Briefing FAQ */}
              <div className="space-y-2">
                <h5 className="text-sm font-bold text-slate-900">Chapter Briefing FAQ</h5>
                <div className="space-y-2">
                  {studyPack.notebookLm.briefingFaq.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 px-4 py-3 space-y-1"
                    >
                      <p className="text-xs font-bold text-slate-900">
                        Q{idx + 1}. {faq.question}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Personal / Class NotebookLM Link & Imported Notes */}
              <form
                onSubmit={handleSaveNotebookNote}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="text-xs font-bold text-slate-900">
                    Attach Your NotebookLM Notebook Link or Custom Study Notes (Ch.{' '}
                    {activeChapter.chapterNumber})
                  </h5>
                  {noteSavedAt && (
                    <span className="text-[11px] text-slate-500">Last saved at {noteSavedAt}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="nlm-link-input"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      NotebookLM Share Link (Optional)
                    </label>
                    <input
                      id="nlm-link-input"
                      type="url"
                      value={notebookUrlDraft}
                      onChange={(e) => setNotebookUrlDraft(e.target.value)}
                      placeholder="https://notebooklm.google.com/notebook/..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="nlm-notes-input"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Personal Key Insights / Imported NotebookLM Summary
                    </label>
                    <textarea
                      id="nlm-notes-input"
                      rows={2}
                      value={customNotesDraft}
                      onChange={(e) => setCustomNotesDraft(e.target.value)}
                      placeholder="Paste key Q&A, mnemonics, or teacher revision hints for this chapter..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap shrink-0"
                  >
                    Save Chapter Notes
                  </button>
                  {noteSaveBanner && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {noteSaveBanner}
                    </span>
                  )}
                </div>
              </form>
            </section>
          )}

          {/* 5. ACTIVE RECALL FLASHCARDS */}
          {activeFormat === 'flashcards' && activeCard && (
            <section
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-5"
              data-testid="chapter-flashcards-view"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-lg font-bold text-slate-900">
                    Active Recall Flashcards
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Card {cardIndex + 1} of {studyPack.flashcards.length} · Mastery:{' '}
                    <span className="font-semibold text-slate-800 tabular-nums">{masteryPct}%</span>{' '}
                    ({masteredIds.length}/{studyPack.flashcards.length} mastered)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMasteredIds([]);
                    try {
                      window.localStorage.removeItem(`${MASTERY_STORAGE_PREFIX}${activeChapter.id}`);
                    } catch {
                      // ignore
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Progress
                </button>
              </div>

              {/* Mastery bar */}
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all"
                  style={{ width: `${masteryPct}%` }}
                />
              </div>

              {/* Interactive Card Surface */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 min-h-[210px] flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {activeCard.tag} · {cardFlipped ? 'Answer Side' : 'Question Side'}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {masteredIds.includes(activeCard.id) ? 'Mastered' : 'In Review'}
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="font-display text-lg font-bold text-slate-900 leading-snug">
                    {cardFlipped ? activeCard.answer : activeCard.prompt}
                  </p>
                  {!cardFlipped && showHint && (
                    <p className="text-xs text-blue-700">Hint: {activeCard.hint}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCardFlipped((f) => !f)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                    >
                      {cardFlipped ? 'Show Question' : 'Flip to Reveal Answer'}
                    </button>
                    {!cardFlipped && (
                      <button
                        type="button"
                        onClick={() => setShowHint((h) => !h)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0"
                      >
                        {showHint ? 'Hide Hint' : 'Show Hint'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCardMastery(activeCard.id, false)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0"
                    >
                      Review Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toggleCardMastery(activeCard.id, true);
                        if (cardIndex < studyPack.flashcards.length - 1) {
                          setCardIndex((i) => i + 1);
                          setCardFlipped(false);
                          setShowHint(false);
                        }
                      }}
                      className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
                    >
                      Got It (Mastered)
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={cardIndex === 0}
                  onClick={() => {
                    setCardIndex((i) => Math.max(0, i - 1));
                    setCardFlipped(false);
                    setShowHint(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous Card
                </button>
                <button
                  type="button"
                  disabled={cardIndex >= studyPack.flashcards.length - 1}
                  onClick={() => {
                    setCardIndex((i) => Math.min(studyPack.flashcards.length - 1, i + 1));
                    setCardFlipped(false);
                    setShowHint(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0"
                >
                  Next Card
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </section>
          )}

          {/* 6. BEST-RECOMMENDED RESOURCES & SCHOOL PACK */}
          {activeFormat === 'exam_guide' && (
            <section
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-5"
              data-testid="chapter-recommended-resources-view"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-lg font-bold text-slate-900">
                    Best-Recommended Resources &amp; School Repository
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose any learning format that fits your pace — visual, audio, NCERT exemplar, or teacher-uploaded school sheets.
                  </p>
                </div>
                {onOpenSchoolHub && (
                  <button
                    type="button"
                    onClick={() => onOpenSchoolHub(`Class ${selectedClass}`, selectedSubject)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Open Full School Drive Hub
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studyPack.recommendedResources.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-200 p-4 space-y-2"
                  >
                    <p className="text-[11px] font-medium text-slate-500">
                      {item.provider} · {item.formatLabel}
                    </p>
                    <h5 className="text-sm font-bold text-slate-900">{item.title}</h5>
                    <p className="text-xs text-slate-700 leading-relaxed">{item.whyRecommended}</p>
                    <p className="text-xs text-blue-700 font-medium pt-1">
                      How to use: {item.studyTip}
                    </p>
                  </div>
                ))}
              </div>

              {/* Linked School Repository Materials for this Class & Subject */}
              <div className="border-t border-slate-200 pt-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="text-sm font-bold text-slate-900">
                    Matched School Resources (Class {selectedClass} · {selectedSubject})
                  </h5>
                  <span className="text-xs text-slate-500">
                    {matchedSchoolResources.length} uploaded items
                    {matchedDrivePack ? ` · ${matchedDrivePack.totalFiles} Drive pack files` : ''}
                  </span>
                </div>

                {matchedSchoolResources.length > 0 ? (
                  <div className="space-y-2">
                    {matchedSchoolResources.map((res) => (
                      <div
                        key={res.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{res.title}</p>
                          <p className="text-[11px] text-slate-600">
                            {res.chapter} · {res.category} · {res.classSection}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-emerald-700">
                          {res.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No separate school-uploaded worksheets for Class {selectedClass} {selectedSubject} yet — all interactive Mindmaps, Flowcharts, Quick Revision Sheets, NotebookLM Packs, and Flashcards above are ready for immediate study
                    {userRole === 'teacher' ? ' (teachers can upload extra worksheets in Upload & Lesson Plans).' : '.'}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
