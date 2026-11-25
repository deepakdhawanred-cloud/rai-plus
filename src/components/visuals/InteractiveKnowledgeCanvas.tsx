import React, { useMemo, useRef, useState } from 'react';
import {
  Download,
  GitBranch,
  Maximize2,
  Network,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type {
  FlowchartStage,
  MindmapBranch,
} from '../../utils/chapterVisualStudyEngine';
import {
  FLOWCHART_CANVAS,
  MINDMAP_CANVAS,
  clampZoomLevel,
  computeFlowchartLayout,
  computeMindmapLayout,
  truncateLabel,
} from '../../utils/knowledgeVisualGraph';

export type KnowledgeVisualMode = 'mindmap' | 'flowchart';

interface InteractiveKnowledgeCanvasProps {
  mode: KnowledgeVisualMode;
  onModeChange: (mode: KnowledgeVisualMode) => void;
  chapterTitle: string;
  chapterSubtitle: string;
  branches: MindmapBranch[];
  stages: FlowchartStage[];
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
  selectedStageId: string;
  onSelectStage: (stageId: string) => void;
}

const MINDMAP_COLORS: Record<
  MindmapBranch['colorKey'],
  { fill: string; stroke: string; title: string; dot: string }
> = {
  blue: { fill: '#EFF6FF', stroke: '#2563EB', title: '#1E3A8A', dot: '#2563EB' },
  emerald: { fill: '#ECFDF5', stroke: '#059669', title: '#064E3B', dot: '#059669' },
  amber: { fill: '#FFFBEB', stroke: '#D97706', title: '#78350F', dot: '#D97706' },
  violet: { fill: '#F5F3FF', stroke: '#7C3AED', title: '#4C1D95', dot: '#7C3AED' },
  rose: { fill: '#FFF1F2', stroke: '#E11D48', title: '#881337', dot: '#E11D48' },
};

const STAGE_COLORS: Record<
  FlowchartStage['nodeType'],
  { fill: string; stroke: string; badge: string; label: string }
> = {
  start: { fill: '#EFF6FF', stroke: '#2563EB', badge: '#1E40AF', label: 'START' },
  concept: { fill: '#FFFFFF', stroke: '#475569', badge: '#334155', label: 'CONCEPTS' },
  decision: { fill: '#FFFBEB', stroke: '#D97706', badge: '#92400E', label: 'DECISION / PROCESS' },
  application: { fill: '#F5F3FF', stroke: '#7C3AED', badge: '#5B21B6', label: 'APPLICATION' },
  checkpoint: { fill: '#ECFDF5', stroke: '#059669', badge: '#065F46', label: 'MASTERY CHECK' },
};

export const InteractiveKnowledgeCanvas: React.FC<InteractiveKnowledgeCanvasProps> = ({
  mode,
  onModeChange,
  chapterTitle,
  chapterSubtitle,
  branches,
  stages,
  selectedBranchId,
  onSelectBranch,
  selectedStageId,
  onSelectStage,
}) => {
  const [zoom, setZoom] = useState(1);
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const mindmapNodes = useMemo(() => computeMindmapLayout(branches), [branches]);
  const flowchartLayout = useMemo(() => computeFlowchartLayout(stages), [stages]);

  const activeBranch =
    branches.find((b) => b.id === selectedBranchId) || branches[0] || null;
  const activeStage =
    stages.find((s) => s.id === selectedStageId) || stages[0] || null;

  function handleDownloadSvg() {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const raw = serializer.serializeToString(svgEl);
    const blob = new Blob([raw], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const cleanName = chapterTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    link.href = url;
    link.download = `${cleanName || 'chapter'}-${mode}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      {/* Canvas Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          role="tablist"
          aria-label="Knowledge visualization mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'mindmap'}
            onClick={() => onModeChange('mindmap')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              mode === 'mindmap'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network className="h-3.5 w-3.5 shrink-0" />
            Knowledge Mindmap
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'flowchart'}
            onClick={() => onModeChange('flowchart')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              mode === 'flowchart'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5 shrink-0" />
            Flowchart Summary
          </button>
        </div>

        {/* Zoom & SVG Export Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => clampZoomLevel(z - 0.15))}
            aria-label="Zoom out diagram"
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[44px] text-center font-mono text-xs font-semibold text-slate-600 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => clampZoomLevel(z + 0.15))}
            aria-label="Zoom in diagram"
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            aria-label="Reset diagram zoom"
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 ml-1"
          >
            <Download className="h-3.5 w-3.5" />
            Export SVG
          </button>
        </div>
      </div>

      {/* Interactive SVG Viewport */}
      <div
        className="overflow-auto rounded-lg border border-slate-200 bg-slate-50/70 p-3"
        data-testid={mode === 'mindmap' ? 'knowledge-mindmap-svg' : 'knowledge-flowchart-svg'}
      >
        {mode === 'mindmap' ? (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${MINDMAP_CANVAS.width} ${MINDMAP_CANVAS.height}`}
            style={{ width: `${Math.round(zoom * 100)}%`, minWidth: '680px' }}
            className="h-auto block mx-auto transition-all"
            role="img"
            aria-label={`Interactive Knowledge Mindmap for ${chapterTitle}`}
          >
            <defs>
              <pattern id="arMindmapDots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#CBD5E1" opacity="0.65" />
              </pattern>
            </defs>
            <rect
              width={MINDMAP_CANVAS.width}
              height={MINDMAP_CANVAS.height}
              rx="10"
              fill="url(#arMindmapDots)"
            />

            {/* Bezier Connectors */}
            {mindmapNodes.map((node) => {
              const palette = MINDMAP_COLORS[node.branch.colorKey] || MINDMAP_COLORS.blue;
              const isSelected = activeBranch?.id === node.branch.id;
              return (
                <g key={`edge-${node.branch.id}`}>
                  <path
                    d={node.pathD}
                    fill="none"
                    stroke={palette.stroke}
                    strokeWidth={isSelected ? 3.2 : 2}
                    strokeOpacity={isSelected ? 0.95 : 0.45}
                  />
                  <circle
                    cx={node.anchorPoint.x}
                    cy={node.anchorPoint.y}
                    r={isSelected ? 4.5 : 3}
                    fill={palette.dot}
                  />
                </g>
              );
            })}

            {/* Central Hub */}
            <g>
              <rect
                x={MINDMAP_CANVAS.hubX}
                y={MINDMAP_CANVAS.hubY}
                width={MINDMAP_CANVAS.hubW}
                height={MINDMAP_CANVAS.hubH}
                rx="14"
                fill="#0F172A"
                stroke="#1E293B"
                strokeWidth="2"
              />
              <text
                x={MINDMAP_CANVAS.hubX + MINDMAP_CANVAS.hubW / 2}
                y={MINDMAP_CANVAS.hubY + 32}
                textAnchor="middle"
                fill="#93C5FD"
                fontSize="11"
                fontWeight="600"
              >
                {truncateLabel(chapterSubtitle, 36)}
              </text>
              <text
                x={MINDMAP_CANVAS.hubX + MINDMAP_CANVAS.hubW / 2}
                y={MINDMAP_CANVAS.hubY + 60}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="15"
                fontWeight="700"
              >
                {truncateLabel(chapterTitle, 28)}
              </text>
              <text
                x={MINDMAP_CANVAS.hubX + MINDMAP_CANVAS.hubW / 2}
                y={MINDMAP_CANVAS.hubY + 86}
                textAnchor="middle"
                fill="#CBD5E1"
                fontSize="11"
              >
                Click any branch node to inspect
              </text>
            </g>

            {/* Radial Branch Nodes */}
            {mindmapNodes.map((node) => {
              const palette = MINDMAP_COLORS[node.branch.colorKey] || MINDMAP_COLORS.blue;
              const isSelected = activeBranch?.id === node.branch.id;
              return (
                <g
                  key={node.branch.id}
                  onClick={() => onSelectBranch(node.branch.id)}
                  className="cursor-pointer"
                >
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx="10"
                    fill={isSelected ? palette.fill : '#FFFFFF'}
                    stroke={palette.stroke}
                    strokeWidth={isSelected ? 2.6 : 1.4}
                  />
                  <text
                    x={node.x + 14}
                    y={node.y + 24}
                    fill={palette.title}
                    fontSize="12.5"
                    fontWeight="700"
                  >
                    {truncateLabel(node.branch.title, 28)}
                  </text>
                  {node.branch.subNodes.slice(0, 3).map((sub, idx) => (
                    <text
                      key={`${node.branch.id}-s-${idx}`}
                      x={node.x + 14}
                      y={node.y + 47 + idx * 19}
                      fill="#334155"
                      fontSize="11"
                    >
                      • {truncateLabel(sub, 34)}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${FLOWCHART_CANVAS.width} ${flowchartLayout.totalHeight}`}
            style={{ width: `${Math.round(zoom * 100)}%`, minWidth: '640px' }}
            className="h-auto block mx-auto transition-all"
            role="img"
            aria-label={`Interactive Concept Flowchart for ${chapterTitle}`}
          >
            <defs>
              <pattern id="arFlowDots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#CBD5E1" opacity="0.55" />
              </pattern>
              <marker
                id="arArrowHead"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 9 3.5, 0 7" fill="#64748B" />
              </marker>
            </defs>
            <rect
              width={FLOWCHART_CANVAS.width}
              height={flowchartLayout.totalHeight}
              rx="10"
              fill="url(#arFlowDots)"
            />

            {/* Flowchart Connectors + Labels */}
            {flowchartLayout.nodes.map((node) => {
              if (!node.connectorPathD || node.connectorMidY === null) return null;
              return (
                <g key={`flow-edge-${node.stage.id}`}>
                  <path
                    d={node.connectorPathD}
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2"
                    markerEnd="url(#arArrowHead)"
                  />
                  <rect
                    x={node.centerX - 108}
                    y={node.connectorMidY - 12}
                    width="216"
                    height="22"
                    rx="6"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <text
                    x={node.centerX}
                    y={node.connectorMidY + 3}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="10.5"
                    fontWeight="600"
                  >
                    {truncateLabel(node.stage.connectorLabel, 32)}
                  </text>
                </g>
              );
            })}

            {/* Flowchart Geometric Nodes */}
            {flowchartLayout.nodes.map((node) => {
              const palette = STAGE_COLORS[node.stage.nodeType] || STAGE_COLORS.concept;
              const isSelected = activeStage?.id === node.stage.id;
              const rx =
                node.stage.nodeType === 'start' || node.stage.nodeType === 'checkpoint'
                  ? 38
                  : node.stage.nodeType === 'decision'
                    ? 6
                    : 12;

              return (
                <g
                  key={node.stage.id}
                  onClick={() => {
                    onSelectStage(node.stage.id);
                    setRevealedAnswer(false);
                  }}
                  className="cursor-pointer"
                >
                  {/* Side Diamond Accent for Decision Gate */}
                  {node.stage.nodeType === 'decision' && (
                    <polygon
                      points={`${node.x - 14},${node.y + node.height / 2} ${node.x},${node.y + node.height / 2 - 14} ${node.x + 14},${node.y + node.height / 2} ${node.x},${node.y + node.height / 2 + 14}`}
                      fill="#FEF3C7"
                      stroke="#D97706"
                      strokeWidth="1.5"
                    />
                  )}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={rx}
                    fill={isSelected ? palette.fill : '#FFFFFF'}
                    stroke={palette.stroke}
                    strokeWidth={isSelected ? 2.8 : 1.5}
                  />
                  <text
                    x={node.x + 24}
                    y={node.y + 24}
                    fill={palette.badge}
                    fontSize="10.5"
                    fontWeight="700"
                  >
                    STEP 0{node.stage.stepNumber} · {palette.label}
                  </text>
                  <text
                    x={node.x + 24}
                    y={node.y + 47}
                    fill="#0F172A"
                    fontSize="13.5"
                    fontWeight="700"
                  >
                    {truncateLabel(node.stage.title, 54)}
                  </text>
                  <text
                    x={node.x + 24}
                    y={node.y + 70}
                    fill="#475569"
                    fontSize="11.5"
                  >
                    {truncateLabel(node.stage.headline, 66)}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Interactive Node Detail Inspector */}
      {mode === 'mindmap' && activeBranch && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => onSelectBranch(branch.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border ${
                  branch.id === activeBranch.id
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {branch.title}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900">{activeBranch.title}</h4>
              <span className="text-xs text-slate-500">
                {activeBranch.subNodes.length} concept sub-nodes
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{activeBranch.summary}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {activeBranch.subNodes.map((sub, idx) => (
                <li
                  key={idx}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                >
                  {idx + 1}. {sub}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {mode === 'flowchart' && activeStage && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {stages.map((stage) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  onSelectStage(stage.id);
                  setRevealedAnswer(false);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border ${
                  stage.id === activeStage.id
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Step 0{stage.stepNumber}: {truncateLabel(stage.title, 22)}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                Step 0{activeStage.stepNumber} — {activeStage.title}
              </h4>
              <span className="text-xs text-slate-500">
                Next transition: {activeStage.connectorLabel}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{activeStage.headline}</p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {activeStage.details.map((line, idx) => (
                <li key={idx} className="leading-relaxed">
                  • {line}
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-700">
                  Self-Check: {activeStage.keyQuestion}
                </p>
                <button
                  type="button"
                  onClick={() => setRevealedAnswer((v) => !v)}
                  className="text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap shrink-0"
                >
                  {revealedAnswer ? 'Hide Key Answer' : 'Reveal Key Answer'}
                </button>
              </div>
              {revealedAnswer && (
                <p className="rounded-md border border-blue-200 bg-white px-3 py-2 text-xs text-slate-800">
                  {activeStage.quickAnswer}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
