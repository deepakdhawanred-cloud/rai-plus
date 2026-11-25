import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  GripVertical,
  Hand,
  Lightbulb,
  Puzzle,
  RotateCcw,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';
import type {
  PlatterIconKind,
  VisualConceptLabConfig,
  VisualPlatterItem,
} from '../utils/visualConceptLabEngine';

interface VisualConceptPlatterStageProps {
  labConfig: VisualConceptLabConfig;
  chapterTitle: string;
  onOutcome: (isCorrect: boolean, baseXp: number) => void;
  onCompleteStage: () => void;
  onSwitchToClassicMatch?: () => void;
}

const PlatterItemIllustration: React.FC<{ kind: PlatterIconKind }> = ({ kind }) => {
  switch (kind) {
    case 'rice':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <path d="M8 26 C8 36, 40 36, 40 26 Z" fill="#142B46" />
          <path d="M10 26 C12 16, 36 16, 38 26 Z" fill="#FFFDF8" stroke="#D6B66D" strokeWidth="1.5" />
          <circle cx="19" cy="21" r="1.4" fill="#D6B66D" />
          <circle cx="25" cy="19" r="1.4" fill="#D6B66D" />
          <circle cx="30" cy="22" r="1.4" fill="#D6B66D" />
          <rect x="16" y="34" width="16" height="3" rx="1.5" fill="#D6B66D" />
        </svg>
      );
    case 'roti':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <circle cx="24" cy="24" r="16" fill="#E9C788" stroke="#B68238" strokeWidth="2" />
          <circle cx="19" cy="19" r="2.2" fill="#9A6222" opacity="0.55" />
          <circle cx="29" cy="21" r="2.6" fill="#9A6222" opacity="0.45" />
          <circle cx="23" cy="30" r="2" fill="#9A6222" opacity="0.5" />
          <circle cx="31" cy="29" r="1.6" fill="#9A6222" opacity="0.4" />
        </svg>
      );
    case 'potato':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <ellipse cx="24" cy="25" rx="15" ry="11" fill="#C9965B" stroke="#8C5E2D" strokeWidth="1.8" />
          <ellipse cx="22" cy="23" rx="10" ry="6.5" fill="#F5DEAE" />
          <circle cx="18" cy="22" r="1.3" fill="#8C5E2D" />
          <circle cx="27" cy="25" r="1.2" fill="#8C5E2D" />
        </svg>
      );
    case 'corn':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <ellipse cx="24" cy="21" rx="8" ry="13" fill="#F4C430" stroke="#C59010" strokeWidth="1.6" />
          <path d="M13 33 C14 23, 19 25, 24 37 C29 25, 34 23, 35 33 C30 39, 18 39, 13 33 Z" fill="#5D9268" />
          <line x1="20" y1="12" x2="20" y2="29" stroke="#C59010" strokeWidth="1" opacity="0.6" />
          <line x1="24" y1="10" x2="24" y2="30" stroke="#C59010" strokeWidth="1" opacity="0.6" />
          <line x1="28" y1="12" x2="28" y2="29" stroke="#C59010" strokeWidth="1" opacity="0.6" />
        </svg>
      );
    case 'dal':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <path d="M8 23 C8 36, 40 36, 40 23 Z" fill="#8F5528" />
          <ellipse cx="24" cy="23" rx="16" ry="5.5" fill="#E8AE2F" stroke="#B77D12" strokeWidth="1.5" />
          <circle cx="20" cy="22.5" r="1.5" fill="#C94B2A" />
          <path d="M25 22 Q28 20 30 23" stroke="#3D784B" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'paneer':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <rect x="10" y="20" width="13" height="13" rx="2.5" fill="#FFFDF8" stroke="#C7B69B" strokeWidth="1.8" />
          <rect x="25" y="22" width="13" height="12" rx="2.5" fill="#FAF4EC" stroke="#C7B69B" strokeWidth="1.8" />
          <rect x="17" y="11" width="13" height="12" rx="2.5" fill="#FFFFFF" stroke="#C7B69B" strokeWidth="1.8" />
        </svg>
      );
    case 'chana':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <circle cx="17" cy="27" r="6" fill="#C6893F" stroke="#8A571F" strokeWidth="1.5" />
          <circle cx="30" cy="28" r="6" fill="#D59A4E" stroke="#8A571F" strokeWidth="1.5" />
          <circle cx="24" cy="18" r="6" fill="#E0AA5E" stroke="#8A571F" strokeWidth="1.5" />
        </svg>
      );
    case 'egg':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <ellipse cx="24" cy="24" rx="13" ry="16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="24" cy="26" r="6.5" fill="#F2AF29" />
        </svg>
      );
    case 'ghee':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <path d="M10 22 C10 35, 38 35, 38 22 Z" fill="#D6B66D" stroke="#9B7728" strokeWidth="1.5" />
          <ellipse cx="24" cy="22" rx="14" ry="5" fill="#F8DC6C" stroke="#C99A2E" strokeWidth="1.5" />
          <path d="M27 12 L34 21" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'nuts':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <ellipse cx="18" cy="25" rx="7" ry="10" transform="rotate(-18 18 25)" fill="#A86B38" stroke="#6E411E" strokeWidth="1.6" />
          <ellipse cx="30" cy="24" rx="7" ry="10" transform="rotate(20 30 24)" fill="#C6874E" stroke="#6E411E" strokeWidth="1.6" />
          <path d="M16 19 C17 24, 18 28, 20 31" stroke="#6E411E" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case 'carrot':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <path d="M15 35 L30 14 C33 16, 34 19, 31 23 L19 37 C17 38, 14 37, 15 35 Z" fill="#EC6A28" stroke="#B94612" strokeWidth="1.5" />
          <path d="M30 14 C31 9, 35 8, 37 11 C34 12, 33 14, 31 15" fill="#4F8A5B" />
        </svg>
      );
    case 'spinach':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <path d="M24 37 C13 33, 11 19, 24 10 C37 19, 35 33, 24 37 Z" fill="#3E7C4E" stroke="#255231" strokeWidth="1.6" />
          <path d="M24 14 L24 39" stroke="#A7D7B2" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M24 22 L18 18 M24 27 L30 23" stroke="#A7D7B2" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'orange':
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <circle cx="24" cy="25" r="13" fill="#F28C28" stroke="#C5610F" strokeWidth="1.6" />
          <path d="M24 12 C27 8, 32 8, 33 11 C30 13, 26 13, 24 12 Z" fill="#4F8A5B" />
          <circle cx="19" cy="21" r="1.2" fill="#FFE4B8" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
          <rect x="9" y="9" width="30" height="30" rx="8" fill="#142B46" />
          <circle cx="24" cy="24" r="7" fill="#D6B66D" />
          <path d="M24 13 L24 17 M24 31 L24 35 M13 24 L17 24 M31 24 L35 24" stroke="#FAF4EC" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};

export const VisualConceptPlatterStage: React.FC<VisualConceptPlatterStageProps> = ({
  labConfig,
  chapterTitle,
  onOutcome,
  onCompleteStage,
  onSwitchToClassicMatch,
}) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [platedIds, setPlatedIds] = useState<string[]>([]);
  const [rejectedId, setRejectedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    title: string;
    detail: string;
  } | null>(null);
  const [roundCleared, setRoundCleared] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [bonusImgFailed, setBonusImgFailed] = useState(false);
  const [allRoundsDone, setAllRoundsDone] = useState(false);

  const activeRound = labConfig.rounds[roundIdx] || labConfig.rounds[0];

  useEffect(() => {
    setRoundIdx(0);
    setPlatedIds([]);
    setRejectedId(null);
    setFeedback(null);
    setRoundCleared(false);
    setAllRoundsDone(false);
    setImgFailed(false);
    setBonusImgFailed(false);
  }, [labConfig]);

  if (!activeRound) return null;

  const isFoodMode = labConfig.mode === 'food_nutrition_platter';
  const platedItems = activeRound.items.filter((item) => platedIds.includes(item.id));
  const shelfItems = activeRound.items.filter((item) => !platedIds.includes(item.id));

  function evaluateItemSelection(item: VisualPlatterItem) {
    if (roundCleared || platedIds.includes(item.id)) return;
    const isCorrect = item.categoryKey === activeRound.targetCategoryKey;

    if (isCorrect) {
      const nextPlated = [...platedIds, item.id];
      setPlatedIds(nextPlated);
      setRejectedId(null);
      onOutcome(true, 30);

      const remaining = activeRound.targetCount - nextPlated.length;
      if (remaining <= 0) {
        setRoundCleared(true);
        setFeedback({
          ok: true,
          title: `Platter Complete · ${activeRound.conceptTitle}`,
          detail: `${item.correctFeedback} All ${activeRound.targetCount} target items locked in!`,
        });
      } else {
        setFeedback({
          ok: true,
          title: `Added ${item.label} (+30 XP)`,
          detail: `${item.correctFeedback} Find ${remaining} more matching item${remaining === 1 ? '' : 's'}.`,
        });
      }
    } else {
      setRejectedId(item.id);
      onOutcome(false, 0);
      setFeedback({
        ok: false,
        title: `Not for the ${activeRound.platterLabel}`,
        detail: item.wrongFeedback,
      });
    }
  }

  function handleDropOnPlatter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;
    const item = activeRound.items.find((x) => x.id === draggedId);
    if (item) {
      evaluateItemSelection(item);
    }
  }

  function handleNextRound() {
    if (roundIdx + 1 < labConfig.rounds.length) {
      setRoundIdx((i) => i + 1);
      setPlatedIds([]);
      setRejectedId(null);
      setFeedback(null);
      setRoundCleared(false);
      setImgFailed(false);
    } else {
      setAllRoundsDone(true);
    }
  }

  function handleResetRound() {
    setPlatedIds([]);
    setRejectedId(null);
    setFeedback(null);
    setRoundCleared(false);
  }

  return (
    <div
      data-testid="visual-concept-platter-stage"
      className="rounded-2xl border border-[#D9C9B6] bg-white p-5 shadow-xs space-y-5"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#6E987A] inline-flex items-center gap-1.5">
            {isFoodMode ? <Utensils className="h-3.5 w-3.5" /> : <Puzzle className="h-3.5 w-3.5" />}
            Stage 1 of 4 · Visual Drag-and-Drop Concept Lab · Round {roundIdx + 1} of{' '}
            {labConfig.rounds.length}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-[#142B46]">
            {labConfig.headline}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">{labConfig.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onSwitchToClassicMatch && (
            <button
              type="button"
              onClick={onSwitchToClassicMatch}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              Switch to Term Match
            </button>
          )}
          <button
            type="button"
            onClick={handleResetRound}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear Plate
          </button>
        </div>
      </div>

      {/* Round Progress Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {labConfig.rounds.map((r, idx) => {
          const done = idx < roundIdx || (idx === roundIdx && (roundCleared || allRoundsDone));
          const active = idx === roundIdx && !allRoundsDone;
          return (
            <div
              key={r.id}
              className={`rounded-xl border px-3 py-2 text-xs transition-colors ${
                active
                  ? 'border-[#142B46] bg-[#142B46] text-white'
                  : done
                    ? 'border-[#6E987A]/40 bg-[#F0F6F2] text-[#142B46]'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between gap-1 font-bold">
                <span className="truncate">
                  {idx + 1}. {r.conceptTitle.split('·')[0].trim()}
                </span>
                {done && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#6E987A]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split: Concept Reference Picture + Interactive Platter Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Visual Concept Picture & Lab Explanation */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-2xl border border-[#E5D7C3] bg-[#FAF4EC] overflow-hidden">
            {activeRound.imageUrl && !imgFailed ? (
              <div className="relative aspect-16/10 w-full bg-[#142B46]/5 overflow-hidden">
                <img
                  src={activeRound.imageUrl}
                  alt={activeRound.imageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-16/10 w-full bg-linear-to-br from-[#142B46] to-[#23476F] p-5 flex flex-col justify-between text-[#FAF4EC]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D6B66D]">
                  Visual Concept Study Card
                </span>
                <div>
                  <p className="font-display text-lg font-bold text-white">
                    {activeRound.conceptTitle}
                  </p>
                  <p className="text-xs text-[#A9C5D8] mt-1">{chapterTitle}</p>
                </div>
              </div>
            )}
            <div className="p-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#7B5D1C]">
                {activeRound.imageCaption}
              </p>
              <p className="text-xs text-[#142B46] leading-relaxed">{activeRound.conceptFact}</p>
              {activeRound.labTestClue && (
                <div className="rounded-lg border border-[#D6B66D]/50 bg-white px-3 py-2 text-xs text-[#142B46] flex items-start gap-2">
                  <FlaskConical className="h-4 w-4 shrink-0 text-[#7B5D1C] mt-0.5" />
                  <span>{activeRound.labTestClue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bonus Lab Test Illustration for Food Science */}
          {labConfig.bonusLabImageUrl && !bonusImgFailed && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 flex items-center gap-3">
              <img
                src={labConfig.bonusLabImageUrl}
                alt={labConfig.bonusLabTitle || 'Science laboratory food test'}
                referrerPolicy="no-referrer"
                onError={() => setBonusImgFailed(true)}
                className="h-16 w-20 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 text-xs">
                <p className="font-bold text-[#142B46]">{labConfig.bonusLabTitle}</p>
                <p className="text-slate-600 mt-0.5 leading-snug">{labConfig.bonusLabCaption}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Question Prompt + Drop Platter + Draggable Food/Concept Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-[#142B46]/15 bg-[#142B46] px-4 py-3.5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#D6B66D]">
                Mission · {activeRound.conceptTitle}
              </p>
              <span className="font-mono text-xs font-bold text-white tabular-nums">
                Plated: {platedIds.length} / {activeRound.targetCount}
              </span>
            </div>
            <p className="mt-1 text-sm font-bold text-white leading-snug">
              {activeRound.promptQuestion}
            </p>
          </div>

          {/* Interactive Drag-and-Drop Student Platter */}
          <div
            data-testid="student-concept-platter-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              if (!isDragOver) setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDropOnPlatter}
            className={`rounded-2xl border-2 border-dashed p-4 transition-all min-h-[154px] flex flex-col justify-between ${
              isDragOver
                ? 'border-[#D6B66D] bg-[#FAF4EC] scale-[1.01]'
                : roundCleared
                  ? 'border-[#6E987A] bg-[#F0F6F2]'
                  : 'border-[#A9C5D8] bg-[#F8FAFC]'
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
              <span className="text-xs font-bold text-[#142B46] inline-flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 text-[#7B5D1C]" />
                {activeRound.platterLabel}
              </span>
              <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                <Hand className="h-3 w-3" />
                Drag items here or tap any card below
              </span>
            </div>

            {platedItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Drop matching {isFoodMode ? 'foods' : 'concepts'} onto this platter to verify your
                understanding.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
                {platedItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#6E987A] bg-white p-2.5 flex items-center gap-2.5 shadow-xs"
                  >
                    <PlatterItemIllustration kind={item.iconKind} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#142B46] truncate">{item.label}</p>
                      <p className="text-[11px] text-[#3D6349] font-medium truncate">
                        Verified ✓
                      </p>
                    </div>
                    {!roundCleared && (
                      <button
                        type="button"
                        aria-label={`Remove ${item.label} from platter`}
                        onClick={() =>
                          setPlatedIds((prev) => prev.filter((id) => id !== item.id))
                        }
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instant Coaching Feedback */}
          {feedback && (
            <div
              data-testid="platter-feedback-banner"
              className={`rounded-xl border px-4 py-3 text-xs space-y-0.5 ${
                feedback.ok
                  ? 'border-[#6E987A]/45 bg-[#F0F6F2] text-[#142B46]'
                  : 'border-amber-300 bg-amber-50 text-amber-950'
              }`}
            >
              <p className="font-bold flex items-center gap-1.5">
                {feedback.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-[#3D6349] shrink-0" />
                ) : (
                  <Lightbulb className="h-4 w-4 text-amber-700 shrink-0" />
                )}
                {feedback.title}
              </p>
              <p className="leading-relaxed">{feedback.detail}</p>
            </div>
          )}

          {/* Draggable / Tappable Food Pantry / Concept Shelf */}
          {!roundCleared && !allRoundsDone && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {isFoodMode
                  ? 'Food Pantry Shelf — Drag or Click to Add to Your Platter'
                  : 'Concept Card Shelf — Drag or Click to Add to Tray'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {shelfItems.map((item) => {
                  const wasWrong = rejectedId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      draggable
                      data-testid={`platter-card-${item.id}`}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', item.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => evaluateItemSelection(item)}
                      className={`group rounded-xl border p-3 text-left flex items-center gap-3 transition-all cursor-grab active:cursor-grabbing ${
                        wasWrong
                          ? 'border-amber-400 bg-amber-50/70'
                          : 'border-slate-200 bg-white hover:border-[#142B46] hover:bg-[#FAF4EC]/50'
                      }`}
                    >
                      <PlatterItemIllustration kind={item.iconKind} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#142B46] truncate">{item.label}</p>
                        <p className="text-[11px] text-slate-500 truncate">{item.subLabel}</p>
                      </div>
                      <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-[#142B46] shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Round Complete / Stage Complete Action Strip */}
          {(roundCleared || allRoundsDone) && (
            <div className="rounded-xl border border-[#6E987A]/45 bg-[#FAF4EC] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#142B46]">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#7B5D1C]" />
                  {allRoundsDone || roundIdx + 1 >= labConfig.rounds.length
                    ? `Visual Concept Lab Mastered! All ${labConfig.rounds.length} rounds cleared.`
                    : `Round ${roundIdx + 1} Cleared! Ready for the next nutrient platter?`}
                </p>
              </div>
              {allRoundsDone || roundIdx + 1 >= labConfig.rounds.length ? (
                <button
                  type="button"
                  data-testid="platter-continue-stage2-btn"
                  onClick={onCompleteStage}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B46] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e3d63] whitespace-nowrap shrink-0"
                >
                  Continue to Stage 2: Sequence Builder
                  <ArrowRight className="h-3.5 w-3.5 text-[#D6B66D]" />
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="platter-next-round-btn"
                  onClick={handleNextRound}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B46] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e3d63] whitespace-nowrap shrink-0"
                >
                  Next Concept Round ({roundIdx + 2}/{labConfig.rounds.length})
                  <ArrowRight className="h-3.5 w-3.5 text-[#D6B66D]" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
