import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import {
  buildFactorGridChallenge,
  buildTimesSprintBank,
  type DifficultyLevel,
} from '../../../utils/cognitiveGamePuzzles';
import { playErrorCue, playSuccessChime, playVictoryFanfare } from '../../../utils/soundFx';
import type { PlayableEngineProps } from './gameEngineTypes';

function speakSafely(text: string) {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.88;
      window.speechSynthesis.speak(utter);
    }
  } catch {
    // ignore speech errors in headless environments
  }
}

interface PhonicsPrompt {
  prompt: string;
  speakText: string;
  soundCue: string;
  options: string[];
  answer: string;
}

function buildPhonicsBank(level: DifficultyLevel): PhonicsPrompt[] {
  if (level === 1) {
    return [
      {
        prompt: 'Which word starts with the /sh/ sound?',
        speakText: 'sh... ship',
        soundCue: '/sh/',
        options: ['ship', 'sip', 'lip', 'rip'],
        answer: 'ship',
      },
      {
        prompt: 'Which word has the short /a/ sound in the middle?',
        speakText: 'cat',
        soundCue: 'c - /a/ - t',
        options: ['cat', 'cut', 'cot', 'kit'],
        answer: 'cat',
      },
      {
        prompt: 'Which word starts with the /ch/ sound?',
        speakText: 'ch... chair',
        soundCue: '/ch/',
        options: ['chair', 'fair', 'hair', 'pair'],
        answer: 'chair',
      },
      {
        prompt: 'Which word rhymes with "sun" (/un/)?',
        speakText: 'sun... run',
        soundCue: '-un',
        options: ['run', 'pan', 'sit', 'box'],
        answer: 'run',
      },
      {
        prompt: 'Which word starts with the /th/ sound?',
        speakText: 'th... thumb',
        soundCue: '/th/',
        options: ['thumb', 'drum', 'plum', 'gum'],
        answer: 'thumb',
      },
    ];
  }
  if (level === 2) {
    return [
      {
        prompt: 'Pick the word with the initial /bl/ consonant blend:',
        speakText: 'blue block',
        soundCue: '/bl/',
        options: ['block', 'lock', 'dock', 'sock'],
        answer: 'block',
      },
      {
        prompt: 'Pick the word with the long /ai/ vowel team sound:',
        speakText: 'train',
        soundCue: '/ai/ (long A)',
        options: ['train', 'trim', 'trap', 'trot'],
        answer: 'train',
      },
      {
        prompt: 'Pick the word with the /st/ beginning blend:',
        speakText: 'star',
        soundCue: '/st/',
        options: ['star', 'car', 'jar', 'far'],
        answer: 'star',
      },
      {
        prompt: 'Pick the word with the /ea/ long E vowel team:',
        speakText: 'read leaf',
        soundCue: '/ea/ (long E)',
        options: ['leaf', 'loaf', 'left', 'lift'],
        answer: 'leaf',
      },
      {
        prompt: 'Pick the word ending with the /nk/ blend:',
        speakText: 'think',
        soundCue: '-nk',
        options: ['think', 'thin', 'this', 'thick'],
        answer: 'think',
      },
    ];
  }
  if (level === 3) {
    return [
      {
        prompt: 'Which word uses the /ph/ digraph making an /f/ sound?',
        speakText: 'phonics',
        soundCue: 'ph -> /f/',
        options: ['phonics', 'public', 'pocket', 'plastic'],
        answer: 'phonics',
      },
      {
        prompt: 'Which word contains the /oa/ vowel team (long O)?',
        speakText: 'coast',
        soundCue: '/oa/',
        options: ['coast', 'cast', 'cost', 'crest'],
        answer: 'coast',
      },
      {
        prompt: 'Which word has the soft /c/ sound (like /s/) before e or i?',
        speakText: 'pencil',
        soundCue: 'c -> /s/',
        options: ['pencil', 'candle', 'camel', 'carpet'],
        answer: 'pencil',
      },
      {
        prompt: 'Which word has the r-controlled /ar/ sound?',
        speakText: 'garden',
        soundCue: '/ar/',
        options: ['garden', 'gather', 'gallon', 'golden'],
        answer: 'garden',
      },
      {
        prompt: 'Which word uses the /ow/ sound as in "cloud"?',
        speakText: 'flower',
        soundCue: '/ow/ as in cloud',
        options: ['flower', 'floor', 'float', 'flock'],
        answer: 'flower',
      },
    ];
  }
  if (level === 4) {
    return [
      {
        prompt: 'Which scientific term contains a silent "p" (/ps/ -> /s/)?',
        speakText: 'psychology',
        soundCue: 'silent ps-',
        options: ['psychology', 'physical', 'phosphorus', 'photosynthesis'],
        answer: 'psychology',
      },
      {
        prompt: 'Which word uses the Greek root /therm-/ meaning heat?',
        speakText: 'thermodynamics',
        soundCue: 'therm- (heat)',
        options: ['thermodynamics', 'theology', 'threshold', 'throttle'],
        answer: 'thermodynamics',
      },
      {
        prompt: 'Which word contains a silent "n" in the final /-mn/ cluster?',
        speakText: 'autumn',
        soundCue: 'silent -mn',
        options: ['autumn', 'alumna', 'amnesia', 'harmonic'],
        answer: 'autumn',
      },
      {
        prompt: 'Which word carries the Latin root /chron-/ meaning time?',
        speakText: 'chronology',
        soundCue: 'chron- (time)',
        options: ['chronology', 'chromium', 'chrysanthemum', 'chlorophyll'],
        answer: 'chronology',
      },
      {
        prompt: 'Which pair shifts primary stress when changing Noun -> Verb?',
        speakText: 'record',
        soundCue: 'RE-cord / re-CORD',
        options: ['record', 'window', 'carpet', 'oxygen'],
        answer: 'record',
      },
      {
        prompt: 'Which word uses a Greek /ch/ pronounced as hard /k/?',
        speakText: 'stoichiometry',
        soundCue: 'ch -> /k/',
        options: ['stoichiometry', 'chivalry', 'chalice', 'chariot'],
        answer: 'stoichiometry',
      },
      {
        prompt: 'Which word features the silent /gn/ cluster (/gn/ -> /n/)?',
        speakText: 'paradigm',
        soundCue: 'silent -gn / -gm',
        options: ['assign', 'signal', 'ignite', 'magnet'],
        answer: 'assign',
      },
    ];
  }
  // Level 5 (Classes 11-12): Senior academic etymology, silent clusters, stress & morphology
  return [
    {
      prompt: 'Which word contains the silent final "m/n" cluster where spelling reflects Latin etymology?',
      speakText: 'mnemonic',
      soundCue: 'silent mn- -> /n/',
      options: ['mnemonic', 'monomial', 'momentum', 'meridian'],
      answer: 'mnemonic',
    },
    {
      prompt: 'Which term combines Greek roots for "knowledge" + "study of"?',
      speakText: 'epistemology',
      soundCue: 'episteme + -logy',
      options: ['epistemology', 'etymology', 'entomology', 'endocrinology'],
      answer: 'epistemology',
    },
    {
      prompt: 'Which word uses the /ough/ spelling pronounced as /əf/ (like "rough")?',
      speakText: 'enough',
      soundCue: '-ough -> /uf/',
      options: ['enough', 'through', 'borough', 'bough'],
      answer: 'enough',
    },
    {
      prompt: 'Which academic adjective places primary stress on the ANTEPENULTIMATE (3rd-from-end) syllable?',
      speakText: 'synonymous',
      soundCue: 'sy-NON-y-mous',
      options: ['synonymous', 'equilibrium', 'electrolysis', 'empirical'],
      answer: 'synonymous',
    },
    {
      prompt: 'Which word retains a silent initial "rh-" from Classical Greek aspirate rho?',
      speakText: 'rhetoric',
      soundCue: 'rh- -> /r/',
      options: ['rhetoric', 'resilience', 'resonance', 'radiant'],
      answer: 'rhetoric',
    },
    {
      prompt: 'Which word contains an internal silent "b" before "t" from Latin *dubitare* / *subtilis*?',
      speakText: 'subtlety',
      soundCue: 'silent -bt-',
      options: ['subtlety', 'submerge', 'subtract', 'substance'],
      answer: 'subtlety',
    },
    {
      prompt: 'Which word splits cleanly into 6 distinct spoken syllables?',
      speakText: 'interdisciplinary',
      soundCue: '6+ syllables',
      options: ['heterogeneous', 'thermometer', 'methodology', 'hypothesis'],
      answer: 'heterogeneous',
    },
    {
      prompt: 'Which word uses /sc/ pronounced as /sh/ before a suffix?',
      speakText: 'conscientious',
      soundCue: '-sci- -> /sh/',
      options: ['conscientious', 'oscillation', 'crescent', 'transcend'],
      answer: 'conscientious',
    },
  ];
}

// #26 Phonics Sound Match
export const PhonicsSoundMatchGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const bank = useMemo(() => buildPhonicsBank(level as DifficultyLevel), [level]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const startRef = useRef(Date.now());
  const qStartRef = useRef(Date.now());
  const reactionsRef = useRef<number[]>([]);

  const current = bank[idx];

  useEffect(() => {
    onHudUpdate({
      progressText: `${idx + 1}/${bank.length}`,
      score: Math.round((correct / bank.length) * 100),
      errors,
    });
  }, [idx, bank.length, correct, errors, onHudUpdate]);

  function handlePick(choice: string) {
    reactionsRef.current.push(Date.now() - qStartRef.current);
    const isRight = choice === current.answer;
    const nextCorrect = isRight ? correct + 1 : correct;
    const nextErrors = isRight ? errors : errors + 1;

    if (isRight) {
      playSuccessChime();
      setCorrect(nextCorrect);
      setFeedback(`Matched "${choice}" (${current.soundCue}).`);
    } else {
      playErrorCue();
      setErrors(nextErrors);
      setFeedback(`Target pattern ${current.soundCue} matches "${current.answer}".`);
    }

    if (idx + 1 >= bank.length) {
      playVictoryFanfare();
      const acc = Math.round((nextCorrect / bank.length) * 100);
      const avgRt = Math.round(
        reactionsRef.current.reduce((a, b) => a + b, 0) / reactionsRef.current.length,
      );
      onFinish({
        accuracyPct: acc,
        completionTimeSec: Math.max(1, Math.round((Date.now() - startRef.current) / 1000)),
        reactionTimeMs: avgRt,
        errorCount: nextErrors,
        scorePoints: acc,
        completed: true,
        summaryDetail: `${nextCorrect}/${bank.length} Level-${level} linguistic/phonology items decoded accurately.`,
      });
    } else {
      setIdx(idx + 1);
      qStartRef.current = Date.now();
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-emerald-900">
            {lang === 'hi' ? 'ध्वनि संकेत:' : 'Target Pattern:'}{' '}
            <span className="font-mono text-sm font-bold text-slate-900">{current.soundCue}</span>
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{current.prompt}</p>
        </div>
        <button
          type="button"
          onClick={() => speakSafely(current.speakText)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 whitespace-nowrap shrink-0"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Hear Sound Clue
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {current.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handlePick(opt)}
            className="min-h-14 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center font-display text-base sm:text-lg font-bold text-slate-900 hover:border-blue-900 hover:bg-blue-50/50 transition-colors"
          >
            {opt}
          </button>
        ))}
      </div>

      {feedback && (
        <p className="text-xs font-medium text-slate-600 text-center">{feedback}</p>
      )}
    </div>
  );
};

interface SyllableWordItem {
  clue: string;
  word: string;
  syllables: string[];
}

function buildSyllableBank(level: DifficultyLevel): SyllableWordItem[] {
  if (level === 1) {
    return [
      { clue: 'Outdoor meal in a park', word: 'picnic', syllables: ['pic', 'nic'] },
      { clue: 'Bright star in daytime', word: 'sunlight', syllables: ['sun', 'light'] },
      { clue: 'Woven container', word: 'basket', syllables: ['bas', 'ket'] },
      { clue: 'Small hopping animal', word: 'rabbit', syllables: ['rab', 'bit'] },
    ];
  }
  if (level === 2) {
    return [
      { clue: 'Sound-to-letter reading method', word: 'phonics', syllables: ['phon', 'ics'] },
      { clue: 'Repeated training to improve', word: 'practice', syllables: ['prac', 'tice'] },
      { clue: 'Midday meal at school', word: 'lunchbox', syllables: ['lunch', 'box'] },
      { clue: 'Written page in a subject book', word: 'notebook', syllables: ['note', 'book'] },
      { clue: 'Morning time before noon', word: 'morning', syllables: ['morn', 'ing'] },
    ];
  }
  if (level === 3) {
    return [
      { clue: 'List of words & meanings', word: 'dictionary', syllables: ['dic', 'tion', 'ar', 'y'] },
      { clue: 'Natural world around us', word: 'habitat', syllables: ['hab', 'i', 'tat'] },
      { clue: 'Clear spoken or written reading', word: 'fluency', syllables: ['flu', 'en', 'cy'] },
      { clue: 'Person studying in a school', word: 'student', syllables: ['stu', 'dent'] },
      { clue: 'Careful focus on a task', word: 'attention', syllables: ['at', 'ten', 'tion'] },
    ];
  }
  if (level === 4) {
    return [
      { clue: 'Conversion of light energy into chemical sugars by plants', word: 'photosynthesis', syllables: ['pho', 'to', 'syn', 'the', 'sis'] },
      { clue: 'Branch of physics studying heat and work', word: 'thermodynamics', syllables: ['ther', 'mo', 'dy', 'nam', 'ics'] },
      { clue: 'Splitting a compound using electric current', word: 'electrolysis', syllables: ['e', 'lec', 'trol', 'y', 'sis'] },
      { clue: 'Tendency of a system to resist change in motion', word: 'equilibrium', syllables: ['e', 'qui', 'lib', 'ri', 'um'] },
      { clue: 'Study of geometric and numerical calculation of triangles', word: 'trigonometry', syllables: ['trig', 'o', 'nom', 'e', 'try'] },
    ];
  }
  // Level 5 (Classes 11-12): 6-syllable academic & STEM lexicon
  return [
    { clue: 'Philosophical study of the nature and limits of knowledge', word: 'epistemology', syllables: ['e', 'pis', 'te', 'mol', 'o', 'gy'] },
    { clue: 'Peculiar or distinctive to a specific individual', word: 'idiosyncratic', syllables: ['id', 'i', 'o', 'syn', 'crat', 'ic'] },
    { clue: 'Formation of a word imitating the natural sound it names', word: 'onomatopoeia', syllables: ['on', 'o', 'mat', 'o', 'poe', 'ia'] },
    { clue: 'Having dissimilar or diverse constituent elements', word: 'heterogeneous', syllables: ['het', 'er', 'o', 'ge', 'ne', 'ous'] },
    { clue: 'Measurement of energy transfers in chemical or physical systems', word: 'calorimetry', syllables: ['cal', 'o', 'rim', 'e', 'try'] },
    { clue: 'Involving two or more distinct academic subjects simultaneously', word: 'multidisciplinary', syllables: ['mul', 'ti', 'dis', 'ci', 'pli', 'nar', 'y'] },
  ];
}

// #27 Syllable & Word Builder
export const SyllableWordBuilderGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const words = useMemo(() => buildSyllableBank(level as DifficultyLevel), [level]);
  const [idx, setIdx] = useState(0);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [hintMsg, setHintMsg] = useState<string | null>(null);
  const startRef = useRef(Date.now());

  const current = words[idx];
  const scrambled = useMemo(() => {
    const pairs = current.syllables.map((s, i) => ({ text: s, origIdx: i }));
    return [...pairs].sort((a, b) => {
      const ha = (a.text.charCodeAt(0) * 13 + idx * 7 + a.origIdx * 3) % 19;
      const hb = (b.text.charCodeAt(0) * 13 + idx * 7 + b.origIdx * 3) % 19;
      return ha - hb;
    });
  }, [current, idx]);

  useEffect(() => {
    onHudUpdate({
      progressText: `${idx + 1}/${words.length}`,
      score: Math.round((correctWords / words.length) * 100),
      errors,
    });
  }, [idx, words.length, correctWords, errors, onHudUpdate]);

  function handleTileClick(tileIdx: number) {
    if (pickedIndices.includes(tileIdx)) return;
    const nextPicked = [...pickedIndices, tileIdx];
    const assembled = nextPicked.map((i) => scrambled[i].text).join('');
    setPickedIndices(nextPicked);

    if (nextPicked.length === current.syllables.length) {
      const isRight = assembled === current.word;
      const nextCorrect = isRight ? correctWords + 1 : correctWords;
      const nextErrors = isRight ? errors : errors + 1;

      if (isRight) {
        playSuccessChime();
        setCorrectWords(nextCorrect);
        setHintMsg(`Built "${current.word}" cleanly!`);
      } else {
        playErrorCue();
        setErrors(nextErrors);
        setHintMsg(`Built "${assembled}" — expected "${current.word}".`);
      }

      if (idx + 1 >= words.length) {
        playVictoryFanfare();
        const total = words.length + nextErrors;
        const acc = Math.max(0, Math.min(100, Math.round((nextCorrect / total) * 100)));
        onFinish({
          accuracyPct: acc,
          completionTimeSec: Math.max(1, Math.round((Date.now() - startRef.current) / 1000)),
          reactionTimeMs: null,
          errorCount: nextErrors,
          scorePoints: acc,
          completed: true,
          summaryDetail: `Decoded ${nextCorrect}/${words.length} Level-${level} multi-syllable terms.`,
        });
      } else {
        setIdx(idx + 1);
        setPickedIndices([]);
      }
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-blue-900">
            {lang === 'hi' ? 'अर्थ संकेत:' : 'Word Meaning Clue:'}
          </p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">{current.clue}</p>
        </div>
        <button
          type="button"
          onClick={() => speakSafely(current.word)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-800 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 whitespace-nowrap shrink-0"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Pronounce Word
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
          {pickedIndices.length === 0 ? (
            <span className="text-xs text-slate-400">
              Tap the {current.syllables.length} syllable tiles below in order...
            </span>
          ) : (
            pickedIndices.map((ti, pos) => (
              <span
                key={`${ti}-${pos}`}
                className="rounded-md bg-blue-900 px-2.5 py-1 text-sm font-bold text-white"
              >
                {scrambled[ti].text}
              </span>
            ))
          )}
        </div>
        {pickedIndices.length > 0 && (
          <button
            type="button"
            onClick={() => setPickedIndices([])}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        {scrambled.map((tile, i) => {
          const used = pickedIndices.includes(i);
          return (
            <button
              key={`${tile.origIdx}-${tile.text}`}
              type="button"
              disabled={used}
              onClick={() => handleTileClick(i)}
              className={`min-h-11 rounded-xl border px-4 py-2.5 text-sm sm:text-base font-bold transition-colors ${
                used
                  ? 'border-slate-200 bg-slate-100 text-slate-400'
                  : 'border-slate-300 bg-white text-slate-900 hover:border-blue-900 hover:bg-blue-50'
              }`}
            >
              {tile.text}
            </button>
          );
        })}
      </div>

      {hintMsg && <p className="text-xs text-slate-600 text-center">{hintMsg}</p>}
    </div>
  );
};

// #28 Times Tables & Mental Arithmetic Sprint (Scales to 2-digit products, squares & Vieta roots)
export const TimesTablesSprintGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const questions = useMemo(() => buildTimesSprintBank(level as DifficultyLevel), [level]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const startRef = useRef(Date.now());
  const qStartRef = useRef(Date.now());
  const reactionsRef = useRef<number[]>([]);

  const current = questions[idx];

  useEffect(() => {
    onHudUpdate({
      progressText: `${idx + 1}/${questions.length}`,
      score: Math.round((correct / questions.length) * 100),
      errors,
    });
  }, [idx, questions.length, correct, errors, onHudUpdate]);

  function handleAnswer(val: number) {
    reactionsRef.current.push(Date.now() - qStartRef.current);
    const isRight = val === current.answer;
    const nextCorrect = isRight ? correct + 1 : correct;
    const nextErrors = isRight ? errors : errors + 1;

    if (isRight) {
      playSuccessChime();
      setCorrect(nextCorrect);
      setFeedback(`Correct: ${val}`);
    } else {
      playErrorCue();
      setErrors(nextErrors);
      setFeedback(`Expected ${current.answer}.`);
    }

    if (idx + 1 >= questions.length) {
      playVictoryFanfare();
      const acc = Math.round((nextCorrect / questions.length) * 100);
      const avgRt = Math.round(
        reactionsRef.current.reduce((a, b) => a + b, 0) / reactionsRef.current.length,
      );
      onFinish({
        accuracyPct: acc,
        completionTimeSec: Math.max(1, Math.round((Date.now() - startRef.current) / 1000)),
        reactionTimeMs: avgRt,
        errorCount: nextErrors,
        scorePoints: acc,
        completed: true,
        summaryDetail: `Solved ${nextCorrect}/${questions.length} Level-${level} mental computation prompts (avg ${avgRt}ms).`,
      });
    } else {
      setIdx(idx + 1);
      qStartRef.current = Date.now();
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-slate-900 px-6 py-6 text-center text-white space-y-1">
        <p className="text-xs font-medium text-slate-300">
          {level >= 4
            ? 'Mental Computation & Algebraic Identities'
            : lang === 'hi'
              ? 'सही पहाड़ा उत्तर चुनें'
              : 'Multiplication Table Prompt'}
        </p>
        <p className="font-mono text-2xl sm:text-3xl font-bold tabular-nums">{current.prompt}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {current.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleAnswer(opt)}
            className="min-h-14 rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-xl font-bold text-slate-900 tabular-nums hover:border-blue-900 hover:bg-blue-50 transition-colors"
          >
            {opt}
          </button>
        ))}
      </div>

      {feedback && (
        <p className="text-xs font-medium text-slate-600 text-center">{feedback}</p>
      )}
    </div>
  );
};

// #29 Table & Factor Grid (Up to 5x5 Modular / Divisor Selection at L4-5)
export const TableFactorGridGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const challenge = useMemo(() => buildFactorGridChallenge(level as DifficultyLevel), [level]);
  const targetCount = useMemo(
    () => challenge.cells.filter((n) => challenge.isMatch(n)).length,
    [challenge],
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    onHudUpdate({
      progressText: `${selected.length}/${targetCount} targets`,
      score: Math.round((selected.length / targetCount) * 100),
      errors,
    });
  }, [selected.length, targetCount, errors, onHudUpdate]);

  function handleCellClick(num: number) {
    if (selected.includes(num)) return;
    if (challenge.isMatch(num)) {
      playSuccessChime();
      const nextSel = [...selected, num];
      setSelected(nextSel);
      setStatus(`${num} satisfies the criterion.`);

      if (nextSel.length >= targetCount) {
        playVictoryFanfare();
        const totalClicks = nextSel.length + errors;
        const acc = Math.max(0, Math.min(100, Math.round((nextSel.length / totalClicks) * 100)));
        onFinish({
          accuracyPct: acc,
          completionTimeSec: Math.max(1, Math.round((Date.now() - startRef.current) / 1000)),
          reactionTimeMs: null,
          errorCount: errors,
          scorePoints: acc,
          completed: true,
          summaryDetail: `Identified all ${targetCount} matching integers cleanly in ${challenge.cells.length}-cell grid.`,
        });
      }
    } else {
      playErrorCue();
      setErrors((e) => e + 1);
      setStatus(`${num} does NOT satisfy the rule.`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-xs sm:text-sm font-bold text-slate-900">
          {lang === 'hi' ? challenge.ruleLabelHi : challenge.ruleLabelEn}
        </p>
        <span className="font-mono text-xs font-bold text-blue-900 tabular-nums shrink-0">
          {selected.length}/{targetCount} found
        </span>
      </div>

      <div className={`grid gap-2 ${challenge.cols === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {challenge.cells.map((num) => {
          const found = selected.includes(num);
          return (
            <button
              key={num}
              type="button"
              disabled={found}
              onClick={() => handleCellClick(num)}
              className={`min-h-12 rounded-xl border py-2.5 font-mono text-base sm:text-lg font-bold tabular-nums transition-colors ${
                found
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-blue-900 hover:bg-blue-50'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {status && <p className="text-xs font-medium text-slate-600 text-center">{status}</p>}
    </div>
  );
};
