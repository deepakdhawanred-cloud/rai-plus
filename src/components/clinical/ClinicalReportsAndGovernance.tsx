import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  FileText,
  Lock,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import type { WorkspaceData } from '../../types/workspace';
import type { ClinicalReportRecord, ClinicalReportType } from '../../types/clinical';
import {
  buildClinicalAuditSummary,
  buildClinicalReportPrintHtml,
  canEnterClinicalDiagnosis,
  CLINICAL_SPECIALIST_ROLES,
  MANAGEMENT_ROLES,
} from '../../utils/clinicalCareEngine';
import { apiRequest } from '../../utils/api';

interface Props {
  data: WorkspaceData;
  token: string;
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onRefresh: () => Promise<void>;
  mode: 'dashboard' | 'reports' | 'governance';
}

const REPORT_TYPE_LABELS: Record<ClinicalReportType, string> = {
  developmental_screening: 'Developmental Screening Report',
  speech_assessment: 'Speech Assessment Report',
  therapy_progress: 'Therapy Progress Report',
  professional_clinical: 'Professional Clinical Report',
};

export const ClinicalReportsAndGovernance: React.FC<Props> = ({
  data,
  token,
  selectedStudentId,
  onSelectStudent,
  onRefresh,
  mode,
}) => {
  const clinical = data.clinicalCare;
  const role = data.user.role;
  const isSpecialist = CLINICAL_SPECIALIST_ROLES.includes(role);
  const isManagement = MANAGEMENT_ROLES.includes(role);
  const isParent = role === 'parent';
  const canDiagnose = canEnterClinicalDiagnosis(role);

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [previewReport, setPreviewReport] = useState<ClinicalReportRecord | null>(null);

  // Report Authoring State (Part 10)
  const [reportType, setReportType] = useState<ClinicalReportType>('therapy_progress');
  const [reportTitle, setReportTitle] = useState('');
  const [findingsText, setFindingsText] = useState('');
  const [clinicianDiagnosis, setClinicianDiagnosis] = useState('');
  const [parentSummary, setParentSummary] = useState('');
  const [teacherSummary, setTeacherSummary] = useState('');
  const [recommendationsText, setRecommendationsText] = useState('');
  const [shareParent, setShareParent] = useState(true);
  const [shareMgmt, setShareMgmt] = useState(false);
  const [shareTeacher, setShareTeacher] = useState(true);

  // Consent State (Part 12)
  const selectedStudent = useMemo(
    () => data.students.find((s) => s.id === selectedStudentId) || data.students[0],
    [data.students, selectedStudentId],
  );
  const existingConsent = useMemo(
    () =>
      (clinical?.consents || []).find(
        (c) => selectedStudent && c.studentId === selectedStudent.id,
      ),
    [clinical?.consents, selectedStudent],
  );

  const [guardianName, setGuardianName] = useState(
    existingConsent?.guardianName || selectedStudent?.guardianName || '',
  );
  const [screeningConsent, setScreeningConsent] = useState(existingConsent?.screeningConsent ?? true);
  const [assessmentConsent, setAssessmentConsent] = useState(existingConsent?.assessmentConsent ?? true);
  const [therapyConsent, setTherapyConsent] = useState(existingConsent?.therapyConsent ?? false);
  const [audioConsent, setAudioConsent] = useState(existingConsent?.audioRecordingConsent ?? false);
  const [teacherShareConsent, setTeacherShareConsent] = useState(
    existingConsent?.reportSharingWithTeachers ?? true,
  );
  const [childAssent, setChildAssent] = useState(existingConsent?.childAssentRecorded ?? true);
  const [retentionMonths, setRetentionMonths] = useState(existingConsent?.retentionPolicyMonths ?? 36);

  async function handleIssueReport(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/reports',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            reportType,
            title: reportTitle || `${REPORT_TYPE_LABELS[reportType]} — ${selectedStudent.name}`,
            screeningFindings: reportType === 'developmental_screening' ? findingsText : undefined,
            languageAndSpeechProfile: reportType === 'speech_assessment' ? findingsText : undefined,
            baselineAndProgressSummary: reportType === 'therapy_progress' ? findingsText : undefined,
            clinicalAssessmentFindings: reportType === 'professional_clinical' ? findingsText : undefined,
            professionalDiagnosis:
              reportType === 'professional_clinical' && canDiagnose ? clinicianDiagnosis : undefined,
            parentFriendlySummary: parentSummary,
            teacherAuthorizedSummary: teacherSummary,
            recommendations: recommendationsText
              .split('\n')
              .map((r) => r.trim())
              .filter(Boolean),
            signImmediately: true,
            sharedWithParent: shareParent,
            sharedWithManagement: shareMgmt,
            sharedClassroomSummaryWithTeacher: shareTeacher,
          }),
        },
        token,
      );
      await onRefresh();
      setReportTitle('');
      setFindingsText('');
      setClinicianDiagnosis('');
      setParentSummary('');
      setRecommendationsText('');
      setFeedback({ kind: 'ok', text: 'Signed clinical report issued and sharing controls enforced.' });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Could not issue report.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleViewOrPrintReport(report: ClinicalReportRecord, exportMode: 'view' | 'export') {
    try {
      await apiRequest(
        `/api/clinical/reports/${report.id}/log-access`,
        {
          method: 'POST',
          body: JSON.stringify({ mode: exportMode }),
        },
        token,
      );
      void onRefresh();
    } catch {
      // Non-blocking audit ping
    }

    if (exportMode === 'view') {
      setPreviewReport(report);
      return;
    }

    const html = buildClinicalReportPrintHtml(report, data.activeSchool.name);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportType}-${report.studentName.toLowerCase().replace(/\s+/g, '-')}-${report.reportDate}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleSaveConsent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/clinical/consent',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudent.id,
            guardianName: guardianName || selectedStudent.guardianName,
            guardianRelation: 'Parent / Guardian',
            screeningConsent,
            assessmentConsent,
            therapyConsent,
            audioRecordingConsent: audioConsent,
            reportSharingWithTeachers: teacherShareConsent,
            childAssentRecorded: childAssent,
            retentionPolicyMonths: retentionMonths,
          }),
        },
        token,
      );
      await onRefresh();
      setFeedback({ kind: 'ok', text: 'Parent consent, child assent, and retention settings updated.' });
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'Consent update failed.' });
    } finally {
      setBusy(false);
    }
  }

  // PART 9: SPECIALIST MANAGEMENT DASHBOARD
  if (mode === 'dashboard') {
    const screenings = clinical?.screeningCases || [];
    const assessments = clinical?.conditionAssessments || [];
    const plans = clinical?.therapyPlans || [];
    const logs = clinical?.therapySessionLogs || [];
    const homeLogs = clinical?.parentHomePracticeLogs || [];

    const awaitingScreening = screenings.filter((s) => s.completionStatus !== 'Completed').length;
    const pendingAssessments = assessments.filter((a) => a.status !== 'Completed').length;
    const activePlans = plans.filter((p) => p.approvalStatus === 'Approved & Active').length;
    const plansNeedingReview = plans.filter((p) => p.approvalStatus !== 'Approved & Active').length;
    const missedSessions = logs.filter((l) => l.attendanceStatus === 'Missed').length;
    const urgentMedicalCases = screenings.filter((s) => s.urgentMedicalFlag);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            ['Awaiting Screening', awaitingScreening, 'text-slate-900'],
            ['Pending Assessments', pendingAssessments, 'text-amber-700'],
            ['Active Therapy Plans', activePlans, 'text-emerald-700'],
            ['Plans Needing Review', plansNeedingReview, 'text-blue-900'],
            ['Missed Sessions', missedSessions, missedSessions > 0 ? 'text-red-700' : 'text-slate-900'],
            ['Home Practice Logs', homeLogs.length, 'text-slate-900'],
          ].map(([label, val, color]) => (
            <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`text-2xl font-bold mt-1 tabular-nums ${color}`}>{val}</p>
            </div>
          ))}
        </div>

        {urgentMedicalCases.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>Timely Medical Assessment Flags ({urgentMedicalCases.length})</span>
            </div>
            {urgentMedicalCases.map((c) => (
              <p key={c.id} className="text-xs text-red-700">
                <span className="font-semibold">{c.studentName} ({c.classSection}):</span> {c.urgentMedicalReason}
              </p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Caseload Table */}
          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Multidisciplinary Caseload & Reassessment Schedule
              </h3>
              <span className="text-xs text-slate-500 tabular-nums">{screenings.length} active cases</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Student</th>
                    <th className="px-4 py-2.5 font-semibold">Workflow Indicator</th>
                    <th className="px-4 py-2.5 font-semibold">Referral Pathway</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {screenings.map((sc) => (
                    <tr key={sc.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {sc.studentName}
                        <span className="block text-[11px] font-normal text-slate-500">{sc.classSection}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{sc.workflowStatus}</td>
                      <td className="px-4 py-3 text-slate-600">{sc.referralSpecialistType || 'Specialist Team'}</td>
                      <td className="px-4 py-3 text-slate-700">{sc.completionStatus}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectStudent(sc.studentId)}
                          className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap"
                        >
                          Focus Child
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verified RCI Specialist Roster & Activity Log */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Verified Clinical Team (RCI)</h3>
              {(clinical?.specialists || []).map((sp) => (
                <div key={sp.userId} className="border-t border-slate-100 pt-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{sp.name}</span>
                    {sp.verified && <BadgeCheck className="h-4 w-4 text-emerald-700 shrink-0" />}
                  </div>
                  <p className="text-slate-600">{sp.designation}</p>
                  <p className="font-mono text-[11px] text-slate-500 mt-0.5">{sp.registrationNo}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900">Professional Activity Log</h3>
              {(clinical?.clinicalAccessLogs || []).slice(0, 6).map((log) => (
                <div key={log.id} className="border-t border-slate-100 pt-2 text-xs">
                  <p className="font-medium text-slate-900">{log.actorName}</p>
                  <p className="text-slate-600">{log.detail}</p>
                  <p className="text-[11px] text-slate-400 tabular-nums">{log.timestamp.slice(0, 16).replace('T', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PART 10: CLINICAL REPORTING
  if (mode === 'reports') {
    const visibleReports = (clinical?.clinicalReports || []).filter(
      (r) => !selectedStudent || r.studentId === selectedStudent.id || isManagement || isSpecialist,
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Authorised Clinical & Developmental Reporting
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Four separate report formats (Developmental Screening, Speech Assessment, Therapy Progress, and Clinician-Signed Clinical Report). Every view and download is recorded in the access audit trail.
            </p>
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
            {visibleReports.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500">
                No authorised reports released for this view.
              </div>
            ) : (
              visibleReports.map((rep) => (
                <div key={rep.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-xs font-semibold text-blue-900">
                        {REPORT_TYPE_LABELS[rep.reportType]}
                      </p>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{rep.title}</h3>
                      <p className="text-xs text-slate-500">
                        {rep.studentName} ({rep.classSection}) · Author: {rep.authorName}
                        {rep.authorRegistrationNo ? ` · ${rep.authorRegistrationNo}` : ''} ·{' '}
                        <span className="tabular-nums">{rep.reportDate}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleViewOrPrintReport(rep, 'view')}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Read Report
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleViewOrPrintReport(rep, 'export')}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700">{rep.parentFriendlySummary}</p>
                  {rep.recommendations.length > 0 && (
                    <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-600">
                      {rep.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}

            {previewReport && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <span className="font-bold text-slate-900">Full Report View — {previewReport.title}</span>
                  <button
                    type="button"
                    onClick={() => setPreviewReport(null)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Close
                  </button>
                </div>
                {previewReport.screeningFindings && (
                  <p>
                    <span className="font-semibold">Screening Findings:</span> {previewReport.screeningFindings}
                  </p>
                )}
                {previewReport.languageAndSpeechProfile && (
                  <p>
                    <span className="font-semibold">Speech & Language Profile:</span>{' '}
                    {previewReport.languageAndSpeechProfile}
                  </p>
                )}
                {previewReport.baselineAndProgressSummary && (
                  <p>
                    <span className="font-semibold">Progress Summary:</span>{' '}
                    {previewReport.baselineAndProgressSummary}
                  </p>
                )}
                {previewReport.clinicalAssessmentFindings && (
                  <p>
                    <span className="font-semibold">Clinical Assessment Findings:</span>{' '}
                    {previewReport.clinicalAssessmentFindings}
                  </p>
                )}
                {previewReport.professionalDiagnosis && (
                  <p>
                    <span className="font-semibold">Clinician-Signed Diagnosis:</span>{' '}
                    {previewReport.professionalDiagnosis}
                  </p>
                )}
                <p className="text-slate-500">
                  Signed by {previewReport.authorName} · {previewReport.authorCredentials}{' '}
                  {previewReport.authorRegistrationNo ? `(${previewReport.authorRegistrationNo})` : ''}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            {isSpecialist ? (
              <form
                onSubmit={handleIssueReport}
                className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="h-4 w-4 text-blue-900" />
                  <h3 className="text-sm font-bold text-slate-900">Author & Sign Clinical Report</h3>
                </div>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ClinicalReportType)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                >
                  {(Object.keys(REPORT_TYPE_LABELS) as ClinicalReportType[]).map((rt) => (
                    <option key={rt} value={rt}>
                      {REPORT_TYPE_LABELS[rt]}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder={`Report title (defaults to ${REPORT_TYPE_LABELS[reportType]} — ${selectedStudent?.name})`}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <textarea
                  required
                  rows={3}
                  value={findingsText}
                  onChange={(e) => setFindingsText(e.target.value)}
                  placeholder="Professional findings / baseline & progress narrative *"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                {reportType === 'professional_clinical' && canDiagnose && (
                  <input
                    type="text"
                    value={clinicianDiagnosis}
                    onChange={(e) => setClinicianDiagnosis(e.target.value)}
                    placeholder="Professional diagnosis (strictly clinician-entered; never AI-populated)"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                )}
                <textarea
                  required
                  rows={2}
                  value={parentSummary}
                  onChange={(e) => setParentSummary(e.target.value)}
                  placeholder="Clear, warm parent-friendly explanation *"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  value={teacherSummary}
                  onChange={(e) => setTeacherSummary(e.target.value)}
                  placeholder="Optional non-confidential classroom recommendations for teacher"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <textarea
                  rows={2}
                  value={recommendationsText}
                  onChange={(e) => setRecommendationsText(e.target.value)}
                  placeholder="Recommendations (one per line)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                  <p className="font-semibold text-slate-900">Controlled Report Sharing</p>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={shareParent} onChange={(e) => setShareParent(e.target.checked)} />
                    Release to Parent Portal
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={shareMgmt} onChange={(e) => setShareMgmt(e.target.checked)} />
                    Authorise School Management summary view
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={shareTeacher} onChange={(e) => setShareTeacher(e.target.checked)} />
                    Share non-confidential classroom summary with assigned teachers
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {busy ? 'Signing...' : 'Sign & Issue Report'}
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600">
                Only credentialed clinical specialists may author and sign clinical reports. Every view or download is logged for child privacy compliance.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PARTS 11 & 12: CONSENT, PRIVACY, RCI CREDENTIALS & IMMUTABLE AUDIT TRAIL
  const auditStats = buildClinicalAuditSummary(clinical?.clinicalAccessLogs || []);
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {(isSpecialist || isManagement || isParent) && (
          <form
            onSubmit={handleSaveConsent}
            className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 space-y-3"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="h-4 w-4 text-blue-900" />
              <h3 className="text-sm font-bold text-slate-900">
                Parent Consent, Child Assent & Retention · {selectedStudent?.name}
              </h3>
            </div>
            <input
              type="text"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Parent / Guardian Full Name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <div className="space-y-2 text-xs text-slate-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={screeningConsent} onChange={(e) => setScreeningConsent(e.target.checked)} />
                Informed consent for developmental screening & questionnaires
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={assessmentConsent} onChange={(e) => setAssessmentConsent(e.target.checked)} />
                Informed consent for specialist assessment workflows
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={therapyConsent} onChange={(e) => setTherapyConsent(e.target.checked)} />
                Informed consent for individualised speech / developmental therapy
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={audioConsent} onChange={(e) => setAudioConsent(e.target.checked)} />
                Consent for local on-device practice audio playback (external AI upload always blocked)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={teacherShareConsent}
                  onChange={(e) => setTeacherShareConsent(e.target.checked)}
                />
                Allow sharing non-confidential classroom support guidance with assigned teachers
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={childAssent} onChange={(e) => setChildAssent(e.target.checked)} />
                Age-appropriate child assent explained and recorded
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Configurable Clinical Record Retention (Months)
              </label>
              <input
                type="number"
                min={12}
                max={120}
                value={retentionMonths}
                onChange={(e) => setRetentionMonths(Number(e.target.value))}
                className="w-32 rounded-lg border border-slate-300 px-3 py-1.5 text-xs tabular-nums"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {busy ? 'Saving...' : 'Save Consent & Privacy Preferences'}
            </button>
          </form>
        )}

        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-900" />
              <h3 className="text-sm font-bold text-slate-900">
                Clinical Confidentiality, Scope of Practice & Ethics Safeguards
              </h3>
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700">
              <li>Never diagnoses autism, ADHD, Down syndrome, or any clinical disorder automatically via AI or questionnaires.</li>
              <li>Down syndrome pathway strictly records medical/genetic referrals — zero facial photo analysis.</li>
              <li>Therapy plans require explicit RCI-credentialed specialist approval before appearing in Home Practice.</li>
              <li>Confidential clinical notes are automatically redacted from Teacher and Management workspace payloads.</li>
              <li>Multilingual Indian English, Hindi, and regional speech features are respected and never penalised.</li>
            </ul>
          </div>

          {(isSpecialist || isManagement) && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Immutable Clinical Access Audit Log</h3>
                <span className="text-xs text-slate-500 tabular-nums">
                  {auditStats.totalEvents} events · {auditStats.reportReads} report accesses
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(clinical?.clinicalAccessLogs || []).map((log) => (
                  <div key={log.id} className="border-t border-slate-100 pt-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        {log.actorName} ({log.actorRole})
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {log.timestamp.slice(0, 16).replace('T', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600">{log.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
