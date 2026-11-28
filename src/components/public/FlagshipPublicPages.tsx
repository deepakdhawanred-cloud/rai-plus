import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  Globe,
  IndianRupee,
  Layers,
  Mic,
  Play,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import type { UserAccount } from '../../types';
import type { CommercialPricingRegistry, SsbPracticeStimulus } from '../../types/flagshipProducts';
import { apiRequest } from '../../utils/api';
import {
  computeSchoolAnnualQuote,
  createDefaultCommercialPricingRegistry,
} from '../../utils/commercialPricingRegistry';
import { analyzeSsbResponse, SSB_ACADEMY_ETHICAL_DISCLAIMER } from '../../utils/ssbAcademyEngine';
import { CAREER_INTELLIGENCE_ETHICAL_DISCLAIMER } from '../../utils/careerFiveStageEngine';

export interface PublicCommercialResponse {
  registry: CommercialPricingRegistry;
  ssbCatalogSummary: {
    totalSets: number;
    watSets: number;
    srtSets: number;
    tatSets: number;
    ppdtSets: number;
    freeDemoSets: number;
    sampleWatStimuli: SsbPracticeStimulus[];
    sampleSrtStimuli: SsbPracticeStimulus[];
  };
  careerIntelligenceSummary: {
    priceInr: number;
    stagesCount: number;
    verifiedBypassCount: number;
    marketOpportunitiesCount: number;
  };
}

export function useCommercialRegistry(): {
  data: PublicCommercialResponse | null;
  registry: CommercialPricingRegistry;
  loading: boolean;
} {
  const [data, setData] = useState<PublicCommercialResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void apiRequest<PublicCommercialResponse>('/api/public/commercial-registry')
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {
        // Fallback to canonical default registry if offline
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const registry = useMemo(
    () => data?.registry || createDefaultCommercialPricingRegistry(),
    [data],
  );
  return { data, registry, loading };
}

interface StandaloneAuthModalProps {
  mode: 'ssb' | 'career';
  onClose: () => void;
  onSuccess: (payload: { token: string; user: UserAccount; activeSchoolId: string | null }) => void;
}

export const StandaloneRegistrationModal: React.FC<StandaloneAuthModalProps> = ({
  mode,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetEntry, setTargetEntry] = useState<'NDA' | 'CDS' | 'AFCAT' | 'TES / Direct Officer Entry'>('NDA');
  const [isMinor, setIsMinor] = useState(false);
  const [guardianConsentName, setGuardianConsentName] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const endpoint = mode === 'ssb' ? '/api/auth/register-ssb' : '/api/auth/register-career';
      const payload = await apiRequest<{
        token: string;
        user: UserAccount;
        activeSchoolId: string | null;
      }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          ...(mode === 'ssb' ? { targetEntry } : {}),
          isMinor,
          guardianConsentName: isMinor ? guardianConsentName : undefined,
          consentAccepted,
        }),
      });
      onSuccess(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
      >
        <div
          className={`px-6 py-4 text-white flex items-center justify-between ${
            mode === 'ssb' ? 'bg-[#142B46]' : 'bg-[#0F2A3F]'
          }`}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              {mode === 'ssb' ? 'STANDALONE SSB_STUDENT ACCOUNT' : '100% FREE — ₹0 FOREVER'}
            </p>
            <h3 className="text-base font-bold mt-0.5">
              {mode === 'ssb'
                ? 'Start Your Rai Plus SSB Academy Account'
                : 'Start Your Free 5-Stage Career Intelligence'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="font-bold text-slate-700">Full Name *</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Singh"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="space-y-1">
              <span className="font-bold text-slate-700">Email Address *</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="font-bold text-slate-700">Create Password (min 8 chars) *</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            {mode === 'ssb' && (
              <label className="space-y-1">
                <span className="font-bold text-slate-700">Target Officer Entry</span>
                <select
                  value={targetEntry}
                  onChange={(e) => setTargetEntry(e.target.value as typeof targetEntry)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="NDA">NDA</option>
                  <option value="CDS">CDS</option>
                  <option value="AFCAT">AFCAT</option>
                  <option value="TES / Direct Officer Entry">TES / Direct Officer Entry</option>
                </select>
              </label>
            )}
          </div>

          {/* DPDP Minor (<18) Parental Consent */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-2">
            <label className="flex items-center gap-2 font-semibold text-amber-950">
              <input
                type="checkbox"
                checked={isMinor}
                onChange={(e) => setIsMinor(e.target.checked)}
              />
              Learner is under 18 years of age (requires parent/guardian consent under India DPDP Act)
            </label>
            {isMinor && (
              <input
                type="text"
                required
                value={guardianConsentName}
                onChange={(e) => setGuardianConsentName(e.target.value)}
                placeholder="Parent / Legal Guardian Full Name *"
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2"
              />
            )}
          </div>

          <label className="flex items-start gap-2 text-slate-700">
            <input
              type="checkbox"
              required
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I agree to the Rai Plus DPDP Privacy Notice & understand that this is an independent{' '}
              {mode === 'ssb'
                ? 'SSB preparation practice tool (not an official SSB board evaluation)'
                : 'free educational career discovery tool (not a job/admission guarantee)'}
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full rounded-lg px-4 py-2.5 text-xs font-bold text-white ${
              mode === 'ssb'
                ? 'bg-[#142B46] hover:bg-[#1E3B5C]'
                : 'bg-emerald-700 hover:bg-emerald-800'
            } disabled:opacity-60`}
          >
            {submitting
              ? 'Creating Standalone Account…'
              : mode === 'ssb'
                ? 'Create SSB_STUDENT Account & Enter Academy'
                : 'Create Free ₹0 Account & Start Stage 1'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 1. RAI PLUS SSB ACADEMY PUBLIC LANDING PAGE (/products/ssb-academy)
// ============================================================================

export const SsbAcademyLandingPage: React.FC<{
  onBackHome: () => void;
  onNavigatePricing: () => void;
  onOpenLogin: () => void;
  onQuickDemoSsb?: () => void;
  onRegistered: (payload: { token: string; user: UserAccount; activeSchoolId: string | null }) => void;
}> = ({ onBackHome, onNavigatePricing, onOpenLogin, onQuickDemoSsb, onRegistered }) => {
  const { data, registry } = useCommercialRegistry();
  const [registerOpen, setRegisterOpen] = useState(false);

  // Interactive WAT mini-demo directly on public page
  const demoWord = data?.ssbCatalogSummary.sampleWatStimuli[0] || {
    id: 'demo-wat-1',
    format: 'WAT' as const,
    prompt: 'COURAGE',
    category: 'Positive',
    difficulty: 'Beginner' as const,
    recommendedSeconds: 15,
    targetOlqs: ['courage' as const, 'self_confidence' as const],
  };
  const [demoResponse, setDemoResponse] = useState('');
  const [demoResult, setDemoResult] = useState<ReturnType<typeof analyzeSsbResponse> | null>(null);

  // Early access enquiry state
  const [enqName, setEnqName] = useState('');
  const [enqEmail, setEnqEmail] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqEntry, setEnqEntry] = useState('NDA / CDS');
  const [enqSubmitted, setEnqSubmitted] = useState(false);

  async function handleEnquiry(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiRequest('/api/public/product-enquiry', {
        method: 'POST',
        body: JSON.stringify({
          product: 'SSB Academy',
          name: enqName,
          email: enqEmail,
          phone: enqPhone,
          organizationOrGoal: enqEntry,
          message: 'SSB Academy Early Access & Official Fee Schedule Request',
        }),
      });
      setEnqSubmitted(true);
      setEnqName('');
      setEnqEmail('');
      setEnqPhone('');
    } catch {
      // ignore
    }
  }

  const ssbCms = registry.publicCms.ssbAcademy;
  const ssbPricing = registry.ssbAcademy;

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* Top Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#142B46]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Rai Plus Home
          </button>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onNavigatePricing} className="font-semibold text-[#142B46] hover:underline">
              View All Pricing
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              SSB Student Login
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0F2238] via-[#142B46] to-[#1D3E63] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-300/40 px-3 py-1 text-xs font-bold text-amber-200">
              <Shield className="h-3.5 w-3.5" /> RAI PLUS SSB ACADEMY · NDA · CDS · AFCAT · DIRECT ENTRY
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {ssbCms.headline}
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              {ssbCms.subheading}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRegisterOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#D6B66D] px-6 py-3 text-sm font-extrabold text-[#142B46] hover:bg-amber-300 shadow-lg"
              >
                {ssbCms.primaryCta} <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => (onQuickDemoSsb ? onQuickDemoSsb() : setRegisterOpen(true))}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20"
              >
                <Play className="h-4 w-4" /> {ssbCms.secondaryCta}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
              {[
                { val: `${data?.ssbCatalogSummary.totalSets || 100}`, lbl: 'Complete Practice Sets' },
                { val: '400+', lbl: 'Unique Curated Stimuli' },
                { val: '15 OLQs', lbl: 'Multi-Evidence Mapping' },
                { val: '100% Isolated', lbl: 'Dedicated SSB Account' },
              ].map((s) => (
                <div key={s.lbl} className="rounded-lg bg-white/10 border border-white/15 px-3 py-2.5">
                  <p className="text-lg font-extrabold text-amber-300">{s.val}</p>
                  <p className="text-[11px] text-slate-200">{s.lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Live WAT Anti-Cliché Mini-Demo */}
          <div className="lg:col-span-5 rounded-2xl border border-white/15 bg-white text-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded bg-[#142B46] px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                Try Live WAT AI Evaluation
              </span>
              <span className="text-xs font-mono font-bold text-amber-700">15s Exam Stimulus</span>
            </div>
            <div className="rounded-xl bg-[#142B46] py-6 px-4 text-center text-white">
              <p className="text-[10px] uppercase tracking-widest text-amber-300">Stimulus Word</p>
              <p className="mt-1 text-2xl font-extrabold">{demoWord.prompt}</p>
            </div>
            <input
              type="text"
              value={demoResponse}
              onChange={(e) => setDemoResponse(e.target.value)}
              placeholder="Write a natural, practical sentence with this word..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs"
            />
            <button
              type="button"
              onClick={() =>
                setDemoResult(
                  analyzeSsbResponse({
                    stimulus: demoWord,
                    responseText:
                      demoResponse.trim() ||
                      'Courage enables a leader to address setbacks honestly and guide teammates calmly.',
                    timeTakenSeconds: 11,
                  }),
                )
              }
              className="w-full rounded-lg bg-[#142B46] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1E3B5C]"
            >
              Analyze Authenticity & Practicality
            </button>
            {demoResult && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-emerald-950">
                  <span>{demoResult.authenticityFlag}</span>
                  <span>Practicality {demoResult.practicalityScore}%</span>
                </div>
                <p className="text-emerald-900">• {demoResult.positives[0]}</p>
                <p className="text-amber-900">• Tip: {demoResult.improvements[0]}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Four Core Practice Modules + OLQ Framework */}
      <section className="mx-auto max-w-7xl px-6 py-14 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Structured Scientific Psychological Practice
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142B46]">
            Four Complete SSB Modules · 25 Non-Duplicate Sets Each (100 Total)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: BookOpen,
              title: 'WAT — Word Association',
              detail: '25 Full Exam Sets with 60 curated words per set (15-second spontaneous timer, 15 min full drill) and response-specific anti-cliché feedback.',
            },
            {
              icon: Target,
              title: 'SRT — Situation Reaction',
              detail: '25 Full Exam Sets with 60 realistic situations per set across 12 SSB categories (30-minute board simulation) with practicality scoring.',
            },
            {
              icon: Layers,
              title: 'TAT — Thematic Apperception',
              detail: '25 Sets (100 atmospheric monochrome visual scenes) with 30-second observation + 4-minute story construction and hero-action analysis.',
            },
            {
              icon: Mic,
              title: 'PPDT + Narration & GD',
              detail: '25 Sets (100 hazy perceptual plates) with auto-hide timer, character perception box, 60s voice recorder & multi-perspective GD simulator.',
            },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-[#142B46] text-amber-300 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#142B46]">{m.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{m.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Commercial Packaging & Enquiry */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-900">
              INDEPENDENT SUBSCRIPTION · ZERO SCHOOL ERP LOCK-IN
            </span>
            <h3 className="text-xl font-extrabold text-[#142B46]">
              {ssbPricing.priceStatus === 'published'
                ? 'Official SSB Academy Subscription Tiers'
                : ssbPricing.enquiryCtaLabel}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
              {ssbPricing.benefits.map((b) => (
                <li key={b} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {ssbPricing.priceStatus === 'published' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                {[
                  { label: 'Monthly', val: ssbPricing.monthlyInr },
                  { label: 'Quarterly', val: ssbPricing.quarterlyInr },
                  { label: 'Half-Yearly', val: ssbPricing.halfYearlyInr },
                  { label: 'Annual', val: ssbPricing.annualInr },
                ]
                  .filter((p) => p.val && p.val > 0)
                  .map((p) => (
                    <div key={p.label} className="rounded-xl border border-[#142B46]/20 bg-slate-50 p-3 text-center">
                      <p className="text-[11px] font-bold text-slate-600">{p.label}</p>
                      <p className="text-xl font-extrabold text-[#142B46]">₹{p.val}</p>
                      <p className="text-[10px] text-slate-500">+{ssbPricing.gstPct}% GST</p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
                Official SSB Academy paid subscription fees are configured & published directly by Rai Plus Super Admin. Start immediately with {ssbPricing.freeDemoSetsIncluded} Free Demo Sets + {ssbPricing.trialDays}-Day Trial or request the official fee schedule.
              </p>
            )}
          </div>

          <form onSubmit={handleEnquiry} className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3 text-xs">
            <h4 className="text-sm font-bold text-[#142B46]">Request Early Access / Institutional Batch</h4>
            {enqSubmitted ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 font-medium">
                Thank you! Your SSB Academy enquiry has been logged for our team. You can also create your free demo account right now.
              </div>
            ) : (
              <>
                <input
                  type="text"
                  required
                  value={enqName}
                  onChange={(e) => setEnqName(e.target.value)}
                  placeholder="Full Name *"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                />
                <input
                  type="email"
                  required
                  value={enqEmail}
                  onChange={(e) => setEnqEmail(e.target.value)}
                  placeholder="Email Address *"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                />
                <input
                  type="tel"
                  required
                  value={enqPhone}
                  onChange={(e) => setEnqPhone(e.target.value)}
                  placeholder="WhatsApp / Mobile Number *"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                />
                <input
                  type="text"
                  value={enqEntry}
                  onChange={(e) => setEnqEntry(e.target.value)}
                  placeholder="Target Entry (NDA / CDS / AFCAT / Sainik School)"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#142B46] px-4 py-2.5 font-bold text-white hover:bg-[#1E3B5C]"
                >
                  Submit SSB Enquiry
                </button>
              </>
            )}
          </form>
        </div>

        {/* Ethical Disclaimer */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
          <p>{SSB_ACADEMY_ETHICAL_DISCLAIMER}</p>
        </div>
      </section>

      {registerOpen && (
        <StandaloneRegistrationModal
          mode="ssb"
          onClose={() => setRegisterOpen(false)}
          onSuccess={(payload) => {
            setRegisterOpen(false);
            onRegistered(payload);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// 2. RAI PLUS FREE CAREER INTELLIGENCE LANDING PAGE (/products/career-intelligence)
// ============================================================================

export const CareerIntelligenceLandingPage: React.FC<{
  onBackHome: () => void;
  onNavigatePricing: () => void;
  onOpenLogin: () => void;
  onQuickDemoCareer?: () => void;
  onRegistered: (payload: { token: string; user: UserAccount; activeSchoolId: string | null }) => void;
}> = ({ onBackHome, onNavigatePricing, onOpenLogin, onQuickDemoCareer, onRegistered }) => {
  const { data, registry } = useCommercialRegistry();
  const [registerOpen, setRegisterOpen] = useState(false);
  const cms = registry.publicCms.careerIntelligence;

  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#0F2A3F]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Rai Plus Home
          </button>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onNavigatePricing} className="font-semibold text-[#0F2A3F] hover:underline">
              Compare All Products
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0B2031] via-[#0F2A3F] to-emerald-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 border border-emerald-400/50 px-3.5 py-1 text-xs font-extrabold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" /> 100% FREE CAREER INTELLIGENCE · ₹0 FOREVER · NO PAYWALL
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight max-w-4xl leading-tight">
            {cms.headline}
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
            {cms.subheading}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-extrabold text-[#0B2031] hover:bg-emerald-300 shadow-lg"
            >
              {cms.primaryCta} <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => (onQuickDemoCareer ? onQuickDemoCareer() : setRegisterOpen(true))}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20"
            >
              <Compass className="h-4 w-4" /> {cms.secondaryCta}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
            {[
              { val: '₹0', lbl: 'Always Free Access' },
              { val: '5 Stages', lbl: 'Scientific Discovery' },
              { val: `${data?.careerIntelligenceSummary.verifiedBypassCount || 12}+`, lbl: 'Verified Budget Bypasses' },
              { val: 'India + Global', lbl: 'Verified Market Catalog' },
            ].map((k) => (
              <div key={k.lbl} className="rounded-lg bg-white/10 border border-white/15 px-3.5 py-3">
                <p className="text-xl font-extrabold text-emerald-300">{k.val}</p>
                <p className="text-[11px] text-slate-200">{k.lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Five Stages */}
      <section className="mx-auto max-w-7xl px-6 py-14 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Beyond Generic Quizzes — Built for Real Indian & Global Aspirants
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F2A3F]">
            The 5-Stage Rai Plus Career Intelligence Engine
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: 'Stage 1', icon: Brain, title: 'Capacity Discovery', desc: 'Multi-dimensional IQ (6 subdomains), EQ, AQ resilience & CQ creativity profile.' },
            { step: 'Stage 2', icon: Users, title: 'Personality & 12 Environments', desc: 'Matches your natural energy to 12 working environments and flags burnout triggers.' },
            { step: 'Stage 3', icon: IndianRupee, title: 'Budget Bypass Engine', desc: '5-pathway cost comparator + verified scholarships, public low-cost routes & apprenticeships.' },
            { step: 'Stage 4', icon: Globe, title: 'India & Global Market', desc: 'Verified salaries, demand outlook, visa/licensing rules & 3-career comparison matrix.' },
            { step: 'Stage 5', icon: TrendingUp, title: 'Today → 12-Month Plan', desc: 'Honest competition facts, 6-part skill gap diagnosis & printable 16-section report.' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-xs">
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                  {s.step}
                </span>
                <div className="h-9 w-9 rounded-lg bg-[#0F2A3F] text-emerald-300 flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-[#0F2A3F]">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-950">
          <strong>Ethical Guidance Standard:</strong> {CAREER_INTELLIGENCE_ETHICAL_DISCLAIMER}
        </div>
      </section>

      {registerOpen && (
        <StandaloneRegistrationModal
          mode="career"
          onClose={() => setRegisterOpen(false)}
          onSuccess={(payload) => {
            setRegisterOpen(false);
            onRegistered(payload);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// 3. CENTRAL DYNAMIC PRICING PAGE (/pricing)
// ============================================================================

export const DynamicPricingPage: React.FC<{
  onBackHome: () => void;
  onNavigateSsb: () => void;
  onNavigateCareer: () => void;
}> = ({ onBackHome, onNavigateSsb, onNavigateCareer }) => {
  const { registry } = useCommercialRegistry();
  const [studentCount, setStudentCount] = useState(500);
  const [tierId, setTierId] = useState<'foundation' | 'growth' | 'intelligence' | 'infinity'>('intelligence');
  const [includeRewards, setIncludeRewards] = useState(true);
  const [includeManagedCampus, setIncludeManagedCampus] = useState(false);

  const quote = useMemo(
    () =>
      computeSchoolAnnualQuote({
        registry,
        packageId: tierId,
        studentsCount: studentCount,
        classesCount: Math.max(8, Math.round(studentCount / 35)),
        includeTopLearnerRewards: includeRewards,
        includeManagedCampus: includeManagedCampus,
      }),
    [registry, tierId, studentCount, includeRewards, includeManagedCampus],
  );

  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#142B46]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Rai Plus Home
          </button>
          <span className="text-slate-500">
            Live Commercial Registry · Updated {registry.updatedAt.slice(0, 10)}
          </span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-12 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="rounded-full bg-[#142B46] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300">
            RAI PLUS 2026–27 OFFICIAL PRICING ARCHITECTURE
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142B46]">
            Transparent Pricing for Schools, Standalone Modules & Individual Learners
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">{registry.gstDisclaimer}</p>
        </div>

        {/* 1. Four School ERP Packages */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-[#142B46]">
            1. School ERP & Education Intelligence Packages (Annual per Student)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {registry.schoolPackages
              .filter((p) => p.active)
              .map((pkg) => {
                const selected = tierId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl border p-5 bg-white flex flex-col justify-between gap-4 shadow-xs ${
                      selected ? 'border-[#142B46] ring-2 ring-[#142B46]/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-extrabold text-[#142B46]">{pkg.name}</h3>
                        {pkg.highlightBadge && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                            {pkg.highlightBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{pkg.tagline}</p>
                      <div className="pt-1">
                        <span className="text-3xl font-extrabold text-[#142B46]">
                          ₹{pkg.annualPerStudentInr}
                        </span>
                        <span className="text-xs text-slate-500"> / student / year + GST</span>
                      </div>
                      <ul className="space-y-1.5 pt-2 text-xs text-slate-700">
                        {pkg.features.map((f) => (
                          <li key={f} className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTierId(pkg.id)}
                      className={`w-full rounded-lg px-3 py-2 text-xs font-bold ${
                        selected
                          ? 'bg-[#142B46] text-white'
                          : 'border border-slate-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {selected ? 'Selected in Quote Calculator ✓' : 'Calculate with this Tier'}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Interactive School Cost + Top Learner Rewards Calculator */}
        <div className="rounded-2xl border border-[#142B46]/20 bg-white p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-extrabold text-[#142B46]">
              Interactive School Annual Quote Calculator (with Top Learner Rewards & Managed Campus)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="space-y-1">
                <span className="font-bold text-slate-700">Enrolled Student Strength: {studentCount}</span>
                <input
                  type="range"
                  min={100}
                  max={3000}
                  step={50}
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full accent-[#142B46]"
                />
              </label>
              <label className="space-y-1">
                <span className="font-bold text-slate-700">Selected Package</span>
                <select
                  value={tierId}
                  onChange={(e) => setTierId(e.target.value as typeof tierId)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  {registry.schoolPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.annualPerStudentInr}/student/yr)
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-5 text-xs">
              <label className="inline-flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={includeRewards}
                  onChange={(e) => setIncludeRewards(e.target.checked)}
                />
                Include Top Learner Rewards Budget (₹{registry.topLearnerRewardsRule.schoolWideMonthlyInr}/mo school-wide)
              </label>
              <label className="inline-flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={includeManagedCampus}
                  onChange={(e) => setIncludeManagedCampus(e.target.checked)}
                />
                Include Dedicated On-Campus Managed Team (₹{registry.topLearnerRewardsRule.managedCampusTeamMonthlyInr.toLocaleString('en-IN')}/mo)
              </label>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl bg-[#142B46] text-white p-5 space-y-2 text-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Estimated Annual Investment
            </p>
            <div className="flex justify-between">
              <span>Software ({studentCount} students)</span>
              <span className="font-mono">₹{quote.softwareSubtotalInr.toLocaleString('en-IN')}</span>
            </div>
            {includeRewards && (
              <div className="flex justify-between text-emerald-300">
                <span>Top Learner Rewards (12 mo)</span>
                <span className="font-mono">₹{quote.rewardsProvisionInr.toLocaleString('en-IN')}</span>
              </div>
            )}
            {includeManagedCampus && (
              <div className="flex justify-between text-amber-200">
                <span>Managed Campus Team (12 mo)</span>
                <span className="font-mono">₹{quote.managedCampusInr.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/15 pt-2">
              <span>GST ({registry.gstPct}%)</span>
              <span className="font-mono">₹{quote.gstInr.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-amber-300 pt-1">
              <span>Grand Total / Year</span>
              <span className="font-mono">₹{quote.grandTotalInr.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* 2. Standalone Flagship Individual Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border-2 border-[#142B46] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded bg-[#142B46] px-2.5 py-1 text-[10px] font-bold uppercase text-amber-300">
                Standalone Product
              </span>
              <Award className="h-5 w-5 text-[#142B46]" />
            </div>
            <h3 className="text-xl font-extrabold text-[#142B46]">{registry.ssbAcademy.productName}</h3>
            {registry.ssbAcademy.priceStatus === 'published' && registry.ssbAcademy.monthlyInr ? (
              <p className="text-2xl font-extrabold text-[#142B46]">
                From ₹{registry.ssbAcademy.monthlyInr} / month{' '}
                <span className="text-xs font-normal text-slate-500">+{registry.ssbAcademy.gstPct}% GST</span>
              </p>
            ) : (
              <p className="text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {registry.ssbAcademy.enquiryCtaLabel} (Includes {registry.ssbAcademy.freeDemoSetsIncluded} Free Demo Sets)
              </p>
            )}
            <ul className="space-y-1.5 text-xs text-slate-700">
              {registry.ssbAcademy.benefits.map((b) => (
                <li key={b}>✓ {b}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onNavigateSsb}
              className="w-full rounded-lg bg-[#142B46] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1E3B5C]"
            >
              Explore Rai Plus SSB Academy →
            </button>
          </div>

          <div className="rounded-2xl border-2 border-emerald-600 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                100% FREE FOREVER
              </span>
              <Compass className="h-5 w-5 text-emerald-700" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0F2A3F]">
              {registry.careerIntelligence.productName}
            </h3>
            <p className="text-3xl font-extrabold text-emerald-700">
              ₹0 <span className="text-xs font-semibold text-slate-500">Free — No Paywall, No Credit Card</span>
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {registry.careerIntelligence.includedCapabilities.map((c) => (
                <li key={c}>✓ {c}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onNavigateCareer}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
            >
              Start Free 5-Stage Career Discovery →
            </button>
          </div>
        </div>

        {/* 3. Standalone Institutional Add-On Modules */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-[#142B46]">
            3. Standalone Institutional Add-On Modules (A La Carte)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registry.standaloneModules
              .filter((m) => m.active)
              .map((mod) => (
                <div key={mod.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5">
                  <p className="text-sm font-bold text-[#142B46]">{mod.name}</p>
                  <p className="text-sm font-extrabold text-emerald-800">{mod.priceSummary}</p>
                  <p className="text-xs text-slate-600">{mod.description}</p>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
};
