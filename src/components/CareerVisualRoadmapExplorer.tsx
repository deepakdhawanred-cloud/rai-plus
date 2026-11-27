import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Flag,
  GitBranch,
  GraduationCap,
  IndianRupee,
  Printer,
  ShieldCheck,
  Target,
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
import type { StudentCareerPlan, StudentRecord } from '../types';
import type { WorkspaceData } from '../types/workspace';
import {
  type AcademicStreamId,
  buildStudentCareerIntelligenceMap,
  type MappedCareerPath,
} from '../utils/careerRoadmapEngine';

interface CareerVisualRoadmapExplorerProps {
  data: WorkspaceData;
  activeStudent: StudentRecord | null;
  activePlan: StudentCareerPlan | null;
  canEditPlan: boolean;
  savingPlan: boolean;
  selectedStudentId: string;
  onSelectStudentId: (studentId: string) => void;
  declaredInterestsText: string;
  onDeclaredInterestsChange: (value: string) => void;
  selectedCareerId: string;
  onSelectCareerId: (careerId: string) => void;
  onOpenLibraryForCareer: (careerId: string) => void;
  onToggleShortlist: (careerId: string) => Promise<void>;
  onToggleMilestone: (milestoneKey: string) => Promise<void>;
  onSelectStreamPreference: (streamLabel: string) => Promise<void>;
}

const STREAM_ACCENT_STROKE: Record<AcademicStreamId, string> = {
  science_pcm: '#142B46',
  science_pcb: '#0F766E',
  commerce: '#B45309',
  humanities: '#4338CA',
  vocational_interdisciplinary: '#0369A1',
};

function fitScoreColorClass(score: number): string {
  if (score >= 76) return 'text-emerald-700';
  if (score >= 62) return 'text-[#142B46]';
  if (score >= 48) return 'text-amber-700';
  return 'text-slate-600';
}

function fitBarColorClass(score: number): string {
  if (score >= 76) return 'bg-emerald-600';
  if (score >= 62) return 'bg-[#142B46]';
  if (score >= 48) return 'bg-amber-600';
  return 'bg-slate-400';
}

function truncateLabel(text: string, maxLen: number): string {
  const clean = text.trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trim()}…`;
}

export const CareerVisualRoadmapExplorer: React.FC<CareerVisualRoadmapExplorerProps> = ({
  data,
  activeStudent,
  activePlan,
  canEditPlan,
  savingPlan,
  selectedStudentId,
  onSelectStudentId,
  declaredInterestsText,
  onDeclaredInterestsChange,
  selectedCareerId,
  onSelectCareerId,
  onOpenLibraryForCareer,
  onToggleShortlist,
  onToggleMilestone,
  onSelectStreamPreference,
}) => {
  const [pinnedStreamId, setPinnedStreamId] = useState<AcademicStreamId | 'ALL'>('ALL');
  const [hoveredStreamId, setHoveredStreamId] = useState<AcademicStreamId | null>(null);
  const [hoveredCareerId, setHoveredCareerId] = useState<string | null>(null);
  const [roadmapMode, setRoadmapMode] = useState<'main' | 'backups'>('main');
  const [activeStageOrder, setActiveStageOrder] = useState<number>(1);

  const careers = data.careerProfiles || [];
  const completedSet = useMemo(
    () => new Set(activePlan?.completedMilestoneKeys || []),
    [activePlan?.completedMilestoneKeys],
  );
  const shortlistedSet = useMemo(
    () => new Set(activePlan?.shortlistedCareerIds || []),
    [activePlan?.shortlistedCareerIds],
  );

  const intelligenceMap = useMemo(() => {
    if (!activeStudent) return null;
    const interests = declaredInterestsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return buildStudentCareerIntelligenceMap({
      student: activeStudent,
      examMarks: data.examMarks || [],
      breakdown: data.studentBreakdowns?.[activeStudent.id],
      vcipAttempts: data.vcipAttempts || [],
      thinkingSessions: data.thinkingAssessments || [],
      computerSkillAttempts: data.computerSkillAttempts || [],
      profiles: careers,
      declaredInterests: interests,
    });
  }, [
    activeStudent,
    declaredInterestsText,
    data.examMarks,
    data.studentBreakdowns,
    data.vcipAttempts,
    data.thinkingAssessments,
    data.computerSkillAttempts,
    careers,
  ]);

  const visibleFlowCareers = useMemo(() => {
    if (!intelligenceMap) return [];
    const list =
      pinnedStreamId === 'ALL'
        ? intelligenceMap.careerMatches
        : intelligenceMap.careerMatches.filter((m) => m.primaryStreamId === pinnedStreamId);
    return list.slice(0, 6);
  }, [intelligenceMap, pinnedStreamId]);

  const selectedCareerMatch: MappedCareerPath | null = useMemo(() => {
    if (!intelligenceMap || intelligenceMap.careerMatches.length === 0) return null;
    const exact = intelligenceMap.careerMatches.find((m) => m.career.id === selectedCareerId);
    if (exact && (pinnedStreamId === 'ALL' || exact.primaryStreamId === pinnedStreamId)) {
      return exact;
    }
    return visibleFlowCareers[0] || intelligenceMap.careerMatches[0];
  }, [intelligenceMap, selectedCareerId, pinnedStreamId, visibleFlowCareers]);

  // Default focused roadmap stage to the student's current class stage when switching student/career
  useEffect(() => {
    if (selectedCareerMatch) {
      setActiveStageOrder(selectedCareerMatch.currentStageIndex);
    }
  }, [selectedCareerMatch?.career.id, activeStudent?.id]);

  if (!activeStudent || !intelligenceMap) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-2">
        <p className="text-sm font-semibold text-slate-900">No student profile available for career mapping</p>
        <p className="text-xs text-slate-600">
          Add or select an enrolled student record to generate assessment-linked academic and career roadmaps.
        </p>
      </div>
    );
  }

  const { snapshot, streamRecommendations } = intelligenceMap;
  const activeFocusStreamId: AcademicStreamId | null =
    hoveredStreamId ??
    (pinnedStreamId !== 'ALL' ? pinnedStreamId : selectedCareerMatch?.primaryStreamId ?? null);

  const selectedStageNode =
    selectedCareerMatch?.roadmapNodes.find((n) => n.order === activeStageOrder) ||
    selectedCareerMatch?.roadmapNodes[0] ||
    null;

  const isSelectedShortlisted = selectedCareerMatch
    ? shortlistedSet.has(selectedCareerMatch.career.id)
    : false;

  const selectedCareerCompletedCount = selectedCareerMatch
    ? selectedCareerMatch.roadmapNodes.reduce(
        (sum, n) => sum + n.milestones.filter((m) => completedSet.has(m.key)).length,
        0,
      )
    : 0;

  // SVG Pathway Map Layout Coordinates (viewBox 0 0 840 388)
  const studentNode = { x: 14, y: 146, w: 174, h: 96 };
  const streamNodes = streamRecommendations.map((stream, idx) => ({
    stream,
    x: 256,
    y: 16 + idx * 74,
    w: 204,
    h: 58,
  }));
  const careerNodes = visibleFlowCareers.map((match, idx) => {
    const count = Math.max(1, visibleFlowCareers.length);
    const totalHeight = 368;
    const nodeH = 50;
    const gap = count > 1 ? Math.min(12, Math.floor((totalHeight - count * nodeH) / (count - 1))) : 0;
    const blockH = count * nodeH + (count - 1) * gap;
    const startY = Math.round((388 - blockH) / 2);
    return {
      match,
      x: 536,
      y: startY + idx * (nodeH + gap),
      w: 290,
      h: nodeH,
    };
  });

  const streamPosById = new Map(streamNodes.map((n) => [n.stream.id, n]));

  return (
    <div className="space-y-5">
      {/* =====================================================================
          1. STUDENT CONTEXT BAR + 4-SIGNAL ASSESSMENT SNAPSHOT STRIP
      ====================================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="p-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
            <div className="min-w-[220px]">
              <label
                htmlFor="roadmap-student-select"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Student Profile
              </label>
              {data.students.length > 1 && data.user.role !== 'student' ? (
                <select
                  id="roadmap-student-select"
                  value={selectedStudentId}
                  onChange={(e) => onSelectStudentId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#142B46]"
                >
                  {data.students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} · Class {st.classSection}
                      {st.stream ? ` (${st.stream})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900">
                  {activeStudent.name} · Class {activeStudent.classSection}
                  {activeStudent.stream ? ` · ${activeStudent.stream}` : ''}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-[220px]">
              <label
                htmlFor="roadmap-interests-input"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Student Interests (refines ranking in real time)
              </label>
              <input
                id="roadmap-interests-input"
                type="text"
                value={declaredInterestsText}
                onChange={(e) => onDeclaredInterestsChange(e.target.value)}
                placeholder="e.g., Coding, Biology, Economics, Debate, Design, Defence"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#142B46]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs text-slate-600">
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {snapshot.activeSignalCount}/5
            </span>
            <span>assessment signals active</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {shortlistedSet.size}
            </span>
            <span>shortlisted</span>
          </div>
        </div>

        {/* 4-Column Hairline-Divided Assessment KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-4">
            <p className="text-xs text-slate-500">Academic Exam Average</p>
            <p className="mt-1 font-mono tabular-nums text-xl font-bold text-slate-900">
              {snapshot.overallExamAvgPct !== null ? `${snapshot.overallExamAvgPct}%` : 'Not recorded'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {snapshot.examCount > 0
                ? `${snapshot.examCount} exam record${snapshot.examCount === 1 ? '' : 's'} · ${snapshot.subjectAverages.length} subject${snapshot.subjectAverages.length === 1 ? '' : 's'}`
                : 'Awaiting subject exam marks'}
            </p>
          </div>

          <div className="p-4">
            <p className="text-xs text-slate-500">Cognitive Profile (VCIP)</p>
            <p className="mt-1 font-mono tabular-nums text-xl font-bold text-slate-900">
              {snapshot.vcipAvgScore !== null ? `${snapshot.vcipAvgScore} / 100` : 'Not recorded'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {snapshot.vcipAssessedDomains > 0
                ? `${snapshot.vcipAssessedDomains} of 6 reasoning domains assessed`
                : 'Complete VCIP domains to refine'}
            </p>
          </div>

          <div className="p-4">
            <p className="text-xs text-slate-500">Top Observed OLQ</p>
            <p className="mt-1 text-base font-bold text-slate-900 truncate">
              {snapshot.topOlqs[0] ? snapshot.topOlqs[0].name : 'Accumulating'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 font-mono tabular-nums">
              {snapshot.topOlqs[0]
                ? `Score ${snapshot.topOlqs[0].score}/100 · OLQ avg ${snapshot.olqAvgScore ?? '—'}`
                : '15-OLQ evidence pending'}
            </p>
          </div>

          <div className="p-4">
            <p className="text-xs text-slate-500">Thinking &amp; Digital Readiness</p>
            <p className="mt-1 font-mono tabular-nums text-xl font-bold text-slate-900">
              {snapshot.thinkingBetterScore !== null
                ? `${snapshot.thinkingBetterScore}/100`
                : snapshot.computerSkillScore !== null
                  ? `${snapshot.computerSkillScore}/100`
                  : 'Not recorded'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {[
                snapshot.thinkingSessionCount > 0
                  ? `${snapshot.thinkingSessionCount} Thinking Test${snapshot.thinkingSessionCount === 1 ? '' : 's'}`
                  : null,
                snapshot.computerSkillScore !== null
                  ? `Digital ${snapshot.computerSkillScore}/100`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'No Thinking or Computer tests yet'}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. ROW 1: ASSESSMENT FINGERPRINT RADAR + INTERACTIVE PATHWAY FLOW MAP
      ====================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left: 6-Axis Assessment Fingerprint + Subject Marks */}
        <section className="xl:col-span-4 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Assessment Fingerprint</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Six capability axes synthesized from recorded exams, VCIP, OLQs, Thinking, and digital tests.
            </p>

            <div className="mt-3 h-[236px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={snapshot.radarMetrics}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis
                    dataKey="shortLabel"
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    tickCount={4}
                  />
                  <Radar
                    name={activeStudent.name}
                    dataKey="score"
                    stroke="#142B46"
                    strokeWidth={2}
                    fill="#142B46"
                    fillOpacity={0.16}
                  />
                  <Tooltip
                    formatter={(value) => [`${value ?? 0} / 100`, 'Capability Index']}
                    contentStyle={{
                      borderRadius: '8px',
                      borderColor: '#CBD5E1',
                      fontSize: '12px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject-Wise Exam Breakdown */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Subject Exam Performance</h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {snapshot.subjectAverages.length} subjects
              </span>
            </div>

            {snapshot.subjectAverages.length > 0 ? (
              <div className="space-y-2">
                {snapshot.subjectAverages.slice(0, 6).map((subj) => (
                  <div key={subj.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium truncate pr-2">{subj.subject}</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900 shrink-0">
                        {subj.avgPct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${fitBarColorClass(subj.avgPct)}`}
                        style={{ width: `${subj.avgPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No subject-wise exam marks recorded yet for {activeStudent.name}. Enter marks in Marks &amp; Report Cards to activate subject-level weighting.
              </p>
            )}
          </div>
        </section>

        {/* Right: Interactive Assessment -> Academic Streams -> Career Paths SVG Flow Map */}
        <section className="xl:col-span-8 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Interactive Academic &amp; Career Pathway Map
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Click any academic stream to filter branches, or click a career path to inspect its stage-by-stage visual roadmap below.
              </p>
            </div>

            {/* Stream Filter Segmented Buttons */}
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setPinnedStreamId('ALL')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  pinnedStreamId === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Streams
              </button>
              {streamRecommendations.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() =>
                    setPinnedStreamId((prev) => (prev === st.id ? 'ALL' : st.id))
                  }
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    pinnedStreamId === st.id
                      ? 'bg-[#142B46] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Branching Map */}
          <div className="overflow-x-auto">
            <svg
              viewBox="0 0 840 388"
              className="w-full min-w-[680px] h-auto select-none"
              role="img"
              aria-label={`Interactive pathway map linking ${activeStudent.name}'s assessments to academic streams and career paths`}
            >
              {/* Column Labels */}
              <text x="14" y="10" fill="#64748B" fontSize="10" fontWeight="600">
                01. Student Profile
              </text>
              <text x="256" y="10" fill="#64748B" fontSize="10" fontWeight="600">
                02. Academic Streams (Ranked)
              </text>
              <text x="536" y="10" fill="#64748B" fontSize="10" fontWeight="600">
                03. Mapped Career Paths
              </text>

              {/* Bezier Links: Student Profile -> 5 Academic Streams */}
              {streamNodes.map((sn) => {
                const startX = studentNode.x + studentNode.w;
                const startY = studentNode.y + studentNode.h / 2;
                const endX = sn.x;
                const endY = sn.y + sn.h / 2;
                const midX = (startX + endX) / 2;
                const isHighlighted = activeFocusStreamId === sn.stream.id;
                const strokeColor = isHighlighted
                  ? STREAM_ACCENT_STROKE[sn.stream.id]
                  : '#CBD5E1';
                return (
                  <path
                    key={`edge-student-${sn.stream.id}`}
                    d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isHighlighted ? 2.6 : 1.35}
                    strokeOpacity={isHighlighted ? 0.95 : 0.65}
                  />
                );
              })}

              {/* Bezier Links: Academic Streams -> Mapped Careers */}
              {careerNodes.map((cn) => {
                const sourceStream = streamPosById.get(cn.match.primaryStreamId);
                if (!sourceStream) return null;
                const startX = sourceStream.x + sourceStream.w;
                const startY = sourceStream.y + sourceStream.h / 2;
                const endX = cn.x;
                const endY = cn.y + cn.h / 2;
                const midX = (startX + endX) / 2;
                const isSelectedCareer = selectedCareerMatch?.career.id === cn.match.career.id;
                const isHovered = hoveredCareerId === cn.match.career.id;
                const isStreamActive = activeFocusStreamId === cn.match.primaryStreamId;
                const highlighted = isSelectedCareer || isHovered || isStreamActive;
                return (
                  <path
                    key={`edge-career-${cn.match.career.id}`}
                    d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke={
                      isSelectedCareer
                        ? '#142B46'
                        : highlighted
                          ? STREAM_ACCENT_STROKE[cn.match.primaryStreamId]
                          : '#CBD5E1'
                    }
                    strokeWidth={isSelectedCareer ? 2.8 : highlighted ? 2 : 1.2}
                    strokeOpacity={isSelectedCareer ? 1 : highlighted ? 0.8 : 0.5}
                  />
                );
              })}

              {/* Node Column 1: Student Assessment Source Card */}
              <g>
                <rect
                  x={studentNode.x}
                  y={studentNode.y}
                  width={studentNode.w}
                  height={studentNode.h}
                  rx="10"
                  fill="#142B46"
                />
                <text
                  x={studentNode.x + 14}
                  y={studentNode.y + 26}
                  fill="#D6B66D"
                  fontSize="10"
                  fontWeight="600"
                >
                  {snapshot.classLabel}
                </text>
                <text
                  x={studentNode.x + 14}
                  y={studentNode.y + 46}
                  fill="#FFFFFF"
                  fontSize="13"
                  fontWeight="700"
                >
                  {truncateLabel(activeStudent.name, 19)}
                </text>
                <text
                  x={studentNode.x + 14}
                  y={studentNode.y + 66}
                  fill="#CBD5E1"
                  fontSize="10.5"
                >
                  {snapshot.overallExamAvgPct !== null
                    ? `Exams ${snapshot.overallExamAvgPct}%`
                    : 'Exams pending'}
                  {snapshot.vcipAvgScore !== null ? ` · VCIP ${snapshot.vcipAvgScore}` : ''}
                </text>
                <text
                  x={studentNode.x + 14}
                  y={studentNode.y + 82}
                  fill="#94A3B8"
                  fontSize="10"
                >
                  {snapshot.activeSignalCount} of 5 signals active
                </text>
              </g>

              {/* Node Column 2: 5 Academic Streams */}
              {streamNodes.map(({ stream, x, y, w, h }) => {
                const isPinned = pinnedStreamId === stream.id;
                const isActive = activeFocusStreamId === stream.id;
                const stroke = isPinned
                  ? '#142B46'
                  : isActive
                    ? STREAM_ACCENT_STROKE[stream.id]
                    : '#CBD5E1';
                return (
                  <g
                    key={stream.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer focus:outline-none"
                    onMouseEnter={() => setHoveredStreamId(stream.id)}
                    onMouseLeave={() => setHoveredStreamId(null)}
                    onClick={() =>
                      setPinnedStreamId((prev) => (prev === stream.id ? 'ALL' : stream.id))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setPinnedStreamId((prev) => (prev === stream.id ? 'ALL' : stream.id));
                      }
                    }}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx="9"
                      fill={isPinned ? '#F1F5F9' : '#FFFFFF'}
                      stroke={stroke}
                      strokeWidth={isPinned || isActive ? 2 : 1}
                    />
                    <text
                      x={x + 12}
                      y={y + 22}
                      fill="#0F172A"
                      fontSize="11.5"
                      fontWeight="700"
                    >
                      {truncateLabel(stream.label, 22)}
                    </text>
                    <text
                      x={x + w - 12}
                      y={y + 22}
                      textAnchor="end"
                      fill={stream.fitScore >= 75 ? '#047857' : '#142B46'}
                      fontSize="12"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {stream.fitScore}%
                    </text>
                    <text x={x + 12} y={y + 40} fill="#64748B" fontSize="9.8">
                      {truncateLabel(stream.subjectsSummary, 31)}
                    </text>
                    {/* Subtle bottom fit progress hairline */}
                    <rect
                      x={x + 12}
                      y={y + h - 8}
                      width={w - 24}
                      height="3"
                      rx="1.5"
                      fill="#E2E8F0"
                    />
                    <rect
                      x={x + 12}
                      y={y + h - 8}
                      width={Math.max(8, Math.round(((w - 24) * stream.fitScore) / 100))}
                      height="3"
                      rx="1.5"
                      fill={STREAM_ACCENT_STROKE[stream.id]}
                    />
                  </g>
                );
              })}

              {/* Node Column 3: Top Mapped Career Paths */}
              {careerNodes.map(({ match, x, y, w, h }) => {
                const isSelected = selectedCareerMatch?.career.id === match.career.id;
                const isShortlisted = shortlistedSet.has(match.career.id);
                const shortTitle = match.career.title.split('(')[0].trim();
                return (
                  <g
                    key={match.career.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer focus:outline-none"
                    onMouseEnter={() => {
                      setHoveredCareerId(match.career.id);
                      setHoveredStreamId(match.primaryStreamId);
                    }}
                    onMouseLeave={() => {
                      setHoveredCareerId(null);
                      setHoveredStreamId(null);
                    }}
                    onClick={() => {
                      onSelectCareerId(match.career.id);
                      setRoadmapMode('main');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectCareerId(match.career.id);
                        setRoadmapMode('main');
                      }
                    }}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx="9"
                      fill={isSelected ? '#142B46' : '#FFFFFF'}
                      stroke={isSelected ? '#142B46' : '#CBD5E1'}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={x + 12}
                      y={y + 20}
                      fill={isSelected ? '#FFFFFF' : '#0F172A'}
                      fontSize="11.5"
                      fontWeight="700"
                    >
                      {truncateLabel(shortTitle, 28)}
                    </text>
                    <text
                      x={x + w - 12}
                      y={y + 20}
                      textAnchor="end"
                      fill={isSelected ? '#D6B66D' : match.overallFitScore >= 75 ? '#047857' : '#142B46'}
                      fontSize="12"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {match.overallFitScore}%
                    </text>
                    <text
                      x={x + 12}
                      y={y + 37}
                      fill={isSelected ? '#CBD5E1' : '#64748B'}
                      fontSize="9.8"
                    >
                      {match.fitBand} · {match.primaryStreamLabel}
                      {isShortlisted ? ' · Shortlisted' : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Stream Preference Action Row */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div>
              Top-ranked stream for {activeStudent.name}:{' '}
              <strong className="text-slate-900">{streamRecommendations[0]?.label}</strong>
              <span aria-hidden="true"> · </span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {streamRecommendations[0]?.fitScore}% alignment
              </span>
              {activePlan?.selectedStreamPreference && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="text-emerald-700 font-medium">
                    Saved preference: {activePlan.selectedStreamPreference}
                  </span>
                </>
              )}
            </div>
            {canEditPlan && streamRecommendations[0] && (
              <button
                type="button"
                disabled={savingPlan}
                onClick={() =>
                  void onSelectStreamPreference(
                    pinnedStreamId !== 'ALL'
                      ? streamRecommendations.find((s) => s.id === pinnedStreamId)?.label ||
                          streamRecommendations[0].label
                      : streamRecommendations[0].label,
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                Save Stream Preference
              </button>
            )}
          </div>
        </section>
      </div>

      {/* =====================================================================
          3. ROW 2: INTERACTIVE VISUAL MILESTONE ROADMAP FOR SELECTED CAREER
      ====================================================================== */}
      {selectedCareerMatch && (
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {/* Career Roadmap Header */}
          <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-[#142B46]">
                  {selectedCareerMatch.primaryStreamLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span>{selectedCareerMatch.career.entryStage}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedCareerMatch.career.budgetTier}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedCareerMatch.career.locationScope}</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {selectedCareerMatch.career.title}
                </h2>
                <span
                  className={`font-mono tabular-nums text-sm font-bold ${fitScoreColorClass(
                    selectedCareerMatch.overallFitScore,
                  )}`}
                >
                  {selectedCareerMatch.overallFitScore}% · {selectedCareerMatch.fitBand}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setRoadmapMode('main')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    roadmapMode === 'main'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Main Pathway ({selectedCareerMatch.roadmapNodes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoadmapMode('backups')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    roadmapMode === 'backups'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Parallel Backups ({selectedCareerMatch.backupBranches.length})
                </button>
              </div>

              {canEditPlan && (
                <button
                  type="button"
                  disabled={savingPlan}
                  onClick={() => void onToggleShortlist(selectedCareerMatch.career.id)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors disabled:opacity-50 ${
                    isSelectedShortlisted
                      ? 'border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-[#142B46] text-white hover:bg-[#1e3d62]'
                  }`}
                >
                  {isSelectedShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenLibraryForCareer(selectedCareerMatch.career.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#142B46]" />
                9-Section Guide
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 print:hidden"
              >
                <Printer className="h-3.5 w-3.5 text-slate-600" />
                Print
              </button>
            </div>
          </div>

          {/* Transparent Multi-Assessment Fit Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/50">
            <div className="lg:col-span-7 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">
                  How Assessment Signals Map to This Career
                </h3>
                <span className="text-xs text-slate-500">
                  Dynamic weights across recorded signals
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {selectedCareerMatch.signals.map((sig) => (
                  <div key={sig.id} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-800">{sig.label}</span>
                      <span className="font-mono tabular-nums text-slate-700 shrink-0">
                        {sig.score !== null ? `${sig.score}/100` : 'Not recorded'}
                        {sig.weightPct > 0 ? ` · ${sig.weightPct}% wt` : ''}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sig.score !== null ? fitBarColorClass(sig.score) : 'bg-slate-300'
                        }`}
                        style={{ width: `${sig.score ?? 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{sig.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-900">Assessment Evidence Observed</h3>
                <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                  {selectedCareerMatch.matchedEvidence.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-slate-200 sm:border-t-0 sm:pt-0 lg:border-t lg:pt-3">
                <h3 className="text-xs font-bold text-slate-900">Developmental Focus Areas</h3>
                <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                  {selectedCareerMatch.growthFocusAreas.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Roadmap Canvas: Main 6-Stage Timeline OR Parallel Backup Branches */}
          {roadmapMode === 'main' ? (
            <div className="p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Stage-by-Stage Visual Roadmap ({snapshot.classLabel} → Target Career)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select any stage node to inspect entrance exams, resources, and check off readiness milestones.
                  </p>
                </div>
                <div className="text-xs text-slate-600 font-mono tabular-nums">
                  Checklist progress:{' '}
                  <strong className="text-slate-900">
                    {selectedCareerCompletedCount}/{selectedCareerMatch.totalMilestones}
                  </strong>{' '}
                  milestones ready
                </div>
              </div>

              {/* 6-Stage Connected Visual Timeline Track */}
              <div className="relative">
                {/* Connecting Track Rail (desktop) */}
                <div
                  className="hidden lg:block absolute top-6 left-10 right-10 h-0.5 bg-slate-200"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 relative">
                  {selectedCareerMatch.roadmapNodes.map((node) => {
                    const isFocused = selectedStageNode?.id === node.id;
                    const doneCount = node.milestones.filter((m) => completedSet.has(m.key)).length;
                    const allDone = node.milestones.length > 0 && doneCount === node.milestones.length;

                    const statusLabel =
                      node.status === 'current'
                        ? `Current · ${snapshot.classLabel}`
                        : node.status === 'completed'
                          ? 'Completed Stage'
                          : node.status === 'destination'
                            ? 'Destination'
                            : 'Upcoming Stage';

                    const nodeCircleClass =
                      node.status === 'completed' || allDone
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : node.status === 'current'
                          ? 'bg-[#142B46] text-white border-[#142B46] ring-4 ring-[#142B46]/15'
                          : node.status === 'destination'
                            ? 'bg-[#D6B66D] text-[#142B46] border-[#D6B66D]'
                            : 'bg-white text-slate-700 border-slate-300';

                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setActiveStageOrder(node.order)}
                        className={`text-left rounded-xl border p-3.5 transition-colors flex flex-col justify-between gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#142B46] ${
                          isFocused
                            ? 'border-[#142B46] bg-slate-50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`h-8 w-8 rounded-full border-2 inline-flex items-center justify-center text-xs font-mono font-bold shrink-0 ${nodeCircleClass}`}
                            >
                              {node.status === 'completed' || allDone ? (
                                <Check className="h-4 w-4" />
                              ) : node.status === 'destination' ? (
                                <Flag className="h-3.5 w-3.5" />
                              ) : (
                                `0${node.order + 1}`
                              )}
                            </span>
                            <span
                              className={`text-[11px] font-semibold ${
                                node.status === 'current'
                                  ? 'text-[#142B46]'
                                  : node.status === 'completed'
                                    ? 'text-emerald-700'
                                    : node.status === 'destination'
                                      ? 'text-amber-700'
                                      : 'text-slate-500'
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-snug">
                              {node.stageTitle}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{node.phaseLabel}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 truncate pr-1">{node.timeline}</span>
                          <span className="font-mono tabular-nums font-semibold text-slate-800 shrink-0">
                            {doneCount}/{node.milestones.length}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Stage Inspector & Interactive Readiness Checklist */}
              {selectedStageNode && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono tabular-nums font-semibold text-[#142B46]">
                          Stage 0{selectedStageNode.order + 1}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{selectedStageNode.phaseLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{selectedStageNode.timeline}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        {selectedStageNode.stageTitle}
                      </h4>
                    </div>

                    {selectedStageNode.costHint && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums font-semibold text-[#142B46]">
                        <IndianRupee className="h-3.5 w-3.5" />
                        <span>{selectedStageNode.costHint}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: Checkable Readiness Milestones */}
                    <div className="lg:col-span-6 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-[#142B46]" />
                          Interactive Readiness Checklist
                        </h5>
                        {!canEditPlan && (
                          <span className="text-[11px] text-slate-500">View only</span>
                        )}
                      </div>

                      <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                        {selectedStageNode.milestones.map((ms) => {
                          const checked = completedSet.has(ms.key);
                          return (
                            <label
                              key={ms.key}
                              className={`flex items-start gap-3 p-3 text-xs ${
                                canEditPlan ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={!canEditPlan || savingPlan}
                                onChange={() => void onToggleMilestone(ms.key)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#142B46] focus:ring-[#142B46]"
                              />
                              <span
                                className={
                                  checked
                                    ? 'text-slate-500 line-through'
                                    : 'text-slate-800 font-medium'
                                }
                              >
                                {ms.text}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Exams / Credentials, Action Steps & Resources */}
                    <div className="lg:col-span-6 space-y-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-[#142B46]" />
                          Key Exams, Credentials &amp; Directions
                        </h5>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {selectedStageNode.examsOrCredentials.length > 0
                            ? selectedStageNode.examsOrCredentials.join(' · ')
                            : 'Focus on conceptual board mastery and portfolio building.'}
                        </p>
                      </div>

                      {selectedStageNode.actionItems.length > 0 && (
                        <div className="pt-3 border-t border-slate-200">
                          <h5 className="text-xs font-bold text-slate-900 mb-1.5">
                            Recommended Stage Actions
                          </h5>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                            {selectedStageNode.actionItems.map((act, i) => (
                              <li key={i}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedStageNode.recommendedResources.length > 0 && (
                        <div className="pt-3 border-t border-slate-200">
                          <h5 className="text-xs font-bold text-slate-900 mb-1.5">
                            {selectedStageNode.status === 'destination'
                              ? 'Major Indian & Global Hubs'
                              : 'Starter Books, Projects & Exposure'}
                          </h5>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {selectedStageNode.recommendedResources.join(' · ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Parallel Backup Tracks Visual Branch View */
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <GitBranch className="h-4 w-4 text-[#142B46]" />
                    Parallel Backup &amp; Adjacent Pathways
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    High-competition paths always pair with realistic parallel branches using overlapping subjects and skills.
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  Primary track: {selectedCareerMatch.career.title.split('(')[0].trim()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCareerMatch.backupBranches.map((branch, idx) => (
                  <div
                    key={branch.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono tabular-nums font-semibold text-[#142B46]">
                          Plan B-0{idx + 1}
                        </span>
                        <span>{branch.entryStage}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{branch.title}</h4>
                      <p className="text-xs text-slate-700 leading-relaxed">{branch.summary}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Shares overlapping foundation with primary stream</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs text-slate-700 flex items-start gap-2.5">
                <Compass className="h-4 w-4 text-[#142B46] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Preparation Reality: </strong>
                  {selectedCareerMatch.career.competitionAnalysis.preparationReality}
                </div>
              </div>
            </div>
          )}

          {/* Non-Exclusionary Guidance Footer */}
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#142B46] shrink-0" />
              <span>
                Exploratory &amp; developmental guidance only — assessment fit scores never disqualify or restrict a student from pursuing any academic stream or career.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpenLibraryForCareer(selectedCareerMatch.career.id)}
              className="inline-flex items-center gap-1 font-semibold text-[#142B46] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Inspect full 9-section dossier</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
