import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  Compass,
  Download,
  Footprints,
  Home,
  MapPin,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import type { AdmissionLead, CareerCounsellingRequest } from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { triggerCsvDownload } from '../../utils/csvExport';
import {
  ADMISSION_SOURCES,
  ADMISSION_STAGES,
  type LeadHomeVisitFilter,
  computeAdmissionCrmSummary,
  deriveLeadVisitSummary,
  filterAdmissionLeads,
  validateLeadInput,
} from '../../utils/admissionCrmEngine';
import { apiRequest } from '../../utils/api';
import { hasGoogleMapsAccess } from '../../utils/subscriptionEntitlements';
import { optimizeBusRouteForAdmission } from '../../utils/transportEngine';
import { AdmissionRouteOptimizerPanel } from '../AdmissionRouteOptimizerPanel';
import { HomeVisitRecordsPanel } from '../HomeVisitRecordsPanel';
import { EnrolledStudentHomeVisitsPanel } from '../EnrolledStudentHomeVisitsPanel';
import { splitHomeVisitsByType } from '../../utils/studentHomeVisitEngine';

interface AdmissionsAndCareerModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

const CAREER_STATUSES: CareerCounsellingRequest['status'][] = [
  'Requested',
  'Counsellor Assigned',
  'Session Scheduled',
  'Report Reviewed',
];

const STAGE_TEXT_CLASS: Record<AdmissionLead['stage'], string> = {
  'New Enquiry': 'text-slate-700',
  'Follow-up Scheduled': 'text-amber-700',
  'Campus Visit': 'text-blue-900',
  'Document Verification': 'text-indigo-700',
  Confirmed: 'text-emerald-700',
};

type ModuleSubTab = 'pipeline' | 'home_visits' | 'enrolled_home_visits' | 'career';

export const AdmissionsAndCareerModule: React.FC<AdmissionsAndCareerModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const isCounsellorOnly = data.user.role === 'counsellor';
  const isTeacher = data.user.role === 'teacher';
  const googleMapsEnabled = hasGoogleMapsAccess(data.activeSchool);
  const canUpgradePlan = data.user.role === 'super_admin';
  const [activeSubTab, setActiveSubTab] = useState<ModuleSubTab>(
    isCounsellorOnly ? 'career' : 'pipeline',
  );

  // CRM filters & create form state
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<AdmissionLead['stage'] | 'ALL'>('ALL');
  const [visitFilter, setVisitFilter] = useState<LeadHomeVisitFilter>('ALL');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);

  const [studentName, setStudentName] = useState('');
  const [applyingClass, setApplyingClass] = useState('Class 9');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<AdmissionLead['source']>('Walk-in');
  const [assignedCounsellor, setAssignedCounsellor] = useState(data.user.name);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
  );
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [residentialLat, setResidentialLat] = useState('');
  const [residentialLng, setResidentialLng] = useState('');
  const [showNewLeadMapPicker, setShowNewLeadMapPicker] = useState(false);
  const [previousSchool, setPreviousSchool] = useState('');
  const [transportPreference, setTransportPreference] = useState<'Bus' | 'Walker' | 'Undecided'>('Bus');
  const [notes, setNotes] = useState('');
  const [leadFormError, setLeadFormError] = useState<string | null>(null);
  const [savingLead, setSavingLead] = useState(false);

  // Selected lead inspector & editing state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    data.admissionLeads[0]?.id ?? null,
  );
  const [editLeadNotes, setEditLeadNotes] = useState('');
  const [editLeadFollowUp, setEditLeadFollowUp] = useState('');
  const [editLeadCounsellor, setEditLeadCounsellor] = useState('');
  const [editLeadLocality, setEditLeadLocality] = useState('');
  const [editLeadAddress, setEditLeadAddress] = useState('');
  const [editLeadLat, setEditLeadLat] = useState('');
  const [editLeadLng, setEditLeadLng] = useState('');
  const [showEditLeadMapPicker, setShowEditLeadMapPicker] = useState(false);
  const [editLeadPrevSchool, setEditLeadPrevSchool] = useState('');
  const [editLeadTransportPref, setEditLeadTransportPref] = useState<'Bus' | 'Walker' | 'Undecided'>('Bus');
  const [savingLeadUpdate, setSavingLeadUpdate] = useState(false);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Preselect lead for Home Visit tab
  const [visitPreselectLeadId, setVisitPreselectLeadId] = useState<string | null>(null);

  // Career Counselling review notes
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const { admissionCrmVisits, enrolledStudentVisits } = useMemo(
    () => splitHomeVisitsByType(data.homeVisitRecords),
    [data.homeVisitRecords],
  );

  const summary = useMemo(
    () => computeAdmissionCrmSummary(data.admissionLeads, admissionCrmVisits),
    [data.admissionLeads, admissionCrmVisits],
  );

  const filteredLeads = useMemo(
    () =>
      filterAdmissionLeads(data.admissionLeads, admissionCrmVisits, {
        query: searchQuery,
        stage: stageFilter,
        homeVisitFilter: visitFilter,
      }),
    [data.admissionLeads, admissionCrmVisits, searchQuery, stageFilter, visitFilter],
  );

  const selectedLead = useMemo(
    () => data.admissionLeads.find((l) => l.id === selectedLeadId) ?? null,
    [data.admissionLeads, selectedLeadId],
  );

  const schoolLocation = useMemo(
    () =>
      data.transport?.schoolLocation || {
        lat: 28.6063,
        lng: 76.6565,
        label: data.activeSchool.name,
      },
    [data.transport?.schoolLocation, data.activeSchool.name],
  );

  const parsedNewLeadGeo = useMemo(() => {
    const lat = Number(residentialLat);
    const lng = Number(residentialLng);
    if (
      residentialLat.trim() !== '' &&
      residentialLng.trim() !== '' &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      return { lat, lng };
    }
    return null;
  }, [residentialLat, residentialLng]);

  const parsedEditLeadGeo = useMemo(() => {
    const lat = Number(editLeadLat);
    const lng = Number(editLeadLng);
    if (
      editLeadLat.trim() !== '' &&
      editLeadLng.trim() !== '' &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      return { lat, lng };
    }
    return null;
  }, [editLeadLat, editLeadLng]);

  const liveNewLeadOptimization = useMemo(() => {
    const routes = data.transport?.routes || [];
    if (routes.length === 0) return null;
    return optimizeBusRouteForAdmission({
      residentialGeo: parsedNewLeadGeo,
      locality,
      address,
      routes,
      allocations: data.transport?.allocations || [],
    });
  }, [parsedNewLeadGeo, locality, address, data.transport?.routes, data.transport?.allocations]);

  const liveNewLeadRouteRec = liveNewLeadOptimization?.bestRoute ?? null;

  const liveInspectorOptimization = useMemo(() => {
    const routes = data.transport?.routes || [];
    if (routes.length === 0) return null;
    return optimizeBusRouteForAdmission({
      residentialGeo: parsedEditLeadGeo,
      locality: editLeadLocality,
      address: editLeadAddress,
      routes,
      allocations: data.transport?.allocations || [],
    });
  }, [
    parsedEditLeadGeo,
    editLeadLocality,
    editLeadAddress,
    data.transport?.routes,
    data.transport?.allocations,
  ]);

  const liveInspectorRouteRec = liveInspectorOptimization?.bestRoute ?? null;

  useEffect(() => {
    if (!selectedLead && data.admissionLeads.length > 0) {
      setSelectedLeadId(data.admissionLeads[0].id);
      return;
    }
    if (selectedLead) {
      setEditLeadNotes(selectedLead.notes || '');
      setEditLeadFollowUp(selectedLead.nextFollowUpDate || '');
      setEditLeadCounsellor(selectedLead.assignedCounsellor || '');
      setEditLeadLocality(selectedLead.locality || '');
      setEditLeadAddress(selectedLead.address || '');
      setEditLeadLat(
        typeof selectedLead.residentialLat === 'number'
          ? selectedLead.residentialLat.toFixed(6)
          : '',
      );
      setEditLeadLng(
        typeof selectedLead.residentialLng === 'number'
          ? selectedLead.residentialLng.toFixed(6)
          : '',
      );
      setShowEditLeadMapPicker(false);
      setEditLeadPrevSchool(selectedLead.previousSchool || '');
      setEditLeadTransportPref(selectedLead.transportPreference || 'Bus');
    }
  }, [selectedLead, data.admissionLeads]);

  const selectedLeadVisits = useMemo(
    () =>
      selectedLead
        ? data.homeVisitRecords.filter((v) => v.leadId === selectedLead.id)
        : [],
    [data.homeVisitRecords, selectedLead],
  );

  function selectLeadForInspect(lead: AdmissionLead) {
    setSelectedLeadId(lead.id);
    setEditLeadNotes(lead.notes || '');
    setEditLeadFollowUp(lead.nextFollowUpDate || '');
    setEditLeadCounsellor(lead.assignedCounsellor || '');
    setEditLeadLocality(lead.locality || '');
    setEditLeadAddress(lead.address || '');
    setEditLeadLat(
      typeof lead.residentialLat === 'number' ? lead.residentialLat.toFixed(6) : '',
    );
    setEditLeadLng(
      typeof lead.residentialLng === 'number' ? lead.residentialLng.toFixed(6) : '',
    );
    setShowEditLeadMapPicker(false);
    setEditLeadPrevSchool(lead.previousSchool || '');
    setEditLeadTransportPref(lead.transportPreference || 'Bus');
    setActionFeedback(null);
  }

  async function handleCreateLead(e: React.FormEvent) {
    e.preventDefault();
    setLeadFormError(null);
    const check = validateLeadInput({ studentName, applyingClass, parentName, phone });
    if (!check.valid) {
      setLeadFormError(check.error ?? 'Please fill all required applicant fields.');
      return;
    }

    setSavingLead(true);
    try {
      const res = await apiRequest<{ lead: AdmissionLead }>(
        '/api/admissions',
        {
          method: 'POST',
          body: JSON.stringify({
            studentName,
            applyingClass,
            parentName,
            phone,
            email,
            source,
            assignedCounsellor,
            nextFollowUpDate,
            locality,
            address,
            residentialLat: parsedNewLeadGeo?.lat,
            residentialLng: parsedNewLeadGeo?.lng,
            previousSchool,
            transportPreference,
            notes,
          }),
        },
        token,
      );
      setStudentName('');
      setParentName('');
      setPhone('');
      setEmail('');
      setLocality('');
      setAddress('');
      setResidentialLat('');
      setResidentialLng('');
      setShowNewLeadMapPicker(false);
      setPreviousSchool('');
      setTransportPreference('Bus');
      setNotes('');
      setShowNewLeadForm(false);
      await onRefresh();
      selectLeadForInspect(res.lead);
      setActionFeedback(
        res.lead.recommendedRouteCode
          ? `Added admission enquiry for ${res.lead.studentName} · Auto-matched Bus Route ${res.lead.recommendedRouteCode} (${res.lead.recommendedStopName || res.lead.recommendedRouteName})${res.lead.recommendedEfficiencyScore !== undefined ? ` · Efficiency ${res.lead.recommendedEfficiencyScore}/100` : ''}.`
          : `Added admission enquiry for ${res.lead.studentName}.`,
      );
    } catch (err) {
      setLeadFormError(err instanceof Error ? err.message : 'Could not save admission lead.');
    } finally {
      setSavingLead(false);
    }
  }

  async function handleStageChange(id: string, stage: AdmissionLead['stage']) {
    await apiRequest(
      `/api/admissions/${id}`,
      { method: 'PATCH', body: JSON.stringify({ stage }) },
      token,
    );
    await onRefresh();
  }

  async function handleSaveLeadInspector(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLead) return;
    setSavingLeadUpdate(true);
    try {
      await apiRequest(
        `/api/admissions/${selectedLead.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            notes: editLeadNotes,
            nextFollowUpDate: editLeadFollowUp,
            assignedCounsellor: editLeadCounsellor,
            locality: editLeadLocality,
            address: editLeadAddress,
            residentialLat: parsedEditLeadGeo?.lat,
            residentialLng: parsedEditLeadGeo?.lng,
            previousSchool: editLeadPrevSchool,
            transportPreference: editLeadTransportPref,
          }),
        },
        token,
      );
      await onRefresh();
      setActionFeedback(`Saved CRM updates & synced geolocation route match for ${selectedLead.studentName}.`);
    } finally {
      setSavingLeadUpdate(false);
    }
  }

  async function handleConvertLead(lead: AdmissionLead) {
    setConvertingLeadId(lead.id);
    try {
      const res = await apiRequest<{ lead: AdmissionLead; student: { admissionNo: string } | null }>(
        `/api/admissions/${lead.id}/convert`,
        { method: 'POST' },
        token,
      );
      await onRefresh();
      setActionFeedback(
        res.student
          ? `Confirmed & enrolled ${lead.studentName} (${res.student.admissionNo}) in Student Directory.`
          : `Confirmed admission for ${lead.studentName}.`,
      );
    } finally {
      setConvertingLeadId(null);
    }
  }

  function handleJumpToHomeVisit(leadId: string) {
    setVisitPreselectLeadId(leadId);
    setActiveSubTab('home_visits');
  }

  async function handleCareerUpdate(id: string, status: CareerCounsellingRequest['status']) {
    await apiRequest(
      `/api/career-counselling/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          counsellorReviewNote: reviewNotes[id] ?? undefined,
        }),
      },
      token,
    );
    await onRefresh();
  }

  async function handleUpgradeToPremium() {
    await apiRequest(
      `/api/schools/${data.activeSchool.id}/subscription`,
      { method: 'PATCH', body: JSON.stringify({ subscriptionPlan: 'Premium Campus' }) },
      token,
    );
    await onRefresh();
    setActionFeedback(
      `Upgraded ${data.activeSchool.name} to Premium Campus — Google Maps pin-drop & address geocoding unlocked.`,
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Admission CRM, Home Visits & Career Counselling
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage enquiries, follow-up schedules, family home visit records, student enrolment, and
            human-reviewed career counselling queues.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500">{data.activeSchool.name}</span>
      </div>

      {/* KPI Strip + Segmented View Tabs (non-counsellor roles) */}
      {!isCounsellorOnly && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs font-medium text-slate-500">Total Enquiries</p>
              <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {summary.totalLeads}
              </p>
              <p className="mt-1 text-xs text-slate-600 tabular-nums">
                {summary.activePipelineCount} active in pipeline
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs font-medium text-slate-500">Follow-ups Due</p>
              <p className="mt-1 font-mono text-2xl font-bold text-amber-700 tabular-nums">
                {summary.followUpsDueCount}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Scheduled today or overdue
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs font-medium text-slate-500">Home Visits Logged</p>
              <p className="mt-1 font-mono text-2xl font-bold text-blue-900 tabular-nums">
                {summary.totalHomeVisits}
              </p>
              <p className="mt-1 text-xs text-slate-600 tabular-nums">
                {summary.completedHomeVisits} completed · {summary.scheduledHomeVisits} upcoming
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs font-medium text-slate-500">Confirmed Admissions</p>
              <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                {summary.confirmedCount}
              </p>
              <p className="mt-1 text-xs text-slate-600 tabular-nums">
                {summary.conversionRatePct}% lead-to-seat conversion
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setActiveSubTab('pipeline')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === 'pipeline'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admission Pipeline ({data.admissionLeads.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('home_visits')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === 'home_visits'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admission Home Visits — Leads ({admissionCrmVisits.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('enrolled_home_visits')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === 'enrolled_home_visits'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Enrolled Student Visits — 4×/Yr ({enrolledStudentVisits.length})
            </button>
            {!isTeacher && (
              <button
                type="button"
                onClick={() => setActiveSubTab('career')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeSubTab === 'career'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Career Counselling ({data.careerRequests.length})
              </button>
            )}
          </div>
        </>
      )}

      {/* TAB 1: ADMISSION CRM PIPELINE */}
      {!isCounsellorOnly && activeSubTab === 'pipeline' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Admission CRM Pipeline
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter leads, assign counsellors, update follow-ups, schedule home visits, and
                enrol confirmed students.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <button
                type="button"
                onClick={() =>
                  triggerCsvDownload(
                    `${data.activeSchool.code.toLowerCase()}-admission-leads.csv`,
                    [
                      'Student Name',
                      'Applying Class',
                      'Parent Name',
                      'Phone',
                      'Source',
                      'Stage',
                      'Assigned Counsellor',
                      'Next Follow-up',
                      'Locality',
                    ],
                    filteredLeads.map((l) => [
                      l.studentName,
                      l.applyingClass,
                      l.parentName,
                      l.phone,
                      l.source,
                      l.stage,
                      l.assignedCounsellor,
                      l.nextFollowUpDate,
                      l.locality || '',
                    ]),
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => setShowNewLeadForm((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
              >
                {showNewLeadForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {showNewLeadForm ? 'Close Lead Form' : 'New Admission Lead'}
              </button>
            </div>
          </div>

          {/* Expandable New Lead Form */}
          {showNewLeadForm && (
            <form
              onSubmit={handleCreateLead}
              className="border-b border-slate-200 bg-slate-50/70 p-6 space-y-4"
            >
              <h3 className="text-sm font-semibold text-slate-900">Add New Admission Enquiry</h3>
              {leadFormError && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-800"
                >
                  {leadFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">Student Name *</span>
                  <input
                    type="text"
                    aria-label="New applicant student name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Applicant full name"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Applying Class *
                  </span>
                  <input
                    type="text"
                    aria-label="Applying class"
                    value={applyingClass}
                    onChange={(e) => setApplyingClass(e.target.value)}
                    placeholder="e.g. Class 9"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">Parent Name *</span>
                  <input
                    type="text"
                    aria-label="Parent name"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Father / Mother / Guardian"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">Phone *</span>
                  <input
                    type="tel"
                    aria-label="Parent phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    aria-label="Parent email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.in"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">Enquiry Source</span>
                  <select
                    aria-label="Lead source"
                    value={source}
                    onChange={(e) => setSource(e.target.value as AdmissionLead['source'])}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  >
                    {ADMISSION_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Assigned Counsellor
                  </span>
                  <input
                    type="text"
                    aria-label="Assigned counsellor"
                    value={assignedCounsellor}
                    onChange={(e) => setAssignedCounsellor(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Next Follow-up Date
                  </span>
                  <input
                    type="date"
                    aria-label="Next follow-up date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono tabular-nums"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Locality / Sector
                  </span>
                  <input
                    type="text"
                    aria-label="Lead locality"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Sector 7, Kurukshetra"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Residential Address
                  </span>
                  <input
                    type="text"
                    aria-label="Lead residential address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Street"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">Previous School</span>
                  <input
                    type="text"
                    aria-label="Previous school"
                    value={previousSchool}
                    onChange={(e) => setPreviousSchool(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">Transport Need</span>
                  <select
                    aria-label="Applicant transport preference"
                    value={transportPreference}
                    onChange={(e) =>
                      setTransportPreference(e.target.value as 'Bus' | 'Walker' | 'Undecided')
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Bus">Needs School Bus</option>
                    <option value="Walker">Walker / Self-Drop</option>
                    <option value="Undecided">Undecided (Show Bus Option)</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Home Latitude (GPS)
                  </span>
                  <input
                    type="text"
                    aria-label="New lead residential latitude"
                    value={residentialLat}
                    onChange={(e) => setResidentialLat(e.target.value)}
                    placeholder="e.g. 28.6245"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Home Longitude (GPS)
                  </span>
                  <input
                    type="text"
                    aria-label="New lead residential longitude"
                    value={residentialLng}
                    onChange={(e) => setResidentialLng(e.target.value)}
                    placeholder="e.g. 76.6533"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono"
                  />
                </label>

                <label className="space-y-1 sm:col-span-2">
                  <span className="block text-xs font-medium text-slate-700">Initial Notes</span>
                  <input
                    type="text"
                    aria-label="Lead initial notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Transport, scholarship, syllabus notes..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>
              </div>

              {/* Pin Home on Map / Geocode Trigger */}
              {transportPreference !== 'Walker' && (data.transport?.routes?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewLeadMapPicker((prev) => !prev)}
                      data-testid="toggle-new-lead-map-picker"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#142B46] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC]"
                    >
                      <Compass className="h-3.5 w-3.5 text-[#7B5D1C]" />
                      {showNewLeadMapPicker
                        ? 'Hide Geolocation Route Optimizer'
                        : googleMapsEnabled
                          ? 'Pin Home on Map / Geocode Address'
                          : 'Open Route Efficiency Calculator (Maps: Premium)'}
                    </button>
                    {parsedNewLeadGeo && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#3D6349] font-semibold">
                        <MapPin className="h-3.5 w-3.5" />
                        Geo Locked: {parsedNewLeadGeo.lat.toFixed(5)}, {parsedNewLeadGeo.lng.toFixed(5)}
                      </span>
                    )}
                  </div>

                  {showNewLeadMapPicker && (
                    <AdmissionRouteOptimizerPanel
                      routes={data.transport?.routes || []}
                      allocations={data.transport?.allocations || []}
                      schoolLocation={schoolLocation}
                      schoolId={data.activeSchool.id}
                      token={token}
                      initialGeo={parsedNewLeadGeo}
                      initialLocality={locality}
                      initialAddress={address}
                      compact
                      googleMapsEnabled={googleMapsEnabled}
                      subscriptionPlan={data.activeSchool.subscriptionPlan}
                      canUpgradePlan={canUpgradePlan}
                      onUpgradeToPremium={canUpgradePlan ? handleUpgradeToPremium : undefined}
                      onSelectLocationAndRoute={({ lat, lng }) => {
                        setResidentialLat(lat.toFixed(6));
                        setResidentialLng(lng.toFixed(6));
                      }}
                    />
                  )}
                </div>
              )}

              {/* Live Recommended Bus Route Preview */}
              {transportPreference !== 'Walker' && liveNewLeadRouteRec && (
                <div
                  data-testid="new-lead-recommended-route"
                  className="rounded-xl border border-[#D6B66D] bg-[#FAF4EC] px-4 py-3 space-y-2 text-xs"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Bus className="h-4 w-4 text-[#142B46] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[#142B46] flex items-center gap-2 flex-wrap">
                          <span>
                            Most Efficient Route: {liveNewLeadRouteRec.routeCode} ·{' '}
                            {liveNewLeadRouteRec.routeName}
                          </span>
                          <span className="rounded bg-[#142B46] px-2 py-0.5 text-[10px] font-semibold text-[#D6B66D]">
                            {liveNewLeadRouteRec.confidence}
                          </span>
                          {liveNewLeadRouteRec.efficiencyScore !== undefined && (
                            <span className="rounded bg-[#3D6349] px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                              Efficiency {liveNewLeadRouteRec.efficiencyScore}/100
                            </span>
                          )}
                        </p>
                        <p className="text-slate-700 mt-0.5">
                          Stop: <strong>{liveNewLeadRouteRec.stopName}</strong> (Pickup{' '}
                          <span className="font-mono font-semibold">
                            {liveNewLeadRouteRec.pickupTime}
                          </span>
                          ) · Bus <span className="font-mono">{liveNewLeadRouteRec.busNumber}</span> ·
                          Driver: {liveNewLeadRouteRec.driverName} ({liveNewLeadRouteRec.driverPhone})
                        </p>
                        {liveNewLeadRouteRec.distanceToStopKm !== undefined && (
                          <p className="text-[11px] text-[#142B46] font-mono mt-0.5">
                            Stop Distance: {liveNewLeadRouteRec.distanceToStopKm} km · Route Detour:{' '}
                            +{liveNewLeadRouteRec.marginalDetourKm ?? 0} km (~
                            {liveNewLeadRouteRec.estimatedDetourMinutes ?? 0} min) · Post-Admission Load:{' '}
                            {liveNewLeadRouteRec.postAdmissionUtilizationPct ?? 0}%
                          </p>
                        )}
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {liveNewLeadRouteRec.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-[#3D6349]">
                        {liveNewLeadRouteRec.availableSeats} Seats Open
                      </p>
                      <p className="font-mono text-[11px] text-slate-600">
                        ₹{liveNewLeadRouteRec.monthlyFeeInr}/mo
                      </p>
                    </div>
                  </div>

                  {liveNewLeadOptimization?.capacityOverflowTriggered && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-900 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                      <span>
                        Capacity Overflow Reroute: Closest bus route{' '}
                        <strong>{liveNewLeadOptimization.overflowedClosestRouteCode}</strong> is at
                        100% capacity — automatically routed to{' '}
                        <strong>{liveNewLeadRouteRec.routeCode}</strong> with open seats.
                      </span>
                    </div>
                  )}

                  {liveNewLeadOptimization?.walkableCampusZone && (
                    <div className="rounded-lg border border-[#C6DCCC] bg-[#F0F6F2] px-3 py-1.5 text-[11px] font-medium text-[#2D5139] flex items-center gap-2">
                      <Footprints className="h-3.5 w-3.5 text-[#3D6349] shrink-0" />
                      <span>
                        Walkable Campus Zone ({liveNewLeadOptimization.distanceToCampusKm} km from
                        school) — Walker / Self-Drop is also viable.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewLeadForm(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {savingLead ? 'Adding...' : 'Add Lead'}
                </button>
              </div>
            </form>
          )}

          {/* Pipeline Search & Filter Bar */}
          <div className="border-b border-slate-200 px-6 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:max-w-sm">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Search admission leads"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, parent, phone, locality..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                aria-label="Filter by pipeline stage"
                value={stageFilter}
                onChange={(e) =>
                  setStageFilter(e.target.value as AdmissionLead['stage'] | 'ALL')
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              >
                <option value="ALL">All Stages ({data.admissionLeads.length})</option>
                {ADMISSION_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st} ({summary.byStage[st]})
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by home visit status"
                value={visitFilter}
                onChange={(e) => setVisitFilter(e.target.value as LeadHomeVisitFilter)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              >
                <option value="ALL">All Home Visit States</option>
                <option value="NEEDS_VISIT">Needs Home Visit</option>
                <option value="WITH_VISIT">Has Home Visit Record</option>
                <option value="COMPLETED_VISIT">Home Visit Completed</option>
              </select>
            </div>
          </div>

          {actionFeedback && (
            <div className="border-b border-emerald-200 bg-emerald-50 px-6 py-2.5 text-xs font-medium text-emerald-800 flex items-center justify-between">
              <span>{actionFeedback}</span>
              <button
                type="button"
                onClick={() => setActionFeedback(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Pipeline Table */}
          {filteredLeads.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-800">
                No admission leads match the current search or filter.
              </p>
              <p className="text-xs text-slate-500">
                Clear the active filters or add a new enquiry to start tracking admissions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Applicant & Class</th>
                    <th className="px-5 py-3 font-semibold">Parent & Contact</th>
                    <th className="px-5 py-3 font-semibold">Counsellor & Follow-up</th>
                    <th className="px-5 py-3 font-semibold">Home Visit</th>
                    <th className="px-5 py-3 font-semibold">Pipeline Stage</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const visitSummary = deriveLeadVisitSummary(lead.id, data.homeVisitRecords);
                    const isSelected = selectedLead?.id === lead.id;
                    return (
                      <tr
                        key={lead.id}
                        className={isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
                      >
                        <td className="px-5 py-3.5 align-top">
                          <p className="font-semibold text-slate-900">{lead.studentName}</p>
                          <p className="text-slate-500 mt-0.5">
                            {lead.applyingClass} · {lead.source}
                            {lead.locality ? ` · ${lead.locality}` : ''}
                          </p>
                          {lead.transportPreference === 'Walker' ? (
                            <p className="text-[11px] font-medium text-[#3D6349] mt-0.5">
                              Walker / Self-Drop
                            </p>
                          ) : lead.recommendedRouteCode ? (
                            <p className="text-[11px] font-semibold text-[#142B46] mt-0.5 inline-flex items-center gap-1">
                              <Bus className="h-3 w-3 text-[#7B5D1C] shrink-0" />
                              <span>
                                Rec. {lead.recommendedRouteCode} · {lead.recommendedStopName || lead.recommendedRouteName}
                                {lead.recommendedPickupTime ? ` (${lead.recommendedPickupTime})` : ''}
                              </span>
                            </p>
                          ) : null}
                        </td>
                        <td className="px-5 py-3.5 align-top">
                          <p className="text-slate-800">{lead.parentName}</p>
                          <p className="font-mono text-slate-500 tabular-nums mt-0.5">
                            {lead.phone}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 align-top">
                          <p className="text-slate-800">{lead.assignedCounsellor}</p>
                          <p className="font-mono text-slate-500 tabular-nums mt-0.5">
                            Next: {lead.nextFollowUpDate}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 align-top">
                          {visitSummary.latestVisit ? (
                            <div>
                              <p
                                className={`font-semibold ${
                                  visitSummary.latestVisit.status === 'Completed'
                                    ? 'text-emerald-700'
                                    : visitSummary.latestVisit.status === 'Cancelled'
                                      ? 'text-rose-700'
                                      : 'text-blue-900'
                                }`}
                              >
                                {visitSummary.latestVisit.status} ({visitSummary.totalVisits})
                              </p>
                              <p className="font-mono text-slate-500 tabular-nums mt-0.5">
                                {visitSummary.latestVisit.visitDate}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-500">Not scheduled</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 align-top">
                          <select
                            aria-label={`Stage for ${lead.studentName}`}
                            value={lead.stage}
                            onChange={(e) =>
                              void handleStageChange(
                                lead.id,
                                e.target.value as AdmissionLead['stage'],
                              )
                            }
                            className={`rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold ${STAGE_TEXT_CLASS[lead.stage]}`}
                          >
                            {ADMISSION_STAGES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3.5 align-top text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => selectLeadForInspect(lead)}
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                            >
                              {isSelected ? 'Editing' : 'Details'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleJumpToHomeVisit(lead.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                            >
                              <Home className="h-3 w-3" />
                              Log Visit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Selected Lead Inspector & Home Visit Link */}
          {selectedLead && (
            <div className="border-t border-slate-200 bg-slate-50/60 p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-blue-900">
                    Lead Record & Follow-up Workspace
                  </p>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                    {selectedLead.studentName} · {selectedLead.applyingClass}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Parent: {selectedLead.parentName} · {selectedLead.phone}
                    {selectedLead.email ? ` · ${selectedLead.email}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleJumpToHomeVisit(selectedLead.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    <Home className="h-3.5 w-3.5" />
                    Schedule / Log Home Visit ({selectedLeadVisits.length})
                  </button>

                  {selectedLead.convertedStudentId ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Enrolled in Student Directory
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={convertingLeadId === selectedLead.id}
                      onClick={() => void handleConvertLead(selectedLead)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 whitespace-nowrap shrink-0"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {convertingLeadId === selectedLead.id
                        ? 'Enrolling...'
                        : 'Confirm & Enrol Student'}
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveLeadInspector} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <label className="space-y-1">
                    <span className="block text-xs font-medium text-slate-700">
                      Assigned Counsellor
                    </span>
                    <input
                      type="text"
                      aria-label="Edit assigned counsellor"
                      value={editLeadCounsellor}
                      onChange={(e) => setEditLeadCounsellor(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="block text-xs font-medium text-slate-700">
                      Next Follow-up Date
                    </span>
                    <input
                      type="date"
                      aria-label="Edit next follow-up date"
                      value={editLeadFollowUp}
                      onChange={(e) => setEditLeadFollowUp(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono tabular-nums"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="block text-xs font-medium text-slate-700">
                      Locality / Sector
                    </span>
                    <input
                      type="text"
                      aria-label="Edit lead locality"
                      value={editLeadLocality}
                      onChange={(e) => setEditLeadLocality(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="block text-xs font-medium text-slate-700">
                      Residential Address
                    </span>
                    <input
                      type="text"
                      aria-label="Edit lead address"
                      value={editLeadAddress}
                      onChange={(e) => setEditLeadAddress(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="block text-xs font-medium text-slate-700">
                      Previous School
                    </span>
                    <input
                      type="text"
                      aria-label="Edit previous school"
                      value={editLeadPrevSchool}
                      onChange={(e) => setEditLeadPrevSchool(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                  </label>
                </div>

                {/* Residential Geolocation Inputs & Map Pin Trigger in Lead Inspector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <label className="space-y-1">
                    <span className="block text-xs font-medium text-slate-700">
                      Home Latitude (GPS)
                    </span>
                    <input
                      type="text"
                      aria-label="Edit lead residential latitude"
                      value={editLeadLat}
                      onChange={(e) => setEditLeadLat(e.target.value)}
                      placeholder="e.g. 28.6245"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs font-medium text-slate-700">
                      Home Longitude (GPS)
                    </span>
                    <input
                      type="text"
                      aria-label="Edit lead residential longitude"
                      value={editLeadLng}
                      onChange={(e) => setEditLeadLng(e.target.value)}
                      placeholder="e.g. 76.6533"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                    />
                  </label>
                  {editLeadTransportPref !== 'Walker' && (data.transport?.routes?.length ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowEditLeadMapPicker((prev) => !prev)}
                      data-testid="toggle-edit-lead-map-picker"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#142B46] bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC]"
                    >
                      <Compass className="h-3.5 w-3.5 text-[#7B5D1C]" />
                      {showEditLeadMapPicker
                        ? 'Hide Route Optimizer'
                        : googleMapsEnabled
                          ? 'Pin Home / Geocode on Map'
                          : 'Route Calculator (Maps: Premium)'}
                    </button>
                  )}
                </div>

                {showEditLeadMapPicker &&
                  editLeadTransportPref !== 'Walker' &&
                  (data.transport?.routes?.length ?? 0) > 0 && (
                    <AdmissionRouteOptimizerPanel
                      routes={data.transport?.routes || []}
                      allocations={data.transport?.allocations || []}
                      schoolLocation={schoolLocation}
                      schoolId={data.activeSchool.id}
                      token={token}
                      initialGeo={parsedEditLeadGeo}
                      initialLocality={editLeadLocality}
                      initialAddress={editLeadAddress}
                      compact
                      googleMapsEnabled={googleMapsEnabled}
                      subscriptionPlan={data.activeSchool.subscriptionPlan}
                      canUpgradePlan={canUpgradePlan}
                      onUpgradeToPremium={canUpgradePlan ? handleUpgradeToPremium : undefined}
                      onSelectLocationAndRoute={({ lat, lng }) => {
                        setEditLeadLat(lat.toFixed(6));
                        setEditLeadLng(lng.toFixed(6));
                      }}
                    />
                  )}

                {/* Connected Most Recommended Bus Route Banner in Lead Inspector */}
                <div className="rounded-lg border border-[#D6B66D] bg-[#FAF4EC] px-4 py-3 space-y-2 text-xs">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Bus className="h-4 w-4 text-[#142B46] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[#142B46] flex items-center gap-2 flex-wrap">
                          <span>
                            {editLeadTransportPref === 'Walker'
                              ? 'Transport Preference: Walker / Self-Drop (No bus allotment needed upon enrolment)'
                              : liveInspectorRouteRec
                                ? `Optimal Bus Route: ${liveInspectorRouteRec.routeCode} · ${liveInspectorRouteRec.routeName}`
                                : selectedLead.recommendedRouteCode
                                  ? `Connected Bus Route: ${selectedLead.recommendedRouteCode} · ${selectedLead.recommendedRouteName}`
                                  : 'Enter Locality / GPS coordinates above to compute the most efficient bus route'}
                          </span>
                          {editLeadTransportPref !== 'Walker' &&
                            liveInspectorRouteRec?.efficiencyScore !== undefined && (
                              <span className="rounded bg-[#3D6349] px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                                Score {liveInspectorRouteRec.efficiencyScore}/100
                              </span>
                            )}
                          {editLeadTransportPref !== 'Walker' && liveInspectorRouteRec && (
                            <span className="rounded bg-[#142B46] px-2 py-0.5 text-[10px] font-semibold text-[#D6B66D]">
                              {liveInspectorRouteRec.confidence}
                            </span>
                          )}
                        </p>
                        {editLeadTransportPref !== 'Walker' && liveInspectorRouteRec && (
                          <>
                            <p className="text-slate-700 mt-0.5">
                              Nearest Stop: <strong>{liveInspectorRouteRec.stopName}</strong> (AM{' '}
                              <span className="font-mono">{liveInspectorRouteRec.pickupTime}</span> / PM{' '}
                              <span className="font-mono">{liveInspectorRouteRec.dropTime}</span>) ·
                              Driver: {liveInspectorRouteRec.driverName} (
                              {liveInspectorRouteRec.driverPhone}) ·{' '}
                              <strong>{liveInspectorRouteRec.availableSeats} seats open</strong> ·
                              Auto-allotted on enrolment!
                            </p>
                            {liveInspectorRouteRec.distanceToStopKm !== undefined && (
                              <p className="text-[11px] font-mono text-[#142B46] mt-0.5">
                                Distance to Stop: {liveInspectorRouteRec.distanceToStopKm} km · Detour: +
                                {liveInspectorRouteRec.marginalDetourKm ?? 0} km (~
                                {liveInspectorRouteRec.estimatedDetourMinutes ?? 0} min) · Post-Load:{' '}
                                {liveInspectorRouteRec.postAdmissionUtilizationPct ?? 0}%
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <select
                      aria-label="Edit lead transport preference"
                      value={editLeadTransportPref}
                      onChange={(e) =>
                        setEditLeadTransportPref(e.target.value as 'Bus' | 'Walker' | 'Undecided')
                      }
                      className="rounded-lg border border-[#D6B66D] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#142B46] shrink-0"
                    >
                      <option value="Bus">Needs School Bus</option>
                      <option value="Walker">Walker / Self-Drop</option>
                      <option value="Undecided">Undecided</option>
                    </select>
                  </div>

                  {editLeadTransportPref !== 'Walker' &&
                    liveInspectorOptimization?.capacityOverflowTriggered && (
                      <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-900 flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                        <span>
                          Capacity Overflow Reroute: Nearest bus{' '}
                          <strong>{liveInspectorOptimization.overflowedClosestRouteCode}</strong> is
                          full — automatically assigned to{' '}
                          <strong>{liveInspectorRouteRec?.routeCode}</strong>.
                        </span>
                      </div>
                    )}

                  {editLeadTransportPref !== 'Walker' &&
                    liveInspectorOptimization?.walkableCampusZone && (
                      <div className="rounded-lg border border-[#C6DCCC] bg-[#F0F6F2] px-3 py-1.5 text-[11px] font-medium text-[#2D5139] flex items-center gap-2">
                        <Footprints className="h-3.5 w-3.5 text-[#3D6349] shrink-0" />
                        <span>
                          Walkable Campus Zone ({liveInspectorOptimization.distanceToCampusKm} km from
                          campus) — consider Walker / Self-Drop.
                        </span>
                      </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                  <label className="flex-1 space-y-1">
                    <span className="block text-xs font-medium text-slate-700">
                      Counsellor & Follow-up Notes
                    </span>
                    <input
                      type="text"
                      aria-label="Edit counsellor notes"
                      value={editLeadNotes}
                      onChange={(e) => setEditLeadNotes(e.target.value)}
                      placeholder="Document checklist status, campus tour feedback, scholarship inquiry..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={savingLeadUpdate}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap shrink-0"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    {savingLeadUpdate ? 'Saving...' : 'Save Lead Details'}
                  </button>
                </div>
              </form>

              {selectedLeadVisits.length > 0 && (
                <div className="border-t border-slate-200 pt-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Recorded Home Visits for {selectedLead.studentName}
                  </p>
                  <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                    {selectedLeadVisits.map((v) => (
                      <div
                        key={v.id}
                        className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">{v.status}</span>
                          <span aria-hidden="true" className="mx-1.5 text-slate-300">
                            ·
                          </span>
                          <span className="font-mono tabular-nums text-slate-600">
                            {v.visitDate} ({v.visitSlot})
                          </span>
                          <span aria-hidden="true" className="mx-1.5 text-slate-300">
                            ·
                          </span>
                          <span className="text-slate-600">Staff: {v.visitingStaff}</span>
                        </div>
                        <span className="font-medium text-blue-900">{v.outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2A: ADMISSION CRM HOME VISITS (PROSPECTIVE LEADS ONLY) */}
      {!isCounsellorOnly && activeSubTab === 'home_visits' && (
        <HomeVisitRecordsPanel
          leads={data.admissionLeads}
          visits={admissionCrmVisits}
          defaultStaffName={data.user.name}
          preselectedLeadId={visitPreselectLeadId}
          token={token}
          onRefresh={onRefresh}
          onClearPreselect={() => setVisitPreselectLeadId(null)}
        />
      )}

      {/* TAB 2B: ENROLLED STUDENT QUARTERLY HOME VISITS (4 VISITS/YEAR MANDATE) */}
      {!isCounsellorOnly && activeSubTab === 'enrolled_home_visits' && (
        <EnrolledStudentHomeVisitsPanel
          students={data.students}
          visits={enrolledStudentVisits}
          academicSession={data.activeSchool.session || '2026-27'}
          defaultStaffName={data.user.name}
          token={token}
          onRefresh={onRefresh}
        />
      )}

      {/* TAB 3: CAREER COUNSELLING QUEUE */}
      {(isCounsellorOnly || activeSubTab === 'career') && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Career Counselling Appointments & Human Review
              </h2>
              <p className="text-xs text-slate-500">
                Includes independent public visitors and enrolled students. Counsellors review all
                automated pathway briefs.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-blue-900 tabular-nums">
              {data.careerRequests.length} Requests
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {data.careerRequests.map((req) => (
              <div key={req.id} className="p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-amber-700 font-semibold">
                      {req.category} · {req.currentStage} · Preferred: {req.preferredSlot}
                    </p>
                    <h3 className="font-display text-base font-bold text-slate-900 mt-0.5">
                      {req.applicantName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {req.email} · {req.phone} · Interests: {req.interests.join(', ')}
                    </p>
                  </div>
                  <select
                    aria-label={`Counselling status for ${req.applicantName}`}
                    value={req.status}
                    onChange={(e) =>
                      void handleCareerUpdate(
                        req.id,
                        e.target.value as CareerCounsellingRequest['status'],
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium self-start"
                  >
                    {CAREER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-xs text-slate-700">
                  <span className="font-semibold">Goal:</span> {req.goalSummary}
                </p>

                {req.aiAdvisoryReport && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
                    {req.aiAdvisoryReport}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    aria-label={`Counsellor review note for ${req.applicantName}`}
                    value={reviewNotes[req.id] ?? req.counsellorReviewNote ?? ''}
                    onChange={(e) =>
                      setReviewNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                    }
                    placeholder="Enter counsellor review & follow-up recommendation..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCareerUpdate(req.id, 'Report Reviewed')}
                    className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    Save Counsellor Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
