import type { ChapterVisualStudyPack } from './chapterVisualStudyEngine';
import type { ChapterStudyGameDeck } from './chapterStudyGameEngine';

export type PlatterIconKind =
  | 'rice'
  | 'roti'
  | 'potato'
  | 'corn'
  | 'dal'
  | 'paneer'
  | 'chana'
  | 'egg'
  | 'ghee'
  | 'nuts'
  | 'carrot'
  | 'spinach'
  | 'orange'
  | 'concept_core'
  | 'concept_process'
  | 'concept_example'
  | 'concept_rule';

export interface VisualPlatterItem {
  id: string;
  label: string;
  subLabel: string;
  categoryKey: string;
  iconKind: PlatterIconKind;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  correctFeedback: string;
  wrongFeedback: string;
}

export interface VisualPlatterRound {
  id: string;
  targetCategoryKey: string;
  conceptTitle: string;
  promptQuestion: string;
  platterLabel: string;
  imageUrl?: string;
  imageAlt: string;
  imageCaption: string;
  conceptFact: string;
  labTestClue?: string;
  targetCount: number;
  items: VisualPlatterItem[];
}

export interface VisualConceptLabConfig {
  mode: 'food_nutrition_platter' | 'universal_concept_tray';
  headline: string;
  subtitle: string;
  bonusLabImageUrl?: string;
  bonusLabTitle?: string;
  bonusLabCaption?: string;
  rounds: VisualPlatterRound[];
}

// Client-side public asset URLs (served cleanly from public/assets/images in both dev and production dist)
export const FOOD_LAB_IMAGES = {
  carbs: '/assets/images/food_carbs_platter_1795355234339.jpg',
  proteins: '/assets/images/food_protein_platter_1795355236074.jpg',
  fats: '/assets/images/food_fats_platter_1795355236060.jpg',
  vitamins: '/assets/images/food_vitamins_platter_1795355235769.jpg',
  iodineTest: '/assets/images/science_food_test_lab_1795355235616.jpg',
  balancedThali: '/assets/images/balanced_indian_thali_1795355235480.jpg',
} as const;

const NUTRITION_FOOD_ITEMS: VisualPlatterItem[] = [
  // Carbohydrates
  {
    id: 'food-rice',
    label: 'Steamed Rice',
    subLabel: 'Rich in Starch',
    categoryKey: 'carbohydrates',
    iconKind: 'rice',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    accentText: 'text-amber-900',
    correctFeedback: 'Spot on! Steamed rice is packed with starch (a carbohydrate) that fuels instant energy.',
    wrongFeedback: 'Rice is primarily a Carbohydrate (starch) — great for quick energy, not the target nutrient for this platter.',
  },
  {
    id: 'food-roti',
    label: 'Whole Wheat Roti',
    subLabel: 'Cereal Grain',
    categoryKey: 'carbohydrates',
    iconKind: 'roti',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    accentText: 'text-amber-900',
    correctFeedback: 'Correct! Wheat chapati supplies complex carbohydrates for steady daytime energy.',
    wrongFeedback: 'Whole wheat roti belongs to Carbohydrates (energy-giving cereal grain).',
  },
  {
    id: 'food-potato',
    label: 'Boiled Potato',
    subLabel: 'Iodine turns blue-black',
    categoryKey: 'carbohydrates',
    iconKind: 'potato',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    accentText: 'text-amber-900',
    correctFeedback: 'Yes! Potatoes are rich in starch — a classic positive blue-black result in the iodine test.',
    wrongFeedback: 'Boiled potato is a classic starch-rich Carbohydrate, not this round’s target nutrient.',
  },
  {
    id: 'food-corn',
    label: 'Sweet Corn',
    subLabel: 'Natural Sugars & Starch',
    categoryKey: 'carbohydrates',
    iconKind: 'corn',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    accentText: 'text-amber-900',
    correctFeedback: 'Great pick! Sweet corn gives both natural sugars and starch (Carbohydrates).',
    wrongFeedback: 'Sweet corn is mainly an energy-giving Carbohydrate food.',
  },
  // Proteins
  {
    id: 'food-dal',
    label: 'Yellow Moong Dal',
    subLabel: 'Pulses / Legumes',
    categoryKey: 'proteins',
    iconKind: 'dal',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentText: 'text-emerald-900',
    correctFeedback: 'Correct! Moong dal is a plant Protein powerhouse that builds and repairs body tissues.',
    wrongFeedback: 'Moong dal is a body-building Protein source, not the nutrient asked for on this plate.',
  },
  {
    id: 'food-paneer',
    label: 'Fresh Paneer Cubes',
    subLabel: 'Dairy Protein',
    categoryKey: 'proteins',
    iconKind: 'paneer',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentText: 'text-emerald-900',
    correctFeedback: 'Well done! Paneer is rich in milk Protein that supports bone & muscle growth.',
    wrongFeedback: 'Paneer is mainly a body-building Protein food (turns violet in the copper sulphate + caustic soda test).',
  },
  {
    id: 'food-chana',
    label: 'Roasted Chana',
    subLabel: 'Chickpea Gram',
    categoryKey: 'proteins',
    iconKind: 'chana',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentText: 'text-emerald-900',
    correctFeedback: 'Right choice! Gram/chickpeas are rich in plant Proteins for growing students.',
    wrongFeedback: 'Roasted chana is packed with body-building Proteins, not this round’s nutrient.',
  },
  {
    id: 'food-egg',
    label: 'Boiled Egg',
    subLabel: 'Complete Protein',
    categoryKey: 'proteins',
    iconKind: 'egg',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentText: 'text-emerald-900',
    correctFeedback: 'Excellent! Egg white & yolk deliver high-quality body-building Proteins.',
    wrongFeedback: 'Boiled egg is primarily a Protein-rich body-building food.',
  },
  // Fats
  {
    id: 'food-ghee',
    label: 'Desi Ghee & Butter',
    subLabel: 'Translucent Paper Spot',
    categoryKey: 'fats',
    iconKind: 'ghee',
    accentBg: 'bg-yellow-50',
    accentBorder: 'border-yellow-300',
    accentText: 'text-yellow-900',
    correctFeedback: 'Spot on! Ghee & butter are concentrated Fats — they leave an oily translucent patch on paper.',
    wrongFeedback: 'Ghee & butter are concentrated Fats (high stored energy), not this round’s target nutrient.',
  },
  {
    id: 'food-nuts',
    label: 'Walnuts & Peanuts',
    subLabel: 'Natural Plant Oils',
    categoryKey: 'fats',
    iconKind: 'nuts',
    accentBg: 'bg-yellow-50',
    accentBorder: 'border-yellow-300',
    accentText: 'text-yellow-900',
    correctFeedback: 'Correct! Crushed groundnuts & walnuts release plant oils (Fats) that give double the energy of carbs.',
    wrongFeedback: 'Walnuts and peanuts are rich in healthy plant Fats (oils), not this round’s target.',
  },
  // Vitamins & Minerals
  {
    id: 'food-carrot',
    label: 'Fresh Carrots',
    subLabel: 'Vitamin A · Vision',
    categoryKey: 'vitamins',
    iconKind: 'carrot',
    accentBg: 'bg-orange-50',
    accentBorder: 'border-orange-200',
    accentText: 'text-orange-900',
    correctFeedback: 'Great! Carrots supply Vitamin A, keeping eyes healthy and preventing night blindness.',
    wrongFeedback: 'Carrots are protective Vitamin A foods (Vitamins & Minerals), not this round’s target.',
  },
  {
    id: 'food-spinach',
    label: 'Palak / Spinach',
    subLabel: 'Iron & Minerals',
    categoryKey: 'vitamins',
    iconKind: 'spinach',
    accentBg: 'bg-teal-50',
    accentBorder: 'border-teal-200',
    accentText: 'text-teal-900',
    correctFeedback: 'Awesome! Spinach gives Iron and protective Vitamins that prevent anaemia and fight illness.',
    wrongFeedback: 'Spinach is a protective Vitamin & Mineral leafy vegetable.',
  },
  {
    id: 'food-orange',
    label: 'Oranges & Amla',
    subLabel: 'Vitamin C · Immunity',
    categoryKey: 'vitamins',
    iconKind: 'orange',
    accentBg: 'bg-orange-50',
    accentBorder: 'border-orange-200',
    accentText: 'text-orange-900',
    correctFeedback: 'Yes! Citrus fruits & Amla deliver Vitamin C to boost immunity and prevent scurvy.',
    wrongFeedback: 'Oranges and Amla are protective Vitamin C foods (Vitamins & Minerals).',
  },
];

function buildFoodNutritionLab(): VisualConceptLabConfig {
  const byId = new Map(NUTRITION_FOOD_ITEMS.map((item) => [item.id, item]));
  const pick = (ids: string[]) => ids.map((id) => byId.get(id)!).filter(Boolean);

  return {
    mode: 'food_nutrition_platter',
    headline: 'Visual Food Platter Lab · Components of Food',
    subtitle:
      'Drag (or tap) ONLY the foods rich in the asked nutrient onto your thali platter. Instant lab clues teach you why each food belongs.',
    bonusLabImageUrl: FOOD_LAB_IMAGES.iodineTest,
    bonusLabTitle: 'Lab Check: Iodine Test for Starch',
    bonusLabCaption: '2–3 drops of dilute iodine turn starch-rich foods (potato, rice) blue-black.',
    rounds: [
      {
        id: 'round-carbs',
        targetCategoryKey: 'carbohydrates',
        conceptTitle: 'Carbohydrates · Energy-Giving Foods',
        promptQuestion:
          'Drag ONLY the Carbohydrate-rich foods onto the Energy Platter! (Select 3 correct foods)',
        platterLabel: 'Carbohydrate Energy Platter',
        imageUrl: FOOD_LAB_IMAGES.carbs,
        imageAlt: 'Carbohydrate-rich Indian food platter with rice, whole wheat roti, boiled potato, and sweet corn',
        imageCaption: 'Energy-giving staples: Rice, Roti, Potato & Sweet Corn',
        conceptFact:
          'Carbohydrates (starch & sugars) are the primary fuel for running, studying, and staying active through the school day.',
        labTestClue: 'Iodine Test: Dilute iodine solution turns starch-rich foods blue-black.',
        targetCount: 3,
        items: pick([
          'food-rice',
          'food-paneer',
          'food-potato',
          'food-carrot',
          'food-roti',
          'food-ghee',
        ]),
      },
      {
        id: 'round-proteins',
        targetCategoryKey: 'proteins',
        conceptTitle: 'Proteins · Body-Building Foods',
        promptQuestion:
          'Build the Body-Building Platter! Drag ONLY Protein-rich foods onto the plate. (Select 3 correct foods)',
        platterLabel: 'Protein Body-Building Platter',
        imageUrl: FOOD_LAB_IMAGES.proteins,
        imageAlt: 'Protein-rich Indian food platter with yellow moong dal, paneer cubes, roasted chana, and boiled eggs',
        imageCaption: 'Body-building foods: Dal, Paneer, Chickpeas & Eggs',
        conceptFact:
          'Proteins build new cells, muscles, and repair tissues — growing children need proteins in every meal.',
        labTestClue: 'Biuret Test: Copper sulphate + caustic soda turns protein samples violet.',
        targetCount: 3,
        items: pick([
          'food-dal',
          'food-corn',
          'food-paneer',
          'food-orange',
          'food-chana',
          'food-ghee',
        ]),
      },
      {
        id: 'round-fats',
        targetCategoryKey: 'fats',
        conceptTitle: 'Fats · Stored Energy Foods',
        promptQuestion:
          'Select ONLY the Fat-rich foods for the Stored-Energy Platter! (Select 2 correct foods)',
        platterLabel: 'Healthy Fats Platter',
        imageUrl: FOOD_LAB_IMAGES.fats,
        imageAlt: 'Fat-rich foods including desi ghee, butter, walnuts, and peanuts',
        imageCaption: 'Stored energy sources: Ghee, Butter, Walnuts & Groundnuts',
        conceptFact:
          'Fats provide more energy than the same weight of carbohydrates and keep the body warm, though excess fried fat causes obesity.',
        labTestClue: 'Paper Patch Test: Crushed nuts or butter leave an oily translucent spot on paper.',
        targetCount: 2,
        items: pick([
          'food-ghee',
          'food-rice',
          'food-nuts',
          'food-spinach',
          'food-egg',
          'food-potato',
        ]),
      },
      {
        id: 'round-vitamins',
        targetCategoryKey: 'vitamins',
        conceptTitle: 'Vitamins & Minerals · Protective Foods',
        promptQuestion:
          'Finish your Balanced Diet! Drag ONLY Vitamin & Mineral rich protective foods onto the plate. (Select 3 correct foods)',
        platterLabel: 'Protective Vitamins & Minerals Platter',
        imageUrl: FOOD_LAB_IMAGES.vitamins,
        imageAlt: 'Vitamin and mineral rich produce including carrots, fresh spinach, oranges, and amla',
        imageCaption: 'Protective foods: Carrots (Vit A), Spinach (Iron), Oranges & Amla (Vit C)',
        conceptFact:
          'Vitamins (A, B, C, D) and Minerals (Iron, Calcium, Iodine) protect our body from deficiency diseases like night blindness, scurvy, rickets, and goitre.',
        labTestClue: 'Balanced Diet Rule: Combine all 4 food groups + roughage + water daily.',
        targetCount: 3,
        items: pick([
          'food-carrot',
          'food-roti',
          'food-spinach',
          'food-dal',
          'food-orange',
          'food-nuts',
        ]),
      },
    ],
  };
}

function buildUniversalVisualConceptLab(
  pack: ChapterVisualStudyPack,
  deck: ChapterStudyGameDeck,
): VisualConceptLabConfig {
  const branches = pack.mindmap.branches.slice(0, 3);
  const allBranches = pack.mindmap.branches;

  const iconCycle: PlatterIconKind[] = [
    'concept_core',
    'concept_process',
    'concept_example',
    'concept_rule',
  ];

  const paletteByColor: Record<
    string,
    { bg: string; border: string; text: string }
  > = {
    blue: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-900' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900' },
    violet: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900' },
  };

  const rounds: VisualPlatterRound[] = branches.map((branch, roundIdx) => {
    const pal = paletteByColor[branch.colorKey] ?? paletteByColor.blue;
    const correctNodes = branch.subNodes.slice(0, 3);
    const distractorCandidates = allBranches
      .filter((b) => b.id !== branch.id)
      .flatMap((b) =>
        b.subNodes.slice(0, 2).map((node) => ({
          node,
          ownerTitle: b.title,
          colorKey: b.colorKey,
        })),
      )
      .slice(0, 3);

    const correctItems: VisualPlatterItem[] = correctNodes.map((node, idx) => ({
      id: `${branch.id}-c-${idx}`,
      label: node,
      subLabel: `Key Concept · ${pack.chapter.subject}`,
      categoryKey: branch.id,
      iconKind: iconCycle[(roundIdx + idx) % iconCycle.length],
      accentBg: pal.bg,
      accentBorder: pal.border,
      accentText: pal.text,
      correctFeedback: `Correct! "${node}" directly belongs to ${branch.title}.`,
      wrongFeedback: `"${node}" belongs to ${branch.title}.`,
    }));

    const distractorItems: VisualPlatterItem[] = distractorCandidates.map((d, idx) => {
      const dPal = paletteByColor[d.colorKey] ?? paletteByColor.amber;
      return {
        id: `${branch.id}-d-${idx}`,
        label: d.node,
        subLabel: `Chapter Concept`,
        categoryKey: `other-${d.ownerTitle}`,
        iconKind: iconCycle[(roundIdx + idx + 2) % iconCycle.length],
        accentBg: dPal.bg,
        accentBorder: dPal.border,
        accentText: dPal.text,
        correctFeedback: `Matched to ${d.ownerTitle}.`,
        wrongFeedback: `Not quite! "${d.node}" belongs to "${d.ownerTitle}", not "${branch.title}".`,
      };
    });

    // Interleave correct and distractor cards deterministically
    const interleaved: VisualPlatterItem[] = [];
    const maxLen = Math.max(correctItems.length, distractorItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (i % 2 === 0) {
        if (correctItems[i]) interleaved.push(correctItems[i]);
        if (distractorItems[i]) interleaved.push(distractorItems[i]);
      } else {
        if (distractorItems[i]) interleaved.push(distractorItems[i]);
        if (correctItems[i]) interleaved.push(correctItems[i]);
      }
    }

    return {
      id: `vround-${branch.id}`,
      targetCategoryKey: branch.id,
      conceptTitle: branch.title,
      promptQuestion: `Drag ONLY the concepts & examples that belong to "${branch.title}" onto the Study Tray! (Select ${correctItems.length})`,
      platterLabel: `${branch.title} Concept Tray`,
      imageAlt: `Visual concept map for ${branch.title} in ${deck.chapterTitle}`,
      imageCaption: `${pack.chapter.subject} · Ch ${pack.chapter.chapterNumber}: ${branch.title}`,
      conceptFact: branch.summary,
      labTestClue: pack.chapter.realLifeAnchor
        ? `Real-life link: ${pack.chapter.realLifeAnchor}`
        : undefined,
      targetCount: correctItems.length,
      items: interleaved,
    };
  });

  return {
    mode: 'universal_concept_tray',
    headline: `Interactive Concept Tray · ${deck.chapterTitle}`,
    subtitle:
      'Sort & drag the matching concepts onto the chapter tray to build deep visual recall before moving to the sequence and boss quiz.',
    rounds,
  };
}

/**
 * Builds the Stage 1 interactive visual concept platter/tray for any chapter.
 * Class 6 Science Ch. 1 ("Components of Food") or any food/nutrition chapter launches
 * the flagship illustrated Indian Food Platter Drag-and-Drop Lab.
 */
export function buildVisualConceptLabForChapter(
  pack: ChapterVisualStudyPack,
  deck: ChapterStudyGameDeck,
): VisualConceptLabConfig {
  const titleLower = pack.chapter.title.toLowerCase();
  const subjectLower = pack.chapter.subject.toLowerCase();
  const isFoodComponentsChapter =
    (pack.chapter.classNumber === 6 &&
      subjectLower.includes('science') &&
      (pack.chapter.chapterNumber === 1 || titleLower.includes('food'))) ||
    titleLower.includes('components of food') ||
    titleLower.includes('nutrition in animals') ||
    titleLower.includes('carbohydrates');

  if (isFoodComponentsChapter) {
    return buildFoodNutritionLab();
  }
  return buildUniversalVisualConceptLab(pack, deck);
}
