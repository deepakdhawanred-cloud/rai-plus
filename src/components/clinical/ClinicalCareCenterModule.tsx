import React, { useMemo, useState } from 'react';
import { ShieldAlert, Stethoscope } from 'lucide-react';
import type { WorkspaceData } from '../../types/workspace';
import {
  CLINICAL_SPECIALIST_ROLES,
  MANAGEMENT_ROLES,
} from '../../utils/clinicalCareEngine';
import { ClinicalScreeningAndPathways } from './ClinicalScreeningAndPathways';
import { ClinicalSpeechAndFluency } from './ClinicalSpeechAndFluency';
import { ClinicalTherapyWorkspaceAndPractice } from './ClinicalTherapyWorkspaceAndPractice';
import { ClinicalReportsAndGovernance } from './ClinicalReportsAndGovernance';

interface ClinicalCareCenterModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type ClinicalSubTab =
  | 'dashboard'
  | 'screening'
  | 'pathways'
  | 'speech_articulation'
  | 'fluency_stammering'
  | 'plans_and_daily'
  | 'audio_studio'
  | 'parent_home'
  | 'reports'
  | 'governance';

export const ClinicalCareCenterModule: React.FC<ClinicalCareCenterModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const role = data.user.role;
  const isSpecialist = CLINICAL_SPECIALIST_ROLES.includes(role);
  const isManagement = MANAGEMENT_ROLES.includes(role);
  const isParent = role === 'parent';
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';

  const allowedTabs = useMemo<Array<{ id: ClinicalSubTab; label: string }>>(() => {
    if (isStudent) {
      return [{ id: 'parent_home', label: 'My Approved Practice Activities' }];
    }
    if (isParent) {
      return [
        { id: 'parent_home', label: 'Parent Home Practice' },
        { id: 'screening', label: 'Parent Questionnaires & History' },
        { id: 'reports', label: 'Approved Reports' },
        { id: 'governance', label: 'Consent & Privacy' },
      ];
    }
    if (isTeacher) {
      return [
        { id: 'screening', label: 'Teacher Observations & Classroom Guidance' },
        { id: 'plans_and_daily', label: 'Authorised Classroom Support Plans' },
        { id: 'reports', label: 'Authorised Classroom Summaries' },
      ];
    }
    if (isManagement) {
      return [
        { id: 'dashboard', label: 'Service Utilisation & Caseload' },
        { id: 'screening', label: 'Screening Workflows' },
        { id: 'plans_and_daily', label: 'Active Therapy Plans' },
        { id: 'reports', label: 'Authorised Reports' },
        { id: 'governance', label: 'Consent, Credentials & Audit' },
      ];
    }
    // Credentialed Clinical Specialists
    return [
      { id: 'dashboard', label: 'Specialist Dashboard' },
      { id: 'screening', label: 'Screening Centre' },
      { id: 'pathways', label: 'Assessment Pathways' },
      { id: 'speech_articulation', label: 'Speech Therapy Engine' },
      { id: 'fluency_stammering', label: 'Fluency & Stammering' },
      { id: 'plans_and_daily', label: 'Therapy Plans & Daily Workspace' },
      { id: 'audio_studio', label: 'Audio Practice Review' },
      { id: 'parent_home', label: 'Parent Home Preview' },
      { id: 'reports', label: 'Clinical Reports' },
      { id: 'governance', label: 'Consent & Governance' },
    ];
  }, [isStudent, isParent, isTeacher, isManagement]);

  const [activeTab, setActiveTab] = useState<ClinicalSubTab>(allowedTabs[0]?.id || 'dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const clinicalFirst = data.clinicalCare?.screeningCases?.[0]?.studentId;
    if (clinicalFirst && data.students.some((s) => s.id === clinicalFirst)) {
      return clinicalFirst;
    }
    return data.students[0]?.id || '';
  });

  const effectiveTab = allowedTabs.some((t) => t.id === activeTab) ? activeTab : allowedTabs[0].id;

  return (
    <div className="space-y-6" data-testid="clinical-care-center-module">
      {/* Header & Student Focus Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-900">
              <Stethoscope className="h-5 w-5" />
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Rai Plus Clinical &amp; Developmental Care 360°
              </h1>
            </div>
            <p className="text-xs text-slate-600">
              Developmental screening, specialist assessment pathways, individualised multilingual speech & fluency therapy, and confidential clinical governance.
            </p>
          </div>

          {data.students.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="clinical-student-select" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                Student Profile:
              </label>
              <select
                id="clinical-student-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 max-w-xs"
              >
                {data.students.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.name} · {stu.classSection} ({stu.admissionNo})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Clinical Boundary Banner */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 flex items-start gap-2.5 text-xs text-slate-700">
          <ShieldAlert className="h-4 w-4 text-blue-900 shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold text-slate-900">Clinical Responsibility Boundary:</span>{' '}
            This platform supports structured developmental screening, professional documentation, specialist referrals, and approved intervention plans. It never independently diagnoses autism, ADHD, Down syndrome, or any clinical disorder. Only qualified professionals within their scope of practice (e.g., RCI-registered specialists) may enter clinical diagnoses or approve therapy plans.
          </span>
        </div>

        {/* Sub-Navigation */}
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {allowedTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                effectiveTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Panel */}
      {effectiveTab === 'dashboard' && (
        <ClinicalReportsAndGovernance
          data={data}
          token={token}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          onRefresh={onRefresh}
          mode="dashboard"
        />
      )}
      {effectiveTab === 'screening' && (
        <ClinicalScreeningAndPathways
          data={data}
          token={token}
          selectedStudentId={selectedStudentId}
          onRefresh={onRefresh}
          mode="screening"
        />
      )}
      {effectiveTab === 'pathways' && isSpecialist && (
        <ClinicalScreeningAndPathways
          data={data}
          token={token}
          selectedStudentId={selectedStudentId}
          onRefresh={onRefresh}
          mode="pathways"
        />
      )}
      {effectiveTab === 'speech_articulation' && (
        <ClinicalSpeechAndFluency
          data={data}
          token={token}
          selectedStudentId={selectedStudentId}
          onRefresh={onRefresh}
          mode="speech_articulation"
        />
      )}
      {effectiveTab === 'fluency_stammering' && (
        <ClinicalSpeechAndFluency
          data={data}
          token={token}
          selectedStudentId={selectedStudentId}
          onRefresh={onRefresh}
          mode="fluency_stammering"
        />
      )}
      {effectiveTab === 'plans_and_daily' && (
        <ClinicalTherapyWorkspaceAndPractice
          data={data}
          token={token}
          selectedStudentId={selectedStudentId}
          onRefresh={onRefresh}
          mode="plans_and_daily"
        />
      )}
      {effectiveTab === 'audio_studio' && (
        <ClinicalTherapyWorkspaceAndPractice
          data={data}
          token={token}
          selectedStudentId={selectedStudentId}
          onRefresh={onRefresh}
          mode="audio_studio"
        />
      )}
      {effectiveTab === 'parent_home' && (
        <ClinicalTherapyWorkspaceAndPractice
          data={data}
          token={token}
          selectedStudentId={selectedStudentId}
          onRefresh={onRefresh}
          mode="parent_home"
        />
      )}
      {effectiveTab === 'reports' && (
        <ClinicalReportsAndGovernance
          data={data}
          token={token}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          onRefresh={onRefresh}
          mode="reports"
        />
      )}
      {effectiveTab === 'governance' && (
        <ClinicalReportsAndGovernance
          data={data}
          token={token}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          onRefresh={onRefresh}
          mode="governance"
        />
      )}
    </div>
  );
};
