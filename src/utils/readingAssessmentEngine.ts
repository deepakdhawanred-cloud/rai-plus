import type {
  ClassAssessmentTier,
  FluencyBurstStyle,
  MispronouncedWordDiagnostic,
  ReadingBand,
} from '../types';

export interface PassageToken {
  index: number;
  raw: string;
  normalized: string;
  sentenceIndex: number;
  isSentenceEnd: boolean;
  hasClauseBoundary: boolean;
  difficulty: 'core' | 'moderate' | 'challenge';
  phoneticHint: string;
}

export interface ComprehensionQuestion {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface SentenceTranslationPrompt {
  id: string;
  englishSentence: string;
  modelHindiDevanagari: string;
  modelHinglish: string;
  /** Semantic concept groups: each array contains acceptable Hindi (Devanagari) OR Hinglish stems for one core idea in the sentence */
  conceptKeywordGroups: Array<{
    conceptLabel: string;
    keywords: string[];
  }>;
  hintGlossary: Array<{ english: string; hindi: string }>;
}

export interface GradedReadingPassage {
  id: string;
  tier: ClassAssessmentTier;
  tierLabel: string;
  gradeRangeLabel: string;
  targetWpm: number;
  title: string;
  subjectContext: string;
  difficultyNotes: string;
  text: string;
  phoneticOverrides?: Record<string, string>;
  comprehensionQuestions: ComprehensionQuestion[];
  translationTask: SentenceTranslationPrompt;
}

export interface WordReadEvent {
  wordIndex: number;
  timestampMs: number;
  mispronounced?: boolean;
  spokenAs?: string;
}

export interface FluencyBurstSegment {
  burstIndex: number;
  wordIndices: number[];
  wordCount: number;
  sentenceIndex: number;
  isWholeSentence: boolean;
  category: 'one_word' | 'two_words' | 'three_plus' | 'whole_sentence';
  textPreview: string;
}

export interface PauseCadenceMetrics {
  totalPauses: number;
  naturalBoundaryPauses: number;
  midSentenceHesitations: number;
  meanPauseMs: number;
  longestPauseMs: number;
  pausingQualityPct: number;
  prosodySummary:
    | 'Expressive & Natural Pacing'
    | 'Steady Connected Reading'
    | 'Developing Phrasing'
    | 'Frequent Mid-Sentence Hesitations';
}

export interface ReadingSpeedMetrics {
  grossWpm: number;
  correctWpm: number;
  activeSpeakingWpm: number;
  totalPausedMs: number;
  activeSpeakingMs: number;
}

export interface FluencyBurstProfile {
  bursts: FluencyBurstSegment[];
  avgBurstWords: number;
  maxBurstWords: number;
  burstOneWordPct: number;
  burstTwoWordsPct: number;
  burstThreePlusPct: number;
  burstWholeSentencePct: number;
  dominantFluencyStyle: FluencyBurstStyle;
  pauseMetrics: PauseCadenceMetrics;
}

export interface ReadingTranscriptEvaluation {
  matchedIndices: number[];
  mispronouncedWords: MispronouncedWordDiagnostic[];
  pronunciationPct: number;
  completionPct: number;
  accuracyPct: number;
}

export interface TranslationEvaluation {
  scorePct: number;
  matchedConcepts: string[];
  missingConcepts: string[];
  feedbackSummary: string;
}

export const CLASS_READING_TIERS: Array<{
  tier: ClassAssessmentTier;
  label: string;
  gradeRange: string;
  targetWpm: number;
  pauseThresholdMs: number;
}> = [
  {
    tier: 'class_1_2',
    label: 'Foundational (Classes 1–2)',
    gradeRange: 'Class 1 to 2',
    targetWpm: 55,
    pauseThresholdMs: 950,
  },
  {
    tier: 'class_3_5',
    label: 'Primary Core (Classes 3–5)',
    gradeRange: 'Class 3 to 5',
    targetWpm: 85,
    pauseThresholdMs: 800,
  },
  {
    tier: 'class_6_8',
    label: 'Middle Fluency (Classes 6–8)',
    gradeRange: 'Class 6 to 8',
    targetWpm: 115,
    pauseThresholdMs: 700,
  },
  {
    tier: 'class_9_10',
    label: 'Secondary Academic (Classes 9–10)',
    gradeRange: 'Class 9 to 10',
    targetWpm: 140,
    pauseThresholdMs: 650,
  },
  {
    tier: 'class_11_12',
    label: 'Senior Analytical (Classes 11–12)',
    gradeRange: 'Class 11 to 12',
    targetWpm: 165,
    pauseThresholdMs: 600,
  },
];

export const READING_PASSAGE_BANK: GradedReadingPassage[] = [
  // Class 1-2
  {
    id: 'read-c12-garden',
    tier: 'class_1_2',
    tierLabel: 'Foundational (Classes 1–2)',
    gradeRangeLabel: 'Class 1–2',
    targetWpm: 55,
    title: 'Aasha and the School Garden',
    subjectContext: 'English & EVS · Short Sight Words',
    difficultyNotes: 'Short CVC & sight words with gentle compound words (sunlight, morning, flowers).',
    text: 'Every morning Aasha walks into her school garden with a small blue can. She gives fresh water to the tiny green plants near the gate. Warm sunlight helps the yellow flowers open wide before the bell rings.',
    phoneticOverrides: {
      morning: 'MAWR-ning',
      sunlight: 'SUN-lyt',
      flowers: 'FLOU-urz',
      yellow: 'YEL-oh',
    },
    comprehensionQuestions: [
      {
        id: 'q1',
        prompt: 'When does Aasha visit the school garden?',
        options: ['Every morning', 'Late at night', 'Only on Sundays', 'After lunch'],
        correctIndex: 0,
        explanation: 'The very first sentence states: "Every morning Aasha walks into her school garden."',
      },
      {
        id: 'q2',
        prompt: 'What does Aasha carry to water the plants?',
        options: ['A red bucket', 'A small blue can', 'A glass bottle', 'A wooden bowl'],
        correctIndex: 1,
        explanation: 'She carries "a small blue can" to give water to the green plants.',
      },
      {
        id: 'q3',
        prompt: 'What helps the yellow flowers open wide?',
        options: ['Cold wind', 'Heavy rain', 'Warm sunlight', 'School bell'],
        correctIndex: 2,
        explanation: '"Warm sunlight helps the yellow flowers open wide before the bell rings."',
      },
    ],
    translationTask: {
      id: 'tr-c12-garden',
      englishSentence: 'She gives fresh water to the tiny green plants near the gate.',
      modelHindiDevanagari: 'वह दरवाज़े के पास छोटे हरे पौधों को ताज़ा पानी देती है।',
      modelHinglish: 'Vah darwaze ke paas chhote hare paudhon ko taza paani deti hai.',
      conceptKeywordGroups: [
        { conceptLabel: 'She / gives water', keywords: ['वह', 'पानी', 'देती', 'vah', 'woh', 'paani', 'pani', 'deti', 'de', 'water'] },
        { conceptLabel: 'Fresh', keywords: ['ताज़ा', 'ताजा', 'taza', 'taaza', 'saaf', 'fresh'] },
        { conceptLabel: 'Tiny green plants', keywords: ['छोटे', 'हरे', 'पौधों', 'पौधे', 'chhote', 'chote', 'hare', 'paudhe', 'paudhon', 'podhe', 'plants'] },
        { conceptLabel: 'Near the gate', keywords: ['दरवाज़े', 'दरवाजे', 'गेट', 'पास', 'gate', 'darwaze', 'darwaje', 'paas', 'pas', 'nazdeek'] },
      ],
      hintGlossary: [
        { english: 'fresh water', hindi: 'ताज़ा पानी (taza paani)' },
        { english: 'tiny green plants', hindi: 'छोटे हरे पौधे (chhote hare paudhe)' },
        { english: 'near the gate', hindi: 'गेट / दरवाज़े के पास (gate ke paas)' },
      ],
    },
  },
  // Class 3-5
  {
    id: 'read-c35-watercycle',
    tier: 'class_3_5',
    tierLabel: 'Primary Core (Classes 3–5)',
    gradeRangeLabel: 'Class 3–5',
    targetWpm: 85,
    title: 'How Clouds Bring Rain to Our Fields',
    subjectContext: 'NCERT EVS · Science Vocabulary',
    difficultyNotes: 'Introduces multisyllabic science words (evaporates, invisible, droplets, harvested).',
    text: 'When the bright summer sun warms village ponds and rivers, liquid water slowly evaporates into invisible vapour. High above the hills, cooler air changes that vapour back into millions of tiny droplets. Soon dark clouds gather and pour gentle rain that feeds thirsty wheat crops across Haryana.',
    phoneticOverrides: {
      evaporates: 'ih-VAP-uh-rayts',
      invisible: 'in-VIZ-uh-bul',
      vapour: 'VAY-pur',
      droplets: 'DROP-lits',
      haryana: 'har-YAA-naa',
    },
    comprehensionQuestions: [
      {
        id: 'q1',
        prompt: 'What causes water in ponds and rivers to rise into the air?',
        options: ['Freezing snow', 'Heat from the bright summer sun', 'Heavy stones', 'Loud thunder'],
        correctIndex: 1,
        explanation: 'The passage explains that the bright summer sun warms ponds and rivers so water evaporates.',
      },
      {
        id: 'q2',
        prompt: 'What happens to water vapour when it reaches cooler air above the hills?',
        options: [
          'It turns into sand',
          'It disappears permanently',
          'It changes back into tiny water droplets',
          'It becomes salt',
        ],
        correctIndex: 2,
        explanation: 'Cooler air turns the invisible vapour back into millions of tiny droplets that form clouds.',
      },
      {
        id: 'q3',
        prompt: 'Who benefits from the rain described in the last sentence?',
        options: ['Thirsty wheat crops in the fields', 'Desert camels', 'Deep ocean whales', 'Snowy mountain peaks'],
        correctIndex: 0,
        explanation: 'Dark clouds pour gentle rain that feeds thirsty wheat crops across Haryana.',
      },
    ],
    translationTask: {
      id: 'tr-c35-watercycle',
      englishSentence: 'When the bright summer sun warms village ponds and rivers, liquid water slowly evaporates.',
      modelHindiDevanagari: 'जब गर्मियों का तेज़ सूरज गाँव के तालाबों और नदियों को गर्म करता है, तो पानी धीरे-धीरे भाप बनकर उड़ता है।',
      modelHinglish: 'Jab garmiyon ka tez suraj gaanv ke talabon aur nadiyon ko garm karta hai, tab paani dheere-dheere bhaap bankar udta hai.',
      conceptKeywordGroups: [
        { conceptLabel: 'Summer sun', keywords: ['सूरज', 'धूप', 'गर्मियों', 'suraj', 'sooraj', 'dhoop', 'garmi', 'garmiyon', 'sun'] },
        { conceptLabel: 'Warms ponds & rivers', keywords: ['तालाब', 'तालाबों', 'नदियों', 'नदी', 'गर्म', 'गाँव', 'talab', 'talabon', 'nadi', 'nadiyon', 'garm', 'garam', 'gaanv', 'gaon'] },
        { conceptLabel: 'Water slowly', keywords: ['पानी', 'धीरे', 'paani', 'pani', 'dheere', 'dhire', 'slowly'] },
        { conceptLabel: 'Evaporates / turns to vapour', keywords: ['भाप', 'वाष्प', 'उड़ता', 'bhaap', 'bhap', 'vaashp', 'evaporate', 'udta', 'ud'] },
      ],
      hintGlossary: [
        { english: 'village ponds and rivers', hindi: 'गाँव के तालाब और नदियाँ (gaanv ke talab aur nadiyan)' },
        { english: 'warms', hindi: 'गर्म करता है (garm karta hai)' },
        { english: 'slowly evaporates', hindi: 'धीरे-धीरे भाप बनता है (dheere-dheere bhaap banta hai)' },
      ],
    },
  },
  // Class 6-8
  {
    id: 'read-c68-notebook',
    tier: 'class_6_8',
    tierLabel: 'Middle Fluency (Classes 6–8)',
    gradeRangeLabel: 'Class 6–8',
    targetWpm: 115,
    title: 'Solar Microgrids in Rural Schools',
    subjectContext: 'Science & Technology · Connected Clauses',
    difficultyNotes: 'Contains technical vocabulary (photovoltaic, uninterrupted, maintenance, conservation, batteries).',
    text: 'Many rural schools across northern India now install rooftop photovoltaic panels to generate clean electricity throughout sunny afternoons. Lithium batteries store extra energy so science laboratories and computer rooms run without interruption during power cuts. Students learn energy conservation firsthand by tracking daily kilowatt output alongside regular mathematics lessons.',
    phoneticOverrides: {
      photovoltaic: 'foh-toh-vol-TAY-ik',
      electricity: 'ih-lek-TRIS-ih-tee',
      uninterrupted: 'un-in-tuh-RUP-tid',
      interruption: 'in-tuh-RUP-shun',
      conservation: 'kon-sur-VAY-shun',
      laboratories: 'LAB-ruh-tor-eez',
      kilowatt: 'KIL-oh-wot',
    },
    comprehensionQuestions: [
      {
        id: 'q1',
        prompt: 'Where do rural schools install photovoltaic panels?',
        options: ['Underground in wells', 'On school rooftops', 'Inside library shelves', 'Along railway tracks'],
        correctIndex: 1,
        explanation: 'The passage mentions rural schools installing rooftop photovoltaic panels.',
      },
      {
        id: 'q2',
        prompt: 'How do computer rooms keep working during grid power cuts?',
        options: [
          'Diesel trucks drive in every hour',
          'Schools close early',
          'Lithium batteries supply stored solar energy',
          'Students use candles',
        ],
        correctIndex: 2,
        explanation: 'Lithium batteries store extra solar energy so laboratories and computer rooms operate without interruption.',
      },
      {
        id: 'q3',
        prompt: 'Which school subject is linked with tracking daily kilowatt output?',
        options: ['Mathematics', 'Painting', 'History', 'Music'],
        correctIndex: 0,
        explanation: 'Students track daily kilowatt output alongside regular mathematics lessons.',
      },
    ],
    translationTask: {
      id: 'tr-c68-solar',
      englishSentence: 'Students learn energy conservation firsthand by tracking daily kilowatt output.',
      modelHindiDevanagari: 'छात्र रोज़ाना बिजली उत्पादन का हिसाब रखकर ऊर्जा संरक्षण को प्रत्यक्ष रूप से सीखते हैं।',
      modelHinglish: 'Chhatra rozana bijli utpadan ka hisaab rakhkar urja sanrakshan ko khud se seekhte hain.',
      conceptKeywordGroups: [
        { conceptLabel: 'Students learn', keywords: ['छात्र', 'विद्यार्थी', 'बच्चे', 'सीखते', 'chhatra', 'vidyarthi', 'bacche', 'bachche', 'seekhte', 'sikhte', 'students'] },
        { conceptLabel: 'Energy conservation', keywords: ['ऊर्जा', 'बिजली', 'संरक्षण', 'बचत', 'urja', 'bijli', 'energy', 'bachana', 'bachat', 'sanrakshan'] },
        { conceptLabel: 'Tracking daily output', keywords: ['रोज़ाना', 'प्रतिदिन', 'हिसाब', 'माप', 'उत्पादन', 'rozana', 'daily', 'har roz', 'hisaab', 'hisab', 'kilowatt', 'utpadan'] },
      ],
      hintGlossary: [
        { english: 'energy conservation', hindi: 'ऊर्जा संरक्षण / बिजली की बचत (urja sanrakshan)' },
        { english: 'firsthand', hindi: 'प्रत्यक्ष / खुद करके (khud karke)' },
        { english: 'tracking daily output', hindi: 'रोज़ाना उत्पादन का हिसाब रखना (rozana hisaab rakhna)' },
      ],
    },
  },
  // Class 9-10
  {
    id: 'read-c910-constitution',
    tier: 'class_9_10',
    tierLabel: 'Secondary Academic (Classes 9–10)',
    gradeRangeLabel: 'Class 9–10',
    targetWpm: 140,
    title: 'The Architecture of Water Panchayats',
    subjectContext: 'Civics & Sustainability · Complex Sentences',
    difficultyNotes: 'Dense subordinate clauses and civic terminology (decentralized, equitable, groundwater, replenishment, accountability).',
    text: 'Across semi-arid districts, decentralized water panchayats empower village communities to measure seasonal aquifer replenishment before approving borewell expansion. Rather than relying solely on distant bureaucratic directives, elected local stewards publish transparent water budgets that balance agricultural irrigation with household security. This participatory accountability demonstrates how constitutional self-governance protects shared ecological wealth for future generations.',
    phoneticOverrides: {
      decentralized: 'dee-SEN-truh-lyzd',
      aquifer: 'AK-wih-fur',
      replenishment: 'rih-PLEN-ish-munt',
      bureaucratic: 'byoor-uh-KRAT-ik',
      accountability: 'uh-koun-tuh-BIL-ih-tee',
      participatory: 'par-TIS-ih-puh-tor-ee',
      ecological: 'ee-kuh-LOJ-ih-kul',
    },
    comprehensionQuestions: [
      {
        id: 'q1',
        prompt: 'What do village water panchayats measure before approving new borewells?',
        options: [
          'Highway traffic volume',
          'Seasonal aquifer replenishment',
          'Market grain prices',
          'Factory chimney height',
        ],
        correctIndex: 1,
        explanation: 'They measure seasonal aquifer replenishment before permitting borewell expansion.',
      },
      {
        id: 'q2',
        prompt: 'What two water needs are balanced inside the transparent water budgets?',
        options: [
          'Swimming pools and fountains',
          'Agricultural irrigation and household security',
          'Railways and shipping',
          'Mining and tourism',
        ],
        correctIndex: 1,
        explanation: 'Elected stewards balance agricultural irrigation with household water security.',
      },
      {
        id: 'q3',
        prompt: 'Why is participatory accountability highlighted as effective?',
        options: [
          'It replaces all rainfall with ocean pipes',
          'It removes local voices from decisions',
          'It protects shared ecological wealth through local constitutional self-governance',
          'It relies strictly on distant directives',
        ],
        correctIndex: 2,
        explanation: 'Local self-governance and accountability safeguard shared ecological resources.',
      },
    ],
    translationTask: {
      id: 'tr-c910-water',
      englishSentence: 'Elected local stewards publish transparent water budgets that balance irrigation with household security.',
      modelHindiDevanagari: 'चुने हुए स्थानीय प्रतिनिधि पारदर्शी जल बजट जारी करते हैं जो सिंचाई और घरेलू पानी की सुरक्षा में संतुलन बनाते हैं।',
      modelHinglish: 'Chune hue sthaniya pratinidhi pardarshi jal budget jari karte hain jo sinchai aur gharelu suraksha mein santulan banate hain.',
      conceptKeywordGroups: [
        { conceptLabel: 'Elected local stewards', keywords: ['चुने', 'स्थानीय', 'प्रतिनिधि', 'सदस्य', 'chune', 'sthaniya', 'local', 'pratinidhi', 'log'] },
        { conceptLabel: 'Transparent water budgets', keywords: ['पारदर्शी', 'जल', 'पानी', 'बजट', 'प्रकाशित', 'pardarshi', 'transparent', 'jal', 'paani', 'pani', 'budget'] },
        { conceptLabel: 'Balance irrigation & household', keywords: ['संतुलन', 'सिंचाई', 'खेती', 'घरेलू', 'सुरक्षा', 'santulan', 'balance', 'sinchai', 'kheti', 'gharelu', 'ghar', 'suraksha'] },
      ],
      hintGlossary: [
        { english: 'elected local stewards', hindi: 'चुने हुए स्थानीय प्रतिनिधि (chune hue sthaniya pratinidhi)' },
        { english: 'transparent water budgets', hindi: 'पारदर्शी जल बजट (pardarshi jal budget)' },
        { english: 'balance irrigation with household security', hindi: 'सिंचाई और घरेलू सुरक्षा में संतुलन (sinchai aur gharelu suraksha mein santulan)' },
      ],
    },
  },
  // Class 11-12
  {
    id: 'read-c1112-cognition',
    tier: 'class_11_12',
    tierLabel: 'Senior Analytical (Classes 11–12)',
    gradeRangeLabel: 'Class 11–12',
    targetWpm: 165,
    title: 'Metacognition and Scientific Synthesis',
    subjectContext: 'Senior Academic Prose · Abstract Vocabulary',
    difficultyNotes: 'Dense academic register (metacognition, corroboration, heuristic, disproportionate, epistemological).',
    text: 'Genuine scientific literacy requires more than memorizing isolated empirical equations; it demands metacognitive discipline when interpreting ambiguous experimental anomalies. Investigators who cultivate systematic corroboration evaluate whether a disproportionate fluctuation stems from instrument calibration drift or an authentic physical threshold. By articulating falsifiable hypotheses before running repeated trials, senior learners transform passive syllabus recall into durable analytical judgment.',
    phoneticOverrides: {
      metacognition: 'met-uh-kog-NISH-un',
      metacognitive: 'met-uh-kog-NIH-tiv',
      empirical: 'em-PEER-ih-kul',
      ambiguous: 'am-BIG-yoo-us',
      anomalies: 'uh-NOM-uh-leez',
      corroboration: 'kuh-rob-uh-RAY-shun',
      disproportionate: 'dis-pruh-POR-shun-it',
      calibration: 'kal-ih-BRAY-shun',
      falsifiable: 'FAWL-suh-fy-uh-bul',
      hypotheses: 'hy-POTH-uh-seez',
    },
    comprehensionQuestions: [
      {
        id: 'q1',
        prompt: 'According to the author, what does genuine scientific literacy demand beyond memorizing equations?',
        options: [
          'Avoiding anomalous results altogether',
          'Metacognitive discipline when interpreting ambiguous experimental anomalies',
          'Skipping repeated experimental trials',
          'Relying only on textbook summaries',
        ],
        correctIndex: 1,
        explanation: 'The first sentence highlights metacognitive discipline when interpreting ambiguous anomalies.',
      },
      {
        id: 'q2',
        prompt: 'What two causes of a disproportionate fluctuation must investigators distinguish?',
        options: [
          'Weather temperature and room color',
          'Instrument calibration drift versus an authentic physical threshold',
          'Student handwriting and paper thickness',
          'Exam schedule and textbook edition',
        ],
        correctIndex: 1,
        explanation: 'Systematic corroboration distinguishes calibration drift from an authentic physical threshold.',
      },
      {
        id: 'q3',
        prompt: 'How do senior learners build durable analytical judgment?',
        options: [
          'By guessing outcomes after trials end',
          'By memorizing definitions silently',
          'By articulating falsifiable hypotheses before running repeated trials',
          'By copying lab readings without verification',
        ],
        correctIndex: 2,
        explanation: 'Articulating falsifiable hypotheses before repeated trials builds analytical judgment.',
      },
    ],
    translationTask: {
      id: 'tr-c1112-science',
      englishSentence: 'Senior learners transform passive syllabus recall into durable analytical judgment through repeated trials.',
      modelHindiDevanagari: 'वरिष्ठ विद्यार्थी बार-बार प्रयोगों के माध्यम से रटने की आदत को स्थायी विश्लेषणात्मक समझ में बदल देते हैं।',
      modelHinglish: 'Varishth vidyarthi baar-baar prayogon ke madhyam se ratne wali yaaddasht ko sthayi vishleshnatmak samajh mein badal dete hain.',
      conceptKeywordGroups: [
        { conceptLabel: 'Senior learners', keywords: ['वरिष्ठ', 'विद्यार्थी', 'छात्र', 'सीखने', 'varishth', 'senior', 'vidyarthi', 'chhatra', 'students'] },
        { conceptLabel: 'Transform passive recall', keywords: ['रटने', 'निष्क्रिय', 'याद', 'बदल', 'ratne', 'yaad', 'yad', 'badal', 'parivartan', 'recall'] },
        { conceptLabel: 'Analytical judgment / trials', keywords: ['विश्लेषणात्मक', 'समझ', 'निर्णय', 'बार-बार', 'प्रयोग', 'परीक्षण', 'vishleshan', 'vishleshnatmak', 'samajh', 'nirnay', 'prayog', 'trials', 'baar-baar'] },
      ],
      hintGlossary: [
        { english: 'passive syllabus recall', hindi: 'निष्क्रिय पाठ्यक्रम रटना (nishkriya ratna)' },
        { english: 'durable analytical judgment', hindi: 'स्थायी विश्लेषणात्मक निर्णय (sthayi vishleshnatmak samajh)' },
        { english: 'repeated trials', hindi: 'बार-बार किए गए प्रयोग (baar-baar kiye gaye prayog)' },
      ],
    },
  },
];

export function resolveClassTierFromSection(classSection?: string): ClassAssessmentTier {
  if (!classSection) return 'class_6_8';
  const match = String(classSection).match(/\d+/);
  const gradeNum = match ? Number(match[0]) : 6;
  if (gradeNum <= 2) return 'class_1_2';
  if (gradeNum <= 5) return 'class_3_5';
  if (gradeNum <= 8) return 'class_6_8';
  if (gradeNum <= 10) return 'class_9_10';
  return 'class_11_12';
}

export function getPassageForClassSection(classSection?: string): GradedReadingPassage {
  const tier = resolveClassTierFromSection(classSection);
  return READING_PASSAGE_BANK.find((p) => p.tier === tier) || READING_PASSAGE_BANK[2];
}

export function normalizeWordToken(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^[^a-z0-9\u0900-\u097f]+|[^a-z0-9\u0900-\u097f]+$/gi, '')
    .replace(/['’]/g, '');
}

function approximateSyllables(word: string): number {
  const clean = normalizeWordToken(word);
  if (clean.length <= 3) return 1;
  const trimmed = clean.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  const matches = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, matches ? matches.length : 1);
}

export function classifyWordDifficulty(word: string): 'core' | 'moderate' | 'challenge' {
  const clean = normalizeWordToken(word);
  const syllables = approximateSyllables(clean);
  if (clean.length >= 9 || syllables >= 3) return 'challenge';
  if (clean.length >= 6 || syllables === 2) return 'moderate';
  return 'core';
}

export function buildPhoneticHint(
  word: string,
  overrides?: Record<string, string>,
): string {
  const clean = normalizeWordToken(word);
  if (overrides && overrides[clean]) return overrides[clean];
  // Break longer words into clean readable syllable chunks
  const parts = clean.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy](?![aeiouy]))?/gi);
  if (!parts || parts.length <= 1) return clean;
  const consumedLen = parts.join('').length;
  if (consumedLen < clean.length) {
    parts[parts.length - 1] += clean.slice(consumedLen);
  }
  return parts.join('-');
}

export function tokenizePassageText(
  text: string,
  phoneticOverrides?: Record<string, string>,
): PassageToken[] {
  const rawWords = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let sentenceIndex = 0;
  return rawWords.map((raw, index) => {
    const isSentenceEnd = /[.!?]["”’)]*$/.test(raw);
    const hasClauseBoundary = isSentenceEnd || /[,;:—]["”’)]*$/.test(raw);
    const token: PassageToken = {
      index,
      raw,
      normalized: normalizeWordToken(raw),
      sentenceIndex,
      isSentenceEnd,
      hasClauseBoundary,
      difficulty: classifyWordDifficulty(raw),
      phoneticHint: buildPhoneticHint(raw, phoneticOverrides),
    };
    if (isSentenceEnd) {
      sentenceIndex += 1;
    }
    return token;
  });
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

export function wordSimilarity(expected: string, spoken: string): number {
  const e = normalizeWordToken(expected);
  const s = normalizeWordToken(spoken);
  if (!e || !s) return 0;
  if (e === s) return 1;
  const dist = levenshteinDistance(e, s);
  const maxLen = Math.max(e.length, s.length);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Aligns spoken words sequentially against expected passage tokens to identify
 * exact reads vs pronunciation slips (e.g. near-homophones / misarticulations).
 */
export function evaluateSpokenTranscriptAgainstPassage(params: {
  tokens: PassageToken[];
  spokenTranscript: string;
  flaggedMispronouncedIndices?: number[];
}): ReadingTranscriptEvaluation {
  const { tokens, spokenTranscript, flaggedMispronouncedIndices = [] } = params;
  const flaggedSet = new Set(flaggedMispronouncedIndices);
  const spokenWords = spokenTranscript
    .trim()
    .split(/\s+/)
    .map(normalizeWordToken)
    .filter(Boolean);

  const matchedIndices: number[] = [];
  const mispronouncedWords: MispronouncedWordDiagnostic[] = [];
  const recordedMispronouncedTokens = new Set<number>();

  if (spokenWords.length > 0 && tokens.length > 0) {
    let cursor = 0;
    for (let sIdx = 0; sIdx < spokenWords.length && cursor < tokens.length; sIdx++) {
      const spoken = spokenWords[sIdx];
      // Look ahead up to 4 words to recover from a skipped word
      let bestIdx = -1;
      let bestSim = 0;
      const limit = Math.min(tokens.length, cursor + 4);
      for (let tIdx = cursor; tIdx < limit; tIdx++) {
        const sim = wordSimilarity(tokens[tIdx].normalized, spoken);
        if (sim > bestSim) {
          bestSim = sim;
          bestIdx = tIdx;
        }
        if (sim === 1) break;
      }

      if (bestIdx >= 0 && bestSim >= 0.48) {
        matchedIndices.push(bestIdx);
        if (bestSim < 0.88 || flaggedSet.has(bestIdx)) {
          recordedMispronouncedTokens.add(bestIdx);
          mispronouncedWords.push({
            expectedWord: tokens[bestIdx].raw.replace(/[.,!?;:"'()]/g, ''),
            spokenAs: spoken,
            difficultyTier: tokens[bestIdx].difficulty,
            phoneticHint: tokens[bestIdx].phoneticHint,
          });
        }
        cursor = bestIdx + 1;
      } else if (
        sIdx + 1 < spokenWords.length &&
        cursor + 1 < tokens.length &&
        wordSimilarity(tokens[cursor + 1].normalized, spokenWords[sIdx + 1]) >= 0.72
      ) {
        // Student attempted current token with heavy mispronunciation before hitting the next word cleanly
        matchedIndices.push(cursor);
        recordedMispronouncedTokens.add(cursor);
        mispronouncedWords.push({
          expectedWord: tokens[cursor].raw.replace(/[.,!?;:"'()]/g, ''),
          spokenAs: spoken,
          difficultyTier: tokens[cursor].difficulty,
          phoneticHint: tokens[cursor].phoneticHint,
        });
        cursor += 1;
      }
    }
  }

  for (const idx of flaggedSet) {
    if (!recordedMispronouncedTokens.has(idx) && tokens[idx]) {
      mispronouncedWords.push({
        expectedWord: tokens[idx].raw.replace(/[.,!?;:"'()]/g, ''),
        spokenAs: '(Marked slip during live read)',
        difficultyTier: tokens[idx].difficulty,
        phoneticHint: tokens[idx].phoneticHint,
      });
    }
  }

  const uniqueMatchedCount =
    matchedIndices.length > 0 ? new Set(matchedIndices).size : Math.max(0, tokens.length - flaggedSet.size);
  const evaluatedBase = Math.max(1, matchedIndices.length > 0 ? matchedIndices.length : tokens.length);
  const slipCount = mispronouncedWords.length;
  const pronunciationPct = Math.max(
    0,
    Math.min(100, Math.round(((evaluatedBase - slipCount) / evaluatedBase) * 100)),
  );
  const completionPct =
    tokens.length > 0
      ? Math.min(100, Math.round((uniqueMatchedCount / tokens.length) * 100))
      : 0;
  const accuracyPct = Math.round(pronunciationPct * 0.7 + completionPct * 0.3);

  return {
    matchedIndices: Array.from(new Set(matchedIndices)),
    mispronouncedWords,
    pronunciationPct,
    completionPct,
    accuracyPct,
  };
}

export function computeLiveWpm(wordsRead: number, elapsedMs: number): number {
  if (wordsRead <= 0) return 0;
  const minutes = Math.max(elapsedMs / 60000, 1 / 60); // floor at 1 second for stability
  return Math.max(10, Math.min(240, Math.round(wordsRead / minutes)));
}

/**
 * Computes Gross WPM, Correct Words Per Minute (WCPM), and Active Speaking Pace
 * accounting for hesitation pauses detected in word read timestamps.
 */
export function computeReadingSpeedMetrics(params: {
  wordsRead: number;
  mispronouncedCount: number;
  elapsedMs: number;
  events: WordReadEvent[];
  pauseThresholdMs?: number;
}): ReadingSpeedMetrics {
  const {
    wordsRead,
    mispronouncedCount,
    elapsedMs,
    events,
    pauseThresholdMs = 700,
  } = params;
  if (wordsRead <= 0) {
    return {
      grossWpm: 0,
      correctWpm: 0,
      activeSpeakingWpm: 0,
      totalPausedMs: 0,
      activeSpeakingMs: 0,
    };
  }
  const safeElapsedMs = Math.max(elapsedMs, 1000);
  const grossWpm = computeLiveWpm(wordsRead, safeElapsedMs);
  const correctWords = Math.max(0, wordsRead - Math.max(0, mispronouncedCount));
  const correctWpm = correctWords === 0 ? 0 : computeLiveWpm(correctWords, safeElapsedMs);

  const sorted = [...events].sort((a, b) => a.timestampMs - b.timestampMs);
  let totalPausedMs = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].timestampMs - sorted[i - 1].timestampMs;
    if (gap > pauseThresholdMs) {
      totalPausedMs += gap - pauseThresholdMs * 0.45;
    }
  }
  const activeSpeakingMs = Math.max(1000, safeElapsedMs - Math.round(totalPausedMs));
  const activeSpeakingWpm = computeLiveWpm(wordsRead, activeSpeakingMs);

  return {
    grossWpm,
    correctWpm,
    activeSpeakingWpm,
    totalPausedMs: Math.round(totalPausedMs),
    activeSpeakingMs,
  };
}

/**
 * Assigns realistic timestamps to newly recognized spoken words from Web Speech API
 * without collapsing words across acoustic pauses into a single burst.
 */
export function computeIncrementalSpokenWordTimestamps(params: {
  existingEvents: WordReadEvent[];
  newlyMatchedIndices: number[];
  nowMs: number;
  sessionStartMs: number;
  observedSilenceMs?: number;
  pauseThresholdMs?: number;
}): WordReadEvent[] {
  const {
    existingEvents,
    newlyMatchedIndices,
    nowMs,
    sessionStartMs,
    observedSilenceMs = 0,
    pauseThresholdMs = 700,
  } = params;

  const seen = new Set(existingEvents.map((e) => e.wordIndex));
  const freshIndices = newlyMatchedIndices.filter((idx, pos) => !seen.has(idx) && newlyMatchedIndices.indexOf(idx) === pos);
  if (freshIndices.length === 0) return existingEvents;

  const lastExistingTs =
    existingEvents.length > 0
      ? Math.max(...existingEvents.map((e) => e.timestampMs))
      : sessionStartMs;
  const elapsedSinceLast = Math.max(0, nowMs - lastExistingTs);

  // Respect measured acoustic pauses from the microphone stream or real recognition silence gaps
  const hasGenuinePause =
    existingEvents.length > 0 &&
    (observedSilenceMs >= Math.round(pauseThresholdMs * 0.75) ||
      elapsedSinceLast >= pauseThresholdMs);

  const intraBurstStepMs = Math.max(160, Math.min(340, Math.round((pauseThresholdMs * 0.35))));
  const batchDuration = Math.max(0, (freshIndices.length - 1) * intraBurstStepMs);

  let anchorStartTs: number;
  if (existingEvents.length === 0) {
    anchorStartTs = Math.max(sessionStartMs, nowMs - batchDuration);
  } else if (hasGenuinePause) {
    const gapToEnforce = Math.max(pauseThresholdMs + 120, observedSilenceMs, elapsedSinceLast - batchDuration);
    anchorStartTs = Math.max(sessionStartMs, lastExistingTs + gapToEnforce);
  } else {
    anchorStartTs = Math.max(lastExistingTs + 170, nowMs - batchDuration);
  }

  const additions: WordReadEvent[] = freshIndices.map((wordIndex, offset) => ({
    wordIndex,
    timestampMs: anchorStartTs + offset * intraBurstStepMs,
  }));

  return [...existingEvents, ...additions];
}

/**
 * Segments timestamped word read events into uninterrupted fluency bursts
 * (1 word, 2 words, 3+ words, whole sentence) and evaluates natural pausing & prosody.
 */
export function computeFluencyBurstProfile(params: {
  tokens: PassageToken[];
  events: WordReadEvent[];
  pauseThresholdMs?: number;
}): FluencyBurstProfile {
  const { tokens, events, pauseThresholdMs = 700 } = params;
  const emptyPauseMetrics: PauseCadenceMetrics = {
    totalPauses: 0,
    naturalBoundaryPauses: 0,
    midSentenceHesitations: 0,
    meanPauseMs: 0,
    longestPauseMs: 0,
    pausingQualityPct: 0,
    prosodySummary: 'Developing Phrasing',
  };

  if (events.length === 0 || tokens.length === 0) {
    return {
      bursts: [],
      avgBurstWords: 0,
      maxBurstWords: 0,
      burstOneWordPct: 0,
      burstTwoWordsPct: 0,
      burstThreePlusPct: 0,
      burstWholeSentencePct: 0,
      dominantFluencyStyle: 'Word-by-Word (1 word/go)',
      pauseMetrics: emptyPauseMetrics,
    };
  }

  const sorted = [...events].sort((a, b) => a.timestampMs - b.timestampMs || a.wordIndex - b.wordIndex);
  const sentenceWordCounts = new Map<number, number>();
  for (const tok of tokens) {
    sentenceWordCounts.set(tok.sentenceIndex, (sentenceWordCounts.get(tok.sentenceIndex) || 0) + 1);
  }

  const rawGroups: number[][] = [];
  let currentGroup: number[] = [sorted[0].wordIndex];

  let naturalBoundaryPauses = 0;
  let midSentenceHesitations = 0;
  const recordedPauseDurations: number[] = [];
  const naturalBoundaryMinGapMs = Math.round(pauseThresholdMs * 0.55);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const prevTok = tokens[prev.wordIndex];
    const currTok = tokens[curr.wordIndex];
    const gap = Math.max(0, curr.timestampMs - prev.timestampMs);

    const crossedSentence =
      prevTok && currTok ? prevTok.sentenceIndex !== currTok.sentenceIndex : false;
    const atClausePunctuation = Boolean(prevTok?.hasClauseBoundary || crossedSentence);
    const isConsecutive = curr.wordIndex >= prev.wordIndex && curr.wordIndex <= prev.wordIndex + 2;

    if (atClausePunctuation && gap >= naturalBoundaryMinGapMs) {
      naturalBoundaryPauses += 1;
      recordedPauseDurations.push(gap);
    } else if (!atClausePunctuation && gap > pauseThresholdMs) {
      midSentenceHesitations += 1;
      recordedPauseDurations.push(gap);
    }

    if (!crossedSentence && isConsecutive && gap <= pauseThresholdMs) {
      if (!currentGroup.includes(curr.wordIndex)) {
        currentGroup.push(curr.wordIndex);
      }
    } else {
      rawGroups.push(currentGroup);
      currentGroup = [curr.wordIndex];
    }
  }
  if (currentGroup.length > 0) rawGroups.push(currentGroup);

  const bursts: FluencyBurstSegment[] = rawGroups.map((wordIndices, burstIndex) => {
    const firstTok = tokens[wordIndices[0]];
    const sentenceIndex = firstTok ? firstTok.sentenceIndex : 0;
    const expectedSentenceLen = sentenceWordCounts.get(sentenceIndex) || 999;
    const wordCount = wordIndices.length;
    const isWholeSentence = wordCount >= Math.max(4, expectedSentenceLen - 1);
    const category: FluencyBurstSegment['category'] = isWholeSentence
      ? 'whole_sentence'
      : wordCount === 1
        ? 'one_word'
        : wordCount === 2
          ? 'two_words'
          : 'three_plus';

    return {
      burstIndex,
      wordIndices,
      wordCount,
      sentenceIndex,
      isWholeSentence,
      category,
      textPreview: wordIndices.map((idx) => tokens[idx]?.raw || '').join(' '),
    };
  });

  const totalBursts = bursts.length;
  const oneWordCount = bursts.filter((b) => b.category === 'one_word').length;
  const twoWordsCount = bursts.filter((b) => b.category === 'two_words').length;
  const threePlusCount = bursts.filter((b) => b.category === 'three_plus').length;

  const avgBurstWords = Number(
    (bursts.reduce((s, b) => s + b.wordCount, 0) / totalBursts).toFixed(1),
  );
  const maxBurstWords = Math.max(...bursts.map((b) => b.wordCount));

  const burstOneWordPct = Math.round((oneWordCount / totalBursts) * 100);
  const burstTwoWordsPct = Math.round((twoWordsCount / totalBursts) * 100);
  const burstThreePlusPct = Math.round((threePlusCount / totalBursts) * 100);
  const burstWholeSentencePct = Math.max(
    0,
    100 - burstOneWordPct - burstTwoWordsPct - burstThreePlusPct,
  );

  let dominantFluencyStyle: FluencyBurstStyle = 'Word-by-Word (1 word/go)';
  if (burstWholeSentencePct >= 35 || avgBurstWords >= 7) {
    dominantFluencyStyle = 'Whole-Sentence Fluent';
  } else if (burstThreePlusPct + burstWholeSentencePct >= 45 || avgBurstWords >= 3) {
    dominantFluencyStyle = 'Phrase Reader (3+ words/go)';
  } else if (burstTwoWordsPct >= 30 || avgBurstWords >= 1.8) {
    dominantFluencyStyle = 'Two-Word Chunks (2 words/go)';
  }

  const totalPauses = naturalBoundaryPauses + midSentenceHesitations;
  const meanPauseMs =
    recordedPauseDurations.length > 0
      ? Math.round(recordedPauseDurations.reduce((s, d) => s + d, 0) / recordedPauseDurations.length)
      : 0;
  const longestPauseMs =
    recordedPauseDurations.length > 0 ? Math.max(...recordedPauseDurations) : 0;

  const hesitationRatio = sorted.length > 1 ? midSentenceHesitations / Math.max(1, sorted.length - 1) : 0;
  const boundaryBonus = naturalBoundaryPauses > 0 ? Math.min(12, naturalBoundaryPauses * 4) : 0;
  const longStallPenalty = longestPauseMs > pauseThresholdMs * 3.5 ? 10 : 0;
  const pausingQualityPct =
    sorted.length <= 1
      ? 0
      : Math.max(
          15,
          Math.min(
            100,
            Math.round(88 - hesitationRatio * 95 + boundaryBonus - longStallPenalty),
          ),
        );

  let prosodySummary: PauseCadenceMetrics['prosodySummary'] = 'Developing Phrasing';
  if (pausingQualityPct >= 82 && midSentenceHesitations <= 1) {
    prosodySummary = 'Expressive & Natural Pacing';
  } else if (pausingQualityPct >= 66) {
    prosodySummary = 'Steady Connected Reading';
  } else if (midSentenceHesitations >= 3 || hesitationRatio >= 0.35) {
    prosodySummary = 'Frequent Mid-Sentence Hesitations';
  }

  return {
    bursts,
    avgBurstWords,
    maxBurstWords,
    burstOneWordPct,
    burstTwoWordsPct,
    burstThreePlusPct,
    burstWholeSentencePct,
    dominantFluencyStyle,
    pauseMetrics: {
      totalPauses,
      naturalBoundaryPauses,
      midSentenceHesitations,
      meanPauseMs,
      longestPauseMs,
      pausingQualityPct,
      prosodySummary,
    },
  };
}

export function scoreComprehensionAnswers(
  questions: ComprehensionQuestion[],
  selectedByQuestionId: Record<string, number>,
): { correctCount: number; totalCount: number; scorePct: number } {
  if (questions.length === 0) {
    return { correctCount: 0, totalCount: 0, scorePct: 0 };
  }
  let correctCount = 0;
  for (const q of questions) {
    if (selectedByQuestionId[q.id] === q.correctIndex) {
      correctCount += 1;
    }
  }
  return {
    correctCount,
    totalCount: questions.length,
    scorePct: Math.round((correctCount / questions.length) * 100),
  };
}

export function evaluateSentenceTranslation(
  task: SentenceTranslationPrompt,
  studentResponse: string,
): TranslationEvaluation {
  const clean = studentResponse.trim().toLowerCase();
  if (clean.length < 4) {
    return {
      scorePct: 0,
      matchedConcepts: [],
      missingConcepts: task.conceptKeywordGroups.map((g) => g.conceptLabel),
      feedbackSummary: 'Write your translation in Hindi (Devanagari or Hinglish) before submitting.',
    };
  }

  const matchedConcepts: string[] = [];
  const missingConcepts: string[] = [];

  for (const group of task.conceptKeywordGroups) {
    const matched = group.keywords.some((kw) => clean.includes(kw.toLowerCase()));
    if (matched) matchedConcepts.push(group.conceptLabel);
    else missingConcepts.push(group.conceptLabel);
  }

  const ratio =
    task.conceptKeywordGroups.length > 0
      ? matchedConcepts.length / task.conceptKeywordGroups.length
      : 0;
  const scorePct = Math.round(ratio * 100);

  let feedbackSummary = 'Needs revision: review the glossary hints and capture each key idea.';
  if (scorePct >= 85) {
    feedbackSummary = 'Strong bilingual translation capturing almost all core ideas naturally.';
  } else if (scorePct >= 50) {
    feedbackSummary = `Good effort! Captured ${matchedConcepts.length} of ${task.conceptKeywordGroups.length} sentence meanings.`;
  }

  return {
    scorePct,
    matchedConcepts,
    missingConcepts,
    feedbackSummary,
  };
}

export function computeOverallReadingDiagnostic(params: {
  pronunciationPct: number;
  accuracyPct: number;
  comprehensionPct: number;
  translationPct: number;
  avgBurstWords: number;
  targetWpm: number;
  wpm: number;
}): { overallPct: number; readingBand: ReadingBand } {
  const { pronunciationPct, comprehensionPct, translationPct, avgBurstWords, targetWpm, wpm } = params;
  const fluencyComponent = Math.min(
    100,
    Math.round((Math.min(wpm / Math.max(targetWpm, 30), 1.15) / 1.15) * 60 + Math.min(avgBurstWords / 6, 1) * 40),
  );
  const overallPct = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        pronunciationPct * 0.3 +
          fluencyComponent * 0.25 +
          comprehensionPct * 0.25 +
          translationPct * 0.2,
      ),
    ),
  );

  let readingBand: ReadingBand = 'Emergent';
  if (overallPct >= 85) readingBand = 'Fluent';
  else if (overallPct >= 70) readingBand = 'Proficient';
  else if (overallPct >= 52) readingBand = 'Developing';

  return { overallPct, readingBand };
}
