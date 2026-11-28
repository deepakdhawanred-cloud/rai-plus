import React, { useCallback, useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Globe,
  IndianRupee,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Users,
} from 'lucide-react';
import type {
  CommercialPricingRegistry,
  ProductEnquiryRecord,
  SsbPracticeSet,
  SsbTestFormat,
} from '../../types/flagshipProducts';
import { apiRequest } from '../../utils/api';

interface AdminFlagshipOverview {
  registry: CommercialPricingRegistry;
  ssbPracticeSets: SsbPracticeSet[];
  enquiries: ProductEnquiryRecord[];
  deletionRequests: Array<{
    id: string;
    userId: string;
    email: string;
    product: string;
    reason: string;
    status: string;
    requestedAt: string;
  }>;
  metrics: {
    ssbStudentCount: number;
    totalSsbSessions: number;
    careerUserCount: number;
    completedCareerRoadmaps: number;
    publishedSetsCount: number;
    openEnquiriesCount: number;
  };
}

export const SuperAdminProductsConsole: React.FC<{ token: string }> = ({ token }) => {
  const [overview, setOverview] = useState<AdminFlagshipOverview | null>(null);
  const [registryDraft, setRegistryDraft] = useState<CommercialPricingRegistry | null>(null);
  const [subTab, setSubTab] = useState<'pricing' | 'ssb_bank' | 'cms' | 'enquiries'>('pricing');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add new SSB Practice Set form
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetFormat, setNewSetFormat] = useState<SsbTestFormat>('WAT');
  const [newSetCategory, setNewSetCategory] = useState('Officer Readiness');
  const [newSetPrompts, setNewSetPrompts] = useState('');

  // New coupon inputs
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPct, setNewCouponPct] = useState(15);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<AdminFlagshipOverview>(
        '/api/admin/flagship/overview',
        {},
        token || undefined,
      );
      setOverview(res);
      setRegistryDraft(res.registry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load flagship products overview.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  async function handleSaveRegistry() {
    if (!registryDraft) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await apiRequest<{ registry: CommercialPricingRegistry }>(
        '/api/admin/commercial-registry',
        { method: 'PUT', body: JSON.stringify(registryDraft) },
        token || undefined,
      );
      setRegistryDraft(res.registry);
      setNotice('Central Commercial Pricing & Public CMS Registry saved and live across /pricing & landing pages!');
      void loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save commercial registry.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSsbSet(e: React.FormEvent) {
    e.preventDefault();
    const prompts = newSetPrompts
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!newSetTitle.trim() || prompts.length === 0) {
      setError('Provide a set title and at least one stimulus prompt (one per line).');
      return;
    }
    try {
      await apiRequest(
        '/api/admin/ssb/sets',
        {
          method: 'POST',
          body: JSON.stringify({
            title: newSetTitle,
            format: newSetFormat,
            categoryFocus: newSetCategory,
            prompts,
          }),
        },
        token || undefined,
      );
      setNewSetTitle('');
      setNewSetPrompts('');
      setNotice('New custom SSB practice set published to the SSB Academy catalog.');
      void loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SSB practice set.');
    }
  }

  async function handleToggleSetField(set: SsbPracticeSet, field: 'published' | 'isFreeDemo') {
    try {
      await apiRequest(
        `/api/admin/ssb/sets/${set.id}`,
        { method: 'PATCH', body: JSON.stringify({ [field]: !set[field] }) },
        token || undefined,
      );
      void loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.');
    }
  }

  async function handleEnquiryStatus(id: string, status: ProductEnquiryRecord['status']) {
    try {
      await apiRequest(
        `/api/admin/flagship/enquiries/${id}`,
        { method: 'PATCH', body: JSON.stringify({ status }) },
        token || undefined,
      );
      void loadOverview();
    } catch {
      // ignore
    }
  }

  if (loading && !overview) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading Products, SSB & Pricing Registry…</div>;
  }

  if (!overview || !registryDraft) {
    return <div className="p-6 text-xs text-rose-700">{error || 'Unable to load console.'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            SUPER ADMIN CONTROL CENTER · CENTRAL COMMERCIAL REGISTRY
          </p>
          <h1 className="text-2xl font-extrabold text-[#142B46]">
            Flagship Products, SSB Question Bank & Dynamic Pricing CMS
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadOverview()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSaveRegistry()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E3B5C] disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? 'Publishing…' : 'Publish Registry Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-800">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900">
          {notice}
        </div>
      )}

      {/* Live Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'SSB Students', val: overview.metrics.ssbStudentCount },
          { label: 'SSB Sessions', val: overview.metrics.totalSsbSessions },
          { label: 'Published SSB Sets', val: overview.metrics.publishedSetsCount },
          { label: 'Free Career Users', val: overview.metrics.careerUserCount },
          { label: 'Career Roadmaps', val: overview.metrics.completedCareerRoadmaps },
          { label: 'Open Enquiries', val: overview.metrics.openEnquiriesCount },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-[11px] font-semibold text-slate-500">{m.label}</p>
            <p className="mt-1 text-xl font-extrabold text-[#142B46]">{m.val}</p>
          </div>
        ))}
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'pricing', label: 'Pricing Registry (Schools + SSB + Free Career)', icon: IndianRupee },
            { id: 'ssb_bank', label: `SSB 100-Set Catalog (${overview.ssbPracticeSets.length})`, icon: BookOpen },
            { id: 'cms', label: 'Public Product Website CMS', icon: Globe },
            { id: 'enquiries', label: `Enquiries & DPDP (${overview.enquiries.length})`, icon: Users },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold ${
                subTab === t.id
                  ? 'bg-[#142B46] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ==================== SUB-TAB 1: CENTRAL PRICING REGISTRY ==================== */}
      {subTab === 'pricing' && (
        <div className="space-y-6">
          {/* School Packages */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#142B46]">School ERP Annual Packages (₹ / student / year)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {registryDraft.schoolPackages.map((pkg, idx) => (
                <div key={pkg.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                  <p className="font-bold text-[#142B46]">{pkg.name}</p>
                  <label className="block space-y-1">
                    <span className="text-[11px] text-slate-600">Annual Fee (₹)</span>
                    <input
                      type="number"
                      min={0}
                      value={pkg.annualPerStudentInr}
                      onChange={(e) => {
                        const next = [...registryDraft.schoolPackages];
                        next[idx] = { ...pkg, annualPerStudentInr: Number(e.target.value) || 0 };
                        setRegistryDraft({ ...registryDraft, schoolPackages: next });
                      }}
                      className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 font-mono font-bold"
                    />
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px]">
                    <input
                      type="checkbox"
                      checked={pkg.active}
                      onChange={(e) => {
                        const next = [...registryDraft.schoolPackages];
                        next[idx] = { ...pkg, active: e.target.checked };
                        setRegistryDraft({ ...registryDraft, schoolPackages: next });
                      }}
                    />
                    Visible on public /pricing
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* SSB Academy Pricing Control */}
          <div className="rounded-xl border border-amber-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#142B46] flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-600" /> Rai Plus SSB Academy Subscription Control
                </h3>
                <p className="text-xs text-slate-600">
                  Keep as Enquiry-Only until commercial fees are approved, or switch to Published to activate live paid checkout tiers.
                </p>
              </div>
              <select
                value={registryDraft.ssbAcademy.priceStatus}
                onChange={(e) =>
                  setRegistryDraft({
                    ...registryDraft,
                    ssbAcademy: {
                      ...registryDraft.ssbAcademy,
                      priceStatus: e.target.value as 'enquiry_only' | 'published',
                    },
                  })
                }
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
              >
                <option value="enquiry_only">Enquiry Only (Hide Unapproved Fees)</option>
                <option value="published">Published (Live Paid Subscriptions)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {(
                [
                  ['monthlyInr', 'Monthly (₹)'],
                  ['quarterlyInr', 'Quarterly (₹)'],
                  ['halfYearlyInr', 'Half-Yearly (₹)'],
                  ['annualInr', 'Annual (₹)'],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="space-y-1">
                  <span className="font-bold text-slate-700">{label}</span>
                  <input
                    type="number"
                    min={0}
                    value={registryDraft.ssbAcademy[field] ?? ''}
                    placeholder="Unset"
                    onChange={(e) =>
                      setRegistryDraft({
                        ...registryDraft,
                        ssbAcademy: {
                          ...registryDraft.ssbAcademy,
                          [field]: e.target.value === '' ? null : Number(e.target.value),
                        },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                </label>
              ))}
            </div>

            {/* Coupon Manager */}
            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
              <p className="font-bold text-slate-700">Active SSB Discount Coupons</p>
              <div className="flex flex-wrap gap-2">
                {registryDraft.ssbAcademy.coupons.map((c, idx) => (
                  <span
                    key={c.code}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-300 px-3 py-1 font-mono"
                  >
                    {c.code} ({c.discountPct}% off)
                    <button
                      type="button"
                      onClick={() => {
                        const next = registryDraft.ssbAcademy.coupons.filter((_, i) => i !== idx);
                        setRegistryDraft({
                          ...registryDraft,
                          ssbAcademy: { ...registryDraft.ssbAcademy, coupons: next },
                        });
                      }}
                      className="text-rose-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="NEWCOUPON"
                  className="rounded border border-slate-300 px-2.5 py-1.5 font-mono"
                />
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={newCouponPct}
                  onChange={(e) => setNewCouponPct(Number(e.target.value) || 10)}
                  className="w-20 rounded border border-slate-300 px-2.5 py-1.5"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCouponCode.trim()) return;
                    setRegistryDraft({
                      ...registryDraft,
                      ssbAcademy: {
                        ...registryDraft.ssbAcademy,
                        coupons: [
                          ...registryDraft.ssbAcademy.coupons,
                          {
                            code: newCouponCode.trim(),
                            discountPct: newCouponPct,
                            active: true,
                            expiresOn: '2027-03-31',
                            note: 'Super Admin Promotional Coupon',
                          },
                        ],
                      },
                    });
                    setNewCouponCode('');
                  }}
                  className="inline-flex items-center gap-1 rounded bg-slate-800 px-3 py-1.5 font-bold text-white"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Coupon
                </button>
              </div>
            </div>
          </div>

          {/* Career Intelligence Permanent Free Lock */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Compass className="h-5 w-5 text-emerald-700" />
              <div>
                <p className="font-bold text-emerald-950">Rai Plus Career Intelligence — Permanently Locked at ₹0 FREE</p>
                <p className="text-emerald-800">{registryDraft.careerIntelligence.alwaysFreeGuarantee}</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-700 px-3 py-1 font-bold text-white shrink-0">₹0 LOCKED</span>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 2: SSB 100-SET BANK ==================== */}
      {subTab === 'ssb_bank' && (
        <div className="space-y-5">
          <form onSubmit={handleAddSsbSet} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#142B46]">Add New Custom SSB Practice Set</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newSetTitle}
                onChange={(e) => setNewSetTitle(e.target.value)}
                placeholder="Set Title (e.g. WAT — NDA Tactical Speed Drill)"
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <select
                value={newSetFormat}
                onChange={(e) => setNewSetFormat(e.target.value as SsbTestFormat)}
                className="rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="WAT">WAT</option>
                <option value="SRT">SRT</option>
                <option value="TAT">TAT</option>
                <option value="PPDT">PPDT</option>
              </select>
              <input
                type="text"
                value={newSetCategory}
                onChange={(e) => setNewSetCategory(e.target.value)}
                placeholder="Category Focus"
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <textarea
              rows={3}
              value={newSetPrompts}
              onChange={(e) => setNewSetPrompts(e.target.value)}
              placeholder="Enter one stimulus word / situation / scene description per line..."
              className="w-full rounded-lg border border-slate-300 p-3"
            />
            <button type="submit" className="rounded-lg bg-[#142B46] px-4 py-2 font-bold text-white">
              Publish New SSB Practice Set
            </button>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Format</th>
                    <th className="p-3">Stimuli</th>
                    <th className="p-3">Free Demo</th>
                    <th className="p-3">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview.ssbPracticeSets.slice(0, 105).map((set) => (
                    <tr key={set.id}>
                      <td className="p-3 font-mono font-bold text-[#142B46]">{set.code}</td>
                      <td className="p-3 font-medium">{set.title}</td>
                      <td className="p-3">{set.format}</td>
                      <td className="p-3">{set.stimuli.length}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => void handleToggleSetField(set, 'isFreeDemo')}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            set.isFreeDemo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {set.isFreeDemo ? 'Free Demo' : 'Paid Pool'}
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => void handleToggleSetField(set, 'published')}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            set.published ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {set.published ? 'Published' : 'Retired'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 3: PUBLIC WEBSITE CMS ==================== */}
      {subTab === 'cms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#142B46]">SSB Academy Landing Page CMS</h3>
            <label className="block space-y-1">
              <span className="font-bold">Hero Headline</span>
              <input
                type="text"
                value={registryDraft.publicCms.ssbAcademy.headline}
                onChange={(e) =>
                  setRegistryDraft({
                    ...registryDraft,
                    publicCms: {
                      ...registryDraft.publicCms,
                      ssbAcademy: { ...registryDraft.publicCms.ssbAcademy, headline: e.target.value },
                    },
                  })
                }
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold">Subheading</span>
              <textarea
                rows={3}
                value={registryDraft.publicCms.ssbAcademy.subheading}
                onChange={(e) =>
                  setRegistryDraft({
                    ...registryDraft,
                    publicCms: {
                      ...registryDraft.publicCms,
                      ssbAcademy: { ...registryDraft.publicCms.ssbAcademy, subheading: e.target.value },
                    },
                  })
                }
                className="w-full rounded border border-slate-300 p-2.5"
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A3F]">Free Career Intelligence Landing Page CMS</h3>
            <label className="block space-y-1">
              <span className="font-bold">Hero Headline</span>
              <input
                type="text"
                value={registryDraft.publicCms.careerIntelligence.headline}
                onChange={(e) =>
                  setRegistryDraft({
                    ...registryDraft,
                    publicCms: {
                      ...registryDraft.publicCms,
                      careerIntelligence: {
                        ...registryDraft.publicCms.careerIntelligence,
                        headline: e.target.value,
                      },
                    },
                  })
                }
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold">Subheading</span>
              <textarea
                rows={3}
                value={registryDraft.publicCms.careerIntelligence.subheading}
                onChange={(e) =>
                  setRegistryDraft({
                    ...registryDraft,
                    publicCms: {
                      ...registryDraft.publicCms,
                      careerIntelligence: {
                        ...registryDraft.publicCms.careerIntelligence,
                        subheading: e.target.value,
                      },
                    },
                  })
                }
                className="w-full rounded border border-slate-300 p-2.5"
              />
            </label>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 4: ENQUIRIES & DPDP DELETIONS ==================== */}
      {subTab === 'enquiries' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#142B46]">Product Enquiries ({overview.enquiries.length})</h3>
            {overview.enquiries.length === 0 ? (
              <p className="text-slate-500">No product enquiries received yet.</p>
            ) : (
              overview.enquiries.map((e) => (
                <div key={e.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#142B46]">
                      {e.name} · <span className="uppercase text-amber-800">{e.product}</span>
                    </span>
                    <select
                      value={e.status}
                      onChange={(ev) =>
                        void handleEnquiryStatus(e.id, ev.target.value as ProductEnquiryRecord['status'])
                      }
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px]"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <p className="text-slate-600">{e.email} · {e.phone}</p>
                  <p className="text-slate-700">{e.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#142B46] flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-rose-600" /> DPDP Data Deletion Requests ({overview.deletionRequests.length})
            </h3>
            {overview.deletionRequests.length === 0 ? (
              <p className="text-slate-500">No active DPDP erasure requests.</p>
            ) : (
              overview.deletionRequests.map((r) => (
                <div key={r.id} className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 space-y-1">
                  <p className="font-bold text-rose-950">{r.email} ({r.product})</p>
                  <p className="text-rose-800">{r.reason}</p>
                  <p className="text-[11px] text-slate-500">{r.requestedAt.slice(0, 10)} · {r.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
