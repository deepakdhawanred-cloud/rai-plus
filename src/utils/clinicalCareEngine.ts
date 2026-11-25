import type { UserRole } from '../types';
import type {
  ArticulationStageNumber,
  ClinicalAccessLogEntry,
  ClinicalDomain,
  ClinicalReportRecord,
  ClinicalWorkspaceBundle,
  DevelopmentalHistoryRecord,
  DevelopmentalScreeningCase,
  FluencyApproachType,
  ParentQuestionnaireItem,
  ParentQuestionnaireRecord,
  ScreeningWorkflowStatus,
  SpeechExerciseItem,
  SpeechSoundTarget,
  TeacherObservationRecord,
} from '../types/clinical';

export const CLINICAL_SPECIALIST_ROLES: UserRole[] = [
  'clinical_psychologist',
  'slp',
  'audiologist',
  'special_educator',
  'counsellor',
];

export const MANAGEMENT_ROLES: UserRole[] = [
  'super_admin',
  'school_admin',
  'principal',
  'coordinator',
];

export const CLINICAL_DOMAIN_LABELS: Record<ClinicalDomain, string> = {
  autism_spectrum_indicators: 'Autism Spectrum Indicators',
  adhd_indicators: 'ADHD Indicators',
  speech_language_delays: 'Speech & Language Delays',
  intellectual_developmental_functioning: 'Intellectual & Developmental Functioning',
  down_syndrome_referral: 'Down Syndrome Medical Referral Pathway',
  specific_learning_difficulties: 'Specific Learning Difficulties',
  social_communication_difficulties: 'Social Communication Difficulties',
  behavioural_emotional_concerns: 'Behavioural & Emotional Concerns',
  adaptive_functioning: 'Adaptive Functioning',
  motor_sensory_development: 'Motor & Sensory Development',
  hearing_communication_concerns: 'Hearing & Communication Concerns',
  other_developmental_concerns: 'Other Developmental Concerns',
};

export const ARTICULATION_STAGES: Array<{
  stage: ArticulationStageNumber;
  label: string;
  focus: string;
  activities: string[];
}> = [
  {
    stage: 1,
    label: 'Sound Awareness',
    focus: 'Auditory identification and sound discrimination before production demands',
    activities: [
      'Listening activities',
      'Sound identification',
      'Distinguishing target sounds',
      'Auditory discrimination',
    ],
  },
  {
    stage: 2,
    label: 'Sound Establishment',
    focus: 'Clinician-demonstrated placement cues and gentle guided isolation',
    activities: [
      'Professional demonstration',
      'Appropriate placement cues',
      'Mirror-based visual feedback (where suitable)',
      'Guided production',
      'Individual sound practice',
    ],
  },
  {
    stage: 3,
    label: 'Syllable Practice',
    focus: 'Stabilising target sound in CV, VC, and VCV combinations',
    activities: ['Simple syllables', 'Repeated target combinations', 'Supported practice'],
  },
  {
    stage: 4,
    label: 'Word Practice',
    focus: 'Initial, medial, and final word-level accuracy with visual supports',
    activities: [
      'Initial-position words',
      'Medial-position words',
      'Final-position words',
      'Picture naming',
      'Word recognition',
    ],
  },
  {
    stage: 5,
    label: 'Phrase Practice',
    focus: 'Functional two- and three-word carrier phrases',
    activities: ['Two-word phrases', 'Three-word phrases', 'Functional phrases'],
  },
  {
    stage: 6,
    label: 'Sentence Practice',
    focus: 'Reading sentences, picture description, and structured dialogue',
    activities: [
      'Reading sentences',
      'Describing pictures',
      'Completing sentences',
      'Structured conversation',
    ],
  },
  {
    stage: 7,
    label: 'Conversational Generalisation',
    focus: 'Natural carryover into storytelling and everyday classroom dialogue',
    activities: [
      'Storytelling',
      'Classroom communication',
      'Everyday conversation',
      'Spontaneous speech',
    ],
  },
  {
    stage: 8,
    label: 'Maintenance',
    focus: 'Self-monitoring, carryover across environments, and periodic reassessment',
    activities: [
      'Self-monitoring',
      'Carryover activities',
      'Periodic reassessment',
      'Generalisation across environments',
    ],
  },
];

export const DEFAULT_PARENT_QUESTIONNAIRE_TEMPLATE: Array<{
  id: string;
  domain: ParentQuestionnaireItem['domain'];
  question: string;
}> = [
  {
    id: 'pq-comm',
    domain: 'Communication',
    question: 'Does your child comfortably express everyday needs and ideas in their home language?',
  },
  {
    id: 'pq-social',
    domain: 'Social Interaction',
    question: 'Does your child enjoy back-and-forth interaction with family members or familiar peers?',
  },
  {
    id: 'pq-gaze',
    domain: 'Eye Gaze & Joint Attention',
    question: 'Does your child look toward objects or people you point out and share moments of interest?',
  },
  {
    id: 'pq-play',
    domain: 'Play',
    question: 'Does your child engage in varied pretend play or age-appropriate games with others?',
  },
  {
    id: 'pq-attention',
    domain: 'Attention',
    question: 'Can your child stay with a preferred activity or simple routine task for an age-expected span?',
  },
  {
    id: 'pq-activity',
    domain: 'Activity Levels',
    question: 'Does your child frequently seem constantly on the move even during quiet family routines?',
  },
  {
    id: 'pq-impulsivity',
    domain: 'Impulsivity',
    question: 'Does your child find it hard to wait for turns or pause before acting in everyday situations?',
  },
  {
    id: 'pq-memory',
    domain: 'Memory',
    question: 'Does your child remember familiar daily routines, names, or recent stories?',
  },
  {
    id: 'pq-instructions',
    domain: 'Understanding Instructions',
    question: 'Does your child understand two-step everyday instructions spoken in their home language?',
  },
  {
    id: 'pq-emotion',
    domain: 'Emotional Regulation',
    question: 'Does your child recover with caregiver support after frustration or sudden changes in routine?',
  },
  {
    id: 'pq-daily',
    domain: 'Daily Living',
    question: 'Does your child manage age-expected self-care tasks (dressing, eating, packing school bag)?',
  },
  {
    id: 'pq-sensory',
    domain: 'Sensory Responses',
    question: 'Does your child show strong discomfort with everyday sounds, textures, lights, or crowded places?',
  },
  {
    id: 'pq-intelligibility',
    domain: 'Speech Intelligibility',
    question: 'Can unfamiliar listeners generally understand your child’s speech in their primary language?',
  },
];

export const SPEECH_SOUND_GROUPS = [
  '/r/ (English)',
  'र (Hindi Tap/Trill)',
  '/l/ (English)',
  'ल (Hindi)',
  '/s/ (English)',
  'स (Hindi)',
  '/sh/ (English)',
  'श (Hindi)',
  '/ch/ (English)',
  '/th/ (English)',
  '/k/ & /g/',
  '/p/ & /b/',
  '/t/ & /d/',
  '/f/ & /v/',
  'Consonant Clusters',
  'Vowel Production',
  'Other Consonants',
] as const;

export function isClinicalSpecialist(role: UserRole): boolean {
  return CLINICAL_SPECIALIST_ROLES.includes(role);
}

export function canEnterClinicalDiagnosis(role: UserRole): boolean {
  return role === 'clinical_psychologist';
}

export function canApproveSpeechTherapyPlan(role: UserRole): boolean {
  return role === 'slp' || role === 'clinical_psychologist';
}

export function canApproveMultidisciplinaryPlan(role: UserRole): boolean {
  return role === 'slp' || role === 'clinical_psychologist' || role === 'audiologist' || role === 'special_educator';
}

export function canRecordHearingAssessment(role: UserRole): boolean {
  return role === 'audiologist' || role === 'slp';
}

export function detectMedicalRedFlags(history?: Partial<DevelopmentalHistoryRecord> | null): {
  urgentMedicalFlag: boolean;
  reasons: string[];
} {
  if (!history) return { urgentMedicalFlag: false, reasons: [] };
  const reasons: string[] = [];
  if (history.regressionOrSkillLoss) {
    reasons.push(
      history.regressionDetails?.trim()
        ? `Reported skill regression: ${history.regressionDetails.trim()}`
        : 'Reported loss or regression of previously acquired skills — recommend timely paediatric/medical evaluation.',
    );
  }
  if (history.seizuresOrMedicalRedFlags) {
    reasons.push(
      history.medicalRedFlagDetails?.trim()
        ? `Reported medical symptom flag: ${history.medicalRedFlagDetails.trim()}`
        : 'Reported seizures or acute medical symptoms — recommend prompt medical assessment.',
    );
  }
  return {
    urgentMedicalFlag: reasons.length > 0,
    reasons,
  };
}

/**
 * Generates a structured non-diagnostic screening summary for clinician review.
 * Never outputs a clinical diagnosis; flags workflow indicators only.
 */
export function synthesizeScreeningIndicators(params: {
  history?: DevelopmentalHistoryRecord;
  parentQ?: ParentQuestionnaireRecord;
  teacherObs?: TeacherObservationRecord;
  domains: ClinicalDomain[];
}): {
  suggestedWorkflowStatus: ScreeningWorkflowStatus;
  areasOfStrength: string[];
  areasRequiringFurtherAssessment: string[];
  recommendedSpecialistReferral: string;
  urgentMedicalFlag: boolean;
  urgentMedicalReason?: string;
} {
  const redFlags = detectMedicalRedFlags(params.history);
  const strengths: string[] = [];
  const reviewAreas: string[] = [];

  if (params.parentQ?.parentTopStrengths?.trim()) {
    strengths.push(`Home strength: ${params.parentQ.parentTopStrengths.trim()}`);
  }
  if (params.teacherObs?.observableStrengths?.trim()) {
    strengths.push(`Classroom strength: ${params.teacherObs.observableStrengths.trim()}`);
  }
  if (params.parentQ) {
    const concernItems = params.parentQ.items.filter(
      (i) =>
        (i.domain === 'Activity Levels' ||
          i.domain === 'Impulsivity' ||
          i.domain === 'Sensory Responses')
          ? i.response === 'Yes' || i.response === 'Sometimes'
          : i.response === 'No' || i.response === 'Sometimes',
    );
    concernItems.slice(0, 4).forEach((item) => {
      reviewAreas.push(`Parent observation — ${item.domain}: ${item.response}${item.explanation ? ` (${item.explanation})` : ''}`);
    });
  }
  if (params.teacherObs) {
    if (
      params.teacherObs.speechIntelligibility === 'Clear to familiar listeners' ||
      params.teacherObs.speechIntelligibility === 'Difficult to understand in class'
    ) {
      reviewAreas.push(`Classroom speech intelligibility: ${params.teacherObs.speechIntelligibility}`);
    }
    if (params.teacherObs.readingWritingConcerns.trim().length > 10) {
      reviewAreas.push(`Classroom literacy observation: ${params.teacherObs.readingWritingConcerns.trim()}`);
    }
  }
  if (strengths.length === 0) {
    strengths.push('Engaged family/teacher collaboration initiated for developmental support.');
  }

  let suggestedWorkflowStatus: ScreeningWorkflowStatus = 'Monitor development';
  let referral = 'Class teacher observation review and follow-up check-in in 6 weeks.';

  if (redFlags.urgentMedicalFlag) {
    suggestedWorkflowStatus = 'Urgent clinical referral recommended';
    referral = 'Timely referral to Developmental Paediatrician / Paediatric Neurologist for medical evaluation.';
  } else if (params.domains.includes('down_syndrome_referral')) {
    suggestedWorkflowStatus = 'Professional assessment recommended';
    referral = 'Medical specialist & clinical genetics consultation (plus hearing, vision & developmental paediatric review).';
  } else if (
    params.domains.includes('autism_spectrum_indicators') ||
    params.domains.includes('adhd_indicators') ||
    params.domains.includes('intellectual_developmental_functioning')
  ) {
    suggestedWorkflowStatus = 'Professional assessment recommended';
    referral = 'Comprehensive multidisciplinary evaluation by Clinical Psychologist / Developmental Paediatrician.';
  } else if (
    params.domains.includes('speech_language_delays') ||
    params.domains.includes('hearing_communication_concerns')
  ) {
    suggestedWorkflowStatus = reviewAreas.length >= 2 ? 'Professional assessment recommended' : 'Further screening recommended';
    referral = 'Speech-Language Pathologist (SLP) & Audiologist assessment accounting for home language profile.';
  } else if (reviewAreas.length >= 2) {
    suggestedWorkflowStatus = 'Further screening recommended';
    referral = 'Targeted specialist screening with Special Educator / Counsellor and parent consultation.';
  } else if (reviewAreas.length === 0) {
    suggestedWorkflowStatus = 'No immediate concern identified';
    referral = 'Continue supportive classroom routines; re-screen only if new observations arise.';
  }

  return {
    suggestedWorkflowStatus,
    areasOfStrength: strengths,
    areasRequiringFurtherAssessment:
      reviewAreas.length > 0
        ? reviewAreas
        : ['Await complete parent & teacher observation inputs before specialist determination.'],
    recommendedSpecialistReferral: referral,
    urgentMedicalFlag: redFlags.urgentMedicalFlag,
    urgentMedicalReason: redFlags.reasons.join(' '),
  };
}

/**
 * Generates original, culturally relevant English/Hindi articulation practice drafts
 * strictly flagged as 'Pending SLP Review' until approved by a qualified SLP.
 */
export function generateArticulationExerciseDraft(params: {
  schoolId: string;
  target: SpeechSoundTarget;
  stage: ArticulationStageNumber;
}): SpeechExerciseItem {
  const stageMeta = ARTICULATION_STAGES.find((s) => s.stage === params.stage) ?? ARTICULATION_STAGES[0];
  const isHindi = params.target.language.toLowerCase().includes('hindi');
  const sound = params.target.targetSound;

  const wordBankBySound: Record<string, { syllables: string[]; words: string[]; phrases: string[]; sentences: string[] }> = {
    '/r/': {
      syllables: ['ra', 'ree', 'roo', 'ar', 'ear', 'ara'],
      words: ['rain', 'red', 'rabbit', 'carrot', 'parrot', 'orange', 'star', 'car'],
      phrases: ['red ribbon', 'bright rainbow', 'running rabbit', 'ripe orange'],
      sentences: [
        'Rohan saw a red robin near the river.',
        'The rabbit ate a crunchy carrot in the garden.',
        'We drew a bright star on the green chart.',
      ],
    },
    'र': {
      syllables: ['रा', 'री', 'रु', 'अर', 'रम', 'तर'],
      words: ['रथ (rath)', 'रोटी (roti)', 'रेल (rail)', 'मटर (matar)', 'कमरा (kamra)', 'घर (ghar)', 'तारा (tara)'],
      phrases: ['लाल रथ', 'गरम रोटी', 'मीठा मटर', 'सुंदर घर'],
      sentences: [
        'रवि रोज़ सुबह पार्क में सैर करता है।',
        'हमने आसमान में चमकता तारा देखा।',
        'दादी ने गरम रोटी और मटर की सब्ज़ी बनाई।',
      ],
    },
    '/s/': {
      syllables: ['sa', 'see', 'soo', 'as', 'iss', 'asa'],
      words: ['sun', 'soap', 'sand', 'pencil', 'basket', 'lesson', 'bus', 'grass'],
      phrases: ['sunny sky', 'silver spoon', 'school bus', 'soft sand'],
      sentences: [
        'Sonia placed six pencils inside the basket.',
        'The school bus stopped beside the sunny park.',
        'Samir sang a soft song during assembly.',
      ],
    },
    '/l/': {
      syllables: ['la', 'lee', 'loo', 'al', 'el', 'ala'],
      words: ['leaf', 'lamp', 'lemon', 'yellow', 'balloon', 'pillow', 'bell', 'ball'],
      phrases: ['little leaf', 'yellow balloon', 'loud bell', 'light lamp'],
      sentences: [
        'Leela lifted the yellow lantern near the hall.',
        'A little green leaf landed on the blue ball.',
        'The school bell rang after lunch.',
      ],
    },
  };

  const normalizedKey = sound.includes('र')
    ? 'र'
    : sound.toLowerCase().includes('/r/')
      ? '/r/'
      : sound.toLowerCase().includes('/s/')
        ? '/s/'
        : sound.toLowerCase().includes('/l/')
          ? '/l/'
          : isHindi
            ? 'र'
            : '/r/';

  const bank = wordBankBySound[normalizedKey];

  let practiceItems: string[];
  let studentInstructions: string;
  let therapistInstructions: string;
  let difficultyLevel: SpeechExerciseItem['difficultyLevel'] = 'Foundational';

  switch (params.stage) {
    case 1:
      practiceItems = [
        `Listen as the therapist reads pairs and raise a card when you hear ${sound}: ${bank.words.slice(0, 4).join(', ')}`,
        `Spot the target sound ${sound} at the start or middle of spoken words.`,
        'Sort 6 picture cards into "Has target sound" and "Different sound" baskets.',
      ];
      studentInstructions = `Put on your listening ears! Listen carefully for the ${sound} sound and tap the matching card.`;
      therapistInstructions = `Present auditory bombardment and minimal-pair contrast without requiring oral production yet. Confirm auditory discrimination of ${sound} (${params.target.language}).`;
      difficultyLevel = 'Foundational';
      break;
    case 2:
      practiceItems = [
        `Gentle placement modelling for ${sound} using visual/mirror cues where comfortable.`,
        `5 relaxed, unhurried single-sound trials with positive feedback.`,
        `Contrast smooth target placement vs. habitual substitution (${params.target.substitutionDetail || 'recorded pattern'}).`,
      ];
      studentInstructions = `Watch how the sound is made, take your time, and try making a clear, relaxed ${sound} sound.`;
      therapistInstructions = `Establish stimulable production of ${sound} in isolation using SLP-selected phonetic placement or shaping cues. Do not force repetitive drilling if fatigued.`;
      difficultyLevel = 'Foundational';
      break;
    case 3:
      practiceItems = bank.syllables.map((syl) => `Practice syllable "${syl}" × 3 relaxed trials with visual pacing.`);
      studentInstructions = `Blend the ${sound} sound gently with each vowel sound like stepping stones.`;
      therapistInstructions = `Target ${sound} in CV/VC/VCV syllables (${bank.syllables.join(', ')}). Track cueing level and stop once consistent ease is achieved.`;
      difficultyLevel = 'Guided';
      break;
    case 4:
      practiceItems = bank.words.map((w) => `Picture naming & word recognition: "${w}"`);
      studentInstructions = `Name each picture clearly and enjoy spotting your ${sound} sound inside every word.`;
      therapistInstructions = `Target ${sound} across SLP-selected positions (${params.target.affectedPositions.join(', ') || 'initial/medial'}). Record accuracy per trial without penalising regional accent.`;
      difficultyLevel = 'Guided';
      break;
    case 5:
      practiceItems = bank.phrases.map((p) => `Say functional phrase naturally: "${p}"`);
      studentInstructions = `Put two or three words together in a fun mini-phrase!`;
      therapistInstructions = `Bridge word-level accuracy into 2–3 word functional phrases. Encourage natural prosody and comfortable pacing.`;
      difficultyLevel = 'Intermediate';
      break;
    case 6:
      practiceItems = bank.sentences;
      studentInstructions = `Read or repeat each sentence aloud, or describe the matching picture in your own words.`;
      therapistInstructions = `Model structured sentence production and picture description with ${sound}. Note carryover accuracy vs. word-level baseline.`;
      difficultyLevel = 'Intermediate';
      break;
    case 7:
      practiceItems = [
        `3-minute picture-sequence storytelling using at least 4 words with ${sound}.`,
        'Classroom Q&A role-play (sharing favourite book, science project, or weekend memory).',
        'Natural turn-taking conversation with gentle self-check cue.',
      ];
      studentInstructions = `Tell a short story in your own words — focus on sharing your ideas clearly and comfortably.`;
      therapistInstructions = `Facilitate spontaneous conversational generalisation across storytelling and school-relevant dialogue. Record conversational accuracy.`;
      difficultyLevel = 'Generalisation';
      break;
    case 8:
    default:
      practiceItems = [
        'Self-monitoring check-in during 2-minute reading or narration.',
        'Home carryover conversation game with family (5–8 minutes, relaxed).',
        'Periodic reassessment probe across 10 target words and natural dialogue.',
      ];
      studentInstructions = `Notice your own clear speech during everyday talking and celebrate your steady progress!`;
      therapistInstructions = `Verify maintenance and cross-environment carryover (home + classroom). Schedule periodic SLP reassessment.`;
      difficultyLevel = 'Generalisation';
      break;
  }

  return {
    id: `ex-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    schoolId: params.schoolId,
    studentId: params.target.studentId,
    targetId: params.target.id,
    title: `Stage ${params.stage}: ${stageMeta.label} — ${sound} (${params.target.language})`,
    targetSound: sound,
    targetLanguage: params.target.language,
    stage: params.stage,
    stageLabel: stageMeta.label,
    learningObjective: `${stageMeta.focus} for target ${sound} in ${params.target.language}.`,
    therapistInstructions,
    studentInstructions,
    requiredMaterials: ['Picture prompt cards', 'Optional handheld mirror (if suitable)', 'Quiet table space'],
    practiceItems,
    difficultyLevel,
    suggestedDurationMin: params.stage <= 3 ? 10 : 15,
    targetAttempts: params.stage <= 2 ? 10 : 15,
    reviewStatus: 'Pending SLP Review',
    assignedToHomePractice: false,
  };
}

export function getEvidenceInformedFluencyActivities(approaches: FluencyApproachType[]): Array<{
  id: string;
  title: string;
  category: string;
  description: string;
  homeFriendly: boolean;
}> {
  const catalog = [
    {
      id: 'fl-act-pci',
      approach: 'Parent-Child Interaction Approach' as FluencyApproachType,
      title: 'Special 1-on-1 Unhurried Play & Talk Time',
      category: 'Parent-Child Communication',
      description:
        'Spend 10 relaxed minutes following the child’s lead in play or drawing, listening to what they say rather than how smoothly they say it, with calm natural turn-taking.',
      homeFriendly: true,
    },
    {
      id: 'fl-act-story',
      approach: 'Communication Participation & Confidence' as FluencyApproachType,
      title: 'Picture-Card Storytelling & Idea Sharing',
      category: 'Storytelling & Participation',
      description:
        'Take turns inventing a fun story from 4 picture cards. Celebrate creative ideas and joyful communication rather than counting fluent words.',
      homeFriendly: true,
    },
    {
      id: 'fl-act-mod',
      approach: 'Stuttering Modification Approach' as FluencyApproachType,
      title: 'Easy, Comfortable Talking Exploration (SLP-Guided)',
      category: 'Stuttering Modification',
      description:
        'Clinician-guided exploration of gentle, tension-free transitions during moments of stammering without asking the child to stop and repeat words.',
      homeFriendly: false,
    },
    {
      id: 'fl-act-classroom',
      approach: 'Family Counselling & Classroom Support' as FluencyApproachType,
      title: 'Supportive Classroom Turn-Taking & Partner Reading',
      category: 'Classroom Communication Support',
      description:
        'Allow extra comfortable wait time, avoid interrupting or finishing sentences, and offer choice in oral participation (small group or partner reading).',
      homeFriendly: false,
    },
    {
      id: 'fl-act-confidence',
      approach: 'Cognitive & Emotional Communication Support' as FluencyApproachType,
      title: 'My Communication Comfort Map',
      category: 'Speaking Confidence & Feelings',
      description:
        'Child maps speaking situations that feel easy, medium, or tricky, building self-advocacy and pride in sharing their voice.',
      homeFriendly: true,
    },
  ];
  const matched = catalog.filter((c) => approaches.includes(c.approach));
  const list = matched.length > 0 ? matched : catalog.slice(0, 3);
  return list.map(({ approach: _unused, ...rest }) => rest);
}

/**
 * Enforces strict clinical confidentiality & role-based data redaction on the server.
 * Teachers never see raw confidential clinical records; parents/students see only approved items.
 */
export function sanitizeClinicalBundleForRole(params: {
  bundle: ClinicalWorkspaceBundle;
  role: UserRole;
  visibleStudentIds: Set<string>;
  userId: string;
}): ClinicalWorkspaceBundle {
  const { bundle, role, visibleStudentIds } = params;

  if (role === 'accountant') {
    return {
      consents: [],
      developmentalHistories: [],
      parentQuestionnaires: [],
      teacherObservations: [],
      screeningCases: [],
      conditionAssessments: [],
      speechSoundTargets: [],
      speechExercises: [],
      fluencyProfiles: [],
      therapyPlans: [],
      therapySessionLogs: [],
      audioPracticeRecords: [],
      parentHomePracticeLogs: [],
      clinicalReports: [],
      clinicalAccessLogs: [],
      specialists: [],
    };
  }

  const isSpecialist = isClinicalSpecialist(role);
  const isMgmt = MANAGEMENT_ROLES.includes(role);
  const isTeacher = role === 'teacher';
  const isParent = role === 'parent';
  const isStudent = role === 'student';

  const inScope = <T extends { studentId: string }>(arr: T[]) =>
    isSpecialist || isMgmt ? arr : arr.filter((item) => visibleStudentIds.has(item.studentId));

  if (isStudent) {
    const myPlans = inScope(bundle.therapyPlans).filter(
      (p) => p.approvalStatus === 'Approved & Active',
    );
    const activePlanIds = new Set(myPlans.map((p) => p.id));
    return {
      consents: [],
      developmentalHistories: [],
      parentQuestionnaires: [],
      teacherObservations: [],
      screeningCases: [],
      conditionAssessments: [],
      speechSoundTargets: [],
      speechExercises: inScope(bundle.speechExercises)
        .filter((e) => e.reviewStatus === 'Approved by SLP' && e.assignedToHomePractice)
        .map((e) => ({ ...e, therapistInstructions: '' })),
      fluencyProfiles: inScope(bundle.fluencyProfiles)
        .filter((f) => f.slpApproved)
        .map((f) => ({
          ...f,
          observedPatterns: {
            soundRepetitions: 'Not observed',
            syllableRepetitions: 'Not observed',
            wordRepetitions: 'Not observed',
            prolongations: 'Not observed',
            blocks: 'Not observed',
            physicalTension: '',
            secondaryBehaviours: '',
            speakingAvoidance: '',
          },
          familyHistory: '',
          functionalImpactSummary: '',
          approvedPracticeActivities: f.approvedPracticeActivities.filter((a) => a.homeFriendly),
        })),
      therapyPlans: myPlans.map((p) => ({
        ...p,
        confirmedClinicalDiagnosis: undefined,
        assessmentSummary: 'Your approved communication & learning practice plan',
        teacherClassroomGuidance: '',
      })),
      therapySessionLogs: [],
      audioPracticeRecords: [],
      parentHomePracticeLogs: inScope(bundle.parentHomePracticeLogs).filter((l) =>
        activePlanIds.has(l.planId),
      ),
      clinicalReports: [],
      clinicalAccessLogs: [],
      specialists: bundle.specialists,
    };
  }

  if (isParent) {
    const approvedPlans = inScope(bundle.therapyPlans)
      .filter((p) => p.approvalStatus === 'Approved & Active' || p.approvalStatus === 'Completed')
      .map((p) => ({
        ...p,
        teacherClassroomGuidance: p.teacherClassroomGuidance,
      }));
    return {
      consents: inScope(bundle.consents),
      developmentalHistories: inScope(bundle.developmentalHistories),
      parentQuestionnaires: inScope(bundle.parentQuestionnaires),
      teacherObservations: [], // Confidential teacher raw observation stays for specialist synthesis
      screeningCases: inScope(bundle.screeningCases)
        .filter((c) => c.completionStatus === 'Completed' || c.completionStatus === 'Under Specialist Review')
        .map((c) => ({ ...c, confidentialNotes: undefined })),
      conditionAssessments: [],
      speechSoundTargets: inScope(bundle.speechSoundTargets).filter((t) => t.slpApproved),
      speechExercises: inScope(bundle.speechExercises).filter(
        (e) => e.reviewStatus === 'Approved by SLP' && e.assignedToHomePractice,
      ),
      fluencyProfiles: inScope(bundle.fluencyProfiles)
        .filter((f) => f.slpApproved)
        .map((f) => ({
          ...f,
          approvedPracticeActivities: f.approvedPracticeActivities.filter((a) => a.homeFriendly),
        })),
      therapyPlans: approvedPlans,
      therapySessionLogs: inScope(bundle.therapySessionLogs).map((s) => ({
        ...s,
        therapistNotes: s.nextRecommendedActivity
          ? `Next step: ${s.nextRecommendedActivity}`
          : 'Session completed with specialist.',
      })),
      audioPracticeRecords: inScope(bundle.audioPracticeRecords).filter((a) => a.consentVerified),
      parentHomePracticeLogs: inScope(bundle.parentHomePracticeLogs),
      clinicalReports: inScope(bundle.clinicalReports).filter(
        (r) => r.status === 'Signed & Approved' && r.sharedWithParent,
      ),
      clinicalAccessLogs: [],
      specialists: bundle.specialists,
    };
  }

  if (isTeacher) {
    // Teachers can record observations and see ONLY authorized classroom support recommendations
    // NEVER confidential clinical notes, psychological diagnoses, medical/genetic records, or raw clinical reports.
    return {
      consents: [],
      developmentalHistories: [],
      parentQuestionnaires: [],
      teacherObservations: inScope(bundle.teacherObservations),
      screeningCases: inScope(bundle.screeningCases).map((c) => ({
        ...c,
        confidentialNotes: undefined,
        areasRequiringFurtherAssessment: c.authorizedClassroomSummary
          ? [c.authorizedClassroomSummary]
          : ['Specialist review in progress — continue supportive classroom observation.'],
        recommendedSpecialistReferral: 'Managed by school specialist team',
      })),
      conditionAssessments: [],
      speechSoundTargets: [],
      speechExercises: [],
      fluencyProfiles: inScope(bundle.fluencyProfiles)
        .filter((f) => f.slpApproved && Boolean(f.classroomSupportGuidance))
        .map((f) => ({
          ...f,
          familyHistory: '',
          studentFeelingsAndExperience: '',
          previousIntervention: '',
          observedPatterns: {
            soundRepetitions: 'Not observed',
            syllableRepetitions: 'Not observed',
            wordRepetitions: 'Not observed',
            prolongations: 'Not observed',
            blocks: 'Not observed',
            physicalTension: '',
            secondaryBehaviours: '',
            speakingAvoidance: '',
          },
        })),
      therapyPlans: inScope(bundle.therapyPlans)
        .filter((p) => p.approvalStatus === 'Approved & Active')
        .map((p) => ({
          ...p,
          confirmedClinicalDiagnosis: undefined,
          diagnosisEnteredBy: undefined,
          diagnosisCredentials: undefined,
          assessmentSummary: 'Authorised classroom support plan (confidential clinical details restricted)',
          homePracticeRecommendations: '',
          parentGuidance: '',
        })),
      therapySessionLogs: [],
      audioPracticeRecords: [],
      parentHomePracticeLogs: [],
      clinicalReports: inScope(bundle.clinicalReports)
        .filter((r) => r.status === 'Signed & Approved' && r.sharedClassroomSummaryWithTeacher)
        .map((r) => ({
          ...r,
          clinicalAssessmentFindings: undefined,
          professionalDiagnosis: undefined,
          screeningFindings: undefined,
          parentFriendlySummary: r.teacherAuthorizedSummary || 'See classroom recommendations below.',
        })),
      clinicalAccessLogs: [],
      specialists: bundle.specialists,
    };
  }

  if (isMgmt) {
    // Management monitors service utilisation, approvals, and authorized reports — without exposing private clinical notes
    return {
      consents: bundle.consents,
      developmentalHistories: [],
      parentQuestionnaires: [],
      teacherObservations: bundle.teacherObservations,
      screeningCases: bundle.screeningCases.map((c) => ({
        ...c,
        confidentialNotes: undefined,
      })),
      conditionAssessments: bundle.conditionAssessments.map((a) => ({
        ...a,
        confidentialClinicalNotes: undefined,
      })),
      speechSoundTargets: bundle.speechSoundTargets,
      speechExercises: bundle.speechExercises,
      fluencyProfiles: bundle.fluencyProfiles,
      therapyPlans: bundle.therapyPlans,
      therapySessionLogs: bundle.therapySessionLogs.map((s) => ({
        ...s,
        therapistNotes: 'Recorded by specialist (confidential note restricted to clinical team)',
      })),
      audioPracticeRecords: [],
      parentHomePracticeLogs: bundle.parentHomePracticeLogs,
      clinicalReports: bundle.clinicalReports.filter((r) => r.sharedWithManagement),
      clinicalAccessLogs: bundle.clinicalAccessLogs,
      specialists: bundle.specialists,
    };
  }

  // Authorised clinical specialists receive full school-scoped clinical workspace
  return bundle;
}

export function escapeHtmlForClinicalPrint(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildClinicalReportPrintHtml(report: ClinicalReportRecord, schoolName: string): string {
  const typeLabel: Record<ClinicalReportRecord['reportType'], string> = {
    developmental_screening: 'Developmental Screening Report (Non-Diagnostic Workflow Summary)',
    speech_assessment: 'Speech & Language Assessment Report',
    therapy_progress: 'Individualised Therapy Progress Report',
    professional_clinical: 'Professional Clinical Report (Clinician-Signed)',
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtmlForClinicalPrint(report.title)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; max-width: 820px; margin: 32px auto; padding: 0 20px; line-height: 1.55; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
    .kicker { font-size: 12px; color: #475569; margin: 0 0 4px; }
    h1 { font-size: 22px; margin: 0 0 6px; }
    .meta { font-size: 13px; color: #334155; display: flex; flex-wrap: wrap; gap: 16px; }
    .notice { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #334155; margin: 16px 0; }
    h2 { font-size: 15px; margin: 20px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    p, li { font-size: 13.5px; }
    .signature { margin-top: 28px; padding-top: 14px; border-top: 1px solid #cbd5e1; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <p class="kicker">${escapeHtmlForClinicalPrint(schoolName)} · Rai Plus Clinical &amp; Developmental Care 360°</p>
    <h1>${escapeHtmlForClinicalPrint(report.title)}</h1>
    <div class="meta">
      <span><strong>Type:</strong> ${escapeHtmlForClinicalPrint(typeLabel[report.reportType])}</span>
      <span><strong>Student:</strong> ${escapeHtmlForClinicalPrint(report.studentName)} (${escapeHtmlForClinicalPrint(report.classSection)})</span>
      <span><strong>Date:</strong> ${escapeHtmlForClinicalPrint(report.reportDate)}</span>
      <span><strong>Status:</strong> ${escapeHtmlForClinicalPrint(report.status)}</span>
    </div>
  </div>
  <div class="notice">
    <strong>Clinical Governance Notice:</strong> Screening indicators support timely human review and specialist referral and are not standalone diagnoses. Any clinical diagnosis listed below was entered and signed strictly by an appropriately qualified professional within their scope of practice. Confidential — authorised distribution only.
  </div>
  ${report.screeningFindings ? `<h2>Screening Findings</h2><p>${escapeHtmlForClinicalPrint(report.screeningFindings)}</p>` : ''}
  ${report.languageAndSpeechProfile ? `<h2>Language &amp; Speech Profile</h2><p>${escapeHtmlForClinicalPrint(report.languageAndSpeechProfile)}</p>` : ''}
  ${report.clinicalAssessmentFindings ? `<h2>Clinical Assessment Findings</h2><p>${escapeHtmlForClinicalPrint(report.clinicalAssessmentFindings)}</p>` : ''}
  ${report.baselineAndProgressSummary ? `<h2>Baseline &amp; Progress Summary</h2><p>${escapeHtmlForClinicalPrint(report.baselineAndProgressSummary)}</p>` : ''}
  ${report.professionalDiagnosis ? `<h2>Professional Diagnosis (Clinician-Entered)</h2><p>${escapeHtmlForClinicalPrint(report.professionalDiagnosis)}</p>` : ''}
  <h2>Parent-Friendly Summary</h2>
  <p>${escapeHtmlForClinicalPrint(report.parentFriendlySummary)}</p>
  <h2>Recommendations</h2>
  <ul>${report.recommendations.map((r) => `<li>${escapeHtmlForClinicalPrint(r)}</li>`).join('')}</ul>
  ${report.teacherAuthorizedSummary ? `<h2>Authorised Classroom Support Guidance</h2><p>${escapeHtmlForClinicalPrint(report.teacherAuthorizedSummary)}</p>` : ''}
  <div class="signature">
    <div><strong>Report Author:</strong> ${escapeHtmlForClinicalPrint(report.authorName)}</div>
    <div><strong>Credentials:</strong> ${escapeHtmlForClinicalPrint(report.authorCredentials)}${report.authorRegistrationNo ? ` · Reg. No: ${escapeHtmlForClinicalPrint(report.authorRegistrationNo)}` : ''}</div>
    <div><strong>Signed / Issued:</strong> ${escapeHtmlForClinicalPrint(report.signedAt || report.reportDate)}</div>
  </div>
</body>
</html>`;
}

export function buildClinicalAuditSummary(logs: ClinicalAccessLogEntry[]): {
  totalEvents: number;
  reportReads: number;
  planApprovals: number;
  medicalFlags: number;
} {
  return {
    totalEvents: logs.length,
    reportReads: logs.filter((l) => l.action === 'viewed_report' || l.action === 'exported_report').length,
    planApprovals: logs.filter((l) => l.action === 'approved_plan').length,
    medicalFlags: logs.filter((l) => l.action === 'flagged_medical_review').length,
  };
}
