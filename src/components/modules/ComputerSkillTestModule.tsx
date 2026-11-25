import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  BarChart3,
  Bold,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Circle,
  ClipboardCopy,
  ClipboardPaste,
  Clock,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderPlus,
  Keyboard,
  ListChecks,
  Pencil,
  RotateCcw,
  Save,
  Search,
  Send,
  SlidersHorizontal,
  Underline,
  XCircle,
} from 'lucide-react';
import type {
  ComputerSkillAttempt,
  ComputerSkillBenchmark,
  ComputerSkillChecklistItem,
  ComputerSkillPracticalTaskSpec,
  ComputerSkillTaskResult,
  SchoolClassNumber,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import {
  buildTaskChecklistSpec,
  computeChecklistCompletionPct,
  createDefaultComputerSkillBenchmarks,
  evaluateMiniSheetFormula,
  evaluateTypingPerformance,
  getGradeCompetencyChecklist,
} from '../../utils/computerSkillEngine';
import { extractClassNumber } from '../../utils/thinkingMonthlyBank';
import { SkillMonthlyGrowthLeaderboard } from '../SkillMonthlyGrowthLeaderboard';

interface ComputerSkillTestModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type SubTab = 'test' | 'benchmarks' | 'analytics' | 'leaderboard';

interface VirtualFile {
  id: string;
  name: string;
  folder: string;
}

interface FolderTaskState {
  folders: string[];
  files: VirtualFile[];
  selectedFolder: string;
  newFolderInput: string;
  renamingFileId: string | null;
  renameInput: string;
  moveTargetByFile: Record<string, string>;
}

interface CopyPasteTaskState {
  copiedFromSource: boolean;
  pastedViaClipboard: boolean;
  value: string;
}

interface FormatSaveTaskState {
  isBold: boolean;
  isUnderline: boolean;
  fileName: string;
  saved: boolean;
}

interface FindReplaceTaskState {
  text: string;
  findInput: string;
  replaceInput: string;
  replaceCount: number;
}

interface SheetTaskState {
  formula: string;
}

const STAFF_ROLES = new Set([
  'super_admin',
  'school_admin',
  'principal',
  'coordinator',
  'teacher',
]);

const CLASS_NUMBERS: SchoolClassNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function gradeBadgeClasses(grade: ComputerSkillAttempt['grade']): string {
  switch (grade) {
    case 'Distinction':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Proficient':
      return 'bg-blue-50 text-blue-900 border-blue-200';
    case 'Developing':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    default:
      return 'bg-rose-50 text-rose-800 border-rose-200';
  }
}

export const ComputerSkillTestModule: React.FC<ComputerSkillTestModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const isStaff = STAFF_ROLES.has(data.user.role);
  const canEditBenchmarks = isStaff;

  const [subTab, setSubTab] = useState<SubTab>('test');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    data.students[0]?.id ?? '',
  );

  const selectedStudent = useMemo(
    () =>
      data.students.find((s) => s.id === selectedStudentId) ?? data.students[0] ?? null,
    [data.students, selectedStudentId],
  );

  const [selectedClass, setSelectedClass] = useState<SchoolClassNumber>(() =>
    extractClassNumber(data.students[0]?.classSection || '6'),
  );

  // Sync selected student/class when switching demo user or tenant
  useEffect(() => {
    const first = data.students[0];
    if (first) {
      setSelectedStudentId(first.id);
      setSelectedClass(extractClassNumber(first.classSection));
    }
  }, [data.user.id, data.activeSchool.id]);

  // Build ordered Class 1-12 benchmarks (prefer school-stored, fallback to engine defaults)
  const benchmarks = useMemo<ComputerSkillBenchmark[]>(() => {
    const defaults = createDefaultComputerSkillBenchmarks(data.activeSchool.id);
    const stored = data.computerSkillBenchmarks || [];
    return CLASS_NUMBERS.map((cls) => {
      const found = stored.find((b) => b.classLevel === cls);
      return found ?? defaults[cls - 1];
    });
  }, [data.computerSkillBenchmarks, data.activeSchool.id]);

  const activeBenchmark = useMemo(
    () => benchmarks.find((b) => b.classLevel === selectedClass) ?? benchmarks[5],
    [benchmarks, selectedClass],
  );

  // ============================================================================
  // PART 1: TYPING SPEED STATE
  // ============================================================================
  const [typedText, setTypedText] = useState('');
  const [typingRunning, setTypingRunning] = useState(false);
  const [typingFinished, setTypingFinished] = useState(false);
  const [typingElapsedSec, setTypingElapsedSec] = useState(0);
  const typingStartRef = useRef<number | null>(null);

  // ============================================================================
  // PART 2: PRACTICAL SANDBOX STATE (KEYED BY TASK ID)
  // ============================================================================
  const [inAppClipboard, setInAppClipboard] = useState('');
  const [copyStateById, setCopyStateById] = useState<Record<string, CopyPasteTaskState>>({});
  const [folderStateById, setFolderStateById] = useState<Record<string, FolderTaskState>>({});
  const [formatStateById, setFormatStateById] = useState<Record<string, FormatSaveTaskState>>({});
  const [replaceStateById, setReplaceStateById] = useState<Record<string, FindReplaceTaskState>>(
    {},
  );
  const [sheetStateById, setSheetStateById] = useState<Record<string, SheetTaskState>>({});
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [competencyChecks, setCompetencyChecks] = useState<Record<string, boolean>>({});
  const [expandedChecklistClass, setExpandedChecklistClass] = useState<SchoolClassNumber | null>(null);

  // Submission & Scorecard state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [latestScorecard, setLatestScorecard] = useState<ComputerSkillAttempt | null>(null);

  // Benchmarks editor state
  const [editingClass, setEditingClass] = useState<SchoolClassNumber | null>(null);
  const [editWpm, setEditWpm] = useState(26);
  const [editAcc, setEditAcc] = useState(90);
  const [editDuration, setEditDuration] = useState(60);
  const [editPassage, setEditPassage] = useState('');
  const [savingBench, setSavingBench] = useState(false);
  const [benchFeedback, setBenchFeedback] = useState<string | null>(null);

  // Analytics filter
  const [analyticsClassFilter, setAnalyticsClassFilter] = useState<string>('all');

  function initializeLabForBenchmark(bench: ComputerSkillBenchmark) {
    setTypedText('');
    setTypingRunning(false);
    setTypingFinished(false);
    setTypingElapsedSec(0);
    typingStartRef.current = null;
    setInAppClipboard('');
    setSubmitError(null);
    setCompetencyChecks({});

    const nextCopy: Record<string, CopyPasteTaskState> = {};
    const nextFolder: Record<string, FolderTaskState> = {};
    const nextFormat: Record<string, FormatSaveTaskState> = {};
    const nextReplace: Record<string, FindReplaceTaskState> = {};
    const nextSheet: Record<string, SheetTaskState> = {};

    for (const task of bench.tasks) {
      if (task.kind === 'copy_paste') {
        nextCopy[task.id] = {
          copiedFromSource: false,
          pastedViaClipboard: false,
          value: '',
        };
      } else if (task.kind === 'folder_management') {
        const folders = [...(task.initialFolders || ['Desktop'])];
        const files = (task.initialFiles || []).map((f) => ({ ...f }));
        const moveTargetByFile: Record<string, string> = {};
        files.forEach((f) => {
          moveTargetByFile[f.id] = f.folder;
        });
        nextFolder[task.id] = {
          folders,
          files,
          selectedFolder: 'ALL',
          newFolderInput: '',
          renamingFileId: null,
          renameInput: '',
          moveTargetByFile,
        };
      } else if (task.kind === 'text_format_save') {
        nextFormat[task.id] = {
          isBold: false,
          isUnderline: false,
          fileName: '',
          saved: false,
        };
      } else if (task.kind === 'find_replace_list') {
        nextReplace[task.id] = {
          text: task.draftParagraph || '',
          findInput: '',
          replaceInput: '',
          replaceCount: 0,
        };
      } else if (task.kind === 'spreadsheet_formula') {
        nextSheet[task.id] = { formula: '' };
      }
    }

    setCopyStateById(nextCopy);
    setFolderStateById(nextFolder);
    setFormatStateById(nextFormat);
    setReplaceStateById(nextReplace);
    setSheetStateById(nextSheet);
  }

  useEffect(() => {
    initializeLabForBenchmark(activeBenchmark);
    setLatestScorecard(null);
  }, [activeBenchmark.id]);

  // Live typing countdown timer
  useEffect(() => {
    if (!typingRunning || typingFinished) return;
    const id = window.setInterval(() => {
      const elapsed = typingStartRef.current
        ? Math.floor((Date.now() - typingStartRef.current) / 1000)
        : 0;
      if (elapsed >= activeBenchmark.typingDurationSec) {
        setTypingElapsedSec(activeBenchmark.typingDurationSec);
        setTypingRunning(false);
        setTypingFinished(true);
      } else {
        setTypingElapsedSec(elapsed);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [typingRunning, typingFinished, activeBenchmark.typingDurationSec]);

  function handleTypingChange(nextVal: string) {
    if (typingFinished) return;
    if (!typingRunning && nextVal.length > 0) {
      typingStartRef.current = Date.now();
      setTypingRunning(true);
    }
    setTypedText(nextVal);
    if (nextVal.length >= activeBenchmark.typingPassage.length) {
      const elapsed = typingStartRef.current
        ? Math.max(5, Math.round((Date.now() - typingStartRef.current) / 1000))
        : 5;
      setTypingElapsedSec(Math.min(activeBenchmark.typingDurationSec, elapsed));
      setTypingRunning(false);
      setTypingFinished(true);
    }
  }

  function handleFinishTypingNow() {
    if (!typingStartRef.current && typedText.length === 0) return;
    const elapsed = typingStartRef.current
      ? Math.max(5, Math.round((Date.now() - typingStartRef.current) / 1000))
      : 5;
    setTypingElapsedSec(Math.min(activeBenchmark.typingDurationSec, elapsed));
    setTypingRunning(false);
    setTypingFinished(true);
  }

  function handleResetTyping() {
    setTypedText('');
    setTypingRunning(false);
    setTypingFinished(false);
    setTypingElapsedSec(0);
    typingStartRef.current = null;
  }

  const typingEval = useMemo(
    () =>
      evaluateTypingPerformance({
        passage: activeBenchmark.typingPassage,
        typedText,
        elapsedSec: Math.max(5, typingElapsedSec),
        targetWpm: activeBenchmark.targetWpm,
        targetAccuracyPct: activeBenchmark.targetAccuracyPct,
      }),
    [activeBenchmark, typedText, typingElapsedSec],
  );

  // ============================================================================
  // EVALUATE PRACTICAL TASKS LIVE
  // ============================================================================
  function evaluatePracticalTask(task: ComputerSkillPracticalTaskSpec): ComputerSkillTaskResult {
    const specSteps = buildTaskChecklistSpec(task);

    if (task.kind === 'copy_paste') {
      const st = copyStateById[task.id] || {
        copiedFromSource: false,
        pastedViaClipboard: false,
        value: '',
      };
      const expected = (task.sourceText || '').trim();
      const actual = st.value.trim();
      const exactMatch = expected.length > 0 && actual === expected;
      const usedClipboard = st.copiedFromSource || st.pastedViaClipboard;
      const passed = exactMatch && usedClipboard;
      let score = 0;
      if (passed) score = task.points;
      else if (exactMatch) score = Math.round(task.points * 0.7);
      else if (st.copiedFromSource) score = Math.round(task.points * 0.3);

      const checklistItems: ComputerSkillChecklistItem[] = [
        {
          id: specSteps[0]?.id || `${task.id}-s1`,
          label: specSteps[0]?.label || 'Copy text from source box',
          completed: st.copiedFromSource,
          autoVerified: true,
          category: 'sandbox_step',
        },
        {
          id: specSteps[1]?.id || `${task.id}-s2`,
          label: specSteps[1]?.label || 'Paste into target field',
          completed: st.pastedViaClipboard || (st.copiedFromSource && actual.length > 0),
          autoVerified: true,
          category: 'sandbox_step',
        },
        {
          id: specSteps[2]?.id || `${task.id}-s3`,
          label: specSteps[2]?.label || 'Verify 100% character-exact match',
          completed: exactMatch,
          autoVerified: true,
          category: 'sandbox_step',
        },
      ];

      return {
        taskId: task.id,
        kind: task.kind,
        title: task.title,
        passed,
        score,
        maxScore: task.points,
        detail: passed
          ? 'Copied from source and pasted with 100% text match.'
          : exactMatch
            ? 'Text matches, but use Copy & Paste action to demonstrate clipboard skill.'
            : 'Copy the exact text from the source box and paste it into the answer box.',
        checklistItems,
      };
    }

    if (task.kind === 'folder_management') {
      const st = folderStateById[task.id];
      if (!st) {
        return {
          taskId: task.id,
          kind: task.kind,
          title: task.title,
          passed: false,
          score: 0,
          maxScore: task.points,
          detail: 'Folder workspace not initialized.',
          checklistItems: specSteps.map((s) => ({
            id: s.id,
            label: s.label,
            completed: false,
            autoVerified: true,
            category: 'sandbox_step',
          })),
        };
      }
      const checks: boolean[] = [];
      const notes: string[] = [];
      const checklistItems: ComputerSkillChecklistItem[] = [];

      if (task.requiredNewFolder) {
        const hasFolder = st.folders.some(
          (f) => f.trim().toLowerCase() === task.requiredNewFolder!.trim().toLowerCase(),
        );
        checks.push(hasFolder);
        notes.push(
          hasFolder
            ? `Folder "${task.requiredNewFolder}" created`
            : `Create folder "${task.requiredNewFolder}"`,
        );
        checklistItems.push({
          id: `${task.id}-s-folder`,
          label: `Create new folder named "${task.requiredNewFolder}"`,
          completed: hasFolder,
          autoVerified: true,
          category: 'sandbox_step',
        });
      }
      if (task.requiredMoveFileId && task.requiredDestinationFolder) {
        const targetFile = st.files.find((f) => f.id === task.requiredMoveFileId);
        const origFile = (task.initialFiles || []).find((f) => f.id === task.requiredMoveFileId);
        const moved =
          Boolean(targetFile) &&
          targetFile!.folder.trim().toLowerCase() ===
            task.requiredDestinationFolder.trim().toLowerCase();
        checks.push(moved);
        notes.push(
          moved
            ? `Moved file into "${task.requiredDestinationFolder}"`
            : `Move target file into "${task.requiredDestinationFolder}"`,
        );
        checklistItems.push({
          id: `${task.id}-s-move`,
          label: `Move "${origFile?.name || targetFile?.name || 'target file'}" into "${task.requiredDestinationFolder}"`,
          completed: moved,
          autoVerified: true,
          category: 'sandbox_step',
        });
      }
      if (task.requiredRenameFileId && task.requiredNewFileName) {
        const targetFile = st.files.find((f) => f.id === task.requiredRenameFileId);
        const renamed =
          Boolean(targetFile) &&
          targetFile!.name.trim() === task.requiredNewFileName.trim();
        checks.push(renamed);
        notes.push(
          renamed
            ? `Renamed file to "${task.requiredNewFileName}"`
            : `Rename file to "${task.requiredNewFileName}"`,
        );
        checklistItems.push({
          id: `${task.id}-s-rename`,
          label: `Rename target file to "${task.requiredNewFileName}"`,
          completed: renamed,
          autoVerified: true,
          category: 'sandbox_step',
        });
      }

      const passedCount = checks.filter(Boolean).length;
      const passed = checks.length > 0 && passedCount === checks.length;
      const score =
        checks.length > 0 ? Math.round((passedCount / checks.length) * task.points) : 0;

      return {
        taskId: task.id,
        kind: task.kind,
        title: task.title,
        passed,
        score,
        maxScore: task.points,
        detail: notes.join(' · '),
        checklistItems,
      };
    }

    if (task.kind === 'text_format_save') {
      const st = formatStateById[task.id] || {
        isBold: false,
        isUnderline: false,
        fileName: '',
        saved: false,
      };
      const formatOk =
        task.requiredFormat === 'bold'
          ? st.isBold
          : task.requiredFormat === 'underline'
            ? st.isUnderline
            : st.isBold && st.isUnderline;
      const nameOk =
        st.saved &&
        st.fileName.trim().toLowerCase() === (task.requiredFileName || '').trim().toLowerCase();

      const passed = formatOk && nameOk;
      const score = passed
        ? task.points
        : formatOk || nameOk
          ? Math.round(task.points * 0.5)
          : 0;

      const checklistItems: ComputerSkillChecklistItem[] = [];
      if (task.requiredFormat === 'bold' || task.requiredFormat === 'both') {
        checklistItems.push({
          id: `${task.id}-s-bold`,
          label: 'Apply Bold style to the document title',
          completed: st.isBold,
          autoVerified: true,
          category: 'sandbox_step',
        });
      }
      if (task.requiredFormat === 'underline' || task.requiredFormat === 'both') {
        checklistItems.push({
          id: `${task.id}-s-under`,
          label: 'Apply Underline style to the document title',
          completed: st.isUnderline,
          autoVerified: true,
          category: 'sandbox_step',
        });
      }
      checklistItems.push({
        id: `${task.id}-s-save`,
        label: `Save file with exact name "${task.requiredFileName || 'document.txt'}"`,
        completed: nameOk,
        autoVerified: true,
        category: 'sandbox_step',
      });

      return {
        taskId: task.id,
        kind: task.kind,
        title: task.title,
        passed,
        score,
        maxScore: task.points,
        detail: passed
          ? `Formatted correctly and saved as "${task.requiredFileName}".`
          : !formatOk
            ? `Apply required formatting (${task.requiredFormat}) and save.`
            : `Save the document with exact name "${task.requiredFileName}".`,
        checklistItems,
      };
    }

    if (task.kind === 'find_replace_list') {
      const st = replaceStateById[task.id] || {
        text: task.draftParagraph || '',
        findInput: '',
        replaceInput: '',
        replaceCount: 0,
      };
      const findWord = (task.findWord || '').toLowerCase();
      const replaceWord = (task.replaceWord || '').toLowerCase();
      const lower = st.text.toLowerCase();
      const remainingBad = findWord ? lower.split(findWord).length - 1 : 0;
      const goodCount = replaceWord ? lower.split(replaceWord).length - 1 : 0;
      const passed = remainingBad === 0 && goodCount >= 2;
      const score = passed
        ? task.points
        : remainingBad <= 1 && goodCount >= 1
          ? Math.round(task.points * 0.5)
          : 0;

      const checklistItems: ComputerSkillChecklistItem[] = [
        {
          id: specSteps[0]?.id || `${task.id}-s1`,
          label: specSteps[0]?.label || `Locate "${task.findWord}" in draft`,
          completed:
            st.findInput.trim().toLowerCase() === findWord || st.replaceCount > 0 || passed,
          autoVerified: true,
          category: 'sandbox_step',
        },
        {
          id: specSteps[1]?.id || `${task.id}-s2`,
          label: specSteps[1]?.label || `Replace with "${task.replaceWord}"`,
          completed: goodCount >= 2,
          autoVerified: true,
          category: 'sandbox_step',
        },
        {
          id: specSteps[2]?.id || `${task.id}-s3`,
          label: specSteps[2]?.label || `Confirm 0 occurrences of "${task.findWord}" remain`,
          completed: remainingBad === 0 && goodCount >= 1,
          autoVerified: true,
          category: 'sandbox_step',
        },
      ];

      return {
        taskId: task.id,
        kind: task.kind,
        title: task.title,
        passed,
        score,
        maxScore: task.points,
        detail: passed
          ? `All occurrences of "${task.findWord}" cleanly replaced with "${task.replaceWord}".`
          : `${remainingBad} occurrence(s) of "${task.findWord}" still remaining.`,
        checklistItems,
      };
    }

    // spreadsheet_formula
    const st = sheetStateById[task.id] || { formula: '' };
    const colValues = (task.sheetRows || []).map((r) => r.values[0] ?? 0);
    const evalRes = evaluateMiniSheetFormula(st.formula, colValues);
    const expected = task.expectedNumericResult ?? 0;
    const startsWithEq = st.formula.trim().startsWith('=');
    const keywordOk =
      !task.requiredFormulaKeyword || evalRes.keyword === task.requiredFormulaKeyword;
    const valueOk =
      evalRes.valid && evalRes.result !== null && Math.abs(evalRes.result - expected) < 0.01;
    const passed = keywordOk && valueOk;
    const score = passed
      ? task.points
      : evalRes.valid
        ? Math.round(task.points * 0.4)
        : 0;

    const checklistItems: ComputerSkillChecklistItem[] = [
      {
        id: specSteps[0]?.id || `${task.id}-s1`,
        label: specSteps[0]?.label || 'Start spreadsheet formula with "="',
        completed: startsWithEq,
        autoVerified: true,
        category: 'sandbox_step',
      },
      {
        id: specSteps[1]?.id || `${task.id}-s2`,
        label: specSteps[1]?.label || `Use =${task.requiredFormulaKeyword || 'SUM'}(...)`,
        completed: Boolean(evalRes.keyword && keywordOk),
        autoVerified: true,
        category: 'sandbox_step',
      },
      {
        id: specSteps[2]?.id || `${task.id}-s3`,
        label: specSteps[2]?.label || `Confirm evaluated output equals ${expected}`,
        completed: valueOk,
        autoVerified: true,
        category: 'sandbox_step',
      },
    ];

    return {
      taskId: task.id,
      kind: task.kind,
      title: task.title,
      passed,
      score,
      maxScore: task.points,
      detail: passed
        ? `Formula ${st.formula.trim().toUpperCase()} evaluated to ${evalRes.result}.`
        : evalRes.error || `Expected ${task.requiredFormulaKeyword} formula evaluating to ${expected}.`,
      checklistItems,
    };
  }

  const livePracticalResults = useMemo(
    () => activeBenchmark.tasks.map((t) => evaluatePracticalTask(t)),
    [
      activeBenchmark.tasks,
      copyStateById,
      folderStateById,
      formatStateById,
      replaceStateById,
      sheetStateById,
    ],
  );

  const gradeCompetencySpecs = useMemo(
    () => getGradeCompetencyChecklist(activeBenchmark.classLevel),
    [activeBenchmark.classLevel],
  );

  const liveCompetencyChecklist = useMemo<ComputerSkillChecklistItem[]>(
    () =>
      gradeCompetencySpecs.map((spec) => ({
        id: spec.id,
        label: spec.label,
        completed: Boolean(competencyChecks[spec.id]),
        autoVerified: false,
        category: 'competency_check',
      })),
    [gradeCompetencySpecs, competencyChecks],
  );

  const allChecklistItems = useMemo(
    () => [
      ...livePracticalResults.flatMap((r) => r.checklistItems || []),
      ...liveCompetencyChecklist,
    ],
    [livePracticalResults, liveCompetencyChecklist],
  );

  const completedChecklistCount = allChecklistItems.filter((c) => c.completed).length;
  const checklistCompletionPct = computeChecklistCompletionPct(allChecklistItems);

  const passedPracticalCount = livePracticalResults.filter((r) => r.passed).length;

  // ============================================================================
  // TASK INTERACTION HANDLERS
  // ============================================================================
  async function handleCopySource(taskId: string, sourceText: string) {
    setInAppClipboard(sourceText);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(sourceText);
      }
    } catch {
      // Sandboxed iframe clipboard fallback already stored in inAppClipboard
    }
    setCopyStateById((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || { copiedFromSource: false, pastedViaClipboard: false, value: '' }),
        copiedFromSource: true,
      },
    }));
  }

  async function handlePasteButton(taskId: string) {
    let text = inAppClipboard;
    if (!text) {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          text = await navigator.clipboard.readText();
        }
      } catch {
        // ignore
      }
    }
    if (!text) return;
    setCopyStateById((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || { copiedFromSource: false, pastedViaClipboard: false, value: '' }),
        pastedViaClipboard: true,
        value: text,
      },
    }));
  }

  function handleCreateFolder(taskId: string) {
    setFolderStateById((prev) => {
      const cur = prev[taskId];
      if (!cur) return prev;
      const name = cur.newFolderInput.trim();
      if (!name) return prev;
      if (cur.folders.some((f) => f.toLowerCase() === name.toLowerCase())) {
        return { ...prev, [taskId]: { ...cur, newFolderInput: '' } };
      }
      return {
        ...prev,
        [taskId]: {
          ...cur,
          folders: [...cur.folders, name],
          newFolderInput: '',
        },
      };
    });
  }

  function handleMoveFile(taskId: string, fileId: string, destFolder: string) {
    if (!destFolder) return;
    setFolderStateById((prev) => {
      const cur = prev[taskId];
      if (!cur) return prev;
      return {
        ...prev,
        [taskId]: {
          ...cur,
          files: cur.files.map((f) => (f.id === fileId ? { ...f, folder: destFolder } : f)),
          moveTargetByFile: { ...cur.moveTargetByFile, [fileId]: destFolder },
        },
      };
    });
  }

  function handleSaveRename(taskId: string, fileId: string) {
    setFolderStateById((prev) => {
      const cur = prev[taskId];
      if (!cur) return prev;
      const nextName = cur.renameInput.trim();
      if (!nextName) return prev;
      return {
        ...prev,
        [taskId]: {
          ...cur,
          files: cur.files.map((f) => (f.id === fileId ? { ...f, name: nextName } : f)),
          renamingFileId: null,
          renameInput: '',
        },
      };
    });
  }

  function handleReplaceAll(taskId: string) {
    setReplaceStateById((prev) => {
      const cur = prev[taskId];
      if (!cur) return prev;
      const find = cur.findInput.trim();
      if (!find) return prev;
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      const matches = cur.text.match(regex);
      const count = matches ? matches.length : 0;
      const updated = cur.text.replace(regex, cur.replaceInput);
      return {
        ...prev,
        [taskId]: {
          ...cur,
          text: updated,
          replaceCount: cur.replaceCount + count,
        },
      };
    });
  }

  // ============================================================================
  // SUBMIT FULL COMPUTER SKILL ATTEMPT
  // ============================================================================
  async function handleSubmitAttempt() {
    if (!selectedStudent) {
      setSubmitError('Select a student before submitting the Computer Skill Test.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const elapsed =
      typingElapsedSec > 0
        ? typingElapsedSec
        : typingStartRef.current
          ? Math.max(5, Math.round((Date.now() - typingStartRef.current) / 1000))
          : activeBenchmark.typingDurationSec;

    try {
      const res = await apiRequest<{ attempt: ComputerSkillAttempt }>(
        '/api/computer-skills/attempts',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            classLevel: selectedClass,
            typedText,
            typingElapsedSec: Math.max(5, elapsed),
            practicalResults: livePracticalResults,
            competencyChecklist: liveCompetencyChecklist,
          }),
        },
        token,
      );
      setLatestScorecard(res.attempt);
      setTypingRunning(false);
      setTypingFinished(true);
      await onRefresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to save Computer Skill Test.');
    } finally {
      setSubmitting(false);
    }
  }

  // ============================================================================
  // BENCHMARK INLINE EDITOR (STAFF ONLY)
  // ============================================================================
  function startEditBenchmark(bench: ComputerSkillBenchmark) {
    setEditingClass(bench.classLevel);
    setEditWpm(bench.targetWpm);
    setEditAcc(bench.targetAccuracyPct);
    setEditDuration(bench.typingDurationSec);
    setEditPassage(bench.typingPassage);
    setBenchFeedback(null);
  }

  async function saveBenchmarkEdit() {
    if (!editingClass) return;
    setSavingBench(true);
    setBenchFeedback(null);
    try {
      await apiRequest(
        '/api/computer-skills/benchmarks',
        {
          method: 'PUT',
          body: JSON.stringify({
            classLevel: editingClass,
            targetWpm: editWpm,
            targetAccuracyPct: editAcc,
            typingDurationSec: editDuration,
            typingPassage: editPassage,
          }),
        },
        token,
      );
      setBenchFeedback(`Class ${editingClass} benchmark updated to ${editWpm} WPM / ${editAcc}% accuracy.`);
      setEditingClass(null);
      await onRefresh();
    } catch (err) {
      setBenchFeedback(err instanceof Error ? err.message : 'Failed to update benchmark.');
    } finally {
      setSavingBench(false);
    }
  }

  // ============================================================================
  // ANALYTICS METRICS
  // ============================================================================
  const attempts = data.computerSkillAttempts || [];
  const filteredAttempts = useMemo(() => {
    if (analyticsClassFilter === 'all') return attempts;
    const cls = Number(analyticsClassFilter);
    return attempts.filter((a) => a.classLevel === cls);
  }, [attempts, analyticsClassFilter]);

  const analyticsSummary = useMemo(() => {
    const total = filteredAttempts.length;
    if (total === 0) {
      return { total: 0, passRate: 0, avgWpm: 0, avgPractical: 0 };
    }
    const passed = filteredAttempts.filter((a) => a.benchmarkPassed).length;
    const avgWpm = Math.round(
      filteredAttempts.reduce((s, a) => s + a.netWpm, 0) / total,
    );
    const avgPractical = Math.round(
      filteredAttempts.reduce((s, a) => s + a.practicalScore, 0) / total,
    );
    return {
      total,
      passRate: Math.round((passed / total) * 100),
      avgWpm,
      avgPractical,
    };
  }, [filteredAttempts]);

  const remainingSec = Math.max(0, activeBenchmark.typingDurationSec - typingElapsedSec);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900">
              <Keyboard className="h-4 w-4" />
              <span>Classes 1 to 12 · Digital Literacy & Practical Lab</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Computer Skill Test & Typing Benchmarks
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Class-calibrated typing speed benchmarks (8 WPM in Class 1 to 50 WPM in Class 12)
              paired with hands-on practical labs for Copy & Paste, Folder & File Management,
              Document Formatting, Find & Replace, and Live Spreadsheet Formulas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isStaff && data.students.length > 0 && (
              <label className="flex flex-col text-xs font-semibold text-slate-600">
                <span className="mb-1">Student</span>
                <select
                  aria-label="Select student for computer skill test"
                  value={selectedStudent?.id ?? ''}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const st = data.students.find((s) => s.id === e.target.value);
                    if (st) setSelectedClass(extractClassNumber(st.classSection));
                  }}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900"
                >
                  {data.students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.classSection})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="flex flex-col text-xs font-semibold text-slate-600">
              <span className="mb-1">Class Level (1–12)</span>
              <select
                aria-label="Select class level"
                value={selectedClass}
                onChange={(e) =>
                  setSelectedClass(Number(e.target.value) as SchoolClassNumber)
                }
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900"
              >
                {CLASS_NUMBERS.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls} ({benchmarks[cls - 1]?.targetWpm ?? 20} WPM Target)
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Single-line Sub-tabs */}
        <div className="mt-5 flex items-center gap-2 border-t border-slate-200 pt-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubTab('test')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              subTab === 'test'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>Take Skill Test</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('benchmarks')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              subTab === 'benchmarks'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Class 1–12 Benchmarks &amp; Checklists</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('analytics')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              subTab === 'analytics'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Results & Analytics ({attempts.length})</span>
          </button>
          {isStaff && (
            <button
              type="button"
              onClick={() => setSubTab('leaderboard')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                subTab === 'leaderboard'
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Monthly Class Growth Leaderboard</span>
            </button>
          )}
        </div>
      </div>

      {subTab === 'leaderboard' && isStaff && (
        <SkillMonthlyGrowthLeaderboard
          data={data}
          skillKey="computer_skills"
          defaultClassSection={selectedStudent?.classSection}
          onInspectStudent={(sid) => {
            setSelectedStudentId(sid);
            setSubTab('analytics');
          }}
        />
      )}

      {/* =====================================================================
          SUB-TAB 1: TAKE SKILL TEST (TYPING BENCHMARK + PRACTICAL LAB)
      ===================================================================== */}
      {subTab === 'test' && (
        <div className="space-y-6">
          {/* Live Scorecard after Submission */}
          {latestScorecard && (
            <div className="rounded-xl border-2 border-blue-900/20 bg-white p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-900 text-white">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                      Computer Skill Assessment Scorecard
                    </p>
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      {latestScorecard.studentName} · Class {latestScorecard.classLevel}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${gradeBadgeClasses(
                      latestScorecard.grade,
                    )}`}
                  >
                    Grade: {latestScorecard.grade}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLatestScorecard(null);
                      initializeLabForBenchmark(activeBenchmark);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Retake Test</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-xs font-medium text-slate-500">Overall Score</p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
                    {latestScorecard.overallScore}%
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {latestScorecard.benchmarkPassed ? 'Benchmark Passed' : 'Needs More Practice'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-xs font-medium text-slate-500">Typing Net WPM</p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
                    {latestScorecard.netWpm}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      / {latestScorecard.targetWpm} target
                    </span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Gross: {latestScorecard.grossWpm} WPM
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-xs font-medium text-slate-500">Typing Accuracy</p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
                    {latestScorecard.accuracyPct}%{' '}
                    <span className="text-xs font-normal text-slate-500">
                      / {latestScorecard.targetAccuracyPct}%
                    </span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {latestScorecard.errorCount} character error(s)
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-xs font-medium text-slate-500">Practical Lab &amp; Checklist</p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
                    {latestScorecard.practicalScore}%
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {latestScorecard.practicalResults.filter((r) => r.passed).length}/
                    {latestScorecard.practicalResults.length} tasks passed
                    {latestScorecard.checklistCompletionPct !== undefined
                      ? ` · ${latestScorecard.checklistCompletionPct}% checklist`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {latestScorecard.practicalResults.map((res) => (
                  <div
                    key={res.taskId}
                    className={`rounded-lg border p-3 ${
                      res.passed
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-amber-200 bg-amber-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{res.title}</span>
                      <span className="font-mono text-xs font-semibold tabular-nums text-slate-700">
                        {res.score}/{res.maxScore}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{res.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Class Benchmark Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">Selected Tier</p>
              <p className="mt-1 font-display text-base font-bold text-slate-900">
                {activeBenchmark.tierLabel}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {selectedStudent ? `${selectedStudent.name} · ${selectedStudent.classSection}` : 'Practice Mode'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">Typing Speed Benchmark</p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-blue-900">
                {activeBenchmark.targetWpm} WPM
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Min accuracy {activeBenchmark.targetAccuracyPct}% · {activeBenchmark.typingDurationSec}s
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">Live Typing Score</p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900">
                {typingEval.netWpm} WPM · {typingEval.accuracyPct}%
              </p>
              <p
                className={`mt-0.5 text-xs font-semibold ${
                  typingEval.benchmarkMet ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {typingEval.benchmarkMet
                  ? 'Benchmark Met'
                  : `Target: ${activeBenchmark.targetWpm} WPM @ ${activeBenchmark.targetAccuracyPct}%`}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">Practical Task Checklist</p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900">
                {completedChecklistCount} / {allChecklistItems.length} Steps ({checklistCompletionPct}%)
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {passedPracticalCount} / {activeBenchmark.tasks.length} simulated tasks verified
              </p>
            </div>
          </div>

          {/* PART 1: TYPING SPEED BENCHMARK TEST */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                  Part 1 of 2 · Typing Speed & Accuracy Benchmark
                </p>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {activeBenchmark.classLabel} Touch Typing Test ({activeBenchmark.targetWpm} WPM /{' '}
                  {activeBenchmark.targetAccuracyPct}% Accuracy)
                </h2>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-bold tabular-nums text-slate-900">
                  <Clock className="h-3.5 w-3.5 text-blue-900" />
                  <span>{remainingSec}s left</span>
                </div>
                {!typingFinished && typedText.length > 0 && (
                  <button
                    type="button"
                    onClick={handleFinishTypingNow}
                    className="rounded-lg border border-blue-900 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100"
                  >
                    Finish Typing
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetTyping}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Target Passage with live character coloring */}
            <div
              aria-label="Reference typing passage"
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed select-none"
            >
              {activeBenchmark.typingPassage.split('').map((ch, idx) => {
                let cls = 'text-slate-500';
                if (idx < typedText.length) {
                  cls =
                    typedText[idx] === ch
                      ? 'text-emerald-800 bg-emerald-100/70'
                      : 'text-rose-800 bg-rose-100 underline';
                } else if (idx === typedText.length && !typingFinished) {
                  cls = 'text-slate-900 bg-blue-200/70 border-b-2 border-blue-900';
                }
                return (
                  <span key={idx} className={cls}>
                    {ch}
                  </span>
                );
              })}
            </div>

            <textarea
              aria-label="Typing test input"
              rows={3}
              value={typedText}
              disabled={typingFinished}
              onPaste={(e) => e.preventDefault()}
              onChange={(e) => handleTypingChange(e.target.value)}
              placeholder="Start typing the passage above — the timer begins automatically on your first keystroke (paste disabled to measure real WPM)..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3.5 font-mono text-sm text-slate-900 focus:border-blue-900 focus:outline-none disabled:bg-slate-100"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums">
                <span>
                  Net WPM: <strong className="text-slate-900">{typingEval.netWpm}</strong>
                </span>
                <span>
                  Gross WPM: <strong className="text-slate-900">{typingEval.grossWpm}</strong>
                </span>
                <span>
                  Accuracy: <strong className="text-slate-900">{typingEval.accuracyPct}%</strong>
                </span>
                <span>
                  Errors: <strong className="text-rose-700">{typingEval.errorCount}</strong>
                </span>
                <span>
                  Progress: <strong className="text-slate-900">{typingEval.completionPct}%</strong>
                </span>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {typingFinished
                  ? 'Typing segment locked. Continue to Practical Skill Lab below.'
                  : typingRunning
                    ? 'Timer running...'
                    : 'Ready — begin typing when set.'}
              </span>
            </div>
          </section>

          {/* PART 2: PRACTICAL SKILL IMPLEMENTATION LAB */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                  Part 2 of 2 · Hands-On Practical Skill Lab ({activeBenchmark.classLabel})
                </p>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Practical Implementation Tasks ({passedPracticalCount}/{activeBenchmark.tasks.length}{' '}
                  Verified)
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Complete each interactive exercise below before submitting the assessment.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {activeBenchmark.tasks.map((task, idx) => {
                const liveRes = livePracticalResults[idx];
                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border bg-white p-5 space-y-4 ${
                      liveRes?.passed ? 'border-emerald-300' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold uppercase text-blue-900">
                            Task {idx + 1} · {task.points} pts
                          </span>
                          <span className="text-slate-300">|</span>
                          <h3 className="font-display text-base font-bold text-slate-900">
                            {task.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600">{task.instruction}</p>
                      </div>

                      <div className="shrink-0">
                        {liveRes?.passed ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Verified ({liveRes.score}/{liveRes.maxScore})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                            <span>In Progress ({liveRes?.score ?? 0}/{task.points})</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TASK KIND A: COPY & PASTE */}
                    {task.kind === 'copy_paste' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-600">
                              Source Text
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleCopySource(task.id, task.sourceText || '')}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                            >
                              <ClipboardCopy className="h-3.5 w-3.5" />
                              <span>Copy Text</span>
                            </button>
                          </div>
                          <div
                            onCopy={() =>
                              setCopyStateById((prev) => ({
                                ...prev,
                                [task.id]: {
                                  ...(prev[task.id] || {
                                    copiedFromSource: false,
                                    pastedViaClipboard: false,
                                    value: '',
                                  }),
                                  copiedFromSource: true,
                                },
                              }))
                            }
                            className="rounded-md border border-slate-200 bg-white p-3 font-mono text-xs text-slate-900 select-all"
                          >
                            {task.sourceText}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Click <strong>Copy Text</strong> (or select text and press Ctrl+C /
                            Cmd+C).
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <label
                              htmlFor={`paste-${task.id}`}
                              className="text-xs font-semibold text-slate-700"
                            >
                              {task.targetPrompt || 'Paste copied text here:'}
                            </label>
                            <button
                              type="button"
                              onClick={() => void handlePasteButton(task.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                            >
                              <ClipboardPaste className="h-3.5 w-3.5" />
                              <span>Paste Text</span>
                            </button>
                          </div>
                          <input
                            id={`paste-${task.id}`}
                            type="text"
                            value={copyStateById[task.id]?.value || ''}
                            onPaste={(e) => {
                              const pasted = e.clipboardData?.getData('text') || '';
                              if (pasted) {
                                e.preventDefault();
                                setCopyStateById((prev) => ({
                                  ...prev,
                                  [task.id]: {
                                    ...(prev[task.id] || {
                                      copiedFromSource: false,
                                      pastedViaClipboard: false,
                                      value: '',
                                    }),
                                    pastedViaClipboard: true,
                                    value: pasted,
                                  },
                                }));
                              }
                            }}
                            onChange={(e) =>
                              setCopyStateById((prev) => ({
                                ...prev,
                                [task.id]: {
                                  ...(prev[task.id] || {
                                    copiedFromSource: false,
                                    pastedViaClipboard: false,
                                    value: '',
                                  }),
                                  value: e.target.value,
                                },
                              }))
                            }
                            placeholder="Paste copied content here..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-900 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-500">{liveRes?.detail}</p>
                        </div>
                      </div>
                    )}

                    {/* TASK KIND B: FOLDER & FILE MANAGEMENT */}
                    {task.kind === 'folder_management' && folderStateById[task.id] && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                          {/* Left: Folders Tree + New Folder Creator */}
                          <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700">
                                Directories (Drop files here)
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFolderStateById((prev) => ({
                                    ...prev,
                                    [task.id]: { ...prev[task.id], selectedFolder: 'ALL' },
                                  }))
                                }
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                  folderStateById[task.id].selectedFolder === 'ALL'
                                    ? 'bg-blue-900 text-white'
                                    : 'text-blue-900 hover:bg-blue-50'
                                }`}
                              >
                                Show All Files
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {folderStateById[task.id].folders.map((folderName) => {
                                const count = folderStateById[task.id].files.filter(
                                  (f) => f.folder === folderName,
                                ).length;
                                const isSelected =
                                  folderStateById[task.id].selectedFolder === folderName;
                                return (
                                  <button
                                    key={folderName}
                                    type="button"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      if (draggedFileId) {
                                        handleMoveFile(task.id, draggedFileId, folderName);
                                        setDraggedFileId(null);
                                      }
                                    }}
                                    onClick={() =>
                                      setFolderStateById((prev) => ({
                                        ...prev,
                                        [task.id]: {
                                          ...prev[task.id],
                                          selectedFolder: folderName,
                                        },
                                      }))
                                    }
                                    className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                                      isSelected
                                        ? 'border-blue-900 bg-blue-900 text-white'
                                        : 'border-slate-200 bg-white text-slate-800 hover:border-blue-400'
                                    }`}
                                  >
                                    <span className="inline-flex items-center gap-2">
                                      <Folder className="h-3.5 w-3.5" />
                                      <span>{folderName}</span>
                                    </span>
                                    <span className="font-mono text-[11px] tabular-nums opacity-80">
                                      {count} file{count === 1 ? '' : 's'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* New Folder input */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                              <input
                                type="text"
                                aria-label="New folder name"
                                value={folderStateById[task.id].newFolderInput}
                                onChange={(e) =>
                                  setFolderStateById((prev) => ({
                                    ...prev,
                                    [task.id]: {
                                      ...prev[task.id],
                                      newFolderInput: e.target.value,
                                    },
                                  }))
                                }
                                placeholder={
                                  task.requiredNewFolder
                                    ? `New folder (e.g., ${task.requiredNewFolder})`
                                    : 'New folder name...'
                                }
                                className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                              />
                              <button
                                type="button"
                                onClick={() => handleCreateFolder(task.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
                              >
                                <FolderPlus className="h-3.5 w-3.5" />
                                <span>Create Folder</span>
                              </button>
                            </div>
                          </div>

                          {/* Right: Files List with Move + Rename + Drag support */}
                          <div className="lg:col-span-7 rounded-lg border border-slate-200 bg-white p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700">
                                Files (
                                {folderStateById[task.id].selectedFolder === 'ALL'
                                  ? 'All Folders'
                                  : folderStateById[task.id].selectedFolder}
                                )
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Drag a file onto a folder or use Move To
                              </span>
                            </div>

                            <div className="space-y-2">
                              {folderStateById[task.id].files
                                .filter(
                                  (f) =>
                                    folderStateById[task.id].selectedFolder === 'ALL' ||
                                    f.folder === folderStateById[task.id].selectedFolder,
                                )
                                .map((file) => {
                                  const isRenaming =
                                    folderStateById[task.id].renamingFileId === file.id;
                                  const destChoice =
                                    folderStateById[task.id].moveTargetByFile[file.id] ||
                                    file.folder;
                                  return (
                                    <div
                                      key={file.id}
                                      draggable
                                      onDragStart={() => setDraggedFileId(file.id)}
                                      className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5"
                                    >
                                      <div className="min-w-0">
                                        {isRenaming ? (
                                          <div className="flex items-center gap-1.5">
                                            <input
                                              type="text"
                                              aria-label={`Rename ${file.name}`}
                                              value={folderStateById[task.id].renameInput}
                                              onChange={(e) =>
                                                setFolderStateById((prev) => ({
                                                  ...prev,
                                                  [task.id]: {
                                                    ...prev[task.id],
                                                    renameInput: e.target.value,
                                                  },
                                                }))
                                              }
                                              className="rounded border border-blue-900 bg-white px-2 py-1 font-mono text-xs text-slate-900"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleSaveRename(task.id, file.id)}
                                              className="rounded bg-blue-900 px-2.5 py-1 text-xs font-semibold text-white"
                                            >
                                              Save Name
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-900 shrink-0" />
                                            <span className="font-mono text-xs font-bold text-slate-900 truncate">
                                              {file.name}
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                              in <strong>{file.folder}</strong>
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                        <select
                                          aria-label={`Destination folder for ${file.name}`}
                                          value={destChoice}
                                          onChange={(e) =>
                                            setFolderStateById((prev) => ({
                                              ...prev,
                                              [task.id]: {
                                                ...prev[task.id],
                                                moveTargetByFile: {
                                                  ...prev[task.id].moveTargetByFile,
                                                  [file.id]: e.target.value,
                                                },
                                              },
                                            }))
                                          }
                                          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                                        >
                                          {folderStateById[task.id].folders.map((fn) => (
                                            <option key={fn} value={fn}>
                                              {fn}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleMoveFile(task.id, file.id, destChoice)
                                          }
                                          className="rounded bg-blue-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-800"
                                        >
                                          Move
                                        </button>
                                        {!isRenaming && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setFolderStateById((prev) => ({
                                                ...prev,
                                                [task.id]: {
                                                  ...prev[task.id],
                                                  renamingFileId: file.id,
                                                  renameInput: file.name,
                                                },
                                              }))
                                            }
                                            className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                          >
                                            <Pencil className="h-3 w-3" />
                                            <span>Rename</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">{liveRes?.detail}</p>
                      </div>
                    )}

                    {/* TASK KIND C: TEXT FORMATTING & SAVE (CLASSES 1-3) */}
                    {task.kind === 'text_format_save' && formatStateById[task.id] && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setFormatStateById((prev) => ({
                                  ...prev,
                                  [task.id]: {
                                    ...prev[task.id],
                                    isBold: !prev[task.id].isBold,
                                  },
                                }))
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                                formatStateById[task.id].isBold
                                  ? 'border-blue-900 bg-blue-900 text-white'
                                  : 'border-slate-300 bg-white text-slate-700'
                              }`}
                            >
                              <Bold className="h-3.5 w-3.5" />
                              <span>Bold</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormatStateById((prev) => ({
                                  ...prev,
                                  [task.id]: {
                                    ...prev[task.id],
                                    isUnderline: !prev[task.id].isUnderline,
                                  },
                                }))
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                                formatStateById[task.id].isUnderline
                                  ? 'border-blue-900 bg-blue-900 text-white'
                                  : 'border-slate-300 bg-white text-slate-700'
                              }`}
                            >
                              <Underline className="h-3.5 w-3.5" />
                              <span>Underline</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              aria-label="Save document filename"
                              value={formatStateById[task.id].fileName}
                              onChange={(e) =>
                                setFormatStateById((prev) => ({
                                  ...prev,
                                  [task.id]: {
                                    ...prev[task.id],
                                    fileName: e.target.value,
                                    saved: false,
                                  },
                                }))
                              }
                              placeholder={`Save as (${task.requiredFileName})`}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormatStateById((prev) => ({
                                  ...prev,
                                  [task.id]: { ...prev[task.id], saved: true },
                                }))
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>Save File</span>
                            </button>
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                          <p
                            className={`text-base text-slate-900 ${
                              formatStateById[task.id].isBold ? 'font-bold' : 'font-normal'
                            } ${formatStateById[task.id].isUnderline ? 'underline' : ''}`}
                          >
                            {task.sampleDocument}
                          </p>
                        </div>
                        <p className="text-xs text-slate-600">{liveRes?.detail}</p>
                      </div>
                    )}

                    {/* TASK KIND D: FIND & REPLACE (CLASSES 4-6) */}
                    {task.kind === 'find_replace_list' && replaceStateById[task.id] && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5">
                            <Search className="h-3.5 w-3.5 text-slate-400" />
                            <input
                              type="text"
                              aria-label="Find word"
                              value={replaceStateById[task.id].findInput}
                              onChange={(e) =>
                                setReplaceStateById((prev) => ({
                                  ...prev,
                                  [task.id]: { ...prev[task.id], findInput: e.target.value },
                                }))
                              }
                              placeholder={`Find (${task.findWord})`}
                              className="w-32 text-xs text-slate-900 focus:outline-none"
                            />
                          </div>
                          <input
                            type="text"
                            aria-label="Replace with word"
                            value={replaceStateById[task.id].replaceInput}
                            onChange={(e) =>
                              setReplaceStateById((prev) => ({
                                ...prev,
                                [task.id]: { ...prev[task.id], replaceInput: e.target.value },
                              }))
                            }
                            placeholder={`Replace with (${task.replaceWord})`}
                            className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleReplaceAll(task.id)}
                            className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                          >
                            Replace All
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReplaceStateById((prev) => ({
                                ...prev,
                                [task.id]: {
                                  text: task.draftParagraph || '',
                                  findInput: '',
                                  replaceInput: '',
                                  replaceCount: 0,
                                },
                              }))
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Reset Draft
                          </button>
                        </div>

                        <textarea
                          aria-label="Document draft for find and replace"
                          rows={2}
                          value={replaceStateById[task.id].text}
                          onChange={(e) =>
                            setReplaceStateById((prev) => ({
                              ...prev,
                              [task.id]: { ...prev[task.id], text: e.target.value },
                            }))
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900"
                        />
                        <p className="text-xs text-slate-600">{liveRes?.detail}</p>
                      </div>
                    )}

                    {/* TASK KIND E: LIVE MINI-SPREADSHEET FORMULA (CLASSES 7-12) */}
                    {task.kind === 'spreadsheet_formula' && sheetStateById[task.id] && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6 overflow-hidden rounded-lg border border-slate-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-700 font-semibold">
                              <tr>
                                {(task.sheetHeaders || ['Item', 'Value (Col B)']).map((h) => (
                                  <th key={h} className="px-3 py-2 border-b border-slate-200">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {(task.sheetRows || []).map((row) => (
                                <tr key={row.label}>
                                  <td className="px-3 py-2 font-medium text-slate-700">
                                    {row.label}
                                  </td>
                                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-900">
                                    {row.values[0]}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="md:col-span-6 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <FileSpreadsheet className="h-4 w-4 text-blue-900" />
                            <span>{task.formulaPrompt || 'Enter Spreadsheet Formula:'}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
                            <span className="font-mono text-xs font-bold text-blue-900">fx</span>
                            <input
                              type="text"
                              aria-label="Spreadsheet formula input"
                              value={sheetStateById[task.id].formula}
                              onChange={(e) =>
                                setSheetStateById((prev) => ({
                                  ...prev,
                                  [task.id]: { formula: e.target.value },
                                }))
                              }
                              placeholder={`e.g. =${task.requiredFormulaKeyword || 'SUM'}(B1:B${
                                (task.sheetRows || []).length
                              })`}
                              className="flex-1 font-mono text-xs text-slate-900 focus:outline-none"
                            />
                          </div>
                          {(() => {
                            const vals = (task.sheetRows || []).map((r) => r.values[0] ?? 0);
                            const out = evaluateMiniSheetFormula(
                              sheetStateById[task.id].formula,
                              vals,
                            );
                            return (
                              <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs">
                                {sheetStateById[task.id].formula.trim() === '' ? (
                                  <span className="text-slate-500">
                                    Type a formula starting with <code>=</code> to evaluate live.
                                  </span>
                                ) : out.valid ? (
                                  <span className="font-mono font-bold text-emerald-700">
                                    Evaluated Output: {out.result} ({out.keyword})
                                  </span>
                                ) : (
                                  <span className="text-rose-700">{out.error}</span>
                                )}
                              </div>
                            );
                          })()}
                          <p className="text-[11px] text-slate-600">{liveRes?.detail}</p>
                        </div>
                      </div>
                    )}

                    {/* LIVE STEP-BY-STEP SIMULATED TASK CHECKLIST */}
                    {liveRes?.checklistItems && liveRes.checklistItems.length > 0 && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            <ListChecks className="h-3.5 w-3.5 text-blue-900" />
                            <span>
                              Auto-Verified Task Checklist ({liveRes.checklistItems.filter((c) => c.completed).length}/
                              {liveRes.checklistItems.length})
                            </span>
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Updates live as you perform actions above
                          </span>
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {liveRes.checklistItems.map((step) => (
                            <li
                              key={step.id}
                              className={`flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs ${
                                step.completed
                                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              {step.completed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-0.5" />
                              )}
                              <span>{step.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* GRADE-TAILORED DIGITAL COMPETENCY CHECKLIST (CLASSES 1-12) */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900">
                    <CheckSquare className="h-4 w-4" />
                    <span>{activeBenchmark.classLabel} Practical Competency Checklist</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Grade-Level Lab Habits &amp; Verification Rubric ({activeBenchmark.tierLabel})
                  </h3>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-900 transition-all"
                      style={{ width: `${checklistCompletionPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums text-slate-900">
                    {completedChecklistCount}/{allChecklistItems.length} ({checklistCompletionPct}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {gradeCompetencySpecs.map((spec) => {
                  const checked = Boolean(competencyChecks[spec.id]);
                  return (
                    <label
                      key={spec.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        checked
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/50 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setCompetencyChecks((prev) => ({
                            ...prev,
                            [spec.id]: e.target.checked,
                          }))
                        }
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                      />
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                          {spec.skillArea}
                        </p>
                        <p className="text-xs text-slate-800">{spec.label}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit Bar */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900">
                  Ready to submit {activeBenchmark.classLabel} Computer Skill Assessment?
                </p>
                <p className="text-xs text-slate-600">
                  Typing: {typingEval.netWpm} WPM ({typingEval.accuracyPct}% acc) · Practical Lab:{' '}
                  {passedPracticalCount}/{activeBenchmark.tasks.length} tasks verified · Checklist:{' '}
                  {completedChecklistCount}/{allChecklistItems.length} steps ({checklistCompletionPct}%).
                </p>
                {submitError && <p className="text-xs font-semibold text-rose-700">{submitError}</p>}
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSubmitAttempt()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Submitting Scorecard...' : 'Submit Computer Skill Test'}</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 2: CLASS 1 TO CLASS 12 BENCHMARKS TABLE & EDITOR
      ===================================================================== */}
      {subTab === 'benchmarks' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Progressive Computer Skill Curriculum (Class 1 to Class 12)
              </h2>
              <p className="text-xs text-slate-600">
                Standardised typing speed (WPM), accuracy targets, and hands-on practical lab
                milestones across every grade level.
              </p>
            </div>
            {benchFeedback && (
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                {benchFeedback}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 whitespace-nowrap">Class</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Tier</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Target WPM</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Accuracy</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Duration</th>
                  <th className="px-3 py-2.5">Practical Lab Competencies</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {benchmarks.map((b) => {
                  const isEditing = editingClass === b.classLevel;
                  const isExpanded = expandedChecklistClass === b.classLevel;
                  const gradeComp = getGradeCompetencyChecklist(b.classLevel);
                  return (
                    <React.Fragment key={b.classLevel}>
                      <tr className="hover:bg-slate-50/70">
                        <td className="px-3 py-3 font-bold text-slate-900 whitespace-nowrap">
                          {b.classLabel}
                        </td>
                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{b.tierLabel}</td>
                        <td className="px-3 py-3 font-mono font-bold tabular-nums text-blue-900 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="number"
                              min={5}
                              max={100}
                              aria-label={`Target WPM for Class ${b.classLevel}`}
                              value={editWpm}
                              onChange={(e) => setEditWpm(Number(e.target.value))}
                              className="w-20 rounded border border-blue-900 px-2 py-1 font-mono text-xs"
                            />
                          ) : (
                            `${b.targetWpm} WPM`
                          )}
                        </td>
                        <td className="px-3 py-3 font-mono tabular-nums text-slate-800 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="number"
                              min={60}
                              max={100}
                              aria-label={`Target accuracy for Class ${b.classLevel}`}
                              value={editAcc}
                              onChange={(e) => setEditAcc(Number(e.target.value))}
                              className="w-20 rounded border border-blue-900 px-2 py-1 font-mono text-xs"
                            />
                          ) : (
                            `${b.targetAccuracyPct}%`
                          )}
                        </td>
                        <td className="px-3 py-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="number"
                              min={30}
                              max={300}
                              aria-label={`Duration for Class ${b.classLevel}`}
                              value={editDuration}
                              onChange={(e) => setEditDuration(Number(e.target.value))}
                              className="w-20 rounded border border-blue-900 px-2 py-1 font-mono text-xs"
                            />
                          ) : (
                            `${b.typingDurationSec}s`
                          )}
                        </td>
                        <td className="px-3 py-3 text-slate-700 max-w-md">
                          <p>{b.practicalFocus}</p>
                          {isEditing && (
                            <textarea
                              rows={2}
                              aria-label={`Typing passage for Class ${b.classLevel}`}
                              value={editPassage}
                              onChange={(e) => setEditPassage(e.target.value)}
                              className="mt-2 w-full rounded border border-blue-900 p-2 font-mono text-xs"
                            />
                          )}
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          {isEditing ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={savingBench}
                                onClick={() => void saveBenchmarkEdit()}
                                className="rounded bg-blue-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-800"
                              >
                                {savingBench ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingClass(null)}
                                className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedChecklistClass(isExpanded ? null : b.classLevel)
                                }
                                className="inline-flex items-center gap-1 rounded border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                              >
                                <span>Checklist</span>
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedClass(b.classLevel);
                                  setSubTab('test');
                                }}
                                className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                              >
                                Launch Lab
                              </button>
                              {canEditBenchmarks && (
                                <button
                                  type="button"
                                  onClick={() => startEditBenchmark(b)}
                                  className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-900 hover:bg-blue-100"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={7} className="px-4 py-4 border-b border-slate-200">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                              <div className="lg:col-span-7 space-y-2.5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                                  {b.classLabel} Simulated Practical Tasks &amp; Auto-Verified Steps
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                  {b.tasks.map((t, ti) => (
                                    <div
                                      key={t.id}
                                      className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5"
                                    >
                                      <p className="text-xs font-bold text-slate-900">
                                        {ti + 1}. {t.title} ({t.points} pts)
                                      </p>
                                      <ul className="space-y-1 text-[11px] text-slate-600">
                                        {buildTaskChecklistSpec(t).map((st) => (
                                          <li key={st.id} className="flex items-start gap-1.5">
                                            <CheckCircle2 className="h-3 w-3 text-blue-900 shrink-0 mt-0.5" />
                                            <span>{st.label}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="lg:col-span-5 space-y-2.5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                                  {b.classLabel} Lab Competency Checklist ({b.tierLabel})
                                </p>
                                <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5">
                                  {gradeComp.map((c) => (
                                    <div
                                      key={c.id}
                                      className="flex items-start gap-2 text-[11px] text-slate-700"
                                    >
                                      <CheckSquare className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                                      <span>
                                        <strong className="text-slate-900">{c.skillArea}:</strong>{' '}
                                        {c.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 3: SCHOOL RESULTS & ANALYTICS
      ===================================================================== */}
      {subTab === 'analytics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">Total Skill Tests</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
                {analyticsSummary.total}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">Benchmark Pass Rate</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-emerald-700">
                {analyticsSummary.passRate}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">Average Net WPM</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-blue-900">
                {analyticsSummary.avgWpm} WPM
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">Average Practical Lab</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
                {analyticsSummary.avgPractical}%
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Student Computer Skill Attempt Ledger
                </h2>
                <p className="text-xs text-slate-600">
                  Typing speed vs class benchmark alongside practical lab pass/fail verification.
                </p>
              </div>
              <select
                aria-label="Filter attempts by class"
                value={analyticsClassFilter}
                onChange={(e) => setAnalyticsClassFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900"
              >
                <option value="all">All Classes (1–12)</option>
                {CLASS_NUMBERS.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>

            {filteredAttempts.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No Computer Skill Test attempts recorded for this filter yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Student</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">Class</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">Net WPM / Target</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">Accuracy</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">Practical Lab</th>
                      <th className="px-3 py-2.5">Tasks Breakdown</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">Overall & Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/70">
                        <td className="px-3 py-3">
                          <p className="font-bold text-slate-900">{att.studentName}</p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(att.submittedAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">
                          Class {att.classLevel}
                        </td>
                        <td className="px-3 py-3 font-mono tabular-nums whitespace-nowrap">
                          <span
                            className={
                              att.typingBenchmarkMet
                                ? 'font-bold text-emerald-700'
                                : 'font-bold text-amber-700'
                            }
                          >
                            {att.netWpm}
                          </span>{' '}
                          <span className="text-slate-500">/ {att.targetWpm} WPM</span>
                        </td>
                        <td className="px-3 py-3 font-mono tabular-nums whitespace-nowrap text-slate-800">
                          {att.accuracyPct}%{' '}
                          <span className="text-slate-400">({att.targetAccuracyPct}%)</span>
                        </td>
                        <td className="px-3 py-3 font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                          {att.practicalScore}%
                          {att.checklistCompletionPct !== undefined && (
                            <span className="block text-[11px] font-normal text-slate-500">
                              Checklist: {att.checklistCompletionPct}%
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {att.practicalResults.map((pr) => (
                              <span
                                key={pr.taskId}
                                className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${
                                  pr.passed
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : 'border-rose-200 bg-rose-50 text-rose-800'
                                }`}
                              >
                                {pr.passed ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                <span>{pr.title}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 mr-2">
                            {att.overallScore}%
                          </span>
                          <span
                            className={`rounded border px-2 py-0.5 text-[11px] font-bold ${gradeBadgeClasses(
                              att.grade,
                            )}`}
                          >
                            {att.grade}
                          </span>
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
    </div>
  );
};
