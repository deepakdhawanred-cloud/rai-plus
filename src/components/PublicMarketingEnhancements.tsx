import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Check,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../utils/subscriptionEntitlements';
import type { PublicLang } from './PublicInteractivePreview';

export type LegalDocKind = 'privacy' | 'terms' | 'dpdp';

interface PricingAndRoiSectionProps {
  lang: PublicLang;
  onSelectPlan: (planName: string) => void;
}

const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  'Starter ERP': [
    'One-Go Attendance & Monthly Heatmaps',
    'Fast Checkbox Notebook & Homework Checks',
    'Finance 360°, Fee Receipts & Staff Payroll',
    'Student 360°, 15 OLQs & Report Cards',
    'Digital Gate Pass & Campus Visitors Desk',
  ],
  'Growth ERP': [
    'Everything in Starter ERP',
    'RFID Smart Card Attendance & Alerts',
    'Quick Revise Chapter Study Games & Mindmaps',
    'Smart Timetable, Leave & Substitutions',
    'Admissions CRM, Home Visits & Bus Rosters',
  ],
  'Premium Campus': [
    'Everything in Growth ERP',
    'Biometric Fingerprint / Face Attendance Sync',
    'Google Maps Live GPS & Route Optimizer',
    'Interactive Concept Lab & Reading/Numeracy Lab',
    'Intelligence Games & Dedicated Onboarding',
  ],
  'Enterprise 360°': [
    'Everything in Premium Campus',
    '6-Domain VCIP Cognitive Profiles & Daily Brain Gym',
    'Psychometric Suite & AI Career Guidance',
    'RCI-Aligned Clinical, Speech & Special Ed Care 360°',
    'Multi-Campus Super Admin & Priority SLA Support',
  ],
};

export const PublicPricingAndRoiSection: React.FC<PricingAndRoiSectionProps> = ({
  lang,
  onSelectPlan,
}) => {
  const isHi = lang === 'hi';
  const [billingAnnual, setBillingAnnual] = useState(true);
  const [studentCount, setStudentCount] = useState(650);
  const [avgMonthlyFeeInr, setAvgMonthlyFeeInr] = useState(2200);
  const [teacherCount, setTeacherCount] = useState(32);

  const roi = useMemo(() => {
    // Conservative Indian K-12 estimates: 3.5% faster fee recovery via automated WhatsApp/sibling reminders
    const annualFeeVolume = studentCount * avgMonthlyFeeInr * 12;
    const annualFeeRecoveryInr = Math.round(annualFeeVolume * 0.035);
    // ~22 mins saved/teacher/day across 220 working days via one-go attendance + checkbox notebooks
    const teacherHoursSavedYearly = Math.round((teacherCount * 22 * 220) / 60);
    // Paper/printing & SMS savings (~₹140/student/year)
    const paperAndAdminSavingsInr = Math.round(studentCount * 140);
    return {
      annualFeeRecoveryInr,
      teacherHoursSavedYearly,
      paperAndAdminSavingsInr,
    };
  }, [studentCount, avgMonthlyFeeInr, teacherCount]);

  return (
    <section
      id="section-pricing"
      data-testid="home-pricing-section"
      className="border-t border-slate-200 bg-gradient-to-b from-white via-[#FAF4EC]/40 to-white py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 space-y-12">
        {/* Header & Billing Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#937024]">
              {isHi ? 'पारदर्शी विद्यालय योजनाएँ' : 'Transparent Institutional Plans'}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#142B46]">
              {isHi
                ? 'हर विद्यालय के आकार के अनुसार पैकेज — बिना किसी छिपे शुल्क के।'
                : 'Built to scale from a single campus to a multi-school group.'}
            </h2>
            <p className="text-sm text-slate-600">
              {isHi
                ? 'प्रत्येक पैकेज में पृथक विद्यालय डेटाबेस, भूमिका-आधारित सुरक्षा और लाइव ऑनबोर्डिंग शामिल है।'
                : 'Every tier includes an isolated school database, strict role isolation, DPDP-ready privacy controls, and guided data migration.'}
            </p>
          </div>

          <div
            role="group"
            aria-label="Billing cycle toggle"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 self-start lg:self-auto"
          >
            <button
              type="button"
              onClick={() => setBillingAnnual(false)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                !billingAnnual ? 'bg-white text-[#142B46] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isHi ? 'मासिक बिलिंग' : 'Monthly'}
            </button>
            <button
              type="button"
              onClick={() => setBillingAnnual(true)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                billingAnnual ? 'bg-[#142B46] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{isHi ? 'वार्षिक बिलिंग' : 'Annual'}</span>
              <span className="rounded bg-[#D6B66D] px-1.5 py-0.5 text-[10px] font-bold text-[#142B46]">
                Save 15%
              </span>
            </button>
          </div>
        </div>

        {/* 4-Tier Plan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isPopular = plan.id === 'Premium Campus';
            const displayPrice = billingAnnual
              ? Math.round(plan.priceMonthlyInr * 0.85)
              : plan.priceMonthlyInr;
            const highlights = PLAN_HIGHLIGHTS[plan.id] || [];

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 flex flex-col justify-between transition-shadow ${
                  isPopular
                    ? 'border-[#142B46] bg-[#142B46] text-[#F3E6D8] shadow-lg'
                    : 'border-slate-200 bg-white text-slate-900 hover:shadow-md'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full bg-[#D6B66D] px-3 py-0.5 text-[11px] font-bold text-[#142B46]">
                    <Sparkles className="h-3 w-3" /> Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-wider ${
                        isPopular ? 'text-[#D6B66D]' : 'text-[#2F7A57]'
                      }`}
                    >
                      {plan.tierCategory} Tier
                    </p>
                    <h3
                      className={`font-display text-lg font-bold mt-1 ${
                        isPopular ? 'text-white' : 'text-[#142B46]'
                      }`}
                    >
                      {plan.id}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isPopular ? 'text-[#A9C5D8]' : 'text-slate-600'}`}>
                      {plan.headline}
                    </p>
                  </div>

                  <div className={`border-y py-4 ${isPopular ? 'border-[#254264]' : 'border-slate-100'}`}>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-3xl font-bold tabular-nums">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-xs ${isPopular ? 'text-[#A9C5D8]' : 'text-slate-500'}`}>
                        / month
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 ${isPopular ? 'text-[#D6B66D]' : 'text-slate-500'}`}>
                      {billingAnnual ? 'Billed annually · Free 14-day guided pilot' : 'Billed monthly · Cancel anytime'}
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs">
                    {highlights.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check
                          className={`h-4 w-4 shrink-0 mt-0.5 ${
                            isPopular ? 'text-[#D6B66D]' : 'text-emerald-600'
                          }`}
                        />
                        <span className={isPopular ? 'text-[#F3E6D8]/90' : 'text-slate-700'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
                    isPopular
                      ? 'bg-[#D6B66D] text-[#142B46] hover:bg-[#C29E4F]'
                      : 'bg-[#142B46] text-white hover:bg-[#1E3A5F]'
                  }`}
                >
                  {isHi ? 'डेमो बुक करें' : `Start with ${plan.id}`}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Interactive School ROI & Fee-Recovery Calculator */}
        <div className="rounded-2xl border border-[#142B46]/15 bg-[#F4F8FC] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold text-[#142B46]">
              <Calculator className="h-3.5 w-3.5 text-[#937024]" />
              {isHi ? 'विद्यालय ROI कैलकुलेटर' : 'School ROI & Time-Saved Estimator'}
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#142B46]">
              {isHi
                ? 'देखें कि राय प्लस आपके विद्यालय का कितना समय और शुल्क बचाता है।'
                : 'Estimate your annual fee recovery & teacher hours saved.'}
            </h3>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <label htmlFor="roi-students">Total Students</label>
                  <span className="font-mono text-[#142B46]">{studentCount}</span>
                </div>
                <input
                  id="roi-students"
                  type="range"
                  min={150}
                  max={3000}
                  step={50}
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full accent-[#142B46]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <label htmlFor="roi-fee">Average Monthly Tuition (₹)</label>
                  <span className="font-mono text-[#142B46]">₹{avgMonthlyFeeInr.toLocaleString('en-IN')}</span>
                </div>
                <input
                  id="roi-fee"
                  type="range"
                  min={800}
                  max={8000}
                  step={200}
                  value={avgMonthlyFeeInr}
                  onChange={(e) => setAvgMonthlyFeeInr(Number(e.target.value))}
                  className="w-full accent-[#142B46]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <label htmlFor="roi-teachers">Teaching &amp; Admin Staff</label>
                  <span className="font-mono text-[#142B46]">{teacherCount}</span>
                </div>
                <input
                  id="roi-teachers"
                  type="range"
                  min={10}
                  max={150}
                  step={2}
                  value={teacherCount}
                  onChange={(e) => setTeacherCount(Number(e.target.value))}
                  className="w-full accent-[#142B46]"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-emerald-200 bg-white p-5 space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Est. Faster Fee Recovery
              </p>
              <p className="font-mono text-2xl font-bold text-[#142B46] tabular-nums">
                ₹{(roi.annualFeeRecoveryInr / 100000).toFixed(1)}L
              </p>
              <p className="text-[11px] text-slate-500">
                Per year via sibling ledger clarity &amp; automated WhatsApp reminders
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-white p-5 space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                Teacher Time Reclaimed
              </p>
              <p className="font-mono text-2xl font-bold text-[#142B46] tabular-nums">
                {roi.teacherHoursSavedYearly.toLocaleString('en-IN')} hrs
              </p>
              <p className="text-[11px] text-slate-500">
                Per year from 30-second roll call &amp; fast checkbox notebook entry
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-white p-5 space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-800">
                Paper &amp; Ops Savings
              </p>
              <p className="font-mono text-2xl font-bold text-[#142B46] tabular-nums">
                ₹{roi.paperAndAdminSavingsInr.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500">
                Saved annually on registers, report printouts &amp; manual follow-ups
              </p>
            </div>
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
      className="fixed bottom-16 md:bottom-6 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#1F7A4D] px-4 py-3 text-xs font-bold text-white shadow-lg hover:bg-[#17613C] transition-all print:hidden"
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
        'Strict Multi-Tenant Isolation: Every school operates inside a logically isolated database partition. Staff, teachers, parents, and students can only access records authorized for their school and role.',
        'Minimum Necessary Access: Counsellor internal notes, RCI clinical reports, and staff salary ledgers are protected by server-side role-based access control and segregation of duties.',
        'Encrypted Transit & Protected Sessions: All API traffic is enforced over HTTPS/TLS with HttpOnly session cookies, security headers (CSP, HSTS, nosniff), and full audit logging of sensitive reads and updates.',
        'Zero Third-Party Ad Tracking: Rai Plus never sells student, parent, or school data to advertisers or third-party data brokers.',
      ],
    },
    dpdp: {
      title: 'DPDP Act 2023 — Child Data & Ethical Assessment Safeguards',
      subtitle: 'Aligned with India’s Digital Personal Data Protection Act, 2023',
      points: [
        'Verifiable Parental Consent: Cognitive profiles (VCIP), developmental screenings, and clinical/speech therapy plans require explicit guardian consent and formal Counsellor/Principal approval before release.',
        'Strictly Non-Diagnostic Classroom Tools: Attendance early-support indicators, Erikson developmental insights, and thinking assessments are framed solely as human-reviewed growth aids — never automated medical labels.',
        'Auditability & Data Erasure: Every family view, consent toggle, and report approval is timestamped in an immutable institutional audit log. Schools retain full ownership and export rights over their student data.',
        'Private Storage of Financial & Clinical Records: Student fee ledgers, staff payrolls, and individual reports are stored strictly outside public web folders and delivered only through authenticated endpoints.',
      ],
    },
    terms: {
      title: 'Terms of Service & School Onboarding SLA',
      subtitle: 'Institutional Licensing & Platform Usage Terms',
      points: [
        'Authorized Institutional Use: Schools are responsible for provisioning verified staff, accountant, clinician, and guardian credentials and maintaining password hygiene for production accounts.',
        'Segregation of Duties: Financial approvals, payroll disbursement sign-offs, and VCIP cognitive profile publication require designated Principal/Admin or Counsellor authorization.',
        'AI Advisory Disclaimer: Optional AI-assisted study mindmaps, career drafts, and remedial suggestions are generated strictly as teacher/counsellor drafts and require human verification prior to publication.',
        'Support & Uptime Commitment: Managed campus deployments include automated database backups, zero-downtime health monitoring, and guided onboarding for school leadership and teachers.',
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
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-5"
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
