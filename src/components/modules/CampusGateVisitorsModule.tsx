import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Download,
  LogOut,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  UserPlus,
  XCircle,
} from 'lucide-react';
import type {
  GatePassRecord,
  GatePassStatus,
  GatePassSubjectType,
  VisitorCategory,
  VisitorIdProofType,
  VisitorLogRecord,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import {
  canManageCampusGateAndVisitors,
  canViewVisitorRegister,
} from '../../utils/campusAdminEngine';
import { RAI_PLUS_LOGO_URL } from '../../utils/transportEngine';
import { pushToast } from '../ToastProvider';

interface CampusGateVisitorsModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatClock(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatShortDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const CampusGateVisitorsModule: React.FC<CampusGateVisitorsModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const isGateManager = canManageCampusGateAndVisitors(data.user.role);
  const canSeeVisitors = canViewVisitorRegister(data.user.role);
  const isParent = data.user.role === 'parent';

  const gatePasses = useMemo(() => data.gatePasses || [], [data.gatePasses]);
  const visitorLogs = useMemo(() => data.visitorLogs || [], [data.visitorLogs]);

  const [section, setSection] = useState<'gate_pass' | 'visitors'>('gate_pass');
  const [searchQuery, setSearchQuery] = useState('');
  const [gateFilter, setGateFilter] = useState<'All' | GatePassStatus>('All');
  const [visitorFilter, setVisitorFilter] = useState<'All' | 'On Campus' | 'Checked Out'>('All');

  // Gate Pass Creation Form
  const [showGateForm, setShowGateForm] = useState(false);
  const [subjectType, setSubjectType] = useState<GatePassSubjectType>(
    isParent || isGateManager ? 'Student Early Exit' : 'Staff Out-Pass',
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(data.students[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(data.staffProfiles?.[0]?.id || '');
  const [gpReason, setGpReason] = useState('');
  const [gpPickupName, setGpPickupName] = useState(
    isParent ? data.user.name : data.students[0]?.guardianName || '',
  );
  const [gpPickupRelation, setGpPickupRelation] = useState('Parent / Guardian');
  const [gpPickupPhone, setGpPickupPhone] = useState(data.students[0]?.guardianPhone || '');
  const [gpPickupId, setGpPickupId] = useState('');
  const [gpExitTime, setGpExitTime] = useState('12:30');
  const [gpReturnTime, setGpReturnTime] = useState('');
  const [gpAutoApprove, setGpAutoApprove] = useState(isGateManager);
  const [submittingGp, setSubmittingGp] = useState(false);

  // Visitor Check-In Form
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [visName, setVisName] = useState('');
  const [visPhone, setVisPhone] = useState('');
  const [visCategory, setVisCategory] = useState<VisitorCategory>('Parent / Guardian');
  const [visPurpose, setVisPurpose] = useState('');
  const [visHost, setVisHost] = useState('Principal Office');
  const [visDept, setVisDept] = useState('Administration');
  const [visIdType, setVisIdType] = useState<VisitorIdProofType>('Aadhaar Card');
  const [visIdNum, setVisIdNum] = useState('');
  const [visVehicle, setVisVehicle] = useState('');
  const [visBelongings, setVisBelongings] = useState('');
  const [submittingVis, setSubmittingVis] = useState(false);
  const [busyRecordId, setBusyRecordId] = useState<string | null>(null);

  const filteredGatePasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return gatePasses.filter((gp) => {
      if (gateFilter !== 'All' && gp.status !== gateFilter) return false;
      if (!q) return true;
      return (
        gp.passCode.toLowerCase().includes(q) ||
        (gp.studentName || '').toLowerCase().includes(q) ||
        (gp.staffName || '').toLowerCase().includes(q) ||
        gp.reason.toLowerCase().includes(q) ||
        (gp.authorizedPickupName || '').toLowerCase().includes(q)
      );
    });
  }, [gatePasses, gateFilter, searchQuery]);

  const filteredVisitors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return visitorLogs.filter((v) => {
      if (visitorFilter !== 'All' && v.status !== visitorFilter) return false;
      if (!q) return true;
      return (
        v.badgeCode.toLowerCase().includes(q) ||
        v.visitorName.toLowerCase().includes(q) ||
        v.phone.toLowerCase().includes(q) ||
        v.personToMeet.toLowerCase().includes(q) ||
        v.purpose.toLowerCase().includes(q) ||
        (v.vehicleNumber || '').toLowerCase().includes(q)
      );
    });
  }, [visitorLogs, visitorFilter, searchQuery]);

  const gateStats = useMemo(() => {
    const pending = gatePasses.filter((g) => g.status === 'Pending Approval').length;
    const approved = gatePasses.filter((g) => g.status === 'Approved').length;
    const exited = gatePasses.filter((g) => g.status === 'Exited Campus').length;
    const returned = gatePasses.filter((g) => g.status === 'Returned').length;
    return { pending, approved, exited, returned };
  }, [gatePasses]);

  const visitorStats = useMemo(() => {
    const onCampus = visitorLogs.filter((v) => v.status === 'On Campus').length;
    const checkedOut = visitorLogs.filter((v) => v.status === 'Checked Out').length;
    const durations = visitorLogs
      .map((v) => v.durationMinutes)
      .filter((m): m is number => typeof m === 'number' && m > 0);
    const avgDuration =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
    return { total: visitorLogs.length, onCampus, checkedOut, avgDuration };
  }, [visitorLogs]);

  async function handleCreateGatePass(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingGp(true);
    try {
      await apiRequest(
        '/api/gate-passes',
        {
          method: 'POST',
          body: JSON.stringify({
            subjectType,
            studentId: subjectType === 'Student Early Exit' ? selectedStudentId : undefined,
            staffId: subjectType === 'Staff Out-Pass' ? selectedStaffId : undefined,
            reason: gpReason,
            authorizedPickupName: subjectType === 'Student Early Exit' ? gpPickupName : undefined,
            pickupRelation: subjectType === 'Student Early Exit' ? gpPickupRelation : undefined,
            pickupPhone: subjectType === 'Student Early Exit' ? gpPickupPhone : undefined,
            pickupIdNumber: subjectType === 'Student Early Exit' ? gpPickupId : undefined,
            expectedExitTime: gpExitTime,
            expectedReturnTime: gpReturnTime || undefined,
            autoApprove: isGateManager ? gpAutoApprove : false,
          }),
        },
        token,
      );
      setGpReason('');
      setGpPickupId('');
      setShowGateForm(false);
      await onRefresh();
      pushToast('Digital gate pass logged successfully.', 'success');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to issue gate pass.', 'error');
    } finally {
      setSubmittingGp(false);
    }
  }

  async function handleUpdateGatePassStatus(passId: string, status: GatePassStatus) {
    setBusyRecordId(passId);
    try {
      await apiRequest(
        `/api/gate-passes/${encodeURIComponent(passId)}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        token,
      );
      await onRefresh();
      pushToast(`Gate pass updated to ${status}.`, 'success');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to update gate pass.', 'error');
    } finally {
      setBusyRecordId(null);
    }
  }

  async function handleVisitorCheckIn(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingVis(true);
    try {
      await apiRequest(
        '/api/visitors/check-in',
        {
          method: 'POST',
          body: JSON.stringify({
            visitorName: visName,
            phone: visPhone,
            category: visCategory,
            purpose: visPurpose,
            personToMeet: visHost,
            department: visDept,
            idProofType: visIdType,
            idProofNumber: visIdNum,
            vehicleNumber: visVehicle,
            belongingsNote: visBelongings,
          }),
        },
        token,
      );
      setVisName('');
      setVisPhone('');
      setVisPurpose('');
      setVisIdNum('');
      setVisVehicle('');
      setVisBelongings('');
      setShowVisitorForm(false);
      await onRefresh();
      pushToast('Visitor checked in and digital badge generated.', 'success');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to check in visitor.', 'error');
    } finally {
      setSubmittingVis(false);
    }
  }

  async function handleVisitorCheckOut(visitorId: string) {
    setBusyRecordId(visitorId);
    try {
      await apiRequest(
        `/api/visitors/${encodeURIComponent(visitorId)}/check-out`,
        { method: 'PATCH' },
        token,
      );
      await onRefresh();
      pushToast('Visitor checked out and visit duration recorded.', 'success');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to check out visitor.', 'error');
    } finally {
      setBusyRecordId(null);
    }
  }

  function handleDownloadGatePassSlip(gp: GatePassRecord) {
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Digital Gate Pass - ${escapeHtml(gp.passCode)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; background: #f8fafc; padding: 28px; }
    .slip { max-width: 620px; margin: 0 auto; background: #fff; border: 2px solid #142B46; border-radius: 10px; padding: 24px; }
    .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 16px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid #d6b66d; }
    .code { font-family: ui-monospace, monospace; font-size: 16px; font-weight: 700; color: #142B46; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 16px; font-size: 13px; margin-bottom: 16px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 13px; }
    .foot { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #475569; }
  </style>
</head>
<body>
  <div class="slip">
    <div class="head">
      <div class="brand">
        <img src="${RAI_PLUS_LOGO_URL}" alt="Rai Plus Logo" />
        <div>
          <div style="font-weight:700;color:#142B46;">${escapeHtml(data.activeSchool.name)}</div>
          <div style="font-size:12px;color:#475569;">Official Digital Gate Pass · ${escapeHtml(gp.subjectType)}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div class="code">${escapeHtml(gp.passCode)}</div>
        <div style="font-size:12px;color:#475569;">Status: ${escapeHtml(gp.status)}</div>
      </div>
    </div>
    <div class="grid">
      <div><strong>Subject:</strong> ${escapeHtml(gp.studentName || gp.staffName || '—')}</div>
      <div><strong>Class / Role:</strong> ${escapeHtml(gp.classSection || gp.staffDesignation || '—')}</div>
      <div><strong>Expected Exit:</strong> ${escapeHtml(gp.expectedExitTime)}</div>
      <div><strong>Expected Return:</strong> ${escapeHtml(gp.expectedReturnTime || 'One-Way Exit')}</div>
      ${
        gp.authorizedPickupName
          ? `<div><strong>Authorized Pickup:</strong> ${escapeHtml(gp.authorizedPickupName)} (${escapeHtml(gp.pickupRelation || 'Guardian')})</div>
             <div><strong>Pickup Phone / ID:</strong> ${escapeHtml(gp.pickupPhone || '—')} · ${escapeHtml(gp.pickupIdMasked || 'Verified')}</div>`
          : ''
      }
      <div><strong>Approved By:</strong> ${escapeHtml(gp.approvedByName || 'Pending')}</div>
      <div><strong>Issued On:</strong> ${escapeHtml(formatShortDate(gp.createdAt))}</div>
    </div>
    <div class="box"><strong>Reason:</strong> ${escapeHtml(gp.reason)}</div>
    <div class="foot">
      <span>Security Gate Verification Signature</span>
      <span>Principal / Admin Digital Authorization</span>
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GatePass_${gp.passCode}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleDownloadVisitorBadge(v: VisitorLogRecord) {
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Visitor Pass - ${escapeHtml(v.badgeCode)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; background: #f8fafc; padding: 28px; }
    .badge { max-width: 440px; margin: 0 auto; background: #fff; border: 2px solid #142B46; border-radius: 10px; padding: 20px; }
    .top { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 12px; }
    .top img { width: 36px; height: 36px; border-radius: 6px; border: 1px solid #d6b66d; object-fit: cover; }
    .code { font-family: ui-monospace, monospace; font-size: 16px; font-weight: 700; color: #142B46; }
    .row { font-size: 13px; margin: 6px 0; }
  </style>
</head>
<body>
  <div class="badge">
    <div class="top">
      <div style="display:flex;align-items:center;gap:10px;">
        <img src="${RAI_PLUS_LOGO_URL}" alt="Rai Plus Logo" />
        <div>
          <div style="font-weight:700;font-size:14px;">${escapeHtml(data.activeSchool.name)}</div>
          <div style="font-size:11px;color:#475569;">CAMPUS VISITOR PASS</div>
        </div>
      </div>
      <div class="code">${escapeHtml(v.badgeCode)}</div>
    </div>
    <div class="row"><strong>Visitor:</strong> ${escapeHtml(v.visitorName)} (${escapeHtml(v.category)})</div>
    <div class="row"><strong>Phone:</strong> ${escapeHtml(v.phone)}</div>
    <div class="row"><strong>Meeting:</strong> ${escapeHtml(v.personToMeet)}${v.department ? ` · ${escapeHtml(v.department)}` : ''}</div>
    <div class="row"><strong>Purpose:</strong> ${escapeHtml(v.purpose)}</div>
    <div class="row"><strong>ID Verified:</strong> ${escapeHtml(v.idProofType)} (${escapeHtml(v.idProofMasked)})</div>
    ${v.vehicleNumber ? `<div class="row"><strong>Vehicle:</strong> ${escapeHtml(v.vehicleNumber)}</div>` : ''}
    <div class="row"><strong>Check-In:</strong> ${escapeHtml(formatShortDate(v.checkInAt))} · ${escapeHtml(formatClock(v.checkInAt))}</div>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VisitorBadge_${v.badgeCode}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleExportVisitorsCsv() {
    const header = [
      'Badge Code',
      'Visitor Name',
      'Phone',
      'Category',
      'Person To Meet',
      'Purpose',
      'ID Proof Type',
      'Masked ID',
      'Vehicle',
      'Check-In',
      'Check-Out',
      'Duration (min)',
      'Status',
    ];
    const rows = filteredVisitors.map((v) => [
      v.badgeCode,
      v.visitorName,
      v.phone,
      v.category,
      v.personToMeet,
      v.purpose,
      v.idProofType,
      v.idProofMasked,
      v.vehicleNumber || '',
      v.checkInAt,
      v.checkOutAt || '',
      v.durationMinutes ?? '',
      v.status,
    ]);
    const csv = [header, ...rows]
      .map((line) => line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Visitors_Register_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Paperless Campus Security · Verifiable Pass Codes &amp; Audit-Logged Check-In / Out
          </p>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">
            {canSeeVisitors
              ? 'Digital Gate Pass & Visitors Register'
              : 'Digital Gate Pass'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {section === 'gate_pass' && data.user.role !== 'student' && (
            <button
              type="button"
              onClick={() => setShowGateForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              {isParent
                ? 'Request Early Pickup Pass'
                : isGateManager
                  ? 'Issue Digital Gate Pass'
                  : 'Request Staff Out-Pass'}
            </button>
          )}
          {section === 'visitors' && canSeeVisitors && (
            <button
              type="button"
              onClick={() => setShowVisitorForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] transition-colors whitespace-nowrap shrink-0"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Check In Visitor
            </button>
          )}
        </div>
      </div>

      {/* Mode Switch + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setSection('gate_pass')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              section === 'gate_pass'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Digital Gate Pass ({gatePasses.length})
          </button>
          {canSeeVisitors && (
            <button
              type="button"
              onClick={() => setSection('visitors')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                section === 'visitors'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visitors Register ({visitorStats.onCampus} On Campus)
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                section === 'gate_pass'
                  ? 'Search pass code, student, staff...'
                  : 'Search badge, visitor, phone, host...'
              }
              className="w-60 rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400"
            />
          </div>
          {section === 'visitors' && canSeeVisitors && (
            <button
              type="button"
              onClick={handleExportVisitorsCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* SECTION A: DIGITAL GATE PASS */}
      {section === 'gate_pass' && (
        <div className="space-y-5">
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Pending Approval</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-amber-700 mt-1">
                {gateStats.pending}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Approved (Ready at Gate)</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-blue-800 mt-1">
                {gateStats.approved}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Exited Campus</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
                {gateStats.exited}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Returned / Closed</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-emerald-700 mt-1">
                {gateStats.returned}
              </p>
            </div>
          </div>

          {/* Issue / Request Gate Pass Form */}
          {showGateForm && (
            <form
              onSubmit={handleCreateGatePass}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {isParent
                    ? 'Request Student Early Pickup Pass'
                    : isGateManager
                      ? 'Issue Digital Gate Pass'
                      : 'Request Staff Out-Pass'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGateForm(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>

              {isGateManager && (
                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {(['Student Early Exit', 'Staff Out-Pass'] as GatePassSubjectType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSubjectType(t)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        subjectType === t
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {subjectType === 'Student Early Exit' ? (
                  <>
                    <label className="space-y-1">
                      <span className="font-medium text-slate-700">Student</span>
                      <select
                        required
                        value={selectedStudentId}
                        onChange={(e) => {
                          const sid = e.target.value;
                          setSelectedStudentId(sid);
                          const st = data.students.find((s) => s.id === sid);
                          if (st) {
                            if (!isParent) setGpPickupName(st.guardianName || '');
                            setGpPickupPhone(st.guardianPhone || '');
                          }
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                      >
                        {data.students.slice(0, 120).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.classSection} · {s.admissionNo})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="font-medium text-slate-700">Authorized Pickup Name</span>
                      <input
                        required
                        value={gpPickupName}
                        onChange={(e) => setGpPickupName(e.target.value)}
                        placeholder="Father / Mother / Guardian Name"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="font-medium text-slate-700">Relationship</span>
                      <input
                        value={gpPickupRelation}
                        onChange={(e) => setGpPickupRelation(e.target.value)}
                        placeholder="Father / Mother / Uncle"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="font-medium text-slate-700">Pickup Mobile Number</span>
                      <input
                        required
                        value={gpPickupPhone}
                        onChange={(e) => setGpPickupPhone(e.target.value)}
                        placeholder="+91 98XXX XXXXX"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="font-medium text-slate-700">ID Last 4 Digits (Auto-Masked)</span>
                      <input
                        value={gpPickupId}
                        onChange={(e) => setGpPickupId(e.target.value)}
                        placeholder="e.g., 4821"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                      />
                    </label>
                  </>
                ) : (
                  isGateManager && (
                    <label className="space-y-1">
                      <span className="font-medium text-slate-700">Staff Member</span>
                      <select
                        value={selectedStaffId}
                        onChange={(e) => setSelectedStaffId(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                      >
                        {(data.staffProfiles || []).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.designation})
                          </option>
                        ))}
                      </select>
                    </label>
                  )
                )}

                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Expected Exit Time</span>
                  <input
                    type="time"
                    required
                    value={gpExitTime}
                    onChange={(e) => setGpExitTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                </label>

                {subjectType === 'Staff Out-Pass' && (
                  <label className="space-y-1">
                    <span className="font-medium text-slate-700">Expected Return Time</span>
                    <input
                      type="time"
                      value={gpReturnTime}
                      onChange={(e) => setGpReturnTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                    />
                  </label>
                )}

                <label className="space-y-1 sm:col-span-2 lg:col-span-3">
                  <span className="font-medium text-slate-700">Reason for Gate Pass</span>
                  <input
                    required
                    value={gpReason}
                    onChange={(e) => setGpReason(e.target.value)}
                    placeholder="Medical appointment, official board work, family emergency..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {isGateManager ? (
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={gpAutoApprove}
                      onChange={(e) => setGpAutoApprove(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    Approve immediately for Security Gate exit
                  </label>
                ) : (
                  <span className="text-xs text-slate-500">
                    Submitted requests go directly to Principal / School Office for digital approval.
                  </span>
                )}
                <button
                  type="submit"
                  disabled={submittingGp}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-60"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {submittingGp ? 'Submitting...' : 'Create Digital Gate Pass'}
                </button>
              </div>
            </form>
          )}

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              ['All', 'Pending Approval', 'Approved', 'Exited Campus', 'Returned', 'Rejected'] as const
            ).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setGateFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  gateFilter === st
                    ? 'bg-[#142B46] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Gate Pass Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {filteredGatePasses.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No digital gate passes recorded for this filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Pass Code &amp; Subject</th>
                      <th className="py-3 px-4">Pickup / Reason</th>
                      <th className="py-3 px-4">Timings</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Gate Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredGatePasses.map((gp) => {
                      const statusTone =
                        gp.status === 'Approved'
                          ? 'text-blue-800 font-semibold'
                          : gp.status === 'Exited Campus'
                            ? 'text-slate-900 font-semibold'
                            : gp.status === 'Returned'
                              ? 'text-emerald-700 font-semibold'
                              : gp.status === 'Rejected'
                                ? 'text-rose-700 font-semibold'
                                : 'text-amber-700 font-semibold';
                      return (
                        <tr key={gp.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <p className="font-mono font-bold text-[#142B46]">{gp.passCode}</p>
                            <p className="font-semibold text-slate-900 mt-0.5">
                              {gp.studentName || gp.staffName}
                            </p>
                            <p className="text-slate-500">
                              {gp.subjectType} · {gp.classSection || gp.staffDesignation || 'Campus'}
                            </p>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <p className="text-slate-800">{gp.reason}</p>
                            {gp.authorizedPickupName && (
                              <p className="text-slate-500 mt-0.5">
                                Pickup: {gp.authorizedPickupName} ({gp.pickupRelation}) ·{' '}
                                {gp.pickupPhone} · ID {gp.pickupIdMasked}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                            <div>Planned: {gp.expectedExitTime}</div>
                            {gp.actualExitAt && (
                              <div className="text-slate-500">
                                Exited: {formatClock(gp.actualExitAt)}
                              </div>
                            )}
                            {gp.actualReturnAt && (
                              <div className="text-emerald-700">
                                Returned: {formatClock(gp.actualReturnAt)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className={statusTone}>{gp.status}</p>
                            {gp.approvedByName && (
                              <p className="text-slate-500 mt-0.5">By {gp.approvedByName}</p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex flex-wrap justify-end gap-1.5">
                              {isGateManager && gp.status === 'Pending Approval' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={busyRecordId === gp.id}
                                    onClick={() => handleUpdateGatePassStatus(gp.id, 'Approved')}
                                    className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-800"
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyRecordId === gp.id}
                                    onClick={() => handleUpdateGatePassStatus(gp.id, 'Rejected')}
                                    className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-white px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                  >
                                    <XCircle className="h-3 w-3" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {isGateManager && gp.status === 'Approved' && (
                                <button
                                  type="button"
                                  disabled={busyRecordId === gp.id}
                                  onClick={() => handleUpdateGatePassStatus(gp.id, 'Exited Campus')}
                                  className="inline-flex items-center gap-1 rounded-md bg-[#142B46] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1E3B5C]"
                                >
                                  <LogOut className="h-3 w-3" />
                                  Mark Exited
                                </button>
                              )}
                              {isGateManager && gp.status === 'Exited Campus' && (
                                <button
                                  type="button"
                                  disabled={busyRecordId === gp.id}
                                  onClick={() => handleUpdateGatePassStatus(gp.id, 'Returned')}
                                  className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-800"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Mark Returned
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDownloadGatePassSlip(gp)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                <Printer className="h-3 w-3" />
                                Slip
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
          </div>
        </div>
      )}

      {/* SECTION B: DIGITAL VISITORS REGISTER (Gate / Admin Roles Only) */}
      {section === 'visitors' && canSeeVisitors && (
        <div className="space-y-5">
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Currently On Campus</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-amber-700 mt-1">
                {visitorStats.onCampus}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Total Digital Entries</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
                {visitorStats.total}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Completed Check-Outs</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-emerald-700 mt-1">
                {visitorStats.checkedOut}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Avg. Visit Duration</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
                {visitorStats.avgDuration > 0 ? `${visitorStats.avgDuration}m` : '—'}
              </p>
            </div>
          </div>

          {/* Visitor Check-In Form */}
          {showVisitorForm && (
            <form
              onSubmit={handleVisitorCheckIn}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Digital Visitor Check-In
                </h3>
                <button
                  type="button"
                  onClick={() => setShowVisitorForm(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Visitor Full Name</span>
                  <input
                    required
                    value={visName}
                    onChange={(e) => setVisName(e.target.value)}
                    placeholder="Full name as on ID"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Mobile Number</span>
                  <input
                    required
                    value={visPhone}
                    onChange={(e) => setVisPhone(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Visitor Category</span>
                  <select
                    value={visCategory}
                    onChange={(e) => setVisCategory(e.target.value as VisitorCategory)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                  >
                    <option value="Parent / Guardian">Parent / Guardian</option>
                    <option value="Official / Inspector">Official / Inspector</option>
                    <option value="Vendor / Delivery">Vendor / Delivery</option>
                    <option value="Interview / Guest">Interview / Guest</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Host / Person to Meet</span>
                  <input
                    required
                    value={visHost}
                    onChange={(e) => setVisHost(e.target.value)}
                    placeholder="Principal / Accounts / Class Teacher"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">ID Proof Type</span>
                  <select
                    value={visIdType}
                    onChange={(e) => setVisIdType(e.target.value as VisitorIdProofType)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Official / Company ID">Official / Company ID</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">ID Number (Stored Masked)</span>
                  <input
                    value={visIdNum}
                    onChange={(e) => setVisIdNum(e.target.value)}
                    placeholder="Last 4 digits or ID no."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Vehicle No. (Optional)</span>
                  <input
                    value={visVehicle}
                    onChange={(e) => setVisVehicle(e.target.value)}
                    placeholder="HR-14-AB-1234"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono uppercase"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Department / Block</span>
                  <input
                    value={visDept}
                    onChange={(e) => setVisDept(e.target.value)}
                    placeholder="Admissions / Main Block"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 sm:col-span-2 lg:col-span-3">
                  <span className="font-medium text-slate-700">Purpose of Visit</span>
                  <input
                    required
                    value={visPurpose}
                    onChange={(e) => setVisPurpose(e.target.value)}
                    placeholder="Admission inquiry, fee consultation, lab delivery..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Items / Parcels</span>
                  <input
                    value={visBelongings}
                    onChange={(e) => setVisBelongings(e.target.value)}
                    placeholder="Laptop / 2 parcels"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submittingVis}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-60"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  {submittingVis ? 'Checking In...' : 'Check In & Issue Visitor Badge'}
                </button>
              </div>
            </form>
          )}

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5">
            {(['All', 'On Campus', 'Checked Out'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setVisitorFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  visitorFilter === st
                    ? 'bg-[#142B46] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Visitors Register Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {filteredVisitors.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No visitor entries found for this filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Badge &amp; Visitor</th>
                      <th className="py-3 px-4">Host &amp; Purpose</th>
                      <th className="py-3 px-4">ID &amp; Vehicle</th>
                      <th className="py-3 px-4">Check-In / Out</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVisitors.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <p className="font-mono font-bold text-[#142B46]">{v.badgeCode}</p>
                          <p className="font-semibold text-slate-900 mt-0.5">{v.visitorName}</p>
                          <p className="text-slate-500">
                            {v.category} · {v.phone}
                          </p>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-medium text-slate-900">
                            {v.personToMeet}
                            {v.department ? ` · ${v.department}` : ''}
                          </p>
                          <p className="text-slate-600 mt-0.5">{v.purpose}</p>
                          {v.belongingsNote && (
                            <p className="text-slate-500 mt-0.5">Items: {v.belongingsNote}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                          <div>{v.idProofType}</div>
                          <div className="text-slate-500">{v.idProofMasked}</div>
                          {v.vehicleNumber && (
                            <div className="text-slate-600 mt-0.5">{v.vehicleNumber}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums">
                          <div className="text-slate-800">
                            In: {formatClock(v.checkInAt)} ({formatShortDate(v.checkInAt)})
                          </div>
                          {v.status === 'Checked Out' ? (
                            <div className="text-emerald-700 font-medium mt-0.5">
                              Out: {formatClock(v.checkOutAt)} ({v.durationMinutes}m)
                            </div>
                          ) : (
                            <div className="text-amber-700 font-semibold mt-0.5">On Campus</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {v.status === 'On Campus' && (
                              <button
                                type="button"
                                disabled={busyRecordId === v.id}
                                onClick={() => handleVisitorCheckOut(v.id)}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-800 whitespace-nowrap"
                              >
                                <LogOut className="h-3 w-3" />
                                Check Out
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDownloadVisitorBadge(v)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                            >
                              <Printer className="h-3 w-3" />
                              Badge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
