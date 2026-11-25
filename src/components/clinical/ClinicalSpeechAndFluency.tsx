import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  HeartHandshake,
  Mic2,
  Plus,
  Sparkles,
  Volume2,
} from 'lucide-react';
import type { WorkspaceData } from '../../types/workspace';
import type {
  ArticulationStageNumber,
  FluencyApproachType,
  SpeechSoundPosition,
} from '../../types/clinical';
import {
  ARTICULATION_STAGES,
  SPEECH_SOUND_GROUPS,
} from '../../utils/clinicalCareEngine';
import { apiRequest } from '../../utils/api';

interface Props {
  data: WorkspaceData;
  token: string;
  selectedStudentId: string;
  onRefresh: () => Promise<void>;
  mode: 'speech_articulation' | 'fluency_stammering';
}

const POSITION_LABELS: Array<{ key: SpeechSoundPosition; label: string }> = [
  { key: 'initial', label: 'Initial' },
  { key: 'medial', label: 'Medial' },
  { key: 'final', label: 'Final' },
  { key: 'syllables', label: 'Syllables' },
  { key: 'single_words', label: 'Words' },
  { key: 'phrases', label: 'Phrases' },
  { key: 'sentences', label: 'Sentences' },
  { key: 'reading_aloud', label: 'Reading' },
  { key: 'spontaneous_conversation', label: 'Conversation' },
];

const FLUENCY_APPROACHES: FluencyApproachType[] = [
  'Parent-Child Interaction Approach',
  'Preschool Stuttering Intervention',
  'Stuttering Modification Approach',
  'Fluency Shaping Approach',
  'Communication Participation & Confidence',
  'Cognitive & Emotional Communication Support',
  'Family Counselling & Classroom Support',
];

export const ClinicalSpeechAndFluency: React.FC<Props> = ({
  data,
  token,
  selectedStudentId,
  onRefresh,
  mode,
}) => {
  const clinical = data.clinicalCare;
  const role = data.user.role;
  const isSlp = role === 'slp';
  const canEditSpeech = role === 'slp' || role === 'audiologist' || role === 'clinical_psychologist';

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Articulation Target Form
  const [targetSound, setTargetSound] = useState('/r/');
  const [soundGroup, setSoundGroup] = useState<string>(SPEECH_SOUND_GROUPS[0]);
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Bilingual (English + Hindi)' | 'Regional / Multilingual'>('English');
  const [errorType, setErrorType] = useState<'Substitution' | 'Omission' | 'Distortion' | 'Addition' | 'Phonological Process'>('Substitution');
  const [subDetail, setSubDetail] = useState('/w/ for /r/');
  const [affectedPositions, setAffectedPositions] = useState<SpeechSoundPosition[]>(['initial', 'medial', 'single_words']);
  const [wordAcc, setWordAcc] = useState('60');
  const [convAcc, setConvAcc] = useState('35');
  const [stimulability, setStimulability] = useState<'Stimulable with cue' | 'Partially stimulable' | 'Not yet stimulable' | 'To be assessed'>('Stimulable with cue');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Maintenance' | 'Monitor'>('High');
  const [currentStage, setCurrentStage] = useState<ArticulationStageNumber>(2);
  const [functionalImpact, setFunctionalImpact] = useState('');

  // Fluency Profile Form (separate from articulation)
  const [ageOfOnset, setAgeOfOnset] = useState('4.5');
  const [durationMonths, setDurationMonths] = useState('18');
  const [familyHistory, setFamilyHistory] = useState('');
  const [soundRep, setSoundRep] = useState<'Not observed' | 'Mild' | 'Moderate' | 'Frequent'>('Mild');
  const [sylRep, setSylRep] = useState<'Not observed' | 'Mild' | 'Moderate' | 'Frequent'>('Moderate');
  const [wordRep, setWordRep] = useState<'Not observed' | 'Mild' | 'Moderate' | 'Frequent'>('Mild');
  const [prolong, setProlong] = useState<'Not observed' | 'Mild' | 'Moderate' | 'Frequent'>('Not observed');
  const [blocks, setBlocks] = useState<'Not observed' | 'Mild' | 'Moderate' | 'Frequent'>('Not observed');
  const [sitIncrease, setSitIncrease] = useState('');
  const [sitDecrease, setSitDecrease] = useState('');
  const [studentFeelings, setStudentFeelings] = useState('');
  const [confidenceRating, setConfidenceRating] = useState(4);
  const [participationRating, setParticipationRating] = useState(4);
  const [selectedApproaches, setSelectedApproaches] = useState<FluencyApproachType[]>([
    'Parent-Child Interaction Approach',
    'Communication Participation & Confidence',
    'Family Counselling & Classroom Support',
  ]);
  const [classroomSupport, setClassroomSupport] = useState('');

  const selectedStudent = useMemo(
    () => data.students.find((s) => s.id === selectedStudentId) || data.students[0],
    [data.students, selectedStudentId],
  );

  const studentTargets = useMemo(
    () =>
      (clinical?.speechSoundTargets || []).filter(
        (t) => !selectedStudent || t.studentId === selectedStudent.id,
      ),
    [clinical?.speechSoundTargets, selectedStudent],
  );
  const studentExercises = useMemo(
    () =>
      (clinical?.speechExercises || []).filter(
        (e) => !selectedStudent || e.studentId === selectedStudent.id,
      ),
    [clinical?.speechExercises, selectedStudent],
  );
  const studentFluency = useMemo(
    () =>
      (clinical?.fluencyProfiles || []).filter(
        (f) => !selectedStudent || f.studentId === selectedStudent.id,
      ),
    [clinical?.fluencyProfiles, selectedStudent],
  );

  function togglePosition(pos: SpeechSoundPosition) {
    setAffectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos],
    );
  }

  function toggleApproach(app: FluencyApproachType) {
    setSelectedApproaches((prev) =>
      prev.includes(app) ? (prev.length > 1 ? prev.filter((a) => a !== app) : prev) : [...prev, app],
    );
  }

  async function handleAddSpeechTarget(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/speech-targets',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            targetSound,
            soundGroup,
            language,
            errorType,
            substitutionDetail: subDetail,
            affectedPositions,
            accuracyWordLevelPct: wordAcc === '' ? null : Number(wordAcc),
            accuracyConversationPct: convAcc === '' ? null : Number(convAcc),
            stimulability,
            functionalImpact,
            treatmentPriority: priority,
            currentStage,
            accentDifferenceRuledOut: true,
          }),
        },
        token,
      );
      await onRefresh();
      setFunctionalImpact('');
      setFeedback({ kind: 'ok', text: `Language-specific speech target ${targetSound} (${language}) recorded.` });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Failed to save speech target.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateExercise(targetId: string, stage: ArticulationStageNumber) {
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/speech-exercises/generate',
        {
          method: 'POST',
          body: JSON.stringify({ targetId, stage }),
        },
        token,
      );
      await onRefresh();
      setFeedback({
        kind: 'ok',
        text: `Original Stage ${stage} practice draft generated — review & approve as SLP before assigning to home practice.`,
      });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Could not generate exercise.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleApproveExercise(exId: string) {
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/clinical/speech-exercises/${exId}/approve`,
        {
          method: 'PATCH',
          body: JSON.stringify({ assignedToHomePractice: true }),
        },
        token,
      );
      await onRefresh();
      setFeedback({ kind: 'ok', text: 'Exercise approved by SLP and released to Parent Home Practice.' });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Approval failed.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveFluencyProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/fluency-profiles',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            ageOfOnsetYears: ageOfOnset ? Number(ageOfOnset) : undefined,
            durationMonths: durationMonths ? Number(durationMonths) : undefined,
            familyHistory,
            observedPatterns: {
              soundRepetitions: soundRep,
              syllableRepetitions: sylRep,
              wordRepetitions: wordRep,
              prolongations: prolong,
              blocks,
            },
            sampleContextsCollected: ['Conversation', 'Storytelling', 'Classroom Communication', 'Parent-Child Interaction'],
            situationsIncreasingStammering: sitIncrease,
            situationsDecreasingStammering: sitDecrease,
            studentFeelingsAndExperience: studentFeelings,
            communicationConfidenceRating: confidenceRating,
            communicationParticipationRating: participationRating,
            functionalImpactSummary: studentFeelings || 'Participation & confidence tracked holistically.',
            selectedApproaches,
            classroomSupportGuidance: classroomSupport,
          }),
        },
        token,
      );
      await onRefresh();
      setFeedback({ kind: 'ok', text: 'Individualised Fluency / Stammering profile saved.' });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Could not save fluency profile.' });
    } finally {
      setBusy(false);
    }
  }

  // PART 4: SEPARATE FLUENCY & STAMMERING MODULE
  if (mode === 'fluency_stammering') {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
          <p className="font-bold text-slate-900">
            Dedicated Fluency & Stammering Development Module (Strictly Separate from Articulation)
          </p>
          <p className="mt-1">
            Progress is measured holistically through communication comfort, participation, and student experience — never fluency percentage alone. Generic directives like “speak slowly”, “take a deep breath”, or “repeat until fluent” are never prescribed.
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
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Individualised Stammering Profiles · {selectedStudent?.name} ({studentFluency.length})
            </h3>
            {studentFluency.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500">
                No fluency profile recorded for {selectedStudent?.name || 'this student'}.
              </div>
            ) : (
              studentFluency.map((fp) => (
                <div key={fp.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {fp.studentName} · {fp.classSection}
                      </p>
                      <p className="text-xs text-slate-500">
                        SLP: {fp.slpName} {fp.slpRegistrationNo ? `(${fp.slpRegistrationNo})` : ''} · {fp.assessedDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs tabular-nums">
                      <span className="font-semibold text-blue-900">
                        Confidence: {fp.communicationConfidenceRating}/5
                      </span>
                      <span className="font-semibold text-emerald-700">
                        Participation: {fp.communicationParticipationRating}/5
                      </span>
                    </div>
                  </div>

                  {fp.studentFeelingsAndExperience && (
                    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                      <p className="font-semibold text-slate-900">Student’s Own Experience & Voice</p>
                      <p className="mt-0.5">{fp.studentFeelingsAndExperience}</p>
                    </div>
                  )}

                  {fp.observedPatterns.syllableRepetitions !== 'Not observed' || fp.observedPatterns.soundRepetitions !== 'Not observed' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      {[
                        ['Sound Rep.', fp.observedPatterns.soundRepetitions],
                        ['Syllable Rep.', fp.observedPatterns.syllableRepetitions],
                        ['Word Rep.', fp.observedPatterns.wordRepetitions],
                        ['Prolongations', fp.observedPatterns.prolongations],
                        ['Blocks', fp.observedPatterns.blocks],
                      ].map(([label, val]) => (
                        <div key={label} className="rounded-lg border border-slate-100 bg-slate-50/70 p-2">
                          <p className="text-[11px] text-slate-500">{label}</p>
                          <p className="font-semibold text-slate-900 mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    {fp.situationsIncreasingStammering && (
                      <div>
                        <p className="font-semibold text-slate-900">Situations Increasing Disfluency</p>
                        <p className="mt-0.5">{fp.situationsIncreasingStammering}</p>
                      </div>
                    )}
                    {fp.situationsDecreasingStammering && (
                      <div>
                        <p className="font-semibold text-slate-900">Comfortable / Easy Speaking Contexts</p>
                        <p className="mt-0.5">{fp.situationsDecreasingStammering}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-900">SLP-Selected Evidence-Informed Approaches</p>
                    <p className="text-xs text-slate-600 mt-0.5">{fp.selectedApproaches.join(' · ')}</p>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-900">Therapist-Approved Practice Activities</p>
                    {fp.approvedPracticeActivities.map((act) => (
                      <div key={act.id} className="rounded-lg bg-slate-50 p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900">{act.title}</span>
                          <span className="text-[11px] text-slate-500">{act.category}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{act.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-3 text-xs space-y-1 text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">Classroom Communication Support:</span>{' '}
                      {fp.classroomSupportGuidance}
                    </p>
                    {fp.familyGuidance && (
                      <p>
                        <span className="font-semibold text-slate-900">Family Guidance:</span> {fp.familyGuidance}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-5">
            {canEditSpeech ? (
              <form
                onSubmit={handleSaveFluencyProfile}
                className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <HeartHandshake className="h-4 w-4 text-blue-900" />
                  <h3 className="text-sm font-bold text-slate-900">Create Fluency & Stammering Profile</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age of Onset (yrs)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={ageOfOnset}
                      onChange={(e) => setAgeOfOnset(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (months)</label>
                    <input
                      type="number"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(
                    [
                      ['Sound Repetitions', soundRep, setSoundRep],
                      ['Syllable Repetitions', sylRep, setSylRep],
                      ['Word Repetitions', wordRep, setWordRep],
                      ['Prolongations', prolong, setProlong],
                      ['Blocks', blocks, setBlocks],
                    ] as const
                  ).map(([label, val, setter]) => (
                    <div key={label}>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">{label}</label>
                      <select
                        value={val}
                        onChange={(e) => setter(e.target.value as typeof val)}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                      >
                        <option>Not observed</option>
                        <option>Mild</option>
                        <option>Moderate</option>
                        <option>Frequent</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confidence (1–5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={confidenceRating}
                      onChange={(e) => setConfidenceRating(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Participation (1–5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={participationRating}
                      onChange={(e) => setParticipationRating(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs tabular-nums"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={familyHistory}
                  onChange={(e) => setFamilyHistory(e.target.value)}
                  placeholder="Family history of stammering (if known)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  value={sitIncrease}
                  onChange={(e) => setSitIncrease(e.target.value)}
                  placeholder="Situations where stammering increases"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  value={sitDecrease}
                  onChange={(e) => setSitDecrease(e.target.value)}
                  placeholder="Situations where communication feels easiest"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <textarea
                  rows={2}
                  value={studentFeelings}
                  onChange={(e) => setStudentFeelings(e.target.value)}
                  placeholder="Student's own feelings & experience of speaking..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Evidence-Informed Intervention Approaches
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {FLUENCY_APPROACHES.map((app) => (
                      <label key={app} className="flex items-center gap-2 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedApproaches.includes(app)}
                          onChange={() => toggleApproach(app)}
                        />
                        <span>{app}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={classroomSupport}
                  onChange={(e) => setClassroomSupport(e.target.value)}
                  placeholder="Classroom support guidance (e.g. unhurried wait time, avoid finishing sentences)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {busy ? 'Saving...' : 'Save Fluency Profile'}
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600">
                Fluency assessment profiles are authored and approved by qualified Speech-Language Pathologists (SLPs).
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PART 3: SPEECH THERAPY INTELLIGENCE ENGINE (ARTICULATION)
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Speech Therapy Intelligence Engine — Individualised Articulation & Phonetic Profiling
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Language-specific speech sound assessment (English /r/ vs. Hindi र tracked separately), 9-level position analysis, 8-stage articulation progression, and SLP-reviewed exercise generation.
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

      {/* 8-Stage Articulation Progression Reference Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-bold text-slate-900 mb-3">
          SLP-Configurable 8-Stage Articulation Progression
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {ARTICULATION_STAGES.map((st) => (
            <div key={st.stage} className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
              <p className="text-[11px] font-mono font-bold text-blue-900 tabular-nums">Stage {st.stage}</p>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">{st.label}</p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{st.focus}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Individual Speech Sound Targets · {selectedStudent?.name} ({studentTargets.length})
            </h3>
            {studentTargets.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500">
                No speech sound targets recorded for {selectedStudent?.name || 'this student'} yet.
              </div>
            ) : (
              studentTargets.map((target) => (
                <div key={target.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Target {target.targetSound} · {target.language}
                      </p>
                      <p className="text-xs text-slate-500">
                        {target.errorType}
                        {target.substitutionDetail ? ` (${target.substitutionDetail})` : ''} · Priority:{' '}
                        {target.treatmentPriority} · Stimulability: {target.stimulability}
                      </p>
                    </div>
                    <div className="text-right text-xs tabular-nums">
                      <p className="font-bold text-blue-900">Stage {target.currentStage} of 8</p>
                      <p className="text-slate-500">
                        Word: {target.accuracyWordLevelPct ?? '—'}% · Conv: {target.accuracyConversationPct ?? '—'}%
                      </p>
                    </div>
                  </div>

                  {/* 9-Position Matrix */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-[11px]">
                    {POSITION_LABELS.map((pos) => {
                      const active = target.affectedPositions.includes(pos.key);
                      const pct = target.positionAccuracy[pos.key];
                      return (
                        <div
                          key={pos.key}
                          className={`rounded-md border px-2 py-1.5 ${
                            active
                              ? 'border-blue-200 bg-blue-50/50 text-slate-900'
                              : 'border-slate-100 bg-slate-50/50 text-slate-500'
                          }`}
                        >
                          <p className="font-medium truncate">{pos.label}</p>
                          <p className="font-mono tabular-nums text-[11px]">
                            {pct !== undefined ? `${pct}%` : active ? 'Target' : '—'}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Functional Impact:</span> {target.functionalImpact}
                  </p>

                  {canEditSpeech && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-700">Generate Original Practice Draft:</span>
                      {([target.currentStage, Math.min(8, target.currentStage + 1)] as ArticulationStageNumber[])
                        .filter((v, i, arr) => arr.indexOf(v) === i)
                        .map((st) => (
                          <button
                            key={st}
                            type="button"
                            disabled={busy}
                            onClick={() => void handleGenerateExercise(target.id, st)}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-900 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Stage {st} Draft
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Generated & Approved Individualised Exercises */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Individualised Practice Exercises ({studentExercises.length})
            </h3>
            {studentExercises.map((ex) => (
              <div key={ex.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <p className="font-bold text-slate-900">{ex.title}</p>
                    <p className="text-slate-500">
                      {ex.targetLanguage} · {ex.difficultyLevel} · {ex.suggestedDurationMin} min · {ex.targetAttempts} attempts
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        ex.reviewStatus === 'Approved by SLP' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {ex.reviewStatus}
                    </span>
                    {isSlp && ex.reviewStatus !== 'Approved by SLP' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleApproveExercise(ex.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve & Assign
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">Objective:</span> {ex.learningObjective}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">Student Instructions:</span> {ex.studentInstructions}
                </p>
                {ex.therapistInstructions && (
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-800">Therapist Guidance:</span> {ex.therapistInstructions}
                  </p>
                )}
                <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                  {ex.practiceItems.map((pi, i) => (
                    <li key={i}>{pi}</li>
                  ))}
                </ul>
                {ex.approvedBy && (
                  <p className="text-[11px] text-slate-500">
                    Approved by {ex.approvedBy} on {ex.approvedAt}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add New Speech Sound Target Form */}
        <div className="lg:col-span-5">
          {canEditSpeech ? (
            <form
              onSubmit={handleAddSpeechTarget}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Mic2 className="h-4 w-4 text-blue-900" />
                <h3 className="text-sm font-bold text-slate-900">Record Speech Sound Target</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sound Group</label>
                  <select
                    value={soundGroup}
                    onChange={(e) => {
                      setSoundGroup(e.target.value);
                      setTargetSound(e.target.value.split(' ')[0]);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                  >
                    {SPEECH_SOUND_GROUPS.map((sg) => (
                      <option key={sg} value={sg}>
                        {sg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Symbol *</label>
                  <input
                    required
                    type="text"
                    value={targetSound}
                    onChange={(e) => setTargetSound(e.target.value)}
                    placeholder="e.g. /r/ or र"
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as typeof language)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Bilingual (English + Hindi)</option>
                    <option>Regional / Multilingual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Error Type</label>
                  <select
                    value={errorType}
                    onChange={(e) => setErrorType(e.target.value as typeof errorType)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                  >
                    <option>Substitution</option>
                    <option>Omission</option>
                    <option>Distortion</option>
                    <option>Addition</option>
                    <option>Phonological Process</option>
                  </select>
                </div>
              </div>

              <input
                type="text"
                value={subDetail}
                onChange={(e) => setSubDetail(e.target.value)}
                placeholder="Pattern detail (e.g. /w/ substituted for prevocalic /r/)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">Affected Positions & Contexts</p>
                <div className="flex flex-wrap gap-1.5">
                  {POSITION_LABELS.map((pos) => (
                    <button
                      key={pos.key}
                      type="button"
                      onClick={() => togglePosition(pos.key)}
                      className={`rounded-md border px-2 py-1 text-[11px] font-medium ${
                        affectedPositions.includes(pos.key)
                          ? 'border-blue-900 bg-blue-900 text-white'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Word Acc %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={wordAcc}
                    onChange={(e) => setWordAcc(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Conv Acc %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={convAcc}
                    onChange={(e) => setConvAcc(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Stage (1–8)</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={currentStage}
                    onChange={(e) => setCurrentStage(Number(e.target.value) as ArticulationStageNumber)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={stimulability}
                  onChange={(e) => setStimulability(e.target.value as typeof stimulability)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                >
                  <option>Stimulable with cue</option>
                  <option>Partially stimulable</option>
                  <option>Not yet stimulable</option>
                  <option>To be assessed</option>
                </select>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as typeof priority)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Maintenance</option>
                  <option>Monitor</option>
                </select>
              </div>

              <input
                type="text"
                value={functionalImpact}
                onChange={(e) => setFunctionalImpact(e.target.value)}
                placeholder="Functional communication impact noted by SLP"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />

              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                {busy ? 'Saving...' : 'Add Speech Sound Target'}
              </button>
            </form>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600 flex items-start gap-2">
              <Volume2 className="h-4 w-4 text-blue-900 shrink-0 mt-0.5" />
              <span>
                Speech sound target profiling and articulation progression are managed by a qualified Speech-Language Pathologist (SLP).
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
