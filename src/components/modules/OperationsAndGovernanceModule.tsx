import React, { useState } from 'react';
import { CheckCircle2, Crown, Lock, MapPin, Plus } from 'lucide-react';
import type { BlogArticle, LearnersWeights, OperationalItem } from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { validateLearnersWeights } from '../../utils/evidenceEngine';
import {
  PLATFORM_FEATURES,
  SUBSCRIPTION_PLANS,
  getEnabledFeaturesForSchool,
  hasGoogleMapsAccess,
  type SubscriptionTierId,
} from '../../utils/subscriptionEntitlements';
import { ComplaintManagementPanel } from '../ComplaintManagementPanel';
import { loadParentLangPreference, PARENT_TRANSLATIONS, type ParentLang } from '../../utils/parentTranslations';

interface OperationsAndGovernanceModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  parentLang?: ParentLang;
}

export const OperationsAndGovernanceModule: React.FC<OperationsAndGovernanceModuleProps> = ({
  data,
  token,
  onRefresh,
  parentLang: controlledLang,
}) => {
  // Formula weights state
  const [weights, setWeights] = useState<LearnersWeights>(data.weightsConfig.weights);
  const [weightErr, setWeightErr] = useState<string | null>(null);
  const [weightSaved, setWeightSaved] = useState<string | null>(null);

  // Operations item creation
  const [opModule, setOpModule] = useState<OperationalItem['module']>('Complaints');
  const [opTitle, setOpTitle] = useState('');
  const [opDetail, setOpDetail] = useState('');
  const [opImageUrl, setOpImageUrl] = useState('');

  // Blog CMS
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState<BlogArticle['category']>('Parenting');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogBody, setBlogBody] = useState('');

  // Super Admin school provisioning
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolCity, setSchoolCity] = useState('');
  const [schoolUdise, setSchoolUdise] = useState('');
  const [schoolPlan, setSchoolPlan] = useState<SubscriptionTierId>('Growth ERP');

  // Subscription Package & Google Maps Entitlement management
  const [planUpdatingSchoolId, setPlanUpdatingSchoolId] = useState<string | null>(null);
  const [planFeedback, setPlanFeedback] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  // Admin/Principal Accountant provisioning (Part 7)
  const [accName, setAccName] = useState('');
  const [accEmail, setAccEmail] = useState('');
  const [accDesignation, setAccDesignation] = useState('School Accountant (Finance 360°)');
  const [accStatusMsg, setAccStatusMsg] = useState<string | null>(null);
  const [accErrorMsg, setAccErrorMsg] = useState<string | null>(null);
  const [accSaving, setAccSaving] = useState(false);

  const canManageFormula = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    data.user.role,
  );
  const canProvisionAccountant = ['super_admin', 'school_admin', 'principal'].includes(
    data.user.role,
  );
  const canCollectFees = ['super_admin', 'school_admin', 'principal', 'accountant'].includes(
    data.user.role,
  );
  const isSuperAdmin = data.user.role === 'super_admin';
  const isStaff = !['parent', 'student'].includes(data.user.role);
  const parentLang =
    data.user.role === 'parent' ? (controlledLang ?? loadParentLangPreference()) : 'en';
  const parentStrings = PARENT_TRANSLATIONS[parentLang];

  async function handleSaveWeights(e: React.FormEvent) {
    e.preventDefault();
    setWeightErr(null);
    setWeightSaved(null);
    const check = validateLearnersWeights(weights);
    if (!check.valid) {
      setWeightErr(check.error || 'Weights must equal 100%.');
      return;
    }
    await apiRequest('/api/scoring/weights', { method: 'POST', body: JSON.stringify({ weights }) }, token);
    await onRefresh();
    setWeightSaved('Learners Score formula version updated and audit-logged.');
  }

  async function handleCollectFee(txId: string, remaining: number) {
    await apiRequest(
      '/api/fees/collect',
      { method: 'POST', body: JSON.stringify({ transactionId: txId, paymentAmountInr: remaining }) },
      token,
    );
    await onRefresh();
  }

  async function handleCreateOperation(e: React.FormEvent) {
    e.preventDefault();
    if (!opTitle.trim() || !opDetail.trim()) return;
    await apiRequest(
      '/api/operations',
      {
        method: 'POST',
        body: JSON.stringify({
          module: opModule,
          title: opTitle,
          detail: opDetail,
          imageUrl: opImageUrl || undefined,
        }),
      },
      token,
    );
    setOpTitle('');
    setOpDetail('');
    setOpImageUrl('');
    await onRefresh();
  }

  async function handlePublishBlog(e: React.FormEvent) {
    e.preventDefault();
    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogBody.trim()) return;
    await apiRequest(
      '/api/blogs',
      {
        method: 'POST',
        body: JSON.stringify({
          title: blogTitle,
          category: blogCategory,
          excerpt: blogExcerpt,
          body: blogBody,
          status: 'Published',
        }),
      },
      token,
    );
    setBlogTitle('');
    setBlogExcerpt('');
    setBlogBody('');
    await onRefresh();
  }

  async function handleAddSchool(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolName.trim() || !schoolCode.trim() || !schoolCity.trim()) return;
    await apiRequest(
      '/api/schools',
      {
        method: 'POST',
        body: JSON.stringify({
          name: schoolName,
          code: schoolCode,
          city: schoolCity,
          udiseCode: schoolUdise,
          subscriptionPlan: schoolPlan,
        }),
      },
      token,
    );
    setSchoolName('');
    setSchoolCode('');
    setSchoolCity('');
    setSchoolUdise('');
    setSchoolPlan('Growth ERP');
    await onRefresh();
  }

  async function handleSwitchSubscriptionPlan(
    targetSchoolId: string,
    nextPlan: SubscriptionTierId,
  ) {
    setPlanError(null);
    setPlanFeedback(null);
    setPlanUpdatingSchoolId(targetSchoolId);
    try {
      const res = await apiRequest<{
        school: { name: string; subscriptionPlan: string };
        googleMapsEnabled: boolean;
      }>(
        `/api/schools/${targetSchoolId}/subscription`,
        {
          method: 'PATCH',
          body: JSON.stringify({ subscriptionPlan: nextPlan }),
        },
        token,
      );
      await onRefresh();
      setPlanFeedback(
        `${res.school.name} is now on ${res.school.subscriptionPlan} — Google Maps Live GPS & Address Geocoding ${
          res.googleMapsEnabled ? 'ENABLED (Premium)' : 'LOCKED (Standard Plan)'
        }.`,
      );
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Unable to update subscription package.');
    } finally {
      setPlanUpdatingSchoolId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          {isStaff
            ? 'Fees, School Operations, Formula Governance & Content'
            : parentStrings.openComplaintsAndFees}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {isStaff
            ? 'Configure scoring weights, reconcile fee receipts, track transport/library/complaints, and publish Knowledge Centre articles.'
            : parentStrings.complaintDeskSubtitle}
        </p>
      </div>

      {/* School Subscription Package & Allotted Features (Read-Only for School Leadership — Managed by Super Admin) */}
      {canProvisionAccountant && (
        <div
          data-testid="subscription-package-manager"
          className="rounded-xl border border-[#D6B66D] bg-[#FAF4EC] p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7B5D1C] flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5" />
                Allotted Plan &amp; Features · {data.activeSchool.name}
              </p>
              <h2 className="font-display text-base font-bold text-[#142B46] mt-0.5">
                Active Paid Subscription &amp; Feature Entitlements
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Paid plan upgrades and custom module allotments are managed exclusively by the{' '}
                <strong>Platform Super Admin</strong>.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#142B46] bg-white border border-[#D9C9B6] rounded-lg px-3 py-2 whitespace-nowrap">
              Active: <span className="font-mono font-bold">{data.activeSchool.subscriptionPlan}</span>
              {' · '}
              <span
                className={
                  hasGoogleMapsAccess(data.activeSchool)
                    ? 'text-[#3D6349]'
                    : 'text-amber-700'
                }
              >
                {hasGoogleMapsAccess(data.activeSchool)
                  ? 'Google Maps Active'
                  : 'Google Maps Locked'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PLATFORM_FEATURES.map((feat) => {
              const enabled = getEnabledFeaturesForSchool(data.activeSchool).includes(feat.key);
              return (
                <div
                  key={feat.key}
                  className={`rounded-lg border px-3 py-2.5 flex items-center justify-between gap-2 text-xs ${
                    enabled
                      ? 'border-[#3D6349]/30 bg-white text-[#142B46]'
                      : 'border-slate-200 bg-slate-50/70 text-slate-400'
                  }`}
                >
                  <span className="font-semibold truncate">{feat.label}</span>
                  <span
                    className={`text-[10px] font-bold uppercase whitespace-nowrap shrink-0 ${
                      enabled ? 'text-[#3D6349]' : 'text-slate-400'
                    }`}
                  >
                    {enabled ? 'Active' : 'Locked'}
                  </span>
                </div>
              );
            })}
          </div>

          {planFeedback && (
            <p className="text-xs font-semibold text-[#2D5139] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {planFeedback}
            </p>
          )}
          {planError && <p className="text-xs font-semibold text-rose-700">{planError}</p>}
        </div>
      )}

      {/* Learners Score Formula Governance */}
      {canManageFormula && (
        <form
          onSubmit={handleSaveWeights}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Learners Score Weight Governance ({data.weightsConfig.version})
              </h2>
              <p className="text-xs text-slate-500">
                Approved by {data.weightsConfig.approvedBy}. All 5 components must total 100%.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
              Total:{' '}
              {weights.academic +
                weights.olq +
                weights.learningHabits +
                weights.participation +
                weights.personalGrowth}
              %
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(
              [
                ['academic', 'Academic (%)'],
                ['olq', 'OLQ Dev (%)'],
                ['learningHabits', 'Habits (%)'],
                ['participation', 'Participation (%)'],
                ['personalGrowth', 'Growth (%)'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label htmlFor={`wt-${key}`} className="block text-xs font-medium text-slate-600 mb-1">
                  {label}
                </label>
                <input
                  id={`wt-${key}`}
                  type="number"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(e) =>
                    setWeights((prev) => ({ ...prev, [key]: Number(e.target.value) || 0 }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-mono tabular-nums"
                />
              </div>
            ))}
          </div>

          {weightErr && <p className="text-xs text-red-700">{weightErr}</p>}
          {weightSaved && (
            <p className="text-xs text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {weightSaved}
            </p>
          )}

          <button
            type="submit"
            className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
          >
            Validate & Save Formula Version
          </button>
        </form>
      )}

      {/* Fee Ledger (Permission-controlled) */}
      {['super_admin', 'school_admin', 'principal', 'parent'].includes(data.user.role) && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">
              Fees & Financial Ledger
            </h2>
            <span className="text-xs text-slate-500">Auditable receipts & concessions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Schedule</th>
                  <th className="px-5 py-3 font-semibold text-right">Due (INR)</th>
                  <th className="px-5 py-3 font-semibold text-right">Paid (INR)</th>
                  <th className="px-5 py-3 font-semibold">Receipt / Status</th>
                  {canCollectFees && <th className="px-5 py-3 font-semibold">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.feeTransactions.map((tx) => {
                  const netDue = tx.amountDueInr - tx.concessionInr;
                  const remaining = Math.max(0, netDue - tx.amountPaidInr);
                  return (
                    <tr key={tx.id}>
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {tx.studentName} · {tx.classSection}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{tx.schedule}</td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums">
                        ₹{netDue.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums">
                        ₹{tx.amountPaidInr.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-700">
                        {tx.receiptNo} · {tx.status}
                      </td>
                      {canCollectFees && (
                        <td className="px-5 py-3">
                          {remaining > 0 ? (
                            <button
                              type="button"
                              onClick={() => void handleCollectFee(tx.id, remaining)}
                              className="rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600 whitespace-nowrap"
                            >
                              Record ₹{remaining.toLocaleString('en-IN')}
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-semibold">Settled</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Structured Parent Complaint Desk & Resolution Queue */}
      {(canManageFormula || data.user.role === 'parent') && (
        <ComplaintManagementPanel
          data={data}
          token={token}
          onRefresh={onRefresh}
          parentLang={parentLang}
        />
      )}

      {/* School Operations (Transport, Library, Inventory, Sports) */}
      {isStaff && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              School Operations (Transport, Library, Inventory & Sports)
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data.operations.map((op) => (
              <div key={op.id} className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">
                    {op.module} · {op.title}
                  </p>
                  <p className="text-slate-600 mt-0.5">{op.detail}</p>
                  <p className="text-slate-400 mt-0.5">
                    {op.ownerOrRoute} · {op.date}
                  </p>
                </div>
                <span className="font-semibold text-blue-900 shrink-0">{op.status}</span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCreateOperation}
            className="border-t border-slate-200 bg-slate-50/70 p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <select
              aria-label="Operation module"
              value={opModule}
              onChange={(e) => setOpModule(e.target.value as OperationalItem['module'])}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            >
              <option value="Transport">Transport Route</option>
              <option value="Library">Library Stock</option>
              <option value="Inventory">Inventory & Assets</option>
              <option value="Sports">Sports & House Activity</option>
              <option value="Competitions">Competitions & Events</option>
              <option value="Complaints">Internal Maintenance</option>
            </select>
            <input
              type="text"
              aria-label="Operational record title"
              value={opTitle}
              onChange={(e) => setOpTitle(e.target.value)}
              placeholder="Title / Route / Item"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              aria-label="Operational detail"
              value={opDetail}
              onChange={(e) => setOpDetail(e.target.value)}
              placeholder="Details or issue summary"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Operation
            </button>
          </form>
        </div>
      )}

      {/* Blog CMS */}
      {canManageFormula && (
        <form
          onSubmit={handlePublishBlog}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-3"
        >
          <h2 className="font-display text-base font-bold text-slate-900">
            Knowledge Centre & Blog Publisher
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              aria-label="Blog article title"
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              placeholder="Article Title"
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <select
              aria-label="Blog category"
              value={blogCategory}
              onChange={(e) => setBlogCategory(e.target.value as BlogArticle['category'])}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            >
              <option value="Parenting">Parenting</option>
              <option value="Educational Psychology">Educational Psychology</option>
              <option value="Career Guidance">Career Guidance</option>
              <option value="OLQs & Student Development">OLQs & Student Development</option>
              <option value="School Management">School Management</option>
              <option value="Competitive Examinations">Competitive Examinations</option>
            </select>
          </div>
          <input
            type="text"
            aria-label="Article summary excerpt"
            value={blogExcerpt}
            onChange={(e) => setBlogExcerpt(e.target.value)}
            placeholder="Short summary for public Knowledge Centre cards"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
          />
          <textarea
            rows={2}
            aria-label="Article full text"
            value={blogBody}
            onChange={(e) => setBlogBody(e.target.value)}
            placeholder="Full educational article content..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
          >
            Publish to Public Knowledge Centre
          </button>
        </form>
      )}

      {/* Admin / Principal: Provision Accountant Account (Part 7) */}
      {canProvisionAccountant && (
        <div
          data-testid="provision-accountant-panel"
          className="rounded-xl border border-emerald-200 bg-white p-6 space-y-4"
        >
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Accountant Role &amp; Finance 360° Access Provisioning
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Provision dedicated Accountant user accounts scoped strictly to{' '}
              <strong>{data.activeSchool.name}</strong>. Zero hardcoded passwords — segregation of
              duties automatically blocks self-approval, payroll sign-off, deleting posted entries,
              and cross-tenant access.
            </p>
          </div>

          {(data.schoolUsers || []).filter((u) => u.role === 'accountant').length > 0 && (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs">
              {(data.schoolUsers || [])
                .filter((u) => u.role === 'accountant')
                .map((u) => (
                  <div key={u.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{u.name}</span>{' '}
                      <span className="text-slate-500">({u.email})</span>
                    </div>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      {u.designation || 'School Accountant'}
                    </span>
                  </div>
                ))}
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAccStatusMsg(null);
              setAccErrorMsg(null);
              setAccSaving(true);
              try {
                const res = await apiRequest<{ invitationNotice: string }>(
                  '/api/users/provision-accountant',
                  {
                    method: 'POST',
                    body: JSON.stringify({
                      name: accName,
                      email: accEmail,
                      designation: accDesignation,
                    }),
                  },
                  token,
                );
                setAccName('');
                setAccEmail('');
                setAccStatusMsg(res.invitationNotice);
                await onRefresh();
              } catch (err) {
                setAccErrorMsg(
                  err instanceof Error ? err.message : 'Unable to provision accountant account.',
                );
              } finally {
                setAccSaving(false);
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <input
              type="text"
              required
              aria-label="Accountant full name"
              value={accName}
              onChange={(e) => setAccName(e.target.value)}
              placeholder="Full Name (e.g., Rakesh Sharma)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              type="email"
              required
              aria-label="Accountant institutional email"
              value={accEmail}
              onChange={(e) => setAccEmail(e.target.value)}
              placeholder="accounts@viratinternational.edu.in"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              type="text"
              aria-label="Accountant designation"
              value={accDesignation}
              onChange={(e) => setAccDesignation(e.target.value)}
              placeholder="Designation"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              disabled={accSaving}
              className="rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {accSaving ? 'Provisioning...' : 'Provision Accountant'}
            </button>
          </form>

          {accStatusMsg && (
            <p className="text-xs font-semibold text-emerald-700">{accStatusMsg}</p>
          )}
          {accErrorMsg && <p className="text-xs font-semibold text-rose-700">{accErrorMsg}</p>}
        </div>
      )}

      {/* Platform Super Admin: Multi-School Tenant Onboarding */}
      {isSuperAdmin && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900">
            Platform Super Admin · Multi-School SaaS Tenants &amp; Package Tiers
          </h2>
          <div className="divide-y divide-slate-100 text-xs">
            {data.availableSchools.map((s) => {
              const mapsOn = hasGoogleMapsAccess(s.subscriptionPlan);
              return (
                <div
                  key={s.id}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {s.name} ({s.code})
                    </p>
                    <p className="text-slate-500">
                      {s.city}, {s.state} · {s.board} · UDISE {s.udiseCode} ·{' '}
                      <span className={mapsOn ? 'text-[#3D6349] font-semibold' : 'text-amber-700 font-semibold'}>
                        {mapsOn ? 'Google Maps Unlocked' : 'Standard (No Google Maps)'}
                      </span>
                    </p>
                  </div>
                  <select
                    aria-label={`Subscription package for ${s.name}`}
                    value={s.subscriptionPlan}
                    disabled={planUpdatingSchoolId === s.id}
                    onChange={(e) =>
                      void handleSwitchSubscriptionPlan(
                        s.id,
                        e.target.value as SubscriptionTierId,
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-[#FAF4EC] px-2.5 py-1.5 font-mono text-xs font-semibold text-[#142B46]"
                  >
                    {SUBSCRIPTION_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} {p.googleMapsEnabled ? '(Maps ✓)' : '(No Maps)'}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleAddSchool} className="grid grid-cols-1 sm:grid-cols-6 gap-3 pt-2">
            <input
              type="text"
              aria-label="New school name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="School Name"
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              type="text"
              aria-label="School code"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
              placeholder="Code (e.g. GSSS-RTK)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              type="text"
              aria-label="School city"
              value={schoolCity}
              onChange={(e) => setSchoolCity(e.target.value)}
              placeholder="City"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <select
              aria-label="New school subscription package"
              value={schoolPlan}
              onChange={(e) => setSchoolPlan(e.target.value as SubscriptionTierId)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#142B46]"
            >
              {SUBSCRIPTION_PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} {p.googleMapsEnabled ? '(Premium Maps)' : '(Standard)'}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-[#142B46] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C]"
            >
              Provision Tenant
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
