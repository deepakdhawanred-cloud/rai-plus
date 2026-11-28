import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Bus,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  FlaskConical,
  Globe,
  GraduationCap,
  HeartHandshake,
  Images,
  Layers,
  Mail,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import type { RouteRecommendationResult } from '../../types';
import type {
  PublicSchoolWebsitePayload,
  SchoolAccentTheme,
  SchoolGalleryCategory,
  SchoolWebsiteIconKey,
} from '../../types/schoolWebsite';
import { apiRequest } from '../../utils/api';
import {
  SCHOOL_GALLERY_CATEGORIES,
  filterSchoolGallery,
  validateSchoolWebsiteAdmissionForm,
} from '../../utils/schoolWebsiteEngine';
import {
  AnimatedModalShell,
  AnimatedNumber,
  AnimatedPageTransition,
  StaggerCard,
  StaggerGrid,
} from '../motion/RaiMotionSystem';

interface SchoolMicrositePageProps {
  schoolSlug: string;
  onSelectSchoolSlug: (slug: string) => void;
  onBackToRaiPlus: () => void;
  onOpenLogin: () => void;
}

const THEME_STYLES: Record<
  SchoolAccentTheme,
  {
    primaryBg: string;
    primaryHover: string;
    primaryText: string;
    accentBg: string;
    accentText: string;
    badgeBg: string;
    heroOverlay: string;
    borderAccent: string;
  }
> = {
  royal_navy: {
    primaryBg: 'bg-[#142B46]',
    primaryHover: 'hover:bg-[#1E3B5C]',
    primaryText: 'text-[#142B46]',
    accentBg: 'bg-[#D6B66D]',
    accentText: 'text-[#937024]',
    badgeBg: 'bg-[#FAF1DF] border-[#D6B66D]/60 text-[#7B5D1C]',
    heroOverlay: 'from-[#0D1E33]/92 via-[#142B46]/82 to-[#142B46]/48',
    borderAccent: 'border-[#D6B66D]/50',
  },
  emerald_heritage: {
    primaryBg: 'bg-[#0F3D35]',
    primaryHover: 'hover:bg-[#165248]',
    primaryText: 'text-[#0F3D35]',
    accentBg: 'bg-amber-400',
    accentText: 'text-emerald-800',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    heroOverlay: 'from-[#08241F]/92 via-[#0F3D35]/80 to-[#0F3D35]/45',
    borderAccent: 'border-emerald-300/60',
  },
  crimson_scholar: {
    primaryBg: 'bg-[#4C1D24]',
    primaryHover: 'hover:bg-[#642630]',
    primaryText: 'text-[#4C1D24]',
    accentBg: 'bg-amber-400',
    accentText: 'text-rose-900',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-900',
    heroOverlay: 'from-[#2A0E12]/92 via-[#4C1D24]/80 to-[#4C1D24]/45',
    borderAccent: 'border-amber-300/60',
  },
};

function renderFeatureIcon(iconKey: SchoolWebsiteIconKey) {
  switch (iconKey) {
    case 'academics':
      return BookOpen;
    case 'stem':
      return FlaskConical;
    case 'transport':
      return Bus;
    case 'safety':
      return ShieldCheck;
    case 'sports':
      return Trophy;
    case 'transparency':
      return CheckCircle2;
    case 'leadership':
      return Award;
    case 'digital':
    default:
      return Sparkles;
  }
}

const APPLYING_CLASSES = [
  'Pre-Primary (Configurable)',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11 (Science)',
  'Class 11 (Commerce)',
  'Class 11 (Humanities)',
];

export const SchoolMicrositePage: React.FC<SchoolMicrositePageProps> = ({
  schoolSlug,
  onSelectSchoolSlug,
  onBackToRaiPlus,
  onOpenLogin,
}) => {
  const [payload, setPayload] = useState<PublicSchoolWebsitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // USP & Gallery filters
  const [uspCategoryFilter, setUspCategoryFilter] = useState<string>('All');
  const [galleryCategory, setGalleryCategory] = useState<'All' | SchoolGalleryCategory>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dedicated Admission Enquiry Form state
  const [studentName, setStudentName] = useState('');
  const [applyingClass, setApplyingClass] = useState('Class 6');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredVisitDate, setPreferredVisitDate] = useState('');
  const [locality, setLocality] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [recommendedRoute, setRecommendedRoute] = useState<RouteRecommendationResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setUspCategoryFilter('All');
    setGalleryCategory('All');
    setLightboxIndex(null);
    setFormSuccess(null);
    setFormError(null);
    setRecommendedRoute(null);

    void apiRequest<PublicSchoolWebsitePayload>(
      `/api/public/school-website/${encodeURIComponent(schoolSlug || 'vis')}`,
    )
      .then((res) => {
        if (!cancelled) {
          setPayload(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Unable to load school website.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [schoolSlug]);

  const activeOrderedUsps = useMemo(() => {
    if (!payload) return [];
    return payload.profile.salientFeatures
      .filter((f) => f.active !== false)
      .slice()
      .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
  }, [payload]);

  const uspCategories = useMemo(() => {
    const cats = Array.from(
      new Set(activeOrderedUsps.map((u) => u.category).filter((c): c is string => Boolean(c))),
    );
    return ['All', ...cats];
  }, [activeOrderedUsps]);

  const visibleUsps = useMemo(() => {
    if (uspCategoryFilter === 'All') return activeOrderedUsps;
    return activeOrderedUsps.filter((u) => u.category === uspCategoryFilter);
  }, [activeOrderedUsps, uspCategoryFilter]);

  const filteredGallery = useMemo(() => {
    if (!payload) return [];
    return filterSchoolGallery(payload.profile.gallery, galleryCategory);
  }, [payload, galleryCategory]);

  const activeLightboxItem =
    lightboxIndex !== null && filteredGallery[lightboxIndex]
      ? filteredGallery[lightboxIndex]
      : null;

  function scrollToAnchor(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleCopyWebsiteLink() {
    if (!payload || typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/school/${payload.school.slug}`;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2400);
  }

  async function handleAdmissionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payload) return;
    setFormError(null);
    setFormSuccess(null);
    setRecommendedRoute(null);

    const errMsg = validateSchoolWebsiteAdmissionForm({
      studentName,
      applyingClass,
      parentName,
      phone,
    });
    if (errMsg) {
      setFormError(errMsg);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest<{
        ok: boolean;
        schoolName?: string;
        recommendedRoute?: RouteRecommendationResult | null;
      }>('/api/public/admission-enquiry', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: payload.school.id,
          studentName: studentName.trim(),
          applyingClass,
          parentName: parentName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          preferredVisitDate: preferredVisitDate.trim(),
          locality: locality.trim() || payload.school.city,
          notes: notes.trim(),
        }),
      });
      setRecommendedRoute(res.recommendedRoute || null);
      setFormSuccess(
        `Thank you, ${parentName.trim()}! Your admission enquiry for ${studentName.trim()} (${applyingClass}) has been logged directly into ${payload.school.name}’s Admissions Desk. Our admissions team will reach out shortly.`,
      );
      setStudentName('');
      setParentName('');
      setPhone('');
      setEmail('');
      setPreferredVisitDate('');
      setLocality('');
      setNotes('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not submit admission enquiry.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-8">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-xs">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#142B46] text-[#D6B66D] flex items-center justify-center animate-pulse">
            <GraduationCap className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-[#142B46]">Loading Official School Profile…</p>
          <p className="text-xs text-slate-500">Fetching campus USPs, leadership, facilities, gallery &amp; admissions desk</p>
        </div>
      </div>
    );
  }

  if (loadError || !payload) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-rose-200 bg-white p-7 text-center space-y-4 shadow-sm">
          <Building2 className="h-10 w-10 text-rose-600 mx-auto" />
          <h1 className="text-lg font-extrabold text-slate-900">School Website Not Found</h1>
          <p className="text-xs text-slate-600">{loadError || 'We could not find an onboarded school for this address.'}</p>
          <button
            type="button"
            onClick={onBackToRaiPlus}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B46] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1E3B5C]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Rai Plus Platform
          </button>
        </div>
      </div>
    );
  }

  const { school, profile, upcomingEvents, transportCoverage, allOnboardedSchools } = payload;
  const theme = THEME_STYLES[profile.accentTheme] || THEME_STYLES.royal_navy;
  const activeFacilities = (profile.facilityCategories || []).filter((f) => f.active);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 flex flex-col">
      {/* Subtle Top Partner Network Bar */}
      <div className="bg-slate-950 text-slate-200 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBackToRaiPlus}
              className="inline-flex items-center gap-1 rounded-md bg-slate-800/90 px-2.5 py-1 font-semibold text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Rai Plus Home
            </button>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400 font-medium">Partner School Websites:</span>
            <div className="flex flex-wrap items-center gap-1">
              {allOnboardedSchools.map((s) => {
                const isCurrent = s.id === school.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectSchoolSlug(s.slug)}
                    className={`rounded-md px-2 py-0.5 font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-[#D6B66D] text-[#142B46]'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {s.name.split(',')[0].replace('Senior Secondary', '').trim()}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyWebsiteLink}
            className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Copy className="h-3 w-3 text-[#D6B66D]" />
            {copiedLink ? 'Link Copied!' : `Share /school/${school.slug}`}
          </button>
        </div>
      </div>

      {/* Dedicated Institutional School Header with Authentic School Logo */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={`${school.name} Official Logo`}
                className="h-12 w-12 rounded-xl border border-slate-200 bg-white object-contain p-0.5 shadow-xs shrink-0"
              />
            ) : (
              <div
                className={`h-11 w-11 rounded-xl ${theme.primaryBg} text-[#FAF4EC] flex items-center justify-center font-display font-black text-sm tracking-tight shadow-xs shrink-0 border border-[#D6B66D]/50`}
              >
                {profile.shortName.slice(0, 3)}
              </div>
            )}
            <div className="min-w-0">
              <p className={`font-display text-sm sm:text-base font-extrabold truncate ${theme.primaryText}`}>
                {school.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {profile.tagline} · {school.city}, {school.state}
              </p>
            </div>
          </div>

          <nav
            aria-label="School website navigation"
            className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600"
          >
            <button type="button" onClick={() => scrollToAnchor('school-philosophy')} className="hover:text-slate-950">
              Philosophy
            </button>
            <button type="button" onClick={() => scrollToAnchor('school-features')} className="hover:text-slate-950">
              School USPs
            </button>
            <button type="button" onClick={() => scrollToAnchor('school-management')} className="hover:text-slate-950">
              Leadership
            </button>
            <button type="button" onClick={() => scrollToAnchor('school-facilities')} className="hover:text-slate-950">
              Facilities
            </button>
            <button type="button" onClick={() => scrollToAnchor('school-gallery')} className="hover:text-slate-950">
              Gallery
            </button>
            <button type="button" onClick={() => scrollToAnchor('school-admissions')} className="hover:text-slate-950">
              Admissions
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollToAnchor('school-admissions')}
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg ${theme.primaryBg} ${theme.primaryHover} px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors whitespace-nowrap`}
            >
              Admission Enquiry
              <ArrowRight className="h-3.5 w-3.5 text-[#D6B66D]" />
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Portal Login
            </button>
          </div>
        </div>
      </header>

      <AnimatedPageTransition routeKey={school.id}>
        <main className="flex-1">
          {/* ==================== SECTION 1: HERO BANNER ==================== */}
          <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950">
            <img
              src={profile.heroImageUrl}
              alt={`${school.name} Authentic Campus Showcase`}
              className="absolute inset-0 h-full w-full object-cover object-top opacity-45"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${theme.heroOverlay}`} />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-5 text-white">
                  {profile.admissionsOpen && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#D6B66D]/70 bg-white/10 backdrop-blur-xs px-3.5 py-1 text-xs font-bold text-[#F5DC9B]">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{profile.heroHighlightBadge}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {profile.logoUrl && (
                      <img
                        src={profile.logoUrl}
                        alt={`${school.name} Crest`}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-[#D6B66D]/70 bg-white object-contain p-1 shadow-xl shrink-0"
                      />
                    )}
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.22em] text-[#D6B66D]">
                        {profile.tagline}
                      </p>
                      <h1
                        className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.06] text-white"
                        style={{ textWrap: 'balance' }}
                      >
                        {school.name}
                      </h1>
                      <p className="text-xs sm:text-sm font-medium text-slate-200">
                        {school.city}, {school.state}, India
                      </p>
                    </div>
                  </div>

                  <p className="text-base sm:text-lg text-slate-100/95 leading-relaxed max-w-2xl">
                    {profile.motto}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-3 py-1.5 font-medium">
                      <GraduationCap className="h-3.5 w-3.5 text-[#D6B66D]" />
                      {profile.gradesOffered}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-3 py-1.5 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      {profile.affiliationNote}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => scrollToAnchor('school-admissions')}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#D6B66D] px-5 py-3 text-sm font-extrabold text-[#142B46] shadow-lg hover:bg-[#e1c580] transition-all"
                    >
                      Apply for Admission ({profile.admissionsSession})
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToAnchor('school-gallery')}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-xs px-5 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all"
                    >
                      <Images className="h-4 w-4 text-[#D6B66D]" />
                      Explore Authentic Gallery
                    </button>
                  </div>
                </div>

                {/* Right Quick Campus Card */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-white/20 bg-white/95 backdrop-blur-md p-6 text-slate-900 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Official Verified Profile · {school.board}
                        </p>
                        <h2 className={`font-display text-base font-extrabold ${theme.primaryText}`}>
                          {profile.shortName} Institutional Snapshot
                        </h2>
                      </div>
                      <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        HBSE VERIFIED
                      </span>
                    </div>

                    <StaggerGrid className="grid grid-cols-2 gap-3">
                      {profile.campusStats.map((stat) => (
                        <StaggerCard
                          key={stat.label}
                          className="rounded-xl border border-slate-200 bg-slate-50/90 p-3.5"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            {stat.label}
                          </p>
                          <p className={`mt-1 text-2xl font-extrabold ${theme.primaryText}`}>
                            <AnimatedNumber
                              value={stat.value}
                              suffix={stat.suffix || ''}
                              formatIndian={stat.label !== 'HBSE School Code'}
                            />
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{stat.sublabel}</p>
                        </StaggerCard>
                      ))}
                    </StaggerGrid>

                    <div className="rounded-xl bg-[#FAF4EC] border border-[#D6B66D]/50 px-4 py-3 text-xs text-[#142B46] flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold">Admissions Desk · {profile.contact.admissionsPhone}</p>
                        <p className="text-[11px] text-slate-600">
                          {profile.contact.email} · {profile.contact.websiteDomainLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => scrollToAnchor('school-admissions')}
                        className="rounded-lg bg-[#142B46] px-3 py-1.5 text-[11px] font-bold text-white shrink-0"
                      >
                        Enquire
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== SECTION 2: SCHOOL PHILOSOPHY & ACADEMIC IDENTITY ==================== */}
          {profile.philosophy && (
            <section id="school-philosophy" className="border-b border-slate-200 bg-white py-12 sm:py-14">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.badgeBg}`}
                    >
                      <Award className="h-3.5 w-3.5" />
                      School Philosophy · {profile.tagline}
                    </span>
                    <div className="space-y-1.5">
                      {profile.philosophy.statements.map((stmt, idx) => (
                        <h2
                          key={stmt}
                          className={
                            idx === 0
                              ? `font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.primaryText}`
                              : 'font-display text-base sm:text-lg font-bold text-rose-700'
                          }
                        >
                          “{stmt}”
                        </h2>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {profile.philosophy.pillars.map((p) => (
                        <div
                          key={p.key}
                          className={`rounded-2xl border ${theme.borderAccent} bg-[#FAF5EC]/70 p-4 space-y-1`}
                        >
                          <p className={`font-display text-lg font-black tracking-wider ${theme.primaryText}`}>
                            {p.title}
                          </p>
                          <p className="text-xs font-semibold text-slate-700">{p.subtitle}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {profile.philosophy.coreValues.map((val) => (
                        <span
                          key={val}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#142B46]"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Academic Structure Card (HBSE · NCERT/SCERT · Streams — No CBSE) */}
                  <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-[#FAFBFD] p-6 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                          Academic Structure
                        </p>
                        <h3 className={`font-display text-base font-extrabold ${theme.primaryText}`}>
                          Board, Curriculum &amp; Streams
                        </h3>
                      </div>
                      <span className="rounded-lg bg-[#142B46] px-2.5 py-1 font-mono text-[10px] font-bold text-[#D6B66D]">
                        {school.board}
                      </span>
                    </div>

                    <dl className="space-y-2.5 text-xs">
                      <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                        <dt className="font-semibold text-slate-500">Affiliated Board</dt>
                        <dd className="font-bold text-slate-900 text-right">Haryana Board ({school.board})</dd>
                      </div>
                      <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                        <dt className="font-semibold text-slate-500">Curriculum</dt>
                        <dd className="font-bold text-slate-900 text-right">{profile.curriculum || 'NCERT/SCERT Haryana-based'}</dd>
                      </div>
                      <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                        <dt className="font-semibold text-slate-500">UDISE / HBSE Code</dt>
                        <dd className="font-mono font-bold text-slate-900 text-right">
                          {school.udiseCode} · HBSE {profile.hbseSchoolCode || school.haryanaMisCode}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                        <dt className="font-semibold text-slate-500">Classes Offered</dt>
                        <dd className="font-bold text-slate-900 text-right">
                          Classes 1–12 {profile.prePrimaryConfigurable ? '(Pre-Primary Configurable)' : ''}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2 items-center pt-1">
                        <dt className="font-semibold text-slate-500">Senior Secondary Streams</dt>
                        <dd className="flex flex-wrap justify-end gap-1">
                          {(profile.streams || ['Science', 'Commerce', 'Humanities']).map((st) => (
                            <span
                              key={st}
                              className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-[#142B46]"
                            >
                              {st}
                            </span>
                          ))}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== SECTION 3: 16 SCHOOL USPs WITH AUTHENTIC BROCHURE PHOTOGRAPHS ==================== */}
          <section id="school-features" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-16 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-3xl space-y-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.badgeBg}`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Why Parents Trust {school.name} ({activeOrderedUsps.length} Core USPs)
                </span>
                <h2 className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.primaryText}`}>
                  A Complete Ecosystem for Your Child’s Growth
                </h2>
                <p className="text-sm text-slate-600">
                  Authentic facilities, new-age teaching methodologies, personalised counselling, and safe campus programmes designed around every child.
                </p>
              </div>
            </div>

            {/* Category filter chips for USPs */}
            {uspCategories.length > 2 && (
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter school USPs by category">
                {uspCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setUspCategoryFilter(cat)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                      uspCategoryFilter === cat
                        ? `${theme.primaryBg} text-white shadow-xs`
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {visibleUsps.map((feat) => {
                const Icon = renderFeatureIcon(feat.iconKey);
                return (
                  <StaggerCard
                    key={feat.id}
                    interactive
                    className="rai-card-interactive overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {feat.photoUrl && (
                        <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                          <img
                            src={feat.photoUrl}
                            alt={feat.title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-950/75 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white">
                            {feat.category || feat.badge}
                          </span>
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-lg ${theme.primaryBg} text-[#D6B66D] flex items-center justify-center shrink-0`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <h3 className={`font-display text-sm font-extrabold leading-snug ${theme.primaryText}`}>
                            {feat.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                      </div>
                    </div>
                    {feat.highlightMetric && (
                      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[10px] font-bold text-emerald-800">
                        <span>{feat.badge}</span>
                        <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                          {feat.highlightMetric}
                        </span>
                      </div>
                    )}
                  </StaggerCard>
                );
              })}
            </StaggerGrid>
          </section>

          {/* ==================== SECTION 4: MANAGEMENT & LEADERSHIP (ALL 5 PORTRAITS & MESSAGES) ==================== */}
          <section id="school-management" className="border-y border-slate-200 bg-white py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
              <div className="max-w-3xl space-y-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.badgeBg}`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Our Leadership — Guiding Today for a Brighter Tomorrow
                </span>
                <h2 className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.primaryText}`}>
                  School Management &amp; Academic Leadership
                </h2>
                <p className="text-sm text-slate-600">
                  Meet the leadership guiding {school.name} with discipline, care, innovation, and parent partnership.
                </p>
              </div>

              {/* Principal's Message Feature Card */}
              <div className={`rounded-2xl border ${theme.borderAccent} bg-gradient-to-br from-[#FAF5EC] via-white to-slate-50 p-6 sm:p-8 shadow-xs`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-3 flex flex-col items-center text-center space-y-3">
                    {profile.principalMessage.photoUrl ? (
                      <img
                        src={profile.principalMessage.photoUrl}
                        alt={profile.principalMessage.authorName}
                        className="h-28 w-24 rounded-2xl object-cover shadow-md border-2 border-[#D6B66D]/70"
                      />
                    ) : (
                      <div
                        className={`h-24 w-24 rounded-2xl ${theme.primaryBg} text-[#D6B66D] flex items-center justify-center font-display text-2xl font-black shadow-md border-2 border-[#D6B66D]/60`}
                      >
                        PR
                      </div>
                    )}
                    <div>
                      <p className={`font-display text-sm font-extrabold ${theme.primaryText}`}>
                        {profile.principalMessage.authorName}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {profile.principalMessage.roleTitle}
                      </p>
                    </div>
                  </div>
                  <div className="lg:col-span-9 space-y-3">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                      <Quote className="h-4 w-4 text-[#937024]" />
                      From the Principal’s Desk
                    </div>
                    <blockquote className={`font-display text-lg sm:text-xl font-bold leading-snug ${theme.primaryText}`}>
                      “{profile.principalMessage.quote}”
                    </blockquote>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {profile.principalMessage.fullMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* All 5 Individual Leadership Profiles */}
              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {profile.managementTeam.map((member) => (
                  <StaggerCard
                    key={member.id}
                    interactive
                    className="rai-card-interactive rounded-2xl border border-slate-200 bg-[#FAFBFD] p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-col items-center text-center space-y-2">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="h-28 w-24 rounded-xl object-cover border border-slate-200 shadow-xs"
                          />
                        ) : (
                          <div
                            className={`h-20 w-20 rounded-xl ${theme.primaryBg} text-[#FAF4EC] flex items-center justify-center font-display text-lg font-black border border-[#D6B66D]/50`}
                          >
                            {member.initials}
                          </div>
                        )}
                        <div>
                          <h3 className="font-display text-sm font-extrabold text-slate-900">
                            {member.name}
                          </h3>
                          <p className="text-[11px] font-bold text-rose-700">{member.roleTitle}</p>
                        </div>
                      </div>
                      {member.message && (
                        <p className="text-[11px] italic text-slate-700 bg-white border border-slate-200/80 rounded-xl p-2.5 leading-relaxed">
                          “{member.message}”
                        </p>
                      )}
                      <p className="text-[11px] text-slate-600 leading-relaxed">{member.bio}</p>
                    </div>
                    {member.email && member.contactVisible !== false && (
                      <div className="pt-2.5 border-t border-slate-200/80 flex items-center gap-1.5 text-[10px] text-slate-500 truncate">
                        <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </StaggerCard>
                ))}
              </StaggerGrid>
            </div>
          </section>

          {/* ==================== SECTION 5: 12 FACILITIES CATEGORIES & PARENT ENGAGEMENT ==================== */}
          {(activeFacilities.length > 0 || (profile.parentEngagementHighlights || []).length > 0) && (
            <section id="school-facilities" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-16 space-y-12">
              {activeFacilities.length > 0 && (
                <div className="space-y-6">
                  <div className="max-w-3xl space-y-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.badgeBg}`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      {activeFacilities.length} Facility &amp; Activity Pillars
                    </span>
                    <h2 className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.primaryText}`}>
                      School Facilities &amp; Student Activities
                    </h2>
                  </div>

                  <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeFacilities.map((fac) => (
                      <StaggerCard
                        key={fac.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs"
                      >
                        <h3 className={`font-display text-sm font-extrabold ${theme.primaryText}`}>
                          {fac.category}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{fac.summary}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {fac.highlights.map((h) => (
                            <span
                              key={h}
                              className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </StaggerCard>
                    ))}
                  </StaggerGrid>
                </div>
              )}

              {(profile.parentEngagementHighlights || []).length > 0 && (
                <div className="rounded-2xl border border-[#D6B66D]/60 bg-gradient-to-br from-[#142B46] to-[#1D3A5C] p-6 sm:p-8 text-white space-y-5 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-[#D6B66D]/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D6B66D]">
                        <HeartHandshake className="h-3.5 w-3.5" />
                        Together with Parents, We Shape Brighter Futures
                      </span>
                      <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                        Parent Engagement &amp; Family Partnership
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {(profile.parentEngagementHighlights || []).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xs p-4 space-y-1.5"
                      >
                        <p className="font-display text-xs font-extrabold text-[#D6B66D]">{item.title}</p>
                        <p className="text-[11px] text-slate-200 leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Transport Routes & Upcoming Events */}
              {(transportCoverage.length > 0 || upcomingEvents.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {transportCoverage.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-display text-sm font-extrabold flex items-center gap-2 ${theme.primaryText}`}>
                          <Bus className="h-4 w-4 text-amber-600" />
                          School Transport Routes ({transportCoverage.length} Active)
                        </h3>
                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Monitored Fleet
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {transportCoverage.map((r) => (
                          <div key={r.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
                            <p className="font-bold text-slate-900">{r.routeName}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{r.stopsPreview}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {upcomingEvents.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-display text-sm font-extrabold flex items-center gap-2 ${theme.primaryText}`}>
                          <Calendar className="h-4 w-4 text-amber-600" />
                          Upcoming Campus Events &amp; Calendar
                        </h3>
                        <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          Session {school.session}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {upcomingEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{ev.title}</p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {ev.category} · {ev.venue}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-lg bg-[#142B46] px-2.5 py-1 font-mono text-[10px] font-bold text-[#FAF4EC]">
                              {ev.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ==================== SECTION 6: AUTHENTIC CAMPUS PHOTO GALLERY ==================== */}
          <section id="school-gallery" className="border-t border-slate-200 bg-white py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.badgeBg}`}
                  >
                    <Images className="h-3.5 w-3.5" />
                    Authentic School Gallery
                  </span>
                  <h2 className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.primaryText}`}>
                    Inside {school.name}
                  </h2>
                  <p className="text-sm text-slate-600">
                    Real moments from our classrooms, VR sessions, computer labs, counselling rooms, and family home visits. Click any photo to view full screen.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter campus gallery">
                  {SCHOOL_GALLERY_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setGalleryCategory(cat);
                        setLightboxIndex(null);
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                        galleryCategory === cat
                          ? `${theme.primaryBg} text-white shadow-xs`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGallery.map((item, idx) => (
                  <StaggerCard
                    key={item.id}
                    interactive
                    onClick={() => setLightboxIndex(idx)}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-[#FAFBFD] shadow-xs hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="rounded-full bg-slate-950/75 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white">
                          {item.category}
                        </span>
                        <span className="rounded-full bg-[#D6B66D] px-2.5 py-0.5 text-[10px] font-extrabold text-[#142B46]">
                          {item.tag}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5 flex-1">
                      <h3 className={`font-display text-sm font-extrabold ${theme.primaryText}`}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.caption}</p>
                    </div>
                  </StaggerCard>
                ))}
              </StaggerGrid>
            </div>
          </section>

          {/* ==================== SECTION 7: DEDICATED ADMISSION ENQUIRY FORM ==================== */}
          <section
            id="school-admissions"
            className="border-t border-slate-200 bg-gradient-to-b from-[#FAF5EC]/70 to-white py-14 sm:py-16"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.badgeBg}`}
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    Direct School Admissions Desk
                  </span>
                  <h2 className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.primaryText}`}>
                    {profile.admissionsHeadline}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Submit your enquiry directly to <strong>{school.name}</strong> ({school.city}). Your request logs straight into the school’s Admissions CRM &amp; Day-1 Onboarding desk.
                  </p>

                  <div className="space-y-3 pt-1">
                    {[
                      {
                        step: '01',
                        title: 'Submit Online Enquiry & Preferred Visit Date',
                        desc: 'Share student class, parent contact & residential locality.',
                      },
                      {
                        step: '02',
                        title: 'Guided Campus Visit & Personalised Counselling',
                        desc: 'Experience our VR lab, digital panels, and 360° student mentoring.',
                      },
                      {
                        step: '03',
                        title: 'Seamless Admission, DMIT Plan & 4×/Yr Family Care',
                        desc: 'UDISE+ document checklist, Day-1 onboarding, and quarterly home visits.',
                      },
                    ].map((s) => (
                      <div
                        key={s.step}
                        className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3.5 shadow-2xs"
                      >
                        <span
                          className={`rounded-lg ${theme.primaryBg} text-[#D6B66D] font-mono text-xs font-extrabold px-2.5 py-1.5 shrink-0`}
                        >
                          {s.step}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{s.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className={`font-display text-lg font-extrabold ${theme.primaryText}`}>
                          Admission Enquiry &amp; Campus Visit Form
                        </h3>
                        <p className="text-xs text-slate-500">
                          Applying directly to <strong>{school.name}</strong> · HBSE Code {profile.hbseSchoolCode || school.haryanaMisCode}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                        Session {profile.admissionsSession}
                      </span>
                    </div>

                    {formError && (
                      <div
                        key={formError}
                        role="alert"
                        className="rai-shake rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800"
                      >
                        {formError}
                      </div>
                    )}

                    {formSuccess && (
                      <div
                        role="status"
                        data-testid="school-website-admission-success"
                        className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2 text-xs text-emerald-950"
                      >
                        <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          Enquiry Registered Successfully!
                        </p>
                        <p>{formSuccess}</p>
                        {recommendedRoute && (
                          <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[11px] text-slate-700">
                            <p className="font-bold text-[#142B46] flex items-center gap-1.5">
                              <Bus className="h-3.5 w-3.5 text-amber-600" />
                              Suggested Bus Route: {recommendedRoute.routeName} ({recommendedRoute.busNumber})
                            </p>
                            <p className="text-slate-600 mt-0.5">{recommendedRoute.reason}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <form onSubmit={handleAdmissionSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block space-y-1">
                          <span className="text-xs font-bold text-slate-700">Student Full Name *</span>
                          <input
                            type="text"
                            required
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="e.g. Aditya Yadav"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
                          />
                        </label>
                        <label className="block space-y-1">
                          <span className="text-xs font-bold text-slate-700">Applying for Class *</span>
                          <select
                            value={applyingClass}
                            onChange={(e) => setApplyingClass(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-[#142B46] focus:outline-none"
                          >
                            {APPLYING_CLASSES.map((cls) => (
                              <option key={cls} value={cls}>
                                {cls}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block space-y-1">
                          <span className="text-xs font-bold text-slate-700">Parent / Guardian Name *</span>
                          <input
                            type="text"
                            required
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            placeholder="e.g. Rajesh Yadav"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
                          />
                        </label>
                        <label className="block space-y-1">
                          <span className="text-xs font-bold text-slate-700">Mobile / WhatsApp Number *</span>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 99920 XXXXX"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <label className="block space-y-1">
                          <span className="text-xs font-bold text-slate-700">Parent Email</span>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="parent@email.com"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
                          />
                        </label>
                        <label className="block space-y-1">
                          <span className="text-xs font-bold text-slate-700">Residential Area / Village</span>
                          <input
                            type="text"
                            value={locality}
                            onChange={(e) => setLocality(e.target.value)}
                            placeholder={`e.g. Kapriwas / Pataudi Road`}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
                          />
                        </label>
                        <label className="block space-y-1">
                          <span className="text-xs font-bold text-slate-700">Preferred Campus Visit</span>
                          <input
                            type="date"
                            value={preferredVisitDate}
                            onChange={(e) => setPreferredVisitDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
                          />
                        </label>
                      </div>

                      <label className="block space-y-1">
                        <span className="text-xs font-bold text-slate-700">Questions / Transport or Stream Preference</span>
                        <textarea
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Share any questions regarding bus route, fee structure, streams, or transfer certificate..."
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl ${theme.primaryBg} ${theme.primaryHover} px-5 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-60 transition-all`}
                      >
                        {submitting ? 'Submitting Admission Enquiry…' : `Submit Admission Enquiry to ${school.name}`}
                        <ArrowRight className="h-4 w-4 text-[#D6B66D]" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== SECTION 8: CONTACT & FOOTER ==================== */}
          <footer id="school-contact" className={`${theme.primaryBg} text-slate-100`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {profile.logoUrl ? (
                    <img
                      src={profile.logoUrl}
                      alt={`${school.name} Logo`}
                      className="h-12 w-12 rounded-xl bg-white p-0.5 object-contain border border-[#D6B66D]/60"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-white/15 border border-[#D6B66D]/60 flex items-center justify-center font-display font-black text-sm text-[#D6B66D]">
                      {profile.shortName.slice(0, 3)}
                    </div>
                  )}
                  <div>
                    <p className="font-display text-base font-extrabold text-white">{school.name}</p>
                    <p className="text-[11px] font-bold text-[#D6B66D]">{profile.tagline}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{profile.affiliationNote}</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <p className="font-display text-xs font-extrabold uppercase tracking-wider text-[#D6B66D]">
                  Campus Address &amp; Contact
                </p>
                <p className="flex items-start gap-2 text-slate-200">
                  <MapPin className="h-4 w-4 text-[#D6B66D] shrink-0 mt-0.5" />
                  <span>{profile.contact.address}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-200">
                  <Phone className="h-4 w-4 text-[#D6B66D] shrink-0" />
                  <span>{profile.contact.phone}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-200">
                  <Mail className="h-4 w-4 text-[#D6B66D] shrink-0" />
                  <span>{profile.contact.email}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-200">
                  <Globe className="h-4 w-4 text-[#D6B66D] shrink-0" />
                  <span>{profile.contact.websiteDomainLabel}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-200">
                  <Clock className="h-4 w-4 text-[#D6B66D] shrink-0" />
                  <span>{profile.contact.officeHours}</span>
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <p className="font-display text-xs font-extrabold uppercase tracking-wider text-[#D6B66D]">
                  Student, Parent &amp; Faculty Portal
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Existing parents, students, and faculty of {school.name} can sign in directly for daily attendance, homework, 4×/year home visit updates, fees, and Learning Portal access.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="rounded-xl bg-[#D6B66D] px-4 py-2 text-xs font-extrabold text-[#142B46] hover:bg-[#e1c580] transition-colors"
                  >
                    Open School Portal Login
                  </button>
                  <button
                    type="button"
                    onClick={onBackToRaiPlus}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Powered by Rai Plus
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                <span>
                  © {new Date().getFullYear()} {school.name} ({profile.shortName}). All rights reserved.
                </span>
                <span>
                  {profile.contact.websiteDomainLabel} · Powered by <strong>Rai Plus</strong>
                </span>
              </div>
            </div>
          </footer>
        </main>
      </AnimatedPageTransition>

      {/* ==================== GALLERY LIGHTBOX MODAL ==================== */}
      <AnimatedModalShell
        isOpen={Boolean(activeLightboxItem)}
        onClose={() => setLightboxIndex(null)}
        ariaLabelledBy="school-gallery-lightbox-title"
        panelClassName="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-white shadow-2xl"
      >
        {activeLightboxItem && lightboxIndex !== null && (
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D6B66D]">
                  {activeLightboxItem.category} · {lightboxIndex + 1} of {filteredGallery.length}
                </p>
                <h3 id="school-gallery-lightbox-title" className="text-sm font-bold text-white">
                  {activeLightboxItem.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close gallery lightbox"
                onClick={() => setLightboxIndex(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative bg-black flex items-center justify-center max-h-[65vh] overflow-hidden">
              <img
                src={activeLightboxItem.imageUrl}
                alt={activeLightboxItem.title}
                className="max-h-[65vh] w-full object-contain"
              />
              {filteredGallery.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex - 1 + filteredGallery.length) % filteredGallery.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 p-2 text-white hover:bg-slate-800 border border-white/15"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => setLightboxIndex((lightboxIndex + 1) % filteredGallery.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 p-2 text-white hover:bg-slate-800 border border-white/15"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            <div className="px-5 py-4 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <p>{activeLightboxItem.caption}</p>
              <span className="rounded-full bg-[#D6B66D]/20 border border-[#D6B66D]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#D6B66D]">
                {activeLightboxItem.tag}
              </span>
            </div>
          </div>
        )}
      </AnimatedModalShell>
    </div>
  );
};
