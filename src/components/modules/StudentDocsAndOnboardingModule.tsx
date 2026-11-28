import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Copy,
  Download,
  FileCheck2,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import type { DocumentVerificationStatus, StudentRecord } from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { triggerCsvDownload } from '../../utils/csvExport';
import {
  STANDARD_SCHOOL_DOCUMENTS,
  composePendingDocsParentMessage,
  computeOnboardingProgress,
  normalizeStudentDocuments,
  resolveDocumentStatus,
  summarizeDocumentCompliance,
} from '../../utils/studentOnboardingDocsEngine';

interface StudentDocsAndOnboardingModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type ModuleTab = 'documents' | 'new_admission' | 'day1_monitor';
type DocFilterMode = 'all' | 'pending' | 'overdue' | 'completed';

export const StudentDocsAndOnboardingModule: React.FC<StudentDocsAndOnboardingModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const isTeacher = data.user.role === 'teacher';
  const canAdmitNewStudent = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    data.user.role,
  );

  const [activeTab, setActiveTab] = useState<ModuleTab>('documents');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Document register filters
  const [docFilter, setDocFilter] = useState<DocFilterMode>('pending');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [missingDocFilter, setMissingDocFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [refDrafts, setRefDrafts] = useState<Record<string, string>>({});
  const [dueDrafts, setDueDrafts] = useState<Record<string, string>>({});

  // New Student Admission & Day-1 Onboarding Wizard state
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [stuName, setStuName] = useState('');
  const [stuClass, setStuClass] = useState('Class 6-A');
  const [stuHouse, setStuHouse] = useState('Tagore House');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [address, setAddress] = useState('');
  const [totalFeeAnnual, setTotalFeeAnnual] = useState(38000);
  const [initialFeePaid, setInitialFeePaid] = useState(9500);
  const [transportMode, setTransportMode] = useState<'Bus' | 'Walker' | 'Parent Drop'>('Bus');
  const [busRouteId, setBusRouteId] = useState(data.transport?.routes?.[0]?.id || '');
  const [assignedTeacher, setAssignedTeacher] = useState('');
  const [peerBuddyName, setPeerBuddyName] = useState('');
  const [docDueDate, setDocDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
  );
  const [collectedDocs, setCollectedDocs] = useState<string[]>([
    'birth_certificate',
    'student_aadhaar',
    'passport_photos',
  ]);
  const [parentWelcomeSent, setParentWelcomeSent] = useState(true);
  const [onboardingNotes, setOnboardingNotes] = useState('');
  const [submittingAdmission, setSubmittingAdmission] = useState(false);

  // Day-1 Monitoring filter & note drafts
  const [monitorNotes, setMonitorNotes] = useState<Record<string, string>>({});
  const [attachStudentId, setAttachStudentId] = useState('');

  const todayIso = new Date().toISOString().slice(0, 10);

  const schoolTeachers = useMemo(
    () => (data.schoolUsers || []).filter((u) => u.role === 'teacher'),
    [data.schoolUsers],
  );

  const classOptions = useMemo(() => {
    const unique = Array.from(new Set(data.students.map((s) => s.classSection))).sort();
    return unique;
  }, [data.students]);

  const docSummary = useMemo(
    () => summarizeDocumentCompliance(data.students, todayIso),
    [data.students, todayIso],
  );

  const enrichedStudents = useMemo(() => {
    return data.students.map((stu) => ({
      student: stu,
      compliance: normalizeStudentDocuments(stu, todayIso),
    }));
  }, [data.students, todayIso]);

  const filteredDocRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedStudents.filter(({ student, compliance }) => {
      if (docFilter === 'pending' && compliance.pendingCount === 0) return false;
      if (docFilter === 'overdue' && compliance.overdueCount === 0) return false;
      if (docFilter === 'completed' && compliance.pendingCount > 0) return false;
      if (classFilter !== 'ALL' && student.classSection !== classFilter) return false;
      if (missingDocFilter !== 'ALL') {
        const docItem = compliance.items.find((d) => d.key === missingDocFilter);
        if (!docItem) return false;
        const st = resolveDocumentStatus(docItem);
        if (st === 'Completed' || st === 'Not Applicable') return false;
      }
      if (q) {
        const hay =
          `${student.name} ${student.admissionNo} ${student.classSection} ${student.guardianName} ${student.guardianPhone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [enrichedStudents, docFilter, classFilter, missingDocFilter, searchQuery]);

  const openAdmissionLeads = useMemo(
    () => (data.admissionLeads || []).filter((l) => !l.convertedStudentId),
    [data.admissionLeads],
  );

  const monitoredStudents = useMemo(
    () =>
      data.students
        .filter((s) => Boolean(s.onboarding))
        .map((s) => ({
          student: s,
          compliance: normalizeStudentDocuments(s, todayIso),
          progress: computeOnboardingProgress(s.onboarding!),
        }))
        .sort((a, b) => (b.student.onboarding?.admissionDate || '').localeCompare(a.student.onboarding?.admissionDate || '')),
    [data.students, todayIso],
  );

  const unmonitoredStudents = useMemo(
    () => data.students.filter((s) => !s.onboarding).slice(0, 60),
    [data.students],
  );

  async function handleUpdateDocument(
    student: StudentRecord,
    docKey: string,
    nextStatus: DocumentVerificationStatus,
    extra?: { referenceNo?: string; dueDate?: string },
  ) {
    const key = `${student.id}:${docKey}`;
    setBusyKey(key);
    setError(null);
    try {
      await apiRequest(
        `/api/students/${student.id}/documents`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            updates: [
              {
                key: docKey,
                status: nextStatus,
                ...(extra?.referenceNo !== undefined ? { referenceNo: extra.referenceNo } : {}),
                ...(extra?.dueDate !== undefined ? { dueDate: extra.dueDate } : {}),
              },
            ],
          }),
        },
        token || undefined,
      );
      setStatusMessage(`Updated document status for ${student.name} (${student.classSection}).`);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update document status.');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleMarkAllDocsComplete(student: StudentRecord) {
    setBusyKey(`${student.id}:ALL`);
    setError(null);
    try {
      const norm = normalizeStudentDocuments(student, todayIso);
      const pendingUpdates = norm.items
        .filter((d) => {
          const st = resolveDocumentStatus(d);
          return st !== 'Completed' && st !== 'Not Applicable';
        })
        .map((d) => ({ key: d.key || d.name, status: 'Completed' as const }));
      if (pendingUpdates.length === 0) return;
      await apiRequest(
        `/api/students/${student.id}/documents`,
        { method: 'PATCH', body: JSON.stringify({ updates: pendingUpdates }) },
        token || undefined,
      );
      setStatusMessage(`Marked all ${pendingUpdates.length} pending documents verified for ${student.name}.`);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete documents.');
    } finally {
      setBusyKey(null);
    }
  }

  function handleCopyParentReminder(student: StudentRecord) {
    const norm = normalizeStudentDocuments(student, todayIso);
    const earliestDue = norm.items
      .filter((d) => resolveDocumentStatus(d) !== 'Completed' && d.dueDate)
      .map((d) => d.dueDate!)
      .sort()[0];
    const msg = composePendingDocsParentMessage({
      studentName: student.name,
      classSection: student.classSection,
      guardianName: student.guardianName,
      schoolName: data.activeSchool.name,
      missingDocNames: norm.missingDocNames,
      dueDate: earliestDue,
    });
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(msg);
    }
    setStatusMessage(
      `Parent WhatsApp reminder copied for ${student.name} (${norm.missingDocNames.length} pending doc${norm.missingDocNames.length === 1 ? '' : 's'}).`,
    );
  }

  function handleExportPendingCsv() {
    const headers = [
      'Admission No',
      'Student Name',
      'Class',
      'Guardian',
      'Phone',
      'Status',
      'Completed Docs',
      'Completion %',
      'Missing Documents',
    ];
    const rows = filteredDocRows.map(({ student, compliance }) => [
      student.admissionNo,
      student.name,
      student.classSection,
      student.guardianName,
      student.guardianPhone,
      compliance.complianceState,
      `${compliance.completedCount}/${compliance.applicableCount}`,
      `${compliance.completionPct}%`,
      compliance.missingDocNames.join(' | ') || 'None',
    ]);
    triggerCsvDownload(`student-document-compliance-${todayIso}.csv`, headers, rows);
    setStatusMessage(`Exported ${rows.length} student document records to CSV.`);
  }

  function handlePrefillFromLead(leadId: string) {
    setSelectedLeadId(leadId);
    const lead = openAdmissionLeads.find((l) => l.id === leadId);
    if (!lead) return;
    setStuName(lead.studentName);
    setStuClass(lead.applyingClass.includes('-') ? lead.applyingClass : `${lead.applyingClass}-A`);
    setGuardianName(lead.parentName);
    setGuardianPhone(lead.phone);
    setGuardianEmail(lead.email || '');
    setAddress(lead.address || lead.locality || '');
    setTransportMode(lead.transportPreference === 'Walker' ? 'Walker' : 'Bus');
    setOnboardingNotes(lead.notes || '');
  }

  async function handleOnboardNewStudent(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingAdmission(true);
    setError(null);
    setStatusMessage(null);
    try {
      const res = await apiRequest<{ student: StudentRecord }>(
        '/api/students/onboard-admission',
        {
          method: 'POST',
          body: JSON.stringify({
            leadId: selectedLeadId || undefined,
            name: stuName,
            classSection: stuClass,
            house: stuHouse,
            guardianName,
            guardianPhone,
            guardianEmail: guardianEmail || undefined,
            address: address || undefined,
            totalFeeAnnualInr: totalFeeAnnual,
            initialFeePaidInr: initialFeePaid,
            transportMode,
            busRouteId: transportMode === 'Bus' ? busRouteId || undefined : undefined,
            assignedClassTeacher: assignedTeacher || undefined,
            peerBuddyName: peerBuddyName || undefined,
            documentDueDate: docDueDate,
            collectedDocumentKeys: collectedDocs,
            parentWelcomeSent,
            notes: onboardingNotes || undefined,
          }),
        },
        token || undefined,
      );
      setStatusMessage(
        `${res.student.name} (${res.student.admissionNo}) admitted into ${res.student.classSection}! Day-1 → Day-30 monitoring & document checklist are now active.`,
      );
      setSelectedLeadId('');
      setStuName('');
      setGuardianName('');
      setGuardianPhone('');
      setGuardianEmail('');
      setAddress('');
      setPeerBuddyName('');
      setOnboardingNotes('');
      await onRefresh();
      setActiveTab('day1_monitor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete new student onboarding.');
    } finally {
      setSubmittingAdmission(false);
    }
  }

  async function handleToggleCheckpoint(
    studentId: string,
    checkpointId: string,
    nextCompleted: boolean,
  ) {
    const key = `${studentId}:${checkpointId}`;
    setBusyKey(key);
    setError(null);
    try {
      await apiRequest(
        `/api/students/${studentId}/onboarding/checkpoints/${checkpointId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            completed: nextCompleted,
            notes: monitorNotes[key],
          }),
        },
        token || undefined,
      );
      setStatusMessage('Day-1 onboarding monitoring checkpoint updated.');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update checkpoint.');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleAttachMonitoring(e: React.FormEvent) {
    e.preventDefault();
    if (!attachStudentId) return;
    setBusyKey(`attach:${attachStudentId}`);
    setError(null);
    try {
      await apiRequest(
        `/api/students/${attachStudentId}/onboarding/initialize`,
        { method: 'POST', body: JSON.stringify({ documentDueDate: docDueDate }) },
        token || undefined,
      );
      setAttachStudentId('');
      setStatusMessage('Day-1 → Day-30 monitoring plan started for the selected student.');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start onboarding monitoring.');
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            {isTeacher
              ? `CLASS FACULTY REGISTER · ${data.user.classTeacherOf || 'ASSIGNED STUDENTS'}`
              : 'ADMIN & FACULTY COMPLIANCE · DAY-1 STUDENT CARE'}
          </p>
          <h1 className="font-display text-2xl font-extrabold text-[#142B46] mt-0.5">
            Student Document Compliance &amp; New Admission Day-1 Onboarding
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Track pending vs. completed UDISE+ / admission documents timely and monitor newly admitted students from Day 1 through Day 30.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
              activeTab === 'documents'
                ? 'bg-[#142B46] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            Document Register ({docSummary.pendingStudentsCount} Pending)
          </button>
          {canAdmitNewStudent && (
            <button
              type="button"
              onClick={() => setActiveTab('new_admission')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                activeTab === 'new_admission'
                  ? 'bg-[#142B46] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              New Admission Onboarding
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('day1_monitor')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
              activeTab === 'day1_monitor'
                ? 'bg-[#142B46] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            Day-1 Monitoring Board ({monitoredStudents.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 flex justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}
      {statusMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900 flex justify-between">
          <span>{statusMessage}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ==================== TAB 1: STUDENT DOCUMENT COMPLIANCE REGISTER ==================== */}
      {activeTab === 'documents' && (
        <div className="space-y-5">
          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase text-slate-500">Students Checked</p>
              <p className="mt-1 text-2xl font-extrabold text-[#142B46]">{docSummary.totalStudents}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase text-emerald-800">100% Completed</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-800">
                {docSummary.fullyCompletedCount}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="text-[11px] font-semibold uppercase text-amber-800">Docs Pending</p>
              <p className="mt-1 text-2xl font-extrabold text-amber-800">
                {docSummary.pendingStudentsCount}
              </p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4">
              <p className="text-[11px] font-semibold uppercase text-rose-800">Overdue Pending</p>
              <p className="mt-1 text-2xl font-extrabold text-rose-700">
                {docSummary.overdueStudentsCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 col-span-2 lg:col-span-1">
              <p className="text-[11px] font-semibold uppercase text-slate-500">Overall Completion</p>
              <p className="mt-1 text-2xl font-extrabold text-[#142B46]">
                {docSummary.overallCompletionPct}%
              </p>
              <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${docSummary.overallCompletionPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter & Action Toolbar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: `All (${docSummary.totalStudents})` },
                  { id: 'pending', label: `Pending (${docSummary.pendingStudentsCount})` },
                  { id: 'overdue', label: `Overdue (${docSummary.overdueStudentsCount})` },
                  { id: 'completed', label: `Completed (${docSummary.fullyCompletedCount})` },
                ] as const
              ).map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setDocFilter(chip.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    docFilter === chip.id
                      ? 'bg-[#142B46] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by Class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium"
              >
                <option value="ALL">All Classes</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by Missing Document"
                value={missingDocFilter}
                onChange={(e) => setMissingDocFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium"
              >
                <option value="ALL">Any Missing Document</option>
                {STANDARD_SCHOOL_DOCUMENTS.map((d) => (
                  <option key={d.key} value={d.key}>
                    Missing: {d.shortLabel} ({docSummary.missingCountByDoc[d.key] || 0})
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Student, Adm No, Phone..."
                  className="rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 text-xs w-48"
                />
              </div>

              <button
                type="button"
                onClick={handleExportPendingCsv}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Student Document Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-3 px-4 font-bold">Student &amp; Class</th>
                    <th className="py-3 px-3 font-bold">Guardian Contact</th>
                    <th className="py-3 px-3 font-bold">Compliance</th>
                    <th className="py-3 px-3 font-bold">Quick 1-Click Document Checklist</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No students match the selected document filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDocRows.slice(0, 80).map(({ student, compliance }) => {
                      const isExpanded = expandedStudentId === student.id;
                      return (
                        <React.Fragment key={student.id}>
                          <tr className="hover:bg-slate-50/70 align-top">
                            <td className="py-3 px-4">
                              <p className="font-bold text-[#142B46]">{student.name}</p>
                              <p className="text-[11px] text-slate-500">
                                Class {student.classSection} · {student.admissionNo}
                              </p>
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-medium text-slate-800">{student.guardianName}</p>
                              <p className="text-[11px] font-mono text-slate-500">
                                {student.guardianPhone}
                              </p>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  compliance.complianceState === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : compliance.complianceState === 'Overdue'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {compliance.complianceState === 'Overdue' && (
                                  <AlertTriangle className="h-3 w-3" />
                                )}
                                {compliance.complianceState === 'Completed' && (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                {compliance.completedCount}/{compliance.applicableCount} ·{' '}
                                {compliance.complianceState}
                              </span>
                              <div className="mt-1.5 h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    compliance.complianceState === 'Completed'
                                      ? 'bg-emerald-600'
                                      : compliance.complianceState === 'Overdue'
                                        ? 'bg-rose-600'
                                        : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${compliance.completionPct}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1.5 max-w-md">
                                {compliance.items.map((doc) => {
                                  const st = resolveDocumentStatus(doc);
                                  const spec = STANDARD_SCHOOL_DOCUMENTS.find((s) => s.key === doc.key);
                                  const isDone = st === 'Completed';
                                  const isNa = st === 'Not Applicable';
                                  const isOverdue = !isDone && !isNa && Boolean(doc.dueDate && doc.dueDate < todayIso);
                                  const itemBusy = busyKey === `${student.id}:${doc.key}`;
                                  return (
                                    <button
                                      key={doc.key || doc.name}
                                      type="button"
                                      disabled={itemBusy || isNa}
                                      title={`${doc.name}: ${st}${doc.dueDate ? ` (Due ${doc.dueDate})` : ''} — Click to toggle`}
                                      onClick={() =>
                                        void handleUpdateDocument(
                                          student,
                                          doc.key || doc.name,
                                          isDone ? 'Pending' : 'Completed',
                                        )
                                      }
                                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold transition-colors ${
                                        isNa
                                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-default'
                                          : isDone
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                            : isOverdue
                                              ? 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100'
                                              : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                                      }`}
                                    >
                                      {isDone ? '✓ ' : isNa ? 'N/A ' : '○ '}
                                      {spec?.shortLabel || doc.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                              {compliance.pendingCount > 0 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyParentReminder(student)}
                                    title="Copy WhatsApp Parent Reminder"
                                    className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-100"
                                  >
                                    <Copy className="h-3 w-3" /> Remind
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyKey === `${student.id}:ALL`}
                                    onClick={() => void handleMarkAllDocsComplete(student)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-800"
                                  >
                                    Verify All
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                                className="inline-flex items-center gap-0.5 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Details {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Detailed Document Checklist Editor */}
                          {isExpanded && (
                            <tr className="bg-slate-50/90">
                              <td colSpan={5} className="p-4 border-t border-slate-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {compliance.items.map((doc) => {
                                    const docKey = doc.key || doc.name;
                                    const st = resolveDocumentStatus(doc);
                                    const draftKey = `${student.id}:${docKey}`;
                                    return (
                                      <div
                                        key={docKey}
                                        className="rounded-lg border border-slate-200 bg-white p-3 flex flex-wrap items-center justify-between gap-2"
                                      >
                                        <div className="min-w-0">
                                          <p className="font-bold text-[#142B46]">{doc.name}</p>
                                          <p className="text-[11px] text-slate-500">
                                            {st === 'Completed'
                                              ? `Verified ${doc.verifiedAt || ''} ${doc.verifiedBy ? `by ${doc.verifiedBy}` : ''}`
                                              : st === 'Not Applicable'
                                                ? 'Not Applicable for this class'
                                                : `Due: ${doc.dueDate || 'Set deadline'}`}
                                          </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <input
                                            type="text"
                                            placeholder="Ref / Cert No"
                                            value={refDrafts[draftKey] ?? doc.referenceNo ?? ''}
                                            onChange={(e) =>
                                              setRefDrafts((p) => ({ ...p, [draftKey]: e.target.value }))
                                            }
                                            className="w-28 rounded border border-slate-300 px-2 py-1 text-[11px]"
                                          />
                                          {st !== 'Completed' && st !== 'Not Applicable' && (
                                            <input
                                              type="date"
                                              value={dueDrafts[draftKey] ?? doc.dueDate ?? todayIso}
                                              onChange={(e) =>
                                                setDueDrafts((p) => ({ ...p, [draftKey]: e.target.value }))
                                              }
                                              className="rounded border border-slate-300 px-2 py-1 text-[11px]"
                                            />
                                          )}
                                          <select
                                            aria-label={`${doc.name} status`}
                                            value={st}
                                            onChange={(e) =>
                                              void handleUpdateDocument(
                                                student,
                                                docKey,
                                                e.target.value as DocumentVerificationStatus,
                                                {
                                                  referenceNo: refDrafts[draftKey] ?? doc.referenceNo,
                                                  dueDate: dueDrafts[draftKey] ?? doc.dueDate,
                                                },
                                              )
                                            }
                                            className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-bold"
                                          >
                                            <option value="Completed">Completed</option>
                                            <option value="Submitted">Submitted (Unverified)</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Not Applicable">Not Applicable</option>
                                          </select>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filteredDocRows.length > 80 && (
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
                Showing first 80 of {filteredDocRows.length} matching students — narrow by Class or Search, or click Export CSV for the full list.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: NEW STUDENT ADMISSION & DAY-1 ONBOARDING WIZARD ==================== */}
      {activeTab === 'new_admission' && canAdmitNewStudent && (
        <form onSubmit={handleOnboardNewStudent} className="space-y-5">
          {/* Optional 1-Click Prefill from Admission Lead */}
          {openAdmissionLeads.length > 0 && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-indigo-950">
                  Admitting from an existing Enquiry / Admission Lead?
                </p>
                <p className="text-indigo-800">
                  Select a lead below to auto-fill student, guardian, address &amp; transport details and mark the lead Enrolled on save.
                </p>
              </div>
              <select
                aria-label="Prefill from admission lead"
                value={selectedLeadId}
                onChange={(e) => handlePrefillFromLead(e.target.value)}
                className="rounded-lg border border-indigo-300 bg-white px-3 py-2 text-xs font-semibold text-indigo-950"
              >
                <option value="">— Fresh Direct Admission —</option>
                {openAdmissionLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.studentName} ({l.applyingClass} · {l.parentName})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Step 1 & 3: Identity, Class Teacher, Fee & Transport */}
            <div className="lg:col-span-7 space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 text-xs">
                <h2 className="text-sm font-bold text-[#142B46] flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-amber-600" /> Step 1 · Student &amp; Guardian Profile
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Student Full Name *</span>
                    <input
                      type="text"
                      required
                      value={stuName}
                      onChange={(e) => setStuName(e.target.value)}
                      placeholder="e.g. Kabir Sharma"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Admitted Class &amp; Section *</span>
                    <input
                      type="text"
                      required
                      value={stuClass}
                      onChange={(e) => setStuClass(e.target.value)}
                      placeholder="e.g. 6-A or Nursery-A"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Parent / Guardian Name *</span>
                    <input
                      type="text"
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Suresh Sharma"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Guardian Mobile / WhatsApp *</span>
                    <input
                      type="tel"
                      required
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="+91 98120 55443"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Guardian Email</span>
                    <input
                      type="email"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">School House</span>
                    <select
                      value={stuHouse}
                      onChange={(e) => setStuHouse(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="Tagore House">Tagore House</option>
                      <option value="Vivekananda House">Vivekananda House</option>
                      <option value="Raman House">Raman House</option>
                      <option value="Subhash House">Subhash House</option>
                    </select>
                  </label>
                </div>
                <label className="block space-y-1">
                  <span className="font-bold text-slate-700">Residential Address / Locality</span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Sector / Village / City"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 text-xs">
                <h2 className="text-sm font-bold text-[#142B46] flex items-center gap-2">
                  <Bus className="h-4 w-4 text-emerald-700" /> Step 2 · Day-1 Faculty, Peer Buddy, Fee &amp; Transport Setup
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Assigned Class Teacher (Day-1 Monitor)</span>
                    <select
                      value={assignedTeacher}
                      onChange={(e) => setAssignedTeacher(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="">Auto-match by Class Section</option>
                      {schoolTeachers.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} {t.classTeacherOf ? `(Class ${t.classTeacherOf})` : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Day-1 Classroom Peer Buddy (Optional)</span>
                    <input
                      type="text"
                      value={peerBuddyName}
                      onChange={(e) => setPeerBuddyName(e.target.value)}
                      placeholder="e.g. Aarav (Class Monitor)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Transport Mode</span>
                    <select
                      value={transportMode}
                      onChange={(e) => setTransportMode(e.target.value as typeof transportMode)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="Bus">School Bus</option>
                      <option value="Parent Drop">Parent Drop / Pickup</option>
                      <option value="Walker">Campus Zone Walker</option>
                    </select>
                  </label>
                  {transportMode === 'Bus' && (data.transport?.routes?.length || 0) > 0 && (
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Bus Route</span>
                      <select
                        value={busRouteId}
                        onChange={(e) => setBusRouteId(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      >
                        {data.transport!.routes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.routeCode} · {r.routeName}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Annual Fee Structure (₹)</span>
                    <input
                      type="number"
                      min={0}
                      value={totalFeeAnnual}
                      onChange={(e) => setTotalFeeAnnual(Number(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Admission Day Fee Paid (₹)</span>
                    <input
                      type="number"
                      min={0}
                      value={initialFeePaid}
                      onChange={(e) => setInitialFeePaid(Number(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                    />
                  </label>
                </div>
                <label className="block space-y-1">
                  <span className="font-bold text-slate-700">Day-1 Teacher &amp; Counsellor Briefing Notes</span>
                  <textarea
                    rows={2}
                    value={onboardingNotes}
                    onChange={(e) => setOnboardingNotes(e.target.value)}
                    placeholder="e.g. Mid-session transfer from CBSE; shy initially — assign supportive buddy and monitor Week-1 comfort."
                    className="w-full rounded-lg border border-slate-300 p-2.5"
                  />
                </label>
              </div>
            </div>

            {/* Step 3 & 4: Initial Document Checklist + Auto-Scheduled Day-1 Blueprint Preview */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 text-xs">
                <h2 className="text-sm font-bold text-[#142B46] flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-emerald-700" /> Step 3 · Documents Collected Today
                </h2>
                <p className="text-slate-600">
                  Tick documents verified today. Any unticked mandatory document is automatically tracked with the deadline below.
                </p>
                <div className="space-y-2">
                  {STANDARD_SCHOOL_DOCUMENTS.map((doc) => {
                    const checked = collectedDocs.includes(doc.key);
                    return (
                      <label
                        key={doc.key}
                        className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 cursor-pointer ${
                          checked
                            ? 'border-emerald-300 bg-emerald-50/70 font-semibold text-emerald-950'
                            : 'border-slate-200 bg-slate-50/60 text-slate-700'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setCollectedDocs((prev) =>
                                prev.includes(doc.key)
                                  ? prev.filter((k) => k !== doc.key)
                                  : [...prev, doc.key],
                              )
                            }
                          />
                          {doc.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase">
                          {checked ? 'Collected ✓' : 'Pending'}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <label className="block space-y-1 pt-1">
                  <span className="font-bold text-slate-700">Deadline for Pending Documents</span>
                  <input
                    type="date"
                    value={docDueDate}
                    onChange={(e) => setDocDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="inline-flex items-center gap-2 font-semibold text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={parentWelcomeSent}
                    onChange={(e) => setParentWelcomeSent(e.target.checked)}
                  />
                  Send Parent Portal Welcome &amp; Day-1 Checklist Confirmation
                </label>
              </div>

              <div className="rounded-xl border border-[#142B46]/20 bg-[#142B46] text-white p-5 space-y-3 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D6B66D] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Auto-Scheduled From Day 1
                </p>
                <p className="font-bold text-sm">
                  10 Monitored Onboarding Checkpoints (Day 1 → Day 30)
                </p>
                <ul className="space-y-1.5 text-slate-200">
                  <li>• <strong>Day 1:</strong> Classroom welcome, peer buddy, Day-1 attendance &amp; Bus/Gate verification</li>
                  <li>• <strong>Day 3:</strong> Books/ID kit issued + informal Reading &amp; Numeracy baseline check</li>
                  <li>• <strong>Day 7:</strong> Peer comfort observation + Week-1 homework &amp; attendance audit</li>
                  <li>• <strong>Day 15:</strong> Pending document verification &amp; 15-day parent check-in call</li>
                  <li>• <strong>Day 30:</strong> Holistic settling &amp; OLQ baseline review by Coordinator</li>
                </ul>
                <button
                  type="submit"
                  disabled={submittingAdmission}
                  className="mt-2 w-full rounded-xl bg-[#D6B66D] px-4 py-3 text-xs font-extrabold text-[#142B46] hover:bg-amber-300 disabled:opacity-60 transition-colors"
                >
                  {submittingAdmission
                    ? 'Admitting & Launching Day-1 Monitoring…'
                    : 'Admit Student & Activate Day-1 Monitoring'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ==================== TAB 3: DAY-1 TO DAY-30 NEW STUDENT MONITORING BOARD ==================== */}
      {activeTab === 'day1_monitor' && (
        <div className="space-y-5">
          {/* Quick Attach Day-1 Monitoring to any recently admitted student */}
          <form
            onSubmit={handleAttachMonitoring}
            className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div>
              <p className="font-bold text-[#142B46]">
                Monitor an existing recently admitted student from Day 1?
              </p>
              <p className="text-slate-600">
                Attach the 10-checkpoint Day-1 → Day-30 monitoring plan to any student in your school/class scope.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Select student for Day-1 monitoring"
                value={attachStudentId}
                onChange={(e) => setAttachStudentId(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
              >
                <option value="">— Select Student —</option>
                {unmonitoredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Class {s.classSection} · {s.admissionNo})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!attachStudentId || Boolean(busyKey)}
                className="rounded-lg bg-[#142B46] px-4 py-2 font-bold text-white disabled:opacity-50"
              >
                Start Day-1 Monitoring
              </button>
            </div>
          </form>

          {monitoredStudents.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-3">
              <Users className="h-10 w-10 text-[#142B46] mx-auto" />
              <h3 className="text-base font-bold text-[#142B46]">
                No New Students Under Active Day-1 Monitoring Yet
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Admit a new student via the New Admission Onboarding wizard (or attach monitoring to an existing student above) to track every Day-1 through Day-30 milestone.
              </p>
              {canAdmitNewStudent && (
                <button
                  type="button"
                  onClick={() => setActiveTab('new_admission')}
                  className="rounded-xl bg-[#142B46] px-5 py-2.5 text-xs font-bold text-white"
                >
                  Open New Admission Onboarding Wizard
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {monitoredStudents.map(({ student, compliance, progress }) => {
                const ob = student.onboarding!;
                return (
                  <div
                    key={student.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#142B46] px-2.5 py-0.5 text-[10px] font-bold text-[#D6B66D]">
                            {ob.day1Status}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                            Admitted {ob.admissionDate}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              compliance.pendingCount === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            Docs: {compliance.completedCount}/{compliance.applicableCount}
                          </span>
                        </div>
                        <h3 className="mt-1.5 text-lg font-extrabold text-[#142B46]">
                          {student.name} · Class {student.classSection} ({student.admissionNo})
                        </h3>
                        <p className="text-xs text-slate-600">
                          Class Teacher: <strong>{ob.assignedClassTeacher}</strong> · Transport:{' '}
                          <strong>{ob.transportMode}</strong>
                          {ob.peerBuddyName ? ` · Peer Buddy: ${ob.peerBuddyName}` : ''} · Guardian:{' '}
                          {student.guardianName} ({student.guardianPhone})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#142B46]">
                          {progress.completedCount} / {progress.totalCount} Milestones ({progress.pct}%)
                        </p>
                        <div className="mt-1 h-2 w-40 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 transition-all"
                            style={{ width: `${progress.pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {ob.notes && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs text-amber-950">
                        <strong>Day-1 Briefing Note:</strong> {ob.notes}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ob.checkpoints.map((chk) => {
                        const key = `${student.id}:${chk.id}`;
                        const isBusy = busyKey === key;
                        return (
                          <div
                            key={chk.id}
                            className={`rounded-xl border p-3.5 text-xs space-y-2 transition-colors ${
                              chk.completed
                                ? 'border-emerald-200 bg-emerald-50/50'
                                : chk.dayTarget === 1
                                  ? 'border-amber-300 bg-amber-50/40'
                                  : 'border-slate-200 bg-slate-50/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <label className="flex items-start gap-2.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  disabled={isBusy}
                                  checked={chk.completed}
                                  onChange={() =>
                                    void handleToggleCheckpoint(student.id, chk.id, !chk.completed)
                                  }
                                  className="mt-0.5 accent-emerald-700"
                                />
                                <div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="rounded bg-[#142B46] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                      Day {chk.dayTarget}
                                    </span>
                                    <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                      {chk.ownerRole}
                                    </span>
                                  </div>
                                  <p
                                    className={`mt-1 font-semibold ${
                                      chk.completed ? 'text-emerald-950 line-through' : 'text-slate-900'
                                    }`}
                                  >
                                    {chk.title}
                                  </p>
                                </div>
                              </label>
                            </div>
                            {chk.completed && (
                              <p className="text-[11px] text-emerald-800 pl-6">
                                <UserCheck className="h-3 w-3 inline mr-1" />
                                Completed {chk.completedAt || ''} {chk.completedBy ? `by ${chk.completedBy}` : ''}
                                {chk.notes ? ` · ${chk.notes}` : ''}
                              </p>
                            )}
                            {!chk.completed && (
                              <div className="pl-6 flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={monitorNotes[key] ?? chk.notes ?? ''}
                                  onChange={(e) =>
                                    setMonitorNotes((p) => ({ ...p, [key]: e.target.value }))
                                  }
                                  placeholder="Optional observation note..."
                                  className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px]"
                                />
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => void handleToggleCheckpoint(student.id, chk.id, true)}
                                  className="rounded bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-800"
                                >
                                  Done
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
