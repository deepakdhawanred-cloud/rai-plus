import React, { useEffect, useMemo, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  Clock,
  FileDown,
  Layers,
  Plus,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  OlqKey,
  PpdtPerceptionDetails,
  TatStoryStructure,
  ThinkingAssessmentSession,
  ThinkingDifficulty,
  ThinkingTestType,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { OLQ_DEFINITIONS } from '../../utils/evidenceEngine';
import { computeStudentThinkingComposite } from '../../utils/thinkingAssessmentEngine';

interface ThinkingTestsModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onOpenStudent?: (studentId: string) => void;
  initialSubTab?: ThinkingSubTab;
}

type ThinkingSubTab = 'take' | 'profile' | 'review' | 'bank';

const TEST_TYPES: Array<{ id: ThinkingTestType; label: string; shortDesc: string }> = [
  { id: 'SRT', label: 'SRT — Situation Reaction', shortDesc: 'Real-life scenarios · 10 behavioural dimensions' },
  { id: 'WAT', label: 'WAT — Word Association', shortDesc: 'Timed cue words · spontaneous thought patterns' },
  { id: 'TAT', label: 'TAT — Thematic Apperception', shortDesc: 'Visual scene storytelling · structured arc' },
  { id: 'PPDT', label: 'PPDT — Picture Perception & GD', shortDesc: 'Ambiguous sketch · individual + group discussion' },
];

const SceneIllustration: React.FC<{ sceneCode?: string; caption?: string }> = ({ sceneCode, caption }) => {
  if (sceneCode === 'tat_bridge_team') {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 space-y-2">
        <svg viewBox="0 0 420 180" className="w-full h-40 rounded bg-slate-200" role="img" aria-label={caption || 'Community bridge scene'}>
          <rect width="420" height="180" fill="#E2E8F0" />
          <path d="M0 130 Q105 110 210 130 T420 130 L420 180 L0 180 Z" fill="#94A3B8" opacity="0.6" />
          <rect x="75" y="102" width="270" height="12" rx="3" fill="#475569" />
          <line x1="95" y1="114" x2="95" y2="155" stroke="#334155" strokeWidth="6" />
          <line x1="325" y1="114" x2="325" y2="155" stroke="#334155" strokeWidth="6" />
          <circle cx="150" cy="78" r="10" fill="#1E293B" />
          <rect x="143" y="88" width="14" height="24" rx="4" fill="#334155" />
          <circle cx="190" cy="80" r="9" fill="#1E293B" />
          <rect x="184" y="89" width="12" height="22" rx="4" fill="#475569" />
          <circle cx="255" cy="76" r="10" fill="#1E293B" />
          <rect x="248" y="86" width="14" height="26" rx="4" fill="#1E293B" />
          <line x1="205" y1="104" x2="245" y2="92" stroke="#64748B" strokeWidth="4" />
        </svg>
        <p className="text-xs text-slate-600 italic">{caption}</p>
      </div>
    );
  }
  if (sceneCode === 'ppdt_courtyard') {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 space-y-2">
        <svg viewBox="0 0 420 180" className="w-full h-40 rounded bg-slate-200" role="img" aria-label={caption || 'Ambiguous courtyard scene'}>
          <rect width="420" height="180" fill="#CBD5E1" />
          <rect x="30" y="25" width="120" height="80" rx="4" fill="#94A3B8" opacity="0.65" />
          <line x1="45" y1="45" x2="130" y2="45" stroke="#475569" strokeWidth="3" opacity="0.6" />
          <line x1="45" y1="62" x2="115" y2="62" stroke="#475569" strokeWidth="3" opacity="0.5" />
          <circle cx="200" cy="76" r="11" fill="#334155" opacity="0.8" />
          <rect x="192" y="88" width="16" height="44" rx="6" fill="#334155" opacity="0.75" />
          <circle cx="242" cy="82" r="10" fill="#475569" opacity="0.75" />
          <rect x="235" y="93" width="14" height="39" rx="5" fill="#475569" opacity="0.7" />
          <circle cx="285" cy="79" r="10" fill="#334155" opacity="0.7" />
          <rect x="278" y="90" width="14" height="42" rx="5" fill="#334155" opacity="0.68" />
          <circle cx="332" cy="84" r="9" fill="#64748B" opacity="0.7" />
          <rect x="326" y="94" width="12" height="36" rx="5" fill="#64748B" opacity="0.65" />
          <line x1="208" y1="100" x2="265" y2="85" stroke="#1E293B" strokeWidth="3" opacity="0.5" />
        </svg>
        <p className="text-xs text-slate-600 italic">{caption || 'Ambiguous monochrome PPDT picture stimulus.'}</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 space-y-2">
      <svg viewBox="0 0 420 180" className="w-full h-40 rounded bg-slate-200" role="img" aria-label={caption || 'Study desk scene'}>
        <rect width="420" height="180" fill="#E2E8F0" />
        <rect x="260" y="20" width="125" height="90" rx="4" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
        <line x1="280" y1="30" x2="270" y2="100" stroke="#94A3B8" strokeWidth="2" />
        <line x1="315" y1="30" x2="305" y2="100" stroke="#94A3B8" strokeWidth="2" />
        <line x1="350" y1="30" x2="340" y2="100" stroke="#94A3B8" strokeWidth="2" />
        <rect x="45" y="118" width="240" height="14" rx="3" fill="#475569" />
        <circle cx="135" cy="72" r="14" fill="#1E293B" />
        <path d="M115 118 C115 92 155 92 155 118 Z" fill="#334155" />
        <rect x="172" y="102" width="54" height="16" rx="2" fill="#F8FAFC" stroke="#64748B" />
        <circle cx="88" cy="52" r="16" fill="#F8FAFC" stroke="#475569" strokeWidth="2" />
        <line x1="88" y1="52" x2="88" y2="42" stroke="#1E293B" strokeWidth="2" />
        <line x1="88" y1="52" x2="96" y2="54" stroke="#1E293B" strokeWidth="2" />
      </svg>
      <p className="text-xs text-slate-600 italic">{caption || 'Visual storytelling prompt scene.'}</p>
    </div>
  );
};

export const ThinkingTestsModule: React.FC<ThinkingTestsModuleProps> = ({
  data,
  token,
  onRefresh,
  onOpenStudent,
  initialSubTab,
}) => {
  const isStaff = ['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor', 'teacher'].includes(
    data.user.role,
  );
  const canManageBank = ['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor'].includes(
    data.user.role,
  );
  const isParent = data.user.role === 'parent';

  const questions = data.thinkingQuestionBank || [];
  const sessions = data.thinkingAssessments || [];
  const scoringConfig = data.thinkingScoringConfig;

  const [subTab, setSubTab] = useState<ThinkingSubTab>(
    initialSubTab ?? (isParent ? 'profile' : 'take'),
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const withSession = data.students.find((st) =>
      sessions.some((sess) => sess.studentId === st.id),
    );
    if (withSession) return withSession.id;
    const senior = data.students.find((st) => /^(9|10|11|12)\b/.test(st.classSection));
    return senior?.id || data.students[0]?.id || '';
  });

  // Assessment Studio State
  const [testType, setTestType] = useState<ThinkingTestType>('SRT');
  const [timedMode, setTimedMode] = useState(true);
  const [workflowMode, setWorkflowMode] = useState<'Individual' | 'Group'>('Individual');
  const [requestAiDraft, setRequestAiDraft] = useState(false);
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [promptStartTs, setPromptStartTs] = useState<number>(() => Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);

  const [draftResponses, setDraftResponses] = useState<
    Record<string, { text: string; timeMs: number }>
  >({});
  const [tatFields, setTatFields] = useState<TatStoryStructure>({
    protagonist: '',
    objective: '',
    challenges: '',
    actions: '',
    outcome: '',
  });
  const [ppdtFields, setPpdtFields] = useState<PpdtPerceptionDetails>({
    charactersCount: 4,
    approximateAges: '13-15 yrs',
    mood: 'Positive',
    centralSituation: '',
    narrationSummary: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Counsellor Review State
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || '');
  const [teacherObsDraft, setTeacherObsDraft] = useState('');
  const [counsellorRecDraft, setCounsellorRecDraft] = useState('');
  const [gdScores, setGdScores] = useState({
    groupTitle: 'School Leadership PPDT Group',
    communication: 7,
    cooperation: 8,
    initiative: 7,
    listening: 8,
    leadership: 7,
    evaluatorNotes: '',
  });
  const [reviewBusy, setReviewBusy] = useState(false);

  // Question Bank Creation State
  const [newQType, setNewQType] = useState<ThinkingTestType>('SRT');
  const [newQTitle, setNewQTitle] = useState('');
  const [newQPrompt, setNewQPrompt] = useState('');
  const [newQAgeBand, setNewQAgeBand] = useState('11-16 yrs');
  const [newQClassRange, setNewQClassRange] = useState('Classes 6-10');
  const [newQDiff, setNewQDiff] = useState<ThinkingDifficulty>('Intermediate');
  const [newQTime, setNewQTime] = useState(30);
  const [minCorroborationDraft, setMinCorroborationDraft] = useState(
    scoringConfig?.minCorroborationCount ?? 3,
  );
  const [bankBusy, setBankBusy] = useState(false);

  const activeQuestions = useMemo(
    () => questions.filter((q) => q.testType === testType),
    [questions, testType],
  );
  const currentQuestion = activeQuestions[activePromptIdx] || activeQuestions[0] || null;

  useEffect(() => {
    setActivePromptIdx(0);
    setPromptStartTs(Date.now());
    setElapsedSec(0);
  }, [testType]);

  useEffect(() => {
    if (subTab !== 'take' || !timedMode) return;
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - promptStartTs) / 1000));
    }, 500);
    return () => window.clearInterval(id);
  }, [subTab, timedMode, promptStartTs]);

  const effectiveStudentId =
    data.students.some((s) => s.id === selectedStudentId)
      ? selectedStudentId
      : data.students[0]?.id || '';
  const activeStudent = data.students.find((s) => s.id === effectiveStudentId) || null;

  const compositeProfile = useMemo(
    () => computeStudentThinkingComposite(effectiveStudentId, sessions),
    [effectiveStudentId, sessions],
  );

  const studentSessions = useMemo(
    () => sessions.filter((s) => s.studentId === effectiveStudentId),
    [sessions, effectiveStudentId],
  );

  const selectedSession: ThinkingAssessmentSession | null = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null,
    [sessions, selectedSessionId],
  );

  useEffect(() => {
    if (selectedSession) {
      setTeacherObsDraft(selectedSession.teacherObservation || '');
      setCounsellorRecDraft(selectedSession.counsellorRecommendation || '');
      if (selectedSession.ppdtGroupEval) {
        setGdScores({
          groupTitle: selectedSession.ppdtGroupEval.groupTitle,
          communication: selectedSession.ppdtGroupEval.communication,
          cooperation: selectedSession.ppdtGroupEval.cooperation,
          initiative: selectedSession.ppdtGroupEval.initiative,
          listening: selectedSession.ppdtGroupEval.listening,
          leadership: selectedSession.ppdtGroupEval.leadership,
          evaluatorNotes: selectedSession.ppdtGroupEval.evaluatorNotes,
        });
      }
    }
  }, [selectedSession?.id]);

  function handleDraftChange(qId: string, text: string) {
    const now = Date.now();
    const measuredMs = Math.max(1000, now - promptStartTs);
    setDraftResponses((prev) => ({
      ...prev,
      [qId]: { text, timeMs: measuredMs },
    }));
  }

  function movePrompt(nextIdx: number) {
    setActivePromptIdx(nextIdx);
    setPromptStartTs(Date.now());
    setElapsedSec(0);
  }

  async function handleSubmitAssessment(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setFeedbackMsg(null);
    if (!effectiveStudentId) {
      setErrorMsg('Please select a student before submitting.');
      return;
    }

    const responsesPayload = activeQuestions
      .map((q) => {
        const entry = draftResponses[q.id];
        if (!entry?.text?.trim()) return null;
        return {
          questionId: q.id,
          responseText: entry.text.trim(),
          responseTimeMs: entry.timeMs || 12000,
          tatStructure: testType === 'TAT' ? tatFields : undefined,
          ppdtPerception: testType === 'PPDT' ? ppdtFields : undefined,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    if (responsesPayload.length === 0) {
      setErrorMsg('Please complete at least one prompt response before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest<{ session: ThinkingAssessmentSession }>(
        '/api/thinking/sessions',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: effectiveStudentId,
            testType,
            workflowMode: testType === 'PPDT' ? workflowMode : 'Individual',
            timedMode,
            timeLimitSec: currentQuestion?.defaultTimeLimitSec || 30,
            requestAiDraft,
            responses: responsesPayload,
          }),
        },
        token,
      );
      setDraftResponses({});
      setTatFields({ protagonist: '', objective: '', challenges: '', actions: '', outcome: '' });
      setPpdtFields({
        charactersCount: 4,
        approximateAges: '13-15 yrs',
        mood: 'Positive',
        centralSituation: '',
        narrationSummary: '',
      });
      await onRefresh();
      setSelectedSessionId(res.session.id);
      setFeedbackMsg(
        `Submitted ${res.session.testType} for ${res.session.studentName} (${responsesPayload.length} response${responsesPayload.length > 1 ? 's' : ''}). 4 Thinking Level dimensions computed — ready for Counsellor review.`,
      );
      setSubTab('profile');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit thinking test.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveReview(opts: { generateAiDraft?: boolean; promoteToOlq?: boolean }) {
    if (!selectedSession) return;
    setReviewBusy(true);
    setErrorMsg(null);
    setFeedbackMsg(null);
    try {
      const res = await apiRequest<{
        session: ThinkingAssessmentSession;
        promotionResult?: { eligible: boolean; reason: string } | null;
      }>(
        `/api/thinking/sessions/${selectedSession.id}/review`,
        {
          method: 'POST',
          body: JSON.stringify({
            teacherObservation: teacherObsDraft,
            counsellorRecommendation: counsellorRecDraft,
            ppdtGroupEval:
              selectedSession.testType === 'PPDT'
                ? {
                    groupId: selectedSession.ppdtGroupEval?.groupId || `grp-${Date.now()}`,
                    ...gdScores,
                  }
                : undefined,
            generateAiDraft: Boolean(opts.generateAiDraft),
            promoteToOlq: Boolean(opts.promoteToOlq),
          }),
        },
        token,
      );
      await onRefresh();
      if (res.promotionResult) {
        setFeedbackMsg(res.promotionResult.reason);
      } else if (opts.generateAiDraft) {
        setFeedbackMsg('Generated draft non-diagnostic observation for counsellor review.');
      } else {
        setFeedbackMsg('Saved teacher & counsellor review successfully.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save review.');
    } finally {
      setReviewBusy(false);
    }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQTitle.trim() || !newQPrompt.trim()) {
      setErrorMsg('Question title and prompt text are required.');
      return;
    }
    setBankBusy(true);
    setErrorMsg(null);
    try {
      await apiRequest(
        '/api/thinking/questions',
        {
          method: 'POST',
          body: JSON.stringify({
            testType: newQType,
            title: newQTitle,
            prompt: newQPrompt,
            ageBand: newQAgeBand,
            classRange: newQClassRange,
            difficulty: newQDiff,
            defaultTimeLimitSec: newQTime,
            targetOlqs: ['effective_intelligence', 'initiative', 'sense_of_responsibility'] as OlqKey[],
          }),
        },
        token,
      );
      setNewQTitle('');
      setNewQPrompt('');
      await onRefresh();
      setFeedbackMsg(`Added new ${newQType} prompt to school question bank.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to add prompt.');
    } finally {
      setBankBusy(false);
    }
  }

  async function handleSaveScoringConfig() {
    setBankBusy(true);
    setErrorMsg(null);
    try {
      await apiRequest(
        '/api/thinking/scoring-config',
        {
          method: 'PUT',
          body: JSON.stringify({ minCorroborationCount: minCorroborationDraft }),
        },
        token,
      );
      await onRefresh();
      setFeedbackMsg(
        `Updated OLQ corroboration guard to minimum ${minCorroborationDraft} responses across tests.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save scoring rules.');
    } finally {
      setBankBusy(false);
    }
  }

  const olqNameByKey = useMemo(
    () => new Map<OlqKey, string>(OLQ_DEFINITIONS.map((d) => [d.key, d.name])),
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-900" />
            Student Thinking Tests &amp; 15-OLQ Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            SSB-inspired SRT, WAT, TAT, and PPDT developmental assessments integrated with Rai Plus’s 15 Officer-Like Qualities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {data.students.length > 1 && (
            <select
              aria-label="Select student for thinking assessments"
              value={effectiveStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
            >
              {data.students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} · Class {st.classSection}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            <FileDown className="h-3.5 w-3.5 text-blue-900" />
            Print / Save PDF Report
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 print:hidden">
        {!isParent && (
          <button
            type="button"
            onClick={() => setSubTab('take')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              subTab === 'take' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assessment Studio (SRT / WAT / TAT / PPDT)
          </button>
        )}
        <button
          type="button"
          onClick={() => setSubTab('profile')}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            subTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          4-Dimension Thinking Profile &amp; OLQ Comparison
        </button>
        {isStaff && (
          <button
            type="button"
            onClick={() => setSubTab('review')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              subTab === 'review' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Counsellor Review &amp; OLQ Promotion ({sessions.length})
          </button>
        )}
        {canManageBank && (
          <button
            type="button"
            onClick={() => setSubTab('bank')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              subTab === 'bank' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Question Bank &amp; Scoring Rules ({questions.length})
          </button>
        )}
      </div>

      {/* Non-Diagnostic Developmental Notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/70 px-4 py-2.5 flex items-start gap-2.5 text-xs text-blue-950">
        <ShieldAlert className="h-4 w-4 text-blue-900 shrink-0 mt-0.5" />
        <p>
          <strong>Evidence-Based Developmental Framework (Non-Diagnostic):</strong> Fast Thinking, Better Thinking, Positive Thinking, and Self-Centred Thinking are tracked as <em>four separate development dimensions</em>. Rapid responses are never automatically equated with quality, self-centred patterns are never treated as clinical diagnoses, and 15-OLQ scores require at least{' '}
          <span className="font-mono font-bold">{scoringConfig?.minCorroborationCount ?? 3}</span> corroborated responses plus human review.
        </p>
      </div>

      {feedbackMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-900">
          {errorMsg}
        </div>
      )}

      {/* SUBTAB 1: ASSESSMENT STUDIO */}
      {subTab === 'take' && !isParent && (
        <div className="space-y-5">
          {/* Format Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TEST_TYPES.map((item) => {
              const active = testType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTestType(item.id)}
                  className={`text-left rounded-xl border p-3.5 transition-colors ${
                    active
                      ? 'border-blue-900 bg-blue-50/60 ring-1 ring-blue-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{item.label}</p>
                  <p className="text-[11px] text-slate-600 mt-1">{item.shortDesc}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmitAssessment} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Prompt Canvas */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {testType} Prompt {activePromptIdx + 1} of {Math.max(1, activeQuestions.length)}
                  </p>
                  {currentQuestion && (
                    <p className="text-[11px] text-slate-500">
                      {currentQuestion.classRange} · {currentQuestion.difficulty} · Target{' '}
                      {currentQuestion.defaultTimeLimitSec}s
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-900 tabular-nums">
                    <Clock className="h-3.5 w-3.5 text-blue-900" />
                    {timedMode ? `${elapsedSec}s` : 'Untimed'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <label className="inline-flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={timedMode}
                    onChange={(e) => setTimedMode(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Timed Assessment
                </label>
                {testType === 'PPDT' && (
                  <select
                    aria-label="PPDT workflow mode"
                    value={workflowMode}
                    onChange={(e) => setWorkflowMode(e.target.value as 'Individual' | 'Group')}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800"
                  >
                    <option value="Individual">Individual Narration</option>
                    <option value="Group">Individual + Group Discussion</option>
                  </select>
                )}
              </div>

              {currentQuestion ? (
                <div className="space-y-3">
                  {(testType === 'TAT' || testType === 'PPDT') && (
                    <SceneIllustration
                      sceneCode={currentQuestion.sceneCode}
                      caption={currentQuestion.sceneCaption}
                    />
                  )}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {currentQuestion.title}
                    </p>
                    <p
                      className={`mt-2 text-slate-900 ${
                        testType === 'WAT'
                          ? 'font-display text-3xl font-extrabold tracking-wide text-center py-4 text-blue-900'
                          : 'text-sm leading-relaxed font-medium'
                      }`}
                    >
                      {currentQuestion.prompt}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeQuestions.map((q, idx) => {
                      const answered = Boolean(draftResponses[q.id]?.text?.trim());
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => movePrompt(idx)}
                          className={`rounded-md border px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors ${
                            idx === activePromptIdx
                              ? 'border-blue-900 bg-blue-900 text-white'
                              : answered
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          #{idx + 1} {answered ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No prompts available for {testType}.</p>
              )}
            </div>

            {/* Right Structured Response Workspace */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <p className="text-xs font-bold text-slate-900">
                  Student Response — {activeStudent ? `${activeStudent.name} (${activeStudent.classSection})` : 'Select Student'}
                </p>
                <span className="text-[11px] text-slate-500 font-mono">
                  {Object.values(draftResponses).filter((r) => r.text.trim()).length} / {activeQuestions.length} answered
                </span>
              </div>

              {testType === 'TAT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Protagonist</label>
                    <input
                      type="text"
                      value={tatFields.protagonist}
                      onChange={(e) => setTatFields((p) => ({ ...p, protagonist: e.target.value }))}
                      placeholder="e.g., Rohan, Class 9 student"
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Objective</label>
                    <input
                      type="text"
                      value={tatFields.objective}
                      onChange={(e) => setTatFields((p) => ({ ...p, objective: e.target.value }))}
                      placeholder="What goal is the protagonist working toward?"
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Challenges</label>
                    <input
                      type="text"
                      value={tatFields.challenges}
                      onChange={(e) => setTatFields((p) => ({ ...p, challenges: e.target.value }))}
                      placeholder="Key obstacle faced"
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Actions &amp; Outcome</label>
                    <input
                      type="text"
                      value={tatFields.outcome}
                      onChange={(e) =>
                        setTatFields((p) => ({ ...p, actions: e.target.value, outcome: e.target.value }))
                      }
                      placeholder="Practical steps taken & result"
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              )}

              {testType === 'PPDT' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Characters Identified</label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={ppdtFields.charactersCount}
                      onChange={(e) =>
                        setPpdtFields((p) => ({ ...p, charactersCount: Number(e.target.value) || 1 }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Approx. Ages</label>
                    <input
                      type="text"
                      value={ppdtFields.approximateAges}
                      onChange={(e) => setPpdtFields((p) => ({ ...p, approximateAges: e.target.value }))}
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Perceived Mood</label>
                    <select
                      aria-label="PPDT perceived mood"
                      value={ppdtFields.mood}
                      onChange={(e) =>
                        setPpdtFields((p) => ({ ...p, mood: e.target.value as PpdtPerceptionDetails['mood'] }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                    >
                      <option value="Positive">Positive (+)</option>
                      <option value="Neutral">Neutral (0)</option>
                      <option value="Negative">Negative (-)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Central Situation &amp; Narration Summary
                    </label>
                    <input
                      type="text"
                      value={ppdtFields.centralSituation}
                      onChange={(e) =>
                        setPpdtFields((p) => ({
                          ...p,
                          centralSituation: e.target.value,
                          narrationSummary: e.target.value,
                        }))
                      }
                      placeholder="Brief central theme observed in the picture..."
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              )}

              {currentQuestion && (
                <div>
                  <label
                    htmlFor="thinking-response-input"
                    className="block text-xs font-semibold text-slate-800 mb-1.5"
                  >
                    {testType === 'WAT'
                      ? 'Write the first meaningful thought/sentence that comes to mind:'
                      : testType === 'SRT'
                        ? 'Write your natural, practical response to this situation:'
                        : 'Write your complete story (context, action taken, and resolution):'}
                  </label>
                  <textarea
                    id="thinking-response-input"
                    rows={testType === 'WAT' ? 3 : 5}
                    value={draftResponses[currentQuestion.id]?.text || ''}
                    onChange={(e) => handleDraftChange(currentQuestion.id, e.target.value)}
                    placeholder={
                      testType === 'WAT'
                        ? 'e.g., Challenges build steady problem-solving confidence.'
                        : 'Describe your practical steps clearly and naturally...'
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-900 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestAiDraft}
                    onChange={(e) => setRequestAiDraft(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Include optional AI draft observation for counsellor review
                </label>

                <div className="flex items-center gap-2">
                  {activePromptIdx < activeQuestions.length - 1 && (
                    <button
                      type="button"
                      onClick={() => movePrompt(activePromptIdx + 1)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Next Prompt
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {submitting ? 'Evaluating...' : `Submit ${testType} Assessment`}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 2: 4-DIMENSION THINKING PROFILE & CROSS-TEST COMPARISON */}
      {subTab === 'profile' && (
        <div className="space-y-5">
          {/* 4 Separate Thinking Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                key: 'fastThinking' as const,
                title: 'Fast Thinking',
                subtitle: 'Speed of understanding & responding (evaluated independently of quality)',
                score: compositeProfile.dimensions.fastThinking,
                barClass: 'bg-sky-700',
              },
              {
                key: 'betterThinking' as const,
                title: 'Better Thinking',
                subtitle: 'Practicality, structured planning & decision effectiveness',
                score: compositeProfile.dimensions.betterThinking,
                barClass: 'bg-blue-900',
              },
              {
                key: 'positiveThinking' as const,
                title: 'Positive Thinking',
                subtitle: 'Constructive, optimistic & solution-oriented approach',
                score: compositeProfile.dimensions.positiveThinking,
                barClass: 'bg-emerald-700',
              },
              {
                key: 'selfCentredThinking' as const,
                title: 'Self-Centred Pattern',
                subtitle: 'Non-diagnostic awareness of individualistic vs cooperative focus (lower = more team-oriented)',
                score: compositeProfile.dimensions.selfCentredThinking,
                barClass: 'bg-amber-600',
              },
            ].map((dim) => (
              <div key={dim.key} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">{dim.title}</p>
                  <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {compositeProfile.sessionCount > 0 ? `${dim.score}` : '—'}
                    <span className="text-xs font-normal text-slate-500">/100</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dim.barClass}`}
                    style={{ width: `${compositeProfile.sessionCount > 0 ? dim.score : 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{dim.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Trend Chart & Cross-Test Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Longitudinal Thinking Trend — {activeStudent?.name || 'Student'}
                </h2>
                <span className="font-mono text-xs text-slate-500">
                  {compositeProfile.sessionCount} session(s) · {compositeProfile.totalResponses} responses
                </span>
              </div>
              {compositeProfile.trendPoints.length > 0 ? (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={compositeProfile.trendPoints}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="fastThinking" name="Fast" stroke="#0369A1" strokeWidth={2} />
                      <Line type="monotone" dataKey="betterThinking" name="Better" stroke="#1E3A8A" strokeWidth={2} />
                      <Line type="monotone" dataKey="positiveThinking" name="Positive" stroke="#047857" strokeWidth={2} />
                      <Line type="monotone" dataKey="selfCentredThinking" name="Self-Centred" stroke="#D97706" strokeWidth={2} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-10 text-center">
                  No Thinking Test sessions recorded yet for this student. Complete an SRT, WAT, TAT, or PPDT session in the Assessment Studio.
                </p>
              )}
            </div>

            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Cross-Test Comparison</h2>
                {onOpenStudent && activeStudent && (
                  <button
                    type="button"
                    onClick={() => onOpenStudent(activeStudent.id)}
                    className="text-xs font-semibold text-blue-900 hover:underline print:hidden"
                  >
                    Open Full 15-OLQ Profile →
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-[11px] text-slate-500">
                      <th className="py-2">Test</th>
                      <th className="py-2 text-right">Runs</th>
                      <th className="py-2 text-right">Fast</th>
                      <th className="py-2 text-right">Better</th>
                      <th className="py-2 text-right">Positive</th>
                      <th className="py-2 text-right">Self-C</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {(['SRT', 'WAT', 'TAT', 'PPDT'] as ThinkingTestType[]).map((t) => {
                      const entry = compositeProfile.byTestType[t];
                      return (
                        <tr key={t}>
                          <td className="py-2 font-sans font-semibold text-slate-900">{t}</td>
                          <td className="py-2 text-right text-slate-600">{entry.count}</td>
                          <td className="py-2 text-right">{entry.dimensions ? entry.dimensions.fastThinking : '—'}</td>
                          <td className="py-2 text-right font-bold text-blue-900">
                            {entry.dimensions ? entry.dimensions.betterThinking : '—'}
                          </td>
                          <td className="py-2 text-right text-emerald-700">
                            {entry.dimensions ? entry.dimensions.positiveThinking : '—'}
                          </td>
                          <td className="py-2 text-right text-amber-700">
                            {entry.dimensions ? entry.dimensions.selfCentredThinking : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Strengths, Development Areas & Exercises */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-800">Observed Strengths</h3>
              <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4">
                {compositeProfile.latestStrengths.length > 0 ? (
                  compositeProfile.latestStrengths.map((s, i) => <li key={i}>{s}</li>)
                ) : (
                  <li className="text-slate-500">Complete an assessment to record strengths.</li>
                )}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-amber-800">Development Areas</h3>
              <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4">
                {compositeProfile.latestDevelopmentAreas.length > 0 ? (
                  compositeProfile.latestDevelopmentAreas.map((s, i) => <li key={i}>{s}</li>)
                ) : (
                  <li className="text-slate-500">Balanced baseline across measured dimensions.</li>
                )}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-blue-900">Suggested Exercises</h3>
              <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4">
                {compositeProfile.latestExercises.length > 0 ? (
                  compositeProfile.latestExercises.map((s, i) => <li key={i}>{s}</li>)
                ) : (
                  <li className="text-slate-500">Continue bi-weekly SRT/WAT reflection practice.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Student Historical Sessions Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Historical Assessment &amp; Counsellor Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[11px] text-slate-500">
                    <th className="py-2">Date</th>
                    <th className="py-2">Test</th>
                    <th className="py-2">Responses</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">15-OLQ Sync</th>
                    <th className="py-2">Counsellor Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentSessions.map((sess) => (
                    <tr key={sess.id}>
                      <td className="py-2 font-mono text-slate-600">{sess.submittedAt.slice(0, 10)}</td>
                      <td className="py-2 font-semibold text-slate-900">
                        {sess.testType} ({sess.workflowMode})
                      </td>
                      <td className="py-2 font-mono">{sess.responses.length}</td>
                      <td className="py-2">{sess.status === 'counsellor_reviewed' ? 'Reviewed' : 'Pending Review'}</td>
                      <td className="py-2">
                        {sess.promotedToOlq ? (
                          <span className="font-semibold text-emerald-700">Corroborated &amp; Synced</span>
                        ) : (
                          <span className="text-slate-500">Awaiting Corroboration</span>
                        )}
                      </td>
                      <td className="py-2 text-slate-700 max-w-sm">
                        {sess.counsellorRecommendation || sess.teacherObservation || '—'}
                      </td>
                    </tr>
                  ))}
                  {studentSessions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No sessions recorded yet for this student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: COUNSELLOR REVIEW & OLQ PROMOTION */}
      {subTab === 'review' && isStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Submitted Assessments ({sessions.length})
            </h2>
            <div className="space-y-2 max-h-[540px] overflow-y-auto">
              {sessions.map((s) => {
                const active = selectedSession?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      active ? 'border-blue-900 bg-blue-50/70' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{s.studentName}</span>
                      <span className="font-mono text-[11px] font-semibold text-blue-900">{s.testType}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Class {s.classSection} · {s.responses.length} response(s) · {s.submittedAt.slice(0, 10)}
                    </p>
                    <p className="text-[11px] mt-1 font-medium text-slate-700">
                      {s.promotedToOlq
                        ? 'Synced to 15-OLQs'
                        : s.status === 'counsellor_reviewed'
                          ? 'Reviewed (Not yet promoted)'
                          : 'Needs Counsellor Review'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            {selectedSession ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedSession.studentName} — {selectedSession.testType} ({selectedSession.workflowMode})
                    </h2>
                    <p className="text-xs text-slate-600">
                      Class {selectedSession.classSection} · Fast {selectedSession.dimensionScores.fastThinking} · Better{' '}
                      {selectedSession.dimensionScores.betterThinking} · Positive{' '}
                      {selectedSession.dimensionScores.positiveThinking} · Self-Centred{' '}
                      {selectedSession.dimensionScores.selfCentredThinking}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={reviewBusy}
                    onClick={() => void handleSaveReview({ generateAiDraft: true })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Draft AI Observation
                  </button>
                </div>

                {/* Responses Evidence */}
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-800">Recorded Responses &amp; Pattern Cues</p>
                  {selectedSession.responses.map((r, i) => (
                    <div key={`${r.questionId}-${i}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 truncate max-w-lg">{r.promptSnapshot}</span>
                        <span className="font-mono shrink-0">{(r.responseTimeMs / 1000).toFixed(1)}s</span>
                      </div>
                      <p className="text-xs text-slate-900">{r.responseText}</p>
                      <p className="text-[11px] text-blue-900">{r.autoPatternFlags.join(' · ')}</p>
                    </div>
                  ))}
                </div>

                {selectedSession.aiDraftObservation && (
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 space-y-1">
                    <p className="text-[11px] font-bold text-indigo-950">
                      AI Draft Observation (Advisory Only — Requires Human Review)
                    </p>
                    <p className="text-xs text-indigo-950 leading-relaxed">
                      {selectedSession.aiDraftObservation}
                    </p>
                  </div>
                )}

                {/* Candidate OLQ Signals */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-800">Mapped 15-OLQ Candidate Signals</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(selectedSession.candidateOlqSignals) as Array<[OlqKey, number]>).map(
                      ([k, val]) => (
                        <span
                          key={k}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 font-mono"
                        >
                          {olqNameByKey.get(k) || k}: <strong>{val}</strong>
                        </span>
                      ),
                    )}
                  </div>
                </div>

                {/* PPDT Group Discussion Evaluator */}
                {selectedSession.testType === 'PPDT' && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-blue-900" />
                      PPDT Group Discussion Evaluation (1–10 Rubric)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {(
                        [
                          ['communication', 'Communication'],
                          ['cooperation', 'Cooperation'],
                          ['initiative', 'Initiative'],
                          ['listening', 'Listening'],
                          ['leadership', 'Leadership'],
                        ] as const
                      ).map(([field, label]) => (
                        <div key={field}>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={gdScores[field]}
                            onChange={(e) =>
                              setGdScores((p) => ({
                                ...p,
                                [field]: Math.max(1, Math.min(10, Number(e.target.value) || 5)),
                              }))
                            }
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Teacher Observation
                    </label>
                    <textarea
                      rows={3}
                      value={teacherObsDraft}
                      onChange={(e) => setTeacherObsDraft(e.target.value)}
                      placeholder="Classroom behavioural context..."
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Counsellor Recommendation
                    </label>
                    <textarea
                      rows={3}
                      value={counsellorRecDraft}
                      onChange={(e) => setCounsellorRecDraft(e.target.value)}
                      placeholder="Constructive coaching & next exercises..."
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={reviewBusy}
                    onClick={() => void handleSaveReview({ promoteToOlq: false })}
                    className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Save Review Notes
                  </button>
                  <button
                    type="button"
                    disabled={reviewBusy}
                    onClick={() => void handleSaveReview({ promoteToOlq: true })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Approve &amp; Promote Corroborated Evidence to 15-OLQs
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">Select a session on the left to review.</p>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: QUESTION BANK & SCORING RULES */}
      {subTab === 'bank' && canManageBank && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 space-y-4">
            <form
              onSubmit={handleAddQuestion}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
            >
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-blue-900" />
                Add Prompt to School Question Bank
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Test Type</label>
                  <select
                    aria-label="New question test type"
                    value={newQType}
                    onChange={(e) => setNewQType(e.target.value as ThinkingTestType)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  >
                    <option value="SRT">SRT</option>
                    <option value="WAT">WAT</option>
                    <option value="TAT">TAT</option>
                    <option value="PPDT">PPDT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    aria-label="New question difficulty"
                    value={newQDiff}
                    onChange={(e) => setNewQDiff(e.target.value as ThinkingDifficulty)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  >
                    <option value="Foundation">Foundation</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newQTitle}
                  onChange={(e) => setNewQTitle(e.target.value)}
                  placeholder="e.g., Library Book Lost Before Exam"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Prompt Text / WAT Word
                </label>
                <textarea
                  rows={3}
                  value={newQPrompt}
                  onChange={(e) => setNewQPrompt(e.target.value)}
                  placeholder="Enter the situation, word cue, or story scene instructions..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Age Band</label>
                  <input
                    type="text"
                    value={newQAgeBand}
                    onChange={(e) => setNewQAgeBand(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Class Range</label>
                  <input
                    type="text"
                    value={newQClassRange}
                    onChange={(e) => setNewQClassRange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Time (sec)</label>
                  <input
                    type="number"
                    min={10}
                    max={600}
                    value={newQTime}
                    onChange={(e) => setNewQTime(Number(e.target.value) || 30)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={bankBusy}
                className="w-full rounded-lg bg-blue-900 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Save Prompt to Bank
              </button>
            </form>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Configurable OLQ Corroboration Guard</h2>
              <p className="text-xs text-slate-600">
                Minimum responses required across Thinking Tests before a student’s official 15-OLQ score can be updated.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={2}
                  max={10}
                  aria-label="Minimum corroborated responses"
                  value={minCorroborationDraft}
                  onChange={(e) => setMinCorroborationDraft(Number(e.target.value) || 3)}
                  className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono font-bold"
                />
                <button
                  type="button"
                  disabled={bankBusy}
                  onClick={() => void handleSaveScoringConfig()}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Save Rule
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Active School Question Bank ({questions.length})</h2>
            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
              {questions.map((q) => (
                <div key={q.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      [{q.testType}] {q.title}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {q.classRange} · {q.difficulty} · {q.defaultTimeLimitSec}s
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{q.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
