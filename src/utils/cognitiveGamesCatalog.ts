import type { AgeBand, CognitiveCategory, CognitiveGameDefinition } from '../types';

export const COGNITIVE_CATEGORIES: Array<{
  category: CognitiveCategory;
  subtitle: string;
  learningFocus: string;
}> = [
  {
    category: 'Visual Attention',
    subtitle: 'Focus, observation and concentration',
    learningFocus: 'Focus and concentration · Determination & Stamina indicators',
  },
  {
    category: 'Memory Training',
    subtitle: 'Working, visual and auditory memory',
    learningFocus: 'Recall and working memory · Effective Intelligence indicator',
  },
  {
    category: 'Perception Training',
    subtitle: 'Visual discrimination and spatial awareness',
    learningFocus: 'Observation & spatial reasoning · Effective Intelligence & Reasoning',
  },
  {
    category: 'Response Control',
    subtitle: 'Impulse control and selective attention',
    learningFocus: 'Impulse control and rule following · Sense of Responsibility indicator',
  },
  {
    category: 'Logical Thinking',
    subtitle: 'Reasoning, patterns and problem-solving',
    learningFocus: 'Analysis and problem-solving · Reasoning Ability & Effective Intelligence',
  },
  {
    category: 'Cognitive Flexibility',
    subtitle: 'Adaptability, switching and planning',
    learningFocus: 'Sequencing, rule switching and strategy · Organising Ability & Speed of Decision',
  },
];

export const AGE_WISE_LEVEL_BANDS: Array<{
  level: 1 | 2 | 3 | 4 | 5;
  ageBand: AgeBand;
  complexitySummary: string;
}> = [
  {
    level: 1,
    ageBand: 'Classes 1–2',
    complexitySummary: 'Simple matching, colours, shapes, short sequences',
  },
  {
    level: 2,
    ageBand: 'Classes 3–5',
    complexitySummary: 'Picture memory, number recall, visual search, basic logic',
  },
  {
    level: 3,
    ageBand: 'Classes 6–8',
    complexitySummary: 'Advanced sequences, spatial puzzles, response control, Sudoku',
  },
  {
    level: 4,
    ageBand: 'Classes 9–10',
    complexitySummary: 'Complex reasoning, working memory, planning and chess tactics',
  },
  {
    level: 5,
    ageBand: 'Classes 11–12',
    complexitySummary: 'Advanced logic, multi-step problem-solving, complex attention tasks',
  },
];

const INITIAL_COGNITIVE_GAMES: CognitiveGameDefinition[] = [
  // A. Attention and Concentration Games (1–5)
  {
    id: 'spot-the-difference',
    catalogNumber: 1,
    title: 'Spot the Difference',
    titleHi: 'अंतर पहचानो',
    category: 'Visual Attention',
    phase: 'Phase 1 · Core',
    shortDesc: 'Identify subtle visual differences between two paired classroom & nature scenes.',
    instructionsEn:
      'Compare both side-by-side illustrations carefully and click every detail that differs on the right panel.',
    instructionsHi:
      'दोनों चित्रों की ध्यान से तुलना करें और दाईं ओर के चित्र में दिखने वाले हर अंतर पर क्लिक करें।',
    develops: ['Visual attention', 'Observation', 'Detail recognition'],
    measurements: ['Correct differences', 'Missed differences', 'Completion time'],
    learningIndicators: ['Focus and concentration', 'Detail observation'],
    potentialOlqRelevance: ['determination', 'stamina'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'target-finder',
    catalogNumber: 2,
    title: 'Target Finder',
    titleHi: 'लक्ष्य खोजो',
    category: 'Visual Attention',
    phase: 'Phase 1 · Core',
    shortDesc: 'Locate specified letters, numbers, or symbols rapidly among visual distractors.',
    instructionsEn:
      'Scan the grid and tap every tile matching the target symbol shown at the top while ignoring distractors.',
    instructionsHi:
      'ऊपर दिखाए गए लक्ष्य चिन्ह से मेल खाने वाले सभी ब्लॉक चुनें और अन्य चिन्हों को अनदेखा करें।',
    develops: ['Selective attention', 'Visual scanning'],
    measurements: ['Accuracy', 'Search time', 'Missed targets'],
    learningIndicators: ['Focus and concentration', 'Selective scanning'],
    potentialOlqRelevance: ['determination', 'stamina'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'focus-trail',
    catalogNumber: 3,
    title: 'Focus Trail',
    titleHi: 'क्रम पथ',
    category: 'Visual Attention',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Connect numbers, letters, or alternating sequences (1 → A → 2 → B) in exact order.',
    instructionsEn:
      'Click the scattered nodes in strict ascending or alternating order (e.g. 1 → A → 2 → B) without breaking sequence.',
    instructionsHi:
      'बिखरे हुए बिंदुओं को सही क्रम में (जैसे 1 → A → 2 → B) बिना गलती किए जोड़ें।',
    develops: ['Sustained attention', 'Sequencing'],
    measurements: ['Errors', 'Completion time', 'Sequence accuracy'],
    learningIndicators: ['Focus and concentration', 'Sequential tracking'],
    potentialOlqRelevance: ['determination', 'organising_ability'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'symbol-hunter',
    catalogNumber: 4,
    title: 'Symbol Hunter',
    titleHi: 'प्रतीक शिकारी',
    category: 'Visual Attention',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Identify selected target symbols inside a periodically refreshing grid.',
    instructionsEn:
      'Watch the active target prompt closely and click matching symbols before the grid refreshes.',
    instructionsHi:
      'दिए गए लक्ष्य चिन्ह को ध्यान से देखें और ग्रिड बदलने से पहले सही प्रतीकों पर क्लिक करें।',
    develops: ['Concentration', 'Visual scanning', 'Selective attention'],
    measurements: ['Correct selections', 'Incorrect selections', 'Speed'],
    learningIndicators: ['Focus and concentration', 'Processing alertness'],
    potentialOlqRelevance: ['determination', 'stamina'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'focus-filter',
    catalogNumber: 5,
    title: 'Focus Filter',
    titleHi: 'नियम फ़िल्टर',
    category: 'Visual Attention',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Select only objects matching a dual colour-shape rule while ignoring distractors.',
    instructionsEn:
      'Read the active selection rule carefully (e.g. Blue Triangles only) and tap only matching items.',
    instructionsHi:
      'दी गई शर्त को पढ़ें (जैसे केवल नीले त्रिभुज) और केवल उसी नियम से मेल खाने वाली वस्तुएं चुनें।',
    develops: ['Sustained and selective attention'],
    measurements: ['Accuracy', 'Performance across increasing difficulty'],
    learningIndicators: ['Focus and concentration', 'Rule filtering'],
    potentialOlqRelevance: ['determination', 'sense_of_responsibility'],
    supportedLevels: [1, 2, 3, 4, 5],
  },

  // B. Memory Development Games (6–11)
  {
    id: 'memory-match',
    catalogNumber: 6,
    title: 'Memory Match',
    titleHi: 'जोड़ी मिलान स्मृति',
    category: 'Memory Training',
    phase: 'Phase 1 · Core',
    shortDesc: 'Flip cards and recall symbol positions to clear all matching pairs.',
    instructionsEn:
      'Turn over two cards at a time, remember their positions, and match every identical pair.',
    instructionsHi:
      'एक बार में दो कार्ड पलटें, उनकी स्थिति याद रखें और सभी समान जोड़ियाँ मिलाएँ।',
    develops: ['Visual memory', 'Recall'],
    measurements: ['Attempts', 'Correct pairs', 'Time taken'],
    learningIndicators: ['Recall and working memory'],
    potentialOlqRelevance: ['effective_intelligence'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'sequence-recall',
    catalogNumber: 7,
    title: 'Sequence Recall',
    titleHi: 'क्रम स्मृति',
    category: 'Memory Training',
    phase: 'Phase 1 · Core',
    shortDesc: 'Observe and reproduce a growing sequence of colours, shapes, and tones.',
    instructionsEn:
      'Watch and listen to the illuminated tile sequence, then repeat the exact sequence in order.',
    instructionsHi:
      'चमकते हुए रंगों और ध्वनियों का क्रम ध्यान से देखें-सुनें और उसी क्रम में दोहराएँ।',
    develops: ['Working memory', 'Sequential recall'],
    measurements: ['Longest correct sequence', 'Errors'],
    learningIndicators: ['Recall and working memory'],
    potentialOlqRelevance: ['effective_intelligence', 'organising_ability'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'picture-memory',
    catalogNumber: 8,
    title: 'Picture Memory',
    titleHi: 'चित्र स्मृति',
    category: 'Memory Training',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Study a multi-object study desk scene briefly before answering recall questions.',
    instructionsEn:
      'Observe the objects and their colours during the study timer; after they hide, answer recall questions.',
    instructionsHi:
      'अध्ययन समय में चित्र की वस्तुओं और रंगों को ध्यान से देखें; चित्र छिपने के बाद प्रश्नों के उत्तर दें।',
    develops: ['Visual memory', 'Retrieval'],
    measurements: ['Correctly recalled objects and details'],
    learningIndicators: ['Recall and working memory', 'Observation retention'],
    potentialOlqRelevance: ['effective_intelligence'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'number-recall',
    catalogNumber: 9,
    title: 'Number Recall',
    titleHi: 'संख्या स्मृति',
    category: 'Memory Training',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Memorise number spans and reproduce them in forward or reverse order.',
    instructionsEn:
      'Study the digit sequence before it clears, then enter the numbers in the requested order (forward or reverse).',
    instructionsHi:
      'दिखाई गई संख्या श्रृंखला को याद करें और छिपने के बाद पूछे गए क्रम (सीधे या उल्टे) में लिखें।',
    develops: ['Working memory', 'Mental manipulation'],
    measurements: ['Sequence accuracy', 'Maximum level completed'],
    learningIndicators: ['Recall and working memory'],
    potentialOlqRelevance: ['effective_intelligence', 'reasoning_ability'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'word-recall',
    catalogNumber: 10,
    title: 'Word Recall',
    titleHi: 'शब्द स्मृति',
    category: 'Memory Training',
    phase: 'Phase 3 · Adaptive',
    shortDesc: 'Study a curated vocabulary set and retrieve exact words among similar distractors.',
    instructionsEn:
      'Memorise the displayed words during the study phase, then select only the studied words from the mixed list.',
    instructionsHi:
      'अध्ययन के दौरान दिखाए गए शब्दों को याद करें और फिर मिश्रित सूची में से केवल वही शब्द चुनें।',
    develops: ['Verbal memory', 'Retrieval'],
    measurements: ['Correct words recalled', 'Omissions', 'Recall over time'],
    learningIndicators: ['Recall and working memory', 'Verbal retention'],
    potentialOlqRelevance: ['effective_intelligence', 'power_of_expression'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'story-sequence',
    catalogNumber: 11,
    title: 'Story Sequence',
    titleHi: 'कथा क्रम स्मृति',
    category: 'Cognitive Flexibility',
    phase: 'Phase 3 · Adaptive',
    shortDesc: 'Read a short event passage and arrange the shuffled story cards in logical order.',
    instructionsEn:
      'Study the story briefly, then reorder the shuffled event cards from Step 1 to the final step.',
    instructionsHi:
      'छोटी कहानी को ध्यान से पढ़ें और फिर बिखरे हुए घटना कार्ड को सही क्रम में सजाएँ।',
    develops: ['Sequential memory', 'Comprehension', 'Planning'],
    measurements: ['Correct ordering', 'Recall accuracy'],
    learningIndicators: ['Sequencing and strategy', 'Comprehension recall'],
    potentialOlqRelevance: ['organising_ability', 'effective_intelligence'],
    supportedLevels: [1, 2, 3, 4, 5],
  },

  // C. Perception and Visual Processing Games (12–16)
  {
    id: 'shape-rotation',
    catalogNumber: 12,
    title: 'Shape Rotation',
    titleHi: 'आकृति घूर्णन',
    category: 'Perception Training',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Identify how an asymmetric geometric shape appears after 90°, 180°, or 270° rotation.',
    instructionsEn:
      'Mentally rotate the reference figure clockwise and pick the option that matches without flipping.',
    instructionsHi:
      'मुख्य आकृति को मन में घुमाकर देखें और बिना पलटे बिल्कुल मेल खाने वाला विकल्प चुनें।',
    develops: ['Spatial perception', 'Mental rotation'],
    measurements: ['Correct identification', 'Response time'],
    learningIndicators: ['Observation and visual discrimination'],
    potentialOlqRelevance: ['effective_intelligence', 'reasoning_ability'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'pattern-detective',
    catalogNumber: 13,
    title: 'Pattern Detective',
    titleHi: 'पैटर्न जासूस',
    category: 'Perception Training',
    phase: 'Phase 1 · Core',
    shortDesc: 'Decode visual shape, colour, and rotation rules to predict the missing tile.',
    instructionsEn:
      'Observe how the shapes, colours, or counts transform across the sequence and choose the next tile.',
    instructionsHi:
      'आकृतियों, रंगों या संख्या के बदलाव का नियम पहचानें और अगला सही विकल्प चुनें।',
    develops: ['Pattern recognition', 'Visual reasoning'],
    measurements: ['Correct answers', 'Difficulty level'],
    learningIndicators: ['Observation and visual discrimination', 'Analysis'],
    potentialOlqRelevance: ['reasoning_ability', 'effective_intelligence'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'mirror-image',
    catalogNumber: 14,
    title: 'Mirror Image',
    titleHi: 'दर्पण प्रतिबिंब',
    category: 'Perception Training',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Identify the accurate vertical or horizontal mirror reflection of an asymmetric figure.',
    instructionsEn:
      'Examine the mirror axis next to the shape and pick the exact reflected image.',
    instructionsHi:
      'दर्पण रेखा के अनुसार आकृति का बिल्कुल सही प्रतिबिंब चुनें।',
    develops: ['Spatial awareness', 'Visual discrimination'],
    measurements: ['Accuracy', 'Completion time'],
    learningIndicators: ['Observation and visual discrimination'],
    potentialOlqRelevance: ['effective_intelligence', 'reasoning_ability'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'hidden-figures',
    catalogNumber: 15,
    title: 'Hidden Figures',
    titleHi: 'छिपी आकृतियाँ',
    category: 'Perception Training',
    phase: 'Phase 3 · Adaptive',
    shortDesc: 'Locate a target geometric figure embedded within a complex overlapping line grid.',
    instructionsEn:
      'Find the exact simple shape shown at the top hidden inside the overlapping geometric patterns below.',
    instructionsHi:
      'ऊपर दी गई सरल आकृति को नीचे बने जटिल रेखाचित्रों के बीच पहचानें और चुनें।',
    develops: ['Figure-ground perception', 'Visual analysis'],
    measurements: ['Correct identification', 'Search time'],
    learningIndicators: ['Observation and visual discrimination'],
    potentialOlqRelevance: ['effective_intelligence', 'determination'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'spatial-builder',
    catalogNumber: 16,
    title: 'Spatial Builder',
    titleHi: 'त्रि-आयामी निर्माण',
    category: 'Perception Training',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Mentally fold 2D cube nets and count stacked 3D unit blocks.',
    instructionsEn:
      'Visualise the folded 2D net or 3D block stack and select the matching structural answer.',
    instructionsHi:
      '2D जाल को मोड़कर या 3D ब्लॉक की गिनती करके सही उत्तर चुनें।',
    develops: ['Spatial reasoning', 'Visualisation'],
    measurements: ['Correct solutions', 'Difficulty achieved'],
    learningIndicators: ['Observation and visual discrimination', 'Spatial planning'],
    potentialOlqRelevance: ['reasoning_ability', 'organising_ability'],
    supportedLevels: [1, 2, 3, 4, 5],
  },

  // D. Response Control and Processing Speed (17–20)
  {
    id: 'colour-conflict',
    catalogNumber: 17,
    title: 'Colour Conflict',
    titleHi: 'रंग द्वंद्व नियंत्रण',
    category: 'Response Control',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Respond to the ink colour of a word rather than reading the conflicting colour text.',
    instructionsEn:
      'Click the button matching the INK COLOUR of the displayed word—ignore what the word spells!',
    instructionsHi:
      'शब्द किस रंग की स्याही में लिखा है वह चुनें — शब्द में क्या लिखा है उस पर ध्यान न दें!',
    develops: ['Selective attention', 'Response inhibition'],
    measurements: ['Correct responses', 'Errors', 'Response time'],
    learningIndicators: ['Impulse control and rule following'],
    potentialOlqRelevance: ['sense_of_responsibility', 'speed_of_decision'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'go-no-go',
    catalogNumber: 18,
    title: 'Go / No-Go',
    titleHi: 'गो / नो-गो नियंत्रण',
    category: 'Response Control',
    phase: 'Phase 1 · Core',
    shortDesc: 'Tap immediately on allowed green GO signals and withhold response on forbidden NO-GO cues.',
    instructionsEn:
      'Press TAP / Spacebar only when the GO signal appears. Hold back completely when NO-GO appears.',
    instructionsHi:
      'केवल GO संकेत दिखने पर बटन या Spacebar दबाएँ। NO-GO दिखने पर बिल्कुल क्लिक न करें।',
    develops: ['Impulse control', 'Sustained attention'],
    measurements: ['Correct responses', 'Missed signals', 'False responses'],
    learningIndicators: ['Impulse control and rule following'],
    potentialOlqRelevance: ['sense_of_responsibility', 'stamina'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'quick-reaction',
    catalogNumber: 19,
    title: 'Quick Reaction',
    titleHi: 'तीव्र प्रतिक्रिया',
    category: 'Response Control',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Respond cleanly as soon as the ready cue triggers while avoiding premature false starts.',
    instructionsEn:
      'Wait patiently for the signal to turn active green ("TAP NOW"), then click as quickly as possible.',
    instructionsHi:
      'संकेत के हरे होने ("TAP NOW") की प्रतीक्षा करें और दिखते ही तुरंत क्लिक करें।',
    develops: ['Response speed', 'Attention'],
    measurements: ['Median reaction time', 'Accuracy'],
    learningIndicators: ['Impulse control and rule following', 'Alertness'],
    potentialOlqRelevance: ['speed_of_decision', 'stamina'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'reverse-rule',
    catalogNumber: 20,
    title: 'Reverse Rule',
    titleHi: 'विपरीत नियम',
    category: 'Cognitive Flexibility',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Switch flexibly between normal direction prompts and opposite-direction arrows.',
    instructionsEn:
      'Check the cue banner: on NORMAL click the same arrow direction; on OPPOSITE click the opposite arrow.',
    instructionsHi:
      'नियम देखें: NORMAL पर वही दिशा चुनें और OPPOSITE पर तीर की उल्टी दिशा पर क्लिक करें।',
    develops: ['Cognitive flexibility', 'Response inhibition'],
    measurements: ['Rule accuracy', 'Errors', 'Response time'],
    learningIndicators: ['Adaptability and rule switching'],
    potentialOlqRelevance: ['speed_of_decision', 'social_adaptability'],
    supportedLevels: [1, 2, 3, 4, 5],
  },

  // E. Logical Intelligence and Problem-Solving Games (21–25)
  {
    id: 'sudoku-challenge',
    catalogNumber: 21,
    title: 'Sudoku Challenge',
    titleHi: 'सुडोकू चुनौती',
    category: 'Logical Thinking',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Complete 4×4, 6×6, and 9×9 number grids using pure row, column, and box deduction.',
    instructionsEn:
      'Fill empty cells so every row, column, and sub-box contains each number once without repeats.',
    instructionsHi:
      'खाली खानों को ऐसे भरें कि हर पंक्ति, स्तंभ और बॉक्स में सभी अंक बिना दोहराव के आएँ।',
    develops: ['Logical reasoning', 'Working memory'],
    measurements: ['Accuracy', 'Hints used', 'Completion time'],
    learningIndicators: ['Analysis and problem-solving'],
    potentialOlqRelevance: ['reasoning_ability', 'organising_ability'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'logic-escape',
    catalogNumber: 22,
    title: 'Logic Escape',
    titleHi: 'तार्किक पहेली निकास',
    category: 'Logical Thinking',
    phase: 'Phase 3 · Adaptive',
    shortDesc: 'Solve connected multi-step constraint & river-crossing deduction stages to unlock the gate.',
    instructionsEn:
      'Apply the clue constraints across each sequential logic gate to deduce the exact safe answer.',
    instructionsHi:
      'हर चरण के संकेतों और शर्तों को जोड़कर सही तार्किक उत्तर चुनें और द्वार खोलें।',
    develops: ['Planning', 'Reasoning', 'Problem-solving'],
    measurements: ['Steps', 'Mistakes', 'Successful solutions'],
    learningIndicators: ['Analysis and problem-solving', 'Planning'],
    potentialOlqRelevance: ['reasoning_ability', 'effective_intelligence'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'chess-tactics',
    catalogNumber: 23,
    title: 'Chess Tactics',
    titleHi: 'शतरंज रणनीति',
    category: 'Cognitive Flexibility',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Inspect real board positions to spot mates-in-1, knight forks, and 2-ply tactical combinations.',
    instructionsEn:
      'Study the board position, click the active White piece, and click its winning tactical destination square.',
    instructionsHi:
      'शतरंज की स्थिति देखें, सही सफेद मोहरा चुनें और जीतने वाले खाने पर क्लिक करें।',
    develops: ['Planning', 'Anticipation', 'Strategic reasoning'],
    measurements: ['Correct moves', 'Solution steps'],
    learningIndicators: ['Sequencing and strategy', 'Anticipation'],
    potentialOlqRelevance: ['organising_ability', 'speed_of_decision'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'tower-of-hanoi',
    catalogNumber: 24,
    title: 'Tower of Hanoi',
    titleHi: 'हनोई टावर',
    category: 'Cognitive Flexibility',
    phase: 'Phase 2 · Advanced',
    shortDesc: 'Transfer stacked disks to the target peg without ever placing a larger disk on a smaller one.',
    instructionsEn:
      'Click a peg to pick up the top disk, then click a destination peg to place it. Larger disks cannot sit on smaller ones.',
    instructionsHi:
      'ऊपरी डिस्क उठाने के लिए स्तंभ पर क्लिक करें और लक्ष्य स्तंभ पर रखें। बड़ी डिस्क छोटी डिस्क के ऊपर नहीं रख सकते।',
    develops: ['Planning', 'Sequencing', 'Working memory'],
    measurements: ['Number of moves', 'Rule violations', 'Completion'],
    learningIndicators: ['Sequencing and strategy', 'Rule compliance'],
    potentialOlqRelevance: ['organising_ability', 'sense_of_responsibility'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'number-detective',
    catalogNumber: 25,
    title: 'Number Detective',
    titleHi: 'संख्या जासूस',
    category: 'Logical Thinking',
    phase: 'Phase 1 · Core',
    shortDesc: 'Uncover arithmetic patterns, progressions, and missing numbers in structured series.',
    instructionsEn:
      'Discover the hidden mathematical rule linking the numbers and pick the missing value.',
    instructionsHi:
      'संख्याओं के बीच छिपा गणितीय नियम पहचानें और लुप्त संख्या चुनें।',
    develops: ['Numerical reasoning', 'Pattern recognition'],
    measurements: ['Accuracy', 'Complexity achieved'],
    learningIndicators: ['Analysis and problem-solving'],
    potentialOlqRelevance: ['reasoning_ability', 'effective_intelligence'],
    supportedLevels: [1, 2, 3, 4, 5],
  },

  // F. Custom Academic Skill-Builder Games (26–29: Reading Phonics & Multiplication Tables)
  {
    id: 'phonics-sound-match',
    catalogNumber: 26,
    title: 'Phonics Sound Match',
    titleHi: 'ध्वनि-अक्षर मिलान',
    category: 'Memory Training',
    phase: 'Phase 1 · Core',
    skillFocus: 'reading',
    shortDesc:
      'Match consonant blends, digraphs (ch, sh, th), and vowel sounds to build confident reading fluency.',
    instructionsEn:
      'Read the target phonics sound clue (or tap Hear Word) and choose the word or blend that matches the target sound pattern.',
    instructionsHi:
      'दिए गए ध्वनि संकेत (या Hear Word बटन) को सुनें-पढ़ें और सही ध्वनि से मेल खाने वाला शब्द चुनें।',
    develops: ['Phonemic awareness', 'Decoding fluency', 'Reading accuracy'],
    measurements: ['Phonics accuracy', 'Word decoding time', 'Errors'],
    learningIndicators: ['Recall and working memory', 'Verbal retention'],
    potentialOlqRelevance: ['power_of_expression', 'effective_intelligence'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'syllable-word-builder',
    catalogNumber: 27,
    title: 'Syllable & Word Builder',
    titleHi: 'शब्दांश निर्माण',
    category: 'Visual Attention',
    phase: 'Phase 1 · Core',
    skillFocus: 'reading',
    shortDesc:
      'Combine phonics chunks and syllables in sequence to decode complete reading vocabulary.',
    instructionsEn:
      'Tap the syllable tiles in exact reading order to assemble the target word shown in the reading clue.',
    instructionsHi:
      'सही शब्द बनाने के लिए शब्दांश (syllable) कार्ड पर सही क्रम में क्लिक करें।',
    develops: ['Syllable segmentation', 'Reading decoding', 'Visual scanning'],
    measurements: ['Words decoded', 'Accuracy', 'Completion time'],
    learningIndicators: ['Focus and concentration', 'Reading decoding'],
    potentialOlqRelevance: ['power_of_expression', 'organising_ability'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'times-tables-sprint',
    catalogNumber: 28,
    title: 'Times Tables Sprint',
    titleHi: 'पहाड़ा अभ्यास',
    category: 'Response Control',
    phase: 'Phase 1 · Core',
    skillFocus: 'tables',
    shortDesc:
      'Practise multiplication tables (2× to 25×), squares, missing-factor prompts, and rapid mental products.',
    instructionsEn:
      'Solve each multiplication table or missing-factor question accurately without rushing into false answers.',
    instructionsHi:
      'प्रत्येक पहाड़े या लुप्त गुणक प्रश्न को ध्यान से हल करें और सही उत्तर चुनें।',
    develops: ['Multiplication table fluency', 'Number recall', 'Response speed'],
    measurements: ['Table accuracy', 'Response time', 'Errors'],
    learningIndicators: ['Impulse control and rule following', 'Arithmetic fluency'],
    potentialOlqRelevance: ['speed_of_decision', 'effective_intelligence'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
  {
    id: 'table-factor-grid',
    catalogNumber: 29,
    title: 'Table & Factor Grid',
    titleHi: 'गुणज ग्रिड',
    category: 'Logical Thinking',
    phase: 'Phase 2 · Advanced',
    skillFocus: 'tables',
    shortDesc:
      'Spot every multiple or factor pair of a target times table across an interactive number matrix.',
    instructionsEn:
      'Read the target multiplication table rule at the top and select every matching multiple in the grid.',
    instructionsHi:
      'ऊपर दिए गए पहाड़े का नियम पढ़ें और ग्रिड में उसके सभी सही गुणज चुनें।',
    develops: ['Multiplication factors', 'Number sense', 'Logical scanning'],
    measurements: ['Correct multiples', 'False selections', 'Completion time'],
    learningIndicators: ['Analysis and problem-solving', 'Table mastery'],
    potentialOlqRelevance: ['reasoning_ability', 'organising_ability'],
    supportedLevels: [1, 2, 3, 4, 5],
  },
];

// Extensible registry so future games can be registered without modifying profile/calculation code
const registeredGames: CognitiveGameDefinition[] = [...INITIAL_COGNITIVE_GAMES];

export function getCognitiveGamesCatalog(): CognitiveGameDefinition[] {
  return [...registeredGames];
}

export function getCognitiveGameById(gameId: string): CognitiveGameDefinition | undefined {
  return registeredGames.find((g) => g.id === gameId);
}

export function registerCognitiveGame(game: CognitiveGameDefinition): CognitiveGameDefinition[] {
  const idx = registeredGames.findIndex((g) => g.id === game.id);
  if (idx >= 0) {
    registeredGames[idx] = game;
  } else {
    registeredGames.push(game);
  }
  return getCognitiveGamesCatalog();
}
