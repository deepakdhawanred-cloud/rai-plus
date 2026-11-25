import React, { useMemo, useState } from 'react';
import { ArrowLeft, Download, FileDown, Trash2 } from 'lucide-react';
import type {
  PsychometricBatteryRecord,
  PsychometricIqRecord,
  PsychometricPersonalityRecord,
  PsychometricRecord,
} from '../../types';
import {
  AGE_BANDS,
  BAT_INDEX,
  BAT_INDEX_ORDER,
  BAT_SUBS,
  BF_ITEMS,
  FSIQ_SUBS,
  IQ_BANK,
  NORM_MIN,
  RIASEC,
  RIASEC_ORDER,
  TRAITS,
  TRAIT_ORDER,
  corr,
  cronbach,
  exportPsychometricCsv,
  itemAnalysis,
  localIQNorm,
  meanOf,
  personalityLocalPercentile,
  scoreBattery,
  variance,
} from '../../utils/psychometricEngine';

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ============================================================================
// 1. CLINICAL REPORT VIEW (BATTERY / REASONING IQ / PERSONALITY + RIASEC)
// ============================================================================

interface PsychometricReportViewProps {
  record: PsychometricRecord;
  allRecords: PsychometricRecord[];
  backLabel: string;
  onBack: () => void;
}

export const PsychometricReportView: React.FC<PsychometricReportViewProps> = ({
  record,
  allRecords,
  backLabel,
  onBack,
}) => {
  const validBats = useMemo(
    () =>
      allRecords.filter(
        (r): r is PsychometricBatteryRecord => r.type === 'battery' && Boolean(r.validity?.valid),
      ),
    [allRecords],
  );

  const handleDownloadHtml = () => {
    const el = document.getElementById('psy-report-export');
    if (!el) return;
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const safeTitle = `${escapeHtml(record.p.name)} - ${escapeHtml(record.type)} report`;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${safeTitle}</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:24px auto;padding:0 16px;color:#0f172a;background:#f8fafc}section{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:left}</style></head><body>${el.innerHTML}</body></html>`;
    triggerDownload(
      `${record.p.name.replace(/[^\w-]+/g, '_')}_${record.type}_report.html`,
      html,
      'text/html;charset=utf-8',
    );
  };

  const reportHead = (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {record.type === 'iq'
            ? 'Reasoning Test Report'
            : record.type === 'battery'
              ? 'Cognitive Profile Report'
              : 'Personality & Career Interest Report'}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{record.p.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Age {record.p.age} · {record.p.cls} ·{' '}
          {new Date(record.ts).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}{' '}
          · {Math.max(1, Math.round(record.durationSec / 60))} min
        </p>
      </div>
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          record.validity.valid
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-800'
        }`}
      >
        {record.validity.valid ? 'Response quality OK' : 'Check response quality'}
      </span>
    </div>
  );

  const validityNotice = record.validity.valid ? (
    <p className="text-xs text-slate-500">
      Response-quality checks passed:{' '}
      {record.type === 'battery'
        ? 'speed-task error rates, span-task understanding and answer timing'
        : record.type === 'iq'
          ? 'answer timing, completion and answer-pattern consistency'
          : 'attention checks, identical-answer runs, answer variation and speed'}{' '}
      all looked normal.
    </p>
  ) : (
    <div className="rounded-lg border border-amber-200 bg-amber-50/75 px-4 py-3 text-xs text-slate-800">
      <strong>Interpret with caution.</strong> {record.validity.flags.join('; ')}. Results like this
      often come from rushing, low effort or misunderstanding. Consider re-testing after a
      conversation with the student.
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel}
        </button>
        <button
          type="button"
          onClick={handleDownloadHtml}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#1d5b86] text-[#1d5b86] bg-white text-xs font-semibold hover:bg-[#e2ecf3]/50"
        >
          <Download className="w-3.5 h-3.5" />
          Download report (HTML)
        </button>
      </div>

      <div id="psy-report-export" className="space-y-4">
        {record.type === 'battery' && (
          <BatteryReportBody
            rec={record}
            validBats={validBats}
            reportHead={reportHead}
            validityNotice={validityNotice}
          />
        )}
        {record.type === 'iq' && (
          <IqReportBody
            rec={record}
            allRecords={allRecords}
            reportHead={reportHead}
            validityNotice={validityNotice}
          />
        )}
        {record.type === 'personality' && (
          <PersonalityReportBody
            rec={record}
            allRecords={allRecords}
            reportHead={reportHead}
            validityNotice={validityNotice}
          />
        )}
      </div>
    </div>
  );
};

const BatteryReportBody: React.FC<{
  rec: PsychometricBatteryRecord;
  validBats: PsychometricBatteryRecord[];
  reportHead: React.ReactNode;
  validityNotice: React.ReactNode;
}> = ({ rec, validBats, reportHead, validityNotice }) => {
  const sc = scoreBattery(rec, validBats);
  const X = (v: number) => Math.max(0, Math.min(100, ((v - 40) / 120) * 100));
  const strong = BAT_INDEX_ORDER.filter((k) => sc.sw[k] === 'S');
  const weak = BAT_INDEX_ORDER.filter((k) => sc.sw[k] === 'W');
  const ds = rec.res.DS;

  const summaryLines: string[] = [
    `${rec.p.name}'s overall score (FSIQ ${sc.FSIQ.score}) falls in the ${sc.FSIQ.band.toLowerCase()} range, higher than about ${sc.FSIQ.pct}% of peers of the same age${sc.local ? ' in your school sample' : ''}.`,
  ];
  if (strong.length) {
    summaryLines.push(
      `Relative strength in ${strong.map((k) => BAT_INDEX[k].name).join(' and ')}, compared with the student's own average.`,
    );
  }
  if (weak.length) {
    summaryLines.push(
      `Relative weakness in ${weak.map((k) => BAT_INDEX[k].name).join(' and ')}. Use it to target learning support, not as a diagnosis.`,
    );
  }
  if (!strong.length && !weak.length) {
    summaryLines.push(
      'The five index scores are fairly even, so the overall FSIQ summarises the cognitive profile well.',
    );
  }
  if (sc.spread >= 23) {
    summaryLines.push(
      `The index scores differ by ${sc.spread} points. With a spread this large, interpret the profile index by index rather than relying on one number. The General Ability Index (${sc.GAI.score}) leaves out memory and speed and may better reflect reasoning ability.`,
    );
  }
  if (ds.longest.F - ds.longest.B >= 3) {
    summaryLines.push(
      `Forward span (${ds.longest.F}) is notably longer than backward span (${ds.longest.B}), suggesting holding information is easier than mentally manipulating it.`,
    );
  }

  const renderIndexRow = (
    label: string,
    o: { score: number; ci: [number, number]; pct: number; band: string },
    tag: '' | 'S' | 'W',
  ) => (
    <div
      key={label}
      className="grid grid-cols-1 md:grid-cols-[240px_1fr_54px] gap-3 items-center py-3 border-t border-slate-200"
    >
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-900">{label}</span>
          {tag && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                tag === 'S' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {tag === 'S' ? 'Relative strength' : 'Relative weakness'}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {o.band} · percentile {o.pct} · 90% CI {o.ci[0]}–{o.ci[1]}
        </p>
      </div>
      <div className="relative h-5 rounded bg-slate-100">
        <span
          className="absolute top-0 bottom-0 bg-slate-200/80"
          style={{ left: `${X(85)}%`, width: `${X(115) - X(85)}%` }}
        />
        <span
          className="absolute -top-1 -bottom-1 w-0.5 bg-slate-400"
          style={{ left: `${X(100)}%` }}
        />
        <span
          className="absolute top-1.5 h-2 rounded bg-[#1d5b86]/35"
          style={{ left: `${X(o.ci[0])}%`, width: `${X(o.ci[1]) - X(o.ci[0])}%` }}
        />
        <span
          className="absolute top-1/2 w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full bg-[#1d5b86] border-2 border-white"
          style={{ left: `${X(o.score)}%` }}
        />
      </div>
      <span className="text-base font-bold text-slate-900 tabular-nums md:text-right">
        {o.score}
      </span>
    </div>
  );

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        {reportHead}
        <div className="flex flex-wrap gap-8 items-end pt-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Full Scale IQ {sc.local ? '(local norms)' : '(provisional)'}
            </p>
            <p className="text-5xl font-serif font-bold text-slate-900 tabular-nums">
              {sc.FSIQ.score}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              90% range {sc.FSIQ.ci[0]}–{sc.FSIQ.ci[1]} · {sc.FSIQ.band} · percentile {sc.FSIQ.pct}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              General Ability Index
            </p>
            <p className="text-3xl font-serif font-bold text-slate-900 tabular-nums">
              {sc.GAI.score}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Reasoning without memory &amp; speed</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cognitive Proficiency Index
            </p>
            <p className="text-3xl font-serif font-bold text-slate-900 tabular-nums">
              {sc.CPI.score}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Memory &amp; processing speed</p>
          </div>
        </div>
        {validityNotice}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2">
          <h4 className="text-base font-bold text-slate-900">Index Profile (Wechsler 5-Index)</h4>
          <span className="text-xs text-slate-500">
            Shaded = average range 85–115 · bar = 90% confidence interval
          </span>
        </div>
        {BAT_INDEX_ORDER.map((k) => renderIndexRow(BAT_INDEX[k].name, sc.idx[k], sc.sw[k]))}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_54px] gap-3 pt-1">
          <span />
          <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
            <span>40</span>
            <span>70</span>
            <span>100</span>
            <span>130</span>
            <span>160</span>
          </div>
          <span />
        </div>
        {renderIndexRow('Full Scale IQ', sc.FSIQ, '')}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-base font-bold text-slate-900">Subtest Scaled Scores</h4>
          <span className="text-xs text-slate-500">Mean 10, SD 3 · 8–12 is average</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-2 pr-3 text-left">Index</th>
                <th className="py-2 pr-3 text-left">Subtest</th>
                <th className="py-2 pr-3 text-left">Raw</th>
                <th className="py-2 pr-3 text-left">Scaled</th>
                <th className="py-2 text-left min-w-[200px]">1 · · · · 10 · · · · 19</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {BAT_INDEX_ORDER.map((k) =>
                BAT_INDEX[k].subs.map((sKey, j) => {
                  const sub = BAT_SUBS.find((x) => x.key === sKey)!;
                  const val = sc.ss[sKey];
                  return (
                    <tr key={sKey}>
                      <td className="py-2 pr-3 text-slate-600 font-medium">
                        {j === 0 ? BAT_INDEX[k].name : ''}
                      </td>
                      <td className="py-2 pr-3 text-slate-900">
                        {sub.name}{' '}
                        {!FSIQ_SUBS.includes(sKey) && (
                          <span className="text-xs text-slate-400">(supplemental)</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 tabular-nums text-slate-700">{rec.raw[sKey]}</td>
                      <td className="py-2 pr-3 tabular-nums font-bold text-slate-900">{val}</td>
                      <td className="py-2">
                        <div className="relative h-4 rounded bg-slate-100">
                          <span
                            className="absolute top-0 bottom-0 bg-slate-200"
                            style={{ left: `${(7.5 / 18) * 100}%`, width: `${(5 / 18) * 100}%` }}
                          />
                          <span
                            className="absolute top-1/2 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-[#1d5b86] border-2 border-white"
                            style={{ left: `${((val - 1) / 18) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          Digit Span: longest forward {ds.longest.F}, backward {ds.longest.B}, sequencing{' '}
          {ds.longest.S}. Symbol Coding: {rec.res.CD.raw} correct, {rec.res.CD.errors} errors.
          Symbol Search: {rec.res.SS.correct} correct, {rec.res.SS.errors} errors.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <h4 className="text-base font-bold text-slate-900">Clinical Guidance Summary</h4>
        {summaryLines.map((line, i) => (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">
            {line}
          </p>
        ))}
        <div className="rounded-lg border border-amber-200 bg-amber-50/75 px-4 py-3 text-xs text-slate-700 leading-relaxed">
          {sc.local
            ? `Scores compare this student with ${sc.normN} valid results from the same age band collected in your school.`
            : `Scores are provisional: they use estimated age norms until ${NORM_MIN} valid batteries exist for age band ${rec.p.band} (currently ${sc.normN}). They then switch to local school norms automatically.`}{' '}
          This battery follows the Wechsler index structure using original screening items. It is a
          counselling and educational guidance tool, not a clinical WAIS or WISC diagnosis.
        </div>
      </section>
    </>
  );
};

const IqReportBody: React.FC<{
  rec: PsychometricIqRecord;
  allRecords: PsychometricRecord[];
  reportHead: React.ReactNode;
  validityNotice: React.ReactNode;
}> = ({ rec, allRecords, reportHead, validityNotice }) => {
  const ln = localIQNorm(rec, allRecords);
  const lo = rec.iq - rec.ci;
  const hi = rec.iq + rec.ci;
  const X = (v: number) => Math.max(0, Math.min(100, ((v - 55) / 90) * 100));

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        {reportHead}
        <div className="flex flex-wrap gap-8 items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Provisional IQ Estimate (3PL IRT)
            </p>
            <p className="text-5xl font-serif font-bold text-slate-900 tabular-nums">{rec.iq}</p>
            <p className="text-xs text-slate-500 mt-1">
              90% range {lo}–{hi} · {rec.band}
            </p>
          </div>
          {ln.iq != null && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Local School Norm IQ (age {rec.p.band}, n={ln.n})
              </p>
              <p className="text-5xl font-serif font-bold text-[#1d5b86] tabular-nums">{ln.iq}</p>
              <p className="text-xs text-slate-500 mt-1">Percentile {ln.pr} in school sample</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Raw Score
            </p>
            <p className="text-4xl font-serif font-bold text-slate-900 tabular-nums">
              {rec.raw}
              <span className="text-lg text-slate-400">/{IQ_BANK.length}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">{rec.answered} answered</p>
          </div>
        </div>

        <div>
          <div className="relative h-7">
            <div className="absolute inset-x-0 top-3.5 h-0.5 bg-slate-200" />
            <div
              className="absolute top-2 h-3.5 rounded bg-[#e2ecf3] border border-[#1d5b86]"
              style={{ left: `${X(lo)}%`, width: `${X(hi) - X(lo)}%` }}
            />
            <div
              className="absolute top-1 w-1 h-5 -ml-0.5 rounded bg-[#1d5b86]"
              style={{ left: `${X(rec.iq)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
            <span>55</span>
            <span>70</span>
            <span>85</span>
            <span>100</span>
            <span>115</span>
            <span>130</span>
            <span>145</span>
          </div>
        </div>
        {validityNotice}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <h4 className="text-base font-bold text-slate-900">CHC Cognitive Ability Profile</h4>
        <div className="divide-y divide-slate-200">
          {Object.entries(rec.domains).map(([k, d]) => (
            <div
              key={k}
              className="grid grid-cols-1 sm:grid-cols-[200px_1fr_54px] gap-3 items-center py-3"
            >
              <span className="text-sm font-semibold text-slate-900">{d.name}</span>
              <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-[#1d5b86] rounded-full"
                  style={{ width: `${(d.c / Math.max(1, d.n)) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-900 tabular-nums sm:text-right">
                {d.c}/{d.n}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Domain scores use 8–12 items each, so treat differences under ~3 items as normal sampling
          noise. Gf = fluid reasoning, Gc = verbal knowledge &amp; reasoning, Gv = visual-spatial.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <h4 className="text-base font-bold text-slate-900">How to Read This Score</h4>
        <p className="text-sm text-slate-700 leading-relaxed">
          The provisional score places ability on the standard IQ scale (mean 100, SD 15) using a
          3-parameter logistic (3PL) Item Response Theory model with EAP ability estimation.{' '}
          {ln.iq != null
            ? 'The local-norm score compares the student only with same-age peers in this school and should be preferred.'
            : `Once ${NORM_MIN} valid results exist for age band ${rec.p.band} (currently ${ln.n}), a local school norm score appears automatically.`}
        </p>
        <div className="rounded-lg border border-amber-200 bg-amber-50/75 px-4 py-3 text-xs text-slate-700">
          This is a screening estimate, not a clinical IQ diagnosis. Clinical decisions require an
          individually administered, nationally normed test (e.g., WISC-V India, MISIC) by an
          RCI-registered psychologist.
        </div>
      </section>
    </>
  );
};

const PersonalityReportBody: React.FC<{
  rec: PsychometricPersonalityRecord;
  allRecords: PsychometricRecord[];
  reportHead: React.ReactNode;
  validityNotice: React.ReactNode;
}> = ({ rec, allRecords, reportHead, validityNotice }) => {
  const codeLetters = rec.code.split('') as Array<keyof typeof RIASEC>;
  const validPersCount = allRecords.filter(
    (r) => r.type === 'personality' && r.validity?.valid,
  ).length;

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        {reportHead}
        {validityNotice}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-base font-bold text-slate-900">Big Five Personality Profile (IPIP-50)</h4>
          <span className="text-xs text-slate-500">0–100 scale · centre line marks midpoint</span>
        </div>
        <div className="divide-y divide-slate-200">
          {TRAIT_ORDER.map((t) => {
            const s = rec.traits[t];
            const pct = personalityLocalPercentile(rec, t, allRecords);
            const lvl = s.pomp >= 65 ? 'hi' : s.pomp <= 35 ? 'lo' : 'mid';
            return (
              <div key={t} className="py-3 space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_48px] gap-3 items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{TRAITS[t].name}</p>
                    <p className="text-xs text-slate-500">
                      {lvl === 'hi' ? 'Higher' : lvl === 'lo' ? 'Lower' : 'Middle range'}
                      {pct != null ? ` · percentile ${pct}` : ''}
                    </p>
                  </div>
                  <div className="relative h-3 rounded-full bg-slate-200">
                    <span className="absolute left-1/2 -top-1 -bottom-1 w-0.5 bg-slate-400" />
                    <div
                      className="h-full bg-[#1d5b86] rounded-full"
                      style={{ width: `${s.pomp}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 tabular-nums sm:text-right">
                    {s.pomp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 sm:pl-[212px]">{TRAITS[t][lvl]}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500">
          Scores are percent of scale maximum (POMP).{' '}
          {validPersCount >= NORM_MIN
            ? 'Percentiles compare with valid school results.'
            : `Local school percentiles appear once ${NORM_MIN} valid results are collected.`}{' '}
          No trait is good or bad; each has strengths in different settings.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-base font-bold text-slate-900">Holland Career Interest Code (RIASEC)</h4>
          <span className="px-3.5 py-1 rounded-full bg-[#e2ecf3] text-[#1d5b86] font-mono text-base font-bold tracking-[0.18em]">
            {rec.code}
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {RIASEC_ORDER.map((k) => {
            const val = rec.riasec[k];
            const isTop = codeLetters.includes(k);
            return (
              <div
                key={k}
                className="grid grid-cols-1 sm:grid-cols-[200px_1fr_48px] gap-3 items-center py-2.5"
              >
                <span className="text-sm font-semibold text-slate-900">
                  {RIASEC[k].name} <span className="text-xs text-slate-400">({k})</span>
                </span>
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isTop ? 'bg-[#1d5b86]' : 'bg-[#1d5b86]/45'}`}
                    style={{ width: `${((val - 6) / 24) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums sm:text-right">
                  {val}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {codeLetters.map((k, idx) => (
            <div key={k} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {['Strongest', 'Second', 'Third'][idx]} · {RIASEC[k].tag}
              </p>
              <h5 className="text-base font-bold text-slate-900">{RIASEC[k].name}</h5>
              <p className="text-xs text-slate-700">{RIASEC[k].desc}</p>
              <p className="text-xs text-slate-600 pt-1">
                <strong>Fields to explore:</strong> {RIASEC[k].careers}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          {rec.differentiation < 6
            ? 'Interests are fairly flat across types (low differentiation), which is common in younger students. Encourage broad exposure before narrowing stream choices.'
            : 'Interests are clearly differentiated, making this Holland code a helpful starting point for subject stream and career counselling.'}{' '}
          (Scores range 6–30.)
        </p>
      </section>
    </>
  );
};

// ============================================================================
// 2. SCHOOL RESULTS, LOCAL NORMS & PSYCHOMETRIC ANALYTICS
// ============================================================================

interface PsychometricResultsAnalyticsProps {
  records: PsychometricRecord[];
  canExportAndDelete: boolean;
  isStudentOrParent: boolean;
  onOpenReport: (rec: PsychometricRecord) => void;
  onDeleteRecord?: (id: string) => Promise<void>;
}

export const PsychometricResultsAnalytics: React.FC<PsychometricResultsAnalyticsProps> = ({
  records,
  canExportAndDelete,
  isStudentOrParent,
  onOpenReport,
  onDeleteRecord,
}) => {
  const [filter, setFilter] = useState<'all' | 'battery' | 'iq' | 'personality'>('all');

  const validBats = useMemo(
    () =>
      records.filter(
        (r): r is PsychometricBatteryRecord => r.type === 'battery' && Boolean(r.validity?.valid),
      ),
    [records],
  );
  const validIqs = useMemo(
    () =>
      records.filter(
        (r): r is PsychometricIqRecord => r.type === 'iq' && Boolean(r.validity?.valid),
      ),
    [records],
  );
  const validPers = useMemo(
    () =>
      records.filter(
        (r): r is PsychometricPersonalityRecord =>
          r.type === 'personality' && Boolean(r.validity?.valid),
      ),
    [records],
  );

  const filtered = records.filter((r) => filter === 'all' || r.type === filter);

  const iqKr20 = useMemo(
    () => (validIqs.length >= 5 ? cronbach(validIqs.map((r) => r.correct)) : null),
    [validIqs],
  );
  const iqItemStats = useMemo(
    () => (validIqs.length >= 5 ? itemAnalysis(validIqs.map((r) => r.correct)) : []),
    [validIqs],
  );

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {isStudentOrParent ? 'My Psychometric Reports' : 'School Results, Norms & Analytics'}
          </h3>
          <p className="text-xs text-slate-500">
            {isStudentOrParent
              ? 'View your completed Cognitive Battery, Reasoning Screen, and Big Five + RIASEC career interest reports.'
              : 'All school-scoped student assessments stored securely in Rai Plus. Local norms activate automatically at 30 valid records per age band.'}
          </p>
        </div>
        {canExportAndDelete && (
          <button
            type="button"
            disabled={records.length === 0}
            onClick={() =>
              triggerDownload(
                `psychometric_results_${new Date().toISOString().slice(0, 10)}.csv`,
                exportPsychometricCsv(records),
                'text/csv;charset=utf-8',
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#1d5b86] text-[#1d5b86] text-xs font-semibold disabled:opacity-40 hover:bg-[#e2ecf3]/50"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export all results (CSV)
          </button>
        )}
      </section>

      {/* Participant Results Table */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h4 className="text-base font-bold text-slate-900">
            Completed Assessments ({filtered.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['all', 'All'],
                ['battery', 'Battery'],
                ['iq', 'Reasoning'],
                ['personality', 'Personality'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  filter === k
                    ? 'bg-[#1d5b86] text-white border-[#1d5b86]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">
            No completed assessments in this category yet. Start a test from the &ldquo;Take a
            Test&rdquo; tab.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3 text-left">Date</th>
                  <th className="py-2 pr-3 text-left">Student</th>
                  <th className="py-2 pr-3 text-left">Age / Class</th>
                  <th className="py-2 pr-3 text-left">Assessment</th>
                  <th className="py-2 pr-3 text-left">Summary Score</th>
                  <th className="py-2 pr-3 text-left">Quality</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(r.ts).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">{r.p.name}</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-600">
                      {r.p.age} yrs · {r.p.cls}
                    </td>
                    <td className="py-2.5 pr-3 text-xs font-medium text-slate-700">
                      {r.type === 'battery'
                        ? 'Cognitive Battery'
                        : r.type === 'iq'
                          ? 'Reasoning Screen'
                          : 'Personality + RIASEC'}
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-slate-900">
                      {r.type === 'battery'
                        ? `FSIQ ${scoreBattery(r, validBats).FSIQ.score}`
                        : r.type === 'iq'
                          ? `IQ ${r.iq} (${r.raw}/${IQ_BANK.length})`
                          : `${r.code} · Conscientiousness ${r.traits.C.pomp}`}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          r.validity.valid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.validity.valid ? 'OK' : 'Check'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenReport(r)}
                          className="px-3 py-1 rounded-md border border-[#1d5b86] text-[#1d5b86] text-xs font-semibold hover:bg-[#e2ecf3]/50"
                        >
                          Open report
                        </button>
                        {canExportAndDelete && onDeleteRecord && (
                          <button
                            type="button"
                            aria-label={`Delete report for ${r.p.name}`}
                            onClick={() => void onDeleteRecord(r.id)}
                            className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Staff Psychometric Reliability & Norming Panels */}
      {!isStudentOrParent && (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h4 className="text-base font-bold text-slate-900">
              Cognitive Battery: Reliability, Norms &amp; Correlation Structure
            </h4>
            {validBats.length < 5 ? (
              <p className="text-xs text-slate-500">
                Subtest reliability (Cronbach&apos;s α) and inter-subtest correlation matrix appear
                after 5 valid batteries ({validBats.length} so far). Local norms replace provisional
                norms automatically at {NORM_MIN} valid batteries per age band.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                  <span>
                    Valid batteries: <strong className="text-slate-900">{validBats.length}</strong>
                  </span>
                  {AGE_BANDS.map((b) => {
                    const n = validBats.filter((r) => r.p.band === b).length;
                    return n > 0 ? (
                      <span key={b}>
                        {b}: <strong className="text-slate-900">{n}</strong>
                        {n >= NORM_MIN ? ' (local norms)' : ''}
                      </span>
                    ) : null;
                  })}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 uppercase text-slate-500">
                        <th className="py-2 text-left">Subtest</th>
                        <th className="py-2 text-left">Index</th>
                        <th className="py-2 text-left">Mean Raw</th>
                        <th className="py-2 text-left">SD</th>
                        <th className="py-2 text-left">Reliability (α)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {BAT_SUBS.map((s) => {
                        const vals = validBats.map((r) => r.raw[s.key]);
                        const hasItems = ['SI', 'VC', 'MR', 'FW', 'SR', 'BD'].includes(s.key);
                        const alpha = hasItems
                          ? cronbach(
                              validBats.map((r) => {
                                const sub = r.res[s.key] as { items?: number[] };
                                return sub.items || [];
                              }),
                            )
                          : null;
                        return (
                          <tr key={s.key}>
                            <td className="py-2 font-medium text-slate-900">{s.name}</td>
                            <td className="py-2 text-slate-600">{BAT_INDEX[s.idx].name}</td>
                            <td className="py-2 tabular-nums">{meanOf(vals).toFixed(1)}</td>
                            <td className="py-2 tabular-nums">
                              {Math.sqrt(variance(vals)).toFixed(1)}
                            </td>
                            <td className="py-2 tabular-nums">
                              {alpha == null ? (
                                <span className="text-slate-400">retest needed</span>
                              ) : (
                                alpha.toFixed(2)
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {validBats.length >= 10 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-semibold text-[#1d5b86]">
                      Subtest correlation matrix (n = {validBats.length})
                    </summary>
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-center border border-slate-200">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="p-1.5" />
                            {BAT_SUBS.map((s) => (
                              <th key={s.key} className="p-1.5 font-semibold text-slate-600">
                                {s.key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {BAT_SUBS.map((a) => (
                            <tr key={a.key} className="border-t border-slate-100">
                              <th className="p-1.5 bg-slate-50 font-semibold text-slate-600">
                                {a.key}
                              </th>
                              {BAT_SUBS.map((b) => {
                                if (a.key === b.key) return <td key={b.key}>–</td>;
                                const rVal = corr(
                                  validBats.map((x) => x.raw[a.key]),
                                  validBats.map((x) => x.raw[b.key]),
                                );
                                const sameIdx = a.idx === b.idx;
                                return (
                                  <td
                                    key={b.key}
                                    className={`p-1.5 tabular-nums ${
                                      sameIdx ? 'bg-[#e2ecf3] font-bold text-[#1d5b86]' : ''
                                    }`}
                                  >
                                    {rVal.toFixed(2)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              Reasoning Test: Reliability (KR-20) &amp; Age-Band Norms
            </h4>
            {validIqs.length >= 5 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-5 text-xs text-slate-600">
                  <span>
                    Valid results: <strong className="text-slate-900">{validIqs.length}</strong>
                  </span>
                  <span>
                    KR-20:{' '}
                    <strong className="text-slate-900">
                      {iqKr20 == null ? '–' : iqKr20.toFixed(2)}
                    </strong>
                  </span>
                  <span>
                    Mean raw:{' '}
                    <strong className="text-slate-900">
                      {meanOf(validIqs.map((r) => r.raw)).toFixed(1)}
                    </strong>
                  </span>
                  <span>
                    SD raw:{' '}
                    <strong className="text-slate-900">
                      {Math.sqrt(variance(validIqs.map((r) => r.raw))).toFixed(1)}
                    </strong>
                  </span>
                </div>
                <details className="text-xs">
                  <summary className="cursor-pointer font-semibold text-[#1d5b86]">
                    Item analysis ({IQ_BANK.length} items)
                  </summary>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 uppercase">
                          <th className="py-1.5 text-left">Item</th>
                          <th className="py-1.5 text-left">Domain</th>
                          <th className="py-1.5 text-left">Set b</th>
                          <th className="py-1.5 text-left">% Correct</th>
                          <th className="py-1.5 text-left">Item–rest r</th>
                          <th className="py-1.5 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {iqItemStats.map((st, j) => {
                          const it = IQ_BANK[j];
                          const flagged = st.rit < 0.15 || st.p > 0.95 || st.p < 0.15;
                          return (
                            <tr key={it.id}>
                              <td className="py-1.5 font-mono">{it.id}</td>
                              <td className="py-1.5">{it.domName}</td>
                              <td className="py-1.5 tabular-nums">{it.b.toFixed(1)}</td>
                              <td className="py-1.5 tabular-nums">{Math.round(st.p * 100)}%</td>
                              <td className="py-1.5 tabular-nums">{st.rit.toFixed(2)}</td>
                              <td className="py-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    flagged
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {flagged ? 'Review' : 'OK'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                KR-20 reliability and 40-item analysis appear after 5 valid results (
                {validIqs.length} so far).
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 uppercase text-slate-500">
                    <th className="py-2 text-left">Age band</th>
                    <th className="py-2 text-left">n</th>
                    <th className="py-2 text-left">Mean provisional IQ</th>
                    <th className="py-2 text-left">SD</th>
                    <th className="py-2 text-left">Local norms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {AGE_BANDS.map((band) => {
                    const g = validIqs.filter((r) => r.p.band === band);
                    const vals = g.map((r) => r.iq);
                    return (
                      <tr key={band}>
                        <td className="py-2 font-semibold text-slate-900">{band}</td>
                        <td className="py-2 tabular-nums">{g.length}</td>
                        <td className="py-2 tabular-nums">
                          {g.length ? meanOf(vals).toFixed(1) : '–'}
                        </td>
                        <td className="py-2 tabular-nums">
                          {g.length > 1 ? Math.sqrt(variance(vals)).toFixed(1) : '–'}
                        </td>
                        <td className="py-2">
                          {g.length >= 100 ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                              Established
                            </span>
                          ) : g.length >= NORM_MIN ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#e2ecf3] text-[#1d5b86] font-semibold">
                              Provisional
                            </span>
                          ) : (
                            <span className="text-slate-400">needs {NORM_MIN - g.length} more</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <h4 className="text-base font-bold text-slate-900">
              Personality (IPIP-50): Internal Consistency
            </h4>
            {validPers.length >= 5 ? (
              <div className="flex flex-wrap gap-4 text-xs text-slate-700">
                <span>
                  Valid results: <strong>{validPers.length}</strong>
                </span>
                {TRAIT_ORDER.map((t) => {
                  const idxs = BF_ITEMS.map((x, i) => (x[1] === t ? i : -1)).filter((i) => i >= 0);
                  const mat = validPers.map((r) =>
                    idxs.map((i) => (BF_ITEMS[i][2] > 0 ? r.bf[i] : 6 - r.bf[i])),
                  );
                  const alpha = cronbach(mat);
                  return (
                    <span key={t}>
                      {TRAITS[t].name} α:{' '}
                      <strong>{alpha == null ? '–' : alpha.toFixed(2)}</strong>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Cronbach&apos;s α per Big Five trait appears after 5 valid results (
                {validPers.length} so far). Published IPIP-50 alphas are ~.76–.87 per trait.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

// ============================================================================
// 3. SCIENCE & METHODS VIEW
// ============================================================================

export const PsychometricScienceView: React.FC = () => (
  <div className="space-y-5">
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Evidence Base
        </p>
        <h3 className="text-xl font-bold text-slate-900 mt-0.5">
          What Each Test Measures and Why It Is Credible
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-slate-700">
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-900">Big Five Personality (IPIP-50)</h4>
          <p className="text-xs leading-relaxed">
            Uses the 50 public-domain Big-Five Factor Markers published by Goldberg (1992) through
            the International Personality Item Pool. Conscientiousness is the strongest personality
            predictor of academic performance (Poropat, 2009) and later life outcomes (Roberts et
            al., 2007).
          </p>
        </div>
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-900">Career Interests (RIASEC)</h4>
          <p className="text-xs leading-relaxed">
            Holland&apos;s six-type model underpins the O*NET Interest Profiler. Interest–occupation
            fit predicts persistence and satisfaction (Nye et al., 2012). The 36 activity items use
            relatable Indian school and career examples.
          </p>
        </div>
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-900">Reasoning Test (CHC / ICAR Style)</h4>
          <p className="text-xs leading-relaxed">
            Samples fluid reasoning (Gf — Matrix &amp; Series), crystallised verbal reasoning (Gc),
            and visual-spatial mental rotation (Gv). Scored via 3PL Item Response Theory with EAP
            ability estimation and automatic local deviation norms at n ≥ 30 per age band.
          </p>
        </div>
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-900">Response-Quality Diagnostics</h4>
          <p className="text-xs leading-relaxed">
            Self-report tests include two instructed-response attention checks, long-string checks,
            answer variance, and item-speed flags (Curran, 2016). Reasoning and cognitive tasks
            check speed-error tradeoffs, completion rates, and Guttman person-fit errors.
          </p>
        </div>
      </div>
    </section>

    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Cognitive Profile Battery
        </p>
        <h3 className="text-xl font-bold text-slate-900 mt-0.5">
          How It Relates to the WAIS-5 and WISC-V
        </h3>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">
        The battery mirrors the five-index Wechsler structure (Mean 10, SD 3 subtest scaled scores;
        7-subtest FSIQ, 5-subtest GAI, 4-subtest CPI) using original, unstandardised screening
        items. An index ≥ 12 points from the student&apos;s own average is highlighted as a relative
        strength or weakness.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 uppercase text-slate-500">
              <th className="py-2 text-left">Index</th>
              <th className="py-2 text-left">Subtests in Rai Plus</th>
              <th className="py-2 text-left">Comparable Wechsler Subtests</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td className="py-2 font-semibold">Verbal Comprehension (VCI)</td>
              <td className="py-2">Similarities, Vocabulary</td>
              <td className="py-2">Similarities, Vocabulary</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Visual Spatial (VSI)</td>
              <td className="py-2">Block Patterns, Shape Rotation</td>
              <td className="py-2">Block Design, Visual Puzzles</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Fluid Reasoning (FRI)</td>
              <td className="py-2">Matrix Reasoning, Balance Puzzles</td>
              <td className="py-2">Matrix Reasoning, Figure Weights</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Working Memory (WMI)</td>
              <td className="py-2">Digit Span (F/B/S), Spatial Span</td>
              <td className="py-2">Digit Span, Picture Span</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Processing Speed (PSI)</td>
              <td className="py-2">Symbol Coding, Symbol Search</td>
              <td className="py-2">Coding, Symbol Search</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Responsible Use &amp; Ethics
      </p>
      <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1.5 leading-relaxed">
        <li>
          Obtain parent/guardian consent for students under 18 and explain how screening profiles
          will support learning and career counselling.
        </li>
        <li>
          Share results in a supportive feedback conversation — never as raw numeric labels alone.
        </li>
        <li>
          Use these results for educational guidance only. Clinical diagnoses require individually
          administered, nationally normed instruments (e.g. WISC-V India, MISIC) by an
          RCI-registered psychologist (AERA, APA &amp; NCME Standards, 2014).
        </li>
      </ul>
    </section>
  </div>
);
