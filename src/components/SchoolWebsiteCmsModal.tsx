import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type {
  SchoolAccentTheme,
  SchoolGalleryCategory,
  SchoolWebsiteProfile,
} from '../types/schoolWebsite';
import { apiRequest } from '../utils/api';
import { AnimatedModalShell } from './motion/RaiMotionSystem';

interface SchoolWebsiteCmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  schoolName: string;
  canEdit: boolean;
}

export const SchoolWebsiteCmsModal: React.FC<SchoolWebsiteCmsModalProps> = ({
  isOpen,
  onClose,
  token,
  schoolName,
  canEdit,
}) => {
  const [profile, setProfile] = useState<SchoolWebsiteProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'identity' | 'features' | 'management' | 'gallery' | 'verification'
  >('identity');

  // Quick-add gallery state
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('/assets/schools/vis/usp-vr-classes.jpg');
  const [newPhotoCategory, setNewPhotoCategory] = useState<SchoolGalleryCategory>('Campus');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  // Quick-add management member
  const [newMgrName, setNewMgrName] = useState('');
  const [newMgrRole, setNewMgrRole] = useState('');
  const [newMgrQual, setNewMgrQual] = useState('');

  // Quick-add salient feature / USP
  const [newFeatTitle, setNewFeatTitle] = useState('');
  const [newFeatCategory, setNewFeatCategory] = useState('Academic Facilities');
  const [newFeatDesc, setNewFeatDesc] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setMessage(null);
    void apiRequest<{ profile: SchoolWebsiteProfile }>('/api/school-website/me', {}, token || undefined)
      .then((res) => {
        if (!cancelled) {
          setProfile(res.profile);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load school website settings.');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, token]);

  async function handleSave() {
    if (!profile || !canEdit) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiRequest<{ profile: SchoolWebsiteProfile }>(
        '/api/school-website/me',
        { method: 'PATCH', body: JSON.stringify(profile) },
        token || undefined,
      );
      setProfile(res.profile);
      setMessage('School Profile & Website updated and published live (audit logged)!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save website changes.');
    } finally {
      setSaving(false);
    }
  }

  function openLiveWebsite() {
    if (!profile) return;
    window.open(`/school/${profile.slug}`, '_blank', 'noopener');
  }

  function moveFeature(index: number, delta: -1 | 1) {
    if (!profile) return;
    const sorted = profile.salientFeatures
      .slice()
      .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
    const target = index + delta;
    if (target < 0 || target >= sorted.length) return;
    const [moved] = sorted.splice(index, 1);
    sorted.splice(target, 0, moved);
    const reordered = sorted.map((f, i) => ({ ...f, displayOrder: i + 1 }));
    setProfile({ ...profile, salientFeatures: reordered });
  }

  const pendingVerificationCount = (profile?.pendingAdminVerification || []).filter(
    (v) => v.status === 'Pending Approval',
  ).length;

  return (
    <AnimatedModalShell
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="school-website-cms-heading"
      panelClassName="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#254264] bg-[#142B46] px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          {profile?.logoUrl ? (
            <img
              src={profile.logoUrl}
              alt={`${schoolName} Logo`}
              className="h-10 w-10 rounded-xl bg-white p-0.5 object-contain border border-[#D6B66D]/60"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-[#D6B66D]/50 flex items-center justify-center text-[#D6B66D]">
              <Globe className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#D6B66D]">
              Tenant School Profile &amp; Official Website CMS
            </p>
            <h2 id="school-website-cms-heading" className="text-base font-extrabold text-white">
              {schoolName}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {profile && (
            <button
              type="button"
              onClick={openLiveWebsite}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#D6B66D] px-3 py-1.5 text-xs font-extrabold text-[#142B46] hover:bg-[#e1c580]"
            >
              Open Live Website
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close website studio"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {loading && <p className="text-xs text-slate-500 py-8 text-center">Loading school profile configuration…</p>}
        {error && (
          <div className="rai-shake rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {profile && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['identity', 'Identity & Contact'],
                    ['features', `School USPs (${profile.salientFeatures.length})`],
                    ['management', `Leadership (${profile.managementTeam.length})`],
                    ['gallery', `Gallery (${profile.gallery.length})`],
                    [
                      'verification',
                      `Admin Approvals${pendingVerificationCount > 0 ? ` (${pendingVerificationCount})` : ''}`,
                    ],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      activeTab === id
                        ? 'bg-[#142B46] text-white'
                        : id === 'verification' && pendingVerificationCount > 0
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                Public URL: <strong>/school/{profile.slug}</strong>
              </span>
            </div>

            {activeTab === 'identity' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">Official Tagline</span>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={profile.tagline}
                      onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">School Motto / Positioning</span>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={profile.motto}
                      onChange={(e) => setProfile({ ...profile, motto: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">Website Color Theme</span>
                    <select
                      disabled={!canEdit}
                      value={profile.accentTheme}
                      onChange={(e) =>
                        setProfile({ ...profile, accentTheme: e.target.value as SchoolAccentTheme })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-semibold"
                    >
                      <option value="royal_navy">Royal Navy &amp; Gold</option>
                      <option value="emerald_heritage">Emerald Heritage</option>
                      <option value="crimson_scholar">Crimson Scholar</option>
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">HBSE School Code</span>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={profile.hbseSchoolCode || ''}
                      onChange={(e) => setProfile({ ...profile, hbseSchoolCode: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                    />
                  </label>
                  <label className="flex items-center gap-2 pt-5 font-bold text-slate-700">
                    <input
                      type="checkbox"
                      disabled={!canEdit}
                      checked={profile.admissionsOpen}
                      onChange={(e) => setProfile({ ...profile, admissionsOpen: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Admissions Open Banner Active
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="font-bold text-slate-700">Principal’s Desk Highlight Quote</span>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={profile.principalMessage.quote}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        principalMessage: { ...profile.principalMessage, quote: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="font-bold text-slate-700">Principal’s Full Welcome Message</span>
                  <textarea
                    rows={3}
                    disabled={!canEdit}
                    value={profile.principalMessage.fullMessage}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        principalMessage: { ...profile.principalMessage, fullMessage: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="block space-y-1 sm:col-span-2">
                    <span className="font-bold text-slate-700">Campus Address</span>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={profile.contact.address}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          contact: { ...profile.contact, address: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">Primary Contact Phone</span>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={profile.contact.phone}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          contact: {
                            ...profile.contact,
                            phone: e.target.value,
                            admissionsPhone: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-4 text-xs">
                <p className="text-[11px] text-slate-500">
                  Reorder display order or toggle Active/Inactive for any School USP. Inactive USPs are hidden publicly without deleting data.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {profile.salientFeatures
                    .slice()
                    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
                    .map((f, idx, arr) => {
                      const isActive = f.active !== false;
                      return (
                        <div
                          key={f.id}
                          className={`rounded-xl border p-3 flex items-start justify-between gap-2 ${
                            isActive ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-slate-100/70 opacity-65'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-slate-400">
                                #{f.displayOrder ?? idx + 1}
                              </span>
                              <p className="font-bold text-slate-900 truncate">{f.title}</p>
                            </div>
                            <p className="text-[10px] font-semibold text-amber-800">{f.category || f.badge}</p>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{f.description}</p>
                          </div>
                          {canEdit && (
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveFeature(idx, -1)}
                                  title="Move up"
                                  className="rounded border border-slate-200 bg-white p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === arr.length - 1}
                                  onClick={() => moveFeature(idx, 1)}
                                  title="Move down"
                                  className="rounded border border-slate-200 bg-white p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setProfile({
                                    ...profile,
                                    salientFeatures: profile.salientFeatures.map((x) =>
                                      x.id === f.id ? { ...x, active: !isActive } : x,
                                    ),
                                  })
                                }
                                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isActive ? 'Active' : 'Inactive'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
                {canEdit && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
                    <p className="font-bold text-[#142B46]">Add New School USP</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newFeatTitle}
                        onChange={(e) => setNewFeatTitle(e.target.value)}
                        placeholder="Feature title"
                        className="rounded-lg border border-slate-300 px-3 py-1.5"
                      />
                      <input
                        type="text"
                        value={newFeatCategory}
                        onChange={(e) => setNewFeatCategory(e.target.value)}
                        placeholder="Category"
                        className="rounded-lg border border-slate-300 px-3 py-1.5"
                      />
                      <input
                        type="text"
                        value={newFeatDesc}
                        onChange={(e) => setNewFeatDesc(e.target.value)}
                        placeholder="Short description..."
                        className="rounded-lg border border-slate-300 px-3 py-1.5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newFeatTitle.trim()) return;
                        setProfile({
                          ...profile,
                          salientFeatures: [
                            ...profile.salientFeatures,
                            {
                              id: `feat-${Date.now()}`,
                              title: newFeatTitle.trim(),
                              description: newFeatDesc.trim() || 'Verified campus programme.',
                              badge: newFeatCategory.trim() || 'Campus USP',
                              category: newFeatCategory.trim() || 'Academic Facilities',
                              iconKey: 'academics',
                              highlightMetric: 'Featured',
                              displayOrder: profile.salientFeatures.length + 1,
                              active: true,
                            },
                          ],
                        });
                        setNewFeatTitle('');
                        setNewFeatDesc('');
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 font-bold text-white"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add USP
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'management' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.managementTeam.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {m.photoUrl && (
                          <img
                            src={m.photoUrl}
                            alt={m.name}
                            className="h-12 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{m.name}</p>
                          <p className="text-[11px] font-semibold text-rose-700">{m.roleTitle}</p>
                          <p className="text-[10px] text-slate-500 truncate">{m.email}</p>
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setProfile({
                                ...profile,
                                managementTeam: profile.managementTeam.map((x) =>
                                  x.id === m.id
                                    ? { ...x, contactVisible: x.contactVisible === false ? true : false }
                                    : x,
                                ),
                              })
                            }
                            title="Toggle public email visibility"
                            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold ${
                              m.contactVisible !== false
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {m.contactVisible !== false ? (
                              <>
                                <Eye className="h-3 w-3" /> Contact On
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" /> Hidden
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setProfile({
                                ...profile,
                                managementTeam: profile.managementTeam.filter((x) => x.id !== m.id),
                              })
                            }
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {canEdit && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
                    <p className="font-bold text-[#142B46]">Add Management / Leadership Profile</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newMgrName}
                        onChange={(e) => setNewMgrName(e.target.value)}
                        placeholder="Full name"
                        className="rounded-lg border border-slate-300 px-3 py-1.5"
                      />
                      <input
                        type="text"
                        value={newMgrRole}
                        onChange={(e) => setNewMgrRole(e.target.value)}
                        placeholder="Designation"
                        className="rounded-lg border border-slate-300 px-3 py-1.5"
                      />
                      <input
                        type="text"
                        value={newMgrQual}
                        onChange={(e) => setNewMgrQual(e.target.value)}
                        placeholder="Qualification / Bio"
                        className="rounded-lg border border-slate-300 px-3 py-1.5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newMgrName.trim()) return;
                        const initials = newMgrName
                          .trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((p) => p[0]?.toUpperCase() || '')
                          .join('');
                        setProfile({
                          ...profile,
                          managementTeam: [
                            ...profile.managementTeam,
                            {
                              id: `mgr-${Date.now()}`,
                              name: newMgrName.trim(),
                              roleTitle: newMgrRole.trim() || 'Management Member',
                              qualification: newMgrQual.trim() || 'Educational Leadership',
                              bio: 'Dedicated to student achievement and parent partnership.',
                              initials: initials || 'MG',
                              contactVisible: false,
                            },
                          ],
                        });
                        setNewMgrName('');
                        setNewMgrRole('');
                        setNewMgrQual('');
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 font-bold text-white"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Member
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                  {profile.gallery.map((g) => (
                    <div key={g.id} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      <img src={g.imageUrl} alt={g.title} className="h-28 w-full object-cover" />
                      <div className="p-2.5 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{g.title}</p>
                          <p className="text-[10px] text-slate-500">{g.category}</p>
                        </div>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              setProfile({
                                ...profile,
                                gallery: profile.gallery.filter((x) => x.id !== g.id),
                              })
                            }
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {canEdit && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
                    <p className="font-bold text-[#142B46]">Add Authentic School Photograph</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newPhotoTitle}
                        onChange={(e) => setNewPhotoTitle(e.target.value)}
                        placeholder="Photo title"
                        className="rounded-lg border border-slate-300 px-3 py-1.5"
                      />
                      <select
                        value={newPhotoCategory}
                        onChange={(e) => setNewPhotoCategory(e.target.value as SchoolGalleryCategory)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold"
                      >
                        <option value="Campus">Campus</option>
                        <option value="Classrooms">Classrooms</option>
                        <option value="Labs & STEM">Labs &amp; STEM</option>
                        <option value="Events & Culture">Events &amp; Culture</option>
                        <option value="Sports & Guidance">Sports &amp; Guidance</option>
                      </select>
                      <input
                        type="text"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="Image URL"
                        className="rounded-lg border border-slate-300 px-3 py-1.5"
                      />
                    </div>
                    <input
                      type="text"
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                      placeholder="Short photo caption..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPhotoTitle.trim() || !newPhotoUrl.trim()) return;
                        setProfile({
                          ...profile,
                          gallery: [
                            ...profile.gallery,
                            {
                              id: `gal-${Date.now()}`,
                              title: newPhotoTitle.trim(),
                              category: newPhotoCategory,
                              imageUrl: newPhotoUrl.trim(),
                              caption: newPhotoCaption.trim() || 'Campus activity highlight.',
                              tag: newPhotoCategory,
                            },
                          ],
                        });
                        setNewPhotoTitle('');
                        setNewPhotoCaption('');
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 font-bold text-white"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Photo
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Administrator Verification Queue:</strong> Items below had discrepancies across older brochures/website or remain configurable pending official school administrator approval.
                  </p>
                </div>
                {(profile.pendingAdminVerification || []).length === 0 ? (
                  <p className="text-center text-slate-500 py-6">All institutional fields are verified.</p>
                ) : (
                  <div className="space-y-2.5">
                    {(profile.pendingAdminVerification || []).map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-3.5 flex flex-wrap items-start justify-between gap-3 ${
                          item.status === 'Approved'
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : 'border-amber-200 bg-white'
                        }`}
                      >
                        <div className="space-y-1 max-w-2xl">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{item.fieldLabel}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                item.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-[#142B46]">
                            Current Value: {item.currentValue}
                          </p>
                          <p className="text-[11px] text-slate-600">{item.discrepancyNote}</p>
                        </div>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              setProfile({
                                ...profile,
                                pendingAdminVerification: (profile.pendingAdminVerification || []).map((v) =>
                                  v.id === item.id
                                    ? {
                                        ...v,
                                        status: v.status === 'Approved' ? 'Pending Approval' : 'Approved',
                                        approvedAt: new Date().toISOString().slice(0, 10),
                                      }
                                    : v,
                                ),
                              })
                            }
                            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${
                              item.status === 'Approved'
                                ? 'border border-slate-300 bg-white text-slate-700'
                                : 'bg-emerald-700 text-white hover:bg-emerald-800'
                            }`}
                          >
                            {item.status === 'Approved' ? 'Mark Pending' : 'Approve Field'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="text-[11px] text-slate-500">
                Tenant-isolated changes — saving updates ONLY {schoolName} and writes an audit log entry.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                {canEdit && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleSave()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E3B5C] disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5 text-[#D6B66D]" />
                    {saving ? 'Publishing…' : 'Save & Publish Profile'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AnimatedModalShell>
  );
};
