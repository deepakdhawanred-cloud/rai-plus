import type { AcademicResource, ProductionRegisterRow, SchoolClassNumber } from '../types';

export type StudyResourceFormat =
  | 'mindmap'
  | 'flowchart'
  | 'quick_revision'
  | 'notebooklm'
  | 'flashcards'
  | 'exam_guide';

export type ChapterPedagogyKind =
  | 'concept'
  | 'process'
  | 'formula'
  | 'narrative'
  | 'timeline'
  | 'systems';

export interface StudyFormatOption {
  id: StudyResourceFormat;
  label: string;
  shortLabel: string;
  description: string;
  bestFor: string;
  estimatedMinutes: string;
}

export const STUDY_FORMAT_OPTIONS: StudyFormatOption[] = [
  {
    id: 'mindmap',
    label: 'Interactive Chapter Mindmap',
    shortLabel: 'Mindmap',
    description: 'Visual radial concept map showing all sub-topics, branches, and links on one canvas.',
    bestFor: 'Visual learners & big-picture overview',
    estimatedMinutes: '3–5 min',
  },
  {
    id: 'flowchart',
    label: 'Complete-Chapter Flowchart',
    shortLabel: 'Flowchart',
    description: 'Understand the whole chapter step-by-step from foundation to mechanism, example, and mastery.',
    bestFor: 'Logical step-by-step understanding',
    estimatedMinutes: '5–7 min',
  },
  {
    id: 'quick_revision',
    label: '5-Min Quick Revision Sheet',
    shortLabel: 'Quick Revision',
    description: 'High-yield summary points, key terms/formulas table, common mistakes, and memory cues.',
    bestFor: 'Pre-test & exam-eve rapid recall',
    estimatedMinutes: '4–5 min',
  },
  {
    id: 'notebooklm',
    label: 'NotebookLM Study & Audio Pack',
    shortLabel: 'NotebookLM',
    description: 'NotebookLM-aligned Briefing Doc, Audio Overview dialogue brief, FAQ & copyable studio prompts.',
    bestFor: 'Listening, Q&A & deep NotebookLM synthesis',
    estimatedMinutes: '5–8 min',
  },
  {
    id: 'flashcards',
    label: 'Active Recall Flashcards',
    shortLabel: 'Flashcards',
    description: 'Interactive flip cards with instant self-check mastery tracking for every chapter.',
    bestFor: 'Memory retention & rapid self-testing',
    estimatedMinutes: '4–6 min',
  },
  {
    id: 'exam_guide',
    label: 'Best-Recommended Resources & Practice',
    shortLabel: 'Best Resources',
    description: 'Curated NCERT/HBSE study paths, school repository links, and high-scoring question patterns.',
    bestFor: 'Complete exam readiness & extra practice',
    estimatedMinutes: '6–10 min',
  },
];

export interface SyllabusChapterEntry {
  id: string;
  classNumber: SchoolClassNumber;
  subject: string;
  chapterNumber: number;
  title: string;
  kind: ChapterPedagogyKind;
  keyTopics: string[];
  realLifeAnchor: string;
  sourceTag: 'NCERT / HBSE Core' | 'School Register';
}

export interface MindmapBranch {
  id: string;
  title: string;
  colorKey: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';
  summary: string;
  subNodes: string[];
}

export interface FlowchartStage {
  id: string;
  stepNumber: number;
  title: string;
  nodeType: 'start' | 'concept' | 'decision' | 'application' | 'checkpoint';
  connectorLabel: string;
  headline: string;
  details: string[];
  keyQuestion: string;
  quickAnswer: string;
}

export interface QuickRevisionKeyItem {
  term: string;
  definitionOrFormula: string;
  memoryCue: string;
}

export interface ChapterFlashcard {
  id: string;
  prompt: string;
  answer: string;
  hint: string;
  tag: string;
}

export interface NotebookLmStudioPack {
  sourceBriefMarkdown: string;
  audioOverviewPrompt: string;
  mindmapStudyGuidePrompt: string;
  audioOverviewDialoguePreview: Array<{ host: 'Host A' | 'Host B'; line: string }>;
  briefingFaq: Array<{ question: string; answer: string }>;
}

export interface RecommendedResourceItem {
  id: string;
  title: string;
  provider: string;
  formatLabel: string;
  whyRecommended: string;
  studyTip: string;
}

export interface ChapterVisualStudyPack {
  chapter: SyllabusChapterEntry;
  recommendedFormat: StudyResourceFormat;
  recommendedReason: string;
  stageLabel: string;
  centralIdea: string;
  mindmap: {
    centerTitle: string;
    centerSubtitle: string;
    branches: MindmapBranch[];
  };
  flowchart: FlowchartStage[];
  quickRevision: {
    estimatedMinutes: number;
    highYieldBullets: string[];
    keyItems: QuickRevisionKeyItem[];
    commonMistakes: string[];
    mnemonic: string;
  };
  notebookLm: NotebookLmStudioPack;
  flashcards: ChapterFlashcard[];
  recommendedResources: RecommendedResourceItem[];
}

type ChapterSeed = [title: string, kind: ChapterPedagogyKind, topics: string[], anchor: string];

export const ALL_CLASS_NUMBERS: SchoolClassNumber[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
];

const CORE_SYLLABUS: Record<SchoolClassNumber, Record<string, ChapterSeed[]>> = {
  1: {
    Mathematics: [
      ['Shapes and Space', 'concept', ['Inside & Outside', 'Top & Bottom', 'Rolling & Sliding', 'Basic 2D Shapes'], 'Sorting classroom objects and toys by shape'],
      ['Numbers from One to Nine', 'concept', ['Counting 1–9', 'One-to-One Matching', 'More & Less', 'Number Names'], 'Counting pencils, apples, and steps'],
      ['Addition up to 9', 'process', ['Combining Groups', 'Plus (+) Sign', 'Vertical & Horizontal Addition', 'Word Stories'], 'Counting total fruits in two baskets'],
      ['Subtraction up to 9', 'process', ['Take Away Concept', 'Minus (−) Sign', 'Zero as Remainder', 'Daily Stories'], 'Finding remaining candies after sharing'],
      ['Numbers from Ten to Twenty', 'concept', ['Bundle of 10', 'Tens & Ones', 'Before & After', 'Comparing Numbers'], 'Grouping sticks into bundles of ten'],
      ['Time and Daily Routine', 'timeline', ['Morning, Afternoon, Night', 'Sequence of Events', 'Longer vs Shorter Time'], 'Following a school day timetable'],
      ['Measurement', 'process', ['Longer & Shorter', 'Heavier & Lighter', 'Handspan & Footspan'], 'Measuring a desk using handspans'],
      ['Patterns and Money', 'systems', ['Repeating Shapes', 'Number Patterns', 'Common Coins & Notes'], 'Buying a notebook using coins'],
    ],
    English: [
      ['A Happy Child & Three Little Pigs', 'narrative', ['Rhyme Words', 'Action Verbs', 'House Materials', 'Comprehension'], 'Talking about home and family safety'],
      ['After a Bath & The Bubble', 'narrative', ['Daily Hygiene Words', 'Naming Words', 'Story Sequence'], 'Describing morning habits cleanly'],
      ['One Little Kitten & Lalu and Peelu', 'concept', ['Number & Colour Words', 'Animal Names', 'Opposites'], 'Spotting colours and animals around home'],
      ['Once I Saw a Little Bird & Mittu', 'narrative', ['Nature Vocabulary', 'Sentence Framing', 'Listening Skills'], 'Observing birds in the school garden'],
      ['Merry-Go-Round & Circle', 'concept', ['Shapes in Stories', 'Position Words', 'Picture Reading'], 'Drawing circles and playground rides'],
      ['If I Were an Apple & Our Tree', 'systems', ['Parts of a Tree', 'Giving & Sharing', 'Rhyming Pairs'], 'Caring for a sapling at school'],
    ],
    Hindi: [
      ['झूला और आम की कहानी', 'narrative', ['स्वर पहचान', 'कविता लय', 'चित्र वर्णन'], 'बगीचे में खेल और फलों के नाम'],
      ['पत्ते ही पत्ते और पकौड़ी', 'concept', ['व्यंजन अभ्यास', 'मात्रा परिचय', 'स्वाद व रंग शब्द'], 'घर की रसोई और प्रकृति के पत्ते'],
      ['छुक-छुक गाड़ी और रसोईघर', 'systems', ['आ (ा) व इ (ि) मात्रा', 'यातायात शब्द', 'वाक्य निर्माण'], 'रेल यात्रा और रसोई की वस्तुएँ'],
      ['बंदर और गिलहरी', 'narrative', ['कहानी क्रम', 'संवाद पठन', 'जानवरों के नाम'], 'पेड़ पर रहने वाले जीवों को जानना'],
      ['पतंग और गेंद-बल्ला', 'concept', ['उ (ु) व ऊ (ू) मात्रा', 'खेल शब्दावली', 'समान तुक शब्द'], 'मैदान के खेल और सुरक्षित पतंगबाज़ी'],
      ['चूहा म्याऊँ सो रही है', 'narrative', ['ए व ऐ मात्रा', 'कविता वाचन', 'प्रश्न-उत्तर'], 'ध्यान से सुनना और पढ़ना'],
    ],
    EVS: [
      ['About Me and My Family', 'concept', ['Self Introduction', 'Family Members', 'Helping at Home'], 'Sharing family roles and care'],
      ['My Body and Sense Organs', 'systems', ['Five Senses', 'Body Parts', 'Cleanliness Habits'], 'Using eyes, ears, and hands safely'],
      ['Food We Eat', 'concept', ['Healthy Foods', 'Meals of the Day', 'Drinking Clean Water'], 'Packing a balanced school tiffin'],
      ['Plants and Animals Around Us', 'concept', ['Big & Small Plants', 'Pet vs Wild Animals', 'Caring for Nature'], 'Watering plants in the school yard'],
      ['My Home and Neighbourhood', 'systems', ['Rooms in a House', 'Community Helpers', 'Keeping Clean'], 'Knowing teachers, doctors, and postmen'],
      ['Seasons, Air and Water', 'process', ['Summer, Rainy, Winter', 'Uses of Water', 'Saving Every Drop'], 'Choosing clothes for each season'],
    ],
    'Computer Skills': [
      ['Meet the Computer Machine', 'concept', ['Natural vs Man-Made', 'Computer as a Smart Machine', 'Places Computers Work'], 'Spotting computers in schools and shops'],
      ['Parts of a Computer', 'systems', ['Monitor', 'CPU', 'Keyboard', 'Mouse'], 'Identifying each part in the computer lab'],
      ['Using the Mouse Properly', 'process', ['Hold Gently', 'Left Click', 'Double Click', 'Drag & Drop'], 'Opening a drawing app with a mouse'],
      ['Knowing the Keyboard', 'concept', ['Alphabet Keys', 'Number Keys', 'Spacebar & Enter'], 'Typing your own name carefully'],
      ['Fun with Digital Drawing', 'process', ['Pencil & Brush Tool', 'Fill Colour', 'Shapes Tool', 'Save Drawing'], 'Drawing a house and sun digitally'],
      ['Computer Lab Manners & Safety', 'concept', ['Clean Hands', 'Sit Straight', 'Proper Shutdown', 'No Food Near PC'], 'Keeping lab workstations neat and safe'],
    ],
  },
  2: {
    Mathematics: [
      ['What is Long, What is Round?', 'concept', ['3D Shapes', 'Stacking vs Rolling', 'Flat & Curved Faces'], 'Packing lunchboxes and balls'],
      ['Counting in Groups & Tens', 'process', ['Skip Counting 2s, 5s, 10s', 'Place Value Tens & Ones', 'Expanded Form'], 'Counting coins and classroom chairs quickly'],
      ['Addition with Carryover', 'process', ['2-Digit Addition', 'Regrouping Ones to Tens', 'Mental Math'], 'Adding book prices at a stationery shop'],
      ['Subtraction with Borrowing', 'process', ['2-Digit Subtraction', 'Regrouping Tens', 'Checking by Addition'], 'Finding change left after buying notebooks'],
      ['Multiplication as Repeated Addition', 'formula', ['Groups of Equal Size', 'Tables 2 to 10', '× Symbol'], 'Counting wheels on 6 bicycles'],
      ['Measurement of Length, Weight & Capacity', 'process', ['cm & m Intuition', 'Heavy vs Light', 'Cups & Litres'], 'Comparing water bottles and school bags'],
      ['Time, Calendar and Days', 'timeline', ['Clock Hours', 'Days of Week', 'Months & Seasons'], 'Reading birthdays on a wall calendar'],
      ['Data Handling & Pictographs', 'systems', ['Tally Marks', 'Picture Charts', 'Most & Least'], 'Charting favourite fruits of classmates'],
    ],
    English: [
      ['First Day at School & Haldi’s Adventure', 'narrative', ['Feelings Vocabulary', 'Days of Week', 'Question Words'], 'Sharing first-day school memories'],
      ['I Am Lucky & I Want', 'concept', ['Animal Abilities', 'Action Words', 'Self Appreciation'], 'Celebrating unique strengths'],
      ['A Smile & The Wind and the Sun', 'narrative', ['Doing Words', 'Comparison Words', 'Moral Reasoning'], 'Using kindness over force in teamwork'],
      ['Rain & Storm in the Garden', 'systems', ['Weather Vocabulary', 'Prepositions', 'Sound Words'], 'Observing monsoon clouds and gardens'],
      ['Zoo Manners & Funny Bunny', 'narrative', ['Rhyming Words', 'Story Cause & Effect', 'Animal Care'], 'Being respectful visitors at a zoo'],
      ['Curlylocks & Make It Shorter', 'narrative', ['Size Adjectives', 'Clever Problem Solving', 'Retelling'], 'Thinking creatively like Birbal'],
    ],
    Hindi: [
      ['ऊँट चला और भालू ने खेली फुटबॉल', 'narrative', ['संयुक्ताक्षर पहचान', 'कविता लय', 'पशु व्यवहार'], 'खेल और प्रकृति का आनंद'],
      ['म्याऊँ, म्याऊँ और अधिक बलवान कौन', 'narrative', ['तुलना शब्द', 'संवाद पठन', 'विवेक की सीख'], 'विनम्रता और समझदारी से समाधान'],
      ['दोस्त की मदद और बहुत हुआ', 'narrative', ['मित्रता मूल्य', 'वर्षा शब्दावली', 'वाक्य रचना'], 'कठिनाई में दोस्त का साथ देना'],
      ['मेरी किताब और तितली और कली', 'concept', ['पुस्तक प्रेम', 'रंग व प्रकृति शब्द', 'तुकबंदी'], 'स्कूल पुस्तकालय से किताब चुनना'],
      ['बुलबुल और मीठी सारंगी', 'systems', ['पक्षी पहचान', 'संगीत वाद्य', 'सूक्ष्म अवलोकन'], 'आसपास के पक्षियों की आवाज़ सुनना'],
      ['सूरज जल्दी आना जी', 'concept', ['मौसम चक्र', 'धूप का महत्व', 'प्रश्नोत्तर लेखन'], 'सर्दी और धूप का अनुभव'],
    ],
    EVS: [
      ['Our Body & Healthy Habits', 'systems', ['Internal vs External Organs', 'Exercise & Sleep', 'Good Posture'], 'Building a daily fitness routine'],
      ['Food Groups and Nutrition', 'concept', ['Energy-Giving', 'Body-Building', 'Protective Foods'], 'Planning a colourful balanced meal'],
      ['Types of Houses and Clothes', 'systems', ['Kuchcha & Pucca Houses', 'Seasonal Fabrics', 'Weather Adaptation'], 'Why woollens keep us warm in winter'],
      ['Means of Transport & Communication', 'systems', ['Land, Water, Air Travel', 'Letters, Phone, Internet', 'Road Safety'], 'Crossing roads safely at zebra crossings'],
      ['Our Earth, Sun and Sky', 'concept', ['Day & Night', 'Landforms', 'Saving Trees'], 'Observing sunrise shadows in the courtyard'],
      ['Festivals and Community Living', 'timeline', ['National & Harvest Festivals', 'Sharing & Respect', 'Clean Surroundings'], 'Celebrating diversity with neighbours'],
    ],
    'Computer Skills': [
      ['Computer Types & Uses', 'concept', ['Desktop, Laptop, Tablet', 'Input-Process-Output Idea', 'Daily Uses'], 'Recognizing digital devices at home and school'],
      ['Keyboard Special Keys', 'concept', ['Caps Lock', 'Backspace & Delete', 'Arrow Keys', 'Shift Key'], 'Correcting spelling mistakes while typing'],
      ['Mouse Actions Mastery', 'process', ['Right Click Menu', 'Scroll Wheel', 'Select & Move'], 'Navigating folders smoothly'],
      ['WordPad Typing Basics', 'process', ['Typing Sentences', 'Font Size & Bold', 'Saving a Document'], 'Writing a 5-line paragraph on My School'],
      ['MS Paint Shapes & Text', 'process', ['Polygons & Curves', 'Text Tool', 'Eraser & Undo'], 'Designing a digital greeting card'],
      ['Safe & Healthy Screen Habits', 'concept', ['Eye Distance', '20-20-20 Rule', 'Ask an Adult Online'], 'Practising safe computer posture'],
    ],
  },
  3: {
    Mathematics: [
      ['Where to Look From & Fun with Numbers', 'concept', ['Top, Front, Side Views', '3-Digit Place Value', 'Skip Counting by 10s & 100s'], 'Reading cricket scores and page numbers'],
      ['Give and Take (3-Digit Addition & Subtraction)', 'process', ['Column Addition', 'Borrowing Across Zero', 'Word Problems'], 'Calculating school trip expenses'],
      ['Long and Short (Length Measurement)', 'formula', ['Centimetre, Metre, Kilometre', 'Using a Ruler', 'Unit Conversion'], 'Measuring classroom length and heights'],
      ['Shapes and Designs', 'concept', ['Edges & Corners', 'Tangrams', 'Tiling Patterns'], 'Recognizing geometric tiles on floors'],
      ['Time Goes On', 'timeline', ['Reading Clock Minutes', 'Calendar Dates', 'Age Calculation'], 'Planning exam revision schedules'],
      ['How Many Times? (Multiplication)', 'formula', ['2-Digit × 1-Digit', 'Lattice Method', 'Real-Life Multipliers'], 'Calculating total notebooks for a whole class'],
      ['Can We Share? (Division Basics)', 'process', ['Equal Grouping', 'Repeated Subtraction', 'Remainder Idea'], 'Sharing chocolates equally among friends'],
      ['Rupees, Paise & Smart Charts', 'systems', ['Making Bills', 'Bar Charts', 'Interpreting Data'], 'Checking a grocery receipt accurately'],
    ],
    English: [
      ['Good Morning & The Magic Garden', 'narrative', ['Nature Adjectives', 'Collective Nouns', 'Paragraph Writing'], 'Observing pollinators in a garden'],
      ['Bird Talk & Nina and the Baby Sparrows', 'narrative', ['Empathy & Care', 'Past Tense Verbs', 'Dialogue Reading'], 'Protecting bird nests around homes'],
      ['Little by Little & The Enormous Turnip', 'process', ['Plant Growth Stages', 'Singular & Plural', 'Teamwork Moral'], 'Growing a bean seed in a cup'],
      ['Sea Song & A Little Fish Story', 'narrative', ['Sensory Words', 'Adjectives', 'Gratitude Theme'], 'Listening to shell sounds and ocean facts'],
      ['The Balloon Man & The Yellow Butterfly', 'concept', ['Opposites', 'Compound Words', 'Descriptive Writing'], 'Observing butterfly wings and symmetry'],
      ['Trains & The Story of the Road', 'systems', ['Transport Vocabulary', 'Punctuation', 'Community Awareness'], 'Noticing morning sounds in your town'],
    ],
    Hindi: [
      ['कक्कू और शेखीबाज़ मक्खी', 'narrative', ['संज्ञा पहचान', 'विनम्रता का संदेश', 'शब्दार्थ अभ्यास'], 'घमंड छोड़कर सबका सम्मान करना'],
      ['चाँद वाली अम्मा और मन करता है', 'narrative', ['कल्पनाशील लेखन', 'तुकांत शब्द', 'कविता भाव'], 'आसमान और तारों का अवलोकन'],
      ['बहादुर बित्तो और टिपटिपवा', 'narrative', ['लोककथा समझ', 'साहस व बुद्धिमानी', 'मुहावरे परिचय'], 'डर के समय शांत रहकर सोचना'],
      ['बंदर बाँट और अक्ल बड़ी या भैंस', 'concept', ['न्याय व बुद्धिमत्ता', 'संवाद लेखन', 'विलोम शब्द'], 'विवाद को समझदारी से सुलझाना'],
      ['क्योंजीमल और कैसे कैसलिया', 'process', ['प्रश्नवाचक शब्द', 'रोटी बनने की प्रक्रिया', 'क्रिया पहचान'], 'गेहूँ से रोटी बनने की यात्रा समझना'],
      ['मीरा बहन और बाघ', 'systems', ['वन्यजीव संरक्षण', 'करुणा व अहिंसा', 'अनुच्छेद लेखन'], 'पर्यावरण और जीवों की रक्षा'],
    ],
    EVS: [
      ['Poonam’s Day Out & The Plant Fairy', 'concept', ['Animal Habitats', 'Leaf Shapes & Textures', 'Plant Classification'], 'Creating a leaf-rubbing scrapbook'],
      ['Water O’ Water! & Drop by Drop', 'systems', ['Sources of Water', 'Water Conservation', 'Rainwater Harvesting'], 'Tracking household water usage'],
      ['Our First School & Chhotu’s House', 'concept', ['Family Values', 'Clean Home Zones', 'Co-existence'], 'Designing an eco-friendly clean room'],
      ['Foods We Eat & Saying Without Speaking', 'concept', ['Regional Foods', 'Nutrition by Age', 'Sign Language & Expressions'], 'Appreciating diverse Indian foods'],
      ['Flying High & Making Pots', 'process', ['Bird Beaks & Feet', 'Clay to Pottery Steps', 'Local Crafts'], 'Understanding how potters shape clay'],
      ['Here Comes a Letter & Mapping My Way', 'systems', ['Postal Journey', 'Directions & Symbols', 'Simple Maps'], 'Drawing a route map from home to school'],
    ],
    'Computer Skills': [
      ['Hardware and Software Basics', 'systems', ['Input, Processing, Output, Storage', 'System vs App Software'], 'Categorizing lab devices by role'],
      ['Operating System & Desktop', 'concept', ['Icons & Taskbar', 'Start Menu', 'Wallpaper & Windows'], 'Organizing files neatly on desktop'],
      ['Files, Folders & Copy-Paste', 'process', ['Create Folder', 'Rename File', 'Copy (Ctrl+C) & Paste (Ctrl+V)'], 'Sorting homework files into subject folders'],
      ['Formatting Text in Word Processor', 'process', ['Font Styles', 'Alignment', 'Bullet Lists', 'Spell Check'], 'Formatting a neat class notice'],
      ['Touch Typing Home Row (ASDF JKL;)', 'process', ['Finger Placement', 'Posture', 'Accuracy Before Speed'], 'Building 15 WPM clean typing habit'],
      ['Introduction to Safe Internet', 'concept', ['What is a Browser?', 'Educational Websites', 'Digital Etiquette'], 'Using school-approved learning portals'],
    ],
  },
  4: {
    Mathematics: [
      ['Building with Bricks & Long and Short', 'concept', ['Brick Patterns', 'Symmetry', 'Metres & Kilometres'], 'Estimating heights of buildings and tracks'],
      ['A Trip to Bhopal (Large Number Operations)', 'process', ['4-Digit Operations', 'Time & Distance Math', 'Multi-Step Word Problems'], 'Planning seats and budget for a school excursion'],
      ['Tick-Tick-Tick (24-Hour Clock & Dates)', 'timeline', ['AM/PM vs 24-Hour Time', 'Duration Calculation', 'Expiry Dates'], 'Reading train timetables and food packets'],
      ['Carts and Wheels (Circles)', 'concept', ['Centre, Radius & Diameter', 'Drawing with Compass', 'Balancing Circles'], 'Measuring bicycle wheels and bangles'],
      ['Halves and Quarters (Fractions)', 'formula', ['Numerator & Denominator', 'Equivalent Fractions', 'Fraction of a Collection'], 'Dividing a roti or chocolate bar fairly'],
      ['Play with Patterns & Tables and Shares', 'process', ['Number Towers', '2-Digit Multiplication', 'Long Division'], 'Sharing library books across classes'],
      ['How Heavy? How Light? (Mass & Volume)', 'formula', ['Grams & Kilograms', 'Litres & Millilitres', 'Balance Scales'], 'Weighing vegetables and measuring milk'],
      ['Fields and Fences (Perimeter & Area)', 'formula', ['Boundary Length', 'Square Grid Area', 'Comparing Shapes'], 'Calculating fencing needed for a garden'],
    ],
    English: [
      ['Wake Up! & Neha’s Alarm Clock', 'narrative', ['Time Expressions', 'Conjunctions', 'Routine Discipline'], 'Waking up naturally with a body clock'],
      ['Noses & The Little Fir Tree', 'concept', ['Adjectives', 'Antonyms', 'Contentment Moral'], 'Valuing who we are'],
      ['Run! & Nasruddin’s Aim', 'narrative', ['Action Verbs', 'Practice vs Luck', 'Story Sequencing'], 'Practising sports consistently'],
      ['Why? & Alice in Wonderland', 'concept', ['Curiosity Questions', 'Descriptive Phrases', 'Imagination'], 'Asking scientific "why" questions'],
      ['Helen Keller & The Donkey', 'timeline', ['Perseverance', 'Braille & Accessibility', 'Empathy'], 'Learning how determination overcomes barriers'],
      ['The Scholar’s Mother Tongue & Pinocchio', 'narrative', ['Honesty & Wit', 'Prefixes & Suffixes', 'Role Play'], 'Practising truthful communication'],
    ],
    Hindi: [
      ['मन के भोले-भाले बादल और जैसा सवाल वैसा जवाब', 'narrative', ['विशेषण शब्द', 'वाक्पटुता', 'कविता भावार्थ'], 'बरसात के बादलों के आकार देखना'],
      ['किरमिच की गेंद और पापा जब बच्चे थे', 'narrative', ['ईमानदारी मूल्य', 'लक्ष्य चयन', 'संवाद शैली'], 'सही और ईमानदार निर्णय लेना'],
      ['दोस्त की पोशाक और नाव बनाओ नाव बनाओ', 'concept', ['मित्रता व सम्मान', 'कागज़ शिल्प', 'पर्यायवाची शब्द'], 'मित्रों का आदर करना'],
      ['दान का हिसाब और कौन?', 'process', ['गणितीय तर्क कहानी', 'कविता बोध', 'मुहावरे'], 'छोटी संख्याओं की दोगुनी वृद्धि समझना'],
      ['स्वतंत्रता की ओर', 'timeline', ['दांडी मार्च परिचय', 'देशभक्ति', 'काल (भूत-वर्तमान-भविष्य)'], 'गांधीजी के सत्य और साहस को जानना'],
      ['थप्प रोटी थप्प दाल और सुनीता की पहिया कुर्सी', 'concept', ['समावेशी दृष्टिकोण', 'संवेदनशीलता', 'नाटक संवाद'], 'सबके प्रति समान और सहायक व्यवहार'],
    ],
    EVS: [
      ['Going to School & Ear to Ear', 'systems', ['Terrain Bridges & Transport', 'Animal Ears & Skin Patterns', 'Adaptation'], 'How geography shapes daily travel in India'],
      ['A Day with Nandu & The Story of Amrita', 'concept', ['Elephant Herd Behaviour', 'Khejri Trees', 'Bishnoi Conservation'], 'Protecting local trees and wildlife'],
      ['Omana’s Journey & From the Window', 'timeline', ['Railway Map of India', 'Tunnels & Bridges', 'Regional Languages'], 'Tracking a train route across states'],
      ['A River’s Tale & Basva’s Farm', 'process', ['River Pollution & Cleaning', 'Crop Cultivation Steps', 'Farm Tools'], 'Understanding how food travels from farm to plate'],
      ['Abdul in the Garden & Eating Together', 'systems', ['Tap vs Fibrous Roots', 'Photosynthesis Intro', 'Mid-Day Meal Unity'], 'Examining plant roots and soil moisture'],
      ['The World in My Home & Defence Officer Wahida', 'concept', ['Gender Equality', 'Decision Making', 'Indian Navy Inspiration'], 'Building courage and fair choices'],
    ],
    'Computer Skills': [
      ['Memory & Storage Devices', 'systems', ['RAM vs ROM', 'Hard Disk, SSD, Pendrive, Cloud', 'Storage Units'], 'Understanding how files stay saved'],
      ['File Management & Folder Trees', 'process', ['Cut, Copy, Paste, Move', 'Folder Hierarchy', 'Recycle Bin'], 'Organizing Class 4 notes cleanly'],
      ['Document Design in Word', 'process', ['Headers, Tables & Pictures', 'Line Spacing', 'Page Borders'], 'Creating a formatted science project page'],
      ['Introduction to Presentations', 'process', ['Slide Layouts', 'Adding Images', 'Concise Bullet Points'], 'Building a 4-slide presentation on Solar System'],
      ['Logical Thinking with Block Coding', 'process', ['Sequence', 'Repeat Loops', 'Simple Sprites'], 'Guiding a character through a maze'],
      ['Cyber Safety & Strong Passwords', 'concept', ['Never Share OTP/Passwords', 'Kind Digital Behaviour', 'Fact Checking'], 'Staying safe on school tablets'],
    ],
  },
  5: {
    Mathematics: [
      ['The Fish Tale (Large Numbers & Lakhs/Crores)', 'formula', ['Indian Place Value', 'Estimation', 'Speed & Distance Word Problems'], 'Calculating market trade and boat speeds'],
      ['Shapes and Angles', 'concept', ['Acute, Right, Obtuse Angles', 'Using a Protractor', 'Angles in Polygons'], 'Measuring angles in clock hands and doors'],
      ['How Many Squares? (Area & Perimeter)', 'formula', ['Area of Rectangles & Triangles', 'Perimeter Comparison', 'Irregular Grid Area'], 'Comparing room floor areas'],
      ['Parts and Wholes (Fractions)', 'formula', ['Equivalent Fractions', 'Adding Like Fractions', 'Fraction of Quantity'], 'Splitting time and recipes accurately'],
      ['Be My Multiple, I’ll Be Your Factor', 'process', ['Factors & Multiples', 'Prime & Composite', 'LCM & HCF Intro'], 'Scheduling events that repeat together'],
      ['Tenths and Hundredths (Decimals)', 'formula', ['Decimal Place Value', 'Money & Metric Conversions', 'Decimal Addition'], 'Reading thermometer and height measurements'],
      ['Ways to Multiply and Divide', 'process', ['3-Digit Multiplication', 'Long Division Verification', 'Unitary Method'], 'Finding per-item cost in bulk packs'],
      ['How Big? How Heavy? (Volume & Weight)', 'formula', ['Cubic Centimetres', 'Volume of Cuboids', 'Water Displacement'], 'Packing boxes efficiently inside a carton'],
    ],
    English: [
      ['Ice-Cream Man & Wonderful Waste!', 'process', ['Creative Reuse (Avial)', 'Describing Words', 'Recipe Sequencing'], 'Turning kitchen scraps into value'],
      ['Teamwork & Flying Together', 'narrative', ['Collective Strength', 'Prepositions', 'Listening to Wisdom'], 'Winning group projects through unity'],
      ['My Shadow & Robinson Crusoe', 'narrative', ['Light & Shadows', 'Conjunctions', 'Survival Problem Solving'], 'Observing how shadow length changes by hour'],
      ['Crying & My Elder Brother', 'concept', ['Time Management', 'Experience vs Marks', 'Letter Writing'], 'Balancing study discipline and play'],
      ['Rip Van Winkle & Class Discussion', 'narrative', ['Active Participation', 'Adverbs', 'Character Sketches'], 'Speaking confidently in class circles'],
      ['Around the World & Malu Bhalu', 'concept', ['Travelogue Reading', 'Courage & Independence', 'Pronouns'], 'Mapping continents and polar habitats'],
    ],
    Hindi: [
      ['राख की रस्सी और फसलों के त्योहार', 'concept', ['बुद्धिमत्ता कथा', 'भारत के कृषि पर्व', 'संज्ञा के भेद'], 'पोंगल, लोहड़ी, बिहू और मकर संक्रांति को जानना'],
      ['खिलौनेवाला और नन्हा फनकार', 'narrative', ['शिल्प कला सम्मान', 'भाववाचक संज्ञा', 'शब्द निर्माण'], 'कारीगरों की मेहनत की सराहना'],
      ['जहाँ चाह वहाँ राह', 'process', ['इला सचानी की प्रेरणा', 'धैर्य व कौशल', 'सकर्मक-अकर्मक क्रिया'], 'कठिन लक्ष्य को अभ्यास से जीतना'],
      ['चिट्ठी का सफ़र और डाकिए की कहानी', 'systems', ['पिनकोड व्यवस्था', 'संचार इतिहास', 'औपचारिक पत्र'], 'पत्र पर सही पता और पिनकोड लिखना'],
      ['वे दिन भी क्या दिन थे और एक माँ की बेबसी', 'concept', ['भविष्य की शिक्षा', 'सहानुभूति', 'काल परिवर्तन'], 'डिजिटल और पारंपरिक कक्षा की तुलना'],
      ['स्वामी की दादी और बाघ आया उस रात', 'narrative', ['पीढ़ीगत स्नेह', 'पर्यावरण संतुलन', 'कहानी सार'], 'बड़ों के अनुभवों से सीखना'],
    ],
    EVS: [
      ['Super Senses & A Snake Charmer’s Story', 'systems', ['Animal Super Senses', 'Food Chain Balance', 'Wildlife Protection Act'], 'How ants follow scent trails'],
      ['From Tasting to Digesting', 'process', ['Taste Buds', 'Digestive Pathway', 'Glucose & Balanced Diet'], 'Why chewing food properly aids digestion'],
      ['Seeds and Seeds & Every Drop Counts', 'process', ['Seed Dispersal Modes', 'Germination Conditions', 'Traditional Stepwells'], 'Sprouting chana seeds and tracking water'],
      ['Experiments with Water & A Treat for Mosquitoes', 'process', ['Floating vs Sinking', 'Dissolving', 'Malaria Prevention & Hygiene'], 'Preventing stagnant water around homes'],
      ['Up You Go! & Sunita in Space', 'systems', ['Mountaineering Leadership', 'Gravity & Space Life', 'Globe & Borders'], 'Understanding why astronauts float in orbit'],
      ['What If It Finishes? & Blow Hot, Blow Cold', 'systems', ['Fossil Fuels vs Renewables', 'Air Expansion & Breathing', 'Conservation'], 'Saving fuel and measuring breathing rate'],
    ],
    'Computer Skills': [
      ['Generations & Architecture of Computers', 'timeline', ['CPU: ALU + CU + Registers', 'Primary vs Secondary Memory', 'Speed Units'], 'Tracing how computers evolved to smartphones'],
      ['Spreadsheets Introduction (Tables & Formulas)', 'formula', ['Cells, Rows, Columns', 'SUM & AVERAGE Formulas', 'Simple Charts'], 'Calculating class marks and totals in a sheet'],
      ['Advanced Word & Smart Diagrams', 'process', ['Columns & Shapes', 'Find & Replace', 'Export to PDF'], 'Publishing a class newsletter'],
      ['Presentation Storytelling & Visuals', 'process', ['Visual Hierarchy', 'Clean Transitions', 'Speaker Notes'], 'Presenting an EVS chapter in 6 clear slides'],
      ['Algorithms & Flowcharts Basics', 'process', ['Start/Stop, Input, Process, Decision Symbols', 'Stepwise Logic'], 'Drawing a flowchart to decide exam revision steps'],
      ['Digital Citizenship & Citation', 'concept', ['Copyright Respect', 'Evaluating Online Info', 'Safe Communication'], 'Citing sources in school projects'],
    ],
  },
  6: {
    Mathematics: [
      ['Knowing Our Numbers', 'formula', ['Indian & International Systems', 'Estimation & Rounding', 'Roman Numerals'], 'Comparing state populations and budgets'],
      ['Whole Numbers & Playing with Numbers', 'process', ['Divisibility Rules (2–11)', 'Prime Factorization', 'HCF & LCM Applications'], 'Finding synchronized traffic light intervals'],
      ['Basic Geometrical Ideas & Elementary Shapes', 'concept', ['Points, Rays, Polygons', 'Triangle & Quadrilateral Types', '3D Nets'], 'Identifying bridges and architectural triangles'],
      ['Integers', 'concept', ['Number Line Negatives', 'Addition & Subtraction Rules', 'Temperature & Elevation'], 'Tracking sub-zero Ladakh temperatures'],
      ['Fractions & Decimals', 'formula', ['Mixed/Improper Fractions', 'Fraction Operations', 'Decimal Place Value'], 'Splitting distances and sports timings'],
      ['Data Handling & Mensuration', 'formula', ['Bar Graphs', 'Perimeter of Regular Polygons', 'Area of Composite Rectangles'], 'Designing a school playground layout'],
      ['Algebra Introduction', 'formula', ['Variables & Constants', 'Matchstick Patterns', 'Simple Equations'], 'Expressing general perimeter formulas'],
      ['Ratio and Proportion', 'formula', ['Equivalent Ratios', 'Proportionality Check', 'Unitary Method'], 'Scaling cooking recipes and map distances'],
    ],
    Science: [
      ['Components of Food', 'concept', ['Carbohydrates, Proteins, Fats, Vitamins', 'Food Tests (Iodine/Biuret)', 'Deficiency Diseases'], 'Testing starch in potatoes and building balanced meals'],
      ['Sorting Materials & Separation of Substances', 'process', ['Solubility & Transparency', 'Sieving, Filtration, Evaporation, Distillation'], 'Purifying muddy water cleanly'],
      ['Getting to Know Plants', 'systems', ['Herbs, Shrubs, Trees', 'Venation & Root Link', 'Transpiration & Flower Parts'], 'Dissecting a hibiscus flower to label stamens'],
      ['Body Movements', 'systems', ['Ball-and-Socket, Hinge, Pivot Joints', 'Skeleton & Muscles', 'Animal Gait'], 'Understanding how elbow and shoulder joints move'],
      ['The Living Organisms & Their Surroundings', 'systems', ['Desert, Mountain, Aquatic Adaptations', 'Biotic & Abiotic Factors', 'Characteristics of Life'], 'Why camels survive desert heat'],
      ['Motion and Measurement of Distances', 'process', ['SI Units (Metre)', 'Rectilinear, Circular, Periodic Motion', 'Error-Free Ruler Reading'], 'Measuring curved lines with thread'],
      ['Light, Shadows and Reflections', 'process', ['Luminous/Opaque/Translucent', 'Pinhole Camera', 'Plane Mirror Reflection'], 'Building a simple pinhole camera'],
      ['Electricity, Circuits & Fun with Magnets', 'systems', ['Electric Cell & Switch', 'Conductors vs Insulators', 'Magnetic Poles & Compass'], 'Wiring a simple bulb tester and compass'],
    ],
    'Social Science': [
      ['What, Where, How and When? (Early History)', 'timeline', ['Manuscripts & Inscriptions', 'BCE/CE Timeline', 'Early River Settlements'], 'How archaeologists reconstruct past life'],
      ['In the Earliest Cities (Harappan Civilization)', 'systems', ['Town Planning & Drainage', 'Great Bath', 'Trade & Seals'], 'Comparing Harappan drains to modern cities'],
      ['Ashoka, The Emperor Who Gave Up War', 'timeline', ['Mauryan Administration', 'Kalinga War Turning Point', 'Dhamma Inscriptions'], 'How Ashoka’s Lion Capital became India’s emblem'],
      ['The Earth in the Solar System & Globe Latitudes', 'systems', ['Planets & Orbits', 'Equator, Tropics & Time Zones', 'IST (+5:30)'], 'Why sunrise happens earlier in Arunachal than Gujarat'],
      ['Motions of the Earth & Major Landforms', 'process', ['Rotation (Day/Night)', 'Revolution (Seasons)', 'Mountains, Plateaus, Plains'], 'Why summer days are longer in June'],
      ['Understanding Diversity & Government', 'concept', ['Cultural Diversity', 'Democracy vs Monarchy', 'Panchayati Raj'], 'How Gram Sabha solves village water issues'],
    ],
    English: [
      ['Who Did Patrick’s Homework? & A House, A Home', 'narrative', ['Self-Reliance Theme', 'Noun Phrases', 'Contrast Poetry'], 'Building independent study habits'],
      ['How the Dog Found Himself a New Master & Taro’s Reward', 'narrative', ['Story Arc', 'Collective Nouns', 'Filial Gratitude'], 'Analysing character motivation'],
      ['An Indian-American Woman in Space: Kalpana Chawla', 'timeline', ['Biographical Writing', 'STEM Perseverance', 'Dictionary Skills'], 'Tracing Kalpana Chawla’s journey from Karnal to NASA'],
      ['A Different Kind of School & Fair Play', 'concept', ['Empathy Simulation', 'Justice Over Friendship', 'Reported Speech Intro'], 'Making fair decisions as a leader'],
      ['Desert Animals & The Banyan Tree', 'systems', ['Informational Reading', 'Comparison Degrees', 'Descriptive Paragraphs'], 'Writing sharp factual summaries'],
    ],
    Hindi: [
      ['वह चिड़िया जो और बचपन', 'narrative', ['संस्मरण शैली', 'विशेषण भेद', 'प्रकृति प्रेम'], 'पुराने और आज के बचपन की तुलना'],
      ['नादान दोस्त और चाँद से थोड़ी-सी गप्पें', 'narrative', ['बाल जिज्ञासा', 'संवाद शैली', 'कल्पनात्मक कविता'], 'पक्षियों की देखभाल का सही तरीका'],
      ['अक्षरों का महत्व और पार नज़र के', 'timeline', ['लिपि का विकास', 'विज्ञान कथा', 'उपसर्ग-प्रत्यय'], 'मंगल ग्रह मिशन और लिपि इतिहास'],
      ['साथी हाथ बढ़ाना और ऐसे-ऐसे', 'concept', ['सामूहिक श्रम', 'एकांकी मंचन', 'मुहावरे'], 'टीमवर्क से कठिन कार्य आसान करना'],
      ['झाँसी की रानी और जो देखकर भी नहीं देखते', 'timeline', ['1857 संग्राम', 'इंद्रिय जागरूकता', 'वीर रस कविता'], 'इतिहास के साहस और प्रकृति के सौंदर्य को समझना'],
    ],
    'Computer Science': [
      ['Computer Languages & Translators', 'systems', ['Machine, Assembly, High-Level', 'Compiler vs Interpreter'], 'How human code turns into binary instructions'],
      ['Spreadsheet Formulas & Cell Referencing', 'formula', ['Relative vs Absolute ($A$1)', 'MIN, MAX, COUNT', 'Conditional Formatting'], 'Automating monthly attendance percentages'],
      ['Flowcharts, Loops & Pseudocode', 'process', ['Decision Diamonds', 'Loop Counters', 'Dry-Running Logic'], 'Designing a flowchart to grade student marks'],
      ['HTML Basics: Building Your First Web Page', 'process', ['HTML Structure', 'Headings, Paragraphs, Lists, Links', 'Semantic Tags'], 'Creating a clean Class 6 school profile page'],
      ['Presentation Design & Infographics', 'concept', ['Visual Hierarchy', 'Charts in Slides', 'Zero Clutter Rule'], 'Turning a Science chapter into visual slides'],
      ['Internet Protocols & Cyber Hygiene', 'systems', ['URL, HTTP/HTTPS, Email Etiquette', 'Phishing Awareness'], 'Spotting unsafe links and protecting privacy'],
    ],
  },
  7: {
    Mathematics: [
      ['Integers', 'formula', ['Closure, Commutative, Associative Properties', 'Integer Multiplication & Division', 'Sign Rules'], 'Calculating profit/loss and sea-level changes'],
      ['Fractions and Decimals', 'formula', ['Multiplying & Dividing Fractions', 'Reciprocals', 'Decimal Division'], 'Splitting fuel economy and recipe ratios'],
      ['Data Handling & Simple Equations', 'process', ['Mean, Median, Mode', 'Double Bar Graphs', 'Balancing Linear Equations'], 'Analysing cricket batting averages'],
      ['Lines and Angles & The Triangle and Its Properties', 'concept', ['Transversal Angles', 'Angle Sum & Exterior Angle', 'Pythagoras Theorem'], 'Verifying right-angled structures in carpentry'],
      ['Comparing Quantities', 'formula', ['Percentage Change', 'Profit & Loss %', 'Simple Interest (PRT/100)'], 'Calculating store discounts and savings interest'],
      ['Rational Numbers & Exponents and Powers', 'formula', ['Standard Form', 'Laws of Exponents', 'Scientific Notation'], 'Writing huge astronomical distances compactly'],
      ['Perimeter and Area & Algebraic Expressions', 'formula', ['Parallelogram & Circle Area (πr²)', 'Like/Unlike Terms', 'Evaluating Expressions'], 'Finding lawn area around a circular fountain'],
      ['Symmetry & Visualising Solid Shapes', 'concept', ['Rotational Symmetry', 'Euler’s Intuition', 'Cross-Sections & Shadows'], 'Understanding architectural domes and nets'],
    ],
    Science: [
      ['Nutrition in Plants & Animals', 'process', ['Photosynthesis Equation', 'Heterotrophic Modes', 'Human & Ruminant Digestion'], 'Tracing how sunlight becomes plant starch'],
      ['Heat & Acids, Bases and Salts', 'process', ['Conduction, Convection, Radiation', 'Natural Indicators (Litmus, Turmeric)', 'Neutralisation'], 'Why coastal sea breeze blows during the day'],
      ['Physical and Chemical Changes', 'concept', ['Reversible vs Irreversible', 'Rusting & Galvanisation', 'Crystallisation'], 'Protecting iron gates from rusting'],
      ['Respiration in Organisms', 'process', ['Aerobic vs Anaerobic', 'Breathing Mechanism (Diaphragm)', 'Gill/Stomata Exchange'], 'Why muscles cramp after intense sprinting'],
      ['Transportation in Animals and Plants', 'systems', ['Heart Chambers & Blood Vessels', 'Excretion', 'Xylem & Phloem'], 'Measuring pulse rate before and after jogging'],
      ['Reproduction in Plants', 'process', ['Vegetative Propagation', 'Pollination & Fertilisation', 'Seed Dispersal'], 'Propagating rose stems and observing pollen'],
      ['Motion and Time', 'formula', ['Speed = Distance / Time', 'Distance-Time Graphs', 'Simple Pendulum Time Period'], 'Reading a vehicle speedometer and odometer'],
      ['Electric Current, Light & Forests', 'systems', ['Heating & Magnetic Effects', 'Spherical Mirrors & Lenses', 'Forest Food Webs'], 'How an electric fuse protects home appliances'],
    ],
    'Social Science': [
      ['Tracing Changes & Kings and Kingdoms', 'timeline', ['Medieval Sources', 'Chola Administration & Bronze Art', 'Tripartite Struggle'], 'Understanding temple towns and irrigation tanks'],
      ['The Delhi Sultans & The Mughals', 'timeline', ['Iqta & Mansabdari Systems', 'Akbar’s Sulh-i-Kul', 'Revenue Administration'], 'How administrative reforms unified large empires'],
      ['Devotional Paths to the Divine', 'concept', ['Bhakti & Sufi Movements', 'Kabir, Mirabai, Guru Nanak', 'Social Equality'], 'How poetry connected everyday people across regions'],
      ['Inside Our Earth & Our Changing Earth', 'systems', ['Crust, Mantle, Core', 'Rock Cycle', 'Earthquakes, Volcanoes & River Landforms'], 'How rivers carve valleys, meanders, and deltas'],
      ['Air, Water & Human Environment', 'systems', ['Atmosphere Layers', 'Water Cycle & Ocean Currents', 'Tropical & Temperate Life'], 'Why stratosphere is ideal for jet aircraft'],
      ['On Equality, State Government & Media', 'concept', ['Constitutional Equality', 'MLA & Legislative Assembly', 'Media Accountability'], 'How citizens evaluate news and public health'],
    ],
    English: [
      ['Three Questions & A Gift of Chappals', 'narrative', ['Wisdom & Present Moment', 'Reported Clauses', 'Empathy'], 'Prioritising what truly matters right now'],
      ['Gopal and the Hilsa-Fish & The Ashes That Made Trees Bloom', 'narrative', ['Comic Strip Writing', 'Kindness Theme', 'Verb Forms'], 'Solving problems with calm humour'],
      ['Quality & Expert Detectives', 'concept', ['Craftsmanship Pride', 'Inference & Clues', 'Active vs Passive Intro'], 'Respecting skilled artisans in your town'],
      ['The Invention of Vita-Wonk & Fire: Friend and Foe', 'process', ['Scientific Process Text', 'Fire Triangle', 'Prefixes'], 'Understanding how fire extinguishers break the triangle'],
      ['A Bicycle in Good Repair & The Story of Cricket', 'timeline', ['Humorous Narrative', 'Historical Evolution', 'Summary Writing'], 'Tracing how sports rules evolve over time'],
    ],
    Hindi: [
      ['हम पंछी उन्मुक्त गगन के और दादी माँ', 'narrative', ['स्वतंत्रता भाव', 'संस्मरण विश्लेषण', 'समास परिचय'], 'पक्षियों के प्राकृतिक आवास का सम्मान'],
      ['हिमालय की बेटियाँ और कठपुतली', 'concept', ['नदी तंत्र रूपक', 'आत्मनिर्भरता', 'मानवीकरण अलंकार'], 'गंगा-यमुना नदियों के उद्गम को समझना'],
      ['मिठाईवाला और रक्त और हमारा शरीर', 'systems', ['रक्त कणिकाएँ व हीमोग्लोबिन', 'संतुलित आहार', 'संवाद सौंदर्य'], 'एनीमिया से बचाव और रक्तदान का महत्व'],
      ['पापा खो गए और शाम—एक किसान', 'narrative', ['नाटक विधा', 'बाल सुरक्षा', 'प्रकृति चित्रण'], 'सार्वजनिक स्थानों पर सतर्कता'],
      ['कंचा, एक तिनका और खानपान की बदलती तस्वीर', 'concept', ['विनम्रता', 'सांस्कृतिक विविधता', 'निबंध लेखन'], 'पारंपरिक और आधुनिक खानपान का संतुलन'],
    ],
    'Computer Science': [
      ['Number Systems: Binary, Decimal & Hex', 'formula', ['Base-2 Conversion', 'Binary Addition', 'Bits & Bytes'], 'Converting class roll numbers to binary'],
      ['Spreadsheet Charts, Sorting & Filtering', 'process', ['Multi-Column Sort', 'IF Function', 'Bar & Pie Charts'], 'Building a dynamic student score tracker'],
      ['HTML Tables, Images & CSS Styling', 'process', ['Tables & Attributes', 'Inline & Internal CSS', 'Box Spacing'], 'Styling a school timetable web page'],
      ['Python Programming Basics', 'process', ['Variables & Data Types', 'input() & print()', 'Arithmetic Operators'], 'Writing a Python calculator for area & perimeter'],
      ['Conditionals in Python (if-elif-else)', 'process', ['Boolean Logic', 'Indentation Rules', 'Branching Flowcharts'], 'Building an automated grade classifier script'],
      ['Cyber Ethics, Footprints & Privacy', 'concept', ['Digital Footprint', 'Cyberbullying Response', 'Two-Factor Auth'], 'Keeping personal data protected online'],
    ],
  },
  8: {
    Mathematics: [
      ['Rational Numbers & Linear Equations in One Variable', 'formula', ['Properties of Rationals', 'Solving Transposition Equations', 'Age & Ratio Word Problems'], 'Solving real-world balance problems'],
      ['Understanding Quadrilaterals', 'concept', ['Polygon Angle Sum (n−2)×180°', 'Parallelogram, Rhombus, Rectangle, Kite Properties'], 'Engineering trusses and scissor lifts'],
      ['Data Handling & Probability Intro', 'formula', ['Pie Charts (Central Angle)', 'Equally Likely Outcomes', 'Probability Formula'], 'Forecasting survey splits and dice odds'],
      ['Squares, Square Roots, Cubes & Cube Roots', 'formula', ['Prime Factorization & Long Division', 'Pythagorean Triplets', 'Cube Estimation'], 'Finding side length from square garden area'],
      ['Comparing Quantities (Compound Interest)', 'formula', ['Discounts & GST', 'CI Formula A = P(1+R/100)^n', 'Half-Yearly Compounding'], 'Comparing simple vs compound savings growth'],
      ['Algebraic Expressions, Identities & Factorisation', 'formula', ['(a+b)², (a−b)², a²−b²', 'Middle-Term Splitting', 'Algebraic Division'], 'Fast mental multiplication using identities'],
      ['Mensuration (3D Surface Area & Volume)', 'formula', ['Trapezium & Polygon Area', 'TSA/LSA of Cube, Cuboid, Cylinder', 'Volume & Capacity'], 'Estimating paint and water tank capacity'],
      ['Exponents, Direct/Inverse Proportions & Graphs', 'formula', ['Negative Exponents', 'xy = k vs x/y = k', 'Linear Cartesian Graphs'], 'Calculating workers vs time to complete a task'],
    ],
    Science: [
      ['Crop Production & Microorganisms', 'process', ['Ploughing to Storage', 'Nitrogen Cycle', 'Vaccines & Food Preservation'], 'How Rhizobium enriches farm soil naturally'],
      ['Coal, Petroleum & Combustion and Flame', 'systems', ['Refining Petroleum', 'Zones of Candle Flame', 'Calorific Value & Fire Control'], 'Why blue LPG flames burn hotter than yellow flames'],
      ['Conservation of Plants and Animals', 'systems', ['Biosphere Reserves', 'Endemic & Endangered Species', 'Red Data Book & Reforestation'], 'Protecting biodiversity corridors in India'],
      ['Reproduction in Animals & Adolescence', 'process', ['Internal/External Fertilisation', 'Metamorphosis', 'Endocrine Hormones'], 'Understanding biological growth & nutrition'],
      ['Force, Pressure & Friction', 'formula', ['P = F/A', 'Atmospheric Pressure', 'Static, Sliding & Rolling Friction'], 'Why school bag straps are wide and tyres have treads'],
      ['Sound & Chemical Effects of Electric Current', 'process', ['Amplitude, Frequency & Pitch', 'Audible Range', 'Electroplating'], 'How chromium electroplating prevents bicycle rust'],
      ['Some Natural Phenomena & Light', 'process', ['Static Charge & Lightning Safety', 'Earthquake Seismograph', 'Laws of Reflection & Human Eye'], 'How kaleidoscopes and the human eye form images'],
    ],
    'Social Science': [
      ['From Trade to Territory & Ruling the Countryside', 'timeline', ['Battle of Plassey & Buxar', 'Subsidiary Alliance', 'Permanent Settlement & Indigo'], 'How economic control shaped colonial India'],
      ['When People Rebel: 1857 and After', 'timeline', ['Causes of Revolt', 'Key Centres & Leaders', '1858 Administrative Changes'], 'Mapping major uprising centres across North India'],
      ['Women, Caste, Reform & The Making of the National Movement', 'timeline', ['Social Reformers', 'Non-Cooperation, Civil Disobedience, Quit India', '1947 Independence'], 'Tracing India’s constitutional values to the freedom struggle'],
      ['Resources, Land, Soil, Water & Agriculture', 'systems', ['Resource Conservation', 'Soil Profile & Terracing', 'Kharif/Rabi Farming'], 'Sustainable farming and rainwater harvesting'],
      ['Industries & Human Resources', 'systems', ['Location Factors of Industry', 'IT & Iron-Steel Hubs', 'Population Pyramid'], 'Why skilled education multiplies national potential'],
      ['The Indian Constitution, Parliament & Judiciary', 'systems', ['Fundamental Rights & Secularism', 'Lok Sabha & Rajya Sabha', 'Independent Judiciary'], 'How a bill becomes law in India'],
    ],
    English: [
      ['The Best Christmas Present & The Tsunami', 'narrative', ['War & Humanity', 'Active/Passive Voice', 'Disaster Readiness'], 'Understanding empathy and early tsunami warning signs'],
      ['Glimpses of the Past & Bepin Choudhury’s Lapse of Memory', 'timeline', ['Historical Sequencing', 'Reported Speech', 'Plot Twist Analysis'], 'Linking history comics with narrative craft'],
      ['The Summit Within & This is Jody’s Fawn', 'concept', ['Inner Courage (Everest)', 'Moral Responsibility', 'Transitive Verbs'], 'Conquering personal fears alongside external goals'],
      ['A Visit to Cambridge & A Short Monsoon Diary', 'narrative', ['Stephen Hawking Inspiration', 'Diary Writing Format', 'Sensory Imagery'], 'Writing vivid observation diaries'],
    ],
    Hindi: [
      ['लाख की चूड़ियाँ और बस की यात्रा', 'narrative', ['हस्तशिल्प बनाम मशीनीकरण', 'व्यंग्य शैली', 'विशेषण-क्रियाविशेषण'], 'स्थानीय कारीगरों के महत्व को समझना'],
      ['दीवानों की हस्ती और भगवान के डाकिए', 'concept', ['विश्व बंधुत्व', 'प्रकृति का संदेश', 'काव्य सौंदर्य'], 'सीमाओं से परे सहयोग का भाव'],
      ['क्या निराश हुआ जाए और यह सबसे कठिन समय नहीं', 'concept', ['सकारात्मक दृष्टिकोण', 'ईमानदारी के उदाहरण', 'निबंध संरचना'], 'कठिनाइयों में आशावादी नेतृत्व'],
      ['कबीर की साखियाँ और सुदामा चरित', 'concept', ['भक्ति साहित्य', 'मित्रता आदर्श', 'दोहा भावार्थ'], 'व्यावहारिक जीवन में विनम्रता व मैत्री'],
      ['जहाँ पहिया है और अकबरी लोटा', 'narrative', ['महिला सशक्तिकरण', 'हास्य-व्यंग्य कथा', 'वाक्य रूपांतरण'], 'आत्मनिर्भरता से सामाजिक परिवर्तन'],
    ],
    'Computer Science': [
      ['Computer Networking & Topologies', 'systems', ['LAN, MAN, WAN', 'Router, Switch, IP & DNS', 'Star/Mesh Topologies'], 'How your school Wi-Fi reaches the internet'],
      ['Database Concepts & Tables', 'systems', ['Primary Key, Records, Fields', 'Basic SQL SELECT Queries', 'Data Integrity'], 'Organizing a school library book database'],
      ['Python Loops, Lists & Functions', 'process', ['for & while Loops', 'List Indexing', 'Reusable def Functions'], 'Automating multiplication tables and average marks'],
      ['HTML5 Forms & Responsive CSS Layout', 'process', ['Input Types & Labels', 'Flexbox Alignment', 'Clean UI Styling'], 'Building a student club registration form'],
      ['AI & Data Literacy Fundamentals', 'concept', ['Training Data vs Rules', 'Pattern Recognition', 'Bias & Ethics'], 'Understanding how recommendation systems work'],
      ['Cyber Laws, Encryption & Digital Safety', 'systems', ['HTTPS Encryption', 'IT Act Awareness', 'Privacy Controls'], 'Protecting accounts against social engineering'],
    ],
  },
  9: {
    Mathematics: [
      ['Number Systems', 'formula', ['Irrational Numbers', 'Real Number Line', 'Rationalising Denominators & Laws of Exponents'], 'Proving √2 is irrational and simplifying surds'],
      ['Polynomials', 'formula', ['Degree & Zeroes', 'Remainder & Factor Theorem', 'Algebraic Identities (Cubic)'], 'Factorising cubic expressions rapidly'],
      ['Coordinate Geometry & Linear Equations in Two Variables', 'formula', ['Cartesian Quadrants', 'ax + by + c = 0', 'Graphing Solutions'], 'Plotting cost vs quantity straight lines'],
      ['Lines, Angles & Triangles (Congruence)', 'concept', ['Parallel Line Theorems', 'SAS, ASA, AAS, SSS, RHS Congruence', 'Isosceles Properties'], 'Proving geometric symmetry rigorously'],
      ['Quadrilaterals & Circles', 'concept', ['Mid-Point Theorem', 'Equal Chords & Angle Subtended', 'Cyclic Quadrilaterals'], 'Solving circular arch geometry problems'],
      ['Heron’s Formula & Surface Areas and Volumes', 'formula', ['Area = √(s(s−a)(s−b)(s−c))', 'Cones, Spheres & Hemispheres'], 'Calculating canvas required for a conical tent'],
      ['Statistics', 'process', ['Bar Graphs', 'Histograms (Varying Width)', 'Frequency Polygons'], 'Visualising exam score distributions cleanly'],
    ],
    Science: [
      ['Matter in Our Surroundings & Is Matter Around Us Pure?', 'process', ['States of Matter & Latent Heat', 'Evaporation Cooling', 'Solutions, Colloids & Suspensions'], 'Why earthen pots keep water cool in summer'],
      ['Atoms and Molecules & Structure of the Atom', 'systems', ['Laws of Chemical Combination', 'Mole & Formula Mass', 'Bohr Model, Valency & Isotopes'], 'Writing chemical formulas using criss-cross valency'],
      ['The Fundamental Unit of Life & Tissues', 'systems', ['Osmosis & Cell Organelles', 'Meristematic & Permanent Plant Tissues', 'Animal Tissues'], 'Comparing plant cell walls and animal plasma membranes'],
      ['Motion', 'formula', ['Distance vs Displacement', 'Velocity-Time Graphs', 'v=u+at, s=ut+½at², v²−u²=2as'], 'Calculating braking distance of a moving car'],
      ['Force and Laws of Motion & Gravitation', 'formula', ['Newton’s 3 Laws', 'Momentum Conservation', 'Universal Gravitation & Buoyancy'], 'Why passengers lean forward when brakes are applied'],
      ['Work and Energy & Sound', 'formula', ['Kinetic & Potential Energy', 'Conservation of Energy', 'Wave Speed v = λν & Echo'], 'How ultrasound scans and SONAR measure depth'],
      ['Improvement in Food Resources', 'systems', ['Crop Variety & Nutrient Management', 'Irrigation & Cropping Patterns', 'Animal Husbandry'], 'Increasing sustainable crop yields per hectare'],
    ],
    'Social Science': [
      ['The French Revolution', 'timeline', ['Three Estates & Subsistence Crisis', '1789 Bastille & Declaration of Rights', 'Rise of Napoleon'], 'Origins of Liberty, Equality, and Fraternity'],
      ['Socialism in Europe & Nazism and the Rise of Hitler', 'timeline', ['1917 Russian Revolution', 'Weimar Crisis', 'Propaganda & Human Rights Lessons'], 'Why constitutional safeguards protect democracies'],
      ['India — Size, Location & Physical Features', 'systems', ['82°30′E Standard Meridian', 'Himalayas, Northern Plains, Peninsular Plateau, Islands'], 'How the Himalayas shape India’s climate and rivers'],
      ['Drainage, Climate & Natural Vegetation', 'systems', ['Himalayan vs Peninsular Rivers', 'Monsoon Mechanism', 'Forest Biomes'], 'Understanding El Niño, monsoon onset, and river basins'],
      ['What is Democracy? & Constitutional Design', 'concept', ['Features of Democracy', 'South African & Indian Constituent Assembly', 'Preamble Values'], 'How constitutional checks prevent power abuse'],
      ['Electoral Politics, Institutions & Democratic Rights', 'systems', ['Election Commission', 'PM, Parliament & Supreme Court', '6 Fundamental Rights'], 'Tracing free and fair Indian elections'],
      ['The Story of Village Palampur, People as Resource & Poverty', 'systems', ['4 Factors of Production', 'Human Capital Formation', 'Food Security & PDS'], 'Why education & healthcare drive economic growth'],
    ],
    English: [
      ['The Fun They Had & The Sound of Music', 'narrative', ['Future Schooling Contrast', 'Evelyn Glennie & Bismillah Khan', 'Determination'], 'Overcoming physical barriers through passion'],
      ['The Little Girl & A Truly Beautiful Mind', 'timeline', ['Parent-Child Empathy', 'Albert Einstein’s Peace & Science', 'Relative Clauses'], 'Combining scientific brilliance with humanitarian values'],
      ['My Childhood (Dr. A.P.J. Abdul Kalam)', 'narrative', ['Secular Harmony', 'Mentorship', 'Passive Voice Mastery'], 'Lessons from Kalam’s early years in Rameswaram'],
      ['Reach for the Top & Kathmandu', 'timeline', ['Santosh Yadav & Maria Sharapova', 'Travel Writing', 'Descriptive Precision'], 'Goal discipline under extreme pressure'],
      ['If I Were You (Drama)', 'narrative', ['Quick Wit & Presence of Mind', 'Dramatic Irony', 'Dialogue Craft'], 'Staying calm under unexpected danger'],
    ],
    Hindi: [
      ['दो बैलों की कथा और ल्हासा की ओर', 'narrative', ['प्रेमचंद की संवेदना', 'यात्रा वृत्तांत', 'मुहावरे व लोकोक्तियाँ'], 'आज़ादी, स्वाभिमान और मैत्री का मूल्य'],
      ['उपभोक्तावाद की संस्कृति और साँवले सपनों की याद', 'concept', ['विज्ञापन प्रभाव', 'सालिम अली पक्षी विज्ञान', 'अलंकार पहचान'], 'सचेत उपभोक्ता और पर्यावरण प्रहरी बनना'],
      ['प्रेमचंद के फटे जूते और मेरे बचपन के दिन', 'concept', ['सादा जीवन उच्च विचार', 'महादेवी वर्मा संस्मरण', 'समास व उपसर्ग'], 'दिखावे से दूर वास्तविक मूल्यों को चुनना'],
      ['कबीर की साखियाँ एवं सबद और वाख', 'concept', ['निर्गुण भक्ति', 'आत्मज्ञान', 'काव्य शिल्प'], 'बाह्य आडंबर से ऊपर सच्ची मानवता'],
      ['सवैये, कैदी और कोकिला तथा मेघ आए', 'narrative', ['रसखान भक्ति', 'स्वाधीनता संघर्ष', 'मानवीकरण अलंकार'], 'साहित्य के माध्यम से देशप्रेम और प्रकृति बोध'],
    ],
    'Information Technology': [
      ['Communication Skills & Self-Management', 'concept', ['7 Cs of Communication', 'Verbal/Non-Verbal', 'Time & Stress Mastery'], 'Presenting ideas crisply in group discussions'],
      ['Digital Documentation (Writer/Word)', 'process', ['Styles & Templates', 'Mail Merge', 'Table of Contents'], 'Generating formatted school certificates automatically'],
      ['Electronic Spreadsheet (Calc/Excel)', 'formula', ['Functions & Cell Ranges', 'Charts & Graphs', 'Goal Analysis'], 'Analysing class UT performance trends'],
      ['Digital Presentation Mastery', 'process', ['Slide Master', 'Visual Storytelling', 'Timing & Handouts'], 'Delivering persuasive 5-minute academic talks'],
      ['Data Entry, Touch Typing & Ergonomics', 'process', ['Home Row Speed (35+ WPM)', 'Numeric Keypad', 'Accuracy Metrics'], 'Typing clean structured reports without looking at keys'],
    ],
  },
  10: {
    Mathematics: [
      ['Real Numbers', 'formula', ['Fundamental Theorem of Arithmetic', 'HCF × LCM = a × b', 'Irrationality Proofs'], 'Verifying prime factorisation and irrational proofs'],
      ['Polynomials & Pair of Linear Equations', 'formula', ['Zeroes–Coefficient Relations', 'Substitution & Elimination', 'Consistency Conditions (a1/a2)'], 'Solving real-world boat-stream and fare systems'],
      ['Quadratic Equations', 'formula', ['Factorisation & Quadratic Formula', 'Discriminant D = b²−4ac', 'Nature of Roots'], 'Modelling projectile paths and rectangular areas'],
      ['Arithmetic Progressions (AP)', 'formula', ['nth Term an = a+(n−1)d', 'Sum Sn = n/2[2a+(n−1)d]', 'Word Problems'], 'Calculating growing savings deposits over months'],
      ['Triangles & Coordinate Geometry', 'formula', ['BPT / Thales Theorem', 'Similarity Criteria', 'Distance & Section Formula'], 'Computing map distances and triangle centroids'],
      ['Introduction to Trigonometry & Applications', 'formula', ['Sin, Cos, Tan Ratios', 'Identities (sin²θ+cos²θ=1)', 'Heights & Distances'], 'Measuring tower height using angle of elevation'],
      ['Circles & Areas Related to Circles', 'formula', ['Tangent Perpendicular to Radius', 'Sector & Segment Area', 'Arc Length'], 'Calculating windshield wiper swept area'],
      ['Surface Areas, Volumes, Statistics & Probability', 'formula', ['Combined Solids', 'Grouped Mean/Median/Mode', 'Cards, Dice & Complementary Events'], 'Analysing board exam datasets and combined tanks'],
    ],
    Science: [
      ['Chemical Reactions and Equations', 'process', ['Balancing Equations', 'Combination, Decomposition, Displacement, Redox', 'Corrosion & Rancidity'], 'Understanding why chips packets are nitrogen-flushed'],
      ['Acids, Bases and Salts', 'systems', ['pH Scale (0–14)', 'Chlor-Alkali Process', 'Baking Soda, Washing Soda & Plaster of Paris'], 'Why toothpaste neutralises mouth acidity'],
      ['Metals and Non-Metals', 'process', ['Reactivity Series', 'Ionic Bonding', 'Metallurgy (Roasting, Calcination, Refining)'], 'Extracting pure copper and preventing corrosion'],
      ['Carbon and Its Compounds', 'systems', ['Covalent Bonding & Catenation', 'Homologous Series & IUPAC Naming', 'Ethanol, Ethanoic Acid & Soaps'], 'How soap micelles lift oil stains in water'],
      ['Life Processes', 'process', ['Autotrophic/Heterotrophic Nutrition', 'Human Heart Double Circulation', 'Nephron Excretion'], 'Tracing oxygen from alveoli to every body cell'],
      ['Control, Coordination, Reproduction & Heredity', 'systems', ['Reflex Arc & Hormones', 'Sexual/Asexual Reproduction', 'Mendel’s Monohybrid & Dihybrid Crosses'], 'How traits pass across generations via DNA'],
      ['Light: Reflection, Refraction & The Human Eye', 'formula', ['Mirror Formula (1/f=1/v+1/u)', 'Lens Formula & Snell’s Law', 'Myopia, Hypermetropia & Dispersion'], 'Choosing spectacles and explaining rainbows'],
      ['Electricity & Magnetic Effects of Electric Current', 'formula', ['Ohm’s Law V=IR', 'Series vs Parallel Resistors', 'Joule Heating, Fleming’s Rules & Domestic Circuits'], 'Calculating home electricity bills in kWh'],
      ['Our Environment', 'systems', ['10% Energy Law', 'Biological Magnification', 'Ozone Layer & Waste Management'], 'Why top predators accumulate more toxins'],
    ],
    'Social Science': [
      ['The Rise of Nationalism in Europe', 'timeline', ['1848 Revolutions', 'Unification of Germany & Italy', 'Allegories & Balkans'], 'How modern nation-states emerged in Europe'],
      ['Nationalism in India', 'timeline', ['Satyagraha & Non-Cooperation', 'Dandi Salt March', 'Sense of Collective Belonging'], 'Connecting local movements into national unity'],
      ['Print Culture and the Modern World', 'timeline', ['Gutenberg Press', 'Print Debate & Social Reform in India', 'Reading Revolution'], 'How printing democratised education and news'],
      ['Resources, Forests, Water & Agriculture', 'systems', ['Resource Planning', 'Multi-Purpose River Projects', 'Major Crops & Green Revolution'], 'Balancing dams with ecological sustainability'],
      ['Minerals, Energy & Manufacturing Industries', 'systems', ['Conventional vs Renewable Energy', 'Industrial Classification', 'Pollution Control'], 'India’s transition toward solar and wind power'],
      ['Power-Sharing, Federalism, Political Parties & Democracy', 'concept', ['Belgium vs Sri Lanka', 'Three Lists & Decentralisation', 'Outcomes of Democracy'], 'Why federal power-sharing strengthens stability'],
      ['Development, Sectors of Economy, Money & Globalisation', 'systems', ['HDI vs Per Capita Income', 'Primary/Secondary/Tertiary', 'RBI, SHGs & WTO'], 'How Self-Help Groups empower rural entrepreneurs'],
    ],
    English: [
      ['A Letter to God & Nelson Mandela: Long Walk to Freedom', 'narrative', ['Faith & Irony', 'Apartheid Struggle', 'Courage & Freedom'], 'Understanding dignity and leadership under oppression'],
      ['Two Stories about Flying & From the Diary of Anne Frank', 'narrative', ['Overcoming Fear', 'Historical Diary Voice', 'Phrasal Verbs'], 'Finding strength in writing during hard times'],
      ['Glimpses of India & Madam Rides the Bus', 'concept', ['Goa, Coorg, Assam Culture', 'Independence & Curiosity', 'Descriptive Essay'], 'Appreciating India’s regional heritage'],
      ['The Sermon at Benares & The Proposal', 'concept', ['Detachment & Acceptance', 'Satirical Comedy', 'Reported Speech Mastery'], 'Balancing emotional resilience and humour'],
    ],
    Hindi: [
      ['सूरदास के पद और राम-लक्ष्मण-परशुराम संवाद', 'concept', ['भ्रमरगीत विरह भाव', 'तुलसीदास संवाद शैली', 'अलंकार व रस'], 'विनम्रता और साहस का संतुलन'],
      ['नेताजी का चश्मा और बालगोबिन भगत', 'narrative', ['देशभक्ति की संवेदना', 'रूढ़ि विरोध', 'वाक्य भेद (रचना के आधार पर)'], 'साधारण नागरिकों का असाधारण राष्ट्रप्रेम'],
      ['लखनवी अंदाज़ और एक कहानी यह भी', 'concept', ['व्यंग्य व आत्मकथ्य', 'मन्नू भंडारी संघर्ष', 'वाच्य परिवर्तन'], 'यथार्थ और आत्मविश्वास की शक्ति'],
      ['नौबतखाने में इबादत और संस्कृति', 'concept', ['उस्ताद बिस्मिल्लाह खाँ', 'सभ्यता बनाम संस्कृति', 'पद परिचय'], 'संगीत के माध्यम से सांस्कृतिक एकता'],
    ],
    'Information Technology': [
      ['Digital Documentation (Advanced)', 'process', ['Custom Styles', 'Image Wrapping & Anchoring', 'Table of Contents & Templates'], 'Designing publication-grade project reports'],
      ['Electronic Spreadsheet (Advanced)', 'formula', ['Data Consolidation', 'What-If Scenarios & Goal Seek', 'Macros Intro'], 'Projecting target scores using Goal Seek'],
      ['Relational Database Management (RDBMS)', 'systems', ['Primary & Foreign Keys', 'Forms & Reports', 'SQL SELECT/UPDATE/WHERE'], 'Querying multi-table student records cleanly'],
      ['Web Applications, Networking & Workplace Safety', 'systems', ['Accessibility Tools', 'Network Security', 'Emergency & Ergonomic Practices'], 'Ensuring safe, inclusive digital workspaces'],
    ],
  },
  11: {
    Mathematics: [
      ['Sets, Relations and Functions', 'concept', ['Venn Diagrams & De Morgan Laws', 'Domain, Range & Codomain', 'Modulus & Signum Graphs'], 'Modelling database joins and software mappings'],
      ['Trigonometric Functions', 'formula', ['Radian Measure', 'Compound & Multiple Angle Formulas', 'Trigonometric Graphs'], 'Analysing AC waveforms and circular motion'],
      ['Complex Numbers & Quadratic Equations', 'formula', ['Imaginary Unit i', 'Argand Plane', 'Modulus & Conjugate'], 'Electrical impedance and signal phase maths'],
      ['Linear Inequalities & Permutations and Combinations', 'formula', ['nPr & nCr Counting Principle', 'Circular Arrangements', 'Feasible Regions'], 'Calculating secure PIN combinations and seating plans'],
      ['Binomial Theorem & Sequences and Series', 'formula', ['General Term Tr+1', 'AP & GP Sums', 'AM ≥ GM Inequality'], 'Approximating compound growth and expansions'],
      ['Straight Lines & Conic Sections', 'formula', ['Slope-Intercept & Normal Forms', 'Circle, Parabola, Ellipse, Hyperbola'], 'Designing satellite dish parabolic reflectors'],
      ['Limits and Derivatives', 'formula', ['First Principle Derivative', 'Product & Quotient Rules', 'Standard Limits'], 'Computing instantaneous velocity and rate of change'],
      ['Statistics & Probability', 'formula', ['Variance & Standard Deviation', 'Axiomatic Probability', 'Addition Theorem'], 'Measuring risk spread in financial and lab data'],
    ],
    Physics: [
      ['Units, Measurements & Motion in a Straight Line', 'formula', ['Dimensional Analysis', 'Significant Figures', 'Calculus Kinematics Graphs'], 'Checking equation validity via dimensions'],
      ['Motion in a Plane & Laws of Motion', 'formula', ['Vector Resolution', 'Projectile Range & Trajectory', 'Circular Banking & Free Body Diagrams'], 'Computing optimal launch angle and banked road speeds'],
      ['Work, Energy and Power', 'formula', ['Work-Energy Theorem', 'Conservative Forces', 'Elastic & Inelastic Collisions'], 'Analysing roller-coaster speed via energy conservation'],
      ['System of Particles, Rotational Motion & Gravitation', 'formula', ['Centre of Mass & Torque', 'Moment of Inertia', 'Kepler’s Laws & Escape Velocity'], 'Why figure skaters spin faster when pulling arms in'],
      ['Mechanical Properties of Solids & Fluids', 'systems', ['Stress-Strain Curve', 'Pascal’s Law & Bernoulli’s Principle', 'Surface Tension & Viscosity'], 'How aeroplane wings generate aerodynamic lift'],
      ['Thermal Properties, Thermodynamics & Kinetic Theory', 'process', ['First & Second Laws', 'Isothermal/Adiabatic Processes', 'RMS Speed & Degrees of Freedom'], 'How heat engines and refrigerators exchange heat'],
      ['Oscillations and Waves', 'formula', ['Simple Harmonic Motion (SHM)', 'Energy in SHM', 'Standing Waves & Beats'], 'Tuning musical instruments using beat frequency'],
    ],
    Chemistry: [
      ['Some Basic Concepts of Chemistry', 'formula', ['Mole Concept & Avogadro Number', 'Limiting Reagent', 'Molarity & Molality'], 'Calculating exact reactant mass in lab synthesis'],
      ['Structure of Atom', 'systems', ['Bohr Model & de Broglie', 'Quantum Numbers (n,l,m,s)', 'Aufbau, Pauli & Hund Rules'], 'Writing electronic configurations of elements'],
      ['Classification of Elements & Chemical Bonding', 'systems', ['Periodic Trends (IE, EN, Radius)', 'VSEPR Geometry', 'Hybridisation & Molecular Orbital Theory'], 'Predicting why H2O is bent while CO2 is linear'],
      ['Chemical Thermodynamics', 'formula', ['Enthalpy & Hess’s Law', 'Entropy (ΔS)', 'Gibbs Free Energy ΔG = ΔH − TΔS'], 'Predicting whether a reaction happens spontaneously'],
      ['Equilibrium', 'process', ['Kc & Kp Relations', 'Le Chatelier’s Principle', 'pH, Buffer Solutions & Solubility Product'], 'Optimising ammonia yield in Haber’s process'],
      ['Redox Reactions & Organic Chemistry Basics', 'process', ['Oxidation Number Balancing', 'Inductive/Resonance Effects', 'IUPAC & Isomerism'], 'Tracing electron-pushing mechanisms cleanly'],
      ['Hydrocarbons', 'process', ['Alkanes, Alkenes, Alkynes', 'Markovnikov Addition', 'Aromatic Electrophilic Substitution'], 'Understanding fuel cracking and polymer feedstocks'],
    ],
    Biology: [
      ['The Living World, Biological Classification & Plant/Animal Kingdom', 'systems', ['Taxonomic Hierarchy', 'Five-Kingdom Classification', 'Chordate vs Non-Chordate Features'], 'Classifying organisms by evolutionary body plans'],
      ['Morphology & Anatomy of Flowering Plants', 'systems', ['Root, Stem, Leaf Modifications', 'Vascular Bundles', 'Monocot vs Dicot Anatomy'], 'Reading plant cross-sections under a microscope'],
      ['Cell: The Unit of Life, Biomolecules & Cell Division', 'process', ['Prokaryotic vs Eukaryotic', 'Enzymes & Proteins', 'Mitosis vs Meiosis Stages'], 'How meiosis ensures genetic diversity'],
      ['Photosynthesis & Respiration in Plants', 'process', ['Light Reaction & Calvin Cycle (C3/C4)', 'Glycolysis, Krebs Cycle & ETS', 'ATP Yield'], 'Tracing carbon fixation in sugarcane vs wheat'],
      ['Breathing, Body Fluids & Excretory Products', 'systems', ['Oxygen Dissociation Curve', 'Cardiac Cycle & ECG', 'Counter-Current Mechanism'], 'Understanding how kidneys concentrate urine'],
      ['Locomotion, Neural Control & Chemical Coordination', 'systems', ['Sliding Filament Theory', 'Action Potential & Synapse', 'Pituitary-Endocrine Feedback'], 'How nerve impulses trigger instant muscle reflexes'],
    ],
    Accountancy: [
      ['Introduction to Accounting & Theory Base', 'concept', ['GAAP & Accounting Concepts', 'Accrual vs Cash Basis', 'Accounting Standards'], 'Why businesses separate owner and firm finances'],
      ['Recording of Transactions (Journal & Ledger)', 'process', ['Accounting Equation (A=L+C)', 'Double Entry Rules', 'Journalising & Ledger Posting'], 'Recording sales, purchases, and GST entries'],
      ['Cash Book, Bank Reconciliation & Trial Balance', 'process', ['Double Column Cash Book', 'BRS Timing Differences', 'Rectification of Errors'], 'Matching company cash book with bank passbook'],
      ['Depreciation, Provisions and Reserves', 'formula', ['Straight Line (SLM) vs WDV Method', 'Asset Disposal Account', 'Capital vs Revenue Reserves'], 'Accounting for machinery wear and tear'],
      ['Financial Statements of Sole Proprietorship', 'systems', ['Trading Account (Gross Profit)', 'P&L Account (Net Profit)', 'Balance Sheet with Adjustments'], 'Preparing annual final accounts of a firm'],
    ],
    'Business Studies': [
      ['Evolution & Forms of Business Organisation', 'concept', ['Sole Proprietorship, Partnership, HUF', 'Joint Stock Company & Cooperatives'], 'Choosing the right legal structure for a startup'],
      ['Private, Public, Global Enterprises & Business Services', 'systems', ['PSUs & MNCs', 'Banking, Insurance & Warehousing Principles'], 'How digital banking and logistics scale commerce'],
      ['Emerging Modes of Business & Social Responsibility', 'concept', ['E-Business Security', 'Business Ethics', 'CSR & Environmental Care'], 'Building trustworthy online commerce'],
      ['Formation of a Company & Sources of Business Finance', 'process', ['Promotion, Incorporation, Capital Subscription', 'Equity, Debentures & Trade Credit'], 'Raising capital for expansion safely'],
      ['Small Business, Internal Trade & International Business', 'systems', ['MSME Support & IPR', 'Wholesale/Retail & GST', 'Export-Import Documentation'], 'Taking local Indian products to global markets'],
    ],
    Economics: [
      ['Statistics for Economics: Collection, Organisation & Presentation', 'process', ['Primary vs Secondary Data', 'Frequency Distributions', 'Diagrams & Ogives'], 'Turning census surveys into clear visual evidence'],
      ['Measures of Central Tendency & Correlation', 'formula', ['Mean, Median, Mode', 'Karl Pearson & Spearman Correlation', 'Index Numbers (CPI/WPI)'], 'Measuring inflation and exam score relationships'],
      ['Consumer’s Equilibrium & Demand', 'process', ['Utility & Indifference Curves', 'Law of Demand', 'Price Elasticity of Demand'], 'Why essential medicines have inelastic demand'],
      ['Production Function, Cost & Revenue', 'formula', ['Law of Variable Proportions', 'TC, TVC, AC, MC Curves', 'Producer’s Equilibrium'], 'Understanding marginal cost in factory output'],
      ['Forms of Market & Price Determination', 'systems', ['Perfect Competition Equilibrium', 'Demand-Supply Shifts', 'Price Ceiling & Floor (MSP)'], 'How Minimum Support Price affects farm markets'],
    ],
    History: [
      ['Writing and City Life (Mesopotamia)', 'timeline', ['Cuneiform Script', 'Urbanisation & Trade', 'Mari Palace Administration'], 'How record-keeping sparked the first cities'],
      ['An Empire Across Three Continents (Roman Empire)', 'systems', ['Political & Military Structure', 'Mediterranean Trade', 'Late Antiquity'], 'Comparing Roman roads and administration'],
      ['Nomadic Empires (Genghis Khan) & The Three Orders', 'timeline', ['Mongol Courier System (Yam)', 'Feudal Europe', 'Rise of Towns'], 'How trade routes connected Eurasia'],
      ['Changing Cultural Traditions (Renaissance)', 'concept', ['Humanism', 'Scientific Revolution', 'Printing & Art Revival'], 'How critical inquiry reshaped Europe'],
      ['Displacing Indigenous Peoples & Paths to Modernisation', 'timeline', ['Settler Colonialism', 'Meiji Restoration in Japan', 'Modern China Transformation'], 'Comparing East Asian modernisation paths'],
    ],
    'Political Science': [
      ['Constitution: Why and How? & Rights in the Indian Constitution', 'systems', ['Constituent Assembly Debates', 'Fundamental Rights & Writs', 'Directive Principles'], 'How citizens invoke Writ jurisdiction'],
      ['Election, Representation, Executive & Legislature', 'systems', ['FPTP vs PR System', 'Parliamentary Accountability', 'Bicameral Lawmaking'], 'Why India adopted the First-Past-The-Post system'],
      ['Judiciary, Federalism & Local Governments', 'systems', ['Judicial Review & PIL', 'Centre-State Relations', '73rd & 74th Amendments'], 'How Panchayats and Municipalities empower citizens'],
      ['Political Theory: Freedom, Equality, Social Justice & Citizenship', 'concept', ['Negative vs Positive Liberty', 'Rawls’ Veil of Ignorance', 'Secularism'], 'Debating fairness in public policy'],
    ],
    'English Core': [
      ['The Portrait of a Lady & A Photograph', 'narrative', ['Generational Bond', 'Nostalgia Imagery', 'Summary & Note-Making'], 'Capturing memory through concise prose'],
      ['We’re Not Afraid to Die... & Discovering Tut', 'timeline', ['Crisis Leadership at Sea', 'CT Scan Archaeology', 'Factual Synthesis'], 'Staying methodical during emergencies'],
      ['The Adventure & Silk Road', 'concept', ['Catastrophe Theory & History', 'High-Altitude Travelogue', 'Inference Skills'], 'Analysing speculative and travel narratives'],
      ['Mother’s Day & Birth (Snapshots)', 'narrative', ['Family Respect Satire', 'Medical Perseverance', 'Speech & Debate Writing'], 'Standing up for dignity and clinical focus'],
    ],
    'Computer Science': [
      ['Computer Systems, Encoding & Boolean Logic', 'formula', ['ASCII/UTF-8', 'AND/OR/NOT/XOR Gates', 'De Morgan’s Laws & Truth Tables'], 'Simplifying digital circuits with logic gates'],
      ['Problem Solving, Algorithms & Python Fundamentals', 'process', ['Flowcharts & Pseudocode', 'Python Tokens & Operators', 'Debugging'], 'Designing clean, bug-free algorithms first'],
      ['Flow of Control, Strings & Lists in Python', 'process', ['Nested Loops', 'String Slicing', 'List Comprehensions & Methods'], 'Processing student exam datasets cleanly'],
      ['Tuples, Dictionaries & Python Modules', 'systems', ['Key-Value Hashing', 'Immutability', 'math, random & statistics Modules'], 'Building fast roll-number lookup dictionaries'],
      ['Society, Law and Ethics in Computing', 'concept', ['IPR, Creative Commons & Open Source', 'Cyber Crime & E-Waste', 'Digital Privacy'], 'Practising responsible software engineering'],
    ],
  },
  12: {
    Mathematics: [
      ['Relations, Functions & Inverse Trigonometric Functions', 'concept', ['Reflexive, Symmetric, Transitive', 'Bijective Functions', 'Principal Value Branches'], 'Checking invertibility of cryptographic functions'],
      ['Matrices and Determinants', 'formula', ['Matrix Operations & Transpose', 'Adjoint & Inverse (A⁻¹)', 'Solving Linear Systems AX=B'], 'Solving multi-variable network equations'],
      ['Continuity, Differentiability & Applications of Derivatives', 'formula', ['Chain & Implicit Rules', 'Increasing/Decreasing', 'Maxima & Minima Optimisation'], 'Maximising box volume from a fixed sheet'],
      ['Integrals & Applications of Integrals', 'formula', ['Substitution, By Parts & Partial Fractions', 'Definite Integral Properties', 'Area Under Curves'], 'Computing area enclosed by parabolas and lines'],
      ['Differential Equations', 'process', ['Order & Degree', 'Variable Separable', 'Homogeneous & Linear DE (IF)'], 'Modelling radioactive decay and population growth'],
      ['Vector Algebra & Three-Dimensional Geometry', 'formula', ['Dot & Cross Products', 'Shortest Distance Between Skew Lines', 'Direction Cosines'], '3D graphics raycasting and navigation vectors'],
      ['Linear Programming & Probability', 'formula', ['Corner Point Optimisation', 'Conditional Probability', 'Bayes’ Theorem'], 'Optimising factory output and medical test accuracy'],
    ],
    Physics: [
      ['Electric Charges, Fields & Electrostatic Potential', 'formula', ['Coulomb’s Law & Gauss’s Law', 'Electric Dipole', 'Capacitors & Dielectrics'], 'How touchscreen capacitors sense your finger'],
      ['Current Electricity', 'formula', ['Drift Velocity', 'Kirchhoff’s Laws', 'Wheatstone Bridge & Cells'], 'Analysing complex multi-loop circuits'],
      ['Moving Charges, Magnetism & Electromagnetic Induction', 'process', ['Biot-Savart & Ampere’s Law', 'Faraday & Lenz’s Law', 'AC Generators & Transformers'], 'How transformers step up power across grids'],
      ['Alternating Current & Electromagnetic Waves', 'formula', ['LCR Series Resonance', 'Power Factor', 'EM Spectrum (Radio to Gamma)'], 'Tuning radio receivers to a resonant frequency'],
      ['Ray Optics & Wave Optics', 'formula', ['Total Internal Reflection (Optical Fibres)', 'Lens Maker’s Formula', 'Young’s Double Slit Interference & Diffraction'], 'How fibre-optic cables carry internet at light speed'],
      ['Dual Nature, Atoms & Nuclei', 'formula', ['Photoelectric Effect (Einstein)', 'Bohr Hydrogen Spectrum', 'Mass Defect, Binding Energy & Fission/Fusion'], 'How solar panels convert photons to electricity'],
      ['Semiconductor Electronics', 'systems', ['p-n Junction Diode', 'Half & Full Wave Rectifiers', 'LED & Photodiode Basics'], 'Converting AC wall power to DC phone chargers'],
    ],
    Chemistry: [
      ['Solutions & Electrochemistry', 'formula', ['Raoult’s Law & Colligative Properties', 'Nernst Equation', 'Kohlrausch Law & Fuel Cells'], 'Why salt melts icy roads and how Li-ion cells work'],
      ['Chemical Kinetics', 'formula', ['Rate Law & Order', 'Zero & First Order Half-Life', 'Arrhenius Equation & Activation Energy'], 'Predicting shelf life of medicines'],
      ['d- and f-Block Elements & Coordination Compounds', 'systems', ['Variable Oxidation States', 'Lanthanoid Contraction', 'Werner Theory, IUPAC & CFT'], 'Why transition metal complexes show vivid colours'],
      ['Haloalkanes, Haloarenes, Alcohols, Phenols & Ethers', 'process', ['SN1 vs SN2 Mechanisms', 'Lucas & Reimer-Tiemann Reactions', 'Williamson Synthesis'], 'Predicting organic synthesis pathways step-by-step'],
      ['Aldehydes, Ketones, Carboxylic Acids & Amines', 'process', ['Aldol & Cannizzaro Reactions', 'Acidity Trends', 'Diazonium Salts & Gabriel Synthesis'], 'Distinguishing functional groups via lab tests'],
      ['Biomolecules', 'systems', ['Glucose Structure & Glycosidic Link', 'Protein Folding (1°–4°)', 'DNA/RNA & Vitamins'], 'Understanding enzyme specificity and nucleic acids'],
    ],
    Biology: [
      ['Sexual Reproduction in Flowering Plants & Human Reproduction', 'process', ['Double Fertilisation', 'Gametogenesis & Menstrual Cycle', 'Embryonic Development'], 'Understanding pollination and reproductive health'],
      ['Principles of Inheritance & Molecular Basis of Inheritance', 'process', ['Pedigree Analysis & Linkage', 'DNA Replication, Transcription & Translation', 'Lac Operon & DNA Fingerprinting'], 'How forensic DNA fingerprinting identifies matches'],
      ['Evolution & Human Health and Disease', 'systems', ['Hardy-Weinberg Principle', 'Innate vs Acquired Immunity', 'Vaccines, Cancer & Lifestyle Health'], 'How vaccines train memory B- and T-cells'],
      ['Biotechnology: Principles, Processes & Applications', 'process', ['Restriction Enzymes & Plasmids', 'PCR & Gel Electrophoresis', 'Bt Crops & Recombinant Insulin'], 'How recombinant human insulin is produced safely'],
      ['Organisms, Populations, Ecosystem & Biodiversity', 'systems', ['Population Growth Curves', 'Ecological Pyramids & Energy Flow', 'In-Situ vs Ex-Situ Conservation'], 'Protecting biodiversity hotspots in India'],
    ],
    Accountancy: [
      ['Accounting for Partnership Firms: Fundamentals & Goodwill', 'formula', ['P&L Appropriation Account', 'Capital Accounts', 'Average/Super Profit Goodwill'], 'Distributing profits fairly among business partners'],
      ['Reconstitution: Admission, Retirement & Death of a Partner', 'process', ['Sacrificing/Gaining Ratio', 'Revaluation Account', 'Partner Loan & Settlement'], 'Adjusting capital when partners join or exit'],
      ['Dissolution of Partnership Firm', 'process', ['Realisation Account', 'Asset Liquidation Order', 'Settlement of Accounts'], 'Closing a firm’s books in legal priority'],
      ['Company Accounts: Issue of Shares & Debentures', 'process', ['Pro-Rata Allotment', 'Forfeiture & Reissue of Shares', 'Redemption Terms'], 'Understanding IPO share subscriptions'],
      ['Financial Statement Analysis, Ratios & Cash Flow Statement', 'formula', ['Liquidity, Solvency & Profitability Ratios', 'Operating, Investing & Financing Cash Flows'], 'Evaluating a company’s real cash health'],
    ],
    'Business Studies': [
      ['Nature, Principles & Business Environment', 'concept', ['Fayol’s 14 Principles', 'Taylor’s Scientific Management', 'PESTLE / Dimensions of Environment'], 'Applying management discipline to real factories'],
      ['Planning & Organising', 'process', ['Planning Process & Limitations', 'Functional vs Divisional Structure', 'Delegation & Decentralisation'], 'Structuring teams cleanly as a company grows'],
      ['Staffing, Directing & Controlling', 'process', ['Recruitment & Training', 'Maslow’s Motivation & Leadership Styles', 'Deviation Analysis'], 'Aligning people, feedback, and performance goals'],
      ['Financial Management & Financial Markets', 'systems', ['Capital Structure & Leverage', 'Money vs Capital Market', 'SEBI & Stock Exchange Trading'], 'How SEBI protects retail investors'],
      ['Marketing Management & Consumer Protection', 'systems', ['4Ps Marketing Mix', 'Branding & Packaging', 'Consumer Protection Act 2019'], 'Building ethical brands and asserting consumer rights'],
    ],
    Economics: [
      ['National Income Accounting', 'formula', ['GDP, GNP, NNP at FC/MP', 'Value Added, Income & Expenditure Methods', 'Real vs Nominal GDP'], 'Measuring a country’s annual economic output'],
      ['Money, Banking & Determination of Income', 'systems', ['Money Multiplier & Credit Creation', 'RBI Monetary Tools (Repo/CRR)', 'AD=AS & Investment Multiplier'], 'How RBI repo rate decisions cool inflation'],
      ['Government Budget & Balance of Payments', 'systems', ['Revenue vs Capital Budget', 'Fiscal Deficit', 'Current/Capital Account & Exchange Rate'], 'Reading India’s Union Budget headlines intelligently'],
      ['Indian Economic Development (1947–1991 & LPG Reforms)', 'timeline', ['Five-Year Plans', '1991 Liberalisation, Privatisation, Globalisation', 'Structural Transformation'], 'How 1991 reforms accelerated India’s IT & services boom'],
      ['Human Capital, Rural Development, Employment & Sustainability', 'systems', ['Education & Health Returns', 'Organic Farming & Credit', 'Sustainable Development Goals'], 'Balancing GDP growth with environmental care'],
    ],
    History: [
      ['Bricks, Beads and Bones & Kings, Farmers and Towns', 'timeline', ['Harappan Craft & Script', 'Mahajanapadas & Mauryan Economy', 'Inscriptional Evidence'], 'Reading ancient coins and inscriptions as primary data'],
      ['Kinship, Caste, Class & Thinkers, Beliefs and Buildings', 'concept', ['Mahabharata Social Norms', 'Buddhism, Jainism & Sanchi Stupa', 'Sculptural Symbolism'], 'Understanding India’s philosophical traditions'],
      ['Through the Eyes of Travellers & Bhakti-Sufi Traditions', 'timeline', ['Al-Biruni, Ibn Battuta, Bernier', 'Bhakti & Sufi Synthesis', 'Vijayanagara Architecture'], 'Seeing medieval India through multiple perspectives'],
      ['Rebels and the Raj & Mahatma Gandhi and the Nationalist Movement', 'timeline', ['1857 Visual Representations', 'Gandhian Mass Movements', 'Quit India & Partition Sources'], 'Evaluating primary letters, speeches, and archives'],
      ['Framing the Constitution', 'systems', ['Objectives Resolution', 'Debates on Rights, Language & Federalism', 'Dr. B.R. Ambedkar’s Role'], 'How consensus built India’s enduring Constitution'],
    ],
    'Political Science': [
      ['The End of Bipolarity & Contemporary Centres of Power', 'timeline', ['USSR Disintegration', 'European Union, ASEAN & Rise of China/India'], 'Understanding multipolar global geopolitics'],
      ['Contemporary South Asia, UN & Globalisation', 'systems', ['India’s Neighbourhood Relations', 'UN Security Council Reforms', 'Globalisation Debates'], 'India’s diplomatic role in global institutions'],
      ['Challenges of Nation-Building & Planned Development', 'timeline', ['Integration of Princely States', 'Linguistic Reorganisation', 'Planning Commission & Green Revolution'], 'How 565 princely states unified into one republic'],
      ['India’s External Relations, Democratic Crisis & Regional Aspirations', 'timeline', ['Non-Alignment Movement', '1975 Emergency Lessons', 'Federal Accommodation & Coalition Era'], 'How democratic institutions recover and mature'],
    ],
    'English Core': [
      ['The Last Lesson & Lost Spring', 'narrative', ['Linguistic Identity', 'Child Labour Reality', 'Analytical Long Answers'], 'Valuing mother tongue and universal education'],
      ['Deep Water & The Rattrap', 'narrative', ['Systematic Fear Conquest', 'Redemption Through Kindness', 'Character Transformation'], 'Breaking down big fears into small practice steps'],
      ['Indigo & Poets and Pancakes', 'timeline', ['Champaran Satyagraha', 'Self-Reliance Leadership', 'Irony & Wit'], 'How fact-finding and courage won Champaran'],
      ['The Third Level, Journey to the End of the Earth & On the Face of It', 'concept', ['Antarctica Climate Mirror', 'Inclusion Beyond Appearance', 'Critical Appreciation'], 'Connecting literature with ecology and empathy'],
    ],
    'Computer Science': [
      ['Functions, Exception Handling & File Handling in Python', 'process', ['Scope & Parameters', 'try-except-finally', 'Text, Binary (pickle) & CSV Files'], 'Persisting structured school records cleanly'],
      ['Data Structures: Stack Implementation', 'process', ['LIFO Principle', 'push, pop, peek Operations', 'Expression Evaluation'], 'How browser Back button and Undo work'],
      ['Computer Networks & Protocols', 'systems', ['Transmission Media', 'TCP/IP, HTTP, SMTP, DNS', 'Firewalls & Cyber Threats'], 'Tracing packets from browser to web server'],
      ['Relational Database & SQL Mastery', 'formula', ['DDL & DML Commands', 'GROUP BY, HAVING & Aggregate Functions', 'Equi & Natural Joins'], 'Writing analytical SQL queries over exam tables'],
      ['Interface of Python with SQL Databases', 'process', ['Connection & Cursor Objects', 'Parameterized Queries', 'fetchone / fetchall & commit'], 'Connecting Python apps securely to SQL tables'],
    ],
  },
};

export function slugifyKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function extractClassNumFromLabel(label?: string | null): SchoolClassNumber {
  if (!label) return 9;
  const m = String(label).match(/\b(1[0-2]|[1-9])\b/);
  if (!m) return 9;
  const parsed = Number(m[1]);
  if (parsed >= 1 && parsed <= 12) return parsed as SchoolClassNumber;
  return 9;
}

export function getSubjectsForClass(
  classNumber: SchoolClassNumber,
  registerRows: ProductionRegisterRow[] = [],
  schoolResources: AcademicResource[] = [],
): string[] {
  const baseSubjects = Object.keys(CORE_SYLLABUS[classNumber] || {});
  const extras = new Set<string>(baseSubjects);

  for (const row of registerRows) {
    if (extractClassNumFromLabel(row.classLabel) === classNumber && row.subject?.trim()) {
      const normalized = normalizeSubjectName(row.subject, baseSubjects);
      extras.add(normalized);
    }
  }
  for (const res of schoolResources) {
    if (extractClassNumFromLabel(res.classSection) === classNumber && res.subject?.trim()) {
      const normalized = normalizeSubjectName(res.subject, baseSubjects);
      extras.add(normalized);
    }
  }

  return Array.from(extras);
}

function normalizeSubjectName(raw: string, existing: string[]): string {
  const clean = raw.trim();
  const lower = clean.toLowerCase();
  const exact = existing.find((s) => s.toLowerCase() === lower);
  if (exact) return exact;
  if (lower === 'maths' || lower === 'math') {
    const mathMatch = existing.find((s) => s.toLowerCase() === 'mathematics');
    if (mathMatch) return mathMatch;
  }
  if (lower === 'sst' || lower === 'social studies') {
    const sstMatch = existing.find((s) => s.toLowerCase() === 'social science');
    if (sstMatch) return sstMatch;
  }
  return clean;
}

export function getChaptersForClassSubject(
  classNumber: SchoolClassNumber,
  subject: string,
  registerRows: ProductionRegisterRow[] = [],
  schoolResources: AcademicResource[] = [],
): SyllabusChapterEntry[] {
  const classCatalog = CORE_SYLLABUS[classNumber] || {};
  const matchedKey =
    Object.keys(classCatalog).find((k) => k.toLowerCase() === subject.toLowerCase()) || subject;
  const seeds = classCatalog[matchedKey] || [];

  const chapters: SyllabusChapterEntry[] = seeds.map((seed, idx) => ({
    id: `c${classNumber}_${slugifyKey(matchedKey)}_ch${idx + 1}`,
    classNumber,
    subject: matchedKey,
    chapterNumber: idx + 1,
    title: seed[0],
    kind: seed[1],
    keyTopics: seed[2],
    realLifeAnchor: seed[3],
    sourceTag: 'NCERT / HBSE Core',
  }));

  const seenTitles = new Set(chapters.map((c) => slugifyKey(c.title)));

  // Merge extra chapters from school production register or uploaded academic resources
  const addExtraChapter = (rawTitle: string, fallbackTopics: string[]) => {
    const clean = rawTitle.replace(/^ch\.?\s*\d+\s*[:.-]?\s*/i, '').trim();
    if (!clean) return;
    const key = slugifyKey(clean);
    if (!key || seenTitles.has(key)) return;
    seenTitles.add(key);
    chapters.push({
      id: `c${classNumber}_${slugifyKey(matchedKey)}_ext_${key}`,
      classNumber,
      subject: matchedKey,
      chapterNumber: chapters.length + 1,
      title: clean,
      kind: inferPedagogyKind(matchedKey, clean),
      keyTopics: fallbackTopics,
      realLifeAnchor: `Applying ${clean} to everyday Class ${classNumber} ${matchedKey} problem solving`,
      sourceTag: 'School Register',
    });
  };

  for (const row of registerRows) {
    if (
      extractClassNumFromLabel(row.classLabel) === classNumber &&
      normalizeSubjectName(row.subject, Object.keys(classCatalog)).toLowerCase() ===
        matchedKey.toLowerCase()
    ) {
      addExtraChapter(row.chapterTitle, [
        'Core Chapter Concepts',
        'Key Definitions & Rules',
        'Worked Classroom Examples',
        'Exam Practice Questions',
      ]);
    }
  }

  for (const res of schoolResources) {
    if (
      extractClassNumFromLabel(res.classSection) === classNumber &&
      normalizeSubjectName(res.subject, Object.keys(classCatalog)).toLowerCase() ===
        matchedKey.toLowerCase()
    ) {
      addExtraChapter(res.chapter, [
        'Core Concepts & Scope',
        'Key Terminology',
        'Applied Examples',
        'Revision Checkpoint',
      ]);
    }
  }

  if (chapters.length === 0) {
    // Fallback if a completely custom school subject is queried
    const defaults = [
      'Foundations & Core Principles',
      'Key Methods & Processes',
      'Applied Problem Solving',
      'Synthesis & Revision Mastery',
    ];
    defaults.forEach((title, idx) => {
      chapters.push({
        id: `c${classNumber}_${slugifyKey(subject)}_ch${idx + 1}`,
        classNumber,
        subject,
        chapterNumber: idx + 1,
        title,
        kind: inferPedagogyKind(subject, title),
        keyTopics: ['Core Ideas', 'Visual Links', 'Worked Examples', 'Exam Readiness'],
        realLifeAnchor: `Practical classroom applications of ${subject} for Class ${classNumber}`,
        sourceTag: 'School Register',
      });
    });
  }

  return chapters;
}

function inferPedagogyKind(subject: string, title: string): ChapterPedagogyKind {
  const s = `${subject} ${title}`.toLowerCase();
  if (/equation|formula|algebra|trigonomet|calculus|ratio|number|mensuration|interest|stats|probability|income|matrix|vector/.test(s)) {
    return 'formula';
  }
  if (/reaction|process|reproduction|digestion|respiration|photosynthesis|programming|python|html|flow|algorithm|motion|current|light|optics|mechanism|separation/.test(s)) {
    return 'process';
  }
  if (/revolution|empire|history|independence|movement|1857|timeline|time|calendar|evolution|modern/.test(s)) {
    return 'timeline';
  }
  if (/story|poem|drama|diary|letter|कहानी|कविता|संवाद|lesson|narrative/.test(s)) {
    return 'narrative';
  }
  if (/system|network|database|earth|climate|constitution|government|environment|cell|body|plant|ecosystem|finance|market/.test(s)) {
    return 'systems';
  }
  return 'concept';
}

export function getStageLabel(classNumber: SchoolClassNumber): string {
  if (classNumber <= 2) return 'Foundational Stage (Classes 1–2)';
  if (classNumber <= 5) return 'Preparatory Stage (Classes 3–5)';
  if (classNumber <= 8) return 'Middle Stage (Classes 6–8)';
  if (classNumber <= 10) return 'Secondary Stage (Classes 9–10)';
  return 'Senior Secondary Stage (Classes 11–12)';
}

export function getRecommendedFormatForChapter(
  chapter: SyllabusChapterEntry,
): { format: StudyResourceFormat; reason: string } {
  switch (chapter.kind) {
    case 'process':
    case 'systems':
      return {
        format: 'flowchart',
        reason: `Recommended first: Complete-Chapter Flowchart — "${chapter.title}" follows connected stages and cause-and-effect pathways that click fastest as an end-to-end visual flow.`,
      };
    case 'formula':
      return {
        format: 'quick_revision',
        reason: `Recommended first: Quick Revision & Formula Sheet — "${chapter.title}" relies on crisp formulas, rules, and error-free steps best mastered alongside the visual flowchart.`,
      };
    case 'timeline':
    case 'narrative':
    case 'concept':
    default:
      return {
        format: 'mindmap',
        reason: `Recommended first: Interactive Chapter Mindmap — "${chapter.title}" connects core ideas, themes, and sub-topics that are easiest to remember as one visual concept tree.`,
      };
  }
}

export function generateChapterVisualStudyPack(
  chapter: SyllabusChapterEntry,
  board = 'NCERT / HBSE / CBSE',
): ChapterVisualStudyPack {
  const { format: recommendedFormat, reason: recommendedReason } =
    getRecommendedFormatForChapter(chapter);
  const stageLabel = getStageLabel(chapter.classNumber);
  const topics = chapter.keyTopics.length > 0 ? chapter.keyTopics : ['Core Concepts', 'Key Rules', 'Applications'];
  const primaryTopic = topics[0];
  const secondaryTopic = topics[1] || topics[0];
  const tertiaryTopic = topics[2] || topics[0];
  const quaternaryTopic = topics[3] || topics[topics.length - 1];

  const centralIdea = `Master "${chapter.title}" (Class ${chapter.classNumber} ${chapter.subject}) by linking ${topics.slice(0, 3).join(', ')} directly to real-world reasoning: ${chapter.realLifeAnchor}.`;

  // 1. Mindmap (Central node + 5 balanced visual branches)
  const branches: MindmapBranch[] = [
    {
      id: 'b_foundation',
      title: '1. Core Foundation',
      colorKey: 'blue',
      summary: `Starts with ${primaryTopic} and establishes the essential vocabulary and core rule of "${chapter.title}".`,
      subNodes: [
        `What "${chapter.title}" explains`,
        `Key Pillar: ${primaryTopic}`,
        `Class ${chapter.classNumber} NCERT Scope`,
      ],
    },
    {
      id: 'b_concepts',
      title: '2. Main Pillars',
      colorKey: 'emerald',
      summary: `Connects the core building blocks so you can explain every sub-topic without rote memorisation.`,
      subNodes: topics.slice(0, 4),
    },
    {
      id: 'b_method',
      title: chapter.kind === 'formula' ? '3. Formulas & Steps' : '3. How It Works',
      colorKey: 'amber',
      summary: `Step-by-step execution sequence linking ${secondaryTopic} into ${tertiaryTopic}.`,
      subNodes: [
        `Step 1: Identify ${primaryTopic}`,
        `Step 2: Apply ${secondaryTopic}`,
        `Step 3: Verify via ${tertiaryTopic}`,
      ],
    },
    {
      id: 'b_realworld',
      title: '4. Real-Life Anchor',
      colorKey: 'violet',
      summary: `Anchors abstract ideas into a memorable everyday observation for instant recall.`,
      subNodes: [
        chapter.realLifeAnchor,
        `Visual Link: ${quaternaryTopic}`,
        'Why this matters outside class',
      ],
    },
    {
      id: 'b_exam',
      title: '5. Quick Exam Edge',
      colorKey: 'rose',
      summary: `High-scoring keywords, diagram/step checklist, and traps to avoid in school and board tests.`,
      subNodes: [
        'Write key terms & units clearly',
        'Sketch a 30-sec labelled flow/diagram',
        'Double-check common mistakes',
      ],
    },
  ];

  // 2. Complete-Chapter Flowchart (5 end-to-end visual stages)
  const flowchart: FlowchartStage[] = [
    {
      id: 'fc_1',
      stepNumber: 1,
      title: 'Start: Big Picture & Chapter Hook',
      nodeType: 'start',
      connectorLabel: 'Builds Foundation Into',
      headline: `Why we study "${chapter.title}"`,
      details: [
        `Everyday Trigger: ${chapter.realLifeAnchor}.`,
        `Target Outcome: Understand ${topics.join(' → ')} as one connected story.`,
      ],
      keyQuestion: `In one sentence, what core problem or idea does "${chapter.title}" explain?`,
      quickAnswer: `It explains ${primaryTopic} and how ${secondaryTopic} connects to ${chapter.realLifeAnchor.toLowerCase()}.`,
    },
    {
      id: 'fc_2',
      stepNumber: 2,
      title: 'Core Concepts & Building Blocks',
      nodeType: 'concept',
      connectorLabel: 'Drives Mechanism / Rule',
      headline: `Break the chapter into ${topics.length} clear blocks`,
      details: topics.map((t, i) => `Block ${i + 1}: ${t} — link definition, visual example, and key keyword.`),
      keyQuestion: `Which two sub-topics in "${chapter.title}" depend directly on each other?`,
      quickAnswer: `${primaryTopic} establishes the base rules needed to solve or explain ${secondaryTopic}.`,
    },
    {
      id: 'fc_3',
      stepNumber: 3,
      title: chapter.kind === 'formula' ? 'Decision & Formula Execution Path' : 'Step-by-Step Process & Decision Logic',
      nodeType: 'decision',
      connectorLabel: 'Applies Directly To',
      headline: `How to move from question/input to final understanding`,
      details: [
        `Check Input / Context: Spot keywords signalling ${primaryTopic} or ${secondaryTopic}.`,
        `Apply Core Method: Follow ${tertiaryTopic} in clean numbered steps without skipping logic.`,
        `Cross-Check Branch: Verify direction, units, cause-effect link, or textual evidence.`,
      ],
      keyQuestion: `What is the #1 checkpoint before writing your final answer on "${chapter.title}"?`,
      quickAnswer: `Verify that your reasoning explicitly connects ${secondaryTopic} to ${tertiaryTopic} with accurate terms or units.`,
    },
    {
      id: 'fc_4',
      stepNumber: 4,
      title: 'Worked Walkthrough & Real-World Application',
      nodeType: 'application',
      connectorLabel: 'Locks In Mastery At',
      headline: `Seeing "${chapter.title}" in action`,
      details: [
        `Real-Life Case: ${chapter.realLifeAnchor}.`,
        `Visual Recall Cue: Redraw the ${topics.slice(0, 3).join(' → ')} chain from memory in 45 seconds.`,
      ],
      keyQuestion: `How would you teach "${chapter.title}" to a classmate in 60 seconds?`,
      quickAnswer: `Start with "${chapter.realLifeAnchor}", then trace ${topics.slice(0, 3).join(' → ')}.`,
    },
    {
      id: 'fc_5',
      stepNumber: 5,
      title: 'Mastery Checkpoint & 5-Min Revision Lock',
      nodeType: 'checkpoint',
      connectorLabel: 'Chapter Complete',
      headline: `Ready for Class ${chapter.classNumber} Tests & NotebookLM Synthesis`,
      details: [
        `Can recall all ${topics.length} pillars without peeking at notes.`,
        `Can answer 1 short conceptual question, 1 application question, and 1 diagram/step question.`,
      ],
      keyQuestion: `Are you ready to test yourself with Active Recall Flashcards?`,
      quickAnswer: `Switch to Flashcards or Quick Revision above to verify 100% recall in under 5 minutes.`,
    },
  ];

  // 3. 5-Minute Quick Revision Sheet
  const keyItems: QuickRevisionKeyItem[] = topics.map((topic, idx) => ({
    term: topic,
    definitionOrFormula:
      idx === 0
        ? `Primary foundation of Ch. ${chapter.chapterNumber} (${chapter.title}) — defines the core principle and scope.`
        : idx === 1
          ? `Core working rule / relationship connecting ${primaryTopic} to structured Class ${chapter.classNumber} problems.`
          : `Essential application pillar used in competency-based questions and real-life examples.`,
    memoryCue: `Link "${topic}" directly to: ${chapter.realLifeAnchor}.`,
  }));

  const mnemonicLetters = topics
    .slice(0, 4)
    .map((t) => t.replace(/[^A-Za-z0-9\u0900-\u097F]/g, '').charAt(0).toUpperCase() || 'K')
    .join('–');

  const quickRevision = {
    estimatedMinutes: chapter.classNumber <= 5 ? 4 : 5,
    highYieldBullets: [
      `Chapter Core: ${centralIdea}`,
      `Must-Know Sequence: ${topics.join(' → ')}.`,
      `Everyday Connection: Always remember "${chapter.realLifeAnchor}" to unlock conceptual questions quickly.`,
      `Presentation Tip: Underline key terms (${topics.slice(0, 2).join(', ')}) and include a neat 3-step flowchart or labelled sketch in answers.`,
      `Revision Rhythm: Review Mindmap (2 min) → Trace Flowchart (2 min) → Flip 5 Flashcards (1 min).`,
    ],
    keyItems,
    commonMistakes: [
      `Memorising definitions of "${primaryTopic}" without understanding how it leads into "${secondaryTopic}".`,
      `Skipping intermediate reasoning steps, labels, or units while solving ${chapter.subject} questions.`,
      `Revising passively by re-reading pages instead of redrawing the chapter flowchart from memory.`,
    ],
    mnemonic: `Quick Recall Chain [${mnemonicLetters}]: ${topics.slice(0, 4).join(' → ')}`,
  };

  // 4. NotebookLM Aligned Studio Pack
  const sourceBriefMarkdown = [
    `# Class ${chapter.classNumber} ${chapter.subject} — Ch. ${chapter.chapterNumber}: ${chapter.title}`,
    `**Board & Stage:** ${board} · ${stageLabel}`,
    '',
    `## 1. Whole-Chapter Summary`,
    centralIdea,
    '',
    `## 2. Core Syllabus Pillars`,
    ...topics.map((t, i) => `${i + 1}. **${t}** — Key concept and classroom application.`),
    '',
    `## 3. End-to-End Chapter Flowchart`,
    ...flowchart.map((s) => `- **Step ${s.stepNumber} (${s.title}):** ${s.headline} — ${s.details[0]}`),
    '',
    `## 4. Real-World Anchor`,
    chapter.realLifeAnchor,
    '',
    `## 5. High-Yield Exam Checkpoints`,
    ...quickRevision.commonMistakes.map((m) => `- Avoid: ${m}`),
  ].join('\n');

  const audioOverviewPrompt = `Create a crisp 5-minute NotebookLM Audio Overview for a Class ${chapter.classNumber} student studying ${chapter.subject} Chapter ${chapter.chapterNumber}: "${chapter.title}". Explain ${topics.join(', ')} using the everyday example "${chapter.realLifeAnchor}". Keep tone warm, clear, and end with 3 rapid-fire revision questions.`;

  const mindmapStudyGuidePrompt = `Using the uploaded source for Class ${chapter.classNumber} ${chapter.subject} — "${chapter.title}", generate: (1) a hierarchical Mind Map covering ${topics.join(', ')}, (2) a 5-step end-to-end Chapter Flowchart, (3) a 1-page Quick Revision table, and (4) 5 exam-style competency questions with concise answers.`;

  const notebookLm: NotebookLmStudioPack = {
    sourceBriefMarkdown,
    audioOverviewPrompt,
    mindmapStudyGuidePrompt,
    audioOverviewDialoguePreview: [
      {
        host: 'Host A',
        line: `Welcome back! Today we are unpacking Class ${chapter.classNumber} ${chapter.subject}, Chapter ${chapter.chapterNumber}: "${chapter.title}" — so you can picture the whole chapter in 5 minutes.`,
      },
      {
        host: 'Host B',
        line: `And the easiest way to lock it in is starting with something real: ${chapter.realLifeAnchor}. Once you see that, ${primaryTopic} makes instant sense!`,
      },
      {
        host: 'Host A',
        line: `Exactly. From ${primaryTopic}, the chapter flows straight into ${secondaryTopic} and ${tertiaryTopic}. Think of it as one connected flowchart, not isolated textbook paragraphs.`,
      },
      {
        host: 'Host B',
        line: `Quick exam tip before we wrap: watch out for skipping steps between ${secondaryTopic} and ${tertiaryTopic}. Sketch the 5-step flow once before your test and you are set.`,
      },
    ],
    briefingFaq: [
      {
        question: `What is the fastest way to revise "${chapter.title}" before an exam?`,
        answer: `Scan the Interactive Mindmap for 2 minutes to recall all ${topics.length} pillars (${topics.join(', ')}), then trace the 5-step Complete-Chapter Flowchart and test yourself on the Flashcards.`,
      },
      {
        question: `How does "${chapter.title}" connect to real life?`,
        answer: `${chapter.realLifeAnchor} — remembering this concrete scenario immediately helps answer application and case-study questions.`,
      },
      {
        question: `How can I use this chapter with NotebookLM?`,
        answer: `Click "Copy NotebookLM Source Brief", paste it as a source in NotebookLM, then use either the Audio Overview Prompt (to listen) or Mindmap Study Guide Prompt (for deep Q&A).`,
      },
    ],
  };

  // 5. Active Recall Flashcards
  const flashcards: ChapterFlashcard[] = [
    {
      id: `${chapter.id}_fc1`,
      prompt: `What are the ${topics.length} core pillars of Ch. ${chapter.chapterNumber}: "${chapter.title}"?`,
      answer: topics.join(' · '),
      hint: `Starts with "${primaryTopic}"`,
      tag: 'Big Picture',
    },
    {
      id: `${chapter.id}_fc2`,
      prompt: `Give one real-life example that demonstrates "${chapter.title}".`,
      answer: chapter.realLifeAnchor,
      hint: `Think of an everyday Class ${chapter.classNumber} observation.`,
      tag: 'Application',
    },
    {
      id: `${chapter.id}_fc3`,
      prompt: `In the Complete-Chapter Flowchart, how does "${primaryTopic}" connect to "${secondaryTopic}"?`,
      answer: `${primaryTopic} lays down the base principle/definition, which directly drives how "${secondaryTopic}" works in problems and explanations.`,
      hint: 'Cause → Method relationship',
      tag: 'Flowchart Link',
    },
    {
      id: `${chapter.id}_fc4`,
      prompt: `What is the most common mistake students make in "${chapter.title}"?`,
      answer: quickRevision.commonMistakes[0],
      hint: 'Think about rote memorisation vs logical connection.',
      tag: 'Exam Trap',
    },
    {
      id: `${chapter.id}_fc5`,
      prompt: `Recite the quick memory chain for "${chapter.title}".`,
      answer: quickRevision.mnemonic,
      hint: `First pillar is ${primaryTopic}.`,
      tag: 'Quick Recall',
    },
  ];

  // 6. Best-Recommended Resources
  const recommendedResources: RecommendedResourceItem[] = [
    {
      id: 'rec_notebooklm',
      title: `NotebookLM Audio Overview & Study Guide — ${chapter.title}`,
      provider: 'NotebookLM Aligned Workflow',
      formatLabel: 'Audio + Interactive Q&A',
      whyRecommended: 'Lets students listen, ask follow-up doubts, and generate custom mindmaps strictly grounded in the chapter brief.',
      studyTip: 'Use the copyable Source Brief from the NotebookLM Pack tab for 100% syllabus-focused responses.',
    },
    {
      id: 'rec_mindmap',
      title: `One-Page Visual Mindmap & Complete Flowchart`,
      provider: 'Virat Visual Revision Studio',
      formatLabel: 'Visual Diagram',
      whyRecommended: 'Compresses an entire chapter into one scannable visual map—proven to boost retention before unit tests.',
      studyTip: 'After viewing once, close the screen and draw the 5 branches on rough paper.',
    },
    {
      id: 'rec_ncert',
      title: `NCERT / DIKSHA Exemplar & Concept Checks (Class ${chapter.classNumber} ${chapter.subject})`,
      provider: 'NCERT & DIKSHA',
      formatLabel: 'Official Textbook & Exemplar',
      whyRecommended: 'Direct alignment with HBSE/CBSE exam blueprints, definitions, and competency-based case questions.',
      studyTip: 'Solve in-text boxes and Exemplar MCQs immediately after finishing the Flowchart.',
    },
    {
      id: 'rec_active_recall',
      title: `Spaced Active Recall & 5-Min Quick Sheet`,
      provider: 'Evidence-Based Study Method',
      formatLabel: 'Flashcards + Cheat Sheet',
      whyRecommended: 'Active self-testing beats passive re-reading by 2× for long-term exam recall.',
      studyTip: 'Revisit flashcards 1 day, 3 days, and 7 days after studying the chapter.',
    },
  ];

  return {
    chapter,
    recommendedFormat,
    recommendedReason,
    stageLabel,
    centralIdea,
    mindmap: {
      centerTitle: chapter.title,
      centerSubtitle: `Class ${chapter.classNumber} · ${chapter.subject} · Ch. ${chapter.chapterNumber}`,
      branches,
    },
    flowchart,
    quickRevision,
    notebookLm,
    flashcards,
    recommendedResources,
  };
}

export function computeFlashcardMasteryPercent(
  totalCards: number,
  masteredIds: string[],
): number {
  if (totalCards <= 0) return 0;
  const clamped = Math.min(totalCards, Math.max(0, masteredIds.length));
  return Math.round((clamped / totalCards) * 100);
}
