import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import type {
  BinsGameDef,
  LabelGameDef,
  OddGameDef,
  PairsGameDef,
  PlatterGameDef,
  PlatterItem,
  QuickGameFaceItem,
  QuickRevisionGame,
  SequenceGameDef,
} from '../../data/quickRevisionGamesCatalog';
import {
  launchQuickReviseConfetti,
  playQuickReviseSfx,
  shuffleArray,
} from '../../utils/quickReviseAudio';

export interface EngineConceptModal {
  icon: string;
  title: string;
  text?: string;
  emojis?: string;
  fixes?: Array<{ label: string; kind: 'ok' | 'bad' | 'missed' }>;
  fnList?: Array<{ icon: string; title: string; detail?: string }>;
  btnLabel: string;
  onNext: () => void;
}

export interface EngineCallbacks {
  accentColor: string;
  muted: boolean;
  onHit: (quiet?: boolean) => void;
  onMiss: (weight?: number, quiet?: boolean) => void;
  onProgress: (current: number, total: number) => void;
  onToast: (message: string, kind?: 'neutral' | 'ok' | 'bad') => void;
  onShowConcept: (modal: EngineConceptModal) => void;
  onComplete: () => void;
}

const shortItemLabel = (it: QuickGameFaceItem) =>
  `${it.e ? `${it.e} ` : ''}${it.n || it.t || ''}`.trim();

const QuickFace: React.FC<{
  item: QuickGameFaceItem;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ item, showName = true, size = 'md' }) => {
  const emojiClass =
    size === 'lg' ? 'text-5xl leading-none' : size === 'sm' ? 'text-2xl leading-none' : 'text-3xl leading-none';
  const textClass =
    size === 'lg'
      ? 'font-display text-2xl font-extrabold leading-tight text-[#142B46]'
      : size === 'sm'
        ? 'font-display text-sm font-bold leading-tight text-[#142B46]'
        : 'font-display text-lg font-bold leading-tight text-[#142B46]';
  const nameClass =
    size === 'lg'
      ? 'mt-2 text-sm font-bold text-[#142B46] max-w-[220px]'
      : 'mt-1 text-[11px] font-bold leading-tight text-[#142B46]';

  return (
    <span className="flex flex-col items-center justify-center text-center select-none pointer-events-none">
      {item.img ? (
        <img
          src={item.img}
          alt={item.n || ''}
          referrerPolicy="no-referrer"
          draggable={false}
          className="h-12 w-12 rounded-lg object-cover"
        />
      ) : item.svgHtml ? (
        <span
          className={size === 'lg' ? 'block h-24 w-24' : 'block h-14 w-14'}
          dangerouslySetInnerHTML={{ __html: item.svgHtml }}
        />
      ) : item.t ? (
        <span className={textClass}>{item.t}</span>
      ) : (
        <span className={emojiClass}>{item.e || ''}</span>
      )}
      {showName && item.n && item.n !== item.t && <span className={nameClass}>{item.n}</span>}
    </span>
  );
};

/* =====================================================================
   1. PLATTER ENGINE — Drag or tap items onto the circular ceramic plate
   ===================================================================== */
const PlatterEngine: React.FC<{ game: PlatterGameDef; cb: EngineCallbacks }> = ({ game, cb }) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [roundItems, setRoundItems] = useState<Array<{ key: string; item: PlatterItem }>>([]);
  const [onPlateKeys, setOnPlateKeys] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [plateHover, setPlateHover] = useState(false);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);

  const round = game.rounds[roundIdx];

  useEffect(() => {
    if (!round) return;
    cb.onProgress(roundIdx, game.rounds.length);
    const hasTag = (it: PlatterItem, tag: string) => it.tags.includes(tag);
    const pos = shuffleArray(game.items.filter((i) => hasTag(i, round.tag))).slice(
      0,
      game.perRoundRight || 5,
    );
    const neg = shuffleArray(
      game.items.filter((i) => !hasTag(i, round.tag) && !(i.also || []).includes(round.tag)),
    ).slice(0, (game.perRound || 12) - pos.length);

    const combined = shuffleArray([...pos, ...neg]).map((item, idx) => ({
      key: `${roundIdx}-${idx}-${item.n || item.t || item.e}`,
      item,
    }));
    setRoundItems(combined);
    setOnPlateKeys([]);
    setChecked(false);
  }, [game, roundIdx]);

  if (!round) return null;

  const toggleItem = (key: string, forceToPlate?: boolean) => {
    if (checked) return;
    playQuickReviseSfx('pop', cb.muted);
    setOnPlateKeys((prev) => {
      const exists = prev.includes(key);
      if (forceToPlate === true) return exists ? prev : [...prev, key];
      if (forceToPlate === false) return prev.filter((k) => k !== key);
      return exists ? prev.filter((k) => k !== key) : [...prev, key];
    });
  };

  const handleServe = () => {
    if (checked || onPlateKeys.length === 0) return;
    setChecked(true);
    const fixes: Array<{ label: string; kind: 'ok' | 'bad' | 'missed' }> = [];

    roundItems.forEach(({ key, item }) => {
      const isGood = item.tags.includes(round.tag);
      const isOnPlate = onPlateKeys.includes(key);
      if (isOnPlate && isGood) {
        cb.onHit(true);
      } else if (isOnPlate && !isGood) {
        cb.onMiss(1, true);
        const rightTags = item.tags.map((t) => game.tagNames[t] || t).join(' + ');
        fixes.push({ label: `${shortItemLabel(item)} → ${rightTags}`, kind: 'bad' });
      } else if (!isOnPlate && isGood) {
        cb.onMiss(1, true);
        fixes.push({
          label: `${shortItemLabel(item)} was ${game.tagNames[round.tag] || round.tag} too`,
          kind: 'missed',
        });
      }
    });

    if (fixes.length === 0) {
      playQuickReviseSfx('win', cb.muted);
      launchQuickReviseConfetti(42);
      fixes.push({ label: 'Perfect plate! Every item matched.', kind: 'ok' });
    } else {
      playQuickReviseSfx('bad', cb.muted);
    }

    const matchingEmojis = game.items
      .filter((i) => i.tags.includes(round.tag))
      .map((i) => i.e || '')
      .join(' ');

    window.setTimeout(() => {
      cb.onShowConcept({
        icon: round.icon,
        title: round.label,
        text: round.idea,
        emojis: matchingEmojis,
        fixes,
        btnLabel: roundIdx < game.rounds.length - 1 ? 'Next Plate ▶' : 'Finish Game 🏁',
        onNext: () => {
          if (roundIdx + 1 < game.rounds.length) {
            setRoundIdx((r) => r + 1);
          } else {
            cb.onComplete();
          }
        },
      });
    }, 950);
  };

  const onPlateItems = roundItems.filter((x) => onPlateKeys.includes(x.key));
  const trayItems = roundItems.filter((x) => !onPlateKeys.includes(x.key));

  const statusRing = (key: string, item: PlatterItem) => {
    if (!checked) return '';
    const isGood = item.tags.includes(round.tag);
    const isOnPlate = onPlateKeys.includes(key);
    if (isOnPlate && isGood) return 'bg-emerald-100 ring-2 ring-emerald-600';
    if (isOnPlate && !isGood) return 'bg-red-100 ring-2 ring-red-600';
    if (!isOnPlate && isGood) return 'bg-amber-100 ring-2 ring-dashed ring-amber-500';
    return 'opacity-50';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5D7C3] bg-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{round.icon}</span>
          <div>
            <h3 className="font-display text-lg font-bold text-[#142B46]">{round.label}</h3>
            <p className="text-xs text-slate-600">{round.hint}</p>
          </div>
        </div>
        <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
          Plate {roundIdx + 1} / {game.rounds.length}
        </span>
      </div>

      {/* Circular Ceramic Plate Drop-Zone */}
      <div className="flex justify-center py-1">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setPlateHover(true);
          }}
          onDragLeave={() => setPlateHover(false)}
          onDrop={(e) => {
            e.preventDefault();
            setPlateHover(false);
            const k = e.dataTransfer.getData('text/plain') || draggedKey;
            if (k) toggleItem(k, true);
            setDraggedKey(null);
          }}
          className={`relative flex h-64 w-64 sm:h-72 sm:w-72 items-center justify-center rounded-full border-4 transition-all ${
            plateHover ? 'scale-[1.03] border-dashed' : 'border-slate-200'
          }`}
          style={{
            borderColor: plateHover ? cb.accentColor : undefined,
            background:
              'radial-gradient(circle, #ffffff 58%, #f8fafc 59%, #ffffff 66%, #e2e8f0 67%, #ffffff 71%)',
            boxShadow: '0 8px 0 #E2E8F0, 0 18px 34px -14px rgba(20,43,70,0.32)',
          }}
        >
          {onPlateItems.length === 0 && (
            <span className="pointer-events-none px-8 text-center text-xs font-semibold text-slate-400">
              Drag or tap foods onto the plate
            </span>
          )}
          <div className="flex h-[74%] w-[74%] flex-wrap content-center justify-center gap-1.5">
            {onPlateItems.map(({ key, item }) => (
              <button
                key={key}
                type="button"
                draggable={!checked}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', key);
                  setDraggedKey(key);
                }}
                onClick={() => toggleItem(key, false)}
                className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl p-1 transition-transform hover:scale-105 active:scale-95 ${statusRing(
                  key,
                  item,
                )}`}
                title="Click to remove from plate"
              >
                <QuickFace item={item} size="sm" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pantry Tray */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const k = e.dataTransfer.getData('text/plain') || draggedKey;
          if (k) toggleItem(k, false);
          setDraggedKey(null);
        }}
        className="flex min-h-[104px] flex-wrap items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-[#E5D7C3] bg-white/70 p-3.5"
      >
        {trayItems.map(({ key, item }) => (
          <button
            key={key}
            type="button"
            draggable={!checked}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', key);
              setDraggedKey(key);
            }}
            onClick={() => toggleItem(key, true)}
            className={`flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-[#E6D8C6] bg-white p-1.5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-grab ${statusRing(
              key,
              item,
            )}`}
          >
            <QuickFace item={item} size="sm" />
          </button>
        ))}
      </div>

      {/* Serve Action */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          disabled={checked || onPlateKeys.length === 0}
          onClick={handleServe}
          className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-2xl px-7 py-3.5 font-display text-base font-bold text-white shadow-md transition-transform active:translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300"
          style={{
            backgroundColor: checked || onPlateKeys.length === 0 ? undefined : cb.accentColor,
          }}
        >
          Serve {round.icon} ({onPlateKeys.length} on plate)
        </button>
      </div>
    </div>
  );
};

/* =====================================================================
   2. BINS ENGINE — One card at a time; drag to a bin or tap a bin
   ===================================================================== */
const BinsEngine: React.FC<{ game: BinsGameDef; cb: EngineCallbacks }> = ({ game, cb }) => {
  const deck = useMemo(
    () => shuffleArray(game.items).slice(0, game.count || game.items.length),
    [game],
  );
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<Record<string, 'ok' | 'bad'>>({});
  const [piles, setPiles] = useState<Record<string, Array<{ item: BinsGameDef['items'][number]; ok: boolean }>>>({});
  const [hoverBinId, setHoverBinId] = useState<string | null>(null);

  useEffect(() => {
    setIndex(0);
    setBusy(false);
    setFlash({});
    setPiles({});
    cb.onProgress(0, deck.length);
    cb.onToast('Drag the card into a bin — or tap any bin', 'neutral');
  }, [deck]);

  const currentItem = deck[index];

  const placeInBin = (binId: string) => {
    if (busy || !currentItem) return;
    setBusy(true);
    const isOk = currentItem.bin === binId;
    const targetBin = game.bins.find((b) => b.id === currentItem.bin);
    const label = shortItemLabel(currentItem);

    if (isOk) {
      cb.onHit();
      setFlash({ [binId]: 'ok' });
      if (currentItem.tip) {
        cb.onToast(`✓ ${label} · ${currentItem.tip}`, 'ok');
      }
    } else {
      cb.onMiss();
      setFlash({ [binId]: 'bad', [currentItem.bin]: 'ok' });
      cb.onToast(
        `${label} → ${targetBin?.label || currentItem.bin}${currentItem.tip ? ` · ${currentItem.tip}` : ''}`,
        'bad',
      );
    }

    setPiles((prev) => ({
      ...prev,
      [currentItem.bin]: [...(prev[currentItem.bin] || []), { item: currentItem, ok: isOk }],
    }));

    const delayMs = isOk ? (currentItem.tip ? 950 : 480) : 1550;
    window.setTimeout(() => {
      setFlash({});
      const nextIdx = index + 1;
      cb.onProgress(nextIdx, deck.length);
      if (nextIdx >= deck.length) {
        cb.onComplete();
      } else {
        setIndex(nextIdx);
        setBusy(false);
      }
    }, delayMs);
  };

  return (
    <div className="space-y-5">
      {/* Active Card Deck */}
      <div className="flex flex-col items-center gap-2 py-2">
        {currentItem ? (
          <div
            draggable={!busy}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', 'active-card');
            }}
            className={`flex min-h-[156px] min-w-[176px] max-w-[92%] cursor-grab flex-col items-center justify-center rounded-3xl border border-[#E6D8C6] bg-white px-6 py-4 shadow-md transition-all ${
              busy ? 'scale-75 opacity-0' : 'scale-100 opacity-100 hover:-translate-y-0.5'
            }`}
          >
            <QuickFace item={currentItem} showName={game.showNames !== false} size="lg" />
          </div>
        ) : (
          <div className="h-[156px]" />
        )}
        <p className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
          {Math.max(0, deck.length - index)} cards left · Drag card or tap a bin below
        </p>
      </div>

      {/* Target Bins */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(game.bins.length, 5)}, minmax(0, 1fr))`,
        }}
      >
        {game.bins.map((bin) => {
          const state = flash[bin.id];
          const isHover = hoverBinId === bin.id;
          const collected = piles[bin.id] || [];
          return (
            <button
              key={bin.id}
              type="button"
              onClick={() => placeInBin(bin.id)}
              onDragOver={(e) => {
                e.preventDefault();
                setHoverBinId(bin.id);
              }}
              onDragLeave={() => setHoverBinId(null)}
              onDrop={(e) => {
                e.preventDefault();
                setHoverBinId(null);
                placeInBin(bin.id);
              }}
              className={`flex min-h-[144px] flex-col items-center rounded-2xl border-2 p-3 text-center transition-all active:scale-[0.98] ${
                state === 'ok'
                  ? 'border-emerald-600 bg-emerald-50'
                  : state === 'bad'
                    ? 'border-red-600 bg-red-50'
                    : isHover
                      ? 'border-dashed bg-[#FAF4EC]'
                      : 'border-[#E6D8C6] bg-white hover:border-[#142B46]/35'
              }`}
              style={{
                borderColor: isHover && !state ? cb.accentColor : undefined,
              }}
            >
              <div className="mb-1.5 flex h-9 items-center justify-center">
                {bin.iconSvgHtml ? (
                  <span
                    className="block h-9 w-9"
                    dangerouslySetInnerHTML={{ __html: bin.iconSvgHtml }}
                  />
                ) : (
                  <span className="text-3xl leading-none">{bin.icon}</span>
                )}
              </div>
              <span className="font-display text-sm sm:text-base font-bold leading-tight text-[#142B46]">
                {bin.label}
              </span>
              {bin.sub && (
                <span className="mt-0.5 text-[11px] leading-snug text-slate-500">{bin.sub}</span>
              )}
              <div className="mt-auto flex flex-wrap justify-center gap-1 pt-2.5">
                {collected.map((entry, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center rounded-md text-xs ${
                      entry.ok ? 'opacity-100' : 'opacity-60'
                    }`}
                  >
                    {entry.item.svgHtml ? (
                      <span
                        className="block h-5 w-5"
                        dangerouslySetInnerHTML={{ __html: entry.item.svgHtml }}
                      />
                    ) : entry.item.e ? (
                      <span>{entry.item.e}</span>
                    ) : (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-[#142B46]">
                        {entry.item.t}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* =====================================================================
   3. SEQUENCE ENGINE — Order steps 1 → N by drag or tap
   ===================================================================== */
const SequenceEngine: React.FC<{ game: SequenceGameDef; cb: EngineCallbacks }> = ({ game, cb }) => {
  const n = game.items.length;
  const initialPool = useMemo(() => {
    const indexed = game.items.map((item, correctIdx) => ({ item, correctIdx }));
    let shuffled = shuffleArray(indexed);
    if (n > 1 && shuffled.every((x, i) => x.correctIdx === i)) {
      shuffled = [...shuffled.slice(1), shuffled[0]];
    }
    return shuffled;
  }, [game, n]);

  const [slots, setSlots] = useState<Array<number | null>>(() => Array(n).fill(null));
  const [lockedSlots, setLockedSlots] = useState<boolean[]>(() => Array(n).fill(false));
  const [badSlots, setBadSlots] = useState<boolean[]>(() => Array(n).fill(false));
  const [tries, setTries] = useState(0);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    setSlots(Array(n).fill(null));
    setLockedSlots(Array(n).fill(false));
    setBadSlots(Array(n).fill(false));
    setTries(0);
    cb.onProgress(0, n);
  }, [game, n]);

  const placedSet = new Set(slots.filter((x): x is number => x !== null));
  const poolItems = initialPool.filter((x) => !placedSet.has(x.correctIdx));

  const assignToSlot = (correctIdx: number, targetSlot: number) => {
    if (lockedSlots[targetSlot]) return;
    playQuickReviseSfx('pop', cb.muted);
    setSlots((prev) => {
      const next = prev.slice();
      const fromSlot = next.indexOf(correctIdx);
      const displaced = next[targetSlot];
      next[targetSlot] = correctIdx;
      if (fromSlot !== -1 && fromSlot !== targetSlot) {
        next[fromSlot] = displaced;
      }
      return next;
    });
  };

  const tapPoolItem = (correctIdx: number) => {
    const firstEmpty = slots.findIndex((v) => v === null);
    if (firstEmpty === -1) return;
    assignToSlot(correctIdx, firstEmpty);
  };

  const removeFromSlot = (slotIdx: number) => {
    if (lockedSlots[slotIdx] || slots[slotIdx] === null) return;
    playQuickReviseSfx('pop', cb.muted);
    setSlots((prev) => {
      const next = prev.slice();
      next[slotIdx] = null;
      return next;
    });
  };

  const handleCheck = () => {
    if (slots.some((s) => s === null)) return;
    const nextTries = tries + 1;
    setTries(nextTries);
    const nextLocked = lockedSlots.slice();
    const nextBad = Array(n).fill(false);
    let wrongCount = 0;

    slots.forEach((placedCorrectIdx, slotIdx) => {
      if (nextLocked[slotIdx]) return;
      if (placedCorrectIdx === slotIdx) {
        nextLocked[slotIdx] = true;
        cb.onHit(true);
      } else {
        nextBad[slotIdx] = true;
        cb.onMiss(1, true);
        wrongCount++;
      }
    });

    setLockedSlots(nextLocked);
    setBadSlots(nextBad);
    cb.onProgress(nextLocked.filter(Boolean).length, n);

    if (wrongCount === 0) {
      playQuickReviseSfx('win', cb.muted);
      launchQuickReviseConfetti(50);
      window.setTimeout(() => {
        cb.onShowConcept({
          icon: game.reveal?.icon || '🔗',
          title: game.reveal?.title || 'Chain Complete!',
          text: game.reveal?.text,
          fnList: game.items.map((it) => ({
            icon: it.e || '•',
            title: it.n || it.t || '',
            detail: it.sub,
          })),
          btnLabel: 'Finish Game 🏁',
          onNext: cb.onComplete,
        });
      }, 750);
    } else {
      playQuickReviseSfx('bad', cb.muted);
      const firstBad = nextBad.findIndex(Boolean);
      if (nextTries >= 2 && firstBad !== -1) {
        const expected = game.items[firstBad];
        cb.onToast(
          `💡 Step ${firstBad + 1}: ${expected.e ? `${expected.e} ` : ''}${expected.n || expected.t}`,
          'neutral',
        );
      } else {
        cb.onToast(`${n - wrongCount}/${n} right · fix the red slots`, 'bad');
      }
      window.setTimeout(() => {
        setSlots((prev) => prev.map((val, i) => (nextBad[i] ? null : val)));
        setBadSlots(Array(n).fill(false));
      }, 880);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-[#E5D7C3] bg-white px-4 py-3 shadow-xs">
        <span className="text-3xl leading-none">{game.headIcon || '🔗'}</span>
        <div>
          <h3 className="font-display text-lg font-bold text-[#142B46]">{game.prompt}</h3>
          <p className="text-xs text-slate-600">
            {game.hint || 'Tap or drag items into slots 1 → ' + n}
          </p>
        </div>
      </div>

      {/* Ordered Chain Slots */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {slots.map((placedIdx, k) => {
          const item = placedIdx !== null ? game.items[placedIdx] : null;
          const isOk = lockedSlots[k];
          const isBad = badSlots[k];
          return (
            <React.Fragment key={k}>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const raw = e.dataTransfer.getData('text/plain');
                  const parsed = raw ? Number(raw) : draggedIdx;
                  if (parsed !== null && !Number.isNaN(parsed)) {
                    assignToSlot(parsed, k);
                  }
                  setDraggedIdx(null);
                }}
                onClick={() => removeFromSlot(k)}
                className={`relative flex min-h-[96px] min-w-[136px] flex-1 max-w-[200px] flex-col items-center justify-center rounded-2xl border-2 p-2.5 text-center transition-all ${
                  isOk
                    ? 'border-emerald-600 bg-emerald-50'
                    : isBad
                      ? 'border-red-600 bg-red-50'
                      : item
                        ? 'cursor-pointer border-[#142B46]/30 bg-white hover:border-[#142B46]'
                        : 'border-dashed border-[#D9C9B6] bg-white/60'
                }`}
              >
                <span
                  className="mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: isOk ? '#16A34A' : cb.accentColor }}
                >
                  {k + 1}
                </span>
                {item ? (
                  <div className="flex flex-col items-center">
                    <QuickFace item={item} size="sm" />
                    {isOk && item.sub && (
                      <span className="mt-1 text-[10px] font-semibold text-emerald-700">
                        {item.sub}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400">Step {k + 1}</span>
                )}
              </div>
              {k < n - 1 && <span className="text-base font-bold text-slate-300">➜</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Shuffled Pool */}
      <div className="flex min-h-[82px] flex-wrap items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-[#E5D7C3] bg-white/70 p-3.5">
        {poolItems.length === 0 ? (
          <span className="text-xs font-semibold text-slate-500">
            All steps placed! Click Check below or tap any slot to adjust.
          </span>
        ) : (
          poolItems.map(({ item, correctIdx }) => (
            <button
              key={correctIdx}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', String(correctIdx));
                setDraggedIdx(correctIdx);
              }}
              onClick={() => tapPoolItem(correctIdx)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E6D8C6] bg-white px-3.5 py-2 shadow-xs transition-transform hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-grab"
            >
              {item.e && <span className="text-xl leading-none">{item.e}</span>}
              <span className="font-display text-sm font-bold text-[#142B46]">
                {item.n || item.t}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="flex justify-center pt-1">
        <button
          type="button"
          disabled={slots.some((s) => s === null) || lockedSlots.every(Boolean)}
          onClick={handleCheck}
          className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-2xl px-7 py-3 font-display text-base font-bold text-white shadow-md transition-transform active:translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300"
          style={{
            backgroundColor:
              slots.some((s) => s === null) || lockedSlots.every(Boolean)
                ? undefined
                : cb.accentColor,
          }}
        >
          <Check className="h-5 w-5" />
          Check Order
        </button>
      </div>
    </div>
  );
};

/* =====================================================================
   4. LABEL ENGINE — Pin labels onto an interactive SVG diagram
   ===================================================================== */
const LabelEngine: React.FC<{ game: LabelGameDef; cb: EngineCallbacks }> = ({ game, cb }) => {
  const W = game.w || 400;
  const H = game.h || 300;
  const n = game.spots.length;

  const shuffledLabels = useMemo(
    () => shuffleArray(game.spots.map((s, k) => ({ ...s, k }))),
    [game],
  );

  const [pinAssignments, setPinAssignments] = useState<Array<number | null>>(() =>
    Array(n).fill(null),
  );
  const [lockedPins, setLockedPins] = useState<boolean[]>(() => Array(n).fill(false));
  const [badPins, setBadPins] = useState<boolean[]>(() => Array(n).fill(false));
  const [selectedLabelK, setSelectedLabelK] = useState<number | null>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    setPinAssignments(Array(n).fill(null));
    setLockedPins(Array(n).fill(false));
    setBadPins(Array(n).fill(false));
    setSelectedLabelK(null);
    setTries(0);
    cb.onProgress(0, n);
  }, [game, n]);

  const placedSet = new Set(pinAssignments.filter((v): v is number => v !== null));
  const availableLabels = shuffledLabels.filter((l) => !placedSet.has(l.k));

  const assignLabelToPin = (labelK: number, pinIdx: number) => {
    if (lockedPins[pinIdx]) return;
    playQuickReviseSfx('pop', cb.muted);
    setPinAssignments((prev) => {
      const next = prev.slice();
      const prevPin = next.indexOf(labelK);
      const displaced = next[pinIdx];
      next[pinIdx] = labelK;
      if (prevPin !== -1 && prevPin !== pinIdx) {
        next[prevPin] = displaced;
      }
      return next;
    });
    setSelectedLabelK(null);
  };

  const handlePinClick = (pinIdx: number) => {
    if (lockedPins[pinIdx]) return;
    if (selectedLabelK !== null) {
      assignLabelToPin(selectedLabelK, pinIdx);
      return;
    }
    if (pinAssignments[pinIdx] !== null) {
      playQuickReviseSfx('pop', cb.muted);
      setPinAssignments((prev) => {
        const next = prev.slice();
        next[pinIdx] = null;
        return next;
      });
    }
  };

  const handleCheck = () => {
    if (pinAssignments.some((v) => v === null)) return;
    const nextTries = tries + 1;
    setTries(nextTries);
    const nextLocked = lockedPins.slice();
    const nextBad = Array(n).fill(false);
    let wrongCount = 0;

    pinAssignments.forEach((assignedK, pinIdx) => {
      if (nextLocked[pinIdx]) return;
      if (assignedK === pinIdx) {
        nextLocked[pinIdx] = true;
        cb.onHit(true);
      } else {
        nextBad[pinIdx] = true;
        cb.onMiss(1, true);
        wrongCount++;
      }
    });

    setLockedPins(nextLocked);
    setBadPins(nextBad);
    cb.onProgress(nextLocked.filter(Boolean).length, n);

    if (wrongCount === 0) {
      playQuickReviseSfx('win', cb.muted);
      launchQuickReviseConfetti(55);
      window.setTimeout(() => {
        cb.onShowConcept({
          icon: game.icon,
          title: 'What Each Part Does',
          fnList: game.spots.map((s) => ({
            icon: s.e || '•',
            title: s.n,
            detail: s.fn,
          })),
          btnLabel: 'Finish Game 🏁',
          onNext: cb.onComplete,
        });
      }, 800);
    } else {
      playQuickReviseSfx('bad', cb.muted);
      const firstBad = nextBad.findIndex(Boolean);
      if (nextTries >= 2 && firstBad !== -1) {
        cb.onToast(`💡 Pin ${firstBad + 1} = ${game.spots[firstBad].n}`, 'neutral');
      } else {
        cb.onToast(`${n - wrongCount}/${n} right · fix the red pins`, 'bad');
      }
      window.setTimeout(() => {
        setPinAssignments((prev) => prev.map((v, i) => (nextBad[i] ? null : v)));
        setBadPins(Array(n).fill(false));
      }, 900);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-[#E5D7C3] bg-white px-4 py-3 shadow-xs">
        <span className="text-3xl leading-none">🏷️</span>
        <div>
          <h3 className="font-display text-lg font-bold text-[#142B46]">Label the Diagram</h3>
          <p className="text-xs text-slate-600">
            Drag a label onto a numbered pin, or tap a label then tap a pin (tap a filled pin to undo).
          </p>
        </div>
      </div>

      {/* Interactive SVG Diagram with Hotspots */}
      <div className="mx-auto max-w-[560px] rounded-2xl border border-[#E5D7C3] bg-white p-3 shadow-sm">
        <div className="relative w-full">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block w-full h-auto rounded-xl"
            dangerouslySetInnerHTML={{ __html: game.svg }}
          />
          <div className="absolute inset-0">
            {game.spots.map((spot, idx) => {
              const assignedK = pinAssignments[idx];
              const assignedLabel = assignedK !== null ? game.spots[assignedK].n : null;
              const isOk = lockedPins[idx];
              const isBad = badPins[idx];
              const leftPct = (spot.x / W) * 100;
              const topPct = (spot.y / H) * 100;
              const alignClass =
                spot.x / W < 0.2
                  ? 'left-0'
                  : spot.x / W > 0.8
                    ? 'right-0'
                    : 'left-1/2 -translate-x-1/2';

              return (
                <div
                  key={idx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const raw = e.dataTransfer.getData('text/plain');
                    const parsed = Number(raw);
                    if (!Number.isNaN(parsed)) {
                      assignLabelToPin(parsed, idx);
                    }
                  }}
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  className="absolute -ml-5 -mt-5 flex h-10 w-10 items-center justify-center"
                >
                  <button
                    type="button"
                    onClick={() => handlePinClick(idx)}
                    aria-label={`Diagram pin ${idx + 1}${assignedLabel ? `: ${assignedLabel}` : ''}`}
                    className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-extrabold text-white shadow-md transition-transform ${
                      selectedLabelK !== null && !isOk ? 'scale-115 ring-4 ring-amber-300/70' : 'hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: isOk
                        ? '#16A34A'
                        : isBad
                          ? '#DC2626'
                          : assignedLabel
                            ? cb.accentColor
                            : '#142B46',
                    }}
                  >
                    {idx + 1}
                  </button>
                  {assignedLabel && (
                    <span
                      className={`pointer-events-none absolute top-8 z-20 whitespace-nowrap rounded-lg border px-2 py-0.5 text-[11px] font-bold shadow-xs ${alignClass} ${
                        isOk
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : isBad
                            ? 'border-red-600 bg-red-50 text-red-900'
                            : 'border-[#E5D7C3] bg-white text-[#142B46]'
                      }`}
                    >
                      {assignedLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Label Tray */}
      <div className="flex min-h-[72px] flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E5D7C3] bg-white/70 p-3.5">
        {availableLabels.length === 0 ? (
          <span className="text-xs font-semibold text-slate-500">
            All {n} pins labelled! Click Check Labels below.
          </span>
        ) : (
          availableLabels.map((lbl) => {
            const isSelected = selectedLabelK === lbl.k;
            return (
              <button
                key={lbl.k}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', String(lbl.k));
                  setSelectedLabelK(lbl.k);
                }}
                onClick={() => {
                  playQuickReviseSfx('pop', cb.muted);
                  setSelectedLabelK((cur) => (cur === lbl.k ? null : lbl.k));
                }}
                className={`rounded-xl border-2 px-3.5 py-2 text-xs sm:text-sm font-bold transition-all cursor-grab ${
                  isSelected
                    ? 'scale-105 bg-[#142B46] text-white shadow-md'
                    : 'border-[#E6D8C6] bg-white text-[#142B46] hover:border-[#142B46]/50'
                }`}
                style={{
                  borderColor: isSelected ? cb.accentColor : undefined,
                }}
              >
                {lbl.n}
              </button>
            );
          })
        )}
      </div>

      <div className="flex justify-center pt-1">
        <button
          type="button"
          disabled={pinAssignments.some((v) => v === null) || lockedPins.every(Boolean)}
          onClick={handleCheck}
          className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-2xl px-7 py-3 font-display text-base font-bold text-white shadow-md transition-transform active:translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300"
          style={{
            backgroundColor:
              pinAssignments.some((v) => v === null) || lockedPins.every(Boolean)
                ? undefined
                : cb.accentColor,
          }}
        >
          <Check className="h-5 w-5" />
          Check Labels
        </button>
      </div>
    </div>
  );
};

/* =====================================================================
   5. PAIRS ENGINE — Memory flip match with initial 2.4s peek preview
   ===================================================================== */
const PairsEngine: React.FC<{ game: PairsGameDef; cb: EngineCallbacks }> = ({ game, cb }) => {
  const cards = useMemo(
    () =>
      shuffleArray(
        game.pairs.flatMap((pair, pairIdx) => [
          { ...pair[0], pairIdx, side: 0 as const },
          { ...pair[1], pairIdx, side: 1 as const },
        ]),
      ),
    [game],
  );

  const [peeking, setPeeking] = useState(true);
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [nopeIndices, setNopeIndices] = useState<number[]>([]);
  const busyRef = useRef(false);

  useEffect(() => {
    setPeeking(true);
    setOpenIndices([]);
    setMatchedPairs([]);
    setNopeIndices([]);
    busyRef.current = true;
    cb.onProgress(0, game.pairs.length);
    const t = window.setTimeout(() => {
      setPeeking(false);
      busyRef.current = false;
    }, 2400);
    return () => window.clearTimeout(t);
  }, [game, cards]);

  const handleCardClick = (idx: number) => {
    if (busyRef.current || peeking) return;
    if (openIndices.includes(idx) || matchedPairs.includes(cards[idx].pairIdx)) return;

    playQuickReviseSfx('pop', cb.muted);
    const nextOpen = [...openIndices, idx];
    setOpenIndices(nextOpen);

    if (nextOpen.length < 2) return;
    busyRef.current = true;

    const [firstIdx, secondIdx] = nextOpen;
    const cardA = cards[firstIdx];
    const cardB = cards[secondIdx];

    if (cardA.pairIdx === cardB.pairIdx) {
      window.setTimeout(() => {
        const nextMatched = [...matchedPairs, cardA.pairIdx];
        setMatchedPairs(nextMatched);
        setOpenIndices([]);
        cb.onHit();
        cb.onProgress(nextMatched.length, game.pairs.length);
        const left = cardA.side === 0 ? cardA : cardB;
        const right = cardA.side === 0 ? cardB : cardA;
        cb.onToast(`${shortItemLabel(left)} ↔ ${shortItemLabel(right)}`, 'ok');
        busyRef.current = false;
        if (nextMatched.length === game.pairs.length) {
          window.setTimeout(() => cb.onComplete(), 750);
        }
      }, 320);
    } else {
      window.setTimeout(() => setNopeIndices(nextOpen), 240);
      window.setTimeout(() => {
        cb.onMiss(0.5, true);
        setOpenIndices([]);
        setNopeIndices([]);
        busyRef.current = false;
      }, 950);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5D7C3] bg-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">🧠</span>
          <div>
            <h3 className="font-display text-lg font-bold text-[#142B46]">Match the Pairs</h3>
            <p className="text-xs text-slate-600">
              {peeking
                ? 'Look closely and memorize the cards...'
                : 'Flip two cards to pair every concept with its match.'}
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
          {matchedPairs.length} / {game.pairs.length} pairs
        </span>
      </div>

      <div className="mx-auto grid max-w-[600px] grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map((card, idx) => {
          const isDone = matchedPairs.includes(card.pairIdx);
          const isOpen = peeking || isDone || openIndices.includes(idx);
          const isNope = nopeIndices.includes(idx);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCardClick(idx)}
              className={`flex aspect-square flex-col items-center justify-center rounded-2xl border-2 p-2.5 text-center transition-all duration-200 ${
                isDone
                  ? 'border-emerald-600 bg-emerald-50 shadow-xs'
                  : isNope
                    ? 'border-red-600 bg-red-50'
                    : isOpen
                      ? card.side === 1
                        ? 'border-[#D9C9B6] bg-[#FAF4EC] shadow-sm'
                        : 'border-[#E6D8C6] bg-white shadow-sm'
                      : 'border-transparent text-white shadow-md hover:-translate-y-0.5 active:scale-95'
              }`}
              style={{
                background: !isOpen
                  ? `linear-gradient(135deg, ${cb.accentColor}, #F59E0B)`
                  : undefined,
              }}
            >
              {isOpen ? (
                <QuickFace item={card} size="sm" />
              ) : (
                <span className="font-display text-3xl font-extrabold text-white/95">?</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* =====================================================================
   6. ODD ONE OUT ENGINE — 4 visual tiles; spot the one that doesn't belong
   ===================================================================== */
const OddEngine: React.FC<{ game: OddGameDef; cb: EngineCallbacks }> = ({ game, cb }) => {
  const rounds = useMemo(() => shuffleArray(game.rounds), [game]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);

  const round = rounds[roundIdx];
  const tiles = useMemo(() => {
    if (!round) return [];
    return shuffleArray(
      round.items.map(([e, n], originalIdx) => ({
        e,
        n,
        isOdd: originalIdx === round.odd,
      })),
    );
  }, [round]);

  useEffect(() => {
    setRoundIdx(0);
    setPickedIdx(null);
    cb.onProgress(0, rounds.length);
  }, [rounds]);

  if (!round) return null;

  const handleTilePick = (tileIdx: number) => {
    if (pickedIdx !== null) return;
    setPickedIdx(tileIdx);
    const chosen = tiles[tileIdx];
    if (chosen.isOdd) {
      cb.onHit();
      cb.onToast(round.why, 'ok');
    } else {
      cb.onMiss();
      cb.onToast(round.why, 'bad');
    }

    window.setTimeout(() => {
      const next = roundIdx + 1;
      cb.onProgress(next, rounds.length);
      if (next >= rounds.length) {
        cb.onComplete();
      } else {
        setPickedIdx(null);
        setRoundIdx(next);
      }
    }, chosen.isOdd ? 1500 : 2100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5D7C3] bg-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">🎯</span>
          <div>
            <h3 className="font-display text-lg font-bold text-[#142B46]">Spot the Odd One Out</h3>
            <p className="text-xs text-slate-600">Tap the tile that does not belong with the other three.</p>
          </div>
        </div>
        <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
          Round {roundIdx + 1} / {rounds.length}
        </span>
      </div>

      <div className="mx-auto grid max-w-[460px] grid-cols-2 gap-3.5">
        {tiles.map((tile, idx) => {
          const revealed = pickedIdx !== null;
          const isChosen = pickedIdx === idx;
          const styleClass = !revealed
            ? 'border-[#E6D8C6] bg-white hover:-translate-y-0.5 hover:shadow-md active:scale-95'
            : tile.isOdd
              ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500'
              : isChosen
                ? 'border-red-600 bg-red-50 ring-2 ring-red-500'
                : 'border-[#E6D8C6] bg-white opacity-45';

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleTilePick(idx)}
              className={`flex aspect-square flex-col items-center justify-center rounded-3xl border-2 p-4 shadow-sm transition-all ${styleClass}`}
            >
              <span className="text-6xl leading-none">{tile.e}</span>
              <span className="mt-2.5 font-display text-base font-bold text-[#142B46]">
                {tile.n}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* =====================================================================
   DISPATCHER COMPONENT
   ===================================================================== */
export const QuickReviseGameStage: React.FC<{
  game: QuickRevisionGame;
  callbacks: EngineCallbacks;
}> = ({ game, callbacks }) => {
  switch (game.type) {
    case 'platter':
      return <PlatterEngine key={game.id} game={game} cb={callbacks} />;
    case 'bins':
      return <BinsEngine key={game.id} game={game} cb={callbacks} />;
    case 'sequence':
      return <SequenceEngine key={game.id} game={game} cb={callbacks} />;
    case 'label':
      return <LabelEngine key={game.id} game={game} cb={callbacks} />;
    case 'pairs':
      return <PairsEngine key={game.id} game={game} cb={callbacks} />;
    case 'odd':
      return <OddEngine key={game.id} game={game} cb={callbacks} />;
    default:
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          <RotateCcw className="mx-auto mb-2 h-5 w-5 text-slate-400" />
          Unsupported game type.
        </div>
      );
  }
};
