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
  Images,
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
    heroOverlay: 'from-[#0D1E33]/92 via-[#142B46]/80 to-[#142B46]/45',
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
  'Nursery',
  'LKG',
  'UKG',
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

  // Gallery state
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
    setGalleryCategory('All');
    setLightboxIndex(null);
    setFormSuccess(null);
    setFormError(null);
    setRecommendedRoute(null);

    void apiRequest<PublicSchoolWebsitePayload>(
      `/api/public/school-website/${encodeURIComponent(schoolSlug || 'vis-jjr-01')}`,
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
          <p className="text-sm font-bold text-[#142B46]">Loading Official School Website…</p>
          <p className="text-xs text-slate-500">Fetching campus highlights, leadership, gallery &amp; admissions desk</p>
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

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 flex flex-col">
      {/* Subtle Top Partner Network Bar (Switch between any onboarded school website) */}
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
            <span className="hidden sm:inline text-slate-400 font-medium">Onboarded School Websites:</span>
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

      {/* Dedicated Institutional School Header (Feels like the school's own website!) */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* School Crest & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`h-11 w-11 rounded-xl ${theme.primaryBg} text-[#FAF4EC] flex items-center justify-center font-display font-black text-sm tracking-tight shadow-xs shrink-0 border border-[#D6B66D]/50`}
            >
              {profile.shortName.slice(0, 3)}
            </div>
            <div className="min-w-0">
              <p className={`font-display text-sm sm:text-base font-extrabold truncate ${theme.primaryText}`}>
                {school.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {school.board} Affiliated · Est. {profile.establishedYear} · {school.city}, {school.state}
              </p>
            </div>
          </div>

          {/* School Website Navigation */}
          <nav
            aria-label="School website navigation"
            className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600"
          >
            <button type="button" onClick={() => scrollToAnchor('school-features')} className="hover:text-slate-950">
              Salient Features
            </button>
            <button type="button" onClick={() => scrollToAnchor('school-management')} className="hover:text-slate-950">
              Management
            </button>
            <button type="button" onClick={() => scrollToAnchor('school-gallery')} className="hover:text-slate-950">
              Campus Gallery
            </button>
            <button type="button" onClick={() => scrollToAnchor('school-admissions')} className="hover:text-slate-950">
              Admissions {profile.admissionsSession}
            </button>
            <button type="button" onClick={() => scrollToAnchor('school-contact')} className="hover:text-slate-950">
              Contact
            </button>
          </nav>

          {/* School Website Actions */}
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
              School Portal Login
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
              alt={`${school.name} Campus`}
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${theme.heroOverlay}`} />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20 lg:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-5 text-white">
                  {profile.admissionsOpen && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#D6B66D]/70 bg-white/10 backdrop-blur-xs px-3.5 py-1 text-xs font-bold text-[#F5DC9B]">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{profile.heroHighlightBadge}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#D6B66D]">
                      {profile.motto}
                    </p>
                    <h1
                      className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-white"
                      style={{ textWrap: 'balance' }}
                    >
                      {school.name}
                    </h1>
                  </div>

                  <p className="text-base sm:text-lg text-slate-100/95 leading-relaxed max-w-2xl">
                    {profile.tagline}
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
                      Explore Campus Gallery
                    </button>
                  </div>
                </div>

                {/* Right Quick Campus Card */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-white/20 bg-white/95 backdrop-blur-md p-6 text-slate-900 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Verified Smart Campus Profile
                        </p>
                        <h2 className={`font-display text-base font-extrabold ${theme.primaryText}`}>
                          Campus at a Glance
                        </h2>
                      </div>
                      <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        ACTIVE TENANT
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
                            <AnimatedNumber value={stat.value} suffix={stat.suffix || ''} />
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{stat.sublabel}</p>
                        </StaggerCard>
                      ))}
                    </StaggerGrid>

                    <div className="rounded-xl bg-[#FAF4EC] border border-[#D6B66D]/50 px-4 py-3 text-xs text-[#142B46] flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold">Admissions Helpdesk</p>
                        <p className="text-[11px] text-slate-600">{profile.contact.admissionsPhone} · {profile.contact.officeHours}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => scrollToAnchor('school-admissions')}
                        className="rounded-lg bg-[#142B46] px-3 py-1.5 text-[11px] font-bold text-white shrink-0"
                      >
                        Book Visit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== SECTION 2: SALIENT FEATURES ==================== */}
          <section id="school-features" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-16 space-y-10">
            <div className="max-w-3xl space-y-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.badgeBg}`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Salient Features of {school.name}
              </span>
              <h2 className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.primaryText}`}>
                Why Families Choose {school.name}
              </h2>
              <p className="text-sm text-slate-600">
                Combining strong classroom academics, daily discipline, safe infrastructure, and 100% digital transparency for parents and learners.
              </p>
            </div>

            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {profile.salientFeatures.map((feat) => {
                const Icon = renderFeatureIcon(feat.iconKey);
                return (
                  <StaggerCard
                    key={feat.id}
                    interactive
                    className="rai-card-interactive rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className={`h-11 w-11 rounded-xl ${theme.primaryBg} text-[#D6B66D] flex items-center justify-center shadow-xs`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                          {feat.badge}
                        </span>
                      </div>
                      <h3 className={`font-display text-base font-extrabold ${theme.primaryText}`}>
                        {feat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                    {feat.highlightMetric && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                        <span>Verified Campus Standard</span>
                        <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                          {feat.highlightMetric}
                        </span>
                      </div>
                    )}
                  </StaggerCard>
                );
              })}
            </StaggerGrid>

            {/* Live Transport Routes & Upcoming Events Strip (auto-populated from school ERP) */}
            {(transportCoverage.length > 0 || upcomingEvents.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                {transportCoverage.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-display text-sm font-extrabold flex items-center gap-2 ${theme.primaryText}`}>
                        <Bus className="h-4 w-4 text-amber-600" />
                        Safe School Transport Coverage ({transportCoverage.length} Active Routes)
                      </h3>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        GPS Enabled
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

          {/* ==================== SECTION 3: MANAGEMENT & LEADERSHIP ==================== */}
          <section id="school-management" className="border-y border-slate-200 bg-white py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
              <div className="max-w-3xl space-y-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.badgeBg}`}
                >
                  <Users className="h-3.5 w-3.5" />
                  School Management &amp; Leadership
                </span>
                <h2 className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.primaryText}`}>
                  Guided by Dedicated Educators &amp; Transparent Governance
                </h2>
                <p className="text-sm text-slate-600">
                  Meet the leadership team shaping academic excellence, student wellbeing, and parent partnership at {school.name}.
                </p>
              </div>

              {/* Principal's Message Feature Card */}
              <div className={`rounded-2xl border ${theme.borderAccent} bg-gradient-to-br from-[#FAF5EC] via-white to-slate-50 p-6 sm:p-8 shadow-xs`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-3 flex flex-col items-center text-center space-y-3">
                    <div
                      className={`h-24 w-24 rounded-2xl ${theme.primaryBg} text-[#D6B66D] flex items-center justify-center font-display text-2xl font-black shadow-md border-2 border-[#D6B66D]/60`}
                    >
                      {profile.managementTeam[1]?.initials || 'PR'}
                    </div>
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

              {/* Management & Academic Leadership Cards */}
              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {profile.managementTeam.map((member) => (
                  <StaggerCard
                    key={member.id}
                    interactive
                    className="rai-card-interactive rounded-2xl border border-slate-200 bg-[#FAFBFD] p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-12 w-12 rounded-xl ${theme.primaryBg} text-[#FAF4EC] flex items-center justify-center font-display text-sm font-black shrink-0 border border-[#D6B66D]/50`}
                        >
                          {member.initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display text-sm font-extrabold text-slate-900 truncate">
                            {member.name}
                          </h3>
                          <p className="text-[11px] font-bold text-amber-800 line-clamp-1">
                            {member.roleTitle}
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {member.qualification}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">{member.bio}</p>
                    </div>
                    {member.email && (
                      <div className="pt-3 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </StaggerCard>
                ))}
              </StaggerGrid>
            </div>
          </section>

          {/* ==================== SECTION 4: CAMPUS PHOTO GALLERY ==================== */}
          <section id="school-gallery" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-16 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.badgeBg}`}
                >
                  <Images className="h-3.5 w-3.5" />
                  Campus Life &amp; Photo Gallery
                </span>
                <h2 className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.primaryText}`}>
                  Inside {school.name}
                </h2>
                <p className="text-sm text-slate-600">
                  Explore our classrooms, practical science labs, student mentorship spaces, and campus culture. Click any photo to view full screen.
                </p>
              </div>

              {/* Filter Chips */}
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
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
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
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col"
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
          </section>

          {/* ==================== SECTION 5: DEDICATED ADMISSION ENQUIRY FORM ==================== */}
          <section
            id="school-admissions"
            className="border-t border-slate-200 bg-gradient-to-b from-[#FAF5EC]/70 to-white py-14 sm:py-16"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Admissions Info & 3-Step Process */}
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
                    Submit your enquiry directly to <strong>{school.name}</strong>. Your request goes straight into the school’s Admissions CRM &amp; Day-1 Onboarding desk — with instant campus bus route suggestions for your locality.
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
                        title: 'Guided Campus Tour & Principal / Faculty Interaction',
                        desc: 'Explore classrooms, science labs, and our 360° student growth system.',
                      },
                      {
                        step: '03',
                        title: 'Seamless Admission & Day-1 → Day-30 Student Care',
                        desc: 'UDISE+ document checklist, house & bus allotment, and first-month check-ins.',
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

                {/* Right Live Admission Enquiry Form */}
                <div className="lg:col-span-7">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className={`font-display text-lg font-extrabold ${theme.primaryText}`}>
                          Admission Enquiry &amp; Campus Visit Form
                        </h3>
                        <p className="text-xs text-slate-500">
                          Applying directly to <strong>{school.name}</strong> ({school.code})
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
                            placeholder="e.g. Aarav Sharma"
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
                            placeholder="e.g. Rajesh Sharma"
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
                            placeholder="+91 98120 XXXXX"
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
                          <span className="text-xs font-bold text-slate-700">Residential Area / Locality</span>
                          <input
                            type="text"
                            value={locality}
                            onChange={(e) => setLocality(e.target.value)}
                            placeholder={`e.g. Model Town, ${school.city}`}
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
                          placeholder="Share any questions regarding school bus route, fee structure, scholarships, or transfer certificate..."
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

          {/* ==================== SECTION 6: CONTACT & FOOTER ==================== */}
          <footer id="school-contact" className={`${theme.primaryBg} text-slate-100`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-white/15 border border-[#D6B66D]/60 flex items-center justify-center font-display font-black text-sm text-[#D6B66D]">
                    {profile.shortName.slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-display text-base font-extrabold text-white">{school.name}</p>
                    <p className="text-[11px] text-slate-300">{profile.affiliationNote}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{profile.tagline}</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <p className="font-display text-xs font-extrabold uppercase tracking-wider text-[#D6B66D]">
                  Campus Address &amp; Timings
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
                  <Clock className="h-4 w-4 text-[#D6B66D] shrink-0" />
                  <span>{profile.contact.officeHours}</span>
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <p className="font-display text-xs font-extrabold uppercase tracking-wider text-[#D6B66D]">
                  Student, Parent &amp; Faculty Portal
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Existing parents, students, and teachers of {school.name} can sign in directly for daily attendance, homework, report cards, fees, and Learning Portal access.
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
                  © {new Date().getFullYear()} {school.name}. All rights reserved.
                </span>
                <span>
                  Official School Microsite hosted on <strong>Rai Plus</strong> ({profile.contact.websiteDomainLabel})
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
