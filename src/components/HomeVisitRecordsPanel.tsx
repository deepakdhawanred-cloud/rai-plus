import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Edit3, Home, MapPin, Plus, Search, X } from 'lucide-react';
import type {
  AdmissionLead,
  HomeVisitOutcome,
  HomeVisitRecord,
  HomeVisitStatus,
} from '../types';
import {
  HOME_VISIT_OUTCOMES,
  HOME_VISIT_STATUSES,
  filterHomeVisits,
  validateHomeVisitInput,
} from '../utils/admissionCrmEngine';
import { apiRequest } from '../utils/api';

interface HomeVisitRecordsPanelProps {
  leads: AdmissionLead[];
  visits: HomeVisitRecord[];
  defaultStaffName: string;
  preselectedLeadId?: string | null;
  openCreateByDefault?: boolean;
  token: string;
  onRefresh: () => Promise<void>;
  onClearPreselect?: () => void;
}

const STATUS_TEXT_CLASS: Record<HomeVisitStatus, string> = {
  Completed: 'text-emerald-700',
  Scheduled: 'text-blue-900',
  Rescheduled: 'text-amber-700',
  Cancelled: 'text-rose-700',
};

const OUTCOME_TEXT_CLASS: Record<HomeVisitOutcome, string> = {
  'Proceed to Admission': 'text-emerald-700',
  'Scholarship / Fee Review': 'text-amber-700',
  'Follow-up Visit Needed': 'text-blue-900',
  'Not Proceeding': 'text-rose-700',
};

export const HomeVisitRecordsPanel: React.FC<HomeVisitRecordsPanelProps> = ({
  leads,
  visits,
  defaultStaffName,
  preselectedLeadId,
  openCreateByDefault = false,
  token,
  onRefresh,
  onClearPreselect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<HomeVisitStatus | 'ALL'>('ALL');
  const [showCreateForm, setShowCreateForm] = useState(openCreateByDefault);

  // Create form state
  const [leadId, setLeadId] = useState<string>(preselectedLeadId || leads[0]?.id || '');
  const [visitDate, setVisitDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  );
  const [visitSlot, setVisitSlot] = useState('10:30 AM – 11:15 AM');
  const [visitingStaff, setVisitingStaff] = useState(defaultStaffName);
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [guardianMet, setGuardianMet] = useState('');
  const [homeEnvironmentSummary, setHomeEnvironmentSummary] = useState('');
  const [learningSupportNotes, setLearningSupportNotes] = useState('');
  const [transportOrFeeNotes, setTransportOrFeeNotes] = useState('');
  const [status, setStatus] = useState<HomeVisitStatus>('Scheduled');
  const [outcome, setOutcome] = useState<HomeVisitOutcome>('Proceed to Admission');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit existing visit state
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<HomeVisitStatus>('Completed');
  const [editOutcome, setEditOutcome] = useState<HomeVisitOutcome>('Proceed to Admission');
  const [editDate, setEditDate] = useState('');
  const [editSlot, setEditSlot] = useState('');
  const [editStaff, setEditStaff] = useState('');
  const [editHomeEnv, setEditHomeEnv] = useState('');
  const [editLearningNotes, setEditLearningNotes] = useState('');
  const [editTransportNotes, setEditTransportNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (preselectedLeadId) {
      setLeadId(preselectedLeadId);
      setShowCreateForm(true);
      const matched = leads.find((l) => l.id === preselectedLeadId);
      if (matched) {
        setAddress(matched.address || '');
        setLocality(matched.locality || '');
        setGuardianMet(`${matched.parentName} (Parent)`);
      }
    }
  }, [preselectedLeadId, leads]);

  function handleLeadSelection(nextLeadId: string) {
    setLeadId(nextLeadId);
    const matched = leads.find((l) => l.id === nextLeadId);
    if (matched) {
      setAddress(matched.address || '');
      setLocality(matched.locality || '');
      setGuardianMet(`${matched.parentName} (Parent)`);
    }
  }

  const filteredVisits = useMemo(
    () =>
      filterHomeVisits(visits, {
        query: searchQuery,
        status: statusFilter,
      }),
    [visits, searchQuery, statusFilter],
  );

  async function handleCreateVisit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const check = validateHomeVisitInput({
      leadId,
      visitDate,
      visitingStaff,
      address,
      locality,
      guardianMet,
    });
    if (!check.valid) {
      setFormError(check.error ?? 'Please fill all required home visit fields.');
      return;
    }

    setSaving(true);
    try {
      await apiRequest(
        `/api/admissions/${leadId}/home-visits`,
        {
          method: 'POST',
          body: JSON.stringify({
            visitDate,
            visitSlot,
            visitingStaff,
            address,
            locality,
            guardianMet,
            homeEnvironmentSummary,
            learningSupportNotes,
            transportOrFeeNotes,
            status,
            outcome,
          }),
        },
        token,
      );
      setHomeEnvironmentSummary('');
      setLearningSupportNotes('');
      setTransportOrFeeNotes('');
      setShowCreateForm(false);
      onClearPreselect?.();
      await onRefresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save home visit record.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(visit: HomeVisitRecord) {
    setEditingVisitId(visit.id);
    setEditStatus(visit.status);
    setEditOutcome(visit.outcome);
    setEditDate(visit.visitDate);
    setEditSlot(visit.visitSlot);
    setEditStaff(visit.visitingStaff);
    setEditHomeEnv(visit.homeEnvironmentSummary);
    setEditLearningNotes(visit.learningSupportNotes);
    setEditTransportNotes(visit.transportOrFeeNotes);
  }

  async function handleSaveEdit(visitId: string) {
    setSavingEdit(true);
    try {
      await apiRequest(
        `/api/home-visits/${visitId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: editStatus,
            outcome: editOutcome,
            visitDate: editDate,
            visitSlot: editSlot,
            visitingStaff: editStaff,
            homeEnvironmentSummary: editHomeEnv,
            learningSupportNotes: editLearningNotes,
            transportOrFeeNotes: editTransportNotes,
          }),
        },
        token,
      );
      setEditingVisitId(null);
      await onRefresh();
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleQuickStatus(visitId: string, nextStatus: HomeVisitStatus) {
    await apiRequest(
      `/api/home-visits/${visitId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      },
      token,
    );
    await onRefresh();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header & Controls */}
      <div className="border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">
            Home Visit Records & Family Outreach Log
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Track teacher/counsellor home visits, study environment observations, transport & fee
            queries, and admission readiness recommendations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreateForm((prev) => !prev);
            if (!showCreateForm && !leadId && leads[0]) {
              handleLeadSelection(leads[0].id);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0 self-start lg:self-auto"
        >
          {showCreateForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showCreateForm ? 'Close Visit Form' : 'Log Home Visit'}
        </button>
      </div>

      {/* Create / Schedule Home Visit Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateVisit}
          className="border-b border-slate-200 bg-slate-50/70 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Schedule or Log Home Visit Record
            </h3>
            <span className="text-xs text-slate-500">Linked to active school Admission CRM</span>
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-800"
            >
              {formError}
            </div>
          )}

          {leads.length === 0 ? (
            <p className="text-xs text-slate-600">
              Add an admission lead first before logging a home visit.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Applicant Lead *
                  </span>
                  <select
                    aria-label="Home visit applicant lead"
                    value={leadId}
                    onChange={(e) => handleLeadSelection(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  >
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.studentName} ({lead.applyingClass}) — {lead.parentName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">Visit Date *</span>
                  <input
                    type="date"
                    aria-label="Home visit date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono tabular-nums"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">Time Slot</span>
                  <input
                    type="text"
                    aria-label="Home visit time slot"
                    value={visitSlot}
                    onChange={(e) => setVisitSlot(e.target.value)}
                    placeholder="e.g. 10:30 AM – 11:15 AM"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Visiting Staff *
                  </span>
                  <input
                    type="text"
                    aria-label="Visiting staff name"
                    value={visitingStaff}
                    onChange={(e) => setVisitingStaff(e.target.value)}
                    placeholder="Teacher / Coordinator name"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Guardian Met *
                  </span>
                  <input
                    type="text"
                    aria-label="Guardian met"
                    value={guardianMet}
                    onChange={(e) => setGuardianMet(e.target.value)}
                    placeholder="e.g. Rajesh Sharma (Father)"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Locality / Sector *
                  </span>
                  <input
                    type="text"
                    aria-label="Home visit locality"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Sector 7, Kurukshetra"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="block text-xs font-medium text-slate-700">
                    Residential Address
                  </span>
                  <input
                    type="text"
                    aria-label="Residential address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Street / Landmark"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <label className="space-y-1">
                    <span className="block text-xs font-medium text-slate-700">Visit Status</span>
                    <select
                      aria-label="Home visit status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as HomeVisitStatus)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
                    >
                      {HOME_VISIT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="block text-xs font-medium text-slate-700">Outcome</span>
                    <select
                      aria-label="Home visit outcome"
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value as HomeVisitOutcome)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
                    >
                      {HOME_VISIT_OUTCOMES.map((out) => (
                        <option key={out} value={out}>
                          {out}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Home Study Environment Summary
                  </span>
                  <textarea
                    rows={2}
                    aria-label="Home study environment summary"
                    value={homeEnvironmentSummary}
                    onChange={(e) => setHomeEnvironmentSummary(e.target.value)}
                    placeholder="Study desk availability, quiet space, family routine..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Learning Support & Readiness Notes
                  </span>
                  <textarea
                    rows={2}
                    aria-label="Learning support notes"
                    value={learningSupportNotes}
                    onChange={(e) => setLearningSupportNotes(e.target.value)}
                    placeholder="Parental support, reading/maths readiness observations..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-700">
                    Transport / Fee Discussion Notes
                  </span>
                  <textarea
                    rows={2}
                    aria-label="Transport or fee discussion notes"
                    value={transportOrFeeNotes}
                    onChange={(e) => setTransportOrFeeNotes(e.target.value)}
                    placeholder="Bus route request, scholarship/fee plan clarification..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    onClearPreselect?.();
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap shrink-0"
                >
                  <Home className="h-3.5 w-3.5" />
                  {saving ? 'Saving...' : 'Save Home Visit Record'}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {/* Search & Status Filters */}
      <div className="border-b border-slate-200 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-sm">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search home visit records"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, staff, locality, notes..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
          {(['ALL', ...HOME_VISIT_STATUSES] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? `All (${visits.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* Visit Records List */}
      {filteredVisits.length === 0 ? (
        <div className="p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-800">
            No home visit records match the active filter.
          </p>
          <p className="text-xs text-slate-500">
            Schedule or log a parent home interaction to capture study environment and transport
            notes.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Log First Home Visit
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {filteredVisits.map((visit) => {
            const isEditing = editingVisitId === visit.id;
            return (
              <div key={visit.id} className="p-6 space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`font-semibold ${STATUS_TEXT_CLASS[visit.status]}`}>
                        {visit.status}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="font-mono tabular-nums text-slate-700 inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {visit.visitDate} ({visit.visitSlot})
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className={`font-semibold ${OUTCOME_TEXT_CLASS[visit.outcome]}`}>
                        {visit.outcome}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-slate-900">
                      {visit.studentName}
                      <span className="text-xs font-normal text-slate-500 ml-2">
                        {visit.applyingClass} · Parent: {visit.parentName} (
                        <span className="font-mono tabular-nums">{visit.phone}</span>)
                      </span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      <span>
                        <span className="font-semibold text-slate-700">Visiting Staff:</span>{' '}
                        {visit.visitingStaff}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span>
                        <span className="font-semibold text-slate-700">Guardian Met:</span>{' '}
                        {visit.guardianMet}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {[visit.address, visit.locality].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {visit.status !== 'Completed' && visit.status !== 'Cancelled' && (
                      <button
                        type="button"
                        onClick={() => void handleQuickStatus(visit.id, 'Completed')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 whitespace-nowrap shrink-0"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark Completed
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => (isEditing ? setEditingVisitId(null) : startEdit(visit))}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      {isEditing ? 'Close Editor' : 'Update Visit'}
                    </button>
                  </div>
                </div>

                {/* Observation Grid (clean flat surface with subtle border) */}
                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg bg-slate-50 px-4 py-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">Home Study Environment</p>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {visit.homeEnvironmentSummary || 'No observation recorded yet.'}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Learning Support & Readiness</p>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {visit.learningSupportNotes || 'No learning support notes yet.'}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Transport & Fee Notes</p>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {visit.transportOrFeeNotes || 'No transport or fee notes yet.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      <label className="space-y-1">
                        <span className="block text-xs font-medium text-slate-700">Status</span>
                        <select
                          aria-label={`Edit status for ${visit.studentName}`}
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as HomeVisitStatus)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        >
                          {HOME_VISIT_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1">
                        <span className="block text-xs font-medium text-slate-700">Outcome</span>
                        <select
                          aria-label={`Edit outcome for ${visit.studentName}`}
                          value={editOutcome}
                          onChange={(e) => setEditOutcome(e.target.value as HomeVisitOutcome)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        >
                          {HOME_VISIT_OUTCOMES.map((out) => (
                            <option key={out} value={out}>
                              {out}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1">
                        <span className="block text-xs font-medium text-slate-700">Visit Date</span>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono tabular-nums"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="block text-xs font-medium text-slate-700">Time Slot</span>
                        <input
                          type="text"
                          value={editSlot}
                          onChange={(e) => setEditSlot(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="block text-xs font-medium text-slate-700">
                          Visiting Staff
                        </span>
                        <input
                          type="text"
                          value={editStaff}
                          onChange={(e) => setEditStaff(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="space-y-1">
                        <span className="block text-xs font-medium text-slate-700">
                          Home Study Environment
                        </span>
                        <textarea
                          rows={2}
                          value={editHomeEnv}
                          onChange={(e) => setEditHomeEnv(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="block text-xs font-medium text-slate-700">
                          Learning Support Notes
                        </span>
                        <textarea
                          rows={2}
                          value={editLearningNotes}
                          onChange={(e) => setEditLearningNotes(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="block text-xs font-medium text-slate-700">
                          Transport & Fee Notes
                        </span>
                        <textarea
                          rows={2}
                          value={editTransportNotes}
                          onChange={(e) => setEditTransportNotes(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingVisitId(null)}
                        className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={() => void handleSaveEdit(visit.id)}
                        className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap shrink-0"
                      >
                        {savingEdit ? 'Saving...' : 'Save Visit Updates'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
