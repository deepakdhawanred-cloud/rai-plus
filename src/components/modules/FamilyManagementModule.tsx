import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  GitMerge,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Split,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type {
  DismissedPartialMatch,
  FamilyAccount,
  FeeLedgerAccount,
  PartialSiblingCandidate,
  StudentRecord,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { detectPartialContactMatches } from '../../utils/familyAccountEngine';

interface FamilyManagementModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type FamilyTabKey = 'partial' | 'alerts' | 'merged' | 'dismissed';

const INR = new Intl.NumberFormat('en-IN');

function formatInr(value: number): string {
  return `₹${INR.format(Math.round(value || 0))}`;
}

interface StagingDirectoryItem {
  nodeKey: string;
  studentId?: string;
  feeAccountId?: string;
  admissionNo: string;
  studentName: string;
  classSection: string;
  guardianName: string;
  contactNo: string;
  parentEmail?: string;
  address: string;
  remarks: string;
  totalDemandInr: number;
  paidAmountInr: number;
  balanceFeesInr: number;
  existingFamilyCode?: string;
}

export const FamilyManagementModule: React.FC<FamilyManagementModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<FamilyTabKey>('partial');
  const [searchQuery, setSearchQuery] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<'ALL' | 'HIGH'>('ALL');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  // Inline review/merge state for a partial candidate
  const [reviewCandidateId, setReviewCandidateId] = useState<string | null>(null);
  const [reviewPrimaryKey, setReviewPrimaryKey] = useState<string>('');
  const [reviewGuardianName, setReviewGuardianName] = useState('');
  const [reviewPhone, setReviewPhone] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewAddress, setReviewAddress] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  // Inline edit state for a merged FamilyAccount
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [editGuardianName, setEditGuardianName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPrimaryAccId, setEditPrimaryAccId] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [syncToMembers, setSyncToMembers] = useState(true);

  // Manual Merge Builder modal state
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderTargetFamily, setBuilderTargetFamily] = useState<FamilyAccount | null>(null);
  const [builderSearch, setBuilderSearch] = useState('');
  const [stagedKeys, setStagedKeys] = useState<string[]>([]);
  const [builderPrimaryKey, setBuilderPrimaryKey] = useState('');
  const [builderGuardianName, setBuilderGuardianName] = useState('');
  const [builderPhone, setBuilderPhone] = useState('');
  const [builderEmail, setBuilderEmail] = useState('');
  const [builderAddress, setBuilderAddress] = useState('');
  const [builderNotes, setBuilderNotes] = useState('');

  const feeAccounts = data.feeAccounts || [];
  const familyAccounts = data.familyAccounts || [];
  const dismissedPartials: DismissedPartialMatch[] = data.dismissedPartialMatches || [];

  const partialCandidates = useMemo<PartialSiblingCandidate[]>(() => {
    return detectPartialContactMatches({
      schoolId: data.activeSchool.id,
      students: data.students,
      feeAccounts,
      familyAccounts,
      dismissedPartialMatches: dismissedPartials,
    });
  }, [data.activeSchool.id, data.students, feeAccounts, familyAccounts, dismissedPartials]);

  const alertFamilies = useMemo(
    () => familyAccounts.filter((f) => f.status === 'Alert'),
    [familyAccounts],
  );
  const mergedFamilies = useMemo(
    () => familyAccounts.filter((f) => f.status === 'Merged'),
    [familyAccounts],
  );
  const dismissedFamilies = useMemo(
    () => familyAccounts.filter((f) => f.status === 'Dismissed'),
    [familyAccounts],
  );

  // Unified searchable directory of students + ledger accounts for Manual Merge Builder
  const stagingDirectory = useMemo<StagingDirectoryItem[]>(() => {
    const schoolAccountsByStudentId = new Map<string, FeeLedgerAccount>();
    const usedAccIds = new Set<string>();
    for (const acc of feeAccounts) {
      if (acc.studentId) {
        schoolAccountsByStudentId.set(acc.studentId, acc);
      }
    }
    const famById = new Map<string, FamilyAccount>();
    for (const f of familyAccounts) {
      if (f.status !== 'Dismissed') famById.set(f.id, f);
    }

    const items: StagingDirectoryItem[] = [];
    for (const st of data.students as StudentRecord[]) {
      const acc = schoolAccountsByStudentId.get(st.id);
      if (acc) usedAccIds.add(acc.id);
      const fam = st.familyAccountId ? famById.get(st.familyAccountId) : undefined;
      items.push({
        nodeKey: `stu:${st.id}`,
        studentId: st.id,
        feeAccountId: acc?.id,
        admissionNo: st.admissionNo,
        studentName: st.name,
        classSection: st.classSection,
        guardianName: st.guardianName || acc?.fatherName || '',
        contactNo: st.guardianPhone || acc?.contactNo || '',
        parentEmail: st.guardianEmail,
        address: st.address || acc?.address || '',
        remarks: acc?.remarks || '',
        totalDemandInr: acc
          ? acc.lastYearBalanceInr + acc.yearlyDemandInr - acc.settleAmountInr
          : st.totalFeeAnnualInr,
        paidAmountInr: acc ? acc.paidAmountInr : Math.max(0, st.totalFeeAnnualInr - st.feeBalanceInr),
        balanceFeesInr: acc ? acc.balanceFeesInr : st.feeBalanceInr,
        existingFamilyCode: fam?.familyCode,
      });
    }

    for (const acc of feeAccounts) {
      if (usedAccIds.has(acc.id)) continue;
      const fam = acc.familyAccountId ? famById.get(acc.familyAccountId) : undefined;
      items.push({
        nodeKey: `acc:${acc.id}`,
        feeAccountId: acc.id,
        admissionNo: acc.admissionNo,
        studentName: acc.studentName,
        classSection: acc.className,
        guardianName: acc.fatherName,
        contactNo: acc.contactNo,
        address: acc.address,
        remarks: acc.remarks,
        totalDemandInr: acc.lastYearBalanceInr + acc.yearlyDemandInr - acc.settleAmountInr,
        paidAmountInr: acc.paidAmountInr,
        balanceFeesInr: acc.balanceFeesInr,
        existingFamilyCode: fam?.familyCode,
      });
    }

    return items.sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [data.students, feeAccounts, familyAccounts]);

  const directoryByKey = useMemo(() => {
    const m = new Map<string, StagingDirectoryItem>();
    for (const item of stagingDirectory) m.set(item.nodeKey, item);
    return m;
  }, [stagingDirectory]);

  const filteredPartials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return partialCandidates.filter((cand) => {
      if (confidenceFilter === 'HIGH' && cand.matchTier !== 'High') return false;
      if (!q) return true;
      return (
        cand.suggestedGuardianName.toLowerCase().includes(q) ||
        cand.suggestedPhone.toLowerCase().includes(q) ||
        cand.suggestedAddress.toLowerCase().includes(q) ||
        cand.partialSignals.some((s) => s.toLowerCase().includes(q)) ||
        cand.members.some(
          (m) =>
            m.studentName.toLowerCase().includes(q) ||
            m.guardianName.toLowerCase().includes(q) ||
            m.contactNo.toLowerCase().includes(q) ||
            m.admissionNo.toLowerCase().includes(q) ||
            m.address.toLowerCase().includes(q),
        )
      );
    });
  }, [partialCandidates, searchQuery, confidenceFilter]);

  const filterFamilyList = (list: FamilyAccount[]) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (f) =>
        f.familyCode.toLowerCase().includes(q) ||
        f.guardianName.toLowerCase().includes(q) ||
        f.guardianPhone.toLowerCase().includes(q) ||
        (f.address || '').toLowerCase().includes(q) ||
        f.members.some(
          (m) =>
            m.studentName.toLowerCase().includes(q) ||
            m.admissionNo.toLowerCase().includes(q) ||
            m.classSection.toLowerCase().includes(q),
        ),
    );
  };

  const filteredAlerts = useMemo(() => filterFamilyList(alertFamilies), [alertFamilies, searchQuery]);
  const filteredMerged = useMemo(() => filterFamilyList(mergedFamilies), [mergedFamilies, searchQuery]);
  const filteredDismissedFamilies = useMemo(
    () => filterFamilyList(dismissedFamilies),
    [dismissedFamilies, searchQuery],
  );
  const filteredDismissedPartials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return dismissedPartials;
    return dismissedPartials.filter(
      (d) =>
        d.summaryLabel.toLowerCase().includes(q) ||
        d.partialSignals.some((s) => s.toLowerCase().includes(q)),
    );
  }, [dismissedPartials, searchQuery]);

  const builderMatches = useMemo(() => {
    const q = builderSearch.trim().toLowerCase();
    const stagedSet = new Set(stagedKeys);
    const available = stagingDirectory.filter((item) => !stagedSet.has(item.nodeKey));
    if (!q) return available.slice(0, 18);
    return available
      .filter(
        (item) =>
          item.studentName.toLowerCase().includes(q) ||
          item.admissionNo.toLowerCase().includes(q) ||
          item.guardianName.toLowerCase().includes(q) ||
          item.contactNo.toLowerCase().includes(q) ||
          item.classSection.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [stagingDirectory, builderSearch, stagedKeys]);

  const stagedItems = useMemo(
    () => stagedKeys.map((k) => directoryByKey.get(k)).filter((x): x is StagingDirectoryItem => Boolean(x)),
    [stagedKeys, directoryByKey],
  );

  const summaryStats = useMemo(() => {
    const highConfidenceCount = partialCandidates.filter((c) => c.matchTier === 'High').length;
    const mergedMembersCount = mergedFamilies.reduce((s, f) => s + f.members.length, 0);
    const mergedBalanceInr = mergedFamilies.reduce((s, f) => s + f.totalBalanceInr, 0);
    const alertBalanceInr = alertFamilies.reduce((s, f) => s + f.totalBalanceInr, 0);
    return {
      partialCount: partialCandidates.length,
      highConfidenceCount,
      alertCount: alertFamilies.length,
      alertBalanceInr,
      mergedCount: mergedFamilies.length,
      mergedMembersCount,
      mergedBalanceInr,
    };
  }, [partialCandidates, alertFamilies, mergedFamilies]);

  function openInlineReview(cand: PartialSiblingCandidate) {
    if (reviewCandidateId === cand.id) {
      setReviewCandidateId(null);
      return;
    }
    const lead = cand.members[0];
    setReviewCandidateId(cand.id);
    setReviewPrimaryKey(lead?.nodeKey || '');
    setReviewGuardianName(cand.suggestedGuardianName);
    setReviewPhone(cand.suggestedPhone);
    setReviewEmail(cand.suggestedEmail || '');
    setReviewAddress(cand.suggestedAddress);
    setReviewNotes(`Manual review of partial match: ${cand.partialSignals[0] || 'Contact details'}`);
  }

  function openEditFamily(fam: FamilyAccount) {
    if (editingFamilyId === fam.id) {
      setEditingFamilyId(null);
      return;
    }
    setEditingFamilyId(fam.id);
    setEditGuardianName(fam.guardianName);
    setEditPhone(fam.guardianPhone);
    setEditEmail(fam.parentEmail || '');
    setEditAddress(fam.address || '');
    setEditPrimaryAccId(fam.primaryAccountId || fam.members[0]?.feeAccountId || '');
    setEditNotes(fam.manualNotes || '');
    setSyncToMembers(true);
  }

  function openManualBuilder(targetFamily?: FamilyAccount) {
    setBuilderTargetFamily(targetFamily ?? null);
    if (targetFamily) {
      const existingKeys = targetFamily.members
        .map((m) => (m.studentId ? `stu:${m.studentId}` : m.feeAccountId ? `acc:${m.feeAccountId}` : ''))
        .filter(Boolean);
      setStagedKeys(existingKeys);
      setBuilderPrimaryKey(
        targetFamily.primaryStudentId
          ? `stu:${targetFamily.primaryStudentId}`
          : targetFamily.primaryAccountId
            ? `acc:${targetFamily.primaryAccountId}`
            : existingKeys[0] || '',
      );
      setBuilderGuardianName(targetFamily.guardianName);
      setBuilderPhone(targetFamily.guardianPhone);
      setBuilderEmail(targetFamily.parentEmail || '');
      setBuilderAddress(targetFamily.address || '');
      setBuilderNotes(targetFamily.manualNotes || '');
    } else {
      setStagedKeys([]);
      setBuilderPrimaryKey('');
      setBuilderGuardianName('');
      setBuilderPhone('');
      setBuilderEmail('');
      setBuilderAddress('');
      setBuilderNotes('');
    }
    setBuilderSearch('');
    setBuilderOpen(true);
  }

  function addStagedKey(nodeKey: string) {
    if (stagedKeys.includes(nodeKey)) return;
    const item = directoryByKey.get(nodeKey);
    const next = [...stagedKeys, nodeKey];
    setStagedKeys(next);
    if (!builderPrimaryKey) setBuilderPrimaryKey(nodeKey);
    if (item) {
      if (!builderGuardianName && item.guardianName) setBuilderGuardianName(item.guardianName);
      if (!builderPhone && item.contactNo) setBuilderPhone(item.contactNo);
      if (!builderEmail && item.parentEmail) setBuilderEmail(item.parentEmail);
      if (!builderAddress && item.address) setBuilderAddress(item.address);
    }
  }

  async function handleRescanContacts() {
    setBusyKey('rescan');
    setBanner(null);
    try {
      const res = await apiRequest<{ familyAccounts: FamilyAccount[]; newlyDetectedCount: number }>(
        '/api/finance/family-accounts/detect',
        { method: 'POST' },
        token,
      );
      await onRefresh();
      setBanner({
        kind: 'success',
        text: `Contact scan complete: ${res.familyAccounts.length} unified family clusters synced (${res.newlyDetectedCount} newly detected).`,
      });
    } catch (err) {
      setBanner({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Unable to scan parent contacts.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleMergePartialCandidate(cand: PartialSiblingCandidate) {
    setBusyKey(`merge-partial:${cand.id}`);
    setBanner(null);
    try {
      const isExpanded = reviewCandidateId === cand.id;
      const primaryKey = isExpanded && reviewPrimaryKey ? reviewPrimaryKey : cand.members[0]?.nodeKey;
      const primaryMember = cand.members.find((m) => m.nodeKey === primaryKey) || cand.members[0];

      const studentIds = cand.members.map((m) => m.studentId).filter((id): id is string => Boolean(id));
      const accountIds = cand.members.map((m) => m.feeAccountId).filter((id): id is string => Boolean(id));

      const res = await apiRequest<{ familyAccount: FamilyAccount }>(
        '/api/finance/family-accounts/manual-merge',
        {
          method: 'POST',
          body: JSON.stringify({
            studentIds,
            accountIds,
            primaryStudentId: primaryMember?.studentId,
            primaryAccountId: primaryMember?.feeAccountId,
            guardianName: (isExpanded ? reviewGuardianName : cand.suggestedGuardianName).trim(),
            guardianPhone: (isExpanded ? reviewPhone : cand.suggestedPhone).trim(),
            parentEmail: (isExpanded ? reviewEmail : cand.suggestedEmail || '').trim(),
            address: (isExpanded ? reviewAddress : cand.suggestedAddress).trim(),
            manualNotes: isExpanded
              ? reviewNotes.trim()
              : `Merged from partial contact match (${cand.partialSignals.join('; ')})`,
            partialCandidateId: cand.id,
          }),
        },
        token,
      );

      setReviewCandidateId(null);
      await onRefresh();
      setBanner({
        kind: 'success',
        text: `Merged ${cand.members.length} sibling records into unified Family Account ${res.familyAccount.familyCode} (${res.familyAccount.guardianName}).`,
      });
    } catch (err) {
      setBanner({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Unable to merge partial sibling accounts.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDismissPartialCandidate(cand: PartialSiblingCandidate) {
    setBusyKey(`dismiss-partial:${cand.id}`);
    setBanner(null);
    try {
      await apiRequest(
        '/api/finance/family-accounts/partial-matches/dismiss',
        {
          method: 'POST',
          body: JSON.stringify({
            candidateId: cand.id,
            memberKeys: cand.memberKeys,
            summaryLabel: `${cand.suggestedGuardianName} — ${cand.members.map((m) => m.studentName).join(' + ')}`,
            partialSignals: cand.partialSignals,
          }),
        },
        token,
      );
      if (reviewCandidateId === cand.id) setReviewCandidateId(null);
      await onRefresh();
      setBanner({
        kind: 'success',
        text: `Dismissed partial contact candidate for ${cand.members.map((m) => m.studentName).join(' & ')}.`,
      });
    } catch (err) {
      setBanner({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Unable to dismiss partial match.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRestorePartial(candidateId: string) {
    setBusyKey(`restore-partial:${candidateId}`);
    setBanner(null);
    try {
      await apiRequest(
        '/api/finance/family-accounts/partial-matches/restore',
        {
          method: 'POST',
          body: JSON.stringify({ candidateId }),
        },
        token,
      );
      await onRefresh();
      setBanner({
        kind: 'success',
        text: 'Restored partial contact candidate back to review queue.',
      });
    } catch (err) {
      setBanner({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Unable to restore partial match.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleFamilyStatusAction(familyId: string, action: 'merge' | 'dismiss') {
    setBusyKey(`${action}:${familyId}`);
    setBanner(null);
    try {
      await apiRequest(
        `/api/finance/family-accounts/${familyId}/${action}`,
        { method: 'POST' },
        token,
      );
      await onRefresh();
      setBanner({
        kind: 'success',
        text:
          action === 'merge'
            ? 'Family account confirmed and merged for unified sibling billing.'
            : 'Sibling cluster moved to Dismissed.',
      });
    } catch (err) {
      setBanner({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Unable to update family status.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleSaveFamilyEdit(e: React.FormEvent, fam: FamilyAccount) {
    e.preventDefault();
    setBusyKey(`save-fam:${fam.id}`);
    setBanner(null);
    try {
      await apiRequest(
        `/api/finance/family-accounts/${fam.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            guardianName: editGuardianName.trim(),
            guardianPhone: editPhone.trim(),
            parentEmail: editEmail.trim(),
            address: editAddress.trim(),
            primaryAccountId: editPrimaryAccId || undefined,
            manualNotes: editNotes.trim(),
            syncContactToMembers: syncToMembers,
          }),
        },
        token,
      );
      setEditingFamilyId(null);
      await onRefresh();
      setBanner({
        kind: 'success',
        text: `Updated household contact details & primary billing for ${fam.familyCode}.`,
      });
    } catch (err) {
      setBanner({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Unable to update family account.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleUnmergeFamily(fam: FamilyAccount, removeStudentId?: string, removeAccountId?: string) {
    const key = removeAccountId || removeStudentId ? `remove:${fam.id}:${removeAccountId || removeStudentId}` : `unmerge:${fam.id}`;
    setBusyKey(key);
    setBanner(null);
    try {
      await apiRequest(
        `/api/finance/family-accounts/${fam.id}/unmerge`,
        {
          method: 'POST',
          body: JSON.stringify({ removeStudentId, removeAccountId }),
        },
        token,
      );
      await onRefresh();
      setBanner({
        kind: 'success',
        text:
          removeStudentId || removeAccountId
            ? `Removed sibling member from ${fam.familyCode}.`
            : `Unmerged ${fam.familyCode} back to individual student accounts.`,
      });
    } catch (err) {
      setBanner({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Unable to unmerge family account.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleSubmitManualBuilder(e: React.FormEvent) {
    e.preventDefault();
    if (stagedItems.length < 2) {
      setBanner({
        kind: 'error',
        text: 'Select at least 2 sibling students or fee accounts to merge.',
      });
      return;
    }

    setBusyKey('builder-merge');
    setBanner(null);
    try {
      const primaryItem = stagedItems.find((i) => i.nodeKey === builderPrimaryKey) || stagedItems[0];
      const studentIds = stagedItems.map((i) => i.studentId).filter((id): id is string => Boolean(id));
      const accountIds = stagedItems.map((i) => i.feeAccountId).filter((id): id is string => Boolean(id));

      const res = await apiRequest<{ familyAccount: FamilyAccount }>(
        '/api/finance/family-accounts/manual-merge',
        {
          method: 'POST',
          body: JSON.stringify({
            studentIds,
            accountIds,
            targetFamilyId: builderTargetFamily?.id,
            primaryStudentId: primaryItem?.studentId,
            primaryAccountId: primaryItem?.feeAccountId,
            guardianName: builderGuardianName.trim(),
            guardianPhone: builderPhone.trim(),
            parentEmail: builderEmail.trim(),
            address: builderAddress.trim(),
            manualNotes: builderNotes.trim() || 'Manual admin pairing via Family Management',
          }),
        },
        token,
      );
      setBuilderOpen(false);
      setActiveTab('merged');
      await onRefresh();
      setBanner({
        kind: 'success',
        text: `Merged ${stagedItems.length} sibling records into ${res.familyAccount.familyCode} (${res.familyAccount.guardianName}).`,
      });
    } catch (err) {
      setBanner({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Unable to complete manual family merge.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {data.activeSchool.name} · Session {data.activeSchool.session} · Household Ledger Governance
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
            Family Management &amp; Sibling Reconciliation
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Review partial parent contact matches (phone digit typos, shared multi-word guardian names, fuzzy localities),
            resolve ambiguous clusters side-by-side, and manually merge or split sibling billing accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={busyKey === 'rescan'}
            onClick={() => void handleRescanContacts()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busyKey === 'rescan' ? 'animate-spin' : ''}`} />
            {busyKey === 'rescan' ? 'Scanning...' : 'Re-Scan Contacts'}
          </button>
          <button
            type="button"
            onClick={() => openManualBuilder()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
          >
            <GitMerge className="h-3.5 w-3.5" />
            Manual Merge Builder
          </button>
        </div>
      </div>

      {banner && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-medium flex items-center justify-between gap-3 ${
            banner.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          <span>{banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-slate-500 hover:text-slate-900 whitespace-nowrap shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4-Column Summary KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Partial Contact Matches</p>
          <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {summaryStats.partialCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-amber-700 tabular-nums">
              {summaryStats.highConfidenceCount} high-confidence
            </span>{' '}
            awaiting manual review
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Auto-Detected Alerts</p>
          <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {summaryStats.alertCount}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {formatInr(summaryStats.alertBalanceInr)} unmerged balance
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Unified Family Accounts</p>
          <p className="font-mono text-2xl font-bold text-emerald-700 tabular-nums mt-1">
            {summaryStats.mergedCount}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {summaryStats.mergedMembersCount} synced sibling ledgers
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Merged Family Balance</p>
          <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {formatInr(summaryStats.mergedBalanceInr)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Combined pending fee dues across merged families
          </p>
        </div>
      </section>

      {/* Main Workspace Section */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Tabs Row */}
        <div className="border-b border-slate-200 px-6 flex items-center gap-7 overflow-x-auto">
          {(
            [
              { key: 'partial', label: 'Partial Contact Matches', count: partialCandidates.length },
              { key: 'alerts', label: 'Auto-Detected Alerts', count: alertFamilies.length },
              { key: 'merged', label: 'Merged Families', count: mergedFamilies.length },
              {
                key: 'dismissed',
                label: 'Dismissed',
                count: dismissedFamilies.length + dismissedPartials.length,
              },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`py-3.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  active
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono tabular-nums text-slate-500">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* Filter & Search Toolbar */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guardian, student, phone, locality..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'partial' && (
              <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setConfidenceFilter('ALL')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    confidenceFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Matches
                </button>
                <button
                  type="button"
                  onClick={() => setConfidenceFilter('HIGH')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    confidenceFilter === 'HIGH'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  High Confidence
                </button>
              </div>
            )}

            <span className="text-xs font-medium text-slate-500 tabular-nums whitespace-nowrap shrink-0">
              {activeTab === 'partial' && `Showing ${filteredPartials.length} of ${partialCandidates.length}`}
              {activeTab === 'alerts' && `Showing ${filteredAlerts.length} of ${alertFamilies.length}`}
              {activeTab === 'merged' && `Showing ${filteredMerged.length} of ${mergedFamilies.length}`}
              {activeTab === 'dismissed' &&
                `Showing ${filteredDismissedPartials.length + filteredDismissedFamilies.length} dismissed`}
            </span>
          </div>
        </div>

        {/* TAB 1: PARTIAL CONTACT MATCHES */}
        {activeTab === 'partial' && (
          <div>
            {filteredPartials.length === 0 ? (
              <div className="px-6 py-12 text-center space-y-3">
                <Users className="h-6 w-6 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-900">
                  No partial parent-contact matches pending review
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All high-signal partial contact overlaps have been reviewed, or adjust your search filter.
                  You can still pair any students manually using the Manual Merge Builder.
                </p>
                <button
                  type="button"
                  onClick={() => openManualBuilder()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Open Manual Merge Builder
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredPartials.map((cand) => {
                  const isReviewing = reviewCandidateId === cand.id;
                  const isBusy =
                    busyKey === `merge-partial:${cand.id}` || busyKey === `dismiss-partial:${cand.id}`;

                  return (
                    <div key={cand.id} className="p-6 space-y-4">
                      {/* Candidate Top Row */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                            <span>{cand.suggestedGuardianName}</span>
                            <span className="text-slate-300" aria-hidden="true">
                              ·
                            </span>
                            <span
                              className={`font-mono text-xs font-semibold tabular-nums ${
                                cand.matchTier === 'High' ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {cand.confidencePct}% Match ({cand.matchTier} Confidence)
                            </span>
                            <span className="text-slate-300" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-xs font-medium text-slate-600 tabular-nums">
                              {cand.members.length} sibling candidates
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            <span className="font-semibold text-blue-900">Partial Contact Signals: </span>
                            {cand.partialSignals.join(' · ')}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <div className="text-right pr-2">
                            <p className="text-[11px] font-medium text-slate-500">Combined Balance</p>
                            <p className="font-mono text-base font-bold text-slate-900 tabular-nums">
                              {formatInr(cand.combinedBalanceInr)}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => openInlineReview(cand)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
                          >
                            {isReviewing ? 'Close Editor' : 'Review & Customize'}
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleMergePartialCandidate(cand)}
                            className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                          >
                            {busyKey === `merge-partial:${cand.id}`
                              ? 'Merging...'
                              : 'Approve & Merge'}
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleDismissPartialCandidate(cand)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 whitespace-nowrap shrink-0"
                          >
                            Not Siblings
                          </button>
                        </div>
                      </div>

                      {/* Side-by-Side Contact Comparison Table */}
                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                              {isReviewing && <th className="px-3 py-2 font-semibold">Primary</th>}
                              <th className="px-4 py-2 font-semibold">Student &amp; Adm No.</th>
                              <th className="px-4 py-2 font-semibold">Class</th>
                              <th className="px-4 py-2 font-semibold">Recorded Guardian</th>
                              <th className="px-4 py-2 font-semibold">Phone &amp; Email</th>
                              <th className="px-4 py-2 font-semibold">Locality / Remarks</th>
                              <th className="px-4 py-2 font-semibold text-right">Demand</th>
                              <th className="px-4 py-2 font-semibold text-right">Paid YTD</th>
                              <th className="px-4 py-2 font-semibold text-right">Pending</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {cand.members.map((m, idx) => (
                              <tr key={m.nodeKey} className="hover:bg-slate-50">
                                {isReviewing && (
                                  <td className="px-3 py-2.5">
                                    <input
                                      type="radio"
                                      name={`primary-${cand.id}`}
                                      checked={reviewPrimaryKey === m.nodeKey}
                                      onChange={() => setReviewPrimaryKey(m.nodeKey)}
                                      aria-label={`Set ${m.studentName} as primary billing`}
                                      className="h-3.5 w-3.5 accent-blue-900"
                                    />
                                  </td>
                                )}
                                <td className="px-4 py-2.5">
                                  <p className="font-semibold text-slate-900">
                                    {m.studentName}
                                    {idx === 0 && !isReviewing && (
                                      <span className="ml-2 text-[11px] font-medium text-blue-900">
                                        Primary Candidate
                                      </span>
                                    )}
                                  </p>
                                  <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                                    {m.admissionNo}
                                    {m.existingFamilyCode ? ` · In ${m.existingFamilyCode}` : ''}
                                  </p>
                                </td>
                                <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                                  {m.classSection}
                                </td>
                                <td className="px-4 py-2.5 font-medium text-slate-900">
                                  {m.guardianName || '—'}
                                </td>
                                <td className="px-4 py-2.5">
                                  <p className="font-mono text-slate-900 tabular-nums">
                                    {m.contactNo || 'Missing Phone'}
                                  </p>
                                  {m.parentEmail && (
                                    <p className="text-[11px] text-slate-500">{m.parentEmail}</p>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-slate-600">
                                  <span>{m.address || '—'}</span>
                                  {m.remarks && (
                                    <span className="block text-[11px] text-slate-400">
                                      Remark: {m.remarks}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 font-mono text-slate-700 text-right tabular-nums">
                                  {formatInr(m.totalDemandInr)}
                                </td>
                                <td className="px-4 py-2.5 font-mono text-emerald-700 text-right tabular-nums">
                                  {formatInr(m.paidAmountInr)}
                                </td>
                                <td className="px-4 py-2.5 font-mono font-semibold text-slate-900 text-right tabular-nums">
                                  {formatInr(m.balanceFeesInr)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Inline Standardize & Confirm Drawer */}
                      {isReviewing && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                          <p className="text-xs font-semibold text-slate-900">
                            Standardize Canonical Family Contact Before Merging
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Canonical Guardian Name
                              </label>
                              <input
                                type="text"
                                value={reviewGuardianName}
                                onChange={(e) => setReviewGuardianName(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Verified Contact Phone
                              </label>
                              <input
                                type="text"
                                value={reviewPhone}
                                onChange={(e) => setReviewPhone(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 tabular-nums"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Parent Email (Optional)
                              </label>
                              <input
                                type="email"
                                value={reviewEmail}
                                onChange={(e) => setReviewEmail(e.target.value)}
                                placeholder="parent@example.com"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Household Address / Locality
                              </label>
                              <input
                                type="text"
                                value={reviewAddress}
                                onChange={(e) => setReviewAddress(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <input
                              type="text"
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              placeholder="Optional audit note (e.g. Verified phone typo with parent)..."
                              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                            />
                            <button
                              type="button"
                              disabled={busyKey === `merge-partial:${cand.id}`}
                              onClick={() => void handleMergePartialCandidate(cand)}
                              className="rounded-lg bg-blue-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                            >
                              {busyKey === `merge-partial:${cand.id}`
                                ? 'Merging...'
                                : 'Confirm & Merge Family Account'}
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
        )}

        {/* TAB 2: AUTO-DETECTED ALERTS */}
        {activeTab === 'alerts' && (
          <div>
            {filteredAlerts.length === 0 ? (
              <div className="px-6 py-12 text-center text-xs text-slate-500">
                No unreviewed auto-detected sibling alerts matching the current filter.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredAlerts.slice(0, 30).map((fam) => (
                  <div key={fam.id} className="p-6 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                          <span>{fam.guardianName}</span>
                          <span className="font-mono text-xs font-medium text-slate-600 tabular-nums">
                            {fam.guardianPhone || 'Phone Missing'}
                          </span>
                          {fam.address && (
                            <span className="text-xs font-normal text-slate-500">· {fam.address}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold text-blue-900">Strong Signals: </span>
                          {fam.detectionSignals.join(' · ')}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <div className="text-right pr-2">
                          <p className="text-[11px] font-medium text-slate-500">Combined Balance</p>
                          <p className="font-mono text-base font-bold text-slate-900 tabular-nums">
                            {formatInr(fam.totalBalanceInr)}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={busyKey === `merge:${fam.id}`}
                          onClick={() => void handleFamilyStatusAction(fam.id, 'merge')}
                          className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                        >
                          {busyKey === `merge:${fam.id}` ? 'Merging...' : 'Confirm & Merge Family'}
                        </button>
                        <button
                          type="button"
                          disabled={busyKey === `dismiss:${fam.id}`}
                          onClick={() => void handleFamilyStatusAction(fam.id, 'dismiss')}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2 font-semibold">Sibling Name</th>
                            <th className="px-4 py-2 font-semibold">Adm No.</th>
                            <th className="px-4 py-2 font-semibold">Class</th>
                            <th className="px-4 py-2 font-semibold text-right">Total Demand</th>
                            <th className="px-4 py-2 font-semibold text-right">Paid YTD</th>
                            <th className="px-4 py-2 font-semibold text-right">Pending Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fam.members.map((m) => (
                            <tr key={`${fam.id}-${m.admissionNo}`} className="hover:bg-slate-50">
                              <td className="px-4 py-2 font-semibold text-slate-900">
                                {m.studentName}
                                {m.isPrimaryBilling && (
                                  <span className="ml-2 text-[11px] font-medium text-blue-900">
                                    Primary Billing
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 font-mono text-slate-600 tabular-nums">
                                {m.admissionNo}
                              </td>
                              <td className="px-4 py-2 text-slate-700">{m.classSection}</td>
                              <td className="px-4 py-2 font-mono text-slate-700 text-right tabular-nums">
                                {formatInr(m.totalDemandInr)}
                              </td>
                              <td className="px-4 py-2 font-mono text-emerald-700 text-right tabular-nums">
                                {formatInr(m.paidAmountInr)}
                              </td>
                              <td className="px-4 py-2 font-mono font-semibold text-slate-900 text-right tabular-nums">
                                {formatInr(m.balanceFeesInr)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MERGED FAMILIES */}
        {activeTab === 'merged' && (
          <div>
            {filteredMerged.length === 0 ? (
              <div className="px-6 py-12 text-center text-xs text-slate-500">
                No merged unified family accounts matching your filter yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredMerged.slice(0, 40).map((fam) => {
                  const isEditing = editingFamilyId === fam.id;
                  return (
                    <div key={fam.id} className="p-6 space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                            <span>{fam.guardianName}</span>
                            <span className="font-mono text-xs font-semibold text-blue-900 tabular-nums">
                              {fam.familyCode}
                            </span>
                            <span className="text-slate-300" aria-hidden="true">
                              ·
                            </span>
                            <span className="font-mono text-xs font-medium text-slate-600 tabular-nums">
                              {fam.guardianPhone || 'Phone Missing'}
                            </span>
                            {fam.address && (
                              <span className="text-xs font-normal text-slate-500">· {fam.address}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">
                            <span className="font-semibold text-emerald-700">
                              {fam.isManualMerge ? 'Manually Reviewed & Merged' : 'Auto-Detected & Merged'}
                            </span>
                            {' · '}
                            {fam.detectionSignals.join(' · ')}
                            {fam.reviewedBy ? ` · Reviewed by ${fam.reviewedBy}` : ''}
                            {fam.manualNotes ? ` · Note: ${fam.manualNotes}` : ''}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <div className="text-right pr-2">
                            <p className="text-[11px] font-medium text-slate-500">
                              Combined Balance ({fam.collectionRatePct}% paid)
                            </p>
                            <p className="font-mono text-base font-bold text-slate-900 tabular-nums">
                              {formatInr(fam.totalBalanceInr)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => openEditFamily(fam)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            {isEditing ? 'Close Edit' : 'Edit Contact / Primary'}
                          </button>

                          <button
                            type="button"
                            onClick={() => openManualBuilder(fam)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-slate-50 whitespace-nowrap shrink-0"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Sibling
                          </button>

                          <button
                            type="button"
                            disabled={busyKey === `unmerge:${fam.id}`}
                            onClick={() => void handleUnmergeFamily(fam)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 whitespace-nowrap shrink-0"
                          >
                            <Split className="h-3.5 w-3.5" />
                            {busyKey === `unmerge:${fam.id}` ? 'Splitting...' : 'Unmerge'}
                          </button>
                        </div>
                      </div>

                      {isEditing && (
                        <form
                          onSubmit={(e) => void handleSaveFamilyEdit(e, fam)}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Guardian Name
                              </label>
                              <input
                                type="text"
                                value={editGuardianName}
                                onChange={(e) => setEditGuardianName(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Household Phone
                              </label>
                              <input
                                type="text"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 tabular-nums"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Parent Email
                              </label>
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Primary Billing Sibling
                              </label>
                              <select
                                value={editPrimaryAccId}
                                onChange={(e) => setEditPrimaryAccId(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                              >
                                {fam.members.map((m) => (
                                  <option key={m.feeAccountId || m.admissionNo} value={m.feeAccountId || ''}>
                                    {m.studentName} ({m.classSection})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Locality / Address
                              </label>
                              <input
                                type="text"
                                value={editAddress}
                                onChange={(e) => setEditAddress(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Reconciliation Notes
                              </label>
                              <input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Optional admin note..."
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                              <input
                                type="checkbox"
                                checked={syncToMembers}
                                onChange={(e) => setSyncToMembers(e.target.checked)}
                                className="h-3.5 w-3.5 accent-blue-900"
                              />
                              Propagate updated contact details to all sibling student &amp; ledger records
                            </label>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setEditingFamilyId(null)}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={busyKey === `save-fam:${fam.id}`}
                                className="rounded-lg bg-blue-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
                              >
                                {busyKey === `save-fam:${fam.id}` ? 'Saving...' : 'Save Family Details'}
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-2 font-semibold">Sibling Name</th>
                              <th className="px-4 py-2 font-semibold">Adm No.</th>
                              <th className="px-4 py-2 font-semibold">Class</th>
                              <th className="px-4 py-2 font-semibold text-right">Demand + LYB</th>
                              <th className="px-4 py-2 font-semibold text-right">Paid YTD</th>
                              <th className="px-4 py-2 font-semibold text-right">Pending Balance</th>
                              {fam.isManualMerge && fam.members.length >= 3 && (
                                <th className="px-4 py-2 font-semibold text-right">Action</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {fam.members.map((m) => (
                              <tr key={`${fam.id}-${m.admissionNo}`} className="hover:bg-slate-50">
                                <td className="px-4 py-2 font-semibold text-slate-900">
                                  {m.studentName}
                                  {m.isPrimaryBilling && (
                                    <span className="ml-2 text-[11px] font-medium text-blue-900">
                                      Primary Billing
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 font-mono text-slate-600 tabular-nums">
                                  {m.admissionNo}
                                </td>
                                <td className="px-4 py-2 text-slate-700">{m.classSection}</td>
                                <td className="px-4 py-2 font-mono text-slate-700 text-right tabular-nums">
                                  {formatInr(m.totalDemandInr)}
                                </td>
                                <td className="px-4 py-2 font-mono text-emerald-700 text-right tabular-nums">
                                  {formatInr(m.paidAmountInr)}
                                </td>
                                <td className="px-4 py-2 font-mono font-semibold text-slate-900 text-right tabular-nums">
                                  {formatInr(m.balanceFeesInr)}
                                </td>
                                {fam.isManualMerge && fam.members.length >= 3 && (
                                  <td className="px-4 py-2 text-right">
                                    <button
                                      type="button"
                                      disabled={
                                        busyKey === `remove:${fam.id}:${m.feeAccountId || m.studentId}`
                                      }
                                      onClick={() =>
                                        void handleUnmergeFamily(fam, m.studentId, m.feeAccountId)
                                      }
                                      className="text-xs font-semibold text-rose-700 hover:underline whitespace-nowrap"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DISMISSED */}
        {activeTab === 'dismissed' && (
          <div className="divide-y divide-slate-200">
            {filteredDismissedPartials.length === 0 && filteredDismissedFamilies.length === 0 ? (
              <div className="px-6 py-12 text-center text-xs text-slate-500">
                No dismissed partial matches or sibling alerts.
              </div>
            ) : (
              <>
                {filteredDismissedPartials.map((d) => (
                  <div key={d.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Partial Contact Match · {d.summaryLabel}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {d.partialSignals.join(' · ')} · Dismissed by {d.dismissedBy} on {d.dismissedAt}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busyKey === `restore-partial:${d.id}`}
                      onClick={() => void handleRestorePartial(d.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore to Review
                    </button>
                  </div>
                ))}

                {filteredDismissedFamilies.map((fam) => (
                  <div key={fam.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Auto-Detected Cluster · {fam.guardianName} ({fam.members.map((m) => m.studentName).join(', ')})
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {fam.detectionSignals.join(' · ')} · Combined balance {formatInr(fam.totalBalanceInr)}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busyKey === `merge:${fam.id}`}
                      onClick={() => void handleFamilyStatusAction(fam.id, 'merge')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Re-Merge Family
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </section>

      {/* MANUAL MERGE BUILDER MODAL */}
      {builderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <GitMerge className="h-4 w-4 text-blue-900" />
                  {builderTargetFamily
                    ? `Add Sibling to ${builderTargetFamily.familyCode} (${builderTargetFamily.guardianName})`
                    : 'Manual Sibling Merge Builder'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search any student or fee account in {data.activeSchool.name}, compare parent contact details side-by-side, and merge into a unified Family Account.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close manual merge builder"
                onClick={() => setBuilderOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmitManualBuilder(e)} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Step 1: Search & Stage Students */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-800">
                  1. Search Students / Fee Ledgers to Pair
                </label>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={builderSearch}
                    onChange={(e) => setBuilderSearch(e.target.value)}
                    placeholder="Type student name, admission no., father/guardian name, phone, or class..."
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
                  {builderMatches.length === 0 ? (
                    <p className="px-4 py-4 text-xs text-slate-500">
                      No matching student records found.
                    </p>
                  ) : (
                    builderMatches.map((item) => (
                      <div
                        key={item.nodeKey}
                        className="px-4 py-2 flex items-center justify-between gap-3 text-xs hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {item.studentName}{' '}
                            <span className="font-normal text-slate-500">
                              · {item.classSection} · {item.admissionNo}
                            </span>
                            {item.existingFamilyCode && (
                              <span className="ml-2 text-amber-700 font-medium">
                                ({item.existingFamilyCode})
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            Guardian: {item.guardianName || '—'} · Phone:{' '}
                            <span className="font-mono tabular-nums">{item.contactNo || 'Missing'}</span>
                            {item.address ? ` · ${item.address}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addStagedKey(item.nodeKey)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-blue-900 hover:bg-slate-50 whitespace-nowrap shrink-0"
                        >
                          <Plus className="h-3 w-3" />
                          Stage
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Step 2: Staged Side-by-Side Comparison */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-800">
                    2. Side-by-Side Review ({stagedItems.length} Selected)
                  </label>
                  <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    Combined Balance: {formatInr(stagedItems.reduce((s, i) => s + i.balanceFeesInr, 0))}
                  </span>
                </div>

                {stagedItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
                    Stage at least 2 sibling accounts from the search list above to compare their parent contact details and merge them.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Primary</th>
                          <th className="px-3 py-2 font-semibold">Student</th>
                          <th className="px-3 py-2 font-semibold">Guardian</th>
                          <th className="px-3 py-2 font-semibold">Phone</th>
                          <th className="px-3 py-2 font-semibold">Address</th>
                          <th className="px-3 py-2 font-semibold text-right">Balance</th>
                          <th className="px-3 py-2 font-semibold text-right">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stagedItems.map((item) => (
                          <tr key={item.nodeKey}>
                            <td className="px-3 py-2">
                              <input
                                type="radio"
                                name="builder-primary"
                                checked={builderPrimaryKey === item.nodeKey}
                                onChange={() => setBuilderPrimaryKey(item.nodeKey)}
                                className="h-3.5 w-3.5 accent-blue-900"
                              />
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-900">
                              {item.studentName}
                              <span className="block text-[11px] font-normal text-slate-500">
                                {item.classSection} · {item.admissionNo}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-800">{item.guardianName || '—'}</td>
                            <td className="px-3 py-2 font-mono text-slate-800 tabular-nums">
                              {item.contactNo || 'Missing'}
                            </td>
                            <td className="px-3 py-2 text-slate-600">{item.address || '—'}</td>
                            <td className="px-3 py-2 font-mono font-semibold text-slate-900 text-right tabular-nums">
                              {formatInr(item.balanceFeesInr)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = stagedKeys.filter((k) => k !== item.nodeKey);
                                  setStagedKeys(next);
                                  if (builderPrimaryKey === item.nodeKey) {
                                    setBuilderPrimaryKey(next[0] || '');
                                  }
                                }}
                                className="text-xs font-semibold text-rose-700 hover:underline"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Step 3: Canonical Household Contact */}
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-900">
                  3. Unified Family Account Contact Profile
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Guardian Name
                    </label>
                    <input
                      type="text"
                      value={builderGuardianName}
                      onChange={(e) => setBuilderGuardianName(e.target.value)}
                      placeholder="Primary parent/guardian"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Canonical Phone
                    </label>
                    <input
                      type="text"
                      value={builderPhone}
                      onChange={(e) => setBuilderPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Parent Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={builderEmail}
                      onChange={(e) => setBuilderEmail(e.target.value)}
                      placeholder="family@example.com"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Locality / Address
                    </label>
                    <input
                      type="text"
                      value={builderAddress}
                      onChange={(e) => setBuilderAddress(e.target.value)}
                      placeholder="Sector / Village"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Verification Note
                  </label>
                  <input
                    type="text"
                    value={builderNotes}
                    onChange={(e) => setBuilderNotes(e.target.value)}
                    placeholder="Reason for manual sibling pairing (e.g. Father & Mother alternate numbers)..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setBuilderOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stagedItems.length < 2 || busyKey === 'builder-merge'}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  {busyKey === 'builder-merge'
                    ? 'Merging Family...'
                    : `Merge ${stagedItems.length} Siblings into Family Account`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
