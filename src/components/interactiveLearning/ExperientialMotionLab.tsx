import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { ExperientialSimulationAsset } from '../../types/interactiveLearning';
import { apiRequest } from '../../utils/api';
import { pushToast } from '../ToastProvider';

interface ExperientialMotionLabProps {
  asset: ExperientialSimulationAsset;
  token: string;
  studentId?: string;
  onAttemptSaved: () => Promise<void>;
  onClose?: () => void;
}

const DIGESTIVE_WAYPOINTS: Array<{ x: number; y: number; organ: string }> = [
  { x: 165, y: 58, organ: 'Mouth & Salivary Glands' },
  { x: 180, y: 118, organ: 'Oesophagus (Peristalsis)' },
  { x: 205, y: 175, organ: 'Stomach (Acid & Pepsin)' },
  { x: 158, y: 206, organ: 'Liver & Pancreas Ducts' },
  { x: 185, y: 245, organ: 'Small Intestine (Villi)' },
  { x: 232, y: 262, organ: 'Large Intestine (Water)' },
  { x: 185, y: 312, organ: 'Rectum & Egestion' },
];

const FOOD_OPTIONS = [
  { id: 'apple', label: 'Apple Slice', color: '#E11D48', nutrientFocus: 'Carbohydrates & Fibre' },
  { id: 'roti', label: 'Whole-Wheat Roti', color: '#D97706', nutrientFocus: 'Starch → Maltose → Glucose' },
  { id: 'paneer', label: 'Paneer Cube', color: '#F59E0B', nutrientFocus: 'Proteins → Amino Acids & Fats' },
] as const;

export const ExperientialMotionLab: React.FC<ExperientialMotionLabProps> = ({
  asset,
  token,
  studentId,
  onAttemptSaved,
  onClose,
}) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [narrationOn, setNarrationOn] = useState(false);
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<number, number>>({});
  const [completedSaved, setCompletedSaved] = useState(false);

  // Simulator-specific live interactive controls
  const [selectedFood, setSelectedFood] = useState<'apple' | 'roti' | 'paneer'>('roti');
  const [sunlight, setSunlight] = useState(75);
  const [co2Level, setCo2Level] = useState(70);
  const [waterSupply, setWaterSupply] = useState(80);
  const [solarHeat, setSolarHeat] = useState(70);
  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(3);
  const [circuitClosed, setCircuitClosed] = useState(true);
  const [boxL, setBoxL] = useState(5);
  const [boxB, setBoxB] = useState(4);
  const [boxH, setBoxH] = useState(3);
  const [fracNum, setFracNum] = useState(3);
  const [fracDen, setFracDen] = useState(8);
  const [mantlePressure, setMantlePressure] = useState(58);
  const [tenseMode, setTenseMode] = useState<'past' | 'present' | 'future'>('present');

  const startRef = useRef<number>(Date.now());
  const stage = asset.stages[stageIdx] || asset.stages[0];

  // Auto-advance animation when playing
  useEffect(() => {
    if (!isPlaying || asset.stages.length <= 1) return;
    const id = window.setInterval(() => {
      setStageIdx((prev) => (prev < asset.stages.length - 1 ? prev + 1 : prev));
    }, 5200);
    return () => window.clearInterval(id);
  }, [isPlaying, asset.stages.length]);

  // Stop playing once final stage is reached
  useEffect(() => {
    if (stageIdx >= asset.stages.length - 1 && isPlaying) {
      const t = window.setTimeout(() => setIsPlaying(false), 5000);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [stageIdx, asset.stages.length, isPlaying]);

  // Optional Web Speech API narration
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (narrationOn && stage?.narration) {
      const u = new SpeechSynthesisUtterance(stage.narration);
      u.rate = 0.96;
      window.speechSynthesis.speak(u);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [narrationOn, stageIdx, stage?.narration]);

  // Derived scientific calculations
  const photosynthesisRate = useMemo(() => {
    const limiting = Math.min(sunlight, co2Level, waterSupply);
    return Math.round(limiting * 0.85 + ((sunlight + co2Level + waterSupply) / 3) * 0.15);
  }, [sunlight, co2Level, waterSupply]);

  const limitingFactor = useMemo(() => {
    if (sunlight <= co2Level && sunlight <= waterSupply) return 'Sunlight Intensity';
    if (co2Level <= sunlight && co2Level <= waterSupply) return 'Carbon Dioxide (CO₂)';
    return 'Soil Water Supply';
  }, [sunlight, co2Level, waterSupply]);

  const currentAmp = useMemo(() => {
    if (!circuitClosed) return 0;
    return Math.round((voltage / Math.max(1, resistance)) * 100) / 100;
  }, [circuitClosed, voltage, resistance]);

  const cuboidVolume = boxL * boxB * boxH;
  const cuboidTSA = 2 * (boxL * boxB + boxB * boxH + boxH * boxL);

  const answeredCount = Object.keys(checkpointAnswers).length;
  const correctCheckpoints = asset.stages.reduce((sum, st, idx) => {
    return sum + (checkpointAnswers[idx] === st.checkpointCorrectIndex ? 1 : 0);
  }, 0);

  const persistAttempt = async (isComplete: boolean) => {
    const totalStages = Math.max(1, asset.stages.length);
    const progressPct = isComplete
      ? 100
      : Math.max(15, Math.round(((Math.max(stageIdx + 1, answeredCount)) / totalStages) * 100));
    const accuracyPct =
      answeredCount > 0
        ? Math.round((correctCheckpoints / answeredCount) * 100)
        : isComplete
          ? 85
          : 70;
    const mistakes = asset.stages
      .filter((st, idx) => checkpointAnswers[idx] !== undefined && checkpointAnswers[idx] !== st.checkpointCorrectIndex)
      .map((st) => `${st.shortLabel}: ${st.checkpointQuestion}`);

    try {
      await apiRequest(
        '/api/interactive-learning/attempts',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId,
            subject: asset.subject,
            chapterId: asset.chapterId,
            conceptId: asset.conceptId,
            assetId: asset.id,
            assetTitle: asset.title,
            assetType: 'experiential',
            status: isComplete ? 'completed' : 'in_progress',
            progressPct,
            scorePct: accuracyPct,
            accuracyPct,
            timeSpentSec: Math.max(10, Math.round((Date.now() - startRef.current) / 1000)),
            mistakes,
          }),
        },
        token,
      );
      if (isComplete) {
        setCompletedSaved(true);
        pushToast(`Experiential Lab completed (${accuracyPct}% checkpoint accuracy)!`, 'success');
      }
      await onAttemptSaved();
    } catch (err) {
      if (isComplete) {
        pushToast(err instanceof Error ? err.message : 'Unable to save lab completion.', 'error');
      }
    }
  };

  const handleSelectCheckpoint = (optIdx: number) => {
    const next = { ...checkpointAnswers, [stageIdx]: optIdx };
    setCheckpointAnswers(next);
    const isLastAnswered = Object.keys(next).length >= asset.stages.length;
    if (isLastAnswered && !completedSaved) {
      void persistAttempt(true);
    } else {
      void persistAttempt(false);
    }
  };

  const activeFoodObj = FOOD_OPTIONS.find((f) => f.id === selectedFood) || FOOD_OPTIONS[1];
  const waypoint = DIGESTIVE_WAYPOINTS[Math.min(stageIdx, DIGESTIVE_WAYPOINTS.length - 1)];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header Bar */}
      <div className="bg-[#142B46] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D6B66D]">
            Class {asset.classLevel} · {asset.subject} · {asset.chapterTitle}
          </p>
          <h3 className="font-display text-lg font-bold">{asset.title}</h3>
          <p className="text-xs text-slate-300">{asset.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setNarrationOn((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              narrationOn
                ? 'bg-[#D6B66D] text-[#142B46]'
                : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {narrationOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            {narrationOn ? 'Narration On' : 'Voice Narration'}
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D6349] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#31523b] whitespace-nowrap shrink-0"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStageIdx(0);
              setIsPlaying(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Replay
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 whitespace-nowrap shrink-0"
            >
              Back to Library
            </button>
          )}
        </div>
      </div>

      {/* Main Split Stage: Live Motion Graphics Canvas (Left) + Stage Explanation & Checkpoint (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Live SVG Motion Graphics & Interactive Lab Controls */}
        <div className="lg:col-span-7 p-5 bg-[#FAF4EC]/60 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-4">
          {/* 1. HUMAN DIGESTIVE SYSTEM INTERACTIVE MOTION LAB */}
          {asset.simulatorKey === 'digestive_system' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#142B46]">
                  Choose Food Particle to Trace:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FOOD_OPTIONS.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => {
                        setSelectedFood(food.id);
                        setStageIdx(0);
                        setIsPlaying(true);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        selectedFood === food.id
                          ? 'bg-[#142B46] text-white'
                          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {food.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <svg
                  viewBox="0 0 380 350"
                  className="w-full h-80 mx-auto"
                  role="img"
                  aria-label="Interactive Human Digestive System Motion Graphic"
                >
                  {/* Torso silhouette */}
                  <path
                    d="M 140 24 C 140 8, 220 8, 220 24 L 222 72 C 258 84, 275 112, 276 168 L 270 330 L 100 330 L 94 168 C 95 112, 112 84, 142 72 Z"
                    fill="#F8FAFC"
                    stroke="#CBD5E1"
                    strokeWidth="2"
                  />
                  {/* Mouth cavity */}
                  <ellipse
                    cx="165"
                    cy="58"
                    rx="18"
                    ry="9"
                    fill={stageIdx === 0 ? '#FDE68A' : '#FEE2E2'}
                    stroke="#DC2626"
                    strokeWidth="1.5"
                  />
                  {/* Oesophagus */}
                  <path
                    d="M 176 66 L 180 148"
                    fill="none"
                    stroke={stageIdx === 1 ? '#D97706' : '#FCA5A5'}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Liver */}
                  <path
                    d="M 122 162 C 122 142, 168 142, 174 166 C 166 184, 130 184, 122 162 Z"
                    fill={stageIdx === 3 ? '#B45309' : '#9A3412'}
                    opacity="0.88"
                  />
                  {/* Stomach (J-shaped) */}
                  <path
                    d="M 180 148 C 218 148, 232 184, 202 204 C 182 214, 164 198, 174 180 Z"
                    fill={stageIdx === 2 ? '#FB923C' : '#FDBA74'}
                    stroke="#C2410C"
                    strokeWidth="2"
                  />
                  {/* Pancreas */}
                  <ellipse
                    cx="166"
                    cy="210"
                    rx="22"
                    ry="7"
                    fill={stageIdx === 3 ? '#FACC15' : '#FEF08A'}
                    stroke="#CA8A04"
                    strokeWidth="1.5"
                  />
                  {/* Large Intestine frame */}
                  <path
                    d="M 134 295 L 134 226 L 236 226 L 236 296 L 185 296 L 185 322"
                    fill="none"
                    stroke={stageIdx === 5 || stageIdx === 6 ? '#6E987A' : '#A7C4B5'}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Coiled Small Intestine */}
                  <path
                    d="M 155 236 C 210 236, 210 250, 156 250 C 210 250, 210 264, 158 264 C 210 264, 210 278, 170 278"
                    fill="none"
                    stroke={stageIdx === 4 ? '#E11D48' : '#FB7185'}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Nutrient absorption sparks at stage 4 */}
                  {stageIdx === 4 && (
                    <g>
                      <circle cx="152" cy="244" r="3" fill="#10B981" className="animate-ping" />
                      <circle cx="215" cy="256" r="3" fill="#10B981" className="animate-ping" />
                      <circle cx="188" cy="272" r="3" fill="#10B981" className="animate-ping" />
                    </g>
                  )}

                  {/* Animated Glowing Food Bolus */}
                  <g
                    style={{
                      transform: `translate(${waypoint.x}px, ${waypoint.y}px)`,
                      transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <circle r="11" fill={activeFoodObj.color} opacity="0.28" className="animate-pulse" />
                    <circle r="6.5" fill={activeFoodObj.color} stroke="#FFFFFF" strokeWidth="2" />
                  </g>

                  {/* Anatomical Callout Labels */}
                  <g className="text-[9px] font-semibold fill-slate-700">
                    <text x="236" y="60">1. Mouth &amp; Saliva</text>
                    <line x1="184" y1="58" x2="232" y2="58" stroke="#94A3B8" strokeDasharray="2 2" />
                    <text x="236" y="120">2. Oesophagus</text>
                    <line x1="186" y1="118" x2="232" y2="118" stroke="#94A3B8" strokeDasharray="2 2" />
                    <text x="242" y="176">3. Stomach (HCl)</text>
                    <line x1="218" y1="174" x2="238" y2="174" stroke="#94A3B8" strokeDasharray="2 2" />
                    <text x="8" y="166">4. Liver (Bile)</text>
                    <text x="8" y="212">Pancreas</text>
                    <text x="250" y="246">5. Small Intestine</text>
                    <text x="250" y="266">6. Large Intestine</text>
                    <text x="210" y="318">7. Rectum &amp; Anus</text>
                  </g>
                </svg>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                  <span>
                    Tracing: <strong className="text-[#142B46]">{activeFoodObj.label}</strong> ({activeFoodObj.nutrientFocus})
                  </span>
                  <span className="font-semibold text-[#3D6349]">{waypoint.organ}</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. PHOTOSYNTHESIS & STOMATA VIRTUAL LAB */}
          {asset.simulatorKey === 'photosynthesis_lab' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <svg viewBox="0 0 380 240" className="w-full h-60 mx-auto" role="img" aria-label="Photosynthesis Leaf Simulator">
                  {/* Sky & Sun */}
                  <rect width="380" height="240" rx="10" fill="#F0F9FF" />
                  <circle
                    cx="55"
                    cy="48"
                    r={16 + sunlight * 0.14}
                    fill="#F59E0B"
                    opacity={0.35 + sunlight / 160}
                  />
                  <circle cx="55" cy="48" r="16" fill="#FBBF24" />
                  {/* Sunbeams */}
                  <line x1="78" y1="62" x2="150" y2="108" stroke="#F59E0B" strokeWidth={Math.max(1, sunlight / 28)} strokeDasharray="5 4" />
                  {/* Leaf Blade */}
                  <path
                    d="M 110 155 C 145 78, 255 78, 295 148 C 255 198, 155 198, 110 155 Z"
                    fill={`rgb(${Math.round(90 - photosynthesisRate * 0.4)}, ${Math.round(140 + photosynthesisRate * 0.65)}, ${Math.round(80)})`}
                    stroke="#166534"
                    strokeWidth="2.5"
                  />
                  {/* Leaf Midrib & Chloroplasts */}
                  <path d="M 110 155 Q 205 140 295 148" fill="none" stroke="#DCFCE7" strokeWidth="2.5" />
                  {[165, 195, 225, 250].map((cx, i) => (
                    <ellipse
                      key={cx}
                      cx={cx}
                      cy={128 + (i % 2) * 26}
                      rx="11"
                      ry="6"
                      fill="#22C55E"
                      stroke="#14532D"
                      strokeWidth="1"
                      opacity={0.45 + photosynthesisRate / 180}
                    />
                  ))}
                  {/* Stomata pore width responds to water & sunlight */}
                  <g transform="translate(205, 174)">
                    <ellipse cx="0" cy="0" rx="16" ry={Math.max(2, (waterSupply / 100) * 7)} fill="#14532D" />
                    <text x="22" y="4" className="text-[9px] font-semibold fill-slate-700">
                      Stoma ({waterSupply >= 35 ? 'Open' : 'Closing'})
                    </text>
                  </g>
                  {/* Oxygen Bubbles released proportional to photosynthesis rate */}
                  {photosynthesisRate > 20 && (
                    <g>
                      <circle cx="235" cy="84" r="5" fill="#38BDF8" className="animate-bounce" />
                      <circle cx="262" cy="70" r="6" fill="#0EA5E9" className="animate-bounce" />
                      {photosynthesisRate > 55 && (
                        <circle cx="285" cy="90" r="5" fill="#38BDF8" className="animate-pulse" />
                      )}
                      <text x="275" y="54" className="text-[10px] font-bold fill-sky-700">O₂ Release</text>
                    </g>
                  )}
                  {/* Water uptake from roots */}
                  <text x="16" y="218" className="text-[10px] font-semibold fill-sky-800">
                    H₂O Roots ({waterSupply}%) → Xylem
                  </text>
                  <text x="235" y="218" className="text-[10px] font-semibold fill-emerald-800">
                    Glucose Rate: {photosynthesisRate}%
                  </text>
                </svg>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 tabular-nums">
                    <span>Sunlight</span>
                    <span>{sunlight}%</span>
                  </div>
                  <input type="range" min={5} max={100} value={sunlight} onChange={(e) => setSunlight(Number(e.target.value))} className="w-full mt-1.5 accent-amber-500" />
                </label>
                <label className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 tabular-nums">
                    <span>CO₂ Concentration</span>
                    <span>{co2Level}%</span>
                  </div>
                  <input type="range" min={5} max={100} value={co2Level} onChange={(e) => setCo2Level(Number(e.target.value))} className="w-full mt-1.5 accent-emerald-600" />
                </label>
                <label className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 tabular-nums">
                    <span>Soil Water</span>
                    <span>{waterSupply}%</span>
                  </div>
                  <input type="range" min={5} max={100} value={waterSupply} onChange={(e) => setWaterSupply(Number(e.target.value))} className="w-full mt-1.5 accent-sky-600" />
                </label>
              </div>
              <p className="text-xs text-slate-700 bg-white rounded-lg border border-slate-200 px-3 py-2">
                <strong className="text-[#142B46]">Live Lab Diagnosis:</strong> Limiting factor right now is{' '}
                <strong className="text-[#3D6349]">{limitingFactor}</strong> · Oxygen &amp; Starch synthesis running at{' '}
                <strong className="font-mono tabular-nums">{photosynthesisRate}%</strong>.
              </p>
            </div>
          )}

          {/* 3. WATER CYCLE CLIMATE SIMULATOR */}
          {asset.simulatorKey === 'water_cycle' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <svg viewBox="0 0 380 230" className="w-full h-60" role="img" aria-label="Water Cycle Simulator">
                  <rect width="380" height="230" rx="10" fill="#E0F2FE" />
                  <circle cx="54" cy="46" r={15 + solarHeat * 0.12} fill="#F59E0B" />
                  {/* Ocean */}
                  <rect x="0" y="175" width="210" height="55" fill="#0284C7" />
                  {/* Mountain & Land */}
                  <path d="M 190 230 L 235 125 L 305 160 L 380 148 L 380 230 Z" fill="#6E987A" />
                  {/* Rising Evaporation Arrows */}
                  {[55, 100, 145].map((x) => (
                    <path
                      key={x}
                      d={`M ${x} 170 Q ${x - 6} 145 ${x + 4} 118`}
                      fill="none"
                      stroke="#0369A1"
                      strokeWidth={Math.max(1.2, solarHeat / 35)}
                      strokeDasharray="4 3"
                    />
                  ))}
                  {/* Clouds */}
                  <g opacity={Math.min(1, 0.35 + solarHeat / 120)}>
                    <ellipse cx="220" cy="64" rx="46" ry="20" fill="#CBD5E1" />
                    <ellipse cx="258" cy="68" rx="34" ry="18" fill="#94A3B8" />
                  </g>
                  {/* Raindrops when solar heat drives sufficient condensation */}
                  {solarHeat >= 35 &&
                    [210, 232, 252, 272].map((rx) => (
                      <line
                        key={rx}
                        x1={rx}
                        y1="88"
                        x2={rx - 4}
                        y2="122"
                        stroke="#0284C7"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="animate-pulse"
                      />
                    ))}
                  <text x="20" y="198" className="text-[10px] font-bold fill-white">
                    Evaporation ({solarHeat}% heat)
                  </text>
                  <text x="195" y="42" className="text-[10px] font-bold fill-slate-700">
                    Condensation &amp; Rainfall
                  </text>
                  <text x="255" y="206" className="text-[10px] font-bold fill-white">
                    Surface Runoff
                  </text>
                </svg>
              </div>
              <label className="block rounded-lg border border-slate-200 bg-white p-3 text-xs">
                <div className="flex justify-between font-semibold text-[#142B46] tabular-nums">
                  <span>Solar Energy / Temperature Driver</span>
                  <span>{solarHeat}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={100}
                  value={solarHeat}
                  onChange={(e) => setSolarHeat(Number(e.target.value))}
                  className="w-full mt-1.5 accent-sky-600"
                />
              </label>
            </div>
          )}

          {/* 4. ELECTRIC CIRCUIT & OHM'S LAW VIRTUAL LAB */}
          {asset.simulatorKey === 'electric_circuit' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <svg viewBox="0 0 380 220" className="w-full h-56" role="img" aria-label="Interactive Electric Circuit Lab">
                  <rect width="380" height="220" rx="10" fill="#0F172A" />
                  {/* Circuit wire loop */}
                  <rect x="65" y="42" width="250" height="136" rx="12" fill="none" stroke={circuitClosed ? '#38BDF8' : '#64748B'} strokeWidth="4" />
                  {/* Battery */}
                  <rect x="44" y="88" width="42" height="44" rx="6" fill="#D6B66D" />
                  <text x="53" y="114" className="text-[11px] font-bold fill-[#142B46]">
                    {voltage}V
                  </text>
                  {/* Bulb */}
                  <circle
                    cx="190"
                    cy="42"
                    r={circuitClosed ? Math.min(34, 16 + currentAmp * 4) : 14}
                    fill="#FACC15"
                    opacity={circuitClosed ? Math.min(0.85, 0.25 + currentAmp * 0.14) : 0.08}
                  />
                  <circle cx="190" cy="42" r="15" fill={circuitClosed ? '#FEF08A' : '#334155'} stroke="#F59E0B" strokeWidth="2" />
                  {/* Resistor */}
                  <rect x="292" y="88" width="46" height="44" rx="6" fill="#1E293B" stroke="#94A3B8" strokeWidth="2" />
                  <text x="303" y="114" className="text-[11px] font-bold fill-white">
                    {resistance}Ω
                  </text>
                  {/* Ammeter */}
                  <circle cx="190" cy="178" r="22" fill="#142B46" stroke="#D6B66D" strokeWidth="2" />
                  <text x="172" y="182" className="text-[10px] font-bold fill-[#D6B66D]">
                    {currentAmp}A
                  </text>
                  {/* Animated electron indicators */}
                  {circuitClosed && (
                    <g>
                      <circle cx="120" cy="42" r="4" fill="#FDE047" className="animate-ping" />
                      <circle cx="265" cy="42" r="4" fill="#FDE047" className="animate-ping" />
                      <circle cx="125" cy="178" r="4" fill="#FDE047" className="animate-ping" />
                    </g>
                  )}
                </svg>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 tabular-nums">
                    <span>Voltage (V)</span>
                    <span>{voltage} V</span>
                  </div>
                  <input type="range" min={1} max={18} value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} className="w-full mt-1 accent-amber-500" />
                </label>
                <label className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 tabular-nums">
                    <span>Resistance (Ω)</span>
                    <span>{resistance} Ω</span>
                  </div>
                  <input type="range" min={1} max={12} value={resistance} onChange={(e) => setResistance(Number(e.target.value))} className="w-full mt-1 accent-sky-600" />
                </label>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-slate-600">Circuit Switch</span>
                  <button
                    type="button"
                    onClick={() => setCircuitClosed((v) => !v)}
                    className={`mt-1 rounded-md px-3 py-1.5 text-xs font-bold ${
                      circuitClosed ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {circuitClosed ? 'Closed (ON)' : 'Open (OFF)'}
                  </button>
                </div>
              </div>
              <p className="text-xs font-mono text-[#142B46] bg-white rounded-lg border border-slate-200 px-3 py-2 tabular-nums">
                Ohm&apos;s Law: I = V / R = {voltage} / {resistance} = <strong>{currentAmp} Amperes</strong>
              </p>
            </div>
          )}

          {/* 5. 3D GEOMETRY, VOLUME & FRACTIONS STUDIO */}
          {asset.simulatorKey === 'geometry_fractions' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Isometric 3D Cuboid SVG */}
                <svg viewBox="0 0 220 180" className="w-full h-44" role="img" aria-label="Interactive 3D Cuboid">
                  {(() => {
                    const w = boxL * 14;
                    const h = boxH * 14;
                    const dx = boxB * 8;
                    const dy = boxB * 5;
                    const x0 = 42;
                    const y0 = 150 - h;
                    return (
                      <g>
                        {/* Top face */}
                        <polygon
                          points={`${x0},${y0} ${x0 + dx},${y0 - dy} ${x0 + w + dx},${y0 - dy} ${x0 + w},${y0}`}
                          fill="#D6B66D"
                          stroke="#142B46"
                          strokeWidth="1.5"
                        />
                        {/* Front face */}
                        <polygon
                          points={`${x0},${y0} ${x0 + w},${y0} ${x0 + w},${y0 + h} ${x0},${y0 + h}`}
                          fill="#142B46"
                          opacity="0.88"
                          stroke="#142B46"
                          strokeWidth="1.5"
                        />
                        {/* Side face */}
                        <polygon
                          points={`${x0 + w},${y0} ${x0 + w + dx},${y0 - dy} ${x0 + w + dx},${y0 + h - dy} ${x0 + w},${y0 + h}`}
                          fill="#3D6349"
                          stroke="#142B46"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })()}
                </svg>

                {/* Live Geometry & Fraction Readout */}
                <div className="space-y-2.5 text-xs">
                  <div className="rounded-lg bg-[#FAF4EC] border border-slate-200 p-2.5 space-y-1 tabular-nums">
                    <p className="font-semibold text-[#142B46]">
                      Volume = L × B × H = <strong className="font-mono">{cuboidVolume} cm³</strong>
                    </p>
                    <p className="font-semibold text-[#3D6349]">
                      Total Surface Area = <strong className="font-mono">{cuboidTSA} cm²</strong>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-700">
                      Visual Fraction Bar: {fracNum}/{fracDen} ({Math.round((fracNum / fracDen) * 100)}%)
                    </p>
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${fracDen}, minmax(0, 1fr))` }}>
                      {Array.from({ length: fracDen }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFracNum(i + 1)}
                          className={`h-6 rounded border ${
                            i < fracNum
                              ? 'bg-[#3D6349] border-[#2C4B36]'
                              : 'bg-slate-100 border-slate-300'
                          }`}
                          aria-label={`Select ${i + 1} of ${fracDen}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <label className="rounded-lg border border-slate-200 bg-white p-2">
                  <span className="font-semibold">L: {boxL} cm</span>
                  <input type="range" min={2} max={8} value={boxL} onChange={(e) => setBoxL(Number(e.target.value))} className="w-full" />
                </label>
                <label className="rounded-lg border border-slate-200 bg-white p-2">
                  <span className="font-semibold">B: {boxB} cm</span>
                  <input type="range" min={2} max={7} value={boxB} onChange={(e) => setBoxB(Number(e.target.value))} className="w-full" />
                </label>
                <label className="rounded-lg border border-slate-200 bg-white p-2">
                  <span className="font-semibold">H: {boxH} cm</span>
                  <input type="range" min={2} max={7} value={boxH} onChange={(e) => setBoxH(Number(e.target.value))} className="w-full" />
                </label>
                <label className="rounded-lg border border-slate-200 bg-white p-2">
                  <span className="font-semibold">Parts: {fracDen}</span>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={fracDen}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setFracDen(d);
                      if (fracNum > d) setFracNum(d);
                    }}
                    className="w-full"
                  />
                </label>
              </div>
            </div>
          )}

          {/* 6. VOLCANO & PLATE TECTONICS CROSS-SECTION SIMULATOR */}
          {asset.simulatorKey === 'volcano_tectonics' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <svg viewBox="0 0 380 230" className="w-full h-56" role="img" aria-label="Volcano Cross Section">
                  <rect width="380" height="230" rx="10" fill="#F1F5F9" />
                  {/* Ash cloud above crater */}
                  {mantlePressure >= 65 && (
                    <g opacity={Math.min(1, (mantlePressure - 50) / 50)}>
                      <ellipse cx="190" cy="40" rx="44" ry="18" fill="#64748B" className="animate-pulse" />
                      <ellipse cx="222" cy="34" rx="28" ry="14" fill="#94A3B8" />
                    </g>
                  )}
                  {/* Volcano Cone */}
                  <polygon points="85,180 172,72 208,72 295,180" fill="#57534E" />
                  {/* Earth Crust & Mantle */}
                  <rect x="0" y="180" width="380" height="50" fill="#7C2D12" />
                  {/* Magma Chamber & Vent */}
                  <ellipse cx="190" cy="206" rx="68" ry="20" fill="#EA580C" />
                  <rect
                    x="182"
                    y={Math.max(66, 185 - mantlePressure * 1.25)}
                    width="16"
                    height={Math.min(130, mantlePressure * 1.25 + 15)}
                    fill="#F97316"
                  />
                  {/* Lava overflow */}
                  {mantlePressure >= 78 && (
                    <path d="M 176 74 L 145 128 M 204 74 L 236 132" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
                  )}
                  <text x="16" y="208" className="text-[10px] font-bold fill-amber-100">
                    Magma Chamber ({mantlePressure}% Pressure)
                  </text>
                </svg>
              </div>
              <label className="block rounded-lg border border-slate-200 bg-white p-3 text-xs">
                <div className="flex justify-between font-semibold text-[#142B46] tabular-nums">
                  <span>Tectonic Mantle Pressure</span>
                  <span>{mantlePressure}% ({mantlePressure >= 78 ? 'Active Eruption' : mantlePressure >= 55 ? 'Rising Magma' : 'Dormant'})</span>
                </div>
                <input type="range" min={20} max={100} value={mantlePressure} onChange={(e) => setMantlePressure(Number(e.target.value))} className="w-full mt-1.5 accent-orange-600" />
              </label>
            </div>
          )}

          {/* 7. LANGUAGE VISUAL TENSE TIMELINE & DIALOGUE STAGE */}
          {(asset.simulatorKey === 'language_roleplay' || asset.simulatorKey === 'generic_process') && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#142B46]">Interactive Tense Timeline</span>
                <div className="flex gap-1.5">
                  {(['past', 'present', 'future'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTenseMode(t)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize ${
                        tenseMode === t
                          ? 'bg-[#142B46] text-white'
                          : 'border border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-[#FAF4EC] border border-slate-200 p-4 text-center space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3D6349]">
                  {tenseMode === 'past'
                    ? 'Completed Before Now (Verb + -ed / irregular)'
                    : tenseMode === 'present'
                      ? 'Happening Regularly / Now (Base verb / +s)'
                      : 'Planned Ahead (will + Base verb)'}
                </p>
                <p className="font-display text-lg font-bold text-[#142B46]">
                  {tenseMode === 'past'
                    ? '“Aarav presented his science model yesterday.”'
                    : tenseMode === 'present'
                      ? '“Aarav presents his science model clearly.”'
                      : '“Aarav will present his science model tomorrow.”'}
                </p>
              </div>
            </div>
          )}

          {/* Stage Timeline Stepper */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-[#142B46]">
                Stage {stageIdx + 1} of {asset.stages.length}: {stage.shortLabel}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={stageIdx === 0}
                  onClick={() => {
                    setIsPlaying(false);
                    setStageIdx((s) => Math.max(0, s - 1));
                  }}
                  className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 disabled:opacity-40"
                  aria-label="Previous stage"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={stageIdx >= asset.stages.length - 1}
                  onClick={() => {
                    setIsPlaying(false);
                    setStageIdx((s) => Math.min(asset.stages.length - 1, s + 1));
                  }}
                  className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 disabled:opacity-40"
                  aria-label="Next stage"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {asset.stages.map((st, idx) => {
                const answered = checkpointAnswers[idx] !== undefined;
                const active = idx === stageIdx;
                return (
                  <button
                    key={st.stageNumber}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setStageIdx(idx);
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#142B46] text-white'
                        : answered
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {idx + 1}. {st.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Concept Breakdown, Labels, & Interactive Stage Checkpoint */}
        <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#3D6349]">
                <Sparkles className="h-3.5 w-3.5" />
                Visual Cue: {stage.visualCue}
              </div>
              <h4 className="font-display text-base font-bold text-[#142B46]">{stage.title}</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{stage.explanation}</p>
            </div>

            {/* Key Labels */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Key Scientific Terms &amp; Labels
              </p>
              <p className="text-xs font-medium text-[#142B46]">
                {stage.labels.join(' · ')}
              </p>
            </div>

            {/* Stage Checkpoint Question */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#142B46]">
                Stage {stage.stageNumber} Understanding Check
              </p>
              <p className="text-xs font-semibold text-slate-900">{stage.checkpointQuestion}</p>
              <div className="space-y-2">
                {stage.checkpointOptions.map((opt, optIdx) => {
                  const chosen = checkpointAnswers[stageIdx];
                  const isSelected = chosen === optIdx;
                  const isCorrect = optIdx === stage.checkpointCorrectIndex;
                  let style = 'border-slate-200 bg-white text-slate-800 hover:border-[#142B46]';
                  if (chosen !== undefined) {
                    if (isCorrect) style = 'border-emerald-400 bg-emerald-50 text-emerald-900';
                    else if (isSelected) style = 'border-rose-300 bg-rose-50 text-rose-900';
                    else style = 'border-slate-200 bg-white text-slate-500';
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectCheckpoint(optIdx)}
                      className={`w-full text-left rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {checkpointAnswers[stageIdx] !== undefined && (
                <p className="text-xs text-slate-700 border-t border-slate-200 pt-2">
                  <strong className="text-[#3D6349]">Why:</strong> {stage.checkpointExplanation}
                </p>
              )}
            </div>
          </div>

          {/* Completion Footer */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between gap-2">
            <div className="text-xs text-slate-600 tabular-nums">
              Checkpoints: <strong>{answeredCount}/{asset.stages.length}</strong> ({correctCheckpoints} correct)
            </div>
            <button
              type="button"
              onClick={() => persistAttempt(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e3b5c] whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {completedSaved ? 'Saved Mastery' : 'Complete & Save Lab'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
