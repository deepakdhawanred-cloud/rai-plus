import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { playErrorCue, playSuccessChime, playVictoryFanfare } from '../../../utils/soundFx';
import type { PlayableEngineProps } from './gameEngineTypes';

// ---------------------------------------------------------------------------
// 1. SPOT THE DIFFERENCE (Classroom Scene L1-3, Technical Matrix Schematic L4-5)
// ---------------------------------------------------------------------------
interface DiffHotspot {
  id: string;
  cx: number;
  cy: number;
  label: string;
}

const SCENE_DIFFS: DiffHotspot[] = [
  { id: 'sun', cx: 215, cy: 42, label: 'Sun colour' },
  { id: 'flag', cx: 140, cy: 48, label: 'School pennant colour' },
  { id: 'window', cx: 105, cy: 112, label: 'Left classroom window' },
  { id: 'tree', cx: 46, cy: 118, label: 'Tree fruit count' },
  { id: 'bench', cx: 196, cy: 156, label: 'Courtyard bench' },
];

const SCHEMATIC_DIFFS: DiffHotspot[] = [
  { id: 'd1', cx: 46, cy: 38, label: 'Top-left hexagon notch dot' },
  { id: 'd2', cx: 114, cy: 36, label: 'Upper bus arrow direction' },
  { id: 'd3', cx: 178, cy: 38, label: 'Concentric node inner ring' },
  { id: 'd4', cx: 236, cy: 42, label: 'Top-right calibration tick count' },
  { id: 'd5', cx: 48, cy: 104, label: 'Diamond diagonal stroke style' },
  { id: 'd6', cx: 140, cy: 100, label: 'Central core triangle polarity' },
  { id: 'd7', cx: 232, cy: 104, label: 'East junction cross orientation' },
  { id: 'd8', cx: 64, cy: 164, label: 'Bottom-left parity block fill' },
  { id: 'd9', cx: 140, cy: 162, label: 'Lower waveform harmonic crest' },
  { id: 'd10', cx: 224, cy: 162, label: 'Bottom-right terminal pin node' },
];

export const SpotTheDifferenceGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const isSchematic = level >= 4;
  const targetCount = isSchematic ? (level === 4 ? 8 : 10) : level + 2; // L1=3,L2=4,L3=5,L4=8,L5=10
  const activeDiffs = useMemo(
    () => (isSchematic ? SCHEMATIC_DIFFS : SCENE_DIFFS).slice(0, targetCount),
    [isSchematic, targetCount],
  );
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    onHudUpdate({
      progressText: `${foundIds.length}/${targetCount}`,
      score: Math.round((foundIds.length / targetCount) * 100),
      errors: misses,
    });
  }, [foundIds.length, targetCount, misses, onHudUpdate]);

  function handleFound(id: string) {
    if (foundIds.includes(id)) return;
    playSuccessChime();
    const next = [...foundIds, id];
    setFoundIds(next);
    if (next.length >= targetCount) {
      playVictoryFanfare();
      const elapsed = Math.max(2, Math.round((Date.now() - startRef.current) / 1000));
      const totalClicks = next.length + misses;
      const accuracy = Math.round((next.length / Math.max(1, totalClicks)) * 100);
      onFinish({
        accuracyPct: accuracy,
        completionTimeSec: elapsed,
        reactionTimeMs: null,
        errorCount: misses,
        scorePoints: accuracy,
        completed: true,
        summaryDetail: `Found all ${targetCount} differences in ${elapsed}s with ${misses} false clicks.`,
      });
    }
  }

  function handleBackgroundMiss() {
    playErrorCue();
    setMisses((m) => m + 1);
  }

  const has = (id: string) => activeDiffs.some((d) => d.id === id);

  function renderSchematicSvg(isModified: boolean) {
    return (
      <svg
        viewBox="0 0 280 200"
        className={`w-full rounded-lg bg-slate-900 ${isModified ? 'cursor-crosshair' : ''}`}
        onClick={isModified ? handleBackgroundMiss : undefined}
      >
        {/* Subtle technical grid */}
        <g stroke="#1E293B" strokeWidth="1">
          {[40, 80, 120, 160].map((y) => (
            <line key={`hy-${y}`} x1="0" y1={y} x2="280" y2={y} />
          ))}
          {[70, 140, 210].map((x) => (
            <line key={`vx-${x}`} x1={x} y1="0" x2={x} y2="200" />
          ))}
        </g>

        {/* Bus lines */}
        <line x1="68" y1="38" x2="156" y2="38" stroke="#64748B" strokeWidth="2" />
        <line x1="198" y1="38" x2="220" y2="38" stroke="#64748B" strokeWidth="2" />
        <line x1="48" y1="58" x2="48" y2="82" stroke="#64748B" strokeWidth="2" />
        <line x1="140" y1="54" x2="140" y2="74" stroke="#64748B" strokeWidth="2" />
        <line x1="72" y1="104" x2="112" y2="104" stroke="#64748B" strokeWidth="2" />
        <line x1="168" y1="104" x2="208" y2="104" stroke="#64748B" strokeWidth="2" />

        {/* d1: Top-left hexagon + notch dot */}
        <polygon points="46,18 64,28 64,48 46,58 28,48 28,28" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
        <circle cx={isModified && has('d1') ? 54 : 38} cy="38" r="3" fill="#F59E0B" />

        {/* d2: Arrow polarity on upper bus */}
        {isModified && has('d2') ? (
          <polygon points="106,38 118,31 118,45" fill="#38BDF8" />
        ) : (
          <polygon points="120,38 108,31 108,45" fill="#38BDF8" />
        )}

        {/* d3: Concentric node */}
        <circle cx="178" cy="38" r="16" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
        {!(isModified && has('d3')) && (
          <circle cx="178" cy="38" r="9" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
        )}
        <circle cx="178" cy="38" r="3" fill="#E2E8F0" />

        {/* d4: Top-right calibration ticks */}
        <rect x="220" y="24" width="34" height="34" rx="4" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.8" />
        <line x1="227" y1="33" x2="247" y2="33" stroke="#38BDF8" strokeWidth="2" />
        <line x1="227" y1="41" x2="247" y2="41" stroke="#38BDF8" strokeWidth="2" />
        {!(isModified && has('d4')) && (
          <line x1="227" y1="49" x2="247" y2="49" stroke="#38BDF8" strokeWidth="2" />
        )}

        {/* d5: Diamond diagonal stroke */}
        <polygon points="48,80 72,104 48,128 24,104" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2" />
        <line
          x1="34"
          y1="104"
          x2="62"
          y2="104"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeDasharray={isModified && has('d5') ? '4 3' : undefined}
        />

        {/* d6: Central octagon + inverted core triangle */}
        <polygon
          points="126,76 154,76 168,90 168,114 154,128 126,128 112,114 112,90"
          fill="#0F172A"
          stroke="#38BDF8"
          strokeWidth="2"
        />
        {isModified && has('d6') ? (
          <polygon points="140,114 128,92 152,92" fill="#10B981" />
        ) : (
          <polygon points="140,88 128,110 152,110" fill="#10B981" />
        )}

        {/* d7: East junction cross (+ vs x) */}
        <circle cx="232" cy="104" r="20" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
        {isModified && has('d7') ? (
          <g stroke="#F59E0B" strokeWidth="2.2">
            <line x1="222" y1="94" x2="242" y2="114" />
            <line x1="242" y1="94" x2="222" y2="114" />
          </g>
        ) : (
          <g stroke="#F59E0B" strokeWidth="2.2">
            <line x1="232" y1="90" x2="232" y2="118" />
            <line x1="218" y1="104" x2="246" y2="104" />
          </g>
        )}

        {/* d8: Bottom-left parity block */}
        <rect x="44" y="148" width="40" height="32" rx="4" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2" />
        <rect
          x="56"
          y="156"
          width="16"
          height="16"
          fill={isModified && has('d8') ? '#38BDF8' : 'none'}
          stroke="#38BDF8"
          strokeWidth="2"
        />

        {/* d9: Lower harmonic waveform */}
        <rect x="104" y="146" width="72" height="34" rx="4" fill="#0F172A" stroke="#64748B" strokeWidth="1.5" />
        <polyline
          points={
            isModified && has('d9')
              ? '110,164 122,152 134,174 146,154 158,174 170,164'
              : '110,164 122,152 134,174 146,152 158,174 170,164'
          }
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
        />
        {isModified && has('d9') && <circle cx="146" cy="170" r="2.5" fill="#F59E0B" />}

        {/* d10: Terminal pin array */}
        <rect x="196" y="148" width="56" height="30" rx="4" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.8" />
        <circle cx="208" cy="163" r="3" fill="#CBD5E1" />
        <circle cx="224" cy="163" r="3" fill={isModified && has('d10') ? '#0F172A' : '#CBD5E1'} stroke="#CBD5E1" strokeWidth="1.5" />
        <circle cx="240" cy="163" r="3" fill="#CBD5E1" />

        {isModified &&
          activeDiffs.map((diff) => {
            const isFound = foundIds.includes(diff.id);
            return (
              <circle
                key={diff.id}
                cx={diff.cx}
                cy={diff.cy}
                r="20"
                fill={isFound ? 'rgba(16, 185, 129, 0.24)' : 'transparent'}
                stroke={isFound ? '#10B981' : 'transparent'}
                strokeWidth="2.5"
                aria-label={`Difference: ${diff.label}`}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFound(diff.id);
                }}
              />
            );
          })}
      </svg>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-slate-600">
        {lang === 'hi'
          ? `दाईं ओर के चित्र में ${targetCount} सूक्ष्म अंतर खोजकर क्लिक करें।`
          : isSchematic
            ? `Inspect both technical schematics carefully — locate all ${targetCount} subtle geometric/polarity differences on the right blueprint.`
            : `Click all ${targetCount} differences on the right illustration.`}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">
            {lang === 'hi' ? 'मूल चित्र' : isSchematic ? 'Reference Blueprint' : 'Original Scene'}
          </p>
          {isSchematic ? (
            renderSchematicSvg(false)
          ) : (
            <svg viewBox="0 0 260 190" className="w-full rounded-lg bg-sky-50">
              <rect y="140" width="260" height="50" fill="#BBF7D0" />
              <circle cx="215" cy="42" r="18" fill="#FBBF24" />
              <rect x="85" y="75" width="90" height="72" fill="#FFFBEB" stroke="#92400E" strokeWidth="2" />
              <polygon points="78,75 130,38 182,75" fill="#B45309" />
              <line x1="130" y1="38" x2="130" y2="18" stroke="#475569" strokeWidth="2" />
              <polygon points="130,18 154,25 130,32" fill="#1D4ED8" />
              <rect x="96" y="98" width="20" height="24" fill="#BAE6FD" stroke="#475569" />
              <rect x="144" y="98" width="20" height="24" fill="#BAE6FD" stroke="#475569" />
              <rect x="122" y="114" width="16" height="33" fill="#78350F" />
              <rect x="40" y="118" width="10" height="28" fill="#78350F" />
              <circle cx="45" cy="105" r="22" fill="#16A34A" />
              <circle cx="38" cy="102" r="3" fill="#DC2626" />
              <circle cx="52" cy="110" r="3" fill="#DC2626" />
              <rect x="186" y="148" width="38" height="8" rx="2" fill="#92400E" />
              <rect x="190" y="156" width="4" height="10" fill="#78350F" />
              <rect x="216" y="156" width="4" height="10" fill="#78350F" />
            </svg>
          )}
        </div>

        <div className="rounded-xl border border-blue-200 bg-white p-3">
          <p className="text-xs font-semibold text-blue-900 mb-2 tabular-nums">
            {lang === 'hi' ? 'अंतर खोजने के लिए यहाँ क्लिक करें' : 'Click Differences Here'} ({foundIds.length}/{targetCount})
          </p>
          {isSchematic ? (
            renderSchematicSvg(true)
          ) : (
            <svg
              viewBox="0 0 260 190"
              className="w-full rounded-lg bg-sky-50 cursor-crosshair"
              onClick={handleBackgroundMiss}
            >
              <rect y="140" width="260" height="50" fill="#BBF7D0" />
              <circle cx="215" cy="42" r="18" fill={has('sun') ? '#EA580C' : '#FBBF24'} />
              <rect x="85" y="75" width="90" height="72" fill="#FFFBEB" stroke="#92400E" strokeWidth="2" />
              <polygon points="78,75 130,38 182,75" fill="#B45309" />
              <line x1="130" y1="38" x2="130" y2="18" stroke="#475569" strokeWidth="2" />
              <polygon points="130,18 154,25 130,32" fill={has('flag') ? '#059669' : '#1D4ED8'} />
              <rect
                x="96"
                y="98"
                width="20"
                height="24"
                fill={has('window') ? '#FDE68A' : '#BAE6FD'}
                stroke="#475569"
              />
              <rect x="144" y="98" width="20" height="24" fill="#BAE6FD" stroke="#475569" />
              <rect x="122" y="114" width="16" height="33" fill="#78350F" />
              <rect x="40" y="118" width="10" height="28" fill="#78350F" />
              <circle cx="45" cy="105" r="22" fill="#16A34A" />
              <circle cx="38" cy="102" r="3" fill="#DC2626" />
              {!has('tree') && <circle cx="52" cy="110" r="3" fill="#DC2626" />}
              {!has('bench') && (
                <>
                  <rect x="186" y="148" width="38" height="8" rx="2" fill="#92400E" />
                  <rect x="190" y="156" width="4" height="10" fill="#78350F" />
                  <rect x="216" y="156" width="4" height="10" fill="#78350F" />
                </>
              )}
              {activeDiffs.map((diff) => {
                const isFound = foundIds.includes(diff.id);
                return (
                  <circle
                    key={diff.id}
                    cx={diff.cx}
                    cy={diff.cy}
                    r="20"
                    fill={isFound ? 'rgba(16, 185, 129, 0.18)' : 'transparent'}
                    stroke={isFound ? '#059669' : 'transparent'}
                    strokeWidth="2.5"
                    aria-label={`Difference: ${diff.label}`}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFound(diff.id);
                    }}
                  />
                );
              })}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2, 4, 5: TARGET FINDER / SYMBOL HUNTER / FOCUS FILTER (Up to 7x7 Compound Rules)
// ---------------------------------------------------------------------------
const BASIC_SYMBOLS = ['★', '▲', '●', '◆', '■', '✦', '7', 'A', 'M', '3'];
const CONFUSABLE_SYMBOLS = ['△', '▲', '▽', '▼', '◇', '◆', '◁', '▷', 'p', 'q', 'b', 'd'];
const PRIMES_SMALL = new Set([2, 3, 5, 7]);

interface ScanCell {
  id: number;
  sym: string;
  color: string;
  badge: number | null;
  isTarget: boolean;
}

export const VisualScanningGame: React.FC<PlayableEngineProps> = ({
  gameId,
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const isFilter = gameId === 'focus-filter';
  const isHunter = gameId === 'symbol-hunter';
  const gridCols = level <= 2 ? 4 : level === 3 ? 5 : level === 4 ? 6 : 7;
  const gridSize = gridCols * gridCols;
  const activePool = level >= 4 ? CONFUSABLE_SYMBOLS : BASIC_SYMBOLS;
  const targetSymbol = useMemo(
    () => (isFilter ? '▲' : activePool[(level * 2) % activePool.length]),
    [isFilter, activePool, level],
  );

  const [cells, setCells] = useState<ScanCell[]>(() => buildCells());
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [clicks, setClicks] = useState<{ hitTime: number }[]>([]);
  const startRef = useRef(Date.now());
  const lastHitRef = useRef(Date.now());

  function buildCells(): ScanCell[] {
    const colors = ['text-blue-700', 'text-amber-700', 'text-emerald-700', 'text-red-700'];
    const targetCount = level <= 2 ? 5 : level === 3 ? 7 : level === 4 ? 9 : 11;
    const badges = [2, 3, 4, 5, 6, 7, 8, 9];
    const items: ScanCell[] = [];

    for (let i = 0; i < gridSize; i++) {
      const wantTarget = i < targetCount;
      if (isFilter && level === 5) {
        // L5 compound: Emerald (text-emerald-700) AND (▲ or ◆) AND PRIME badge
        if (wantTarget) {
          const sym = i % 2 === 0 ? '▲' : '◆';
          const badge = [2, 3, 5, 7][i % 4];
          items.push({ id: i, sym, color: 'text-emerald-700', badge, isTarget: true });
        } else {
          const sym = ['▲', '◆', '△', '◇'][i % 4];
          const color = i % 3 === 0 ? 'text-emerald-700' : colors[(i + 1) % colors.length];
          let badge = badges[(i * 3) % badges.length];
          if (color === 'text-emerald-700' && (sym === '▲' || sym === '◆') && PRIMES_SMALL.has(badge)) {
            badge = [4, 6, 8, 9][i % 4];
          }
          items.push({ id: i, sym, color, badge, isTarget: false });
        }
      } else if (isFilter && level === 4) {
        // L4 dual disjunctive conjunction: Hollow Emerald Triangle (△) OR Solid Blue Diamond (◆)
        if (wantTarget) {
          const first = i % 2 === 0;
          items.push({
            id: i,
            sym: first ? '△' : '◆',
            color: first ? 'text-emerald-700' : 'text-blue-700',
            badge: null,
            isTarget: true,
          });
        } else {
          const decoys: Array<[string, string]> = [
            ['▲', 'text-emerald-700'],
            ['△', 'text-blue-700'],
            ['◇', 'text-blue-700'],
            ['◆', 'text-red-700'],
            ['▽', 'text-emerald-700'],
            ['◆', 'text-amber-700'],
          ];
          const [sym, color] = decoys[i % decoys.length];
          items.push({ id: i, sym, color, badge: null, isTarget: false });
        }
      } else if (isFilter) {
        if (wantTarget) {
          items.push({ id: i, sym: '▲', color: 'text-blue-700', badge: null, isTarget: true });
        } else {
          const sym = activePool[(i + 1) % activePool.length];
          const color = sym === '▲' ? 'text-amber-700' : colors[(i + 1) % colors.length];
          items.push({ id: i, sym, color, badge: null, isTarget: false });
        }
      } else {
        // target-finder / symbol-hunter
        if (wantTarget) {
          items.push({
            id: i,
            sym: targetSymbol,
            color: colors[i % colors.length],
            badge: null,
            isTarget: true,
          });
        } else {
          let sym = activePool[(i + 3) % activePool.length];
          if (sym === targetSymbol) {
            sym = activePool[(i + 5) % activePool.length];
          }
          items.push({
            id: i,
            sym,
            color: colors[(i + 1) % colors.length],
            badge: null,
            isTarget: false,
          });
        }
      }
    }

    for (let i = items.length - 1; i > 0; i--) {
      const j = (i * 11 + level * 5 + 3) % (i + 1);
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  // Symbol Hunter reshuffles unfound tiles faster at higher levels
  useEffect(() => {
    if (!isHunter) return;
    const intervalMs = level <= 2 ? 5500 : level === 3 ? 4200 : level === 4 ? 3200 : 2500;
    const timer = setInterval(() => {
      setCells((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i > 0; i--) {
          if (selectedIds.includes(next[i].id)) continue;
          const j = Math.floor(Math.random() * (i + 1));
          if (selectedIds.includes(next[j].id)) continue;
          [next[i], next[j]] = [next[j], next[i]];
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isHunter, level, selectedIds]);

  const totalTargets = cells.filter((c) => c.isTarget).length;

  useEffect(() => {
    onHudUpdate({
      progressText: `${selectedIds.length}/${totalTargets}`,
      score: Math.round((selectedIds.length / Math.max(1, totalTargets)) * 100),
      errors,
    });
  }, [selectedIds.length, totalTargets, errors, onHudUpdate]);

  function handleTileClick(cell: ScanCell) {
    if (selectedIds.includes(cell.id)) return;
    if (cell.isTarget) {
      playSuccessChime();
      const now = Date.now();
      const delta = now - lastHitRef.current;
      lastHitRef.current = now;
      const nextHits = [...clicks, { hitTime: delta }];
      setClicks(nextHits);
      const nextSelected = [...selectedIds, cell.id];
      setSelectedIds(nextSelected);

      if (nextSelected.length >= totalTargets) {
        playVictoryFanfare();
        const elapsed = Math.max(2, Math.round((now - startRef.current) / 1000));
        const acc = Math.round((totalTargets / Math.max(1, totalTargets + errors)) * 100);
        const avgRt = Math.round(nextHits.reduce((s, x) => s + x.hitTime, 0) / nextHits.length);
        onFinish({
          accuracyPct: acc,
          completionTimeSec: elapsed,
          reactionTimeMs: avgRt,
          errorCount: errors,
          scorePoints: acc,
          completed: true,
          summaryDetail: `Located all ${totalTargets} targets in ${gridCols}×${gridCols} grid with ${acc}% precision.`,
        });
      }
    } else {
      playErrorCue();
      setErrors((e) => e + 1);
    }
  }

  const ruleText = isFilter
    ? level === 5
      ? lang === 'hi'
        ? 'नियम: केवल हरे रंग (Emerald) के ▲ या ◆ चुनें जिनकी संख्या PRIME (2,3,5,7) हो'
        : 'Rule: Select ONLY EMERALD (▲ or ◆) tiles carrying a PRIME badge (2, 3, 5, 7)'
      : level === 4
        ? lang === 'hi'
          ? 'नियम: केवल खोखले हरे त्रिभुज (△) या ठोस नीले हीरे (◆) चुनें'
          : 'Rule: Select ONLY Hollow Emerald Triangles (△) OR Solid Blue Diamonds (◆)'
        : lang === 'hi'
          ? 'नियम: केवल नीले त्रिभुज (▲) चुनें'
          : 'Rule: Select ONLY Blue Triangles (▲)'
    : lang === 'hi'
      ? `लक्ष्य प्रतीक चुनें (${gridCols}×${gridCols}):`
      : `Find all exact matches in the ${gridCols}×${gridCols} matrix:`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 gap-3">
        <span className="text-xs font-semibold text-slate-700">{ruleText}</span>
        {!isFilter && (
          <span className="font-mono text-xl font-bold text-slate-900 shrink-0">{targetSymbol}</span>
        )}
      </div>

      <div
        className={`grid gap-2 ${
          gridCols === 7
            ? 'grid-cols-7'
            : gridCols === 6
              ? 'grid-cols-6'
              : gridCols === 5
                ? 'grid-cols-5'
                : 'grid-cols-4'
        }`}
      >
        {cells.map((cell) => {
          const hit = selectedIds.includes(cell.id);
          return (
            <button
              key={cell.id}
              type="button"
              onClick={() => handleTileClick(cell)}
              aria-label={`Grid symbol ${cell.sym}${cell.badge ? ` badge ${cell.badge}` : ''}`}
              className={`relative rounded-lg border font-bold transition-transform active:scale-95 flex items-center justify-center ${
                gridCols >= 7 ? 'h-11 text-base' : gridCols === 6 ? 'h-12 text-lg' : 'h-14 text-xl'
              } ${
                hit
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : `border-slate-200 bg-white hover:border-blue-400 ${cell.color}`
              }`}
            >
              <span>{cell.sym}</span>
              {cell.badge !== null && (
                <span className="ml-0.5 font-mono text-[10px] font-bold text-slate-600 tabular-nums">
                  {cell.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 3. FOCUS TRAIL (Sequential / Reverse-Alternating + Trap Nodes at L4-5)
// ---------------------------------------------------------------------------
const TRAIL_COORDS = [
  { x: 11, y: 18 },
  { x: 34, y: 15 },
  { x: 58, y: 19 },
  { x: 84, y: 16 },
  { x: 20, y: 38 },
  { x: 47, y: 36 },
  { x: 72, y: 40 },
  { x: 90, y: 42 },
  { x: 10, y: 60 },
  { x: 35, y: 58 },
  { x: 60, y: 62 },
  { x: 82, y: 65 },
  { x: 18, y: 83 },
  { x: 42, y: 84 },
  { x: 66, y: 84 },
  { x: 89, y: 85 },
  { x: 24, y: 26 },
  { x: 76, y: 27 },
  { x: 52, y: 50 },
  { x: 28, y: 72 },
  { x: 75, y: 74 },
];

export const FocusTrailGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const { targetNodes, allNodes, ruleHint } = useMemo(() => {
    const seq =
      level <= 2
        ? ['1', '2', '3', '4', '5', '6', '7', '8']
        : level === 3
          ? ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E']
          : level === 4
            ? ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E', '6', 'F', '7', 'G']
            : ['1', 'Z', '2', 'Y', '3', 'X', '4', 'W', '5', 'V', '6', 'U', '7', 'T', '8', 'S'];
    const decoys =
      level === 4 ? ['0', 'H', '8', 'X'] : level === 5 ? ['0', '9', 'R', 'Q', 'M'] : [];

    const combined = [
      ...seq.map((label, seqIdx) => ({ label, seqIdx, isTrap: false })),
      ...decoys.map((label) => ({ label, seqIdx: -1, isTrap: true })),
    ];
    // Deterministic permutation over non-overlapping TRAIL_COORDS
    const perm = [...combined].sort(
      (a, b) =>
        ((a.label.charCodeAt(0) * 17 + level * 9) % 29) -
        ((b.label.charCodeAt(0) * 17 + level * 9) % 29),
    );
    const positioned = perm.map((item, posIdx) => ({
      ...item,
      x: TRAIL_COORDS[posIdx].x,
      y: TRAIL_COORDS[posIdx].y,
    }));
    const orderedTargets = seq.map((lbl) => positioned.find((n) => n.label === lbl)!);
    const hint =
      level <= 2
        ? 'Connect ascending numbers 1 → 2 → 3 ...'
        : level <= 4
          ? 'Alternating rule: 1 → A → 2 → B → 3 → C ... (ignore decoy nodes!)'
          : 'Reverse-Alternating rule: 1 → Z → 2 → Y → 3 → X ... (avoid decoy traps!)';

    return { targetNodes: orderedTargets, allNodes: positioned, ruleHint: hint };
  }, [level]);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    onHudUpdate({
      progressText: `${step}/${targetNodes.length}`,
      score: Math.round((step / targetNodes.length) * 100),
      errors,
    });
  }, [step, targetNodes.length, errors, onHudUpdate]);

  function handleNodeClick(seqIdx: number) {
    if (seqIdx >= 0 && seqIdx < step) return;
    if (seqIdx === step) {
      playSuccessChime();
      const next = step + 1;
      setStep(next);
      if (next >= targetNodes.length) {
        playVictoryFanfare();
        const elapsed = Math.max(2, Math.round((Date.now() - startRef.current) / 1000));
        const acc = Math.round((targetNodes.length / (targetNodes.length + errors)) * 100);
        onFinish({
          accuracyPct: acc,
          completionTimeSec: elapsed,
          reactionTimeMs: null,
          errorCount: errors,
          scorePoints: acc,
          completed: true,
          summaryDetail: `Connected ${targetNodes.length}-node cognitive trail in ${elapsed}s (${errors} misses/traps).`,
        });
      }
    } else {
      playErrorCue();
      setErrors((e) => e + 1);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-600">
        <span>{lang === 'hi' ? 'सही नियम के अनुसार क्रम बिंदुओं को जोड़ें' : ruleHint}</span>
        <span className="font-mono font-bold text-blue-900 tabular-nums">
          {level <= 3
            ? `Next: ${targetNodes[step]?.label ?? 'Done'}`
            : `Step ${step}/${targetNodes.length}`}
        </span>
      </div>
      <div className="relative h-80 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          {step > 1 && (
            <polyline
              points={targetNodes
                .slice(0, step)
                .map((n) => `${n.x},${n.y}`)
                .join(' ')}
              fill="none"
              stroke="#1E3A8A"
              strokeWidth="1.2"
            />
          )}
        </svg>
        {allNodes.map((node) => {
          const done = !node.isTrap && node.seqIdx < step;
          return (
            <button
              key={node.label}
              type="button"
              onClick={() => handleNodeClick(node.seqIdx)}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-2 font-mono text-xs font-bold transition-transform ${
                done
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-blue-900 bg-white text-blue-900 hover:scale-105'
              }`}
            >
              {node.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 17. COLOUR CONFLICT (Task-Switching Stroop + Countdown Deadline at L4-5)
// ---------------------------------------------------------------------------
const STROOP_PALETTE = [
  { name: 'RED', hex: '#DC2626', btnLabel: 'Red' },
  { name: 'BLUE', hex: '#1D4ED8', btnLabel: 'Blue' },
  { name: 'GREEN', hex: '#059669', btnLabel: 'Green' },
  { name: 'AMBER', hex: '#D97706', btnLabel: 'Amber' },
  { name: 'VIOLET', hex: '#7C3AED', btnLabel: 'Violet' },
  { name: 'TEAL', hex: '#0D9488', btnLabel: 'Teal' },
];

export const ColourConflictGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const palette = useMemo(() => STROOP_PALETTE.slice(0, level >= 4 ? 6 : 4), [level]);
  const totalTrials = level <= 2 ? 6 : level === 3 ? 8 : level === 4 ? 12 : 16;
  const limitMs = level === 4 ? 2600 : level === 5 ? 1800 : 0;

  const trials = useMemo(() => {
    let seed = level * 41 + 19;
    return Array.from({ length: totalTrials }, (_, i) => {
      seed = (seed * 9301 + 49297) % 233280;
      const wordIdx = seed % palette.length;
      seed = (seed * 9301 + 49297) % 233280;
      const inkIdx = (wordIdx + 1 + (seed % (palette.length - 1))) % palette.length;
      // L4-5 switches unpredictably between INK_COLOR and WORD_MEANING
      const mode: 'INK' | 'WORD' = level >= 4 && (seed % 5 < 2 || i % 4 === 2) ? 'WORD' : 'INK';
      return {
        word: palette[wordIdx].name,
        ink: palette[inkIdx],
        mode,
      };
    });
  }, [level, palette, totalTrials]);

  const [trial, setTrial] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [rts, setRts] = useState<number[]>([]);
  const [timeLeftPct, setTimeLeftPct] = useState(100);
  const startRef = useRef(Date.now());
  const trialStartRef = useRef(Date.now());
  const finishedRef = useRef(false);

  const current = trials[Math.min(trial, totalTrials - 1)];

  useEffect(() => {
    onHudUpdate({
      progressText: `${trial}/${totalTrials}`,
      score: Math.round((correct / totalTrials) * 100),
      errors,
    });
  }, [trial, totalTrials, correct, errors, onHudUpdate]);

  const finishOrNext = useCallback(
    (isHit: boolean, rt: number) => {
      if (finishedRef.current) return;
      if (isHit) playSuccessChime();
      else playErrorCue();

      const nextCorrect = correct + (isHit ? 1 : 0);
      const nextErrors = errors + (isHit ? 0 : 1);
      const nextRts = [...rts, rt];
      const nextTrial = trial + 1;

      setCorrect(nextCorrect);
      setErrors(nextErrors);
      setRts(nextRts);
      setTrial(nextTrial);

      if (nextTrial >= totalTrials) {
        finishedRef.current = true;
        playVictoryFanfare();
        const acc = Math.round((nextCorrect / totalTrials) * 100);
        const sorted = [...nextRts].sort((a, b) => a - b);
        const medianRt = sorted.length > 0 ? Math.round(sorted[Math.floor(sorted.length / 2)]) : 800;
        const elapsed = Math.max(2, Math.round((Date.now() - startRef.current) / 1000));
        onFinish({
          accuracyPct: acc,
          completionTimeSec: elapsed,
          reactionTimeMs: medianRt,
          errorCount: nextErrors,
          scorePoints: acc,
          completed: true,
          summaryDetail: `${level >= 4 ? 'Task-switch Stroop' : 'Ink-colour inhibition'}: ${nextCorrect}/${totalTrials} correct · median RT ${medianRt}ms.`,
        });
      } else {
        trialStartRef.current = Date.now();
        setTimeLeftPct(100);
      }
    },
    [correct, errors, level, onFinish, rts, totalTrials, trial],
  );

  // Per-trial countdown bar & auto-timeout at L4-5
  useEffect(() => {
    if (!limitMs || finishedRef.current || trial >= totalTrials) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - trialStartRef.current;
      const pct = Math.max(0, 100 - Math.round((elapsed / limitMs) * 100));
      setTimeLeftPct(pct);
      if (elapsed >= limitMs) {
        clearInterval(tick);
        finishOrNext(false, limitMs);
      }
    }, 60);
    return () => clearInterval(tick);
  }, [limitMs, trial, totalTrials, finishOrNext]);

  function handlePick(colorName: string) {
    const rt = Date.now() - trialStartRef.current;
    const expected = current.mode === 'WORD' ? current.word : current.ink.name;
    finishOrNext(colorName === expected, rt);
  }

  return (
    <div className="space-y-5 text-center">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-700">
          {level >= 4
            ? current.mode === 'INK'
              ? 'SOLID BORDER → Tap the INK COLOUR (ignore word meaning)'
              : 'DASHED BORDER → Tap the WRITTEN WORD (ignore ink colour)'
            : lang === 'hi'
              ? 'शब्द की स्याही का रंग चुनें (लिखा हुआ शब्द न पढ़ें)'
              : 'Tap the INK COLOUR of the word — ignore what the text spells!'}
        </p>
        {limitMs > 0 && (
          <div className="mx-auto max-w-sm h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-blue-900 transition-all duration-75"
              style={{ width: `${timeLeftPct}%` }}
            />
          </div>
        )}
      </div>

      <div
        className={`mx-auto max-w-sm rounded-2xl bg-white py-9 px-4 ${
          current.mode === 'WORD'
            ? 'border-4 border-dashed border-amber-500'
            : 'border-2 border-slate-300'
        }`}
      >
        <p className="font-mono text-[11px] font-bold tracking-wider text-slate-500 mb-2">
          {current.mode === 'WORD' ? 'MODE: WORD MEANING' : 'MODE: INK COLOUR'}
        </p>
        <p
          className="font-display text-4xl font-extrabold tracking-wide select-none"
          style={{ color: current.ink.hex }}
        >
          {current.word}
        </p>
      </div>

      <div className={`grid gap-3 max-w-lg mx-auto ${palette.length === 6 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {palette.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => handlePick(c.name)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 hover:bg-slate-50 active:scale-95 transition-transform whitespace-nowrap"
          >
            <span
              className="inline-block h-3 w-3 rounded-full mr-2 align-middle"
              style={{ backgroundColor: c.hex }}
            />
            {c.btnLabel}
          </button>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 18 & 19: GO / NO-GO (Conjunction Cues + Omission Deadline) & QUICK REACTION
// ---------------------------------------------------------------------------
interface CueStimulus {
  isGo: boolean;
  shape: '●' | '■' | '▲';
  colorHex: string;
  colorName: string;
}

export const ReactionControlGame: React.FC<PlayableEngineProps> = ({
  gameId,
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const isGoNoGo = gameId === 'go-no-go';
  const totalTrials = isGoNoGo ? (level <= 3 ? 8 : level === 4 ? 12 : 16) : level <= 3 ? 6 : level === 4 ? 8 : 10;
  const isConjunction = isGoNoGo && level >= 4;
  const goDeadlineMs = level === 5 ? 780 : level === 4 ? 980 : 0;

  const schedule = useMemo<CueStimulus[]>(() => {
    let seed = level * 73 + 11;
    const goTargets: CueStimulus[] = [
      { isGo: true, shape: '●', colorHex: '#059669', colorName: 'Emerald' },
      { isGo: true, shape: '■', colorHex: '#1D4ED8', colorName: 'Blue' },
    ];
    const noGoLures: CueStimulus[] = [
      { isGo: false, shape: '●', colorHex: '#DC2626', colorName: 'Red' },
      { isGo: false, shape: '■', colorHex: '#059669', colorName: 'Emerald' },
      { isGo: false, shape: '●', colorHex: '#1D4ED8', colorName: 'Blue' },
      { isGo: false, shape: '▲', colorHex: '#D97706', colorName: 'Amber' },
    ];
    return Array.from({ length: totalTrials }, () => {
      seed = (seed * 9301 + 49297) % 233280;
      const isLure = isGoNoGo && seed % 10 < 3; // 30% unpredictable lures
      if (!isConjunction) {
        return isLure
          ? { isGo: false, shape: '▲', colorHex: '#DC2626', colorName: 'Red' }
          : { isGo: true, shape: '●', colorHex: '#059669', colorName: 'Emerald' };
      }
      if (isLure) return noGoLures[seed % noGoLures.length];
      return goTargets[seed % goTargets.length];
    });
  }, [isConjunction, isGoNoGo, level, totalTrials]);

  const [trialIdx, setTrialIdx] = useState(0);
  const [phase, setPhase] = useState<'WAIT' | 'CUE'>('WAIT');
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [rts, setRts] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const cueTimeRef = useRef<number>(0);
  const startRef = useRef<number>(Date.now());
  const finishedRef = useRef(false);

  const currentCue = schedule[Math.min(trialIdx, totalTrials - 1)];

  useEffect(() => {
    onHudUpdate({
      progressText: `${trialIdx}/${totalTrials}`,
      score: Math.round((hits / totalTrials) * 100),
      errors,
    });
  }, [trialIdx, totalTrials, hits, errors, onHudUpdate]);

  const advanceTrial = useCallback(
    (nextHits: number, nextErrors: number, nextRts: number[]) => {
      const nextIdx = trialIdx + 1;
      setTrialIdx(nextIdx);
      if (nextIdx >= totalTrials && !finishedRef.current) {
        finishedRef.current = true;
        playVictoryFanfare();
        const acc = Math.round((nextHits / Math.max(1, nextHits + nextErrors)) * 100);
        const sorted = [...nextRts].sort((a, b) => a - b);
        const medianRt = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 500;
        const elapsed = Math.max(3, Math.round((Date.now() - startRef.current) / 1000));
        onFinish({
          accuracyPct: acc,
          completionTimeSec: elapsed,
          reactionTimeMs: medianRt,
          errorCount: nextErrors,
          scorePoints: acc,
          completed: true,
          summaryDetail: `${nextHits} accurate responses · median RT ${medianRt}ms · ${nextErrors} impulse/omission errors.`,
        });
      }
    },
    [onFinish, totalTrials, trialIdx],
  );

  // Randomized inter-stimulus interval prevents anticipation timing
  useEffect(() => {
    if (finishedRef.current || trialIdx >= totalTrials) return;
    setPhase('WAIT');
    const delay = 750 + Math.floor(Math.random() * 1150);
    const waitTimer = setTimeout(() => {
      setPhase('CUE');
      cueTimeRef.current = Date.now();
    }, delay);
    return () => clearTimeout(waitTimer);
  }, [trialIdx, totalTrials]);

  // Auto-advance NO-GO holds OR miss GO deadline at L4-5
  useEffect(() => {
    if (phase !== 'CUE' || finishedRef.current || trialIdx >= totalTrials) return;
    if (!currentCue.isGo) {
      const holdMs = level === 5 ? 950 : level === 4 ? 1100 : 1350;
      const holdTimer = setTimeout(() => {
        playSuccessChime();
        const nextHits = hits + 1;
        setHits(nextHits);
        setFeedback('Clean hold on lure!');
        advanceTrial(nextHits, errors, rts);
      }, holdMs);
      return () => clearTimeout(holdTimer);
    }
    if (goDeadlineMs > 0) {
      const missTimer = setTimeout(() => {
        playErrorCue();
        const nextErr = errors + 1;
        setErrors(nextErr);
        setFeedback(`Too slow (> ${goDeadlineMs}ms) — missed GO window!`);
        advanceTrial(hits, nextErr, rts);
      }, goDeadlineMs);
      return () => clearTimeout(missTimer);
    }
  }, [phase, currentCue.isGo, goDeadlineMs, level, trialIdx, totalTrials, hits, errors, rts, advanceTrial]);

  const handleTap = useCallback(() => {
    if (finishedRef.current) return;
    if (phase === 'WAIT') {
      playErrorCue();
      setErrors((e) => e + 1);
      setFeedback('False start! Wait for the stimulus.');
      return;
    }
    if (currentCue.isGo) {
      const rt = Date.now() - cueTimeRef.current;
      playSuccessChime();
      const nextHits = hits + 1;
      const nextRts = [...rts, rt];
      setHits(nextHits);
      setRts(nextRts);
      setFeedback(`Captured in ${rt} ms`);
      advanceTrial(nextHits, errors, nextRts);
    } else {
      playErrorCue();
      const nextErr = errors + 1;
      setErrors(nextErr);
      setFeedback('Impulse error — withhold on lure!');
      advanceTrial(hits, nextErr, rts);
    }
  }, [advanceTrial, currentCue.isGo, errors, hits, phase, rts]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleTap]);

  return (
    <div className="space-y-5 text-center">
      <p className="text-xs font-semibold text-slate-700">
        {isConjunction
          ? `Conjunction Rule: TAP ONLY on EMERALD CIRCLE (●) or BLUE SQUARE (■) within ${goDeadlineMs}ms. HOLD on any other colour/shape!`
          : isGoNoGo
            ? lang === 'hi'
              ? 'GO दिखने पर तुरंत क्लिक करें; NO-GO पर रुकें।'
              : 'Click / press Space ONLY on GO. Hold back on NO-GO.'
            : goDeadlineMs > 0
              ? `Wait for the green GO signal and tap within ${goDeadlineMs}ms — avoid false starts!`
              : 'Wait for the green GO signal, then tap as fast as possible.'}
      </p>

      <button
        type="button"
        onClick={handleTap}
        style={
          phase === 'CUE' && isConjunction
            ? { backgroundColor: currentCue.colorHex, borderColor: currentCue.colorHex }
            : undefined
        }
        className={`mx-auto flex h-44 w-72 flex-col items-center justify-center rounded-2xl border-2 text-2xl font-extrabold transition-colors ${
          phase === 'WAIT'
            ? 'border-slate-300 bg-slate-100 text-slate-500'
            : isConjunction
              ? 'text-white'
              : currentCue.isGo
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-red-600 bg-red-600 text-white'
        }`}
      >
        {phase === 'WAIT' ? (
          <span>WAIT...</span>
        ) : isConjunction ? (
          <span className="flex flex-col items-center gap-1">
            <span className="text-5xl leading-none">{currentCue.shape}</span>
            <span className="text-xs font-bold tracking-wide">
              {currentCue.colorName.toUpperCase()} · TAP OR HOLD?
            </span>
          </span>
        ) : (
          <span>{currentCue.isGo ? 'GO · TAP NOW' : 'NO-GO · HOLD'}</span>
        )}
        <span className="mt-1.5 text-xs font-normal opacity-90">
          {phase === 'WAIT' ? 'Keep steady' : 'Click or Spacebar'}
        </span>
      </button>

      {feedback && <p className="text-xs font-semibold text-slate-700">{feedback}</p>}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 20. REVERSE RULE (8-Way Compass + 90° CW/CCW Switching + Timer at L4-5)
// ---------------------------------------------------------------------------
const COMPASS_8 = [
  { id: 'N', label: '↑ N' },
  { id: 'NE', label: '↗ NE' },
  { id: 'E', label: '→ E' },
  { id: 'SE', label: '↘ SE' },
  { id: 'S', label: '↓ S' },
  { id: 'SW', label: '↙ SW' },
  { id: 'W', label: '← W' },
  { id: 'NW', label: '↖ NW' },
] as const;

type CompassMode = 'SAME' | 'OPP' | 'CW90' | 'CCW90';

export const ReverseRuleGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const isCompass8 = level >= 4;
  const dirs = useMemo(
    () => (isCompass8 ? COMPASS_8 : [COMPASS_8[0], COMPASS_8[2], COMPASS_8[4], COMPASS_8[6]]),
    [isCompass8],
  );
  const totalTrials = level <= 2 ? 6 : level === 3 ? 8 : level === 4 ? 12 : 16;
  const limitMs = level === 4 ? 2800 : level === 5 ? 2000 : 0;

  const prompts = useMemo(() => {
    const modes: CompassMode[] =
      level <= 3
        ? ['SAME', 'OPP', 'OPP']
        : level === 4
          ? ['SAME', 'OPP', 'CW90']
          : ['SAME', 'OPP', 'CW90', 'CCW90'];
    let seed = level * 61 + 13;
    return Array.from({ length: totalTrials }, () => {
      seed = (seed * 9301 + 49297) % 233280;
      const compassIdx = isCompass8 ? seed % 8 : (seed % 4) * 2;
      seed = (seed * 9301 + 49297) % 233280;
      const mode = modes[seed % modes.length];
      const offset = mode === 'SAME' ? 0 : mode === 'OPP' ? 4 : mode === 'CW90' ? 2 : 6;
      const expectedId = COMPASS_8[(compassIdx + offset) % 8].id;
      return {
        dir: COMPASS_8[compassIdx],
        mode,
        expectedId,
      };
    });
  }, [isCompass8, level, totalTrials]);

  const [trial, setTrial] = useState(0);
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [rts, setRts] = useState<number[]>([]);
  const [timeLeftPct, setTimeLeftPct] = useState(100);
  const trialStartRef = useRef(Date.now());
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);

  const currentPrompt = prompts[Math.min(trial, totalTrials - 1)];

  useEffect(() => {
    onHudUpdate({
      progressText: `${trial}/${totalTrials}`,
      score: Math.round((hits / totalTrials) * 100),
      errors,
    });
  }, [trial, totalTrials, hits, errors, onHudUpdate]);

  const recordAnswer = useCallback(
    (ok: boolean, rt: number) => {
      if (finishedRef.current) return;
      if (ok) playSuccessChime();
      else playErrorCue();

      const nextHits = hits + (ok ? 1 : 0);
      const nextErr = errors + (ok ? 0 : 1);
      const nextRts = [...rts, rt];
      const nextTrial = trial + 1;

      setHits(nextHits);
      setErrors(nextErr);
      setRts(nextRts);
      setTrial(nextTrial);

      if (nextTrial >= totalTrials) {
        finishedRef.current = true;
        playVictoryFanfare();
        const acc = Math.round((nextHits / totalTrials) * 100);
        const sorted = [...nextRts].sort((a, b) => a - b);
        const medianRt = sorted.length > 0 ? Math.round(sorted[Math.floor(sorted.length / 2)]) : 900;
        const elapsed = Math.max(2, Math.round((Date.now() - startRef.current) / 1000));
        onFinish({
          accuracyPct: acc,
          completionTimeSec: elapsed,
          reactionTimeMs: medianRt,
          errorCount: nextErr,
          scorePoints: acc,
          completed: true,
          summaryDetail: `Compass rule switching: ${nextHits}/${totalTrials} accurate · median RT ${medianRt}ms.`,
        });
      } else {
        trialStartRef.current = Date.now();
        setTimeLeftPct(100);
      }
    },
    [errors, hits, onFinish, rts, totalTrials, trial],
  );

  useEffect(() => {
    if (!limitMs || finishedRef.current || trial >= totalTrials) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - trialStartRef.current;
      setTimeLeftPct(Math.max(0, 100 - Math.round((elapsed / limitMs) * 100)));
      if (elapsed >= limitMs) {
        clearInterval(tick);
        recordAnswer(false, limitMs);
      }
    }, 60);
    return () => clearInterval(tick);
  }, [limitMs, trial, totalTrials, recordAnswer]);

  function handleChoice(dirId: string) {
    const rt = Date.now() - trialStartRef.current;
    recordAnswer(dirId === currentPrompt.expectedId, rt);
  }

  const ruleTextMap: Record<CompassMode, string> = {
    SAME: lang === 'hi' ? 'नियम: समान दिशा (0°)' : 'RULE: SAME DIRECTION (0°)',
    OPP: lang === 'hi' ? 'नियम: विपरीत दिशा (180°)' : 'RULE: OPPOSITE (180°)',
    CW90: lang === 'hi' ? 'नियम: 90° दक्षिणावर्त घुमाएँ' : 'RULE: ROTATE 90° CLOCKWISE',
    CCW90: lang === 'hi' ? 'नियम: 90° वामावर्त घुमाएँ' : 'RULE: ROTATE 90° COUNTER-CW',
  };

  return (
    <div className="space-y-4 text-center">
      {limitMs > 0 && (
        <div className="mx-auto max-w-sm h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-blue-900 transition-all duration-75" style={{ width: `${timeLeftPct}%` }} />
        </div>
      )}

      <div
        className={`mx-auto max-w-sm rounded-xl border p-5 ${
          currentPrompt.mode === 'SAME'
            ? 'border-emerald-300 bg-emerald-50'
            : currentPrompt.mode === 'OPP'
              ? 'border-amber-300 bg-amber-50'
              : 'border-blue-300 bg-blue-50'
        }`}
      >
        <p className="text-xs font-bold tracking-wider text-slate-800">
          {ruleTextMap[currentPrompt.mode]}
        </p>
        <p className="mt-3 font-display text-4xl font-bold text-slate-900">
          {currentPrompt.dir.label}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2.5 max-w-lg mx-auto">
        {dirs.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => handleChoice(d.id)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 whitespace-nowrap"
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
};
