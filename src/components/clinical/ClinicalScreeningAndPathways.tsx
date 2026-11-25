import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  ShieldAlert,
  Stethoscope,
  UserCheck,
} from 'lucide-react';
import type { WorkspaceData } from '../../types/workspace';
import type {
  ClinicalDomain,
  ConditionPathwayType,
  ParentQuestionnaireItem,
  QuestionnaireResponseOption,
  ScreeningWorkflowStatus,
} from '../../types/clinical';
import {
  CLINICAL_DOMAIN_LABELS,
  CLINICAL_SPECIALIST_ROLES,
  DEFAULT_PARENT_QUESTIONNAIRE_TEMPLATE,
  MANAGEMENT_ROLES,
} from '../../utils/clinicalCareEngine';
import { apiRequest } from '../../utils/api';

interface Props {
  data: WorkspaceData;
  token: string;
  selectedStudentId: string;
  onRefresh: () => Promise<void>;
  mode: 'screening' | 'pathways';
}

const RESPONSE_OPTIONS: QuestionnaireResponseOption[] = [
  'Yes',
  'No',
  'Sometimes',
  'Not sure',
  'Not observed',
];

const WORKFLOW_STATUSES: ScreeningWorkflowStatus[] = [
  'No immediate concern identified',
  'Monitor development',
  'Further screening recommended',
  'Professional assessment recommended',
  'Urgent clinical referral recommended',
];

export const ClinicalScreeningAndPathways: React.FC<Props> = ({
  data,
  token,
  selectedStudentId,
  onRefresh,
  mode,
}) => {
  const clinical = data.clinicalCare;
  const role = data.user.role;
  const isSpecialist = CLINICAL_SPECIALIST_ROLES.includes(role);
  const isManagement = MANAGEMENT_ROLES.includes(role);
  const isParent = role === 'parent';
  const isTeacher = role === 'teacher';

  const [subSection, setSubSection] = useState<
    'cases' | 'history' | 'parent_q' | 'teacher_obs'
  >(isParent ? 'parent_q' : isTeacher ? 'teacher_obs' : 'cases');

  const [pathwayTab, setPathwayTab] = useState<ConditionPathwayType>('autism_spectrum');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Developmental History state
  const [pregnancyHistory, setPregnancyHistory] = useState('Full-term delivery; uncomplicated postnatal course.');
  const [birthComplications, setBirthComplications] = useState('None reported');
  const [firstWordsMonths, setFirstWordsMonths] = useState('12');
  const [sentencesMonths, setSentencesMonths] = useState('24');
  const [walkingMonths, setWalkingMonths] = useState('12');
  const [hearingHistory, setHearingHistory] = useState('No recurrent ear infections; hearing screening up to date.');
  const [medicalHistory, setMedicalHistory] = useState('Age-appropriate immunisation; no hospitalisations.');
  const [familyHistory, setFamilyHistory] = useState('None reported.');
  const [previousAssessments, setPreviousAssessments] = useState('None');
  const [previousTherapies, setPreviousTherapies] = useState('None');
  const [homeLanguage, setHomeLanguage] = useState('Hindi');
  const [languagesSpoken, setLanguagesSpoken] = useState('Hindi, English');
  const [regressionFlag, setRegressionFlag] = useState(false);
  const [regressionDetails, setRegressionDetails] = useState('');
  const [seizureFlag, setSeizureFlag] = useState(false);
  const [seizureDetails, setSeizureDetails] = useState('');
  const [socialSummary, setSocialSummary] = useState('');
  const [playSummary, setPlaySummary] = useState('');
  const [dailyLivingSummary, setDailyLivingSummary] = useState('');

  // Parent Questionnaire state
  const [ageBand, setAgeBand] = useState<'3-5 yrs' | '6-9 yrs' | '10-13 yrs' | '14-18 yrs'>('6-9 yrs');
  const [pqItems, setPqItems] = useState<ParentQuestionnaireItem[]>(() =>
    DEFAULT_PARENT_QUESTIONNAIRE_TEMPLATE.map((t) => ({
      ...t,
      response: 'Yes',
      explanation: '',
    })),
  );
  const [parentStrengths, setParentStrengths] = useState('');
  const [parentQuestions, setParentQuestions] = useState('');

  // Teacher Observation state (strictly observable behaviour)
  const [toComm, setToComm] = useState('');
  const [toInstructions, setToInstructions] = useState('');
  const [toAttention, setToAttention] = useState('');
  const [toPeer, setToPeer] = useState('');
  const [toParticipation, setToParticipation] = useState('');
  const [toTurnTaking, setToTurnTaking] = useState('');
  const [toBehaviour, setToBehaviour] = useState('');
  const [toIntelligibility, setToIntelligibility] = useState<
    'Clear to all' | 'Mostly clear' | 'Clear to familiar listeners' | 'Difficult to understand in class'
  >('Mostly clear');
  const [toLiteracy, setToLiteracy] = useState('');
  const [toProgress, setToProgress] = useState('');
  const [toIndependence, setToIndependence] = useState('');
  const [toStrengths, setToStrengths] = useState('');

  // Screening Case Initiation state
  const [selectedDomains, setSelectedDomains] = useState<ClinicalDomain[]>(['speech_language_delays']);
  const [screeningStatus, setScreeningStatus] = useState<ScreeningWorkflowStatus>('Further screening recommended');
  const [screeningReferral, setScreeningReferral] = useState('');
  const [classroomSummary, setClassroomSummary] = useState('');
  const [multilingualNote, setMultilingualNote] = useState(
    'Home language & multilingual development explicitly considered; accent or second-language patterns not treated as disorder.',
  );

  // Condition Assessment Form state (Part 2)
  const [licensedTools, setLicensedTools] = useState('');
  const [subCategory, setSubCategory] = useState('Specific Learning Disorder');
  const [profObservation, setProfObservation] = useState('');
  const [functionalImpact, setFunctionalImpact] = useState('');
  const [referralRec, setReferralRec] = useState('');
  const [authClassroomGuidance, setAuthClassroomGuidance] = useState('');
  const [homeFunc, setHomeFunc] = useState('');
  const [classFunc, setClassFunc] = useState('');
  const [sleepFactors, setSleepFactors] = useState('');
  const [altExplanations, setAltExplanations] = useState('');
  const [accentNote, setAccentNote] = useState(
    'Indian English & Hindi multilingual phonetic features explicitly differentiated from disorder.',
  );
  const [dsExistingDiag, setDsExistingDiag] = useState(false);
  const [dsDiagDetail, setDsDiagDetail] = useState('');
  const [dsHearing, setDsHearing] = useState('');
  const [dsVision, setDsVision] = useState('');
  const [dsCardiac, setDsCardiac] = useState('');
  const [dsGenetic, setDsGenetic] = useState('');

  const selectedStudent = useMemo(
    () => data.students.find((s) => s.id === selectedStudentId) || data.students[0],
    [data.students, selectedStudentId],
  );

  const studentCases = useMemo(
    () => (clinical?.screeningCases || []).filter((c) => !selectedStudent || c.studentId === selectedStudent.id),
    [clinical?.screeningCases, selectedStudent],
  );
  const studentHistories = useMemo(
    () =>
      (clinical?.developmentalHistories || []).filter(
        (h) => !selectedStudent || h.studentId === selectedStudent.id,
      ),
    [clinical?.developmentalHistories, selectedStudent],
  );
  const studentParentQs = useMemo(
    () =>
      (clinical?.parentQuestionnaires || []).filter(
        (q) => !selectedStudent || q.studentId === selectedStudent.id,
      ),
    [clinical?.parentQuestionnaires, selectedStudent],
  );
  const studentTeacherObs = useMemo(
    () =>
      (clinical?.teacherObservations || []).filter(
        (t) => !selectedStudent || t.studentId === selectedStudent.id,
      ),
    [clinical?.teacherObservations, selectedStudent],
  );
  const studentAssessments = useMemo(
    () =>
      (clinical?.conditionAssessments || []).filter(
        (a) => (!selectedStudent || a.studentId === selectedStudent.id) && a.pathway === pathwayTab,
      ),
    [clinical?.conditionAssessments, selectedStudent, pathwayTab],
  );

  function toggleDomain(domain: ClinicalDomain) {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? (prev.length > 1 ? prev.filter((d) => d !== domain) : prev) : [...prev, domain],
    );
  }

  async function submitHistory(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await apiRequest<{ redFlags?: { urgentMedicalFlag: boolean } }>(
        '/api/clinical/developmental-history',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            pregnancyAndBirthHistory: pregnancyHistory,
            birthComplications,
            milestones: [
              {
                key: 'first_words',
                label: 'First meaningful words',
                ageAchievedMonths: firstWordsMonths ? Number(firstWordsMonths) : null,
                status: firstWordsMonths ? 'Achieved' : 'Unknown / Not recalled',
              },
              {
                key: 'sentences',
                label: 'Sentence development',
                ageAchievedMonths: sentencesMonths ? Number(sentencesMonths) : null,
                status: sentencesMonths ? 'Achieved' : 'Unknown / Not recalled',
              },
              {
                key: 'walking',
                label: 'Walking & motor milestones',
                ageAchievedMonths: walkingMonths ? Number(walkingMonths) : null,
                status: walkingMonths ? 'Achieved' : 'Unknown / Not recalled',
              },
            ],
            hearingHistory,
            medicalHistory,
            familyDevelopmentalHistory: familyHistory,
            previousAssessments,
            previousTherapies,
            regressionOrSkillLoss: regressionFlag,
            regressionDetails,
            seizuresOrMedicalRedFlags: seizureFlag,
            medicalRedFlagDetails: seizureDetails,
            homeLanguage,
            languagesSpokenByChild: languagesSpoken.split(',').map((s) => s.trim()).filter(Boolean),
            socialInteractionSummary: socialSummary,
            playBehaviourSummary: playSummary,
            dailyLivingSkillsSummary: dailyLivingSummary,
          }),
        },
        token,
      );
      await onRefresh();
      setFeedback({
        kind: 'ok',
        text: res.redFlags?.urgentMedicalFlag
          ? 'Developmental history saved. A timely medical assessment flag has been raised automatically for clinician review.'
          : 'Developmental history recorded cleanly (missing ages are never treated as clinical concerns).',
      });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Failed to save developmental history.' });
    } finally {
      setBusy(false);
    }
  }

  async function submitParentQuestionnaire(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/parent-questionnaire',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            ageBand,
            homeLanguageContext: homeLanguage,
            items: pqItems,
            parentTopStrengths: parentStrengths,
            parentPrimaryQuestions: parentQuestions,
          }),
        },
        token,
      );
      await onRefresh();
      setFeedback({ kind: 'ok', text: 'Parent questionnaire submitted securely for specialist review.' });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Could not submit questionnaire.' });
    } finally {
      setBusy(false);
    }
  }

  async function submitTeacherObservation(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/teacher-observation',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            classroomCommunication: toComm,
            followingInstructions: toInstructions,
            attentionDuringLessons: toAttention,
            peerInteraction: toPeer,
            participation: toParticipation,
            turnTaking: toTurnTaking,
            behaviouralObservations: toBehaviour,
            speechIntelligibility: toIntelligibility,
            readingWritingConcerns: toLiteracy,
            learningProgress: toProgress,
            classroomIndependence: toIndependence,
            socialParticipation: toPeer,
            observableStrengths: toStrengths,
          }),
        },
        token,
      );
      await onRefresh();
      setToComm('');
      setToInstructions('');
      setToAttention('');
      setToStrengths('');
      setFeedback({ kind: 'ok', text: 'Observable classroom record saved for the clinical support team.' });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Could not save observation.' });
    } finally {
      setBusy(false);
    }
  }

  async function submitScreeningCase(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/screenings',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            domains: selectedDomains,
            workflowStatus: screeningStatus,
            recommendedSpecialistReferral: screeningReferral,
            authorizedClassroomSummary: classroomSummary,
            multilingualContextNote: multilingualNote,
          }),
        },
        token,
      );
      await onRefresh();
      setScreeningReferral('');
      setClassroomSummary('');
      setFeedback({ kind: 'ok', text: 'Non-diagnostic screening workflow record created.' });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Could not create screening case.' });
    } finally {
      setBusy(false);
    }
  }

  async function submitConditionAssessment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/assessments',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            pathway: pathwayTab,
            subCategory: pathwayTab === 'other_developmental' ? subCategory : undefined,
            status: pathwayTab === 'down_syndrome_referral' ? 'Referred to External Specialist' : 'Completed',
            licensedInstrumentsUsed: licensedTools
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            crossSettingNotes:
              pathwayTab === 'adhd' || pathwayTab === 'autism_spectrum'
                ? {
                    homeFunctioning: homeFunc,
                    classroomFunctioning: classFunc,
                    sleepAndContributingFactors: sleepFactors,
                    alternativeExplanationsReviewed: altExplanations,
                  }
                : undefined,
            multilingualProfile:
              pathwayTab === 'speech_language'
                ? {
                    primaryHomeLanguage: homeLanguage,
                    languagesAssessed: languagesSpoken.split(',').map((s) => s.trim()).filter(Boolean),
                    accentOrSecondLanguageNote: accentNote,
                  }
                : undefined,
            medicalReferralData:
              pathwayTab === 'down_syndrome_referral'
                ? {
                    existingMedicalDiagnosisDocumented: dsExistingDiag,
                    existingMedicalDiagnosisDetails: dsDiagDetail,
                    hearingAssessmentStatus: dsHearing,
                    visionAssessmentStatus: dsVision,
                    cardiacAssessmentStatus: dsCardiac,
                    geneticTestingStatus: dsGenetic,
                  }
                : undefined,
            professionalObservation: profObservation,
            functionalImpactSummary: functionalImpact,
            referralRecommendation: referralRec,
            authorizedClassroomGuidance: authClassroomGuidance,
          }),
        },
        token,
      );
      await onRefresh();
      setProfObservation('');
      setFunctionalImpact('');
      setReferralRec('');
      setFeedback({ kind: 'ok', text: 'Professional assessment workflow documented cleanly.' });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Could not save assessment.' });
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'pathways') {
    const pathwayTabs: Array<{ id: ConditionPathwayType; label: string }> = [
      { id: 'autism_spectrum', label: 'Autism Spectrum' },
      { id: 'adhd', label: 'ADHD Cross-Setting' },
      { id: 'speech_language', label: 'Speech & Language' },
      { id: 'down_syndrome_referral', label: 'Down Syndrome Medical Referral' },
      { id: 'other_developmental', label: 'Other Developmental' },
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Condition-Specific Professional Assessment Workflows
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Separate specialist pathways supporting licensed clinical instruments, cross-setting evidence, and appropriate medical referrals without automated diagnosis.
            </p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
            {pathwayTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPathwayTab(t.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  pathwayTab === t.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pathway-specific clinical boundary notice */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <ShieldAlert className="h-4 w-4 text-blue-900 shrink-0" />
            <span>
              {pathwayTab === 'autism_spectrum' &&
                'Autism Spectrum Pathway: Uses multi-informant observation & licensed clinical instruments only. Never generates an autism diagnosis from questionnaire scores.'}
              {pathwayTab === 'adhd' &&
                'ADHD Pathway: Evaluates home + classroom settings, duration, developmental appropriateness, sleep, and alternative explanations. Energetic classroom behaviour alone is never classified as ADHD.'}
              {pathwayTab === 'speech_language' &&
                'Multilingual Speech & Language Pathway: Evaluates receptive, expressive, pragmatic, articulation, voice, and hearing profiles across English, Hindi, and home languages. Accent or second-language acquisition is never scored as a disorder.'}
              {pathwayTab === 'down_syndrome_referral' &&
                'Down Syndrome Medical Referral Pathway: Strictly documents existing medical/genetic, hearing, vision, and cardiac records or external specialist referrals. Facial photography, appearance screening, and AI image analysis are strictly prohibited.'}
              {pathwayTab === 'other_developmental' &&
                'Specialist-Defined Developmental Protocols: Supports SLD, Developmental Language Disorder, Intellectual Developmental Difficulties, Childhood Apraxia of Speech (CAS), sensory/functional needs, and emotional/anxiety referrals.'}
            </span>
          </div>
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
              Documented Assessments · {selectedStudent?.name || 'All Students'} ({studentAssessments.length})
            </h3>
            {studentAssessments.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500">
                No records logged in this pathway yet for {selectedStudent?.name || 'the selected student'}.
              </div>
            ) : (
              studentAssessments.map((rec) => (
                <div key={rec.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {rec.studentName} · {rec.classSection}
                        {rec.subCategory ? ` — ${rec.subCategory}` : ''}
                      </p>
                      <p className="text-xs text-slate-500">
                        {rec.assessorName} · {rec.assessorCredentials} · {rec.assessmentDate}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-blue-900">{rec.status}</span>
                  </div>
                  {rec.licensedInstrumentsUsed.length > 0 && (
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Licensed Instruments Referenced:</span>{' '}
                      {rec.licensedInstrumentsUsed.join(' · ')}
                    </p>
                  )}
                  {Object.keys(rec.structuredFindings).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {Object.entries(rec.structuredFindings).map(([k, v]) => (
                        <div key={k} className="border-t border-slate-100 pt-2">
                          <p className="text-xs font-semibold text-slate-800">{k}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {rec.crossSettingNotes && (
                    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                      <p className="font-semibold text-slate-900">Cross-Setting & Alternative Factor Review</p>
                      {rec.crossSettingNotes.homeFunctioning && <p>Home: {rec.crossSettingNotes.homeFunctioning}</p>}
                      {rec.crossSettingNotes.classroomFunctioning && <p>Classroom: {rec.crossSettingNotes.classroomFunctioning}</p>}
                      {rec.crossSettingNotes.sleepAndContributingFactors && (
                        <p>Sleep / Contributing Factors: {rec.crossSettingNotes.sleepAndContributingFactors}</p>
                      )}
                      {rec.crossSettingNotes.alternativeExplanationsReviewed && (
                        <p>Alternative Explanations Reviewed: {rec.crossSettingNotes.alternativeExplanationsReviewed}</p>
                      )}
                    </div>
                  )}
                  {rec.multilingualProfile && (
                    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                      <p className="font-semibold text-slate-900">Multilingual Safeguard Profile</p>
                      <p>
                        Home Language: {rec.multilingualProfile.primaryHomeLanguage} · Assessed:{' '}
                        {rec.multilingualProfile.languagesAssessed.join(', ')}
                      </p>
                      <p>{rec.multilingualProfile.accentOrSecondLanguageNote}</p>
                    </div>
                  )}
                  {rec.medicalReferralData && (
                    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                      <p className="font-semibold text-slate-900">Medical & Specialist Records Summary</p>
                      <p>
                        Documented Medical Diagnosis:{' '}
                        {rec.medicalReferralData.existingMedicalDiagnosisDocumented
                          ? rec.medicalReferralData.existingMedicalDiagnosisDetails || 'Yes (on file)'
                          : 'Not documented — medical & genetic consultation recommended'}
                      </p>
                      {rec.medicalReferralData.hearingAssessmentStatus && (
                        <p>Hearing: {rec.medicalReferralData.hearingAssessmentStatus}</p>
                      )}
                      {rec.medicalReferralData.visionAssessmentStatus && (
                        <p>Vision: {rec.medicalReferralData.visionAssessmentStatus}</p>
                      )}
                      {rec.medicalReferralData.cardiacAssessmentStatus && (
                        <p>Cardiac: {rec.medicalReferralData.cardiacAssessmentStatus}</p>
                      )}
                      {rec.medicalReferralData.geneticTestingStatus && (
                        <p>Genetic Testing: {rec.medicalReferralData.geneticTestingStatus}</p>
                      )}
                    </div>
                  )}
                  <div className="space-y-1 text-xs text-slate-700 border-t border-slate-100 pt-2">
                    <p>
                      <span className="font-semibold text-slate-900">Professional Observation:</span>{' '}
                      {rec.professionalObservation}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Functional Impact:</span>{' '}
                      {rec.functionalImpactSummary}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Specialist Referral Recommendation:</span>{' '}
                      {rec.referralRecommendation}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-5">
            {isSpecialist ? (
              <form
                onSubmit={submitConditionAssessment}
                className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Stethoscope className="h-4 w-4 text-blue-900" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Log Specialist Pathway Assessment
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Student: <span className="font-semibold text-slate-800">{selectedStudent?.name}</span> · Assessor:{' '}
                  {data.user.name}
                </p>

                {pathwayTab === 'other_developmental' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Developmental Protocol Focus
                    </label>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    >
                      <option>Specific Learning Disorder (SLD)</option>
                      <option>Developmental Language Disorder (DLD)</option>
                      <option>Intellectual Developmental Difficulties</option>
                      <option>Childhood Apraxia of Speech (CAS)</option>
                      <option>Motor Speech Difficulties</option>
                      <option>Sensory & Functional Difficulties</option>
                      <option>Anxiety-Related Concerns</option>
                      <option>Emotional & Behavioural Difficulties</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Licensed Assessment Instruments Used (comma-separated; never copy proprietary items)
                  </label>
                  <input
                    type="text"
                    value={licensedTools}
                    onChange={(e) => setLicensedTools(e.target.value)}
                    placeholder="e.g. Licensed clinical observation protocol, multilingual language sample"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                {(pathwayTab === 'adhd' || pathwayTab === 'autism_spectrum') && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={homeFunc}
                      onChange={(e) => setHomeFunc(e.target.value)}
                      placeholder="Home functioning & parent observations"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={classFunc}
                      onChange={(e) => setClassFunc(e.target.value)}
                      placeholder="Classroom functioning & peer engagement"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={sleepFactors}
                      onChange={(e) => setSleepFactors(e.target.value)}
                      placeholder="Sleep, nutrition, or environmental contributing factors"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={altExplanations}
                      onChange={(e) => setAltExplanations(e.target.value)}
                      placeholder="Alternative explanations reviewed (vision, hearing, language transition)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                )}

                {pathwayTab === 'speech_language' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Multilingual & Accent Safeguard Note
                    </label>
                    <textarea
                      rows={2}
                      value={accentNote}
                      onChange={(e) => setAccentNote(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                )}

                {pathwayTab === 'down_syndrome_referral' && (
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={dsExistingDiag}
                        onChange={(e) => setDsExistingDiag(e.target.checked)}
                      />
                      Existing medical diagnosis already documented by physician
                    </label>
                    {dsExistingDiag && (
                      <input
                        type="text"
                        value={dsDiagDetail}
                        onChange={(e) => setDsDiagDetail(e.target.value)}
                        placeholder="Hospital / specialist report reference"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      />
                    )}
                    <input
                      type="text"
                      value={dsHearing}
                      onChange={(e) => setDsHearing(e.target.value)}
                      placeholder="Hearing assessment record status"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={dsVision}
                      onChange={(e) => setDsVision(e.target.value)}
                      placeholder="Vision assessment record status"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={dsCardiac}
                      onChange={(e) => setDsCardiac(e.target.value)}
                      placeholder="Cardiac evaluation status (where relevant)"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={dsGenetic}
                      onChange={(e) => setDsGenetic(e.target.value)}
                      placeholder="Genetic consultation / testing record status"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Professional Observation *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={profObservation}
                    onChange={(e) => setProfObservation(e.target.value)}
                    placeholder="Structured clinical observation within your scope of practice..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Functional Impact Summary
                  </label>
                  <input
                    type="text"
                    value={functionalImpact}
                    onChange={(e) => setFunctionalImpact(e.target.value)}
                    placeholder="Everyday learning, communication, or participation impact"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specialist Referral / Next Pathway Recommendation *
                  </label>
                  <input
                    required
                    type="text"
                    value={referralRec}
                    onChange={(e) => setReferralRec(e.target.value)}
                    placeholder="e.g. Refer to Developmental Paediatrician / SLP / Geneticist"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Authorised Classroom Support Guidance (non-confidential)
                  </label>
                  <input
                    type="text"
                    value={authClassroomGuidance}
                    onChange={(e) => setAuthClassroomGuidance(e.target.value)}
                    placeholder="Practical accommodations visible to class teacher only"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
                >
                  {busy ? 'Saving...' : 'Save Pathway Assessment'}
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600">
                Condition-specific professional assessments are restricted to credentialed clinical specialists (Clinical Psychologist, Speech-Language Pathologist, Audiologist, Special Educator, or Authorised Counsellor).
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PART 1: DEVELOPMENTAL SCREENING CENTRE
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Developmental Screening & Early Identification Centre
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Multi-informant developmental history, parent questionnaire, observable teacher records, and non-diagnostic referral indicators across 12 domains.
          </p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {!isParent && (
            <button
              type="button"
              onClick={() => setSubSection('cases')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                subSection === 'cases' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Screening Output ({studentCases.length})
            </button>
          )}
          {(isSpecialist || isParent) && (
            <>
              <button
                type="button"
                onClick={() => setSubSection('history')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  subSection === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Developmental History ({studentHistories.length})
              </button>
              <button
                type="button"
                onClick={() => setSubSection('parent_q')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  subSection === 'parent_q' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Parent Questionnaire ({studentParentQs.length})
              </button>
            </>
          )}
          {(isTeacher || isSpecialist || isManagement) && (
            <button
              type="button"
              onClick={() => setSubSection('teacher_obs')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                subSection === 'teacher_obs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Teacher Observations ({studentTeacherObs.length})
            </button>
          )}
        </div>
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

      {subSection === 'cases' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            {studentCases.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500">
                No screening workflow cases initiated yet for {selectedStudent?.name || 'this student'}.
              </div>
            ) : (
              studentCases.map((sc) => (
                <div key={sc.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {sc.studentName} · {sc.classSection}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Initiated by {sc.initiatedBy} · {sc.initiatedAt} · {sc.completionStatus}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        sc.urgentMedicalFlag
                          ? 'text-red-700'
                          : sc.workflowStatus === 'No immediate concern identified'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                      }`}
                    >
                      {sc.workflowStatus}
                    </span>
                  </div>

                  {sc.urgentMedicalFlag && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-xs text-red-800">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Timely Medical Assessment Flagged</p>
                        <p>{sc.urgentMedicalReason}</p>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Domains Screened: </span>
                    {sc.domains.map((d) => CLINICAL_DOMAIN_LABELS[d] || d).join(' · ')}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <p className="text-xs font-semibold text-emerald-800">Areas of Strength</p>
                      <ul className="mt-1 space-y-1 text-xs text-slate-700 list-disc pl-4">
                        {sc.areasOfStrength.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {isTeacher ? 'Authorised Classroom Guidance' : 'Areas Requiring Further Assessment'}
                      </p>
                      <ul className="mt-1 space-y-1 text-xs text-slate-700 list-disc pl-4">
                        {sc.areasRequiringFurtherAssessment.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2.5 text-xs text-slate-700 space-y-1">
                    <p>
                      <span className="font-semibold text-slate-900">Recommended Specialist Referral:</span>{' '}
                      {sc.recommendedSpecialistReferral}
                    </p>
                    {sc.multilingualContextNote && (
                      <p className="text-slate-500">Multilingual Note: {sc.multilingualContextNote}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {(isSpecialist || isManagement) && (
            <form
              onSubmit={submitScreeningCase}
              className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <FilePlus2 className="h-4 w-4 text-blue-900" />
                <h3 className="text-sm font-bold text-slate-900">Initiate Screening Workflow</h3>
              </div>
              <p className="text-xs text-slate-500">
                Select one or more of the 12 developmental domains for <span className="font-semibold text-slate-800">{selectedStudent?.name}</span>. Outputs are non-diagnostic workflow indicators.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                {(Object.keys(CLINICAL_DOMAIN_LABELS) as ClinicalDomain[]).map((dom) => (
                  <label
                    key={dom}
                    className={`flex items-start gap-2 rounded-lg border p-2 text-xs cursor-pointer ${
                      selectedDomains.includes(dom)
                        ? 'border-blue-900 bg-blue-50/40 text-slate-900 font-medium'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDomains.includes(dom)}
                      onChange={() => toggleDomain(dom)}
                      className="mt-0.5"
                    />
                    <span>{CLINICAL_DOMAIN_LABELS[dom]}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workflow Status Indicator (Non-Diagnostic)
                </label>
                <select
                  value={screeningStatus}
                  onChange={(e) => setScreeningStatus(e.target.value as ScreeningWorkflowStatus)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                >
                  {WORKFLOW_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recommended Specialist Referral
                </label>
                <input
                  type="text"
                  value={screeningReferral}
                  onChange={(e) => setScreeningReferral(e.target.value)}
                  placeholder="Leave blank to auto-suggest from parent/teacher inputs"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Authorised Classroom Support Summary (safe for teacher view)
                </label>
                <textarea
                  rows={2}
                  value={classroomSummary}
                  onChange={(e) => setClassroomSummary(e.target.value)}
                  placeholder="Non-confidential classroom accommodations only"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Multilingual & Home Language Context
                </label>
                <input
                  type="text"
                  value={multilingualNote}
                  onChange={(e) => setMultilingualNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {busy ? 'Saving...' : 'Create Screening Record'}
              </button>
            </form>
          )}
        </div>
      )}

      {subSection === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={submitHistory}
            className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900">
              Structured Developmental History · {selectedStudent?.name}
            </h3>
            <p className="text-xs text-slate-500">
              Record known milestone ages where remembered. Blank or unknown entries are never assumed to indicate a developmental concern.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Home Language
                </label>
                <input
                  type="text"
                  value={homeLanguage}
                  onChange={(e) => setHomeLanguage(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Languages Spoken by Child
                </label>
                <input
                  type="text"
                  value={languagesSpoken}
                  onChange={(e) => setLanguagesSpoken(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Words (age in months, if known)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={firstWordsMonths}
                  onChange={(e) => setFirstWordsMonths(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sentence Development (months, if known)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={sentencesMonths}
                  onChange={(e) => setSentencesMonths(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Independent Walking (months, if known)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={walkingMonths}
                  onChange={(e) => setWalkingMonths(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hearing History
                </label>
                <input
                  type="text"
                  value={hearingHistory}
                  onChange={(e) => setHearingHistory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pregnancy & Birth History
                </label>
                <textarea
                  rows={2}
                  value={pregnancyHistory}
                  onChange={(e) => setPregnancyHistory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Birth Complications / Medical & Family History
                </label>
                <textarea
                  rows={2}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Social Interaction & Play Behaviour
                </label>
                <textarea
                  rows={2}
                  value={socialSummary}
                  onChange={(e) => setSocialSummary(e.target.value)}
                  placeholder="How the child interacts, plays, and shares interests"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Living Skills & Previous Therapies
                </label>
                <textarea
                  rows={2}
                  value={dailyLivingSummary}
                  onChange={(e) => setDailyLivingSummary(e.target.value)}
                  placeholder="Self-care routines, prior assessments or therapies"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>

            {/* Medical Safety Red-Flag Check */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 space-y-2">
              <p className="text-xs font-bold text-amber-900">
                Medical Safety Check (Automatically flags timely medical consultation)
              </p>
              <label className="flex items-center gap-2 text-xs text-slate-800">
                <input
                  type="checkbox"
                  checked={regressionFlag}
                  onChange={(e) => setRegressionFlag(e.target.checked)}
                />
                Loss or regression of previously acquired speech, social, or motor skills
              </label>
              {regressionFlag && (
                <input
                  type="text"
                  value={regressionDetails}
                  onChange={(e) => setRegressionDetails(e.target.value)}
                  placeholder="Describe when the skill change was first noticed"
                  className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs"
                />
              )}
              <label className="flex items-center gap-2 text-xs text-slate-800">
                <input
                  type="checkbox"
                  checked={seizureFlag}
                  onChange={(e) => setSeizureFlag(e.target.checked)}
                />
                History of seizures or sudden significant medical symptoms
              </label>
              {seizureFlag && (
                <input
                  type="text"
                  value={seizureDetails}
                  onChange={(e) => setSeizureDetails(e.target.value)}
                  placeholder="Brief medical detail for physician referral"
                  className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {busy ? 'Saving...' : 'Save Developmental History'}
            </button>
          </form>

          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Recorded Histories</h3>
            {studentHistories.map((h) => (
              <div key={h.id} className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span className="font-semibold text-slate-900">{h.submittedByName}</span>
                  <span className="tabular-nums">{h.submittedAt}</span>
                </div>
                <p className="text-slate-700">
                  <span className="font-semibold">Languages:</span> {h.homeLanguage} (Child:{' '}
                  {h.languagesSpokenByChild.join(', ')})
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Hearing:</span> {h.hearingHistory}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Milestones:</span>{' '}
                  {h.milestones
                    .map((m) => `${m.label}: ${m.ageAchievedMonths ? `${m.ageAchievedMonths}m` : m.status}`)
                    .join(' · ')}
                </p>
                {(h.regressionOrSkillLoss || h.seizuresOrMedicalRedFlags) && (
                  <p className="font-semibold text-red-700">
                    Medical Review Flag Active — Timely paediatric evaluation recommended.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {subSection === 'parent_q' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={submitParentQuestionnaire}
            className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Parent Developmental Questionnaire · {selectedStudent?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Easy everyday questions — answer calmly based on home routines and add any notes you wish to share.
                </p>
              </div>
              <select
                value={ageBand}
                onChange={(e) => setAgeBand(e.target.value as typeof ageBand)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold"
              >
                <option value="3-5 yrs">Age 3–5 yrs</option>
                <option value="6-9 yrs">Age 6–9 yrs</option>
                <option value="10-13 yrs">Age 10–13 yrs</option>
                <option value="14-18 yrs">Age 14–18 yrs</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {pqItems.map((item, idx) => (
                <div key={item.id} className="border-b border-slate-100 pb-3 space-y-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900">
                      {idx + 1}. {item.domain}
                    </p>
                  </div>
                  <p className="text-xs text-slate-700">{item.question}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {RESPONSE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setPqItems((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, response: opt } : p)),
                          )
                        }
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                          item.response === opt
                            ? 'border-blue-900 bg-blue-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={item.explanation || ''}
                    onChange={(e) =>
                      setPqItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, explanation: e.target.value } : p)),
                      )
                    }
                    placeholder="Optional parent note or example from home..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <textarea
                rows={2}
                value={parentStrengths}
                onChange={(e) => setParentStrengths(e.target.value)}
                placeholder="Your child's favourite strengths, interests & joyful moments..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <textarea
                rows={2}
                value={parentQuestions}
                onChange={(e) => setParentQuestions(e.target.value)}
                placeholder="Any questions you would like the specialist team to discuss with you..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {busy ? 'Submitting...' : 'Submit Parent Questionnaire'}
            </button>
          </form>

          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Submitted Questionnaires</h3>
            {studentParentQs.map((q) => (
              <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">{q.completedBy}</span>
                  <span className="text-slate-500 tabular-nums">{q.completedAt}</span>
                </div>
                <p className="text-slate-600">
                  Age Band: {q.ageBand} · {q.items.length} domains recorded
                </p>
                {q.parentTopStrengths && (
                  <p className="text-emerald-800">Strengths: {q.parentTopStrengths}</p>
                )}
                {q.parentPrimaryQuestions && (
                  <p className="text-slate-700">Parent Questions: {q.parentPrimaryQuestions}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {subSection === 'teacher_obs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={submitTeacherObservation}
            className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-3"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserCheck className="h-4 w-4 text-blue-900" />
              <h3 className="text-sm font-bold text-slate-900">
                Teacher Classroom Observation Form · {selectedStudent?.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Record factual, observable classroom behaviour only — never enter clinical labels or diagnostic guesses.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                type="text"
                value={toComm}
                onChange={(e) => setToComm(e.target.value)}
                placeholder="Classroom communication (observable) *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <input
                required
                type="text"
                value={toInstructions}
                onChange={(e) => setToInstructions(e.target.value)}
                placeholder="Following classroom instructions *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={toAttention}
                onChange={(e) => setToAttention(e.target.value)}
                placeholder="Attention during lessons"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={toPeer}
                onChange={(e) => setToPeer(e.target.value)}
                placeholder="Peer interaction & social participation"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={toParticipation}
                onChange={(e) => setToParticipation(e.target.value)}
                placeholder="Participation & turn-taking"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <select
                value={toIntelligibility}
                onChange={(e) => setToIntelligibility(e.target.value as typeof toIntelligibility)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              >
                <option value="Clear to all">Speech clarity: Clear to all</option>
                <option value="Mostly clear">Speech clarity: Mostly clear</option>
                <option value="Clear to familiar listeners">Speech clarity: Clear to familiar listeners</option>
                <option value="Difficult to understand in class">Speech clarity: Difficult to understand in class</option>
              </select>
              <input
                type="text"
                value={toLiteracy}
                onChange={(e) => setToLiteracy(e.target.value)}
                placeholder="Reading & writing observations"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={toIndependence}
                onChange={(e) => setToIndependence(e.target.value)}
                placeholder="Classroom independence & learning progress"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <input
              type="text"
              value={toBehaviour}
              onChange={(e) => setToBehaviour(e.target.value)}
              placeholder="Other observable classroom behaviours (factual, non-judgmental)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              required
              type="text"
              value={toStrengths}
              onChange={(e) => setToStrengths(e.target.value)}
              placeholder="Observable student strengths & classroom wins *"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {busy ? 'Saving...' : 'Submit Classroom Observation'}
            </button>
          </form>

          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Recorded Teacher Observations</h3>
            {studentTeacherObs.map((obs) => (
              <div key={obs.id} className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">{obs.teacherName}</span>
                  <span className="text-slate-500 tabular-nums">{obs.observedDate}</span>
                </div>
                <p className="text-slate-700">
                  <span className="font-semibold">Communication:</span> {obs.classroomCommunication}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Speech Intelligibility:</span> {obs.speechIntelligibility}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Attention & Instructions:</span> {obs.attentionDuringLessons || obs.followingInstructions}
                </p>
                <p className="text-emerald-800">
                  <span className="font-semibold">Strengths:</span> {obs.observableStrengths}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
