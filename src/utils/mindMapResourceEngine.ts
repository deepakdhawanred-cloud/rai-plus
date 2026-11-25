import type {
  MindMapApprovalStatus,
  MindMapResourceItem,
  MindMapResourceType,
  MindMapStructure,
  UserRole,
} from '../types';

export const MIND_MAP_RESOURCE_TYPE_META: Record<
  MindMapResourceType,
  { label: string; shortLabel: string }
> = {
  mind_map: { label: 'Visual Mind Map', shortLabel: 'Mind Map' },
  chapter_summary: { label: 'Chapter Summary', shortLabel: 'Summary' },
  diagram: { label: 'Concept Diagram', shortLabel: 'Diagram' },
  concept_map: { label: 'Concept Relationship Map', shortLabel: 'Concept Map' },
  supplementary: { label: 'Supplementary Learning Material', shortLabel: 'Supplementary' },
};

export const SUPPORTED_MINDMAP_EXTENSIONS = [
  'PDF',
  'PNG',
  'JPG',
  'JPEG',
  'PPT',
  'PPTX',
  'DOC',
  'DOCX',
] as const;

export function inferMindMapFileFormat(
  fileName?: string,
): MindMapResourceItem['fileFormat'] {
  if (!fileName) return 'INTERACTIVE';
  const ext = fileName.split('.').pop()?.trim().toUpperCase();
  if (ext === 'PDF') return 'PDF';
  if (ext === 'PNG') return 'PNG';
  if (ext === 'JPG') return 'JPG';
  if (ext === 'JPEG') return 'JPEG';
  if (ext === 'PPT' || ext === 'PPTX') return 'PPTX';
  if (ext === 'DOC' || ext === 'DOCX') return 'DOCX';
  return 'INTERACTIVE';
}

export interface MindMapFilterParams {
  items: MindMapResourceItem[];
  role: UserRole;
  userId: string;
  academicSession?: string;
  classSection?: string;
  subject?: string;
  chapter?: string;
  language?: string;
  teacherName?: string;
  resourceType?: string;
  statusFilter?: 'All' | MindMapApprovalStatus;
  searchQuery?: string;
  bookmarkedOnly?: boolean;
}

/**
 * Enforces strict visibility:
 * - Students and Parents ONLY see `approved` mind maps & resources.
 * - Teachers see all `approved` resources plus their own drafts/pending/rejected submissions.
 * - Coordinators, Principals, School Admins, and Super Admins see all resources for review & approval.
 */
export function filterMindMapLibrary(
  params: MindMapFilterParams,
): MindMapResourceItem[] {
  const {
    items,
    role,
    userId,
    academicSession,
    classSection,
    subject,
    chapter,
    language,
    teacherName,
    resourceType,
    statusFilter = 'All',
    searchQuery = '',
    bookmarkedOnly = false,
  } = params;

  const isStudentOrParent = role === 'student' || role === 'parent';
  const isApprover = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    role,
  );
  const q = searchQuery.trim().toLowerCase();

  return items
    .filter((item) => {
      if (isStudentOrParent) {
        if (item.status !== 'approved') return false;
      } else if (!isApprover) {
        // Teacher sees approved resources + their own drafts/submissions
        if (item.status !== 'approved' && item.teacherId !== userId) {
          return false;
        }
      }

      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (academicSession && academicSession !== 'All' && item.academicSession !== academicSession) {
        return false;
      }
      if (classSection && classSection !== 'All' && item.classSection !== classSection) {
        return false;
      }
      if (subject && subject !== 'All' && item.subject !== subject) return false;
      if (chapter && chapter !== 'All' && item.chapter !== chapter) return false;
      if (language && language !== 'All' && item.language !== language) return false;
      if (teacherName && teacherName !== 'All' && item.teacherName !== teacherName) {
        return false;
      }
      if (resourceType && resourceType !== 'All' && item.resourceType !== resourceType) {
        return false;
      }
      if (bookmarkedOnly && !item.bookmarkedByUserIds.includes(userId)) {
        return false;
      }

      if (q) {
        const haystack = [
          item.title,
          item.chapter,
          item.topic,
          item.subject,
          item.description,
          item.teacherName,
          ...item.keywords,
          ...item.learningObjectives,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/**
 * Deterministic AI-assisted chapter material analyzer that generates a structured,
 * teacher-editable mind map draft (main concepts, subtopics, relationships,
 * key definitions, process flowchart steps, and revision summary).
 * NEVER auto-publishes — always requires human teacher review & approval.
 */
export function buildAiSuggestedMindMapDraft(params: {
  subject: string;
  classSection: string;
  chapter: string;
  topic?: string;
  sourceMaterialText: string;
  fileName?: string;
}): {
  suggestedTitle: string;
  suggestedKeywords: string[];
  suggestedObjectives: string[];
  structure: MindMapStructure;
} {
  const { subject, classSection, chapter, topic, sourceMaterialText, fileName } = params;
  const cleanedLines = sourceMaterialText
    .split(/\r?\n|[.;•]/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 6);

  const centralConcept = (topic?.trim() || chapter.trim() || `${subject} Core Concept`).replace(
    /^Chapter\s*\d+\s*[:.-]?\s*/i,
    '',
  );

  // Extract meaningful sentences/phrases from uploaded notes or fall back to curriculum-grounded structure
  const extracted = cleanedLines.slice(0, 12);

  const b1Subs =
    extracted.slice(0, 3).length >= 2
      ? extracted.slice(0, 3)
      : [
          `Foundational principles of ${centralConcept}`,
          `Core NCERT / SCERT terminology for Class ${classSection}`,
          `How ${centralConcept} connects to everyday examples`,
        ];

  const b2Subs =
    extracted.slice(3, 6).length >= 2
      ? extracted.slice(3, 6)
      : [
          `Key laws, formulas, or analytical rules in ${chapter}`,
          `Step-by-step worked examples and reasoning checks`,
          `Common misconceptions to avoid in exams`,
        ];

  const b3Subs =
    extracted.slice(6, 9).length >= 2
      ? extracted.slice(6, 9)
      : [
          `Real-world application across ${subject}`,
          `Visual diagram / cause-and-effect links`,
          `Cross-chapter connections for revision`,
        ];

  const b4Subs =
    extracted.slice(9, 12).length >= 2
      ? extracted.slice(9, 12)
      : [
          `High-weightage board & unit test questions`,
          `3-minute quick recall checklist`,
          `Practice problems & classroom discussion prompts`,
        ];

  const keywordSet = new Set<string>([
    subject,
    chapter,
    centralConcept,
    `Class ${classSection}`,
  ]);
  for (const line of extracted.slice(0, 5)) {
    const words = line
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9-]/g, ''))
      .filter((w) => w.length >= 5);
    if (words[0]) keywordSet.add(words[0]);
  }

  const definitions = [
    {
      term: centralConcept,
      meaning:
        extracted[0] ||
        `Central conceptual framework covered in ${chapter} (${subject}, Class ${classSection}).`,
    },
    {
      term: 'Core Mechanism / Rule',
      meaning:
        extracted[1] ||
        `Structured relationship linking foundational concepts to problem-solving steps in ${chapter}.`,
    },
    {
      term: 'Applied Outcome',
      meaning:
        extracted[2] ||
        `Practical application and exam-ready synthesis students should demonstrate after studying ${chapter}.`,
    },
  ];

  const flowchartSteps = [
    `1. Observe & Recall Prior Concepts (${subject})`,
    `2. Introduce Core Concept: ${centralConcept}`,
    `3. Map Subtopics & Cause-Effect Relationships`,
    `4. Solve Guided & Independent Examples`,
    `5. Complete 5-Minute Chapter Revision Check`,
  ];

  const revisionSummary = [
    `Chapter Focus: ${chapter} — ${centralConcept}${fileName ? ` (drafted from ${fileName})` : ''}.`,
    ...b1Subs.slice(0, 2),
    `Verify definitions and walk through the 5-step process flowchart before publishing to students.`,
  ];

  return {
    suggestedTitle: `${chapter} — ${centralConcept} (Mind Map Draft)`,
    suggestedKeywords: Array.from(keywordSet).slice(0, 6),
    suggestedObjectives: [
      `Understand and explain the central ideas of ${centralConcept}`,
      `Connect subtopics and key definitions in ${chapter} visually`,
      `Apply the revision flowchart to solve ${subject} exercises independently`,
    ],
    structure: {
      centralConcept,
      branches: [
        {
          id: 'br-1',
          title: '1. Core Foundations',
          relationLabel: 'builds from',
          subtopics: b1Subs,
        },
        {
          id: 'br-2',
          title: '2. Key Rules & Mechanisms',
          relationLabel: 'governs',
          subtopics: b2Subs,
        },
        {
          id: 'br-3',
          title: '3. Visual Links & Applications',
          relationLabel: 'applies to',
          subtopics: b3Subs,
        },
        {
          id: 'br-4',
          title: '4. Exam & Revision Checkpoints',
          relationLabel: 'verified by',
          subtopics: b4Subs,
        },
      ],
      definitions,
      flowchartSteps,
      revisionSummary,
    },
  };
}
