import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  AiEriksonInterventionItem,
  AiEriksonRemedialPlan,
  DevelopmentalRemedialCategory,
  EriksonAssessment,
  OlqKey,
} from '../src/types';

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen';

export class GeminiApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'GeminiApiError';
    this.statusCode = statusCode;
  }
}

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function generateAcademicResourceDraft(params: {
  board: string;
  classSection: string;
  subject: string;
  chapter: string;
  category: string;
}): Promise<{ title: string; summary: string; aiGenerated: boolean }> {
  const ai = getClient();
  if (!ai) {
    return {
      title: `${params.board} ${params.classSection} ${params.subject} — ${params.chapter} (${params.category})`,
      summary: `${params.category} structured for ${params.board} Class ${params.classSection} covering ${params.chapter}. Includes 3 tiered concept checks, step-by-step classroom facilitation notes, and OLQ evidence prompts (Organising Ability & Reasoning Ability).`,
      aiGenerated: false,
    };
  }

  const response = await ai.models.generateContent({
    model: DEFAULT_GEMINI_MODEL,
    contents: `Create a concise, classroom-ready academic ${params.category} outline for an Indian school (${params.board} curriculum), Class ${params.classSection}, Subject: ${params.subject}, Chapter: ${params.chapter}. Return plain prose in 3-4 crisp sentences suitable for a teacher resource repository, mentioning specific learning objectives and notebook/reasoning checks. Do not use markdown asterisks or bullet lists.`,
  });

  const text = (response.text ?? '').trim();
  return {
    title: `${params.board} ${params.classSection} ${params.subject} — ${params.chapter} (${params.category})`,
    summary:
      text ||
      `${params.category} aligned to ${params.board} for ${params.subject} (${params.chapter}).`,
    aiGenerated: true,
  };
}

export async function generateCareerAdvisoryDraft(params: {
  applicantName: string;
  category: string;
  currentStage: string;
  interests: string[];
  strengths: string;
  goalSummary: string;
}): Promise<{ report: string; aiGenerated: boolean }> {
  const interestList = params.interests.join(', ') || 'Multidisciplinary subjects';
  const fallbackReport = `Advisory Career Brief for ${params.applicantName} (${params.category}): Based on your current stage (${params.currentStage}) and core interests in ${interestList}, recommended pathways include structured exploration of undergraduate/certification tracks aligned with CUET, national entrance criteria, and applied skill portfolios. Strengths noted: ${params.strengths}. Note: This automated guidance is advisory only and is scheduled for human review by a certified Virat Career Counsellor.`;

  const ai = getClient();
  if (!ai) {
    return {
      report: fallbackReport,
      aiGenerated: false,
    };
  }

  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: `You are an experienced Indian educational and career counsellor. Prepare a balanced, realistic 4-sentence advisory career guidance note for ${params.applicantName} (${params.category}, stage: ${params.currentStage}). Interests: ${params.interests.join(', ')}. Strengths: ${params.strengths}. Goals: ${params.goalSummary}. Mention relevant Indian academic streams, competitive exams (such as CUET, JEE, NEET, CLAT, NDA, GATE, or skill diplomas only if relevant), and state clearly that final stream/career choices should be reviewed with a human counsellor. Plain text only.`,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Advisory generation timed out')), 6000),
      ),
    ]);

    const text = (response.text ?? '').trim();
    return {
      report: text || fallbackReport,
      aiGenerated: Boolean(text),
    };
  } catch {
    return {
      report: fallbackReport,
      aiGenerated: false,
    };
  }
}

export async function generateStudentInsightDraft(params: {
  studentName: string;
  classSection: string;
  overallScore: number | null;
  missingComponents: string[];
  strengths: string[];
  supportAreas: string[];
}): Promise<{ insight: string; aiGenerated: boolean }> {
  const ai = getClient();
  if (!ai) {
    const missingText =
      params.missingComponents.length > 0
        ? `Missing evidence detected in: ${params.missingComponents.join(', ')} (not counted as zero).`
        : 'All 5 Learners Score components have active evidence.';
    return {
      insight: `Learning Synthesis for ${params.studentName} (${params.classSection}): Current Learners Score is ${params.overallScore ?? 'Pending'}/100. Strengths: ${params.strengths.join('; ')}. Suggested teacher/parent support: ${params.supportAreas.join('; ')}. ${missingText} Subject to academic coordinator approval.`,
      aiGenerated: false,
    };
  }

  const response = await ai.models.generateContent({
    model: DEFAULT_GEMINI_MODEL,
    contents: `Write a supportive, non-labelling 3-sentence teacher & parent learning summary for student ${params.studentName} (${params.classSection}). Learners Score: ${params.overallScore ?? 'Pending'}/100. Missing evidence areas (not zero): ${params.missingComponents.join(', ') || 'None'}. Observed strengths: ${params.strengths.join('; ')}. Areas for gentle scaffolding: ${params.supportAreas.join('; ')}. Never use permanent labels like "Active" or "Passive". Plain text only.`,
  });

  return {
    insight:
      (response.text ?? '').trim() ||
      `Balanced progress summary for ${params.studentName} ready for coordinator review.`,
    aiGenerated: true,
  };
}

const VALID_OLQ_KEYS = new Set<OlqKey>([
  'effective_intelligence',
  'reasoning_ability',
  'organising_ability',
  'power_of_expression',
  'social_adaptability',
  'cooperation',
  'sense_of_responsibility',
  'initiative',
  'self_confidence',
  'speed_of_decision',
  'influence_group',
  'liveliness',
  'determination',
  'courage',
  'stamina',
]);

const VALID_REMEDIAL_CATEGORIES = new Set<DevelopmentalRemedialCategory>([
  'Classroom Activity',
  'Behavioral Intervention',
  'Skill Practice',
  'Parent & Home Coordination',
]);

export async function generateEriksonRemedialPlan(params: {
  assessment: EriksonAssessment;
  focusNote?: string;
}): Promise<AiEriksonRemedialPlan> {
  const ai = getClient();
  if (!ai) {
    throw new GeminiApiError(
      'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets to generate personalized AI remedial interventions. Evidence-mapped Erikson remedials remain available to assign immediately.',
      503,
    );
  }

  const { assessment, focusNote } = params;
  const negativeSummary =
    assessment.negativeSignals.length > 0
      ? assessment.negativeSignals
          .map((s) => `${s.label} (${s.domain}, ${s.scorePct ?? 'N/A'}%): ${s.evidenceSummary}`)
          .join('\n- ')
      : 'No severe negative-pole signals; student is in transitional/preventive reinforcement.';
  const positiveSummary =
    assessment.positiveSignals.length > 0
      ? assessment.positiveSignals
          .map((s) => `${s.label} (${s.domain}): ${s.evidenceSummary}`)
          .join('\n- ')
      : 'Building baseline strengths.';

  const prompt = [
    `Student: ${assessment.studentName}, Class ${assessment.classSection} (Approx. Age ${assessment.estimatedAgeRange}).`,
    `Expected Erikson Psychosocial Stage: ${assessment.expectedStage.stageTitle} (Positive Pole: ${assessment.expectedStage.positivePole}, Negative Pole: ${assessment.expectedStage.negativePole}, Core Virtue: ${assessment.expectedStage.virtue}).`,
    `Present Assessed Status: ${assessment.presentStageHeadline} (Readiness ${assessment.readinessScorePct ?? 'Pending'}/100).`,
    `Domain Pillars: Competence=${assessment.domainScores.competencePct ?? 'N/A'}%, Agency=${assessment.domainScores.agencyPct ?? 'N/A'}%, Belonging=${assessment.domainScores.belongingPct ?? 'N/A'}%, Regulation=${assessment.domainScores.regulationPct ?? 'N/A'}%.`,
    `Risk / Delay Signals:\n- ${negativeSummary}`,
    `Positive Anchors:\n- ${positiveSummary}`,
    focusNote ? `Teacher Focus Note: ${focusNote}` : '',
    `Task: Design 4 specific, practical, non-labelling remedial activities and behavioral interventions an Indian school teacher can immediately assign to help this student overcome "${assessment.expectedStage.negativePole}" strain and return to healthy "${assessment.expectedStage.positivePole}" (${assessment.expectedStage.virtue}).`,
    `Include at least one "Classroom Activity", one "Behavioral Intervention", one "Skill Practice", and one "Parent & Home Coordination" intervention. Keep steps concrete, compassionate, age-appropriate, and directly tied to the signals above. Never use permanent labels like "weak", "lazy", or "passive".`,
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert educational psychologist specializing in Erik Erikson psychosocial development theory for K-12 Indian schools (Nursery to Class 12). Return strictly valid JSON matching the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stageContextSummary: {
              type: Type.STRING,
              description:
                '2-sentence clinical-to-classroom translation of how the student present signals map to Erikson theory and the recovery goal.',
            },
            interventions: {
              type: Type.ARRAY,
              description: 'Exactly 4 actionable remedial activities or behavioral interventions.',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description:
                      'Must be one of: Classroom Activity, Behavioral Intervention, Skill Practice, Parent & Home Coordination',
                  },
                  durationLabel: {
                    type: Type.STRING,
                    description: 'Short cadence label like "10 mins · Daily" or "15 mins · 3x/week"',
                  },
                  eriksonTarget: {
                    type: Type.STRING,
                    description: 'Concise Erikson shift goal, e.g. "Counter Inferiority -> Build Industry (Competence)"',
                  },
                  description: {
                    type: Type.STRING,
                    description: '2-sentence rationale and classroom framing.',
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3 concrete execution steps for teacher or parent.',
                  },
                  expectedBehavioralOutcome: {
                    type: Type.STRING,
                    description: 'Observable positive shift expected within 2-3 weeks.',
                  },
                  targetOlqs: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description:
                      '1 to 3 valid OLQ keys from: effective_intelligence, reasoning_ability, organising_ability, power_of_expression, social_adaptability, cooperation, sense_of_responsibility, initiative, self_confidence, speed_of_decision, influence_group, liveliness, determination, courage, stamina',
                  },
                },
                required: [
                  'title',
                  'category',
                  'durationLabel',
                  'eriksonTarget',
                  'description',
                  'steps',
                  'expectedBehavioralOutcome',
                  'targetOlqs',
                ],
              },
            },
          },
          required: ['stageContextSummary', 'interventions'],
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      throw new GeminiApiError('Gemini returned an empty remedial plan response. Please retry.', 502);
    }

    const parsed = JSON.parse(rawText) as {
      stageContextSummary?: string;
      interventions?: Array<{
        title?: string;
        category?: string;
        durationLabel?: string;
        eriksonTarget?: string;
        description?: string;
        steps?: string[];
        expectedBehavioralOutcome?: string;
        targetOlqs?: string[];
      }>;
    };

    const rawItems = Array.isArray(parsed.interventions) ? parsed.interventions : [];
    if (rawItems.length === 0) {
      throw new GeminiApiError('Gemini did not return structured remedial items. Please retry.', 502);
    }

    const interventions: AiEriksonInterventionItem[] = rawItems.slice(0, 5).map((item, idx) => {
      const cat = VALID_REMEDIAL_CATEGORIES.has(item.category as DevelopmentalRemedialCategory)
        ? (item.category as DevelopmentalRemedialCategory)
        : idx === 0
          ? 'Classroom Activity'
          : idx === 1
            ? 'Behavioral Intervention'
            : idx === 2
              ? 'Skill Practice'
              : 'Parent & Home Coordination';
      const olqs = (Array.isArray(item.targetOlqs) ? item.targetOlqs : [])
        .filter((k): k is OlqKey => typeof k === 'string' && VALID_OLQ_KEYS.has(k as OlqKey))
        .slice(0, 3);
      return {
        id: `ai-rem-${assessment.studentId}-${Date.now().toString(36)}-${idx}`,
        title: String(item.title || `Targeted ${assessment.expectedStage.positivePole} Activity ${idx + 1}`).trim(),
        category: cat,
        durationLabel: String(item.durationLabel || '15 mins · 3x/week').trim(),
        eriksonTarget: String(
          item.eriksonTarget ||
            `${assessment.expectedStage.negativePole} -> ${assessment.expectedStage.positivePole}`,
        ).trim(),
        description: String(item.description || '').trim(),
        steps: Array.isArray(item.steps)
          ? item.steps.map((s) => String(s).trim()).filter(Boolean).slice(0, 4)
          : [],
        expectedBehavioralOutcome: String(item.expectedBehavioralOutcome || '').trim(),
        targetOlqs: olqs.length > 0 ? olqs : assessment.recommendedOlqKeys.slice(0, 2),
      };
    });

    return {
      studentId: assessment.studentId,
      studentName: assessment.studentName,
      classSection: assessment.classSection,
      expectedStageTitle: assessment.expectedStage.stageTitle,
      presentStageHeadline: assessment.presentStageHeadline,
      stageContextSummary: String(parsed.stageContextSummary || assessment.transitionGoalStatement).trim(),
      generatedAt: new Date().toISOString(),
      model: DEFAULT_GEMINI_MODEL,
      interventions,
    };
  } catch (err) {
    if (err instanceof GeminiApiError) throw err;
    const rawMsg = err instanceof Error ? err.message : String(err);
    let readableMsg = rawMsg;
    try {
      const parsedErr = JSON.parse(rawMsg) as { error?: { message?: string; code?: number } };
      if (parsedErr?.error?.message) {
        readableMsg = parsedErr.error.message;
      }
    } catch {
      // Keep rawMsg if not JSON
    }
    const statusMatch = rawMsg.match(/\b(400|401|403|404|429|500|503)\b/);
    const statusCode = statusMatch ? Number(statusMatch[1]) : 502;
    if (statusCode === 403 || statusCode === 401 || /API_KEY_INVALID|PERMISSION_DENIED/i.test(rawMsg)) {
      throw new GeminiApiError(
        'Gemini API key was rejected (403/invalid key). Verify GEMINI_API_KEY in Settings > Secrets.',
        403,
      );
    }
    if (statusCode === 429 || /RESOURCE_EXHAUSTED/i.test(rawMsg)) {
      throw new GeminiApiError(
        'Gemini API rate limit reached (429). Please wait a moment and try generating again.',
        429,
      );
    }
    throw new GeminiApiError(
      `Unable to generate AI remedial plan via Gemini (${statusCode}): ${readableMsg}`,
      statusCode,
    );
  }
}

export async function generateThinkingDraftObservation(params: {
  studentName: string;
  classSection: string;
  testType: string;
  dimensions: {
    fastThinking: number;
    betterThinking: number;
    positiveThinking: number;
    selfCentredThinking: number;
  };
  responseSnippets: string[];
}): Promise<{ observation: string; aiGenerated: boolean }> {
  const ai = getClient();
  const fallback = `Draft Observation (${params.testType} · ${params.studentName}, Class ${params.classSection}): Fast Thinking ${params.dimensions.fastThinking}/100, Better Thinking ${params.dimensions.betterThinking}/100, Positive Thinking ${params.dimensions.positiveThinking}/100, Self-Centred pattern indicator ${params.dimensions.selfCentredThinking}/100. Observed responses provide a constructive baseline for guided reflection; note that fast speed does not automatically indicate decision depth and self-centred scores are non-diagnostic developmental cues pending human counsellor review.`;

  if (!ai) {
    return { observation: fallback, aiGenerated: false };
  }

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: `You are an educational counsellor supporting an Indian school student. Write a balanced, supportive, evidence-based 4-sentence DRAFT observation for counsellor review (NOT a clinical diagnosis). Student: ${params.studentName} (${params.classSection}), Assessment: ${params.testType}. Separate dimension scores (0-100): Fast Thinking=${params.dimensions.fastThinking}, Better Thinking=${params.dimensions.betterThinking}, Positive Thinking=${params.dimensions.positiveThinking}, Self-Centred pattern=${params.dimensions.selfCentredThinking}. Sample responses: ${params.responseSnippets.slice(0, 4).join(' | ')}. Rules: never diagnose a disorder, never equate fast thinking automatically with better thinking, frame all development areas as practical classroom/life-skill exercises. Plain prose only.`,
    });
    const text = (response.text ?? '').trim();
    return { observation: text || fallback, aiGenerated: true };
  } catch {
    return { observation: fallback, aiGenerated: false };
  }
}

export async function generateChapterKnowledgeVisual(params: {
  board: string;
  classNumber: number;
  subject: string;
  chapterTitle: string;
  keyTopics: string[];
  realLifeAnchor: string;
  focusPrompt?: string;
}): Promise<{
  centralIdea: string;
  mindmapBranches: Array<{
    title: string;
    colorKey: string;
    summary: string;
    subNodes: string[];
  }>;
  flowchartStages: Array<{
    stepNumber: number;
    title: string;
    nodeType: string;
    connectorLabel: string;
    headline: string;
    details: string[];
    keyQuestion: string;
    quickAnswer: string;
  }>;
  quickSummaryTakeaways: string[];
  model: string;
  generatedAt: string;
}> {
  const ai = getClient();
  if (!ai) {
    throw new GeminiApiError(
      'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets to generate custom AI Knowledge Mindmaps & Flowcharts. The built-in NCERT/HBSE visual map remains available right away.',
      503,
    );
  }

  const prompt = [
    `Curriculum: ${params.board} · Class ${params.classNumber} · Subject: ${params.subject}.`,
    `Chapter Title: "${params.chapterTitle}".`,
    `Core Syllabus Topics: ${params.keyTopics.join(', ')}.`,
    `Everyday Real-Life Anchor: ${params.realLifeAnchor}.`,
    params.focusPrompt?.trim()
      ? `Student/Teacher Custom Focus: ${params.focusPrompt.trim()}`
      : 'Focus: Clear conceptual mastery, accurate formulas/terms, and board-exam readiness.',
    `Task: Generate a structured Knowledge Mindmap (5 crisp radial branches with 3-4 sub-nodes each) AND a connected 5-stage Whole-Chapter Flowchart (Stage 1 Start -> Stage 2 Core Concepts -> Stage 3 Process/Decision -> Stage 4 Real-World Application -> Stage 5 Exam Mastery Checkpoint), plus 4 high-yield quick summary takeaways tailored strictly to Class ${params.classNumber}. Keep node labels concise so they render cleanly in an SVG visual diagram.`,
  ].join('\n');

  const requestConfig = {
    thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    systemInstruction:
      'You are an expert NCERT/HBSE/CBSE curriculum architect designing visual Knowledge Mindmaps and end-to-end Chapter Flowcharts for Indian K-12 students. Return strictly valid JSON matching the schema. Keep titles and sub-nodes concise and accurate.',
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        centralIdea: {
          type: Type.STRING,
          description: '1-2 crisp sentences synthesizing the entire chapter core idea.',
        },
        mindmapBranches: {
          type: Type.ARRAY,
          description: 'Exactly 5 distinct radial concept branches for the chapter mindmap.',
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Concise numbered branch title under 28 characters, e.g. "1. Core Definitions".',
              },
              colorKey: {
                type: Type.STRING,
                description: 'One of: blue, emerald, amber, violet, rose',
              },
              summary: {
                type: Type.STRING,
                description: '1-2 sentence explanation of this concept branch.',
              },
              subNodes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 to 4 concise factual sub-nodes (each under 40 characters).',
              },
            },
            required: ['title', 'colorKey', 'summary', 'subNodes'],
          },
        },
        flowchartStages: {
          type: Type.ARRAY,
          description: 'Exactly 5 sequential end-to-end flowchart stages covering the whole chapter.',
          items: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.INTEGER },
              title: { type: Type.STRING },
              nodeType: {
                type: Type.STRING,
                description: 'One of: start, concept, decision, application, checkpoint',
              },
              connectorLabel: {
                type: Type.STRING,
                description: 'Short transition label to next stage, e.g. "Leads To", "Applies Rule".',
              },
              headline: { type: Type.STRING },
              details: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 3 concise factual bullet points for this stage.',
              },
              keyQuestion: {
                type: Type.STRING,
                description: '1 active-recall self-check question for this stage.',
              },
              quickAnswer: {
                type: Type.STRING,
                description: 'Concise 1-sentence answer to keyQuestion.',
              },
            },
            required: [
              'stepNumber',
              'title',
              'nodeType',
              'connectorLabel',
              'headline',
              'details',
              'keyQuestion',
              'quickAnswer',
            ],
          },
        },
        quickSummaryTakeaways: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '4 high-yield quick revision takeaways.',
        },
      },
      required: ['centralIdea', 'mindmapBranches', 'flowchartStages', 'quickSummaryTakeaways'],
    },
  };

  let lastErr: unknown = null;
  const maxAttempts = 2;
  const perAttemptTimeoutMs = 18_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const attemptStart = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model: DEFAULT_GEMINI_MODEL,
          contents: prompt,
          config: requestConfig,
        }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            reject(
              new GeminiApiError(
                'Gemini took longer than expected to respond (504). Please try again in a moment — the built-in NCERT/HBSE Mindmap & Flowchart remains ready below.',
                504,
              ),
            );
          }, perAttemptTimeoutMs);
        }),
      ]);
      if (timer) clearTimeout(timer);

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new GeminiApiError('Gemini returned an empty chapter visual map. Please retry.', 502);
      }

      const parsed = JSON.parse(rawText) as {
        centralIdea?: string;
        mindmapBranches?: Array<{
          title: string;
          colorKey: string;
          summary: string;
          subNodes: string[];
        }>;
        flowchartStages?: Array<{
          stepNumber: number;
          title: string;
          nodeType: string;
          connectorLabel: string;
          headline: string;
          details: string[];
          keyQuestion: string;
          quickAnswer: string;
        }>;
        quickSummaryTakeaways?: string[];
      };

      return {
        centralIdea: String(parsed.centralIdea || '').trim(),
        mindmapBranches: Array.isArray(parsed.mindmapBranches) ? parsed.mindmapBranches : [],
        flowchartStages: Array.isArray(parsed.flowchartStages) ? parsed.flowchartStages : [],
        quickSummaryTakeaways: Array.isArray(parsed.quickSummaryTakeaways)
          ? parsed.quickSummaryTakeaways
          : [],
        model: DEFAULT_GEMINI_MODEL,
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      if (timer) clearTimeout(timer);
      lastErr = err;
      const elapsed = Date.now() - attemptStart;
      const rawMsg = err instanceof Error ? err.message : String(err);
      const isFastTransientSpike =
        !(err instanceof GeminiApiError) &&
        elapsed < 10_000 &&
        /\b(503|500)\b|UNAVAILABLE|high demand|overloaded/i.test(rawMsg);
      if (attempt < maxAttempts && isFastTransientSpike) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        continue;
      }
      break;
    }
  }

  if (lastErr instanceof GeminiApiError) throw lastErr;
  const rawMsg = lastErr instanceof Error ? lastErr.message : String(lastErr ?? 'Unknown error');
  let readableMsg = rawMsg;
  try {
    const jsonStart = rawMsg.indexOf('{');
    const jsonCandidate = jsonStart >= 0 ? rawMsg.slice(jsonStart) : rawMsg;
    const parsedErr = JSON.parse(jsonCandidate) as { error?: { message?: string; code?: number } };
    if (parsedErr?.error?.message) {
      readableMsg = parsedErr.error.message;
    }
  } catch {
    // Keep rawMsg if not JSON
  }

  const statusMatch = rawMsg.match(/\b(400|401|403|404|429|500|503)\b/);
  const statusCode = statusMatch ? Number(statusMatch[1]) : 502;
  if (statusCode === 403 || statusCode === 401 || /API_KEY_INVALID|PERMISSION_DENIED/i.test(rawMsg)) {
    throw new GeminiApiError(
      'Gemini API key was rejected (403/invalid key). Verify GEMINI_API_KEY in Settings > Secrets.',
      403,
    );
  }
  if (statusCode === 429 || /RESOURCE_EXHAUSTED/i.test(rawMsg)) {
    throw new GeminiApiError(
      'Gemini API rate limit reached (429). Please wait a moment and try again.',
      429,
    );
  }
  if (statusCode === 503 || /UNAVAILABLE|high demand/i.test(rawMsg)) {
    throw new GeminiApiError(
      'Gemini is temporarily experiencing high demand (503). Please try again in a few seconds — the built-in NCERT/HBSE Mindmap & Flowchart remains ready below.',
      503,
    );
  }
  throw new GeminiApiError(
    `Unable to generate AI chapter knowledge map (${statusCode}): ${readableMsg}`,
    statusCode,
  );
}

export async function analyzeChapterBlueprintWithGemini(params: {
  board: string;
  classLevel: number;
  subject: string;
  chapterNumber: number;
  chapterTitle: string;
  textbookContent: string;
  learningObjectives?: string;
  teachingLanguage: string;
  ageGroup: string;
  pdfBase64?: string;
}): Promise<{
  overview: string;
  topics: Array<{ title: string; subtopics: string[] }>;
  concepts: Array<{
    title: string;
    topicTitle: string;
    explanation: string;
    prerequisites: string[];
    difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
    isDifficult: boolean;
    diagramsAndProcesses: string[];
    practicalApplications: string[];
    learningObjectives: string[];
    suitableForAnimation: boolean;
    suitableForSimulation: boolean;
    suitableForAbacusOrMathVis: boolean;
  }>;
  suggestedGames: string[];
  suggestedAnimations: string[];
  suggestedSimulations: string[];
  suggestedExperiments: string[];
  assessmentRecommendations: string[];
  revisionActivities: string[];
}> {
  const ai = getClient();
  if (!ai) {
    throw new GeminiApiError(
      'GEMINI_API_KEY is not configured. Configure GEMINI_API_KEY in Settings > Secrets to run AI Chapter Blueprint analysis.',
      503,
    );
  }

  try {
    const promptText = `Analyze this Indian school curriculum chapter and produce a structured Chapter Learning Blueprint.
Board: ${params.board}
Class: ${params.classLevel} (${params.ageGroup})
Subject: ${params.subject}
Chapter ${params.chapterNumber}: ${params.chapterTitle}
Teaching Language: ${params.teachingLanguage}
Teacher Learning Objectives: ${params.learningObjectives || 'Align strictly to NCERT/CBSE/HBSE prescribed textbook outcomes.'}
${params.textbookContent ? `Textbook Excerpt / Chapter Notes:\n${params.textbookContent.slice(0, 6000)}` : 'Extract directly from the attached textbook PDF chapter.'}

Rules:
- Stay strictly faithful to the prescribed ${params.board} curriculum; never invent unverified facts.
- Extract 2 to 4 clear topics and 4 to 6 distinct, atomic concepts traceable to this chapter.
- Identify prerequisites, difficult concepts, diagrams/processes, practical applications, and whether each concept suits animation, simulation, or abacus/math visualization.`;

    const contents = params.pdfBase64
      ? [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: params.pdfBase64,
            },
          },
          promptText,
        ]
      : promptText;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents,
      config: {
        systemInstruction:
          'You are an expert NCERT/CBSE/HBSE curriculum architect and EdTech learning designer. Output strictly valid JSON matching the schema.',
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'subtopics'],
              },
            },
            concepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  topicTitle: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
                  difficulty: { type: Type.STRING },
                  isDifficult: { type: Type.BOOLEAN },
                  diagramsAndProcesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  practicalApplications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suitableForAnimation: { type: Type.BOOLEAN },
                  suitableForSimulation: { type: Type.BOOLEAN },
                  suitableForAbacusOrMathVis: { type: Type.BOOLEAN },
                },
                required: [
                  'title',
                  'topicTitle',
                  'explanation',
                  'prerequisites',
                  'difficulty',
                  'isDifficult',
                  'diagramsAndProcesses',
                  'practicalApplications',
                  'learningObjectives',
                  'suitableForAnimation',
                  'suitableForSimulation',
                  'suitableForAbacusOrMathVis',
                ],
              },
            },
            suggestedGames: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedAnimations: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedSimulations: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedExperiments: { type: Type.ARRAY, items: { type: Type.STRING } },
            assessmentRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            revisionActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'overview',
            'topics',
            'concepts',
            'suggestedGames',
            'suggestedAnimations',
            'suggestedSimulations',
            'suggestedExperiments',
            'assessmentRecommendations',
            'revisionActivities',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as {
      overview?: string;
      topics?: Array<{ title: string; subtopics: string[] }>;
      concepts?: Array<{
        title: string;
        topicTitle: string;
        explanation: string;
        prerequisites: string[];
        difficulty: string;
        isDifficult: boolean;
        diagramsAndProcesses: string[];
        practicalApplications: string[];
        learningObjectives: string[];
        suitableForAnimation: boolean;
        suitableForSimulation: boolean;
        suitableForAbacusOrMathVis: boolean;
      }>;
      suggestedGames?: string[];
      suggestedAnimations?: string[];
      suggestedSimulations?: string[];
      suggestedExperiments?: string[];
      assessmentRecommendations?: string[];
      revisionActivities?: string[];
    };

    const normalizeDiff = (d?: string): 'Foundation' | 'Intermediate' | 'Advanced' => {
      if (d === 'Foundation' || d === 'Intermediate' || d === 'Advanced') return d;
      return 'Intermediate';
    };

    return {
      overview: parsed.overview || `Structured learning blueprint for ${params.chapterTitle}.`,
      topics: Array.isArray(parsed.topics) && parsed.topics.length > 0 ? parsed.topics : [{ title: params.chapterTitle, subtopics: ['Core Concepts'] }],
      concepts: (Array.isArray(parsed.concepts) ? parsed.concepts : []).map((c) => ({
        ...c,
        difficulty: normalizeDiff(c.difficulty),
      })),
      suggestedGames: parsed.suggestedGames || [],
      suggestedAnimations: parsed.suggestedAnimations || [],
      suggestedSimulations: parsed.suggestedSimulations || [],
      suggestedExperiments: parsed.suggestedExperiments || [],
      assessmentRecommendations: parsed.assessmentRecommendations || [],
      revisionActivities: parsed.revisionActivities || [],
    };
  } catch (err) {
    if (err instanceof GeminiApiError) throw err;
    const msg = err instanceof Error ? err.message : 'Unexpected Gemini API error';
    throw new GeminiApiError(`AI Chapter Analysis failed: ${msg}`, 502);
  }
}

export async function generateInteractiveGameWithGemini(params: {
  board: string;
  classLevel: number;
  subject: string;
  chapterTitle: string;
  conceptTitle: string;
  learningObjective: string;
  gameFormat: string;
  difficulty: string;
  language: string;
}): Promise<{
  title: string;
  instructions: string;
  categories?: string[];
  answerKeySummary: string;
  items: Array<{
    id: string;
    prompt: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    category?: string;
    pairLeft?: string;
    pairRight?: string;
    orderIndex?: number;
    clue?: string;
  }>;
}> {
  const ai = getClient();
  if (!ai) {
    throw new GeminiApiError(
      'GEMINI_API_KEY is not configured. Configure GEMINI_API_KEY in Settings > Secrets to generate AI interactive games.',
      503,
    );
  }

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: `Generate a playable educational game asset for an Indian school student.
Board: ${params.board} · Class ${params.classLevel} · Subject: ${params.subject}
Chapter: ${params.chapterTitle}
Concept: ${params.conceptTitle}
Learning Objective: ${params.learningObjective}
Requested Game Format: ${params.gameFormat}
Difficulty: ${params.difficulty}
Language: ${params.language}

Generate 4 to 5 curriculum-accurate playable items:
- For drag_and_drop or concept_classification: provide 2-3 categories and set category + correctAnswer to the exact category name.
- For matching or memory: set pairLeft, pairRight, prompt (=pairLeft), and correctAnswer (=pairRight).
- For sequence_building: set orderIndex (0,1,2,3...) and correctAnswer ("1","2"...).
- For crossword or word_search: set correctAnswer to a single uppercase chapter keyword (4-12 letters, no spaces) and provide clue/prompt.
- For all other choice/quiz/detective/mystery/math/error/scenario/flashcard formats: provide 4 options (where one exactly equals correctAnswer) and a clear teaching explanation.`,
      config: {
        systemInstruction:
          'You are an EdTech game designer for CBSE/NCERT/HBSE schools. Never invent textbook facts. Return strictly valid JSON.',
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            instructions: { type: Type.STRING },
            categories: { type: Type.ARRAY, items: { type: Type.STRING } },
            answerKeySummary: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  category: { type: Type.STRING },
                  pairLeft: { type: Type.STRING },
                  pairRight: { type: Type.STRING },
                  orderIndex: { type: Type.INTEGER },
                  clue: { type: Type.STRING },
                },
                required: ['id', 'prompt', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['title', 'instructions', 'answerKeySummary', 'items'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as {
      title?: string;
      instructions?: string;
      categories?: string[];
      answerKeySummary?: string;
      items?: Array<{
        id: string;
        prompt: string;
        options?: string[];
        correctAnswer: string;
        explanation: string;
        category?: string;
        pairLeft?: string;
        pairRight?: string;
        orderIndex?: number;
        clue?: string;
      }>;
    };

    if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
      throw new GeminiApiError('Gemini returned an empty game item list. Please retry.', 502);
    }

    return {
      title: parsed.title || `${params.conceptTitle} Interactive Challenge`,
      instructions: parsed.instructions || 'Complete each concept challenge accurately to earn mastery XP.',
      categories: parsed.categories,
      answerKeySummary: parsed.answerKeySummary || parsed.items.map((i) => i.correctAnswer).join(' · '),
      items: parsed.items.map((it, idx) => ({
        ...it,
        id: it.id || `gi-${idx + 1}`,
      })),
    };
  } catch (err) {
    if (err instanceof GeminiApiError) throw err;
    const msg = err instanceof Error ? err.message : 'Unexpected Gemini API error';
    throw new GeminiApiError(`AI Game Generation failed: ${msg}`, 502);
  }
}

export async function generateCoachNarrativeWithGemini(params: {
  studentName: string;
  classSection: string;
  weakConcepts: string[];
  strongConcepts: string[];
  repeatedMistakes: string[];
  abacusSummary?: string;
}): Promise<{ guidance: string; reTeachingTip: string }> {
  const ai = getClient();
  if (!ai) {
    throw new GeminiApiError(
      'GEMINI_API_KEY is not configured. Configure GEMINI_API_KEY in Settings > Secrets to generate personalized AI Coach explanations.',
      503,
    );
  }
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: `Write an encouraging, specific 3-sentence study coach note and a 2-sentence concept re-teaching tip for student ${params.studentName} (Class ${params.classSection}).
Weak concepts: ${params.weakConcepts.join(', ') || 'None yet'}
Strong concepts: ${params.strongConcepts.join(', ') || 'Steady baseline'}
Repeated mistakes: ${params.repeatedMistakes.join('; ') || 'None detected'}
Abacus progress: ${params.abacusSummary || 'Not yet started'}`,
      config: {
        systemInstruction:
          'You are a warm, child-friendly educational psychologist and tutor. Focus on accuracy, effort, and understanding rather than pressure. Return valid JSON.',
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            guidance: { type: Type.STRING },
            reTeachingTip: { type: Type.STRING },
          },
          required: ['guidance', 'reTeachingTip'],
        },
      },
    });
    const parsed = JSON.parse((response.text ?? '{}').trim()) as {
      guidance?: string;
      reTeachingTip?: string;
    };
    return {
      guidance: parsed.guidance || 'Keep practicing steadily with focus on understanding each concept.',
      reTeachingTip: parsed.reTeachingTip || 'Revisit the visual animation step-by-step before retrying the game.',
    };
  } catch (err) {
    if (err instanceof GeminiApiError) throw err;
    const msg = err instanceof Error ? err.message : 'Unexpected Gemini API error';
    throw new GeminiApiError(`AI Coach generation failed: ${msg}`, 502);
  }
}

export interface ExpenseCategorizationInputRow {
  id: string;
  date?: string;
  vendorOrParty: string;
  description: string;
  category?: string;
  amountInr?: number;
  paymentMode?: string;
}

export interface ExpenseCategorizationOutputRow {
  id: string;
  classification: 'Operational' | 'Administrative' | 'Developmental';
  reason: string;
}

const VALID_EXPENSE_CLASSIFICATIONS = new Set<'Operational' | 'Administrative' | 'Developmental'>([
  'Operational',
  'Administrative',
  'Developmental',
]);

async function categorizeExpenseChunkWithGemini(
  ai: GoogleGenAI,
  rows: ExpenseCategorizationInputRow[],
): Promise<ExpenseCategorizationOutputRow[]> {
  const payloadText = rows
    .map(
      (r, i) =>
        `${i + 1}. id="${r.id}" | date="${r.date || ''}" | party="${r.vendorOrParty}" | desc="${r.description}" | ledgerCategory="${r.category || ''}" | amountINR=${r.amountInr ?? 0} | mode="${r.paymentMode || ''}"`,
    )
    .join('\n');

  const prompt = `Classify each Indian school expense row below into exactly one of three labels:
- "Operational": Day-to-day running costs required to operate classes, campus, and school transport — e.g. bus fuel (OM Fuel Payment), bus repairs/service/motors, electricity bills, daily campus cash expenses, driver salaries, regular staff/teacher salaries, monthly bus EMI/kist installments, routine maintenance.
- "Administrative": Institutional governance, compliance, overhead, rent, insurance, board/CBSE fees, bank transfers, director/management account transfers, report cards, flex/printing/branding, office supplies, and hold-salary settlements.
- "Developmental": Capital investment, expansion, technology modernization, and educational growth — e.g. projectors, smart-classroom/EdTech software (UOLO Software), new bus advance booking / fleet expansion, publications/curriculum upgrades, campus painting/renovation upgrades.

Expense Rows:
${payloadText}

Return a JSON object with a "classifications" array containing one entry per input row id.`;

  const maxAttempts = 3;
  let lastErr: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are a senior school financial controller for an Indian K-12 institution. Categorize each expense row strictly into Operational, Administrative, or Developmental with a concise 1-sentence accounting rationale. Return strictly valid JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classifications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    classification: {
                      type: Type.STRING,
                      description: 'Must be exactly one of: Operational, Administrative, Developmental',
                    },
                    reason: {
                      type: Type.STRING,
                      description: 'Concise 1-sentence financial rationale (max 110 characters).',
                    },
                  },
                  required: ['id', 'classification', 'reason'],
                },
              },
            },
            required: ['classifications'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new GeminiApiError('Gemini returned an empty expense categorization response.', 502);
      }

      const parsed = JSON.parse(rawText) as {
        classifications?: Array<{ id?: string; classification?: string; reason?: string }>;
      };
      const items = Array.isArray(parsed.classifications) ? parsed.classifications : [];
      if (items.length === 0) {
        throw new GeminiApiError('Gemini returned no expense classification items.', 502);
      }

      const resultById = new Map<string, ExpenseCategorizationOutputRow>();
      for (const item of items) {
        const id = String(item.id || '').trim();
        const rawLabel = String(item.classification || '').trim();
        if (!id) continue;
        const matched = VALID_EXPENSE_CLASSIFICATIONS.has(
          rawLabel as 'Operational' | 'Administrative' | 'Developmental',
        )
          ? (rawLabel as 'Operational' | 'Administrative' | 'Developmental')
          : rawLabel.toLowerCase().includes('dev')
            ? 'Developmental'
            : rawLabel.toLowerCase().includes('admin')
              ? 'Administrative'
              : 'Operational';
        resultById.set(id, {
          id,
          classification: matched,
          reason: String(item.reason || `Classified as ${matched} by Gemini.`).trim().slice(0, 140),
        });
      }

      return rows
        .map((r) => resultById.get(r.id))
        .filter((x): x is ExpenseCategorizationOutputRow => Boolean(x));
    } catch (err) {
      lastErr = err;
      if (err instanceof GeminiApiError) throw err;
      const rawMsg = err instanceof Error ? err.message : String(err);
      const isTransient = /\b(500|503|504)\b|UNAVAILABLE|overloaded|high demand/i.test(rawMsg);
      if (attempt < maxAttempts && isTransient) {
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
        continue;
      }
      break;
    }
  }

  const rawMsg = lastErr instanceof Error ? lastErr.message : String(lastErr ?? 'Unknown error');
  const statusMatch = rawMsg.match(/\b(400|401|403|404|429|500|503)\b/);
  const statusCode = statusMatch ? Number(statusMatch[1]) : 502;
  if (statusCode === 403 || statusCode === 401 || /API_KEY_INVALID|PERMISSION_DENIED/i.test(rawMsg)) {
    throw new GeminiApiError(
      'Gemini API key was rejected (403/invalid key). Check GEMINI_API_KEY in Settings > Secrets.',
      403,
    );
  }
  if (statusCode === 429 || /RESOURCE_EXHAUSTED/i.test(rawMsg)) {
    throw new GeminiApiError(
      'Gemini API rate limit reached (429). Wait a moment or configure a higher-quota key in Settings > Secrets.',
      429,
    );
  }
  throw new GeminiApiError(`Gemini expense categorization failed (${statusCode}): ${rawMsg}`, statusCode);
}

/**
 * Automated school expense categorization via server-side Gemini API (`gemini-4-hydrogen`).
 * Labels incoming or existing expense rows strictly as 'Operational', 'Administrative', or 'Developmental'.
 * Processes large expense sheets in reliable batches of 35 rows and propagates upstream API errors honestly.
 */
export async function categorizeExpensesWithGemini(
  rows: ExpenseCategorizationInputRow[],
): Promise<{
  results: ExpenseCategorizationOutputRow[];
  model: string;
  categorizedAt: string;
}> {
  const ai = getClient();
  if (!ai) {
    throw new GeminiApiError(
      'GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets to run automated Gemini expense categorization.',
      503,
    );
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      results: [],
      model: DEFAULT_GEMINI_MODEL,
      categorizedAt: new Date().toISOString(),
    };
  }

  const chunkSize = 35;
  const allResults: ExpenseCategorizationOutputRow[] = [];
  for (let start = 0; start < rows.length; start += chunkSize) {
    const slice = rows.slice(start, start + chunkSize);
    const chunkRes = await categorizeExpenseChunkWithGemini(ai, slice);
    allResults.push(...chunkRes);
  }

  return {
    results: allResults,
    model: DEFAULT_GEMINI_MODEL,
    categorizedAt: new Date().toISOString(),
  };
}




