import React, { useMemo, useRef, useState } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardEdit,
  Heart,
  Mic,
  Play,
  ShieldCheck,
  Square,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WorkspaceData } from '../../types/workspace';
import {
  canApproveMultidisciplinaryPlan,
  canEnterClinicalDiagnosis,
  CLINICAL_SPECIALIST_ROLES,
} from '../../utils/clinicalCareEngine';
import { apiRequest } from '../../utils/api';

interface Props {
  data: WorkspaceData;
  token: string;
  selectedStudentId: string;
  onRefresh: () => Promise<void>;
  mode: 'plans_and_daily' | 'audio_studio' | 'parent_home';
}

export const ClinicalTherapyWorkspaceAndPractice: React.FC<Props> = ({
  data,
  token,
  selectedStudentId,
  onRefresh,
  mode,
}) => {
  const clinical = data.clinicalCare;
  const role = data.user.role;
  const isSpecialist = CLINICAL_SPECIALIST_ROLES.includes(role);
  const canApprove = canApproveMultidisciplinaryPlan(role);
  const canDiagnose = canEnterClinicalDiagnosis(role);

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Plan Builder State (Part 5)
  const [planType, setPlanType] = useState<
    | 'Speech & Articulation'
    | 'Fluency & Communication'
    | 'Multidisciplinary Developmental Support'
    | 'Special Education Support'
  >('Speech & Articulation');
  const [assessmentSummary, setAssessmentSummary] = useState('');
  const [confirmedDiagnosis, setConfirmedDiagnosis] = useState('');
  const [goalDomain, setGoalDomain] = useState('Articulation / Functional Communication');
  const [goalStatement, setGoalStatement] = useState('');
  const [selectedIntervention, setSelectedIntervention] = useState('');
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [sessionDurationMin, setSessionDurationMin] = useState(30);
  const [dailyHomePracticeMin, setDailyHomePracticeMin] = useState(10);
  const [reassessmentDate, setReassessmentDate] = useState('2026-12-28');
  const [parentGuidance, setParentGuidance] = useState('');
  const [teacherGuidance, setTeacherGuidance] = useState('');

  // Daily Therapy Session Logger (Part 6)
  const [logPlanId, setLogPlanId] = useState('');
  const [logExercise, setLogExercise] = useState('');
  const [logTarget, setLogTarget] = useState('');
  const [logAccuracy, setLogAccuracy] = useState('80');
  const [logAttempts, setLogAttempts] = useState('12');
  const [logAssist, setLogAssist] = useState<
    'Independent' | 'Minimal Verbal/Visual Cue' | 'Moderate Guided Cue' | 'Full Modelling'
  >('Minimal Verbal/Visual Cue');
  const [logEngagement, setLogEngagement] = useState<
    'High' | 'Steady' | 'Variable' | 'Needed Encouragement'
  >('High');
  const [logComfort, setLogComfort] = useState(5);
  const [logDifficulties, setLogDifficulties] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [logNextActivity, setLogNextActivity] = useState('');

  // Local Consent-Gated Audio Practice State (Part 7)
  const [recording, setRecording] = useState(false);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [localDurationSec, setLocalDurationSec] = useState(20);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number>(0);
  const [audioTargetWords, setAudioTargetWords] = useState('rain, rabbit, carrot, red ribbon');
  const [audioLangContext, setAudioLangContext] = useState('English (Hindi/English bilingual speaker)');
  const [audioAccentNote, setAudioAccentNote] = useState(
    'Natural Indian English rhythm respected; never equated with articulation disorder.',
  );
  const [audioTranscript, setAudioTranscript] = useState('');
  const [audioAnnotation, setAudioAnnotation] = useState('');

  // Parent Home Practice State (Part 8)
  const [homeDuration, setHomeDuration] = useState(10);
  const [homeComfort, setHomeComfort] = useState<
    'Enjoyed / Comfortable' | 'Steady' | 'Tired — Stopped Early'
  >('Enjoyed / Comfortable');
  const [homeObservation, setHomeObservation] = useState('');

  const selectedStudent = useMemo(
    () => data.students.find((s) => s.id === selectedStudentId) || data.students[0],
    [data.students, selectedStudentId],
  );

  const studentPlans = useMemo(
    () =>
      (clinical?.therapyPlans || []).filter(
        (p) => !selectedStudent || p.studentId === selectedStudent.id,
      ),
    [clinical?.therapyPlans, selectedStudent],
  );
  const activePlan = studentPlans.find((p) => p.approvalStatus === 'Approved & Active') || studentPlans[0];

  const studentLogs = useMemo(
    () =>
      (clinical?.therapySessionLogs || []).filter(
        (l) => !selectedStudent || l.studentId === selectedStudent.id,
      ),
    [clinical?.therapySessionLogs, selectedStudent],
  );

  const studentApprovedExercises = useMemo(
    () =>
      (clinical?.speechExercises || []).filter(
        (e) =>
          (!selectedStudent || e.studentId === selectedStudent.id) &&
          e.reviewStatus === 'Approved by SLP',
      ),
    [clinical?.speechExercises, selectedStudent],
  );

  const studentFluencyHome = useMemo(
    () =>
      (clinical?.fluencyProfiles || []).filter(
        (f) => (!selectedStudent || f.studentId === selectedStudent.id) && f.slpApproved,
      ),
    [clinical?.fluencyProfiles, selectedStudent],
  );

  const studentHomeLogs = useMemo(
    () =>
      (clinical?.parentHomePracticeLogs || []).filter(
        (l) => !selectedStudent || l.studentId === selectedStudent.id,
      ),
    [clinical?.parentHomePracticeLogs, selectedStudent],
  );

  const studentConsent = useMemo(
    () =>
      (clinical?.consents || []).find(
        (c) => selectedStudent && c.studentId === selectedStudent.id,
      ),
    [clinical?.consents, selectedStudent],
  );

  const studentAudioRecords = useMemo(
    () =>
      (clinical?.audioPracticeRecords || []).filter(
        (a) => !selectedStudent || a.studentId === selectedStudent.id,
      ),
    [clinical?.audioPracticeRecords, selectedStudent],
  );

  const chartData = useMemo(
    () =>
      [...studentLogs]
        .reverse()
        .filter((l) => l.accuracyPct !== null && l.accuracyPct !== undefined)
        .map((l) => ({
          date: l.sessionDate.slice(5),
          accuracy: l.accuracyPct,
          comfort: (l.communicationComfortRating || 4) * 20,
        })),
    [studentLogs],
  );

  async function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/therapy-plans',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            planType,
            assessmentSummary,
            confirmedClinicalDiagnosis: canDiagnose ? confirmedDiagnosis : undefined,
            therapyGoals: [{ domain: goalDomain, goalStatement }],
            selectedIntervention,
            sessionsPerWeek,
            sessionDurationMin,
            dailyHomePracticeMin,
            reassessmentDate,
            homePracticeRecommendations: parentGuidance,
            parentGuidance,
            teacherClassroomGuidance: teacherGuidance,
          }),
        },
        token,
      );
      await onRefresh();
      setAssessmentSummary('');
      setGoalStatement('');
      setSelectedIntervention('');
      setFeedback({
        kind: 'ok',
        text: 'Personalised therapy plan saved as Draft. Explicit specialist sign-off is required before activation.',
      });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Failed to create therapy plan.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleApprovePlan(planId: string) {
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/clinical/therapy-plans/${planId}/approve`,
        {
          method: 'PATCH',
        },
        token,
      );
      await onRefresh();
      setFeedback({ kind: 'ok', text: 'Therapy plan signed & activated for Daily Therapy and Parent Home Practice.' });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Plan approval failed.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleLogSession(e: React.FormEvent) {
    e.preventDefault();
    const targetPlanId = logPlanId || activePlan?.id;
    if (!targetPlanId) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/therapy-sessions',
        {
          method: 'POST',
          body: JSON.stringify({
            planId: targetPlanId,
            exerciseTitle: logExercise,
            targetFocus: logTarget,
            accuracyPct: logAccuracy === '' ? null : Number(logAccuracy),
            attemptsCount: Number(logAttempts) || 10,
            assistanceLevel: logAssist,
            studentEngagement: logEngagement,
            communicationComfortRating: logComfort,
            observedDifficulties: logDifficulties,
            therapistNotes: logNotes,
            nextRecommendedActivity: logNextActivity,
          }),
        },
        token,
      );
      await onRefresh();
      setLogExercise('');
      setLogNotes('');
      setLogDifficulties('');
      setFeedback({ kind: 'ok', text: 'Daily therapy session recorded cleanly.' });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Could not log therapy session.' });
    } finally {
      setBusy(false);
    }
  }

  async function startLocalRecording() {
    setFeedback(null);
    if (!studentConsent?.audioRecordingConsent) {
      setFeedback({
        kind: 'err',
        text: 'Parent/guardian audio recording consent must be verified in Governance before recording.',
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      recordStartRef.current = Date.now();
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
        setLocalAudioUrl(URL.createObjectURL(blob));
        setLocalDurationSec(Math.max(1, Math.round((Date.now() - recordStartRef.current) / 1000)));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setFeedback({
        kind: 'err',
        text: 'Microphone unavailable in this browser session — you can still record clinician-verified transcript annotations below.',
      });
    }
  }

  function stopLocalRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function handleSaveAudioAnnotation(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/audio-records',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            languageContext: audioLangContext,
            accentAndDialectNote: audioAccentNote,
            targetWords: audioTargetWords.split(',').map((w) => w.trim()).filter(Boolean),
            localDurationSec,
            therapistTranscript: audioTranscript,
            therapistAnnotation: audioAnnotation,
          }),
        },
        token,
      );
      await onRefresh();
      setAudioTranscript('');
      setAudioAnnotation('');
      setFeedback({
        kind: 'ok',
        text: 'Consent-verified audio annotation saved locally (zero external AI upload).',
      });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Could not save audio record.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleLogHomePractice(exerciseTitle: string, exerciseId?: string) {
    if (!activePlan) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/home-practice',
        {
          method: 'POST',
          body: JSON.stringify({
            planId: activePlan.id,
            exerciseId,
            exerciseTitle,
            durationMin: homeDuration,
            childComfort: homeComfort,
            parentObservation: homeObservation || 'Completed calmly together at home.',
          }),
        },
        token,
      );
      await onRefresh();
      setHomeObservation('');
      setFeedback({
        kind: 'ok',
        text: 'Wonderful! Home practice moment logged — thank you for keeping practice calm and encouraging.',
      });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Could not save home practice log.' });
    } finally {
      setBusy(false);
    }
  }

  // PART 8: PARENT HOME PRACTICE APPLICATION
  if (mode === 'parent_home') {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex items-center gap-2 text-blue-900">
            <Heart className="h-4 w-4" />
            <h2 className="text-base font-bold text-slate-900">
              Parent Home Practice Guide · {selectedStudent?.name}
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Every activity shown here has been personally reviewed and approved by your child’s specialist. Keep home practice short, joyful, and pressure-free — stopping early on a happy note is always better than repeating when tired.
          </p>
        </div>

        {feedback && (
          <div
            className={`rounded-lg border px-4 py-2.5 text-xs font-medium ${
              feedback.kind === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {!activePlan ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-600">
            No SLP-approved home practice plan is active yet for {selectedStudent?.name || 'this child'}. Home exercises appear here only after formal specialist review and approval.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{activePlan.planType}</h3>
                    <p className="text-xs text-slate-500">
                      Approved by {activePlan.approvedByName || activePlan.createdBy} · Next Review:{' '}
                      <span className="tabular-nums">{activePlan.reassessmentDate}</span>
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                    {activePlan.dailyHomePracticeMin} min / relaxed session
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Warm Parent Guidance:</span>{' '}
                  {activePlan.parentGuidance}
                </p>
                <p className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Suggested Rhythm:</span>{' '}
                  {activePlan.homePracticeRecommendations}
                </p>
              </div>

              {/* Approved Articulation Exercises */}
              {studentApprovedExercises.map((ex) => (
                <div key={ex.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{ex.title}</h4>
                      <p className="text-xs text-slate-500">
                        {ex.targetLanguage} · About {ex.suggestedDurationMin} minutes
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleLogHomePractice(ex.title, ex.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Practised Today
                    </button>
                  </div>
                  <p className="text-xs text-slate-700">{ex.studentInstructions}</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                    {ex.practiceItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  {ex.therapistFeedback && (
                    <p className="text-xs text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2">
                      Therapist Note: {ex.therapistFeedback}
                    </p>
                  )}
                </div>
              ))}

              {/* Approved Fluency Home Activities */}
              {studentFluencyHome.flatMap((fp) =>
                fp.approvedPracticeActivities.map((act) => (
                  <div key={act.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{act.title}</h4>
                        <p className="text-xs text-slate-500">{act.category}</p>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleLogHomePractice(act.title)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Log Activity
                      </button>
                    </div>
                    <p className="text-xs text-slate-700">{act.description}</p>
                  </div>
                )),
              )}
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Share How Today’s Practice Felt</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Minutes Spent</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={homeDuration}
                      onChange={(e) => setHomeDuration(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Child’s Comfort</label>
                    <select
                      value={homeComfort}
                      onChange={(e) => setHomeComfort(e.target.value as typeof homeComfort)}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                    >
                      <option>Enjoyed / Comfortable</option>
                      <option>Steady</option>
                      <option>Tired — Stopped Early</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={homeObservation}
                  onChange={(e) => setHomeObservation(e.target.value)}
                  placeholder="Optional note for the therapist (e.g. favourite word or joyful moment)..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <p className="text-[11px] text-slate-500">
                  Set your comfort note above, then click &ldquo;Mark Practised Today&rdquo; on any approved card.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Home Practice Moments ({studentHomeLogs.length})
                </h3>
                {studentHomeLogs.length === 0 ? (
                  <p className="text-xs text-slate-500">No home sessions logged yet.</p>
                ) : (
                  studentHomeLogs.map((log) => (
                    <div key={log.id} className="border-t border-slate-100 pt-2.5 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900">{log.exerciseTitle}</span>
                        <span className="text-slate-500 tabular-nums">{log.completedDate}</span>
                      </div>
                      <p className="text-slate-600">
                        {log.durationMin} min · {log.childComfort}
                      </p>
                      <p className="text-slate-700">{log.parentObservation}</p>
                      {log.therapistReply && (
                        <p className="text-emerald-800 font-medium">Therapist Reply: {log.therapistReply}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PART 7: CONSENT-GATED LOCAL AUDIO PRACTICE STUDIO
  if (mode === 'audio_studio') {
    const hasAudioConsent = Boolean(studentConsent?.audioRecordingConsent);

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-blue-900" />
            <span>Consent-Gated On-Device Speech Audio Review & Clinician Annotation</span>
          </div>
          <p>
            Audio recordings stay strictly on-device for SLP playback and manual annotation — child recordings are never uploaded to external AI servers, and automated speech recognition is never used to diagnose articulation or stammering. Indian English, Hindi, and regional accents are respected.
          </p>
        </div>

        {feedback && (
          <div
            className={`rounded-lg border px-4 py-2.5 text-xs font-medium ${
              feedback.kind === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Local Practice Recorder · {selectedStudent?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Audio Recording Consent:{' '}
                  <span className={hasAudioConsent ? 'font-semibold text-emerald-700' : 'font-semibold text-red-700'}>
                    {hasAudioConsent ? 'Verified by Guardian' : 'Not Granted — Recording Blocked'}
                  </span>
                </p>
              </div>
              {!recording ? (
                <button
                  type="button"
                  disabled={!hasAudioConsent}
                  onClick={() => void startLocalRecording()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-45"
                >
                  <Mic className="h-3.5 w-3.5" />
                  Record Locally
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopLocalRecording}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  <Square className="h-3.5 w-3.5" />
                  Stop Recording
                </button>
              )}
            </div>

            {localAudioUrl && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Play className="h-3.5 w-3.5 text-blue-900" />
                    Local Session Playback ({localDurationSec}s · Not uploaded to cloud)
                  </span>
                </div>
                <audio controls src={localAudioUrl} className="w-full h-9" />
              </div>
            )}

            <form onSubmit={handleSaveAudioAnnotation} className="space-y-3">
              <input
                type="text"
                value={audioLangContext}
                onChange={(e) => setAudioLangContext(e.target.value)}
                placeholder="Language & multilingual context"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={audioTargetWords}
                onChange={(e) => setAudioTargetWords(e.target.value)}
                placeholder="Target words practised (comma-separated)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={audioAccentNote}
                onChange={(e) => setAudioAccentNote(e.target.value)}
                placeholder="Indian English / Hindi / regional accent safeguard note"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <textarea
                required
                rows={2}
                value={audioTranscript}
                onChange={(e) => setAudioTranscript(e.target.value)}
                placeholder="Clinician-verified speech sample transcript..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <textarea
                required
                rows={2}
                value={audioAnnotation}
                onChange={(e) => setAudioAnnotation(e.target.value)}
                placeholder="SLP clinical annotation & comparison with prior sample..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <button
                type="submit"
                disabled={busy || !hasAudioConsent}
                className="w-full rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-45"
              >
                {busy ? 'Saving...' : 'Save Clinician Audio Annotation'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Annotated Practice Samples ({studentAudioRecords.length})
            </h3>
            {studentAudioRecords.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500">
                No consent-verified audio practice annotations recorded for {selectedStudent?.name}.
              </div>
            ) : (
              studentAudioRecords.map((rec) => (
                <div key={rec.id} className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">{rec.languageContext}</span>
                    <span className="text-slate-500 tabular-nums">
                      {rec.recordedAt} · {rec.localDurationSec}s
                    </span>
                  </div>
                  <p className="text-slate-600">Target Words: {rec.targetWords.join(' · ')}</p>
                  <p className="text-slate-800">
                    <span className="font-semibold">Transcript:</span> &ldquo;{rec.therapistTranscript}&rdquo;
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold">SLP Annotation:</span> {rec.therapistAnnotation}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Accent Safeguard: {rec.accentAndDialectNote} · External AI Upload: Disabled
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // PARTS 5 & 6: PERSONALIZED THERAPY PLAN GENERATOR + DAILY THERAPY WORKSPACE
  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`rounded-lg border px-4 py-2.5 text-xs font-medium ${
            feedback.kind === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Active & Draft Personalised Therapy Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Personalised Intervention Plans · {selectedStudent?.name} ({studentPlans.length})
          </h2>
          {studentPlans.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500">
              No individualised therapy plan created yet for {selectedStudent?.name || 'this student'}.
            </div>
          ) : (
            studentPlans.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {plan.planType} · {plan.studentName}
                    </h3>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {plan.sessionsPerWeek}×/week · {plan.sessionDurationMin} min/session · Home:{' '}
                      {plan.dailyHomePracticeMin} min/day · Reassessment: {plan.reassessmentDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        plan.approvalStatus === 'Approved & Active' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {plan.approvalStatus}
                    </span>
                    {canApprove && plan.approvalStatus !== 'Approved & Active' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleApprovePlan(plan.id)}
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 whitespace-nowrap"
                      >
                        Approve & Activate
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700">{plan.assessmentSummary}</p>

                {plan.confirmedClinicalDiagnosis && (
                  <p className="text-xs text-slate-800 bg-slate-50 rounded-lg px-3 py-2">
                    <span className="font-semibold">Clinician-Entered Diagnosis:</span>{' '}
                    {plan.confirmedClinicalDiagnosis} ({plan.diagnosisEnteredBy} · {plan.diagnosisCredentials})
                  </p>
                )}

                <div>
                  <p className="text-xs font-semibold text-slate-900 mb-1">Individualised Therapy Goals</p>
                  <div className="space-y-1.5">
                    {plan.therapyGoals.map((g) => (
                      <div key={g.id} className="border-t border-slate-100 pt-1.5 text-xs flex justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-800">{g.domain}</p>
                          <p className="text-slate-600">{g.goalStatement}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-900 shrink-0">{g.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-2.5 text-xs">
                  {plan.parentGuidance && (
                    <div>
                      <p className="font-semibold text-slate-900">Parent Guidance</p>
                      <p className="text-slate-600 mt-0.5">{plan.parentGuidance}</p>
                    </div>
                  )}
                  {plan.teacherClassroomGuidance && (
                    <div>
                      <p className="font-semibold text-slate-900">Authorised Teacher Classroom Guidance</p>
                      <p className="text-slate-600 mt-0.5">{plan.teacherClassroomGuidance}</p>
                    </div>
                  )}
                </div>

                {plan.approvedByName && (
                  <p className="text-[11px] text-slate-500">
                    Signed by {plan.approvedByName}{' '}
                    {plan.approvedByRegistrationNo ? `(${plan.approvedByRegistrationNo})` : ''} on{' '}
                    {plan.approvedAt}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create New Personalised Therapy Plan (Part 5) */}
        <div className="lg:col-span-5">
          {isSpecialist ? (
            <form
              onSubmit={handleCreatePlan}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <ClipboardEdit className="h-4 w-4 text-blue-900" />
                <h3 className="text-sm font-bold text-slate-900">Create Personalised Therapy Plan</h3>
              </div>
              <p className="text-xs text-slate-500">
                Therapy frequency, cycle, and reassessment interval are clinician-configurable. Plans start as Draft until signed by a qualified specialist.
              </p>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as typeof planType)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              >
                <option>Speech & Articulation</option>
                <option>Fluency & Communication</option>
                <option>Multidisciplinary Developmental Support</option>
                <option>Special Education Support</option>
              </select>
              <textarea
                required
                rows={2}
                value={assessmentSummary}
                onChange={(e) => setAssessmentSummary(e.target.value)}
                placeholder="Approved assessment summary *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              {canDiagnose && (
                <input
                  type="text"
                  value={confirmedDiagnosis}
                  onChange={(e) => setConfirmedDiagnosis(e.target.value)}
                  placeholder="Optional confirmed clinical diagnosis (Clinical Psychologist only)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              )}
              <input
                type="text"
                value={goalDomain}
                onChange={(e) => setGoalDomain(e.target.value)}
                placeholder="Primary goal domain"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <textarea
                required
                rows={2}
                value={goalStatement}
                onChange={(e) => setGoalStatement(e.target.value)}
                placeholder="Measurable, individualised therapy goal *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <input
                required
                type="text"
                value={selectedIntervention}
                onChange={(e) => setSelectedIntervention(e.target.value)}
                placeholder="Selected evidence-informed intervention *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Sessions/Wk</label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={sessionsPerWeek}
                    onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Duration (m)</label>
                  <input
                    type="number"
                    min={15}
                    max={90}
                    value={sessionDurationMin}
                    onChange={(e) => setSessionDurationMin(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Home (m/day)</label>
                  <input
                    type="number"
                    min={5}
                    max={30}
                    value={dailyHomePracticeMin}
                    onChange={(e) => setDailyHomePracticeMin(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs tabular-nums"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Editable Reassessment Date
                </label>
                <input
                  type="date"
                  value={reassessmentDate}
                  onChange={(e) => setReassessmentDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs tabular-nums"
                />
              </div>
              <input
                type="text"
                value={parentGuidance}
                onChange={(e) => setParentGuidance(e.target.value)}
                placeholder="Parent home practice guidance (supportive, non-pressuring)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={teacherGuidance}
                onChange={(e) => setTeacherGuidance(e.target.value)}
                placeholder="Authorised teacher classroom guidance (non-confidential)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {busy ? 'Saving Draft...' : 'Save Plan Draft for Approval'}
              </button>
            </form>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600">
              Personalised therapy plans are authored and approved solely by qualified clinical specialists.
            </div>
          )}
        </div>
      </div>

      {/* PART 6: DAILY THERAPY WORKSPACE & PROGRESS CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-slate-200 pt-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Daily Therapy Workspace & Progress Trend ({studentLogs.length} Sessions)
            </h3>
          </div>

          {chartData.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-700 mb-3">
                Target Accuracy & Communication Comfort Trajectory
              </p>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      name="Target Accuracy %"
                      stroke="#1e3a8a"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="comfort"
                      name="Comfort Index"
                      stroke="#0f766e"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {studentLogs.map((log) => (
              <div key={log.id} className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{log.exerciseTitle}</span>
                  <span className="text-slate-500 tabular-nums">
                    {log.sessionDate} · {log.attendanceStatus}
                  </span>
                </div>
                <p className="text-slate-600 tabular-nums">
                  Target: {log.targetFocus} · Accuracy:{' '}
                  {log.accuracyPct !== null && log.accuracyPct !== undefined ? `${log.accuracyPct}%` : 'Comfort-focused'} ·{' '}
                  Attempts: {log.attemptsCount} · Cueing: {log.assistanceLevel} · Engagement: {log.studentEngagement}
                </p>
                {log.observedDifficulties && (
                  <p className="text-slate-700">Observed: {log.observedDifficulties}</p>
                )}
                <p className="text-slate-700">Notes: {log.therapistNotes}</p>
                {log.nextRecommendedActivity && (
                  <p className="font-medium text-blue-900">Next Activity: {log.nextRecommendedActivity}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {isSpecialist && activePlan && (
          <form
            onSubmit={handleLogSession}
            className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-3 h-fit"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <CalendarCheck2 className="h-4 w-4 text-blue-900" />
              <h3 className="text-sm font-bold text-slate-900">Record Today’s Therapy Session</h3>
            </div>
            <select
              value={logPlanId || activePlan.id}
              onChange={(e) => setLogPlanId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            >
              {studentPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.planType} ({p.approvalStatus})
                </option>
              ))}
            </select>
            <input
              required
              type="text"
              value={logExercise}
              onChange={(e) => setLogExercise(e.target.value)}
              placeholder="Exercise completed *"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={logTarget}
              onChange={(e) => setLogTarget(e.target.value)}
              placeholder="Specific target focus"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Accuracy %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={logAccuracy}
                  onChange={(e) => setLogAccuracy(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Attempts</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={logAttempts}
                  onChange={(e) => setLogAttempts(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Comfort (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={logComfort}
                  onChange={(e) => setLogComfort(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs tabular-nums"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={logAssist}
                onChange={(e) => setLogAssist(e.target.value as typeof logAssist)}
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
              >
                <option>Independent</option>
                <option>Minimal Verbal/Visual Cue</option>
                <option>Moderate Guided Cue</option>
                <option>Full Modelling</option>
              </select>
              <select
                value={logEngagement}
                onChange={(e) => setLogEngagement(e.target.value as typeof logEngagement)}
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
              >
                <option>High</option>
                <option>Steady</option>
                <option>Variable</option>
                <option>Needed Encouragement</option>
              </select>
            </div>
            <input
              type="text"
              value={logDifficulties}
              onChange={(e) => setLogDifficulties(e.target.value)}
              placeholder="Observed difficulties"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <textarea
              rows={2}
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="Session notes (confidential clinical workspace)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={logNextActivity}
              onChange={(e) => setLogNextActivity(e.target.value)}
              placeholder="Next recommended activity"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {busy ? 'Recording...' : 'Record Therapy Session'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
