import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  Network,
  RotateCcw,
} from 'lucide-react';
import {
  PUBLIC_BRAIN_GYM_SAMPLES,
  PUBLIC_FAQ_ITEMS,
  PUBLIC_MINDMAP_SAMPLES,
} from '../utils/publicHomeContent';

export type PublicLang = 'en' | 'hi';

interface PublicInteractivePreviewProps {
  lang: PublicLang;
  onOpenLogin: () => void;
}

export const PublicInteractivePreview: React.FC<PublicInteractivePreviewProps> = ({
  lang,
  onOpenLogin,
}) => {
  const isHi = lang === 'hi';
  const [mode, setMode] = useState<'brain_gym' | 'mindmap'>('brain_gym');

  // Brain Gym mini-sample state
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Mind Map mini-sample state
  const [topicId, setTopicId] = useState<string>(PUBLIC_MINDMAP_SAMPLES[0].id);
  const [activeBranchId, setActiveBranchId] = useState<string>(
    PUBLIC_MINDMAP_SAMPLES[0].branches[0].id,
  );

  const activeTopic =
    PUBLIC_MINDMAP_SAMPLES.find((t) => t.id === topicId) || PUBLIC_MINDMAP_SAMPLES[0];
  const activeBranch =
    activeTopic.branches.find((b) => b.id === activeBranchId) || activeTopic.branches[0];

  const answeredCount = Object.keys(answers).length;
  const correctCount = PUBLIC_BRAIN_GYM_SAMPLES.filter(
    (q) => answers[q.id] === q.correctIndex,
  ).length;

  function handleSelectTopic(nextId: string) {
    setTopicId(nextId);
    const nextTopic = PUBLIC_MINDMAP_SAMPLES.find((t) => t.id === nextId);
    if (nextTopic && nextTopic.branches[0]) {
      setActiveBranchId(nextTopic.branches[0].id);
    }
  }

  return (
    <section
      id="section-sample"
      data-testid="public-interactive-sample"
      className="mx-auto max-w-7xl px-6 py-16 space-y-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold text-amber-800">
            {isHi ? 'बिना लॉगिन के 30-सेकंड सैंपल आज़माएँ' : 'Zero-Login Interactive Sample · Try in 30 Seconds'}
          </p>
          <h2
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
            style={{ textWrap: 'balance' }}
          >
            {isHi
              ? 'बच्चों के ब्रेन जिम और चैप्टर माइंडमैप का लाइव अनुभव देखें।'
              : 'Experience Daily Brain Gym and Chapter Mind Maps right here.'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isHi
              ? 'लॉगिन करने से पहले 3 त्वरित प्रश्न हल करें या एनसीईआरटी/एचबीएसई चैप्टर माइंडमैप के मुख्य बिंदु देखें।'
              : 'Try three quick reasoning questions or inspect an interactive NCERT/HBSE chapter mind map before opening a full school role portal.'}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Interactive product sample mode"
          className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1 self-start lg:self-auto shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'brain_gym'}
            onClick={() => setMode('brain_gym')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              mode === 'brain_gym'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="h-3.5 w-3.5" />
            {isHi ? '3-प्रश्न ब्रेन जिम' : '3-Question Brain Gym'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'mindmap'}
            onClick={() => setMode('mindmap')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              mode === 'mindmap'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            {isHi ? 'चैप्टर माइंडमैप सैंपल' : 'Chapter Mind Map'}
          </button>
        </div>
      </div>

      {mode === 'brain_gym' ? (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-6 py-3.5 text-xs">
            <div className="flex items-center gap-3 tabular-nums">
              <span className="font-semibold text-slate-900">
                Sample Score: {correctCount} / {PUBLIC_BRAIN_GYM_SAMPLES.length}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">
                {answeredCount === PUBLIC_BRAIN_GYM_SAMPLES.length
                  ? 'All 3 sample prompts completed'
                  : `${PUBLIC_BRAIN_GYM_SAMPLES.length - answeredCount} remaining`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={() => setAnswers({})}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={onOpenLogin}
                className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap"
              >
                Open Full 6-Domain VCIP →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {PUBLIC_BRAIN_GYM_SAMPLES.map((item, idx) => {
              const picked = answers[item.id];
              const isAnswered = typeof picked === 'number';
              const isCorrect = picked === item.correctIndex;
              return (
                <div key={item.id} className="p-6 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    <p className="text-xs font-mono font-semibold text-blue-900">
                      0{idx + 1}. {item.domain}
                    </p>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed">
                      {item.prompt}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {item.options.map((opt, optIdx) => {
                        const selected = picked === optIdx;
                        const showRight = isAnswered && optIdx === item.correctIndex;
                        const showWrong = selected && !isCorrect;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: optIdx }))}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold text-left transition-colors ${
                              showRight
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                : showWrong
                                  ? 'border-rose-500 bg-rose-50 text-rose-900'
                                  : selected
                                    ? 'border-blue-900 bg-blue-50 text-blue-900'
                                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <p
                        className={`text-xs leading-relaxed pt-1 flex items-start gap-1.5 ${
                          isCorrect ? 'text-emerald-800' : 'text-slate-700'
                        }`}
                      >
                        <CheckCircle2
                          className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                            isCorrect ? 'text-emerald-600' : 'text-blue-900'
                          }`}
                        />
                        <span>{item.explanation}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-6 py-3.5">
            <div className="flex flex-wrap items-center gap-2">
              {PUBLIC_MINDMAP_SAMPLES.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    topic.id === activeTopic.id
                      ? 'bg-blue-900 text-white'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {topic.classLabel} · {topic.title}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">{activeTopic.subject}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            <div className="lg:col-span-5 p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-amber-800">Central Chapter Concept</p>
                <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
                  {activeTopic.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  {activeTopic.coreIdea}
                </p>
              </div>
              <div className="space-y-1.5 pt-2">
                <p className="text-xs font-semibold text-slate-500">Select a concept node:</p>
                {activeTopic.branches.map((branch) => {
                  const active = branch.id === activeBranch.id;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => setActiveBranchId(branch.id)}
                      className={`w-full rounded-lg border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                        active
                          ? 'border-blue-900 bg-blue-50/70 text-blue-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {branch.heading}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6 bg-slate-50/40">
              <div className="space-y-3">
                <p className="text-xs font-mono font-semibold text-blue-900">
                  {activeTopic.classLabel} · Active Node Detail
                </p>
                <h4 className="font-display text-xl font-bold text-slate-900">
                  {activeBranch.heading}
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">{activeBranch.keyPoint}</p>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-800">
                  {activeBranch.formulaOrExample}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs">
                <span className="text-slate-600">
                  Full portal includes mind maps, flowcharts, and revision packs across Classes 1–12.
                </span>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0"
                >
                  Browse Full Resource Library →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

interface PublicFaqAccordionProps {
  lang: PublicLang;
}

export const PublicFaqAccordion: React.FC<PublicFaqAccordionProps> = ({ lang }) => {
  const isHi = lang === 'hi';
  const [openId, setOpenId] = useState<string>(PUBLIC_FAQ_ITEMS[0].id);

  return (
    <section
      id="section-faq"
      data-testid="public-faq-section"
      className="bg-white border-t border-slate-200 py-16"
    >
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-3">
          <p className="text-xs font-semibold text-blue-900">
            {isHi ? 'प्रिंसिपल और अभिभावकों के प्रमुख प्रश्न' : 'Principal & Parent FAQ'}
          </p>
          <h2
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
            style={{ textWrap: 'balance' }}
          >
            {isHi
              ? 'गोपनीयता, क्लिनिकल सीमाएँ और स्कूल ऑनबोर्डिंग पर स्पष्ट उत्तर।'
              : 'Clear answers on clinical ethics, data privacy, and school onboarding.'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isHi
              ? 'निर्णय लेने से पहले सबसे अधिक पूछे जाने वाले प्रश्न यहाँ सरल भाषा में दिए गए हैं।'
              : 'Straightforward governance answers covering non-diagnostic screening boundaries, Finance 360° migration, and multi-campus isolation.'}
          </p>
        </div>

        <div className="lg:col-span-8 rounded-xl border border-slate-200 divide-y divide-slate-200 overflow-hidden bg-white">
          {PUBLIC_FAQ_ITEMS.map((item) => {
            const expanded = openId === item.id;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenId(expanded ? '' : item.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50/70 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900 leading-snug">
                    {isHi ? item.questionHi : item.questionEn}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 shrink-0 transition-transform ${
                      expanded ? 'rotate-180 text-blue-900' : ''
                    }`}
                  />
                </button>
                {expanded && (
                  <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                    {isHi ? item.answerHi : item.answerEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
