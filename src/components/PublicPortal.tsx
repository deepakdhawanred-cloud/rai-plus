import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bus,
  Check,
  ChevronDown,
  Compass,
  FileCheck2,
  Menu,
  Shield,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type {
  BlogArticle,
  CareerCounsellingRequest,
  RouteRecommendationResult,
  UserAccount,
  UserRole,
} from '../types';
import {
  CareerIntelligenceLandingPage,
  DynamicPricingPage,
  SsbAcademyLandingPage,
} from './public/FlagshipPublicPages';
import { RAI_PLUS_LOGO_URL } from '../utils/transportEngine';
import type { PublicDemoAccount } from './UnifiedLoginModal';
import {
  PublicFaqAccordion,
  PublicInteractivePreview,
  type PublicLang,
} from './PublicInteractivePreview';
import {
  FloatingWhatsAppDemoButton,
  LegalComplianceModal,
  PublicPricingAndRoiSection,
  type LegalDocKind,
} from './PublicMarketingEnhancements';
import { AnimatePresence, motion } from 'motion/react';
import { AnimatedPageTransition, RAI_VARIANTS } from './motion/RaiMotionSystem';
import { apiRequest } from '../utils/api';
import {
  ARCHITECTURE_PILLARS,
  HERO_VCIP_RADAR_PREVIEW,
  STAKEHOLDER_WORKSPACES,
  findDemoAccountForRole,
  validateCareerForm,
  validateEnquiryForm,
  validateParentAdmissionForm,
  type ArchitecturePillarId,
  type StakeholderRoleTabId,
} from '../utils/publicHomeContent';

interface PublicSchoolSummary {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  board: string;
}

interface PublicPortalProps {
  schoolsCount: number;
  schools?: PublicSchoolSummary[];
  demoAccounts?: PublicDemoAccount[];
  publishedBlogs: BlogArticle[];
  onOpenLogin: () => void;
  onQuickLoginRole?: (userId: string) => Promise<void>;
  onAuthSuccess?: (payload: {
    token: string;
    user: UserAccount;
    activeSchoolId: string | null;
  }) => void;
}

const INTEREST_OPTIONS = [
  'Mathematics & Data',
  'Physics & Engineering',
  'Biology & Healthcare',
  'Economics & Commerce',
  'Law & Public Policy',
  'Literature & Media',
  'Design & Architecture',
  'Skilled Entrepreneurship',
];

const OPERATIONAL_COMPARISON = [
  {
    area: 'Daily Notebook & Homework Checking',
    before: 'Separate subject registers, manual parent diary notes, zero trait history',
    after: '30-second whole-class entry auto-updates Academics, OLQs & Parent Alerts',
  },
  {
    area: 'Student Reasoning & Cognitive Growth',
    before: 'Single exam percentage or opaque external test with no longitudinal view',
    after: 'Original 6-domain VCIP radar & grouped progress bars + 5-min Daily Brain Gym',
  },
  {
    area: 'Chapter Revision & Study Resources',
    before: 'Static textbook pages & unstructured coaching handouts',
    after: 'Interactive chapter mindmaps & step-by-step flowcharts across Classes 1–12',
  },
  {
    area: 'Multi-Campus Compliance & Privacy',
    before: 'Shared spreadsheets with mixed teacher access and zero audit logs',
    after: 'Isolated school databases, UDISE+ / Haryana MIS readiness & protected counsellor notes',
  },
];

export const PublicPortal: React.FC<PublicPortalProps> = ({
  schoolsCount,
  schools = [],
  demoAccounts = [],
  publishedBlogs,
  onOpenLogin,
  onQuickLoginRole,
  onAuthSuccess,
}) => {
  type PublicPageView = 'home' | 'ssb_academy' | 'career_intelligence' | 'pricing';

  function resolvePublicPageFromPath(): PublicPageView {
    if (typeof window === 'undefined') return 'home';
    const p = window.location.pathname.toLowerCase();
    if (p.startsWith('/products/ssb-academy')) return 'ssb_academy';
    if (p.startsWith('/products/career-intelligence')) return 'career_intelligence';
    if (p === '/pricing' || p.startsWith('/pricing/')) return 'pricing';
    return 'home';
  }

  const [publicPage, setPublicPage] = useState<PublicPageView>(() => resolvePublicPageFromPath());
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);

  useEffect(() => {
    const onPop = () => setPublicPage(resolvePublicPageFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function navigatePublicPage(target: PublicPageView) {
    setPublicPage(target);
    setProductsMenuOpen(false);
    setMobileNavOpen(false);
    if (typeof window !== 'undefined') {
      const pathMap: Record<PublicPageView, string> = {
        home: '/',
        ssb_academy: '/products/ssb-academy',
        career_intelligence: '/products/career-intelligence',
        pricing: '/pricing',
      };
      if (window.location.pathname !== pathMap[target]) {
        window.history.pushState({}, '', pathMap[target]);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const [activeSection, setActiveSection] = useState<
    'home' | 'architecture' | 'roles' | 'pricing' | 'career' | 'blog' | 'contact'
  >('home');
  const [legalDocOpen, setLegalDocOpen] = useState<LegalDocKind | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [lang, setLang] = useState<PublicLang>('en');
  const isHi = lang === 'hi';

  // Interactive Architecture & Role Showcase state
  const [activePillarId, setActivePillarId] = useState<ArchitecturePillarId>('erp_evidence');
  const [activeRoleTabId, setActiveRoleTabId] = useState<StakeholderRoleTabId>('principal');
  const [quickLoginBusy, setQuickLoginBusy] = useState<UserRole | null>(null);

  // Career Counselling state
  const [applicantName, setApplicantName] = useState('');
  const [category, setCategory] = useState<CareerCounsellingRequest['category']>('School Student');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentStage, setCurrentStage] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Economics & Commerce']);
  const [strengths, setStrengths] = useState('');
  const [goalSummary, setGoalSummary] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('Saturday 11:00 IST');
  const [careerSubmitting, setCareerSubmitting] = useState(false);
  const [careerError, setCareerError] = useState<string | null>(null);
  const [careerResult, setCareerResult] = useState<CareerCounsellingRequest | null>(null);

  // Blog filter & reader
  const [blogCategory, setBlogCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);

  // School registration, Parent Admissions & Contact enquiry
  const [enquiryType, setEnquiryType] = useState<
    'Parent Admission & Campus Visit' | 'School Demo & Onboarding' | 'General Contact'
  >('Parent Admission & Campus Visit');
  const [targetSchoolId, setTargetSchoolId] = useState<string>(schools[0]?.id || 'school-vis-jjr');
  const [admStudentName, setAdmStudentName] = useState('');
  const [admApplyingClass, setAdmApplyingClass] = useState('Class 6');
  const [admVisitDate, setAdmVisitDate] = useState('');
  const [schoolOrOrgName, setSchoolOrOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [enqEmail, setEnqEmail] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [cityState, setCityState] = useState('');
  const [board, setBoard] = useState('HBSE');
  const [message, setMessage] = useState('');
  const [enqSubmitting, setEnqSubmitting] = useState(false);
  const [enqError, setEnqError] = useState<string | null>(null);
  const [enqSuccess, setEnqSuccess] = useState<string | null>(null);
  const [enqRecommendedRoute, setEnqRecommendedRoute] =
    useState<RouteRecommendationResult | null>(null);

  useEffect(() => {
    if (schools.length > 0 && !schools.some((s) => s.id === targetSchoolId)) {
      setTargetSchoolId(schools[0].id);
    }
  }, [schools, targetSchoolId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const sectionMap: Array<{
      id: string;
      nav: 'home' | 'architecture' | 'roles' | 'pricing' | 'career' | 'blog' | 'contact';
    }> = [
      { id: 'section-home', nav: 'home' },
      { id: 'section-architecture', nav: 'architecture' },
      { id: 'section-roles', nav: 'roles' },
      { id: 'section-sample', nav: 'roles' },
      { id: 'section-career', nav: 'career' },
      { id: 'section-blog', nav: 'blog' },
      { id: 'section-faq', nav: 'blog' },
      { id: 'section-pricing', nav: 'pricing' },
      { id: 'section-contact', nav: 'contact' },
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const matched = sectionMap.find((s) => s.id === visible.target.id);
        if (matched) setActiveSection(matched.nav);
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
    );
    sectionMap.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const activePillar = useMemo(
    () => ARCHITECTURE_PILLARS.find((p) => p.id === activePillarId) || ARCHITECTURE_PILLARS[0],
    [activePillarId],
  );
  const activeRoleWorkspace = useMemo(
    () =>
      STAKEHOLDER_WORKSPACES.find((r) => r.id === activeRoleTabId) || STAKEHOLDER_WORKSPACES[0],
    [activeRoleTabId],
  );

  const activeSchoolCities = useMemo(() => {
    if (schools.length === 0) return 'Jhajjar · Kurukshetra · Karnal';
    return Array.from(new Set(schools.map((s) => s.city))).join(' · ');
  }, [schools]);

  function scrollToSection(
    id: 'home' | 'architecture' | 'roles' | 'pricing' | 'career' | 'blog' | 'contact',
    presetEnquiryType?:
      | 'Parent Admission & Campus Visit'
      | 'School Demo & Onboarding'
      | 'General Contact',
  ) {
    if (publicPage !== 'home') {
      navigatePublicPage('home');
      setTimeout(() => {
        const el = document.getElementById(`section-${id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
    setActiveSection(id);
    setProductsMenuOpen(false);
    setMobileNavOpen(false);
    if (presetEnquiryType) {
      setEnquiryType(presetEnquiryType);
      setEnqError(null);
      setEnqSuccess(null);
    }
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleLaunchRolePortal(role: UserRole) {
    const matched = findDemoAccountForRole(demoAccounts, role);
    if (!matched || !onQuickLoginRole) {
      onOpenLogin();
      return;
    }
    setQuickLoginBusy(role);
    try {
      await onQuickLoginRole(matched.id);
    } catch {
      onOpenLogin();
    } finally {
      setQuickLoginBusy(null);
    }
  }

  function toggleInterest(label: string) {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );
  }

  async function handleCareerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCareerError(null);
    const validationError = validateCareerForm({
      applicantName,
      email,
      phone,
      currentStage,
      goalSummary,
    });
    if (validationError) {
      setCareerError(validationError);
      return;
    }

    setCareerSubmitting(true);
    try {
      const data = await apiRequest<{ request: CareerCounsellingRequest }>(
        '/api/public/career-counselling',
        {
          method: 'POST',
          body: JSON.stringify({
            applicantName,
            category,
            email,
            phone,
            currentStage,
            interests: selectedInterests,
            strengths,
            goalSummary,
            preferredSlot,
          }),
        },
      );
      setCareerResult(data.request);
    } catch (err) {
      setCareerError(err instanceof Error ? err.message : 'Unable to submit request.');
    } finally {
      setCareerSubmitting(false);
    }
  }

  async function handleEnquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnqError(null);
    setEnqSuccess(null);
    setEnqRecommendedRoute(null);

    if (enquiryType === 'Parent Admission & Campus Visit') {
      const validationError = validateParentAdmissionForm({
        studentName: admStudentName,
        applyingClass: admApplyingClass,
        parentName: contactName,
        phone: enqPhone,
        email: enqEmail,
      });
      if (validationError) {
        setEnqError(validationError);
        return;
      }
      setEnqSubmitting(true);
      try {
        const res = await apiRequest<{
          ok: boolean;
          schoolName?: string;
          recommendedRoute?: RouteRecommendationResult | null;
        }>('/api/public/admission-enquiry', {
          method: 'POST',
          body: JSON.stringify({
            schoolId: targetSchoolId,
            studentName: admStudentName,
            applyingClass: admApplyingClass,
            parentName: contactName,
            phone: enqPhone,
            email: enqEmail,
            preferredVisitDate: admVisitDate,
            locality: cityState,
            notes: message,
          }),
        });
        setEnqRecommendedRoute(res.recommendedRoute || null);
        setEnqSuccess(
          isHi
            ? `${res.schoolName || 'विद्यालय'} की प्रवेश सूची (Admissions CRM) में अनुरोध दर्ज हो गया है। प्रवेश टीम शीघ्र संपर्क करेगी।`
            : `Admission enquiry & campus visit logged directly into ${res.schoolName || 'the school'} Admissions CRM. Our admissions desk & faculty team will follow up shortly.`,
        );
        setAdmStudentName('');
        setAdmVisitDate('');
        setContactName('');
        setEnqEmail('');
        setEnqPhone('');
        setCityState('');
        setMessage('');
      } catch (err) {
        setEnqError(err instanceof Error ? err.message : 'Unable to submit admission enquiry.');
      } finally {
        setEnqSubmitting(false);
      }
      return;
    }

    const validationError = validateEnquiryForm({
      contactName,
      email: enqEmail,
      phone: enqPhone,
      message,
    });
    if (validationError) {
      setEnqError(validationError);
      return;
    }
    setEnqSubmitting(true);
    try {
      await apiRequest<{ ok?: boolean }>('/api/public/enquiry', {
        method: 'POST',
        body: JSON.stringify({
          type: enquiryType,
          schoolOrOrgName,
          contactName,
          email: enqEmail,
          phone: enqPhone,
          cityState,
          board,
          message,
        }),
      });
      setEnqSuccess(
        enquiryType === 'School Demo & Onboarding'
          ? 'School onboarding request registered. Our North India implementation team will reach out within 1 working day.'
          : 'Enquiry logged directly into the school Admission CRM queue.',
      );
      setSchoolOrOrgName('');
      setContactName('');
      setEnqEmail('');
      setEnqPhone('');
      setCityState('');
      setMessage('');
    } catch (err) {
      setEnqError(err instanceof Error ? err.message : 'Submission error');
    } finally {
      setEnqSubmitting(false);
    }
  }

  const blogCategories = ['All', ...Array.from(new Set(publishedBlogs.map((b) => b.category)))];
  const filteredBlogs =
    blogCategory === 'All'
      ? publishedBlogs
      : publishedBlogs.filter((b) => b.category === blogCategory);

  const leadArticle = filteredBlogs[0] || null;
  const secondaryArticles = filteredBlogs.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 md:pb-0">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
          {/* Zone 1: Official Rai Plus Logo & Wordmark */}
          <a
            href="#section-home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="font-display text-xl font-extrabold tracking-tight text-[#142B46] whitespace-nowrap shrink-0 inline-flex items-center gap-2.5"
          >
            <img
              src={RAI_PLUS_LOGO_URL}
              alt="Rai Plus Logo"
              className="h-9 w-9 rounded-lg border border-[#D6B66D]/70 object-cover bg-[#F3E6D8] shrink-0"
            />
            <span className="inline-flex items-baseline gap-0.5">
              <span>RAI</span>
              <span className="text-[#937024]">PLUS</span>
              <span className="text-[#D6B66D] font-black leading-none" aria-hidden="true">+</span>
            </span>
          </a>

          {/* Zone 2: Products Dropdown + concise single-line nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-4 lg:gap-5 text-xs lg:text-sm font-medium text-slate-600"
          >
            {/* Products Dropdown */}
            <div className="relative">
              <button
                type="button"
                aria-expanded={productsMenuOpen}
                onClick={() => setProductsMenuOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                  publicPage === 'ssb_academy' || publicPage === 'career_intelligence'
                    ? 'text-blue-900 font-semibold'
                    : ''
                }`}
              >
                Products{' '}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    productsMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
              {productsMenuOpen && (
                <motion.div
                  variants={RAI_VARIANTS.dropdown}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute left-0 top-full mt-2 w-72 origin-top-left rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 space-y-1 text-left"
                  onMouseLeave={() => setProductsMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => scrollToSection('architecture')}
                    className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <p className="text-xs font-bold text-[#142B46]">School ERP</p>
                    <p className="text-[11px] text-slate-500">Multi-tenant Operations, Finance, Attendance &amp; HR</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('roles')}
                    className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <p className="text-xs font-bold text-[#142B46]">AI Learning Ecosystem</p>
                    <p className="text-[11px] text-slate-500">Classes 6–12 Portal, 3D Visuals &amp; Mindmaps</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigatePublicPage('ssb_academy')}
                    className="w-full rounded-lg px-3 py-2 text-left hover:bg-amber-50 border border-amber-200/70 bg-amber-50/40"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#142B46]">SSB Academy</p>
                      <span className="rounded bg-[#142B46] px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                        100 SETS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">NDA · CDS · AFCAT · WAT/SRT/TAT/PPDT &amp; 15 OLQs</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigatePublicPage('career_intelligence')}
                    className="w-full rounded-lg px-3 py-2 text-left hover:bg-emerald-50 border border-emerald-200/70 bg-emerald-50/40"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#0F2A3F]">Career Intelligence</p>
                      <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        100% FREE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">5-Stage IQ/EQ/AQ/CQ, Budget Bypass &amp; Global Roadmap</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('architecture')}
                    className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <p className="text-xs font-bold text-[#142B46]">Smart Campus</p>
                    <p className="text-[11px] text-slate-500">Inventory AI, GPS Transport, Gate Pass &amp; RFID</p>
                  </button>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={() => navigatePublicPage('ssb_academy')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                publicPage === 'ssb_academy' ? 'text-blue-900 font-semibold' : ''
              }`}
            >
              SSB Academy
            </button>
            <button
              type="button"
              onClick={() => navigatePublicPage('career_intelligence')}
              className={`inline-flex items-center gap-1 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                publicPage === 'career_intelligence' ? 'text-emerald-800 font-semibold' : ''
              }`}
            >
              <span>Career Intelligence</span>
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-800">
                FREE
              </span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('roles')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                publicPage === 'home' && activeSection === 'roles' ? 'text-blue-900 font-semibold' : ''
              }`}
            >
              Role Workspaces
            </button>
            <button
              type="button"
              onClick={() => navigatePublicPage('pricing')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                publicPage === 'pricing' ? 'text-blue-900 font-semibold' : ''
              }`}
            >
              Pricing
            </button>
          </nav>

          {/* Zone 3: Compact Language Toggle + Primary CTA (+ mobile menu affordance below md) */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              role="group"
              aria-label="Public site language switcher"
              data-testid="public-lang-switcher"
              className="hidden sm:inline-flex items-center rounded-lg border border-slate-200 bg-slate-100/90 p-0.5 text-[11px] font-semibold"
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`rounded-md px-2 py-1 transition-colors ${
                  !isHi ? 'bg-[#142B46] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`rounded-md px-2 py-1 transition-colors ${
                  isHi ? 'bg-[#142B46] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिं
              </button>
            </div>
            <button
              type="button"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-white hover:bg-[#1D3A5C] shadow-xs transition-all whitespace-nowrap shrink-0"
            >
              Portal Login
            </button>
            <button
              type="button"
              aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="md:hidden rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-2 text-sm font-medium text-slate-700">
            <button
              type="button"
              onClick={() => navigatePublicPage('ssb_academy')}
              className="block w-full text-left py-2 font-bold text-[#142B46]"
            >
              SSB Academy (100 Practice Sets)
            </button>
            <button
              type="button"
              onClick={() => navigatePublicPage('career_intelligence')}
              className="block w-full text-left py-2 font-bold text-emerald-700"
            >
              Career Intelligence (100% Free)
            </button>
            <button
              type="button"
              onClick={() => navigatePublicPage('pricing')}
              className="block w-full text-left py-2 hover:text-blue-900"
            >
              Pricing &amp; Packages
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('architecture')}
              className="block w-full text-left py-2 hover:text-blue-900"
            >
              Architecture
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('roles')}
              className="block w-full text-left py-2 hover:text-blue-900"
            >
              Role Workspaces
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('career')}
              className="block w-full text-left py-2 hover:text-blue-900"
            >
              Career Guidance
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('blog')}
              className="block w-full text-left py-2 hover:text-blue-900"
            >
              Knowledge Centre
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left py-2 text-blue-900 font-semibold"
            >
              Schedule School Walkthrough
            </button>
          </div>
        )}
      </header>

      <AnimatedPageTransition routeKey={publicPage}>
      {publicPage === 'ssb_academy' ? (
        <SsbAcademyLandingPage
          onBackHome={() => navigatePublicPage('home')}
          onNavigatePricing={() => navigatePublicPage('pricing')}
          onOpenLogin={onOpenLogin}
          onQuickDemoSsb={
            onQuickLoginRole ? () => void handleLaunchRolePortal('ssb_student') : undefined
          }
          onRegistered={(payload) => onAuthSuccess?.(payload)}
        />
      ) : publicPage === 'career_intelligence' ? (
        <CareerIntelligenceLandingPage
          onBackHome={() => navigatePublicPage('home')}
          onNavigatePricing={() => navigatePublicPage('pricing')}
          onOpenLogin={onOpenLogin}
          onQuickDemoCareer={
            onQuickLoginRole ? () => void handleLaunchRolePortal('career_user') : undefined
          }
          onRegistered={(payload) => onAuthSuccess?.(payload)}
        />
      ) : publicPage === 'pricing' ? (
        <DynamicPricingPage
          onBackHome={() => navigatePublicPage('home')}
          onNavigateSsb={() => navigatePublicPage('ssb_academy')}
          onNavigateCareer={() => navigatePublicPage('career_intelligence')}
        />
      ) : (
      <main>
        {/* ==================== SECTION 1: MODERN HERO PROPOSITION + 3 FLAGSHIP JOURNEYS ==================== */}
        <section
          id="section-home"
          className="relative overflow-hidden bg-gradient-to-b from-[#FAF5EC] via-white to-[#F5F8FC] border-b border-slate-200/80"
        >
          <div className="mx-auto max-w-7xl px-6 pt-10 pb-14 lg:pt-14 lg:pb-18">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
                <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#D6B66D]/60 bg-[#FAF1DF] px-3.5 py-1 text-[11px] font-bold text-[#7B5D1C]">
                  <Sparkles className="h-3.5 w-3.5 text-[#937024]" />
                  <span>
                    {isHi
                      ? 'राय प्लस · संपूर्ण शिक्षा इंटेलिजेंस प्लेटफ़ॉर्म · Powered by The Counsellor'
                      : 'Complete Education Intelligence Platform · Powered by The Counsellor'}
                  </span>
                </div>
                <h1
                  className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-extrabold tracking-tight text-[#142B46] leading-[1.07]"
                  style={{ textWrap: 'balance' }}
                >
                  {isHi
                    ? 'एक शिक्षा मंच। हर विद्यालय और विद्यार्थी की संपूर्ण 360° स्पष्टता।'
                    : 'One education platform. Complete 360° clarity for every school & learner.'}
                </h1>
                <p className="text-base leading-relaxed text-slate-600 max-w-xl">
                  {isHi
                    ? 'राय प्लस विद्यालय ERP (₹199/विद्यार्थी/वर्ष से), 100-सेट SSB अकादमी और 100% निःशुल्क 5-चरणीय करियर इंटेलिजेंस को एक सुरक्षित, आधुनिक प्लेटफ़ॉर्म पर जोड़ता है।'
                    : 'Uniting multi-tenant K–12 School ERP (from ₹199/student/yr), 100-set SSB Officer Preparation Academy, and 100% Free 5-Stage Career Intelligence on one secure Indian platform.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#142B46] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#1D3A5C] transition-all whitespace-nowrap shrink-0"
                  >
                    {isHi ? 'लाइव पोर्टल लॉगिन खोलें' : 'Launch Live Role Portal'}
                    <ArrowRight className="h-4 w-4 text-[#D6B66D]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigatePublicPage('pricing')}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#142B46]/20 bg-white px-5 py-3 text-sm font-bold text-[#142B46] shadow-xs hover:border-[#142B46]/40 hover:bg-slate-50 transition-all whitespace-nowrap shrink-0"
                  >
                    {isHi ? '2026–27 मूल्य देखें' : 'View 2026–27 Pricing'}
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('contact', 'Parent Admission & Campus Visit')}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-3 text-xs font-bold text-[#142B46] hover:underline whitespace-nowrap shrink-0"
                  >
                    {isHi ? 'प्रवेश व कैंपस विज़िट →' : 'Book Campus Visit →'}
                  </button>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600">
                  <span className="whitespace-nowrap font-semibold text-[#2F6A4A]">
                    {isHi ? 'बुद्धि · विकास · मार्गदर्शन' : 'Intelligence · Growth · Guidance'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">
                    {isHi ? 'पृथक विद्यालय डेटाबेस' : 'Isolated school databases'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">
                    {isHi ? 'DPDP 2023 व RCI क्लिनिकल सुरक्षा' : 'DPDP 2023 & RCI Clinical Governance'}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative h-full min-h-[340px] lg:min-h-[420px] overflow-hidden rounded-2xl border border-[#D6B66D]/45 bg-[#142B46] shadow-xl">
                  <img
                    src="/assets/images/hero_campus_india_1794713007660.jpg"
                    alt="North India senior secondary school campus courtyard"
                    referrerPolicy="no-referrer"
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-[#142B46]/85 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-bold text-[#F3E6D8]">
                      Active North India Campuses · {activeSchoolCities}
                    </span>
                    <span className="rounded-full bg-emerald-600/95 px-3 py-1 text-[11px] font-extrabold text-white shadow-sm">
                      Session 2026–27 Live
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0D1E33] via-[#142B46]/80 to-transparent p-6 pt-20 text-white">
                    <p className="font-display text-base sm:text-lg font-bold leading-snug text-white">
                      {isHi
                        ? 'प्रधानाचार्य, शिक्षक, लेखा विभाग, क्लिनिकल विशेषज्ञ, SSB अभ्यर्थी और विद्यार्थियों के लिए एकीकृत मंच।'
                        : 'Built for Principals, Teachers, Accounts, RCI Clinicians, Parents, SSB Aspirants & Career Explorers.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Clear Audience Entry Cards — Instant 1-Click Routing */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => navigatePublicPage('pricing')}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs hover:border-[#142B46] hover:shadow-md transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#142B46]">
                      For Schools &amp; Campuses
                    </span>
                    <span className="font-mono text-xs font-extrabold text-[#142B46]">From ₹199/yr</span>
                  </div>
                  <h3 className="font-display text-base font-extrabold text-[#142B46]">
                    School ERP + AI Campus 360°
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Attendance, Finance 360°, Inventory AI, Learning Portal (Classes 6–12), VCIP &amp; Clinical Care.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#142B46] group-hover:translate-x-0.5 transition-transform">
                  Compare 4 Annual Packages <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigatePublicPage('ssb_academy')}
                className="group rounded-2xl border border-amber-200/90 bg-gradient-to-br from-[#FFFDF7] to-amber-50/40 p-5 text-left shadow-xs hover:border-[#142B46] hover:shadow-md transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#142B46] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#D6B66D]">
                      For Defence Aspirants
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-800">100 Full Sets</span>
                  </div>
                  <h3 className="font-display text-base font-extrabold text-[#142B46]">
                    Rai Plus SSB Academy
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    60-word WAT, 60-situation SRT, TAT, PPDT + Voice Narration &amp; GD Simulator with 15-OLQ profile.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#142B46] group-hover:translate-x-0.5 transition-transform">
                  Explore SSB Academy &amp; Free Demo <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigatePublicPage('career_intelligence')}
                className="group rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-5 text-left shadow-xs hover:border-emerald-700 hover:shadow-md transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-white">
                      100% Free · ₹0 Forever
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-800">5 Stages</span>
                  </div>
                  <h3 className="font-display text-base font-extrabold text-[#0F2A3F]">
                    Free Career Intelligence
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    IQ/EQ/AQ/CQ profile, 12 work environments, verified Budget Bypass schemes &amp; 12-month roadmap.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 group-hover:translate-x-0.5 transition-transform">
                  Start Free Career Discovery <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            </div>

            {/* Full-Width 4-Column Institutional Proof Strip — Midnight Navy with Champagne Gold, Sage Green & Soft Blue Accents */}
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#29486B] rounded-2xl border border-[#142B46] bg-[#142B46] text-[#F3E6D8] shadow-md">
              <div className="p-5">
                <p className="font-mono text-2xl font-bold text-[#D6B66D] tabular-nums">
                  {schoolsCount} Tenants
                </p>
                <p className="text-xs text-[#F3E6D8]/85 mt-1 leading-relaxed">
                  Isolated institutional sandboxes with dedicated UDISE+ &amp; Haryana MIS tracking
                </p>
              </div>
              <div className="p-5">
                <p className="font-mono text-2xl font-bold text-[#D6B66D] tabular-nums">
                  5 Pillars
                </p>
                <p className="text-xs text-[#F3E6D8]/85 mt-1 leading-relaxed">
                  ERP &amp; Finance 360°, 15 OLQs, Cognitive Engine, Mindmaps &amp; Clinical Care 360°
                </p>
              </div>
              <div className="p-5">
                <p className="font-mono text-2xl font-bold text-[#6E987A] tabular-nums">
                  11 Roles
                </p>
                <p className="text-xs text-[#F3E6D8]/85 mt-1 leading-relaxed">
                  Strict role isolation across Leadership, Teachers, Accounts, RCI Clinicians &amp; Families
                </p>
              </div>
              <div className="p-5">
                <p className="font-mono text-2xl font-bold text-[#A9C5D8] tabular-nums">
                  Classes 1–12
                </p>
                <p className="text-xs text-[#F3E6D8]/85 mt-1 leading-relaxed">
                  Age-calibrated assessments, Daily Brain Gym, Speech Therapy IEPs &amp; Career Guidance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2: 5-PILLAR INTERACTIVE ARCHITECTURE ==================== */}
        <section
          id="section-architecture"
          data-testid="home-architecture-section"
          className="mx-auto max-w-7xl px-6 py-16 lg:py-20 space-y-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold text-blue-900">
                Five-Pillar Student &amp; Institutional Intelligence Architecture
              </p>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
                style={{ textWrap: 'balance' }}
              >
                Every classroom, finance, and care record feeds one transparent picture.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Inspect all five pillars below—including Today Workspace &amp; Finance 360°, 15
                OLQs, VCIP Cognitive Profiles, Visual Mindmaps, and specialist-led Clinical &amp;
                Developmental Care 360°—with strict privacy boundaries and zero automated diagnoses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => scrollToSection('roles')}
              className="text-sm font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0 self-start lg:self-auto"
            >
              See role-by-role workspaces →
            </button>
          </div>

          {/* Interactive Pillar Selector + Live Preview Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Selector Column (4 Pillars) */}
            <div
              role="tablist"
              aria-label="Four platform architecture pillars"
              className="lg:col-span-5 flex flex-col gap-2.5"
            >
              {ARCHITECTURE_PILLARS.map((pillar) => {
                const isSelected = pillar.id === activePillar.id;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActivePillarId(pillar.id)}
                    className={`rounded-xl border p-5 text-left transition-colors ${
                      isSelected
                        ? 'border-blue-900 bg-white shadow-xs'
                        : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-mono font-semibold ${
                          isSelected ? 'text-blue-900' : 'text-amber-700'
                        }`}
                      >
                        {pillar.index}. {pillar.shortLabel}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] font-semibold text-blue-900">Viewing</span>
                      )}
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-bold text-slate-900 leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {pillar.summary}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right Interactive Proof Canvas */}
            <div
              data-testid="home-pillar-stage"
              className="lg:col-span-7 rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between"
            >
              {/* Visual Header Media / Live Chart Preview */}
              <div className="border-b border-slate-200 bg-slate-50/70">
                {activePillar.id === 'vcip_cognitive' ? (
                  <div className="p-6 space-y-3" data-testid="home-vcip-preview-chart">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-900">
                        Live Preview · Six-Domain VCIP Cognitive Radar (Baseline vs Latest)
                      </span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        Non-clinical 0–100 scale
                      </span>
                    </div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={HERO_VCIP_RADAR_PREVIEW} cx="50%" cy="50%" outerRadius="74%">
                          <PolarGrid stroke="#E6D8C6" />
                          <PolarAngleAxis
                            dataKey="domain"
                            tick={{ fill: '#142B46', fontSize: 11, fontWeight: 600 }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tickCount={4}
                            tick={{ fill: '#64778C', fontSize: 10 }}
                          />
                          <Radar
                            name="Baseline"
                            dataKey="baseline"
                            stroke="#A9C5D8"
                            fill="#A9C5D8"
                            fillOpacity={0.38}
                            strokeWidth={1.75}
                          />
                          <Radar
                            name="Latest"
                            dataKey="current"
                            stroke="#142B46"
                            fill="#6E987A"
                            fillOpacity={0.32}
                            strokeWidth={2.25}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : activePillar.imageSrc ? (
                  <div className="h-60 w-full overflow-hidden bg-slate-100">
                    <img
                      src={activePillar.imageSrc}
                      alt={activePillar.imageAlt || activePillar.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>

              {/* Mechanism Chain & Outcome */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-mono font-semibold text-amber-800">
                      Pillar {activePillar.index} · Operational Mechanism
                    </p>
                    <h3 className="font-display text-xl font-bold text-slate-900">
                      {activePillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{activePillar.summary}</p>
                  </div>

                  <ul className="space-y-2.5 pt-1">
                    {activePillar.mechanismChain.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check className="h-4 w-4 text-blue-900 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">Outcome: </span>
                    {activePillar.measurableOutcome}
                  </div>
                  <button
                    type="button"
                    disabled={quickLoginBusy !== null}
                    onClick={() => void handleLaunchRolePortal(activePillar.recommendedRole)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                  >
                    {quickLoginBusy === activePillar.recommendedRole
                      ? 'Opening Demo...'
                      : activePillar.ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Asymmetric Before vs After + Ethical Safeguards Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4">
                <h3 className="font-display text-base font-bold text-slate-900">
                  Why Schools Replace Fragmented Registers with Rai Plus
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Concrete workflow shifts measured across daily academic and developmental operations
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500">
                      <th className="py-3 px-6 font-semibold">School Process</th>
                      <th className="py-3 px-4 font-semibold">Traditional Setup</th>
                      <th className="py-3 px-6 font-semibold text-blue-900">Rai Plus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {OPERATIONAL_COMPARISON.map((row) => (
                      <tr key={row.area} className="align-top">
                        <td className="py-3.5 px-6 font-semibold text-slate-900 whitespace-nowrap">
                          {row.area}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 leading-relaxed">{row.before}</td>
                        <td className="py-3.5 px-6 text-slate-800 font-medium leading-relaxed">
                          {row.after}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-slate-900 text-white p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-amber-400">
                  Ethical Assessment &amp; Fairness Charter
                </p>
                <h3 className="font-display text-lg font-bold leading-snug">
                  Student intelligence designed to guide growth—never to stereotype or exclude.
                </h3>
                <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Missing evidence is never scored as zero, and absences never auto-penalise
                      OLQ development records.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Quiet, reflective students are never tagged as &ldquo;Passive&rdquo;, and
                      VCIP cognitive scores are never converted into clinical IQ labels.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Daily Brain Gym practice logs remain strictly separated from formal timed
                      cognitive assessments and confidential counsellor notes.
                    </span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap"
              >
                Inspect Live Sandbox Portal <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 3: STAKEHOLDER ROLE WORKSPACES ==================== */}
        <section
          id="section-roles"
          data-testid="home-roles-section"
          className="bg-white border-y border-slate-200 py-16 lg:py-20"
        >
          <div className="mx-auto max-w-7xl px-6 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <p className="text-xs font-semibold text-blue-900">
                  Eleven Authorised Roles · One Unified Portal
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Built for every person who shapes a student’s journey.
                </h2>
              </div>

              {/* Interactive Stakeholder Tabs */}
              <div
                role="tablist"
                data-testid="home-roles-tablist"
                aria-label="School stakeholder workspaces"
                className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
              >
                {STAKEHOLDER_WORKSPACES.map((ws) => {
                  const active = ws.id === activeRoleWorkspace.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveRoleTabId(ws.id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {ws.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Role Workspace Detail Card */}
            <div
              data-testid="home-role-card"
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <div className="lg:col-span-5 space-y-4">
                <p className="text-xs font-semibold text-amber-800">
                  {activeRoleWorkspace.roleTitle}
                </p>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {activeRoleWorkspace.headline}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeRoleWorkspace.summary}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-5 border-t border-slate-200">
                  <div>
                    <p className="text-[11px] text-slate-500">
                      {activeRoleWorkspace.keyMetricLabel}
                    </p>
                    <p className="font-mono text-base font-bold text-slate-900 tabular-nums">
                      {activeRoleWorkspace.keyMetricValue}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={quickLoginBusy !== null}
                    onClick={() => void handleLaunchRolePortal(activeRoleWorkspace.targetRole)}
                    className="ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                  >
                    {quickLoginBusy === activeRoleWorkspace.targetRole
                      ? 'Signing In...'
                      : activeRoleWorkspace.ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {activeRoleWorkspace.dailyWorkflows.map((wf, idx) => (
                  <div
                    key={wf.title}
                    className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between space-y-2.5"
                  >
                    <p className="font-mono text-xs font-semibold text-blue-900">0{idx + 1}</p>
                    <h4 className="font-display text-sm font-bold text-slate-900 leading-snug">
                      {wf.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{wf.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 3B: ZERO-LOGIN 30-SECOND INTERACTIVE SAMPLE ==================== */}
        <PublicInteractivePreview lang={lang} onOpenLogin={onOpenLogin} />

        {/* ==================== SECTION 4: OPEN PUBLIC CAREER COUNSELLING ==================== */}
        <section id="section-career" className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs font-semibold text-amber-800">
                Open Public Service · No School ERP Account Required
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Career Counselling &amp; Stream Guidance
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Open to school students (Classes 8–12), college learners, graduates, and working
                professionals evaluating stream choices, CUET/JEE/NEET/CLAT/NDA exams, or career
                transitions.
              </p>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-[4/3]">
                <img
                  src="/assets/images/career_counselling_session_1794713007994.jpg"
                  alt="Career counsellor reviewing academic stream charts with student"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-900">Advisory Standard: </span>
                Automated pathway briefs are structured conversation starters—not definitive
                psychological diagnoses or career guarantees. Every serious recommendation is
                reviewed by a qualified human Career Counsellor.
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Request Career Advisory Brief &amp; Counsellor Session
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Receive an immediate structured brief and reserve a 1-on-1 review slot.
              </p>

              <form onSubmit={handleCareerSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="cc-name"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="cc-name"
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Ritika Ahlawat"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cc-category"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Applicant Category
                    </label>
                    <select
                      id="cc-category"
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as CareerCounsellingRequest['category'])
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
                    >
                      <option value="School Student">School Student (Class 8–12)</option>
                      <option value="College Student">College Student</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Working Professional">Working Professional</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="cc-email"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      id="cc-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ritika@example.in"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cc-phone"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Phone / WhatsApp
                    </label>
                    <input
                      id="cc-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98120 00000"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="cc-stage"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Current Class, Degree, or Role
                    </label>
                    <input
                      id="cc-stage"
                      type="text"
                      value={currentStage}
                      onChange={(e) => setCurrentStage(e.target.value)}
                      placeholder="e.g. Class 10 HBSE · Stream Selection"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cc-slot"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Preferred Appointment Slot
                    </label>
                    <input
                      id="cc-slot"
                      type="text"
                      value={preferredSlot}
                      onChange={(e) => setPreferredSlot(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-2">
                    Career &amp; Subject Interests
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((item) => {
                      const active = selectedInterests.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleInterest(item)}
                          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            active
                              ? 'border-blue-900 bg-blue-900 text-white'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cc-strengths"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Observed Strengths or Exam Preferences
                  </label>
                  <input
                    id="cc-strengths"
                    type="text"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="e.g. Strong analytical writing, interested in CUET or CLAT"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cc-goal"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Career Dilemma or Guidance Question
                  </label>
                  <textarea
                    id="cc-goal"
                    rows={3}
                    value={goalSummary}
                    onChange={(e) => setGoalSummary(e.target.value)}
                    placeholder="Describe the stream, college, competitive exam, or career transition you want advice on."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
                  />
                </div>

                {careerError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-red-700"
                  >
                    {careerError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={careerSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
                >
                  {careerSubmitting
                    ? 'Preparing Advisory Brief...'
                    : 'Generate Advisory Report & Book Session'}
                  <Compass className="h-4 w-4" />
                </button>
              </form>

              {careerResult && (
                <div
                  className="mt-6 rounded-xl border border-blue-200 bg-blue-50/40 p-5 space-y-2"
                  data-testid="career-advisory-result"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-blue-900">
                      Request Logged · Assigned to {careerResult.assignedCounsellor}
                    </span>
                    <span className="font-mono">Slot: {careerResult.preferredSlot}</span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {careerResult.aiAdvisoryReport}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==================== SECTION 5: BLOG & KNOWLEDGE CENTRE ==================== */}
        <section id="section-blog" className="bg-white border-t border-slate-200 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold text-blue-900">
                  Research &amp; Practice Notes
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  Blog &amp; Knowledge Centre
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Practical articles on educational psychology, OLQ evidence, parenting, and Indian
                  competitive pathways.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
                {blogCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBlogCategory(cat)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      blogCategory === cat
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {leadArticle ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <article className="lg:col-span-6 rounded-xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-amber-800">{leadArticle.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{leadArticle.publishedDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>{leadArticle.readTime}</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                      {leadArticle.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{leadArticle.excerpt}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-slate-600">
                      By {leadArticle.author}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedArticle(leadArticle)}
                      className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0"
                    >
                      Read Full Essay →
                    </button>
                  </div>
                </article>

                <div className="lg:col-span-6 flex flex-col gap-4">
                  {secondaryArticles.length > 0 ? (
                    secondaryArticles.map((article) => (
                      <article
                        key={article.id}
                        className="flex-1 rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-medium text-amber-800">{article.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{article.publishedDate}</span>
                            <span aria-hidden="true">·</span>
                            <span>{article.readTime}</span>
                          </div>
                          <h3 className="font-display text-base font-bold text-slate-900 mt-2 leading-snug">
                            {article.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {article.excerpt}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500">{article.author}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedArticle(article)}
                            className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0"
                          >
                            Read Article →
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="flex-1 rounded-xl border border-slate-200 bg-white p-6 flex items-center text-xs text-slate-500">
                      Select &ldquo;All&rdquo; above to browse every published research note.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-500">
                Loading published knowledge centre articles...
              </div>
            )}
          </div>
        </section>

        {/* ==================== SECTION 5B: PRINCIPAL & PARENT FAQ ACCORDION ==================== */}
        <PublicFaqAccordion lang={lang} />

        {/* ==================== SECTION 5C: OFFICIAL 2026–27 PLANS & QUOTE CALCULATOR ==================== */}
        <PublicPricingAndRoiSection
          lang={lang}
          onSelectPlan={(planName) => {
            setMessage(`Interested in ${planName} — please schedule a 15-minute live walkthrough.`);
            scrollToSection('contact', 'School Demo & Onboarding');
          }}
          onOpenFullPricing={() => navigatePublicPage('pricing')}
          onOpenSsb={() => navigatePublicPage('ssb_academy')}
          onOpenCareer={() => navigatePublicPage('career_intelligence')}
        />

        {/* ==================== SECTION 6: PARENT ADMISSIONS & SCHOOL ONBOARDING ==================== */}
        <section id="section-contact" className="bg-slate-900 text-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs font-semibold text-amber-400">
                {enquiryType === 'Parent Admission & Campus Visit'
                  ? isHi
                    ? 'अभिभावक प्रवेश डेस्क · सीधे विद्यालय Admissions CRM में दर्ज'
                    : 'Parent Admissions Desk · Direct Campus CRM Routing'
                  : 'Institutional Onboarding · Direct North India Support'}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                {enquiryType === 'Parent Admission & Campus Visit'
                  ? isHi
                    ? 'प्रवेश पूछताछ दर्ज करें या विद्यालय कैंपस विज़िट बुक करें।'
                    : 'Submit an admission enquiry or schedule a guided campus visit.'
                  : 'Deploy Rai Plus across your school in one academic term.'}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {enquiryType === 'Parent Admission & Campus Visit'
                  ? isHi
                    ? 'आपकी प्रवेश पूछताछ सीधे चुने गए विद्यालय की Admissions टीम व शिक्षकों को दिखाई देती है—बिना किसी कॉल-सेंटर देरी के।'
                    : 'Every parent admission enquiry routes directly into your chosen school’s live Admissions CRM queue for immediate counsellor and faculty follow-up.'
                  : 'Every partner school receives a strictly isolated tenant database, HBSE / NCERT / CBSE curriculum templates, Haryana MIS & UDISE+ readiness checklists, and faculty onboarding workshops.'}
              </p>
              <div className="space-y-3 pt-2 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Dedicated school-by-school database isolation and role permissions</span>
                </div>
                <div className="flex items-start gap-3">
                  <FileCheck2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Audit-logged marks, fee receipts, Finance 360°, VCIP &amp; Clinical Care governance
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>On-campus implementation &amp; teacher training across Haryana &amp; NCR</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl border border-slate-700 bg-slate-800/80 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {(
                  [
                    'Parent Admission & Campus Visit',
                    'School Demo & Onboarding',
                    'General Contact',
                  ] as const
                ).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setEnquiryType(t);
                      setEnqError(null);
                      setEnqSuccess(null);
                    }}
                    className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      enquiryType === t
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                {enquiryType === 'Parent Admission & Campus Visit' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="adm-school"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          {isHi ? 'विद्यालय चुनें' : 'Select Campus / School'}
                        </label>
                        <select
                          id="adm-school"
                          value={targetSchoolId}
                          onChange={(e) => setTargetSchoolId(e.target.value)}
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                        >
                          {schools.length > 0 ? (
                            schools.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.city} · {s.board})
                              </option>
                            ))
                          ) : (
                            <option value="school-vis-jjr">
                              Virat International School (Jhajjar · HBSE)
                            </option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="adm-class"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          {isHi ? 'प्रवेश कक्षा' : 'Applying Class'}
                        </label>
                        <select
                          id="adm-class"
                          value={admApplyingClass}
                          onChange={(e) => setAdmApplyingClass(e.target.value)}
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                        >
                          {[
                            'Nursery',
                            'KG',
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
                            'Class 11',
                            'Class 12',
                          ].map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="adm-student"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          {isHi ? 'विद्यार्थी का नाम' : 'Student Full Name'}
                        </label>
                        <input
                          id="adm-student"
                          type="text"
                          value={admStudentName}
                          onChange={(e) => setAdmStudentName(e.target.value)}
                          placeholder="e.g. Aarav Deswal"
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="adm-parent"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          {isHi ? 'अभिभावक का नाम' : 'Parent / Guardian Name'}
                        </label>
                        <input
                          id="adm-parent"
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Rajesh Deswal"
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label
                          htmlFor="adm-phone"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          {isHi ? 'मोबाइल / WhatsApp' : 'Mobile / WhatsApp'}
                        </label>
                        <input
                          id="adm-phone"
                          type="tel"
                          value={enqPhone}
                          onChange={(e) => setEnqPhone(e.target.value)}
                          placeholder="+91 98120 12345"
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="adm-visit"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          {isHi ? 'पसंदीदा विज़िट तिथि' : 'Preferred Visit Date'}
                        </label>
                        <input
                          id="adm-visit"
                          type="date"
                          value={admVisitDate}
                          onChange={(e) => setAdmVisitDate(e.target.value)}
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="adm-locality"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          {isHi ? 'क्षेत्र / गाँव / शहर' : 'Locality / Village / City'}
                        </label>
                        <input
                          id="adm-locality"
                          type="text"
                          value={cityState}
                          onChange={(e) => setCityState(e.target.value)}
                          placeholder="e.g. Sector 6, Jhajjar"
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="adm-notes"
                        className="block text-xs font-medium text-slate-300 mb-1"
                      >
                        {isHi ? 'अतिरिक्त जानकारी (वैकल्पिक)' : 'Transport, Sibling, or Support Notes (Optional)'}
                      </label>
                      <textarea
                        id="adm-notes"
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g. Need bus route info from Bahadurgarh Road or speech-support walkthrough."
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="enq-org"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          {enquiryType === 'School Demo & Onboarding'
                            ? 'School Name'
                            : 'Student / Visitor Name'}
                        </label>
                        <input
                          id="enq-org"
                          type="text"
                          value={schoolOrOrgName}
                          onChange={(e) => setSchoolOrOrgName(e.target.value)}
                          placeholder="e.g. Arya Senior Secondary School"
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="enq-contact"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          Contact Person Name
                        </label>
                        <input
                          id="enq-contact"
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Principal / Coordinator Name"
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label
                          htmlFor="enq-email"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          Email
                        </label>
                        <input
                          id="enq-email"
                          type="email"
                          value={enqEmail}
                          onChange={(e) => setEnqEmail(e.target.value)}
                          placeholder="office@school.edu.in"
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="enq-phone"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          Phone
                        </label>
                        <input
                          id="enq-phone"
                          type="tel"
                          value={enqPhone}
                          onChange={(e) => setEnqPhone(e.target.value)}
                          placeholder="+91 98120 12345"
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="enq-board"
                          className="block text-xs font-medium text-slate-300 mb-1"
                        >
                          Board / City
                        </label>
                        <input
                          id="enq-board"
                          type="text"
                          value={cityState}
                          onChange={(e) => setCityState(e.target.value)}
                          placeholder="Rohtak, Haryana · HBSE"
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="enq-msg"
                        className="block text-xs font-medium text-slate-300 mb-1"
                      >
                        Requirements or Questions
                      </label>
                      <textarea
                        id="enq-msg"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share student strength, preferred demonstration date, or question."
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {enqError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-400/50 bg-red-950/60 px-3.5 py-2 text-xs text-red-200"
                  >
                    {enqError}
                  </div>
                )}
                {enqSuccess && (
                  <div
                    role="status"
                    data-testid="school-enquiry-success"
                    className="rounded-lg border border-emerald-400/50 bg-emerald-950/60 px-3.5 py-2.5 text-xs text-emerald-200 space-y-2"
                  >
                    <p>{enqSuccess}</p>
                    {enqRecommendedRoute && (
                      <div
                        data-testid="public-enquiry-recommended-route"
                        className="rounded-lg border border-[#D6B66D]/60 bg-[#142B46]/90 px-3 py-2.5 text-[#F3E6D8] space-y-1"
                      >
                        <p className="font-bold text-[#D6B66D] inline-flex items-center gap-1.5">
                          <Bus className="h-3.5 w-3.5 shrink-0" />
                          Most Recommended Bus Route Connected: {enqRecommendedRoute.routeCode} ·{' '}
                          {enqRecommendedRoute.routeName}
                        </p>
                        <p className="text-[11px] text-[#A9C5D8]">
                          Nearest Stop: <strong className="text-white">{enqRecommendedRoute.stopName}</strong>{' '}
                          (Pickup {enqRecommendedRoute.pickupTime} · Drop {enqRecommendedRoute.dropTime}) ·{' '}
                          Bus {enqRecommendedRoute.busNumber} · Driver: {enqRecommendedRoute.driverName} (
                          {enqRecommendedRoute.driverPhone}) · {enqRecommendedRoute.availableSeats} seats open
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enqSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60 transition-colors"
                >
                  {enqSubmitting
                    ? 'Submitting...'
                    : enquiryType === 'Parent Admission & Campus Visit'
                      ? isHi
                        ? 'प्रवेश अनुरोध दर्ज करें'
                        : 'Submit Admission & Visit Request'
                      : 'Submit Institutional Enquiry'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      )}
      </AnimatedPageTransition>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-[#F3E6D8]/45">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2.5">
            <img
              src={RAI_PLUS_LOGO_URL}
              alt="Rai Plus Logo"
              className="h-7 w-7 rounded-md border border-[#D6B66D]/60 object-cover bg-[#F3E6D8]"
            />
            <span className="font-display font-extrabold tracking-tight text-[#142B46]">
              RAI <span className="text-[#937024]">PLUS</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>The Complete Education Intelligence Platform · Powered by The Counsellor</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => scrollToSection('architecture')}
              className="hover:text-slate-900"
            >
              Architecture
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('roles')}
              className="hover:text-slate-900"
            >
              Role Workspaces
            </button>
            <button
              type="button"
              onClick={() => navigatePublicPage('ssb_academy')}
              className="hover:text-slate-900 font-semibold"
            >
              SSB Academy
            </button>
            <button
              type="button"
              onClick={() => navigatePublicPage('career_intelligence')}
              className="hover:text-emerald-800 font-semibold text-emerald-700"
            >
              Free Career Intelligence
            </button>
            <button
              type="button"
              onClick={() => navigatePublicPage('pricing')}
              className="hover:text-slate-900 font-semibold"
            >
              2026–27 Pricing
            </button>
            <button
              type="button"
              onClick={() => setLegalDocOpen('privacy')}
              className="hover:text-slate-900"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalDocOpen('dpdp')}
              className="hover:text-slate-900"
            >
              DPDP Child Data Safeguards
            </button>
            <button
              type="button"
              onClick={() => setLegalDocOpen('terms')}
              className="hover:text-slate-900"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="hover:text-slate-900 font-semibold text-blue-900"
            >
              Portal Login
            </button>
          </div>
        </div>
      </footer>

      <FloatingWhatsAppDemoButton isHi={isHi} />
      <LegalComplianceModal doc={legalDocOpen} onClose={() => setLegalDocOpen(null)} />

      {/* Blog Article Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-modal-title"
        >
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-amber-800">
                  {selectedArticle.category} · {selectedArticle.publishedDate} ·{' '}
                  {selectedArticle.readTime}
                </p>
                <h3
                  id="article-modal-title"
                  className="font-display text-xl font-bold text-slate-900 mt-1"
                >
                  {selectedArticle.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">By {selectedArticle.author}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label="Close article reader"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
              {selectedArticle.body}
            </p>
          </div>
        </div>
      )}
      {/* Compact Mobile Sticky Action Bar (h-14) */}
      <div
        data-testid="public-mobile-sticky-bar"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 h-14 border-t border-slate-200 bg-white/95 backdrop-blur-xs px-4 flex items-center gap-2.5"
      >
        <button
          type="button"
          onClick={() => scrollToSection('contact', 'Parent Admission & Campus Visit')}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          {isHi ? 'प्रवेश पूछताछ' : 'Admissions Enquiry'}
        </button>
        <button
          type="button"
          onClick={onOpenLogin}
          className="flex-1 rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap"
        >
          {isHi ? 'पोर्टल लॉगिन' : 'Portal Login'}
        </button>
      </div>
    </div>
  );
};
