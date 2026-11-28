import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Eye,
  EyeOff,
  FileText,
  Flame,
  Lock,
  LogOut,
  Mic,
  Play,
  Printer,
  RefreshCw,
  Shield,
  ShieldAlert,
  Sparkles,
  Square,
  Target,
  Trash2,
  Users,
} from 'lucide-react';
import type { OlqKey, UserAccount } from '../../types';
import type {
  SsbAssessmentSessionRecord,
  SsbOlqIndicatorSummary,
  SsbPracticeSet,
  SsbPracticeStimulus,
  SsbStudentProfile,
  SsbSubscriptionPricingConfig,
  SsbTestFormat,
} from '../../types/flagshipProducts';
import { apiRequest } from '../../utils/api';
import { RAI_PLUS_LOGO_URL } from '../../utils/transportEngine';
import {
  AnimatedPageTransition,
  AnimatedProgressBar,
} from '../motion/RaiMotionSystem';

interface SsbPracticeSetWithLock extends SsbPracticeSet {
  unlocked: boolean;
}

interface SsbWorkspacePayload {
  user: UserAccount;
  profile: SsbStudentProfile;
  practiceSets: SsbPracticeSetWithLock[];
  olqProfile: {
    indicators: SsbOlqIndicatorSummary[];
    strengths: string[];
    improvementAreas: string[];
    recurringMistakes: string[];
    recommendedSetIds: string[];
    weeklyPlan: Array<{ day: string; focus: string; module: SsbTestFormat; minutes: number }>;
  };
  pricingConfig: SsbSubscriptionPricingConfig;
  disclaimer: string;
}

interface SsbAcademyWorkspaceProps {
  token: string;
  onSwitchUser: () => void;
  onLogout: () => void;
}

type SsbTab = 'dashboard' | 'sets' | 'studio' | 'olq' | 'history' | 'subscription';

/** Atmospheric monochrome SVG scene plate for TAT & PPDT visual stimuli */
const SsbVisualPlate: React.FC<{ stimulus: SsbPracticeStimulus; hazy?: boolean }> = ({
  stimulus,
  hazy = false,
}) => {
  const hash = stimulus.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const variant = hash % 4;
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-900 shadow-inner">
      <svg
        viewBox="0 0 640 320"
        className={`w-full h-56 sm:h-64 object-cover ${hazy ? 'blur-[0.7px] contrast-90 opacity-90' : ''}`}
        role="img"
        aria-label={stimulus.sceneCaption || stimulus.prompt}
      >
        <defs>
          <linearGradient id={`sky-${stimulus.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hazy ? '#475569' : '#334155'} />
            <stop offset="65%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>
        <rect width="640" height="320" fill={`url(#sky-${stimulus.id})`} />
        {/* Horizon terrain / hills / structures */}
        <path
          d={
            variant === 0
              ? 'M0 220 Q160 155 320 205 T640 190 L640 320 L0 320 Z'
              : variant === 1
                ? 'M0 230 L120 180 L250 215 L420 165 L640 225 L640 320 L0 320 Z'
                : variant === 2
                  ? 'M0 210 Q200 240 400 195 T640 215 L640 320 L0 320 Z'
                  : 'M0 225 L180 200 L350 220 L520 175 L640 210 L640 320 L0 320 Z'
          }
          fill="#334155"
          opacity="0.78"
        />
        <rect x="0" y="248" width="640" height="72" fill="#1e293b" opacity="0.88" />
        {/* Architectural / outdoor silhouette */}
        {variant % 2 === 0 ? (
          <g fill="#0f172a" opacity="0.72">
            <rect x="70" y="145" width="90" height="105" rx="2" />
            <rect x="85" y="162" width="18" height="22" fill="#e2e8f0" opacity="0.45" />
            <rect x="120" y="162" width="18" height="22" fill="#e2e8f0" opacity="0.45" />
            <line x1="460" y1="248" x2="540" y2="155" stroke="#0f172a" strokeWidth="5" />
          </g>
        ) : (
          <g fill="#0f172a" opacity="0.7">
            <circle cx="515" cy="142" r="24" fill="#e2e8f0" opacity="0.28" />
            <rect x="440" y="182" width="130" height="66" rx="4" />
          </g>
        )}
        {/* Silhouetted human figures (ambiguous officer-candidate stimulus) */}
        <g fill="#0f172a">
          {/* Central figure */}
          <circle cx="290" cy="174" r="13" />
          <path d="M273 248 L279 190 L301 190 L308 248 Z" />
          {/* Secondary figure */}
          <circle cx="348" cy="182" r="11" opacity="0.85" />
          <path d="M334 248 L339 196 L357 196 L363 248 Z" opacity="0.85" />
          {/* Third figure slightly in background */}
          <circle cx="232" cy="188" r="10" opacity="0.7" />
          <path d="M220 248 L225 200 L240 200 L245 248 Z" opacity="0.7" />
        </g>
        {hazy && (
          <rect width="640" height="320" fill="#f8fafc" opacity="0.14" />
        )}
      </svg>
      <div className="bg-slate-950/90 px-4 py-2.5 text-xs text-slate-200 flex items-center justify-between gap-3">
        <span>
          <strong className="text-amber-300">{stimulus.format} Plate:</strong>{' '}
          {stimulus.sceneCaption || stimulus.prompt}
        </span>
        <span className="shrink-0 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
          {stimulus.sceneCode || stimulus.id}
        </span>
      </div>
    </div>
  );
};

export const SsbAcademyWorkspace: React.FC<SsbAcademyWorkspaceProps> = ({
  token,
  onSwitchUser,
  onLogout,
}) => {
  const [data, setData] = useState<SsbWorkspacePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SsbTab>('dashboard');

  // Set catalog filters
  const [formatFilter, setFormatFilter] = useState<'ALL' | SsbTestFormat>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Studio state
  const [activeSet, setActiveSet] = useState<SsbPracticeSetWithLock | null>(null);
  const [stimIdx, setStimIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [collectedAnswers, setCollectedAnswers] = useState<
    Array<{ stimulusId: string; candidateResponse: string; timeTakenSeconds: number }>
  >([]);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [phase, setPhase] = useState<'observe' | 'respond' | 'gd' | 'review'>('respond');
  const [elapsedForStim, setElapsedForStim] = useState(0);
  const [submittingSession, setSubmittingSession] = useState(false);
  const [lastCompletedSession, setLastCompletedSession] = useState<SsbAssessmentSessionRecord | null>(null);

  // PPDT Perception + Voice Narration + GD state
  const [ppdtChars, setPpdtChars] = useState(3);
  const [ppdtAge, setPpdtAge] = useState('22');
  const [ppdtMood, setPpdtMood] = useState<'Positive' | 'Neutral' | 'Negative'>('Positive');
  const [ppdtAction, setPpdtAction] = useState('');
  const [ppdtGdText, setPpdtGdText] = useState('');
  const [narrationDone, setNarrationDone] = useState(false);
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Reflection, Coupon, Privacy state
  const [reflectionNote, setReflectionNote] = useState('');
  const [reflectionOlq, setReflectionOlq] = useState<OlqKey>('organising_ability');
  const [couponCode, setCouponCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiRequest<SsbWorkspacePayload>(
        '/api/ssb-academy/workspace',
        {},
        token || undefined,
      );
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Rai Plus SSB Academy.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  // Countdown timer inside live practice studio
  useEffect(() => {
    if (activeTab !== 'studio' || !activeSet || phase === 'review' || phase === 'gd') return;
    const timer = window.setInterval(() => {
      setElapsedForStim((prev) => prev + 1);
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (phase === 'observe') {
            setPhase('respond');
            const currentStim = activeSet.stimuli[stimIdx];
            return currentStim?.recommendedSeconds || 240;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeTab, activeSet, phase, stimIdx]);

  const filteredSets = useMemo(() => {
    if (!data) return [];
    const q = searchQuery.trim().toLowerCase();
    return data.practiceSets.filter((s) => {
      if (formatFilter !== 'ALL' && s.format !== formatFilter) return false;
      if (difficultyFilter !== 'ALL' && s.difficulty !== difficultyFilter) return false;
      if (q && !`${s.code} ${s.title} ${s.categoryFocus}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, formatFilter, difficultyFilter, searchQuery]);

  function startPracticeSet(set: SsbPracticeSetWithLock) {
    if (!set.unlocked) {
      setActiveTab('subscription');
      setStatusMessage(
        `${set.code} is part of the full 100-set SSB library. Apply a trial/coupon or check subscription plans below.`,
      );
      return;
    }
    const firstStim = set.stimuli[0];
    setActiveSet(set);
    setStimIdx(0);
    setCurrentAnswer('');
    setCollectedAnswers([]);
    setLastCompletedSession(null);
    setElapsedForStim(0);
    setPpdtChars(3);
    setPpdtAge('22');
    setPpdtMood('Positive');
    setPpdtAction('');
    setPpdtGdText('');
    setNarrationDone(false);
    setAudioUrl(null);
    if (set.format === 'TAT' || set.format === 'PPDT') {
      setPhase('observe');
      setSecondsLeft(firstStim?.observationSeconds || 30);
    } else {
      setPhase('respond');
      setSecondsLeft(firstStim?.recommendedSeconds || (set.format === 'WAT' ? 15 : 30));
    }
    setActiveTab('studio');
  }

  async function toggleNarrationRecording() {
    if (recordingAudio) {
      mediaRecorderRef.current?.stop();
      setRecordingAudio(false);
      setNarrationDone(true);
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setNarrationDone(true);
        setStatusMessage('Microphone API unavailable in this browser — marked 60-second live oral narration as practiced.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingAudio(true);
    } catch {
      setNarrationDone(true);
      setStatusMessage('Microphone permission skipped — you can still practice speaking aloud for 60s and continue to Group Discussion.');
    }
  }

  async function submitCompleteSession(
    finalResponses: Array<{ stimulusId: string; candidateResponse: string; timeTakenSeconds: number }>,
  ) {
    if (!activeSet) return;
    setSubmittingSession(true);
    setError(null);
    try {
      const res = await apiRequest<{
        session: SsbAssessmentSessionRecord;
        profile: SsbStudentProfile;
        olqProfile: SsbWorkspacePayload['olqProfile'];
      }>(
        '/api/ssb-academy/sessions',
        {
          method: 'POST',
          body: JSON.stringify({
            setId: activeSet.id,
            mode: 'timed',
            responses: finalResponses,
            totalDurationSeconds: finalResponses.reduce((s, r) => s + Math.max(5, r.timeTakenSeconds), 0),
            ppdtPerception:
              activeSet.format === 'PPDT'
                ? {
                    charactersCount: ppdtChars,
                    mainCharacterAge: ppdtAge,
                    mainCharacterMood: ppdtMood,
                    actionSummary: ppdtAction || 'Organized group response to scene challenge',
                    narrationPracticed: narrationDone,
                    gdContribution: ppdtGdText,
                  }
                : undefined,
          }),
        },
        token || undefined,
      );
      setLastCompletedSession(res.session);
      setPhase('review');
      setData((prev) =>
        prev
          ? {
              ...prev,
              profile: res.profile,
              olqProfile: res.olqProfile,
            }
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to evaluate session.');
    } finally {
      setSubmittingSession(false);
    }
  }

  function handleNextStimulus() {
    if (!activeSet) return;
    const currentStim = activeSet.stimuli[stimIdx];
    const updated = [
      ...collectedAnswers,
      {
        stimulusId: currentStim.id,
        candidateResponse: currentAnswer.trim() || '(No response entered within time limit)',
        timeTakenSeconds: Math.max(1, elapsedForStim),
      },
    ];
    setCollectedAnswers(updated);
    setCurrentAnswer('');
    setElapsedForStim(0);

    if (stimIdx + 1 < activeSet.stimuli.length) {
      const nextStim = activeSet.stimuli[stimIdx + 1];
      setStimIdx(stimIdx + 1);
      if (activeSet.format === 'TAT' || activeSet.format === 'PPDT') {
        setPhase('observe');
        setSecondsLeft(nextStim.observationSeconds || 30);
      } else {
        setPhase('respond');
        setSecondsLeft(nextStim.recommendedSeconds || 15);
      }
    } else if (activeSet.format === 'PPDT' && phase !== 'gd') {
      setPhase('gd');
    } else {
      void submitCompleteSession(updated);
    }
  }

  async function handleAddReflection(e: React.FormEvent) {
    e.preventDefault();
    if (!reflectionNote.trim()) return;
    try {
      const res = await apiRequest<{ reflections: SsbStudentProfile['selfReflections'] }>(
        '/api/ssb-academy/reflections',
        {
          method: 'POST',
          body: JSON.stringify({ note: reflectionNote, focusOlq: reflectionOlq }),
        },
        token || undefined,
      );
      setData((prev) =>
        prev ? { ...prev, profile: { ...prev.profile, selfReflections: res.reflections } } : prev,
      );
      setReflectionNote('');
      setStatusMessage('OLQ self-reflection saved to your development journal.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save reflection.');
    }
  }

  async function handleUpdateTargetEntry(targetEntry: SsbStudentProfile['targetEntry']) {
    try {
      const res = await apiRequest<{ profile: SsbStudentProfile }>(
        '/api/ssb-academy/profile',
        { method: 'PATCH', body: JSON.stringify({ targetEntry }) },
        token || undefined,
      );
      setData((prev) => (prev ? { ...prev, profile: res.profile } : prev));
    } catch {
      // ignore
    }
  }

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setError(null);
    try {
      const res = await apiRequest<{
        coupon: { code: string; discountPct: number };
        subscription: SsbStudentProfile['subscription'];
      }>(
        '/api/ssb-academy/subscription/apply-coupon',
        { method: 'POST', body: JSON.stringify({ code: couponCode }) },
        token || undefined,
      );
      setData((prev) =>
        prev ? { ...prev, profile: { ...prev.profile, subscription: res.subscription } } : prev,
      );
      setStatusMessage(`Coupon ${res.coupon.code} applied (${res.coupon.discountPct}% discount).`);
      setCouponCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Coupon could not be applied.');
    }
  }

  async function handleActivateTier(billingTier: 'monthly' | 'quarterly' | 'half_yearly' | 'annual') {
    setError(null);
    try {
      await apiRequest(
        '/api/ssb-academy/subscription/activate',
        { method: 'POST', body: JSON.stringify({ billingTier }) },
        token || undefined,
      );
      setStatusMessage(`SSB Academy ${billingTier.replace('_', ' ')} plan activated! All 100 practice sets unlocked.`);
      void loadWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to activate plan.');
    }
  }

  async function handleExportPrivacyData() {
    try {
      const payload = await apiRequest<Record<string, unknown>>(
        '/api/ssb-academy/privacy/export',
        {},
        token || undefined,
      );
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rai-plus-ssb-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Your personal SSB Academy JSON data export has been downloaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    }
  }

  async function handleDeleteRequest(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiRequest(
        '/api/ssb-academy/privacy/delete-request',
        { method: 'POST', body: JSON.stringify({ reason: deleteReason || 'DPDP erasure request' }) },
        token || undefined,
      );
      setDeleteReason('');
      setStatusMessage('DPDP account & assessment deletion request logged. Compliance team will process within 72 hours.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit deletion request.');
    }
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Shield className="h-10 w-10 text-amber-400 mx-auto animate-pulse" />
          <p className="text-sm font-medium text-slate-300">Loading Rai Plus SSB Academy…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-rose-200 bg-white p-6 text-center space-y-4">
          <p className="text-sm font-semibold text-rose-700">{error || 'Session unavailable.'}</p>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Return to Rai Plus Home
          </button>
        </div>
      </div>
    );
  }

  const currentStimulus = activeSet ? activeSet.stimuli[stimIdx] : null;
  const completedSetIds = new Set(data.profile.sessions.map((s) => s.setId));
  const progressPct = Math.min(100, Math.round((completedSetIds.size / Math.max(1, data.practiceSets.length)) * 100));

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex flex-col">
      {/* Standalone SSB Academy Header — Zero School ERP exposure */}
      <header className="sticky top-0 z-30 border-b border-[#254264] bg-[#142B46] text-white shadow-sm print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={RAI_PLUS_LOGO_URL}
              alt="Rai Plus SSB Academy"
              className="h-10 w-10 rounded-lg border border-[#D6B66D]/60 bg-[#F3E6D8] object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">RAI PLUS SSB ACADEMY</span>
                <span className="rounded-full bg-amber-400/20 border border-amber-300/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                  Standalone Officer Prep
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {data.user.name} · Target: {data.profile.targetEntry} · Role: SSB_STUDENT (Isolated Account)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-[#1E3B5C] px-3 py-1.5 text-xs font-semibold text-amber-300">
              <Flame className="h-3.5 w-3.5" /> {data.profile.streakDays}-Day Streak
            </span>
            <button
              type="button"
              onClick={onSwitchUser}
              className="rounded-lg border border-[#34567C] bg-[#1E3B5C] px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-[#274B73]"
            >
              Switch Account
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Strip */}
        <nav className="border-t border-[#203D5F] bg-[#0F2238] px-4 sm:px-6 overflow-x-auto">
          <div className="mx-auto max-w-7xl flex items-center gap-1 py-1.5">
            {(
              [
                { id: 'dashboard', label: 'Dashboard', icon: Target },
                { id: 'sets', label: `Practice Sets (${data.practiceSets.length})`, icon: BookOpen },
                { id: 'studio', label: 'Practice Studio', icon: Play },
                { id: 'olq', label: '15-OLQ Profile', icon: Award },
                { id: 'history', label: `History (${data.profile.sessions.length})`, icon: Clock },
                { id: 'subscription', label: 'Plan & Privacy', icon: Shield },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#D6B66D] text-[#142B46]'
                      : 'text-slate-300 hover:bg-[#1E3B5C] hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl w-full flex-1 px-4 sm:px-6 py-6 space-y-5">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="underline">
              Dismiss
            </button>
          </div>
        )}
        {statusMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button type="button" onClick={() => setStatusMessage(null)} className="underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Ethical Preparation Disclaimer Banner */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs text-amber-950 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong>Preparation Integrity Notice:</strong> {data.disclaimer}
          </p>
        </div>

        <AnimatedPageTransition routeKey={activeTab}>
        {/* ==================== TAB 1: DAILY DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rai-card-interactive rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-semibold text-slate-500 uppercase">Preparation Progress</p>
                <p className="mt-1 text-2xl font-bold text-[#142B46]">
                  {completedSetIds.size} / {data.practiceSets.length} Sets
                </p>
                <div className="mt-2">
                  <AnimatedProgressBar
                    value={Math.max(4, progressPct)}
                    heightClassName="h-2"
                    className="bg-slate-100"
                    barClassName="bg-[#142B46]"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-semibold text-slate-500 uppercase">Daily Practice Streak</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{data.profile.streakDays} Days</p>
                <p className="mt-1 text-xs text-slate-500">
                  Last active: {data.profile.lastPracticedDate || 'Start today'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-semibold text-slate-500 uppercase">Corroborated OLQs</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {data.olqProfile.indicators.filter((i) => i.score !== null).length} / 15
                </p>
                <p className="mt-1 text-xs text-slate-500">Requires ≥ 2 exercises per OLQ</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-semibold text-slate-500 uppercase">Target Entry Track</p>
                <select
                  aria-label="Target Defence Entry"
                  value={data.profile.targetEntry}
                  onChange={(e) =>
                    void handleUpdateTargetEntry(e.target.value as SsbStudentProfile['targetEntry'])
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-sm font-semibold text-[#142B46]"
                >
                  <option value="NDA">NDA</option>
                  <option value="CDS">CDS</option>
                  <option value="AFCAT">AFCAT</option>
                  <option value="TES / Direct Officer Entry">TES / Direct Officer Entry</option>
                </select>
              </div>
            </div>

            {/* Quick Launch Four SSB Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(
                [
                  {
                    format: 'WAT' as SsbTestFormat,
                    title: 'WAT — Word Association',
                    subtitle: '25 Sets · 60 Words / Set · 15s Timer',
                    color: 'from-[#142B46] to-[#1E3B5C]',
                  },
                  {
                    format: 'SRT' as SsbTestFormat,
                    title: 'SRT — Situation Reaction',
                    subtitle: '25 Sets · 60 Situations / Set · 30m',
                    color: 'from-emerald-800 to-emerald-700',
                  },
                  {
                    format: 'TAT' as SsbTestFormat,
                    title: 'TAT — Thematic Apperception',
                    subtitle: '25 Sets · 100 Visual Stimuli · 30s + 4m',
                    color: 'from-indigo-900 to-indigo-700',
                  },
                  {
                    format: 'PPDT' as SsbTestFormat,
                    title: 'PPDT + Narration & GD',
                    subtitle: '25 Sets · 100 Hazy Plates · Voice + GD',
                    color: 'from-amber-800 to-amber-700',
                  },
                ] as const
              ).map((card) => {
                const nextSet =
                  data.practiceSets.find(
                    (s) => s.format === card.format && s.unlocked && !completedSetIds.has(s.id),
                  ) || data.practiceSets.find((s) => s.format === card.format && s.unlocked);
                return (
                  <div
                    key={card.format}
                    className={`rounded-xl bg-gradient-to-br ${card.color} p-5 text-white shadow-sm flex flex-col justify-between gap-4`}
                  >
                    <div>
                      <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] font-bold">
                        {card.format}
                      </span>
                      <h3 className="mt-2 text-base font-bold">{card.title}</h3>
                      <p className="mt-1 text-xs text-white/80">{card.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => nextSet && startPracticeSet(nextSet)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-slate-900 hover:bg-amber-50"
                    >
                      <Play className="h-3.5 w-3.5" /> Start Next {card.format} Set
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Strengths, Gaps & Weekly Adaptive Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#142B46] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" /> AI Coaching Diagnosis
                </h3>
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-700">Current Strengths</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700">
                    {data.olqProfile.strengths.map((s) => (
                      <li key={s} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-amber-700">Priority Improvement Areas</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700">
                    {data.olqProfile.improvementAreas.map((s) => (
                      <li key={s} className="flex items-start gap-1.5">
                        <Target className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-rose-700">Recurring Habits to Watch</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
                    {data.olqProfile.recurringMistakes.map((m) => (
                      <li key={m}>• {m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#142B46]">
                    Adaptive 7-Day Officer Preparation Schedule
                  </h3>
                  <span className="text-xs text-slate-500">Auto-calibrated to your practice history</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {data.olqProfile.weeklyPlan.map((day) => (
                    <div
                      key={day.day}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#142B46]">
                          {day.day} ·{' '}
                          <span className="text-amber-700">{day.module}</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">{day.focus}</p>
                      </div>
                      <span className="shrink-0 rounded bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {day.minutes}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: 100 PRACTICE SETS CATALOG ==================== */}
        {activeTab === 'sets' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {(['ALL', 'WAT', 'SRT', 'TAT', 'PPDT'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormatFilter(fmt)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                      formatFilter === fmt
                        ? 'bg-[#142B46] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {fmt} (
                    {fmt === 'ALL'
                      ? data.practiceSets.length
                      : data.practiceSets.filter((s) => s.format === fmt).length}
                    )
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter by difficulty"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Officer-Level">Officer-Level</option>
                </select>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search set code or topic..."
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs w-52"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSets.map((set) => {
                const done = completedSetIds.has(set.id);
                return (
                  <div
                    key={set.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-[#142B46]/10 px-2 py-0.5 text-[11px] font-bold text-[#142B46]">
                          {set.code} · {set.format}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {set.isFreeDemo && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              FREE DEMO
                            </span>
                          )}
                          {done && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-slate-900">{set.title}</h4>
                      <p className="mt-1 text-xs text-slate-600">
                        Focus: {set.categoryFocus} · {set.difficulty} · {set.stimuli.length} stimuli · ~{set.estimatedMinutes} min
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startPracticeSet(set)}
                      className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                        set.unlocked
                          ? 'bg-[#142B46] text-white hover:bg-[#1E3B5C]'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {set.unlocked ? (
                        <>
                          <Play className="h-3.5 w-3.5" /> {done ? 'Practice Again' : 'Launch Timed Set'}
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" /> Unlock Full 100-Set Access
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: LIVE PRACTICE STUDIO ==================== */}
        {activeTab === 'studio' && (
          <div className="space-y-5">
            {!activeSet ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-4">
                <Compass className="h-10 w-10 text-[#142B46] mx-auto" />
                <h3 className="text-base font-bold text-[#142B46]">
                  Select any WAT, SRT, TAT, or PPDT Practice Set to Begin
                </h3>
                <p className="text-xs text-slate-600 max-w-lg mx-auto">
                  All sessions feature realistic countdown timers, anti-cliché response evaluation, and multi-evidence OLQ behavioural mapping.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('sets')}
                  className="rounded-lg bg-[#142B46] px-5 py-2.5 text-xs font-bold text-white"
                >
                  Browse 100 Practice Sets
                </button>
              </div>
            ) : phase === 'review' && lastCompletedSession ? (
              <div className="rounded-xl border border-emerald-200 bg-white p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      AI Evaluation Complete · {lastCompletedSession.setCode}
                    </span>
                    <h3 className="mt-1.5 text-lg font-bold text-[#142B46]">
                      {lastCompletedSession.setTitle}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-center">
                      <p className="text-[10px] font-bold uppercase text-slate-500">Practicality</p>
                      <p className="text-lg font-bold text-[#142B46]">{lastCompletedSession.overallPracticality}%</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-center">
                      <p className="text-[10px] font-bold uppercase text-slate-500">Clarity</p>
                      <p className="text-lg font-bold text-emerald-700">{lastCompletedSession.overallClarity}%</p>
                    </div>
                  </div>
                </div>

                {lastCompletedSession.ppdtPerception?.gdFeedback && (
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-1.5">
                    <p className="text-xs font-bold text-indigo-900">PPDT Narration & Group Discussion Feedback</p>
                    {lastCompletedSession.ppdtPerception.gdFeedback.map((fb) => (
                      <p key={fb} className="text-xs text-indigo-800">• {fb}</p>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {lastCompletedSession.responses.map((r, idx) => (
                    <div key={r.stimulusId + idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#142B46]">
                          #{idx + 1} Stimulus: <span className="text-slate-800">{r.prompt}</span>
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            r.authenticityFlag === 'Authentic & Coherent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.authenticityFlag === 'Slightly Formulaic'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.authenticityFlag} · {r.timeTakenSeconds}s
                        </span>
                      </div>
                      <p className="rounded-lg bg-white border border-slate-200 p-3 text-xs text-slate-800">
                        <strong>Your Response:</strong> {r.candidateResponse}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3">
                          <p className="font-bold text-emerald-900">What Worked Well</p>
                          <ul className="mt-1 space-y-1 text-emerald-800">
                            {r.positives.map((p) => (
                              <li key={p}>• {p}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3">
                          <p className="font-bold text-amber-900">Actionable Improvements</p>
                          <ul className="mt-1 space-y-1 text-amber-900">
                            {r.improvements.map((im) => (
                              <li key={im}>• {im}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong>Alternative Constructive Approach:</strong> {r.alternativeApproach}
                      </p>
                      <p className="text-xs text-indigo-800">
                        <strong>Recommended Follow-Up Exercise:</strong> {r.suggestedExercise}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('olq')}
                    className="rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-white"
                  >
                    View Updated 15-OLQ Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sets')}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                  >
                    Choose Another Set
                  </button>
                </div>
              </div>
            ) : phase === 'gd' && currentStimulus ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                      PPDT STAGE 2 · VOICE NARRATION & GROUP DISCUSSION SIMULATOR
                    </span>
                    <h3 className="mt-1 text-base font-bold text-[#142B46]">{activeSet.title}</h3>
                  </div>
                </div>

                {/* 60-Second Voice Narration Recorder */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#142B46]">1. Individual Story Narration (60 Seconds)</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Narrate your story smoothly without stammering or looking down. Record to review your voice clarity.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleNarrationRecording()}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white ${
                        recordingAudio ? 'bg-rose-600 animate-pulse' : 'bg-[#142B46] hover:bg-[#1E3B5C]'
                      }`}
                    >
                      {recordingAudio ? (
                        <>
                          <Square className="h-3.5 w-3.5" /> Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-3.5 w-3.5" /> {narrationDone ? 'Re-record Narration' : 'Start Narration Mic'}
                        </>
                      )}
                    </button>
                    {audioUrl && <audio controls src={audioUrl} className="h-8" />}
                  </div>
                </div>

                {/* Multi-Perspective GD Panel */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#142B46] flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-amber-600" /> 2. Fellow Candidates’ Perspectives (Build Group Consensus)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(currentStimulus.gdPerspectives || []).map((peer) => (
                      <div key={peer.speaker} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                        <p className="font-bold text-[#142B46]">{peer.speaker}</p>
                        <p className="text-[11px] font-semibold text-amber-700">{peer.stance}</p>
                        <p className="mt-1.5 text-slate-700">“{peer.statement}”</p>
                      </div>
                    ))}
                  </div>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-slate-700">
                      Your Group Discussion Contribution (Acknowledge peers & propose common story):
                    </span>
                    <textarea
                      rows={4}
                      value={ppdtGdText}
                      onChange={(e) => setPpdtGdText(e.target.value)}
                      placeholder="Friends, most of us noticed two main figures cooperating in a challenging situation. Combining Candidate A's safety focus with Candidate B's planning..."
                      className="w-full rounded-lg border border-slate-300 p-3 text-xs"
                    />
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={submittingSession}
                    onClick={() => void submitCompleteSession(collectedAnswers)}
                    className="rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {submittingSession ? 'Evaluating PPDT + GD…' : 'Complete & Generate AI Feedback'}
                  </button>
                </div>
              </div>
            ) : currentStimulus ? (
              <AnimatedPageTransition
                routeKey={`${activeSet.id}-${stimIdx}-${phase}`}
                className="rounded-xl border border-slate-200 bg-white p-6 space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <span className="rounded bg-[#142B46] px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {activeSet.code} · {activeSet.format} · Item {stimIdx + 1} of {activeSet.stimuli.length}
                    </span>
                    <h3 className="mt-1.5 text-base font-bold text-[#142B46]">{activeSet.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg px-3.5 py-2 text-sm font-mono font-bold ${
                        secondsLeft <= 5
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {phase === 'observe' ? 'OBSERVE' : 'WRITE'} · {Math.floor(secondsLeft / 60)}:
                      {String(secondsLeft % 60).padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Stimulus Display */}
                {(activeSet.format === 'TAT' || activeSet.format === 'PPDT') && (
                  <div className="space-y-3">
                    {phase === 'observe' ? (
                      <>
                        <SsbVisualPlate stimulus={currentStimulus} hazy={activeSet.format === 'PPDT'} />
                        <div className="flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-2.5 text-xs text-indigo-900">
                          <span className="inline-flex items-center gap-1.5">
                            <Eye className="h-4 w-4" /> Observe characters, mood, surroundings, and central action carefully.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPhase('respond');
                              setSecondsLeft(currentStimulus.recommendedSeconds || 240);
                            }}
                            className="rounded bg-indigo-700 px-3 py-1 text-xs font-bold text-white"
                          >
                            Start Writing Now
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-xs text-slate-700 flex items-center gap-2">
                        <EyeOff className="h-4 w-4 text-slate-500" />
                        <span>
                          <strong>Plate Hidden (Exam Simulation):</strong> Write a natural, practical story showing what led to the scene, what is happening now, and a realistic outcome.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {activeSet.format === 'WAT' && (
                  <div className="rounded-xl bg-[#142B46] py-10 px-6 text-center text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-300">
                      Word Stimulus ({currentStimulus.category})
                    </p>
                    <p className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-wide">
                      {currentStimulus.prompt}
                    </p>
                  </div>
                )}

                {activeSet.format === 'SRT' && (
                  <div className="rounded-xl border border-[#142B46]/20 bg-slate-50 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                      Situation Reaction · {currentStimulus.category} ({currentStimulus.difficulty})
                    </p>
                    <p className="mt-2 text-base font-semibold text-[#142B46]">{currentStimulus.prompt}</p>
                  </div>
                )}

                {/* PPDT Character Perception Box */}
                {activeSet.format === 'PPDT' && phase === 'respond' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs">
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Characters Seen</span>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={ppdtChars}
                        onChange={(e) => setPpdtChars(Number(e.target.value) || 1)}
                        className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Main Character Age</span>
                      <input
                        type="text"
                        value={ppdtAge}
                        onChange={(e) => setPpdtAge(e.target.value)}
                        className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Mood</span>
                      <select
                        value={ppdtMood}
                        onChange={(e) => setPpdtMood(e.target.value as 'Positive' | 'Neutral' | 'Negative')}
                        className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5"
                      >
                        <option value="Positive">Positive (+)</option>
                        <option value="Neutral">Neutral (0)</option>
                        <option value="Negative">Negative (-)</option>
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Action Theme</span>
                      <input
                        type="text"
                        value={ppdtAction}
                        onChange={(e) => setPpdtAction(e.target.value)}
                        placeholder="e.g. Organizing flood relief"
                        className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5"
                      />
                    </label>
                  </div>
                )}

                {/* Response Input */}
                {phase === 'respond' && (
                  <div className="space-y-3">
                    <textarea
                      rows={activeSet.format === 'WAT' ? 2 : activeSet.format === 'SRT' ? 3 : 7}
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={
                        activeSet.format === 'WAT'
                          ? 'Write one natural, spontaneous, constructive sentence...'
                          : activeSet.format === 'SRT'
                            ? 'Write clear, practical step-by-step action you would actually take...'
                            : 'Write your complete story (Background → Action Taken → Practical Outcome)...'
                      }
                      className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:border-[#142B46] focus:outline-none"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-slate-500">
                        Progress: <strong>{stimIdx + 1} / {activeSet.stimuli.length}</strong> · Avoid memorized clichés — authentic, practical actions score highest.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {stimIdx + 1 < activeSet.stimuli.length &&
                          (collectedAnswers.length > 0 || currentAnswer.trim().length > 0) && (
                            <button
                              type="button"
                              disabled={submittingSession}
                              onClick={() => {
                                const currentStim = activeSet.stimuli[stimIdx];
                                const finalList = currentAnswer.trim()
                                  ? [
                                      ...collectedAnswers,
                                      {
                                        stimulusId: currentStim.id,
                                        candidateResponse: currentAnswer.trim(),
                                        timeTakenSeconds: Math.max(1, elapsedForStim),
                                      },
                                    ]
                                  : collectedAnswers;
                                void submitCompleteSession(finalList);
                              }}
                              className="rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
                            >
                              Finish &amp; Evaluate ({collectedAnswers.length + (currentAnswer.trim() ? 1 : 0)} Answered)
                            </button>
                          )}
                        <button
                          type="button"
                          disabled={submittingSession}
                          onClick={handleNextStimulus}
                          className="rounded-lg bg-[#142B46] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1E3B5C] disabled:opacity-60"
                        >
                          {stimIdx + 1 < activeSet.stimuli.length
                            ? 'Save & Next Stimulus →'
                            : activeSet.format === 'PPDT'
                              ? 'Proceed to Narration & GD →'
                              : submittingSession
                                ? 'Analyzing…'
                                : 'Submit Set for AI Analysis'}
                        </button>
                      </div>
                    </div>
                    <AnimatedProgressBar
                      value={Math.round(((stimIdx + 1) / Math.max(1, activeSet.stimuli.length)) * 100)}
                      heightClassName="h-1.5"
                      className="bg-slate-100"
                      barClassName="bg-[#142B46]"
                    />
                  </div>
                )}
              </AnimatedPageTransition>
            ) : null}
          </div>
        )}

        {/* ==================== TAB 4: 15-OLQ DEVELOPMENT PROFILE ==================== */}
        {activeTab === 'olq' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#142B46]">
                  15 Officer Like Qualities (OLQ) Behavioural Development Profile
                </h2>
                <p className="text-xs text-slate-600">
                  Corroboration rule enforced: an OLQ band is assigned only after ≥ 2 practice signals across exercises.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 print:hidden"
              >
                <Printer className="h-3.5 w-3.5" /> Print / Save PDF Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.olqProfile.indicators.map((ind) => (
                <div key={ind.key} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500">{ind.group}</p>
                      <h4 className="text-sm font-bold text-[#142B46]">{ind.name}</h4>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        ind.developmentLevel === 'Consistent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ind.developmentLevel === 'Developing'
                            ? 'bg-blue-100 text-blue-800'
                            : ind.developmentLevel === 'Emerging'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ind.developmentLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Evidence signals: {ind.evidenceCount}</span>
                    <span className="font-bold text-[#142B46]">
                      {ind.score !== null ? `${ind.score}%` : 'Awaiting ≥2 signals'}
                    </span>
                  </div>
                  {ind.score !== null && (
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#142B46]" style={{ width: `${ind.score}%` }} />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-600 pt-1">
                    <strong>Habit Builder:</strong> {ind.suggestedActivity}
                  </p>
                </div>
              ))}
            </div>

            {/* Self-Reflection Journal */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 print:hidden">
              <h3 className="text-sm font-bold text-[#142B46]">Daily Officer Habit & Self-Reflection Log</h3>
              <form onSubmit={handleAddReflection} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <select
                  aria-label="Focus OLQ"
                  value={reflectionOlq}
                  onChange={(e) => setReflectionOlq(e.target.value as OlqKey)}
                  className="md:col-span-3 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                >
                  {data.olqProfile.indicators.map((i) => (
                    <option key={i.key} value={i.key}>
                      {i.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={reflectionNote}
                  onChange={(e) => setReflectionNote(e.target.value)}
                  placeholder="Write one concrete real-life action you practiced today..."
                  className="md:col-span-7 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="md:col-span-2 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-white"
                >
                  Save Reflection
                </button>
              </form>
              {data.profile.selfReflections.length > 0 && (
                <div className="space-y-2">
                  {data.profile.selfReflections.slice(0, 6).map((ref) => (
                    <div key={ref.id} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs flex justify-between gap-2">
                      <span>{ref.note}</span>
                      <span className="text-slate-500 shrink-0">{ref.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: PRACTICE HISTORY ==================== */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#142B46]">Completed Practice Sessions</h2>
            {data.profile.sessions.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-600">
                No completed sessions yet. Launch any WAT, SRT, TAT, or PPDT practice set to build your performance archive.
              </div>
            ) : (
              data.profile.sessions.map((sess) => (
                <div key={sess.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="rounded bg-[#142B46]/10 px-2 py-0.5 text-[11px] font-bold text-[#142B46]">
                        {sess.setCode} · {sess.format}
                      </span>
                      <span className="ml-2 text-sm font-bold text-slate-900">{sess.setTitle}</span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-3">
                      <span>Practicality: <strong>{sess.overallPracticality}%</strong></span>
                      <span>Clarity: <strong>{sess.overallClarity}%</strong></span>
                      <span>{sess.completedAt.slice(0, 10)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {sess.responses.slice(0, 4).map((r, i) => (
                      <div key={r.stimulusId + i} className="rounded bg-slate-50 p-2.5 text-xs border border-slate-100">
                        <p className="font-semibold text-slate-800">{r.prompt}</p>
                        <p className="text-slate-600 mt-0.5">“{r.candidateResponse}”</p>
                        <p className="text-[11px] text-amber-800 mt-1">{r.authenticityFlag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ==================== TAB 6: SUBSCRIPTION & DPDP PRIVACY ==================== */}
        {activeTab === 'subscription' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#142B46]">SSB Academy Subscription Status</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  {data.profile.subscription.planStatus}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Valid until: <strong>{data.profile.subscription.validUntil}</strong> · Unlocked practice sets:{' '}
                <strong>{data.profile.subscription.unlockedSetLimit}</strong>
              </p>

              {data.pricingConfig.priceStatus === 'enquiry_only' ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2 text-xs text-amber-950">
                  <p className="font-bold">Official Fee Schedule — Enquiry Only</p>
                  <p>
                    Rai Plus never displays unapproved placeholder fees. Your account currently includes{' '}
                    {data.pricingConfig.freeDemoSetsIncluded} Free Demo Sets & Trial access. Once Super Admin publishes official SSB subscription tiers, upgrade options will activate here automatically.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { id: 'monthly' as const, label: 'Monthly', price: data.pricingConfig.monthlyInr },
                      { id: 'quarterly' as const, label: 'Quarterly', price: data.pricingConfig.quarterlyInr },
                      { id: 'half_yearly' as const, label: 'Half-Yearly', price: data.pricingConfig.halfYearlyInr },
                      { id: 'annual' as const, label: 'Annual', price: data.pricingConfig.annualInr },
                    ] as const
                  )
                    .filter((t) => t.price && t.price > 0)
                    .map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => void handleActivateTier(tier.id)}
                        className="rounded-xl border border-slate-200 p-3 text-left hover:border-[#142B46] hover:bg-slate-50"
                      >
                        <p className="text-xs font-bold text-slate-600">{tier.label}</p>
                        <p className="text-lg font-extrabold text-[#142B46]">₹{tier.price}</p>
                        <p className="text-[11px] text-slate-500">+{data.pricingConfig.gstPct}% GST · 100 Sets</p>
                      </button>
                    ))}
                </div>
              )}

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code (e.g. SSB-EARLY20)"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-white"
                >
                  Apply Coupon
                </button>
              </form>

              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2">Payment & Trial Ledger</p>
                <div className="space-y-1.5">
                  {data.profile.subscription.paymentHistory.map((p) => (
                    <div key={p.id} className="flex justify-between text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded">
                      <span>{p.date} · {p.reference}</span>
                      <span className="font-semibold">₹{p.amountInr} ({p.status})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DPDP Privacy & Data Controls */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <h3 className="text-base font-bold text-[#142B46] flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-700" /> Data Privacy & DPDP Controls
              </h3>
              <p className="text-xs text-slate-600">
                Your SSB responses, narration metadata, and OLQ profiles are strictly private to your standalone account. No school ERP tenant can view your records.
              </p>
              <button
                type="button"
                onClick={() => void handleExportPrivacyData()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" /> Download Full Personal Data Export (JSON)
              </button>
              <form onSubmit={handleDeleteRequest} className="pt-3 border-t border-slate-200 space-y-2">
                <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" /> Request Account & Practice Data Erasure
                </p>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Optional reason for erasure request..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Submit DPDP Deletion Request
                </button>
              </form>
            </div>
          </div>
        )}
        </AnimatedPageTransition>
      </main>
    </div>
  );
};
