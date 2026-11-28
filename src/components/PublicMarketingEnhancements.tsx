import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Calculator,
  Check,
  Compass,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { computeSchoolAnnualQuote } from '../utils/commercialPricingRegistry';
import { useCommercialRegistry } from './public/FlagshipPublicPages';
import type { PublicLang } from './PublicInteractivePreview';

export type LegalDocKind = 'privacy' | 'terms' | 'dpdp';

interface PricingAndRoiSectionProps {
  lang: PublicLang;
  onSelectPlan: (planName: string) => void;
  onOpenFullPricing?: () => void;
  onOpenSsb?: () => void;
  onOpenCareer?: () => void;
}

export const PublicPricingAndRoiSection: React.FC<PricingAndRoiSectionProps> = ({
  lang,
  onSelectPlan,
  onOpenFullPricing,
  onOpenSsb,
  onOpenCareer,
}) => {
  const isHi = lang === 'hi';
  const { registry } = useCommercialRegistry();
  const [selectedTierId, setSelectedTierId] = useState<
    'foundation' | 'growth' | 'intelligence' | 'infinity'
  >('intelligence');
  const [studentCount, setStudentCount] = useState(600);
  const [includeTopLearnerRewards, setIncludeTopLearnerRewards] = useState(true);
  const [includeManagedCampus, setIncludeManagedCampus] = useState(false);

  const quote = useMemo(
    () =>
      computeSchoolAnnualQuote({
        registry,
        packageId: selectedTierId,
        studentsCount: studentCount,
        classesCount: Math.max(8, Math.round(studentCount / 35)),
        includeTopLearnerRewards,
        includeManagedCampus,
      }),
    [registry, selectedTierId, studentCount, includeTopLearnerRewards, includeManagedCampus],
  );

  const roi = useMemo(() => {
    const teacherCount = Math.max(12, Math.round(studentCount / 22));
    const annualFeeRecoveryInr = Math.round(studentCount * 2000 * 12 * 0.035);
    const teacherHoursSavedYearly = Math.round((teacherCount * 22 * 220) / 60);
    return { annualFeeRecoveryInr, teacherHoursSavedYearly };
  }, [studentCount]);

  return (
    <section
      id="section-pricing"
      data-testid="home-pricing-section"
      className="border-t border-slate-200 bg-gradient-to-b from-slate-50 via-white to-[#FAF6EE]/60 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 space-y-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#142B46]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#142B46]">
              <Sparkles className="h-3 w-3 text-[#937024]" />
              {isHi ? 'आधिकारिक 2026–27 मूल्य निर्धारण' : 'Official 2026–27 Transparent Pricing'}
            </span>
            <h2
              className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#142B46]"
              style={{ textWrap: 'balance' }}
            >
              {isHi
                ? 'प्रति विद्यार्थी वार्षिक पैकेज — पारदर्शी और हर स्कूल के लिए किफायती।'
                : 'Simple per-student annual packages built for Indian K–12 campuses.'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {registry.gstDisclaimer}
            </p>
          </div>

          {onOpenFullPricing && (
            <button
              type="button"
              onClick={onOpenFullPricing}
              className="inline-flex items-center gap-2 self-start lg:self-auto rounded-xl border border-[#142B46]/20 bg-white px-4 py-2.5 text-xs font-bold text-[#142B46] shadow-xs hover:bg-[#142B46] hover:text-white transition-all whitespace-nowrap"
            >
              <span>View Full Pricing &amp; 10 Add-On Modules</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 4 Official 2026-27 School Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {registry.schoolPackages
            .filter((pkg) => pkg.active)
            .map((pkg) => {
              const isPopular = pkg.id === 'intelligence';
              const isSelected = selectedTierId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedTierId(pkg.id)}
                  className={`relative rounded-2xl border p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                    isPopular
                      ? 'border-[#142B46] bg-[#142B46] text-[#F3E6D8] shadow-xl ring-2 ring-[#D6B66D]/50 -translate-y-0.5'
                      : isSelected
                        ? 'border-[#142B46] bg-white text-slate-900 shadow-md ring-2 ring-[#142B46]/15'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {pkg.highlightBadge && (
                    <span
                      className={`absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-xs ${
                        isPopular
                          ? 'bg-[#D6B66D] text-[#142B46]'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      <Sparkles className="h-3 w-3" /> {pkg.highlightBadge}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3
                        className={`font-display text-lg font-extrabold ${
                          isPopular ? 'text-white' : 'text-[#142B46]'
                        }`}
                      >
                        {pkg.name}
                      </h3>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isPopular ? 'text-[#C2D6E6]' : 'text-slate-600'
                        }`}
                      >
                        {pkg.tagline}
                      </p>
                    </div>

                    <div
                      className={`border-y py-4 ${
                        isPopular ? 'border-[#254264]' : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-3xl font-extrabold tabular-nums">
                          ₹{pkg.annualPerStudentInr}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            isPopular ? 'text-[#C2D6E6]' : 'text-slate-500'
                          }`}
                        >
                          / student / year
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-1 ${
                          isPopular ? 'text-[#D6B66D]' : 'text-slate-500'
                        }`}
                      >
                        + {registry.gstPct}% GST · {pkg.usageLimitsNote}
                      </p>
                    </div>

                    <ul className="space-y-2.5 text-xs">
                      {pkg.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check
                            className={`h-4 w-4 shrink-0 mt-0.5 ${
                              isPopular ? 'text-[#D6B66D]' : 'text-emerald-600'
                            }`}
                          />
                          <span className={isPopular ? 'text-[#F3E6D8]/95' : 'text-slate-700'}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTierId(pkg.id);
                      onSelectPlan(`${pkg.name} (₹${pkg.annualPerStudentInr}/student/year)`);
                    }}
                    className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
                      isPopular
                        ? 'bg-[#D6B66D] text-[#142B46] hover:bg-amber-300'
                        : 'bg-[#142B46] text-white hover:bg-[#1E3A5F]'
                    }`}
                  >
                    {isHi ? 'डेमो बुक करें' : `Request ${pkg.name} Quote`}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
        </div>

        {/* Standalone Individual Products Row (SSB Academy + 100% Free Career Intelligence) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[#142B46]/20 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#142B46] px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                <Award className="h-3 w-3" /> Standalone Individual Portal
              </div>
              <h3 className="font-display text-lg font-extrabold text-[#142B46]">
                {registry.ssbAcademy.productName}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                100 full sets (60 words/WAT · 60 situations/SRT · TAT · PPDT + Voice Narration &amp; GD) with 15-OLQ tracking.{' '}
                {registry.ssbAcademy.priceStatus === 'published' && registry.ssbAcademy.monthlyInr ? (
                  <strong className="text-[#142B46]">
                    From ₹{registry.ssbAcademy.monthlyInr}/mo + GST.
                  </strong>
                ) : (
                  <strong className="text-amber-800">
                    {registry.ssbAcademy.enquiryCtaLabel} ({registry.ssbAcademy.freeDemoSetsIncluded} Free Demo Sets included).
                  </strong>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => (onOpenSsb ? onOpenSsb() : onSelectPlan('Rai Plus SSB Academy'))}
              className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#142B46] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1E3A5F] transition-colors whitespace-nowrap"
            >
              Explore SSB Academy <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-white">
                <Compass className="h-3 w-3" /> 100% FREE — ₹0 FOREVER
              </div>
              <h3 className="font-display text-lg font-extrabold text-[#0F2A3F]">
                {registry.careerIntelligence.productName}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Complete 5-stage discovery (IQ/EQ/AQ/CQ, 12 Work Environments, Budget Bypass Engine, India &amp; Global Market, 12-Month Roadmap) — zero credit card, zero paywall.
              </p>
            </div>
            <button
              type="button"
              onClick={() => (onOpenCareer ? onOpenCareer() : onSelectPlan('Free Career Intelligence'))}
              className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors whitespace-nowrap"
            >
              Start Free Analysis <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive School Annual Quote + Top Learner Rewards + ROI Estimator */}
        <div className="rounded-2xl border border-[#142B46]/15 bg-[#F4F7FB] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold text-[#142B46]">
              <Calculator className="h-3.5 w-3.5 text-[#937024]" />
              {isHi
                ? 'वार्षिक स्कूल कोट और ROI कैलकुलेटर'
                : 'Live 2026–27 Annual Quote & School ROI Estimator'}
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#142B46]">
              {isHi
                ? 'अपने विद्यालय की छात्र संख्या के अनुसार सटीक वार्षिक निवेश देखें।'
                : 'Calculate your exact campus annual investment & Top Learner Rewards.'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="rounded-xl bg-white border border-slate-200 p-3.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <label htmlFor="quote-students">Enrolled Students</label>
                  <span className="font-mono text-[#142B46]">{studentCount}</span>
                </div>
                <input
                  id="quote-students"
                  type="range"
                  min={150}
                  max={3000}
                  step={50}
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full accent-[#142B46]"
                />
              </div>

              <div className="rounded-xl bg-white border border-slate-200 p-3.5">
                <label htmlFor="quote-tier" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Selected 2026–27 Package
                </label>
                <select
                  id="quote-tier"
                  value={selectedTierId}
                  onChange={(e) =>
                    setSelectedTierId(
                      e.target.value as 'foundation' | 'growth' | 'intelligence' | 'infinity',
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-[#142B46]"
                >
                  {registry.schoolPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.annualPerStudentInr}/student/yr
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-700 pt-1">
              <label className="inline-flex items-center gap-2 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTopLearnerRewards}
                  onChange={(e) => setIncludeTopLearnerRewards(e.target.checked)}
                  className="accent-[#142B46]"
                />
                Top Learner Rewards Budget (₹{registry.topLearnerRewardsRule.schoolWideMonthlyInr}/mo)
              </label>
              <label className="inline-flex items-center gap-2 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeManagedCampus}
                  onChange={(e) => setIncludeManagedCampus(e.target.checked)}
                  className="accent-[#142B46]"
                />
                Dedicated On-Campus Managed Team (₹
                {registry.topLearnerRewardsRule.managedCampusTeamMonthlyInr.toLocaleString('en-IN')}/mo)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl bg-white border border-emerald-200 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Est. Faster Fee Recovery
                </p>
                <p className="font-mono text-lg font-extrabold text-[#142B46] tabular-nums">
                  ₹{(roi.annualFeeRecoveryInr / 100000).toFixed(1)}L / yr
                </p>
              </div>
              <div className="rounded-xl bg-white border border-amber-200 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Teacher Time Reclaimed
                </p>
                <p className="font-mono text-lg font-extrabold text-[#142B46] tabular-nums">
                  {roi.teacherHoursSavedYearly.toLocaleString('en-IN')} hrs / yr
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-[#142B46] text-white p-6 shadow-lg space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6B66D]">
                Estimated Annual Quote
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-mono text-emerald-300">
                ₹{quote.effectivePerStudentInr}/student/yr
              </span>
            </div>
            <div className="space-y-2 pt-1 text-slate-200">
              <div className="flex justify-between">
                <span>Software ({studentCount} students)</span>
                <span className="font-mono font-semibold text-white">
                  ₹{quote.softwareSubtotalInr.toLocaleString('en-IN')}
                </span>
              </div>
              {includeTopLearnerRewards && (
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
              <div className="flex justify-between text-lg font-extrabold text-[#D6B66D] pt-1">
                <span>Total / Year</span>
                <span className="font-mono tabular-nums">
                  ₹{quote.grandTotalInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onSelectPlan(
                  `Custom ${selectedTierId.toUpperCase()} Quote (${studentCount} students · ₹${quote.grandTotalInr.toLocaleString('en-IN')}/yr incl. GST)`,
                )
              }
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6B66D] px-4 py-2.5 text-xs font-extrabold text-[#142B46] hover:bg-amber-300 transition-colors"
            >
              Lock This Quote &amp; Book 15-Min Walkthrough <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const FloatingWhatsAppDemoButton: React.FC<{ isHi: boolean }> = ({ isHi }) => {
  const waMessage = encodeURIComponent(
    'Hello Rai Plus Team! I would like to book a 15-minute live walkthrough of Rai Plus Education Intelligence Platform for our school.',
  );
  return (
    <a
      href={`https://wa.me/919812000000?text=${waMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp to book a Rai Plus school demo"
      data-testid="whatsapp-demo-cta"
      className="fixed bottom-16 md:bottom-6 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#1F7A4D] px-4 py-3 text-xs font-bold text-white shadow-lg hover:bg-[#17613C] hover:scale-[1.02] transition-all print:hidden"
    >
      <MessageCircle className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{isHi ? 'WhatsApp डेमो बुक करें' : 'WhatsApp 15-Min Demo'}</span>
    </a>
  );
};

export const LegalComplianceModal: React.FC<{
  doc: LegalDocKind | null;
  onClose: () => void;
}> = ({ doc, onClose }) => {
  if (!doc) return null;

  const content: Record<LegalDocKind, { title: string; subtitle: string; points: string[] }> = {
    privacy: {
      title: 'Privacy Policy & Institutional Data Governance',
      subtitle: 'Effective Session 2026–27 · Rai Plus Education Intelligence Platform',
      points: [
        'Strict Multi-Tenant Isolation: Every school operates inside a logically isolated database partition. Standalone SSB Academy and Free Career Intelligence accounts are air-gapped from all school ERP data.',
        'Minimum Necessary Access: Counsellor internal notes, RCI clinical reports, and staff salary ledgers are protected by server-side role-based access control and segregation of duties.',
        'Encrypted Transit & Protected Sessions: All API traffic is enforced over HTTPS/TLS with HttpOnly session cookies, security headers (CSP, HSTS, nosniff), and full audit logging.',
        'Zero Third-Party Ad Tracking: Rai Plus never sells student, aspirant, parent, or school data to advertisers or third-party data brokers.',
      ],
    },
    dpdp: {
      title: 'DPDP Act 2023 — Child Data & Ethical Assessment Safeguards',
      subtitle: 'Aligned with India’s Digital Personal Data Protection Act, 2023',
      points: [
        'Verifiable Parental Consent: Learners under 18 years require explicit parent/guardian consent for standalone accounts, cognitive profiles (VCIP), and developmental/clinical care plans.',
        'Strictly Non-Diagnostic & Non-Official Framing: SSB Academy is a structured preparation tool (never an official SSB assessment), Career Intelligence is guidance (never a job guarantee), and school assessments are human-reviewed growth aids.',
        'Data Export & Erasure Rights: Standalone learners can download their personal JSON data export and submit DPDP erasure requests directly from their portal.',
        'Private Storage of Financial & Clinical Records: Student fee ledgers, staff payrolls, and individual reports are stored strictly outside public web folders and delivered only through authenticated endpoints.',
      ],
    },
    terms: {
      title: 'Terms of Service & School Onboarding SLA',
      subtitle: 'Institutional Licensing & Platform Usage Terms',
      points: [
        'Authorized Institutional Use: Schools are responsible for provisioning verified staff, accountant, clinician, and guardian credentials and maintaining password hygiene for production accounts.',
        'Segregation of Duties: Financial approvals, payroll disbursement sign-offs, and VCIP cognitive profile publication require designated Principal/Admin or Counsellor authorization.',
        'AI Advisory Disclaimer: Optional AI-assisted study mindmaps, career drafts, and SSB feedback are generated strictly as learning aids and require human judgment.',
        'Support & Uptime Commitment: Managed campus deployments include automated database backups, health monitoring, and guided onboarding for school leadership and teachers.',
      ],
    },
  };

  const active = content[doc];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-5"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#142B46] text-[#D6B66D] flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 id="legal-modal-title" className="font-display text-lg font-bold text-[#142B46]">
                {active.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{active.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close legal policy modal"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
          {active.points.map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-1" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3A5F]"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
