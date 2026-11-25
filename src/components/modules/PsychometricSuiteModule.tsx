import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardList,
  Clock,
  Compass,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type {
  BatterySubtestResultsMap,
  PsychometricParticipant,
  PsychometricRecord,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { BAT_SUBS, ageBand } from '../../utils/psychometricEngine';
import { HatchPatternDefs } from '../psychometric/PsychometricFigures';
import {
  CognitiveBatteryRunner,
  type SavedBatteryProgress,
} from '../psychometric/CognitiveBatteryRunner';
import {
  PersonalityTestRunner,
  ReasoningTestRunner,
} from '../psychometric/ReasoningAndPersonalityRunners';
import {
  PsychometricReportView,
  PsychometricResultsAnalytics,
  PsychometricScienceView,
} from '../psychometric/PsychometricReportsAndAnalytics';

interface PsychometricSuiteModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type SubTab = 'take' | 'results' | 'science';
type ActiveRunner = 'none' | 'battery' | 'iq' | 'personality';

const CLASS_OPTIONS = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'College / Adult',
  'Teacher / Staff',
  'Other',
];

const GENDER_OPTIONS = ['Prefer not to say', 'Female', 'Male', 'Other'];

function inferAgeFromClassSection(classSection?: string): number {
  const m = String(classSection || '').match(/(\d+)/);
  const grade = m ? parseInt(m[1], 10) : 9;
  if (!Number.isFinite(grade)) return 14;
  return Math.max(10, Math.min(18, grade + 5));
}

function formatClassLabel(classSection?: string): string {
  const m = String(classSection || '').match(/(\d+)/);
  if (!m) return 'Class 9';
  const grade = Math.max(6, Math.min(12, parseInt(m[1], 10)));
  return `Class ${grade}`;
}

export const PsychometricSuiteModule: React.FC<PsychometricSuiteModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const { user, activeSchool, students } = data;
  const records: PsychometricRecord[] = useMemo(
    () => data.psychometricRecords || [],
    [data.psychometricRecords],
  );

  const isStudent = user.role === 'student';
  const isParent = user.role === 'parent';
  const isStudentOrParent = isStudent || isParent;
  const canExportAndDelete = ['super_admin', 'school_admin', 'principal', 'counsellor'].includes(
    user.role,
  );

  // Eligible roster list for the participant selector
  const selectableStudents = useMemo(() => {
    if (isStudentOrParent && user.linkedStudentIds?.length) {
      const allowed = new Set(user.linkedStudentIds);
      return students.filter((s) => allowed.has(s.id));
    }
    return students;
  }, [isStudentOrParent, students, user.linkedStudentIds]);

  const initialStudent = selectableStudents[0] || null;

  const [subTab, setSubTab] = useState<SubTab>('take');
  const [activeRunner, setActiveRunner] = useState<ActiveRunner>('none');
  const [openReportRecord, setOpenReportRecord] = useState<PsychometricRecord | null>(null);
  const [reportReturnTab, setReportReturnTab] = useState<SubTab>('results');

  // Participant state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudent?.id || '');
  const [name, setName] = useState<string>(initialStudent?.name || (isStudent ? user.name : ''));
  const [ageStr, setAgeStr] = useState<string>(
    initialStudent ? String(inferAgeFromClassSection(initialStudent.classSection)) : '14',
  );
  const [cls, setCls] = useState<string>(
    initialStudent ? formatClassLabel(initialStudent.classSection) : 'Class 9',
  );
  const [gender, setGender] = useState<string>('Prefer not to say');
  const [consent, setConsent] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string>('');

  // Leave-test confirmation dialog (when switching sub-tabs mid-test)
  const [pendingNavTab, setPendingNavTab] = useState<SubTab | null>(null);

  // Saved battery progress in localStorage (scoped per school + participant)
  const storageKey = useMemo(
    () => `virat-psy-bat-${activeSchool.id}-${selectedStudentId || 'custom'}`,
    [activeSchool.id, selectedStudentId],
  );
  const [savedBattery, setSavedBattery] = useState<SavedBatteryProgress | null>(null);
  const [resumeBatteryPayload, setResumeBatteryPayload] = useState<SavedBatteryProgress | null>(
    null,
  );

  // Sync student selection when school or user changes
  useEffect(() => {
    const first = selectableStudents[0] || null;
    if (isStudentOrParent && first) {
      setSelectedStudentId(first.id);
      setName(first.name);
      setAgeStr(String(inferAgeFromClassSection(first.classSection)));
      setCls(formatClassLabel(first.classSection));
    } else if (!selectedStudentId && first) {
      setSelectedStudentId(first.id);
      setName(first.name);
      setAgeStr(String(inferAgeFromClassSection(first.classSection)));
      setCls(formatClassLabel(first.classSection));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchool.id, user.id]);

  // Load saved battery progress from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedBatteryProgress;
        if (parsed && parsed.participant && parsed.results) {
          setSavedBattery(parsed);
          return;
        }
      }
    } catch {
      // Ignore malformed storage entries
    }
    setSavedBattery(null);
  }, [storageKey]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setFormError('');
    if (!studentId) {
      setName('');
      setAgeStr('14');
      setCls('Class 9');
      return;
    }
    const found = selectableStudents.find((s) => s.id === studentId);
    if (found) {
      setName(found.name);
      setAgeStr(String(inferAgeFromClassSection(found.classSection)));
      setCls(formatClassLabel(found.classSection));
    }
  };

  const buildParticipant = (): PsychometricParticipant | null => {
    const trimmed = name.trim();
    const ageNum = parseInt(ageStr, 10);
    if (!trimmed) {
      setFormError('Please select a student or enter a participant name.');
      return null;
    }
    if (!Number.isFinite(ageNum) || ageNum < 10 || ageNum > 80) {
      setFormError('Please enter a valid age between 10 and 80 years.');
      return null;
    }
    if (!consent) {
      setFormError('Please confirm the consent checkbox before starting an assessment.');
      return null;
    }
    setFormError('');
    return {
      studentId: selectedStudentId || undefined,
      name: trimmed,
      age: ageNum,
      band: ageBand(ageNum),
      cls,
      gender,
    };
  };

  const currentParticipant = useMemo<PsychometricParticipant>(() => {
    const ageNum = Math.max(10, Math.min(80, parseInt(ageStr, 10) || 14));
    return {
      studentId: selectedStudentId || undefined,
      name: name.trim() || user.name,
      age: ageNum,
      band: ageBand(ageNum),
      cls,
      gender,
    };
  }, [ageStr, cls, gender, name, selectedStudentId, user.name]);

  const launchTest = (kind: 'battery' | 'iq' | 'personality') => {
    const p = buildParticipant();
    if (!p) return;
    setApiError('');
    setStatusBanner('');
    setOpenReportRecord(null);
    setResumeBatteryPayload(null);
    setActiveRunner(kind);
  };

  const handleResumeSavedBattery = () => {
    if (!savedBattery) return;
    setApiError('');
    setStatusBanner('');
    setOpenReportRecord(null);
    setResumeBatteryPayload(savedBattery);
    setActiveRunner('battery');
  };

  const handleDiscardSavedBattery = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setSavedBattery(null);
    setResumeBatteryPayload(null);
  };

  const handleSaveBatteryProgress = (progress: SavedBatteryProgress) => {
    setSavedBattery(progress);
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      // ignore storage quota issues
    }
  };

  const requestSubTab = (target: SubTab) => {
    if (activeRunner !== 'none') {
      setPendingNavTab(target);
      return;
    }
    setOpenReportRecord(null);
    setSubTab(target);
  };

  const confirmLeaveTest = () => {
    const target = pendingNavTab || 'take';
    setPendingNavTab(null);
    setActiveRunner('none');
    setResumeBatteryPayload(null);
    setOpenReportRecord(null);
    setSubTab(target);
  };

  // Submission handlers -> Express POST /api/psychometric/records
  const handleCompleteBattery = async (
    resMap: BatterySubtestResultsMap,
    durationSec: number,
  ) => {
    setApiError('');
    const participant = resumeBatteryPayload?.participant || currentParticipant;
    try {
      const resp = await apiRequest<{ record: PsychometricRecord }>(
        '/api/psychometric/records',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'battery',
            studentId: participant.studentId,
            p: participant,
            durationSec,
            res: resMap,
          }),
        },
        token,
      );
      handleDiscardSavedBattery();
      setActiveRunner('none');
      setReportReturnTab('results');
      setOpenReportRecord(resp.record);
      setStatusBanner(`Cognitive Profile Battery saved for ${participant.name}.`);
      await onRefresh();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to save Cognitive Profile Battery.');
    }
  };

  const handleCompleteIq = async (
    choices: number[],
    times: number[],
    durationSec: number,
  ) => {
    setApiError('');
    const participant = currentParticipant;
    try {
      const resp = await apiRequest<{ record: PsychometricRecord }>(
        '/api/psychometric/records',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'iq',
            studentId: participant.studentId,
            p: participant,
            durationSec,
            choices,
            times,
          }),
        },
        token,
      );
      setActiveRunner('none');
      setReportReturnTab('results');
      setOpenReportRecord(resp.record);
      setStatusBanner(`Reasoning Test (3PL IRT) saved for ${participant.name}.`);
      await onRefresh();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to save Reasoning Test.');
    }
  };

  const handleCompletePersonality = async (payload: {
    bf: number[];
    ac: number[];
    ri: number[];
    pageTimes: number[];
    durationSec: number;
  }) => {
    setApiError('');
    const participant = currentParticipant;
    try {
      const resp = await apiRequest<{ record: PsychometricRecord }>(
        '/api/psychometric/records',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'personality',
            studentId: participant.studentId,
            p: participant,
            durationSec: payload.durationSec,
            bf: payload.bf,
            ac: payload.ac,
            ri: payload.ri,
            pageTimes: payload.pageTimes,
          }),
        },
        token,
      );
      setActiveRunner('none');
      setReportReturnTab('results');
      setOpenReportRecord(resp.record);
      setStatusBanner(`Personality & Career Interests report saved for ${participant.name}.`);
      await onRefresh();
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Failed to save Personality & Career Interests.',
      );
    }
  };

  const handleDeleteRecord = async (id: string) => {
    setApiError('');
    try {
      await apiRequest(
        `/api/psychometric/records/${id}`,
        {
          method: 'DELETE',
        },
        token,
      );
      if (openReportRecord?.id === id) {
        setOpenReportRecord(null);
      }
      await onRefresh();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Could not delete assessment record.');
    }
  };

  const savedCompletedCount = savedBattery ? Object.keys(savedBattery.results).length : 0;

  return (
    <div className="space-y-6">
      {/* Shared SVG hatch pattern definitions for striped matrix cells */}
      <HatchPatternDefs />

      {/* Module Header & Sub-Navigation */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1d5b86]">
            <Activity className="h-4 w-4" />
            <span>Psychometric Assessment Suite · {activeSchool.name}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Cognitive Profile, Reasoning (3PL IRT) &amp; Personality / RIASEC Suite
          </h2>
          <p className="text-xs text-slate-600">
            Standardized 10-subtest Wechsler-style cognitive battery, 40-item CHC reasoning screen,
            and IPIP-50 + Holland RIASEC career inventory with school-level norms.
          </p>
        </div>

        <nav
          aria-label="Psychometric suite sections"
          className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start md:self-auto shrink-0"
        >
          <button
            type="button"
            onClick={() => requestSubTab('take')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              subTab === 'take' && !openReportRecord
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5 shrink-0" />
            Take a Test
          </button>
          <button
            type="button"
            onClick={() => requestSubTab('results')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              subTab === 'results' || Boolean(openReportRecord)
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            Results &amp; Norms ({records.length})
          </button>
          <button
            type="button"
            onClick={() => requestSubTab('science')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              subTab === 'science' && !openReportRecord
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            Science &amp; Methods
          </button>
        </nav>
      </div>

      {/* Feedback Banners */}
      {apiError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}
      {statusBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            {statusBanner}
          </span>
          <button
            type="button"
            onClick={() => setStatusBanner('')}
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================================================================
          ACTIVE RUNNER VIEWS
         ================================================================ */}
      {activeRunner === 'battery' && (
        <CognitiveBatteryRunner
          participant={resumeBatteryPayload?.participant || currentParticipant}
          initialProgress={resumeBatteryPayload}
          onSaveProgress={handleSaveBatteryProgress}
          onPauseAndExit={() => {
            setActiveRunner('none');
            setResumeBatteryPayload(null);
            setSubTab('take');
            setStatusBanner(
              'Battery progress saved on this device. You can resume right where you left off.',
            );
          }}
          onComplete={handleCompleteBattery}
        />
      )}

      {activeRunner === 'iq' && (
        <ReasoningTestRunner
          participant={currentParticipant}
          onCancel={() => {
            setActiveRunner('none');
            setSubTab('take');
          }}
          onComplete={handleCompleteIq}
        />
      )}

      {activeRunner === 'personality' && (
        <PersonalityTestRunner
          participant={currentParticipant}
          onCancel={() => {
            setActiveRunner('none');
            setSubTab('take');
          }}
          onComplete={handleCompletePersonality}
        />
      )}

      {/* ================================================================
          CLINICAL REPORT VIEW
         ================================================================ */}
      {activeRunner === 'none' && openReportRecord && (
        <PsychometricReportView
          record={openReportRecord}
          allRecords={records}
          backLabel={reportReturnTab === 'take' ? 'Back to Assessments' : 'Back to Results & Norms'}
          onBack={() => {
            setOpenReportRecord(null);
            setSubTab(reportReturnTab);
          }}
        />
      )}

      {/* ================================================================
          TAB 1: TAKE A TEST
         ================================================================ */}
      {activeRunner === 'none' && !openReportRecord && subTab === 'take' && (
        <div className="space-y-6">
          {/* Resume Unfinished Battery Banner */}
          {savedBattery && savedCompletedCount > 0 && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Unfinished Cognitive Profile Battery for {savedBattery.participant.name}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {savedCompletedCount} of {BAT_SUBS.length} subtests completed (
                  {savedBattery.participant.cls}, age {savedBattery.participant.age}). Resume from
                  subtest {Math.min(BAT_SUBS.length, savedBattery.index + 1)}.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResumeSavedBattery}
                  className="px-4 py-2 rounded-lg bg-[#1d5b86] text-white text-xs font-semibold hover:bg-[#16476a] inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Resume Battery
                </button>
                <button
                  type="button"
                  onClick={handleDiscardSavedBattery}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Participant Details */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Step 1
                </p>
                <h3 className="text-lg font-bold text-slate-900">Participant Details</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isStudent
                    ? 'Your student profile is pre-selected. Verify your age and confirm consent to begin.'
                    : isParent
                      ? 'Select your linked student below and confirm consent before beginning.'
                      : 'Select a student from your school roster or enter a custom participant profile.'}
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                Age norm band: {ageBand(Math.max(10, Math.min(80, parseInt(ageStr, 10) || 14)))} yrs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Student Roster Binding */}
              {!isStudent && (
                <div className="md:col-span-2 lg:col-span-4">
                  <label
                    htmlFor="psy-student-select"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    {isParent ? 'Select Linked Student' : 'Link to Student Profile'}
                  </label>
                  <select
                    id="psy-student-select"
                    value={selectedStudentId}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1d5b86] focus:outline-none"
                  >
                    {!isParent && <option value="">— Custom / Guest Participant —</option>}
                    {selectableStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.classSection} · Roll {s.rollNo})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="psy-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Name or Student ID
                </label>
                <input
                  id="psy-name"
                  type="text"
                  value={name}
                  readOnly={isStudent}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Aarav Sharma"
                  className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1d5b86] focus:outline-none ${
                    isStudent ? 'bg-slate-50 text-slate-700' : 'bg-white'
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="psy-age"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Age (years, 10–80)
                </label>
                <input
                  id="psy-age"
                  type="number"
                  min={10}
                  max={80}
                  value={ageStr}
                  onChange={(e) => setAgeStr(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1d5b86] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="psy-class"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Class or Role
                </label>
                <select
                  id="psy-class"
                  value={cls}
                  onChange={(e) => setCls(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1d5b86] focus:outline-none"
                >
                  {CLASS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="psy-gender"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Gender (optional)
                </label>
                <select
                  id="psy-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1d5b86] focus:outline-none"
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  id="psy-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setFormError('');
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1d5b86] focus:ring-[#1d5b86]"
                />
                <span>
                  I understand this assessment is for educational guidance, career counselling, and
                  school-level norming — not a clinical diagnosis. Results are securely stored in{' '}
                  <strong>{activeSchool.name}</strong>&apos;s Rai Plus workspace. For
                  students under 18, parent or school counsellor consent is in place.
                </span>
              </label>

              {formError && (
                <p role="alert" className="mt-2.5 text-xs font-semibold text-rose-700">
                  {formError}
                </p>
              )}
            </div>
          </section>

          {/* Step 2: Choose an Assessment */}
          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Step 2
                </p>
                <h3 className="text-lg font-bold text-slate-900">Choose an Assessment</h3>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                Automatic validity checks &amp; local norms
              </span>
            </div>

            {/* Featured Full-Width Card: Cognitive Profile Battery */}
            <div className="rounded-xl border-2 border-[#1d5b86]/25 bg-gradient-to-br from-white via-white to-[#f0f6fa] p-6 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-3 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1d5b86] bg-[#e2ecf3] px-2.5 py-1 rounded">
                      <Brain className="h-3.5 w-3.5" />
                      Comprehensive · Wechsler-Style 5-Index Battery
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <Clock className="h-3.5 w-3.5" />
                      ~45–60 min · Save &amp; Resume between subtests
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-slate-900">
                    Cognitive Profile Battery (10 Subtests · FSIQ, GAI &amp; CPI)
                  </h4>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    Ten standardized interactive subtests measuring all five Wechsler/CHC cognitive
                    indices: <strong>Verbal Comprehension (VCI)</strong>,{' '}
                    <strong>Visual Spatial (VSI)</strong>, <strong>Fluid Reasoning (FRI)</strong>,{' '}
                    <strong>Working Memory (WMI)</strong>, and{' '}
                    <strong>Processing Speed (PSI)</strong>. Generates Full-Scale IQ, General
                    Ability Index (GAI), Cognitive Proficiency Index (CPI), scaled subtest profile
                    (Mean 10, SD 3), and relative strengths/weaknesses.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs text-slate-600">
                    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                      <span className="font-bold text-slate-900 block">VCI</span>
                      Similarities · Vocabulary
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                      <span className="font-bold text-slate-900 block">VSI</span>
                      Block Patterns · Shape Rotation
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                      <span className="font-bold text-slate-900 block">FRI</span>
                      Matrix Reasoning · Balance Puzzles
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                      <span className="font-bold text-slate-900 block">WMI</span>
                      Digit Span · Spatial Span
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                      <span className="font-bold text-slate-900 block">PSI</span>
                      Symbol Coding · Symbol Search
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => launchTest('battery')}
                    className="px-5 py-3 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a] inline-flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Play className="h-4 w-4" />
                    Start Cognitive Battery
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Includes practice items &amp; discontinue rules
                  </p>
                </div>
              </div>
            </div>

            {/* Two-Column Secondary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Personality & Career Interests */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                      <Compass className="h-3.5 w-3.5" />
                      IPIP-50 + RIASEC
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      88 items · ~12–15 min
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Personality &amp; Career Interests
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Goldberg&apos;s public-domain 50-item Big Five inventory (Openness,
                    Conscientiousness, Extraversion, Agreeableness, Emotional Stability) paired with
                    a 36-item Holland RIASEC career interest inventory, 3-letter Holland code,
                    Indian career paths, and Curran (2016) response validity checks.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Untimed · 10 short pages</span>
                  <button
                    type="button"
                    onClick={() => launchTest('personality')}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Start Personality &amp; Interests
                  </button>
                </div>
              </div>

              {/* Reasoning Test (Quick IQ Screen) */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded">
                      <Sparkles className="h-3.5 w-3.5" />
                      3PL IRT · Quick IQ Screen
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      40 items · 35 min limit
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Reasoning Test (Quick Screen)
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    A single-sitting 40-question screening test across four CHC domains: Matrix
                    Patterns (Gf-M), Number &amp; Letter Series (Gf-S), Verbal Analogies (Gc), and
                    Mental Rotation (Gv). Scored via 3-Parameter Logistic IRT (EAP θ, SE, 90% CI)
                    with Guttman person-fit diagnostics.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Practice item + 1–40 jump palette</span>
                  <button
                    type="button"
                    onClick={() => launchTest('iq')}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Start Reasoning Test
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ================================================================
          TAB 2: RESULTS & NORMS
         ================================================================ */}
      {activeRunner === 'none' && !openReportRecord && subTab === 'results' && (
        <PsychometricResultsAnalytics
          records={records}
          canExportAndDelete={canExportAndDelete}
          isStudentOrParent={isStudentOrParent}
          onOpenReport={(rec) => {
            setReportReturnTab('results');
            setOpenReportRecord(rec);
          }}
          onDeleteRecord={canExportAndDelete ? handleDeleteRecord : undefined}
        />
      )}

      {/* ================================================================
          TAB 3: SCIENCE & METHODS
         ================================================================ */}
      {activeRunner === 'none' && !openReportRecord && subTab === 'science' && (
        <PsychometricScienceView />
      )}

      {/* ================================================================
          LEAVE TEST CONFIRMATION MODAL (IN-APP, NO WINDOW.CONFIRM)
         ================================================================ */}
      {pendingNavTab && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Leave the active assessment?</h3>
            <p className="text-sm text-slate-600">
              {activeRunner === 'battery'
                ? 'Completed subtests are automatically saved on this device, but the subtest currently in progress will reset if you leave now.'
                : 'Your current answers for this test have not been submitted yet and will be lost if you leave now.'}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPendingNavTab(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Stay on test
              </button>
              <button
                type="button"
                onClick={confirmLeaveTest}
                className="px-4 py-2 rounded-lg bg-rose-700 text-white text-sm font-semibold hover:bg-rose-800"
              >
                Leave assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
