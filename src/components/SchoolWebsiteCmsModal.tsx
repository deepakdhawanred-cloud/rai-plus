import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
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
  const [activeTab, setActiveTab] = useState<'identity' | 'features' | 'management' | 'gallery'>('identity');

  // Quick-add gallery state
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('/assets/images/hero_campus_india_1794713007660.jpg');
  const [newPhotoCategory, setNewPhotoCategory] = useState<SchoolGalleryCategory>('Campus');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  // Quick-add management member
  const [newMgrName, setNewMgrName] = useState('');
  const [newMgrRole, setNewMgrRole] = useState('');
  const [newMgrQual, setNewMgrQual] = useState('');

  // Quick-add salient feature
  const [newFeatTitle, setNewFeatTitle] = useState('');
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
      setMessage('School Website updated and published live!');
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

  return (
    <AnimatedModalShell
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="school-website-cms-heading"
      panelClassName="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#254264] bg-[#142B46] px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 border border-[#D6B66D]/50 flex items-center justify-center text-[#D6B66D]">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#D6B66D]">
              Onboarded School Public Website Builder
            </p>
            <h2 id="school-website-cms-heading" className="text-base font-extrabold text-white">
              {schoolName} — Official Microsite
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
        {loading && <p className="text-xs text-slate-500 py-8 text-center">Loading your school website configuration…</p>}
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
                    ['identity', 'Hero, Message & Contact'],
                    ['features', `Salient Features (${profile.salientFeatures.length})`],
                    ['management', `Management (${profile.managementTeam.length})`],
                    ['gallery', `Gallery (${profile.gallery.length})`],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      activeTab === id
                        ? 'bg-[#142B46] text-white'
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
                    <span className="font-bold text-slate-700">School Tagline</span>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={profile.tagline}
                      onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">School Motto</span>
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
                    <span className="font-bold text-slate-700">Established Year</span>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={profile.establishedYear}
                      onChange={(e) => setProfile({ ...profile, establishedYear: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block space-y-1">
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
                    <span className="font-bold text-slate-700">Admissions Helpline</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.salientFeatures.map((f) => (
                    <div
                      key={f.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{f.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{f.description}</p>
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            setProfile({
                              ...profile,
                              salientFeatures: profile.salientFeatures.filter((x) => x.id !== f.id),
                            })
                          }
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {canEdit && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
                    <p className="font-bold text-[#142B46]">Add Salient Feature</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newFeatTitle}
                        onChange={(e) => setNewFeatTitle(e.target.value)}
                        placeholder="Feature title (e.g. Robotics & AI Lab)"
                        className="rounded-lg border border-slate-300 px-3 py-1.5"
                      />
                      <input
                        type="text"
                        value={newFeatDesc}
                        onChange={(e) => setNewFeatDesc(e.target.value)}
                        placeholder="Short description..."
                        className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-1.5"
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
                              description: newFeatDesc.trim() || 'Verified campus excellence highlight.',
                              badge: 'Campus Highlight',
                              iconKey: 'academics',
                              highlightMetric: 'Featured',
                            },
                          ],
                        });
                        setNewFeatTitle('');
                        setNewFeatDesc('');
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 font-bold text-white"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Feature
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
                      <div>
                        <p className="font-bold text-slate-900">{m.name}</p>
                        <p className="text-[11px] font-semibold text-amber-800">{m.roleTitle}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{m.qualification}</p>
                      </div>
                      {canEdit && (
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
                      )}
                    </div>
                  ))}
                </div>
                {canEdit && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
                    <p className="font-bold text-[#142B46]">Add Management / Leadership Member</p>
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
                        placeholder="Role (e.g. Vice Principal)"
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <p className="font-bold text-[#142B46]">Add Gallery Photo</p>
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

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="text-[11px] text-slate-500">
                Changes reflect immediately on your live school website and Admissions CRM.
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
                    {saving ? 'Publishing…' : 'Save & Publish Website'}
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
