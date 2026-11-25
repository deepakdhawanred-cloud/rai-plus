import type {
  AcademicResource,
  PresentationAuditIssue,
  PresentationAuditRecord,
  PresentationLanguageMode,
  RedesignedPresentationDeck,
  SlideVisualTemplate,
  VisualSlideItem,
} from '../types';

export function isMathematicsSubject(subject: string): boolean {
  return /\bmath|mathematics|maths|algebra|geometry|calculus|trigonometry\b/i.test(subject);
}

/**
 * Enforces curriculum language policy:
 * Mathematics presentations MUST strictly remain English-only.
 * Other subjects may use bilingual English-Hindi or English.
 */
export function enforcePresentationLanguagePolicy(
  subject: string,
  requestedMode: PresentationLanguageMode,
): { effectiveMode: PresentationLanguageMode; enforcedReason?: string } {
  if (isMathematicsSubject(subject)) {
    if (requestedMode !== 'english_only_math') {
      return {
        effectiveMode: 'english_only_math',
        enforcedReason:
          'School language policy enforced: Mathematics presentations must be strictly in English.',
      };
    }
    return { effectiveMode: 'english_only_math' };
  }
  return {
    effectiveMode: requestedMode === 'english_only_math' ? 'english' : requestedMode,
  };
}

export function auditExistingPresentation(params: {
  resource: AcademicResource;
  originalSlideCount: number;
  avgWordsPerSlide: number;
  visualCoveragePct: number;
  hasInteractiveChecks: boolean;
  hasVisualSummary: boolean;
  requestedLanguageMode: PresentationLanguageMode;
  learningObjectives: string[];
  difficulty?: PresentationAuditRecord['difficulty'];
}): PresentationAuditRecord {
  const { resource, originalSlideCount, avgWordsPerSlide, visualCoveragePct } = params;
  const issues: PresentationAuditIssue[] = [];
  let penalty = 0;

  if (avgWordsPerSlide > 60) {
    penalty += 28;
    issues.push({
      code: 'TEXT_HEAVY',
      severity: 'High',
      message: `Averaging ${avgWordsPerSlide} words/slide (exceeds 60-word visual learning ceiling).`,
      recommendation:
        'Convert dense paragraphs into concise 12-word takeaways backed by flowcharts, concept maps, or comparison tables.',
    });
  } else if (avgWordsPerSlide > 45) {
    penalty += 12;
    issues.push({
      code: 'TEXT_HEAVY',
      severity: 'Medium',
      message: `Moderate text density (${avgWordsPerSlide} words/slide).`,
      recommendation: 'Trim supporting sentences into speaker notes and highlight 3 crisp visual nodes.',
    });
  }

  if (visualCoveragePct < 55) {
    penalty += 26;
    issues.push({
      code: 'MISSING_DIAGRAM',
      severity: 'High',
      message: `Only ${visualCoveragePct}% of slides contain diagrams, infographics, or labelled visuals.`,
      recommendation:
        'Add labelled scientific/structural diagrams, process flowcharts, and mind maps for every core concept.',
    });
  }

  if (!params.hasInteractiveChecks) {
    penalty += 16;
    issues.push({
      code: 'NO_INTERACTIVE_CHECK',
      severity: 'Medium',
      message: 'No interactive classroom understanding check or scenario prompt found.',
      recommendation: 'Insert 1–2 quick classroom quiz or think-pair-share question slides.',
    });
  }

  if (!params.hasVisualSummary) {
    penalty += 12;
    issues.push({
      code: 'WEAK_SUMMARY',
      severity: 'Medium',
      message: 'Chapter concludes without a single-frame visual mind-map or summary diagram.',
      recommendation: 'Add a final Visual Summary slide consolidating definitions, steps, and applications.',
    });
  }

  const langCheck = enforcePresentationLanguagePolicy(resource.subject, params.requestedLanguageMode);
  if (isMathematicsSubject(resource.subject) && params.requestedLanguageMode === 'bilingual_en_hi') {
    penalty += 15;
    issues.push({
      code: 'LANGUAGE_POLICY_MISMATCH',
      severity: 'High',
      message: 'Mathematics deck flagged with Hindi bilingual text.',
      recommendation: 'Enforce strictly English terminology and notation for Mathematics.',
    });
  }

  const auditScore = Math.max(15, Math.min(100, 100 - penalty));

  return {
    id: `paud-${resource.id}`,
    schoolId: resource.schoolId,
    resourceId: resource.id,
    title: resource.title,
    classSection: resource.classSection,
    subject: resource.subject,
    chapter: resource.chapter,
    topic: resource.chapter,
    learningObjectives:
      params.learningObjectives.length > 0
        ? params.learningObjectives
        : [
            `Build clear conceptual mastery of ${resource.chapter}`,
            `Connect ${resource.subject} concepts to real-life classroom applications`,
          ],
    difficulty: params.difficulty || 'Standard',
    languageMode: langCheck.effectiveMode,
    teacherName: resource.createdBy,
    originalSlideCount,
    avgWordsPerSlide,
    visualCoveragePct,
    auditScore,
    issues,
    auditedAt: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Generates an honest, structured NotebookLM Source Brief (Markdown) for teachers to upload
 * to NotebookLM, paired with the exact JSON storyboard schema accepted on re-import.
 */
export function buildNotebookLmSourceBrief(audit: PresentationAuditRecord, originalSummary: string): string {
  const languageDirective =
    audit.languageMode === 'english_only_math'
      ? 'STRICT ENGLISH ONLY (Mathematics Policy — do NOT mix Hindi labels).'
      : audit.languageMode === 'bilingual_en_hi'
        ? 'BILINGUAL ENGLISH + HINDI (Include crisp English heading/takeaway + simple Hindi caption for classroom comprehension).'
        : 'CLEAR ACADEMIC ENGLISH (Simple, visual classroom phrasing).';

  return [
    `# NotebookLM Source Brief — Visual Presentation Redesign`,
    ``,
    `- **Original Deck Title (Preserved Untouched):** ${audit.title}`,
    `- **Class:** ${audit.classSection}`,
    `- **Subject:** ${audit.subject}`,
    `- **Chapter / Topic:** ${audit.chapter}`,
    `- **Difficulty Level:** ${audit.difficulty}`,
    `- **Language Policy:** ${languageDirective}`,
    ``,
    `## Learning Objectives`,
    ...audit.learningObjectives.map((obj, idx) => `${idx + 1}. ${obj}`),
    ``,
    `## Original Content Summary`,
    originalSummary,
    ``,
    `## Audit Findings to Fix`,
    ...(audit.issues.length > 0
      ? audit.issues.map((i) => `- [${i.severity}] ${i.message} -> ${i.recommendation}`)
      : ['- Enhance visual clarity and interactive engagement while keeping concise takeaways.']),
    ``,
    `## NotebookLM Studio Prompt (Copy into NotebookLM)`,
    `Transform this chapter into a 6-slide visual learning deck (maximum 35 words per slide). Use these exact visual templates: concept_mind_map, process_flowchart, labelled_diagram, comparison_matrix, real_life_application, interactive_question, visual_summary. Return a JSON array of slides matching the Rai Plus Storyboard JSON schema below so it can be imported back into Rai Plus:`,
    ``,
    '```json',
    JSON.stringify(
      {
        redesignedTitle: `${audit.chapter} — Visual Learning Edition`,
        slides: [
          {
            title: 'Core Concept Overview',
            hindiTitle: audit.languageMode === 'bilingual_en_hi' ? 'मुख्य अवधारणा' : undefined,
            template: 'concept_mind_map',
            keyTakeaway: 'One concise 12-word takeaway.',
            visualNodes: [
              { label: 'Concept 1', detail: 'Crisp visual explanation', tag: 'Core' },
              { label: 'Concept 2', detail: 'Connected idea', tag: 'Link' },
            ],
            speakerNotes: '2-sentence teacher facilitation cue.',
          },
        ],
      },
      null,
      2,
    ),
    '```',
  ].join('\n');
}

const VALID_TEMPLATES = new Set<SlideVisualTemplate>([
  'infographic_grid',
  'process_flowchart',
  'concept_mind_map',
  'comparison_matrix',
  'chronological_timeline',
  'labelled_diagram',
  'real_life_application',
  'interactive_question',
  'visual_summary',
]);

export function parseNotebookLmStoryboardJson(params: {
  rawJson: string;
  subject: string;
  requestedLanguageMode: PresentationLanguageMode;
}): { ok: true; redesignedTitle?: string; slides: VisualSlideItem[]; effectiveLanguageMode: PresentationLanguageMode } | { ok: false; error: string } {
  const { effectiveMode } = enforcePresentationLanguagePolicy(
    params.subject,
    params.requestedLanguageMode,
  );
  try {
    const parsed = JSON.parse(params.rawJson) as {
      redesignedTitle?: string;
      slides?: Array<Partial<VisualSlideItem>>;
    };
    const rawSlides = Array.isArray(parsed)
      ? (parsed as Array<Partial<VisualSlideItem>>)
      : Array.isArray(parsed?.slides)
        ? parsed.slides
        : [];
    if (rawSlides.length === 0) {
      return { ok: false, error: 'Storyboard JSON must contain a non-empty "slides" array.' };
    }

    const slides: VisualSlideItem[] = rawSlides.slice(0, 15).map((s, idx) => {
      const template: SlideVisualTemplate = VALID_TEMPLATES.has(s.template as SlideVisualTemplate)
        ? (s.template as SlideVisualTemplate)
        : 'infographic_grid';
      const nodes = Array.isArray(s.visualNodes)
        ? s.visualNodes
            .map((n) => ({
              label: String(n?.label || '').trim(),
              detail: String(n?.detail || '').trim(),
              tag: n?.tag ? String(n.tag).trim() : undefined,
            }))
            .filter((n) => n.label)
            .slice(0, 6)
        : [];

      const allowHindi = effectiveMode === 'bilingual_en_hi';
      return {
        id: `sld-imp-${Date.now().toString(36)}-${idx + 1}`,
        slideNumber: idx + 1,
        title: String(s.title || `Visual Slide ${idx + 1}`).trim(),
        hindiTitle: allowHindi && s.hindiTitle ? String(s.hindiTitle).trim() : undefined,
        template,
        keyTakeaway: String(s.keyTakeaway || 'Visual conceptual checkpoint.').trim(),
        hindiTakeaway: allowHindi && s.hindiTakeaway ? String(s.hindiTakeaway).trim() : undefined,
        visualNodes:
          nodes.length > 0
            ? nodes
            : [
                { label: 'Key Idea', detail: String(s.keyTakeaway || 'Core step'), tag: 'Visual' },
              ],
        realLifeExample: s.realLifeExample ? String(s.realLifeExample).trim() : undefined,
        interactivePrompt: s.interactivePrompt?.question
          ? {
              question: String(s.interactivePrompt.question).trim(),
              options: Array.isArray(s.interactivePrompt.options)
                ? s.interactivePrompt.options.map((o) => String(o).trim()).filter(Boolean)
                : undefined,
              expectedInsight: String(s.interactivePrompt.expectedInsight || '').trim(),
            }
          : undefined,
        speakerNotes: String(s.speakerNotes || 'Guide students through the diagram step by step.').trim(),
      };
    });

    return {
      ok: true,
      redesignedTitle: parsed?.redesignedTitle ? String(parsed.redesignedTitle).trim() : undefined,
      slides,
      effectiveLanguageMode: effectiveMode,
    };
  } catch {
    return {
      ok: false,
      error: 'Invalid JSON syntax. Paste the NotebookLM storyboard JSON block containing a "slides" array.',
    };
  }
}

export function buildDefaultRedesignedDeckFromAudit(params: {
  audit: PresentationAuditRecord;
  actorName: string;
}): RedesignedPresentationDeck {
  const { audit, actorName } = params;
  const allowHindi = audit.languageMode === 'bilingual_en_hi';
  const now = new Date().toISOString().slice(0, 10);

  const slides: VisualSlideItem[] = [
    {
      id: `sld-${audit.resourceId}-1`,
      slideNumber: 1,
      title: `${audit.chapter} — Concept Mind Map`,
      hindiTitle: allowHindi ? `${audit.chapter} — अवधारणा मानचित्र` : undefined,
      template: 'concept_mind_map',
      keyTakeaway: `Master the core building blocks of ${audit.chapter} in one visual frame.`,
      hindiTakeaway: allowHindi ? 'एक ही चित्र में अध्याय के मुख्य बिंदुओं को समझें।' : undefined,
      visualNodes: [
        { label: 'Core Principle', detail: audit.learningObjectives[0] || `Definition & purpose of ${audit.chapter}`, tag: 'Foundation' },
        { label: 'Key Mechanism', detail: 'Step-by-step cause, rule, or relationship', tag: 'Process' },
        { label: 'Classroom Link', detail: 'Visual check & everyday connection', tag: 'Apply' },
      ],
      speakerNotes: 'Begin by tracing the central concept to the 3 branches before opening the textbook.',
    },
    {
      id: `sld-${audit.resourceId}-2`,
      slideNumber: 2,
      title: 'Step-by-Step Process Flowchart',
      hindiTitle: allowHindi ? 'चरण-दर-चरण प्रक्रिया प्रवाह' : undefined,
      template: 'process_flowchart',
      keyTakeaway: 'Break complex steps into 4 repeatable classroom checkpoints.',
      visualNodes: [
        { label: '1. Observe', detail: 'Identify given facts or inputs clearly', tag: 'Step 1' },
        { label: '2. Connect', detail: 'Select the matching rule or concept', tag: 'Step 2' },
        { label: '3. Solve / Build', detail: 'Execute neatly with labelled steps', tag: 'Step 3' },
        { label: '4. Verify', detail: 'Cross-check reasonableness & units', tag: 'Step 4' },
      ],
      speakerNotes: 'Pause at Step 2 and ask two students to explain why this rule fits.',
    },
    {
      id: `sld-${audit.resourceId}-3`,
      slideNumber: 3,
      title: 'Real-Life Application & Classroom Checkpoint',
      hindiTitle: allowHindi ? 'दैनिक जीवन में उपयोग और प्रश्न' : undefined,
      template: 'interactive_question',
      keyTakeaway: `Spot ${audit.chapter} in everyday Indian life and test understanding live.`,
      visualNodes: [
        { label: 'Everyday Context', detail: `How ${audit.chapter} appears in home, school, or community tasks`, tag: 'Real Life' },
        { label: 'Common Mistake', detail: 'Highlight the #1 conceptual slip and how to avoid it', tag: 'Alert' },
      ],
      realLifeExample: `Ask students to cite one real-world example of ${audit.chapter} from their daily commute or home.`,
      interactivePrompt: {
        question: `Which step is most critical when applying ${audit.chapter} to an unfamiliar problem?`,
        options: [
          'Memorising only the final line',
          'Mapping given facts to the core principle first',
          'Skipping verification checks',
        ],
        expectedInsight: 'Mapping given facts to the core principle builds transferable reasoning.',
      },
      speakerNotes: 'Run a 90-second Think-Pair-Share before revealing the expected insight.',
    },
    {
      id: `sld-${audit.resourceId}-4`,
      slideNumber: 4,
      title: 'One-Page Visual Chapter Summary',
      hindiTitle: allowHindi ? 'अध्याय का दृश्य सारांश' : undefined,
      template: 'visual_summary',
      keyTakeaway: 'Three anchors to retain for notebooks, tests, and revision.',
      visualNodes: [
        { label: 'Remember', detail: 'Core concept & diagram labels', tag: 'Anchor 1' },
        { label: 'Practice', detail: '3 tiered notebook exercises', tag: 'Anchor 2' },
        { label: 'Reflect', detail: 'Explain the concept to a partner in 30 seconds', tag: 'Anchor 3' },
      ],
      speakerNotes: 'Display during the last 3 minutes as students complete their notebook summary box.',
    },
  ];

  return {
    id: `rdeck-${audit.resourceId}`,
    schoolId: audit.schoolId,
    originalResourceId: audit.resourceId,
    originalTitle: audit.title,
    redesignedTitle: `${audit.chapter} — Visual Infographic Deck`,
    classSection: audit.classSection,
    subject: audit.subject,
    chapter: audit.chapter,
    languageMode: audit.languageMode,
    workflowSource: 'visual_studio',
    versionNumber: 1,
    approvalStatus: 'draft',
    slides,
    versionHistory: [
      {
        versionNumber: 1,
        savedAt: now,
        savedBy: actorName,
        changeNote: 'Initial visual redesign scaffold generated from audited original deck (original preserved).',
        slideCount: slides.length,
      },
    ],
    updatedBy: actorName,
    updatedAt: now,
  };
}
