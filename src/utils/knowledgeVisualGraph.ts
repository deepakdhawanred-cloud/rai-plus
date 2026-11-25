import type {
  ChapterVisualStudyPack,
  FlowchartStage,
  MindmapBranch,
} from './chapterVisualStudyEngine';

export interface SvgPoint {
  x: number;
  y: number;
}

export interface MindmapNodeLayout {
  branch: MindmapBranch;
  x: number;
  y: number;
  width: number;
  height: number;
  align: 'left' | 'right';
  pathD: string;
  anchorPoint: SvgPoint;
}

export interface FlowchartNodeLayout {
  stage: FlowchartStage;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  bottomY: number;
  topY: number;
  connectorPathD: string | null;
  connectorMidY: number | null;
}

export interface AiChapterVisualResult {
  chapterId: string;
  centralIdea: string;
  mindmapBranches: MindmapBranch[];
  flowchartStages: FlowchartStage[];
  quickSummaryTakeaways: string[];
  model: string;
  generatedAt: string;
  focusPrompt?: string;
}

const VALID_COLOR_KEYS: MindmapBranch['colorKey'][] = [
  'blue',
  'emerald',
  'amber',
  'violet',
  'rose',
];

const VALID_NODE_TYPES: FlowchartStage['nodeType'][] = [
  'start',
  'concept',
  'decision',
  'application',
  'checkpoint',
];

export const MINDMAP_CANVAS = {
  width: 960,
  height: 500,
  hubX: 350,
  hubY: 196,
  hubW: 260,
  hubH: 108,
} as const;

export const FLOWCHART_CANVAS = {
  width: 920,
  nodeWidth: 520,
  nodeHeight: 92,
  gapY: 54,
  startY: 28,
} as const;

export function computeMindmapLayout(branches: MindmapBranch[]): MindmapNodeLayout[] {
  const slots: Array<{ cx: number; cy: number; align: 'left' | 'right' }> = [
    { cx: 148, cy: 136, align: 'left' },
    { cx: 812, cy: 86, align: 'right' },
    { cx: 812, cy: 250, align: 'right' },
    { cx: 812, cy: 414, align: 'right' },
    { cx: 148, cy: 364, align: 'left' },
  ];

  const boxW = 256;
  const boxH = 110;
  const hubLeftX = MINDMAP_CANVAS.hubX;
  const hubRightX = MINDMAP_CANVAS.hubX + MINDMAP_CANVAS.hubW;
  const hubCenterY = MINDMAP_CANVAS.hubY + MINDMAP_CANVAS.hubH / 2;

  return branches.slice(0, 5).map((branch, idx) => {
    const slot = slots[idx] || slots[0];
    const x = slot.cx - boxW / 2;
    const y = slot.cy - boxH / 2;
    const startX = slot.align === 'left' ? hubLeftX : hubRightX;
    const endX = slot.align === 'left' ? x + boxW : x;
    const ctrlX = Math.round((startX + endX) / 2);

    return {
      branch,
      x,
      y,
      width: boxW,
      height: boxH,
      align: slot.align,
      pathD: `M ${startX} ${hubCenterY} C ${ctrlX} ${hubCenterY}, ${ctrlX} ${slot.cy}, ${endX} ${slot.cy}`,
      anchorPoint: { x: endX, y: slot.cy },
    };
  });
}

export function computeFlowchartLayout(stages: FlowchartStage[]): {
  nodes: FlowchartNodeLayout[];
  totalHeight: number;
} {
  const { width, nodeWidth, nodeHeight, gapY, startY } = FLOWCHART_CANVAS;
  const x = Math.round((width - nodeWidth) / 2);
  const centerX = Math.round(width / 2);

  const nodes: FlowchartNodeLayout[] = stages.map((stage, idx) => {
    const y = startY + idx * (nodeHeight + gapY);
    const bottomY = y + nodeHeight;
    const hasNext = idx < stages.length - 1;
    const nextTopY = bottomY + gapY;

    return {
      stage,
      x,
      y,
      width: nodeWidth,
      height: nodeHeight,
      centerX,
      bottomY,
      topY: y,
      connectorPathD: hasNext ? `M ${centerX} ${bottomY} L ${centerX} ${nextTopY - 8}` : null,
      connectorMidY: hasNext ? Math.round(bottomY + gapY / 2) : null,
    };
  });

  const totalHeight =
    nodes.length > 0 ? nodes[nodes.length - 1].bottomY + 34 : 240;

  return { nodes, totalHeight };
}

export function normalizeAiChapterVisualPayload(
  raw: unknown,
  fallbackPack: ChapterVisualStudyPack,
  meta: { model: string; generatedAt: string; focusPrompt?: string },
): AiChapterVisualResult {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const centralIdea =
    typeof obj.centralIdea === 'string' && obj.centralIdea.trim().length > 12
      ? obj.centralIdea.trim()
      : fallbackPack.centralIdea;

  const rawBranches = Array.isArray(obj.mindmapBranches) ? obj.mindmapBranches : [];
  const mindmapBranches: MindmapBranch[] = fallbackPack.mindmap.branches.map((fb, idx) => {
    const candidate = rawBranches[idx] as Record<string, unknown> | undefined;
    if (!candidate || typeof candidate !== 'object') return fb;
    const title =
      typeof candidate.title === 'string' && candidate.title.trim()
        ? candidate.title.trim()
        : fb.title;
    const summary =
      typeof candidate.summary === 'string' && candidate.summary.trim()
        ? candidate.summary.trim()
        : fb.summary;
    const subNodes = Array.isArray(candidate.subNodes)
      ? candidate.subNodes
          .map((s) => String(s || '').trim())
          .filter(Boolean)
          .slice(0, 4)
      : [];
    const colorKey = VALID_COLOR_KEYS.includes(candidate.colorKey as MindmapBranch['colorKey'])
      ? (candidate.colorKey as MindmapBranch['colorKey'])
      : VALID_COLOR_KEYS[idx % VALID_COLOR_KEYS.length];

    return {
      id: `ai_branch_${idx + 1}`,
      title,
      colorKey,
      summary,
      subNodes: subNodes.length >= 2 ? subNodes : fb.subNodes,
    };
  });

  const rawStages = Array.isArray(obj.flowchartStages) ? obj.flowchartStages : [];
  const flowchartStages: FlowchartStage[] = fallbackPack.flowchart.map((fb, idx) => {
    const candidate = rawStages[idx] as Record<string, unknown> | undefined;
    if (!candidate || typeof candidate !== 'object') return fb;
    const nodeType = VALID_NODE_TYPES.includes(candidate.nodeType as FlowchartStage['nodeType'])
      ? (candidate.nodeType as FlowchartStage['nodeType'])
      : fb.nodeType;
    const details = Array.isArray(candidate.details)
      ? candidate.details
          .map((d) => String(d || '').trim())
          .filter(Boolean)
          .slice(0, 4)
      : [];

    return {
      id: `ai_fc_${idx + 1}`,
      stepNumber: idx + 1,
      title:
        typeof candidate.title === 'string' && candidate.title.trim()
          ? candidate.title.trim()
          : fb.title,
      nodeType,
      connectorLabel:
        typeof candidate.connectorLabel === 'string' && candidate.connectorLabel.trim()
          ? candidate.connectorLabel.trim()
          : fb.connectorLabel,
      headline:
        typeof candidate.headline === 'string' && candidate.headline.trim()
          ? candidate.headline.trim()
          : fb.headline,
      details: details.length > 0 ? details : fb.details,
      keyQuestion:
        typeof candidate.keyQuestion === 'string' && candidate.keyQuestion.trim()
          ? candidate.keyQuestion.trim()
          : fb.keyQuestion,
      quickAnswer:
        typeof candidate.quickAnswer === 'string' && candidate.quickAnswer.trim()
          ? candidate.quickAnswer.trim()
          : fb.quickAnswer,
    };
  });

  const rawTakeaways = Array.isArray(obj.quickSummaryTakeaways)
    ? obj.quickSummaryTakeaways
        .map((t) => String(t || '').trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  return {
    chapterId: fallbackPack.chapter.id,
    centralIdea,
    mindmapBranches,
    flowchartStages,
    quickSummaryTakeaways:
      rawTakeaways.length >= 2
        ? rawTakeaways
        : fallbackPack.quickRevision.highYieldBullets.slice(0, 4),
    model: meta.model,
    generatedAt: meta.generatedAt,
    focusPrompt: meta.focusPrompt?.trim() || undefined,
  };
}

export function clampZoomLevel(zoom: number): number {
  return Math.min(1.4, Math.max(0.7, Math.round(zoom * 100) / 100));
}

export function truncateLabel(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, Math.max(1, maxLen - 1))}…`;
}
