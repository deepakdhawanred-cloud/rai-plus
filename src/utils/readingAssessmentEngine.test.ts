import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildPhoneticHint,
  computeFluencyBurstProfile,
  computeIncrementalSpokenWordTimestamps,
  computeLiveWpm,
  computeOverallReadingDiagnostic,
  computeReadingSpeedMetrics,
  evaluateSentenceTranslation,
  evaluateSpokenTranscriptAgainstPassage,
  getPassageForClassSection,
  resolveClassTierFromSection,
  scoreComprehensionAnswers,
  tokenizePassageText,
  wordSimilarity,
} from './readingAssessmentEngine.ts';

describe('readingAssessmentEngine', () => {
  it('resolves class tiers accurately from Class 1 through Class 12 sections', () => {
    assert.equal(resolveClassTierFromSection('1-A'), 'class_1_2');
    assert.equal(resolveClassTierFromSection('4-B'), 'class_3_5');
    assert.equal(resolveClassTierFromSection('7-A'), 'class_6_8');
    assert.equal(resolveClassTierFromSection('10-A'), 'class_9_10');
    assert.equal(resolveClassTierFromSection('11-Science'), 'class_11_12');
    assert.equal(getPassageForClassSection('10-A').tier, 'class_9_10');
  });

  it('computes live WPM and pronunciation alignment with mispronounced challenge words', () => {
    const passage = getPassageForClassSection('7-A');
    const tokens = tokenizePassageText(passage.text, passage.phoneticOverrides);
    const words = tokens.slice(0, 12).map((t) => t.normalized);
    // Replace 'photovoltaic' with a mispronounced form
    const pvIdx = words.indexOf('photovoltaic');
    assert.ok(pvIdx >= 0);
    words[pvIdx] = 'fotovoltik';

    const evalRes = evaluateSpokenTranscriptAgainstPassage({
      tokens,
      spokenTranscript: words.join(' '),
    });

    assert.ok(evalRes.matchedIndices.length >= 6);
    assert.ok(evalRes.pronunciationPct < 100);
    assert.ok(evalRes.mispronouncedWords.some((m) => m.expectedWord.toLowerCase() === 'photovoltaic'));
    assert.equal(computeLiveWpm(60, 30000), 120);
    assert.equal(wordSimilarity('evaporates', 'evaporates'), 1);
    assert.equal(buildPhoneticHint('afternoons'), 'af-ter-noons');
    assert.equal(buildPhoneticHint('environments'), 'en-vi-ron-ments');
  });

  it('distinguishes choppy 1-word reading from whole-sentence fluency bursts and tracks natural vs hesitation pauses', () => {
    const passage = getPassageForClassSection('1-A');
    const tokens = tokenizePassageText(passage.text, passage.phoneticOverrides);
    const firstSentenceTokens = tokens.filter((t) => t.sentenceIndex === 0);
    const secondSentenceTokens = tokens.filter((t) => t.sentenceIndex === 1);

    // Scenario A: 1 word at a time with 1200ms pauses (> 700ms threshold)
    const choppyEvents = firstSentenceTokens.map((tok, i) => ({
      wordIndex: tok.index,
      timestampMs: 1000 + i * 1200,
    }));
    const choppyProfile = computeFluencyBurstProfile({
      tokens,
      events: choppyEvents,
      pauseThresholdMs: 700,
    });
    assert.equal(choppyProfile.burstOneWordPct, 100);
    assert.equal(choppyProfile.dominantFluencyStyle, 'Word-by-Word (1 word/go)');
    assert.ok(choppyProfile.pauseMetrics.midSentenceHesitations >= 3);
    assert.equal(choppyProfile.pauseMetrics.prosodySummary, 'Frequent Mid-Sentence Hesitations');

    // Scenario B: Two sentences read fluently (240ms intra-sentence) with a natural 850ms breath pause at full stop
    const firstEndTs = 1000 + (firstSentenceTokens.length - 1) * 240;
    const fluentEvents = [
      ...firstSentenceTokens.map((tok, i) => ({
        wordIndex: tok.index,
        timestampMs: 1000 + i * 240,
      })),
      ...secondSentenceTokens.map((tok, i) => ({
        wordIndex: tok.index,
        timestampMs: firstEndTs + 850 + i * 240,
      })),
    ];
    const fluentProfile = computeFluencyBurstProfile({
      tokens,
      events: fluentEvents,
      pauseThresholdMs: 700,
    });
    assert.equal(fluentProfile.burstWholeSentencePct, 100);
    assert.equal(fluentProfile.dominantFluencyStyle, 'Whole-Sentence Fluent');
    assert.equal(fluentProfile.pauseMetrics.naturalBoundaryPauses, 1);
    assert.equal(fluentProfile.pauseMetrics.midSentenceHesitations, 0);
    assert.equal(fluentProfile.pauseMetrics.prosodySummary, 'Expressive & Natural Pacing');
  });

  it('preserves acoustic pause gaps across incremental SpeechRecognition frames and calculates Gross + Correct WPM', () => {
    const passage = getPassageForClassSection('4-A');
    const tokens = tokenizePassageText(passage.text, passage.phoneticOverrides);

    // First phrase of 4 words arrives smoothly
    const frame1 = computeIncrementalSpokenWordTimestamps({
      existingEvents: [],
      newlyMatchedIndices: [0, 1, 2, 3],
      nowMs: 2000,
      sessionStartMs: 1000,
      observedSilenceMs: 0,
      pauseThresholdMs: 800,
    });
    assert.equal(frame1.length, 4);

    // Next phrase arrives after a genuine 1400ms acoustic pause captured from the microphone
    const frame2 = computeIncrementalSpokenWordTimestamps({
      existingEvents: frame1,
      newlyMatchedIndices: [4, 5, 6],
      nowMs: 4200,
      sessionStartMs: 1000,
      observedSilenceMs: 1400,
      pauseThresholdMs: 800,
    });
    assert.equal(frame2.length, 7);

    const profile = computeFluencyBurstProfile({
      tokens,
      events: frame2,
      pauseThresholdMs: 800,
    });
    assert.equal(profile.bursts.length, 2);
    assert.equal(profile.pauseMetrics.midSentenceHesitations, 1);

    const speed = computeReadingSpeedMetrics({
      wordsRead: 20,
      mispronouncedCount: 2,
      elapsedMs: 15000,
      events: frame2,
      pauseThresholdMs: 800,
    });
    assert.equal(speed.grossWpm, 80);
    assert.equal(speed.correctWpm, 72);
    assert.ok(speed.totalPausedMs > 0);
    assert.ok(speed.activeSpeakingWpm >= speed.grossWpm);
  });

  it('evaluates comprehension MCQs and bilingual Devanagari / Hinglish sentence translations', () => {
    const passage = getPassageForClassSection('4-A');
    const answers: Record<string, number> = {};
    for (const q of passage.comprehensionQuestions) {
      answers[q.id] = q.correctIndex;
    }
    const comp = scoreComprehensionAnswers(passage.comprehensionQuestions, answers);
    assert.equal(comp.scorePct, 100);

    const hinglishEval = evaluateSentenceTranslation(
      passage.translationTask,
      'Jab garmiyon ka suraj gaanv ke talabon aur nadiyon ko garm karta hai tab paani dheere dheere bhaap ban jata hai.',
    );
    assert.equal(hinglishEval.scorePct, 100);

    const hindiDevanagariEval = evaluateSentenceTranslation(
      passage.translationTask,
      'जब सूरज तालाबों को गर्म करता है तो पानी भाप बनता है।',
    );
    assert.ok(hindiDevanagariEval.scorePct >= 75);

    const emptyEval = evaluateSentenceTranslation(passage.translationTask, 'ok');
    assert.equal(emptyEval.scorePct, 0);

    const diag = computeOverallReadingDiagnostic({
      pronunciationPct: 92,
      accuracyPct: 90,
      comprehensionPct: 100,
      translationPct: 100,
      avgBurstWords: 7.5,
      targetWpm: 85,
      wpm: 92,
    });
    assert.equal(diag.readingBand, 'Fluent');
    assert.ok(diag.overallPct >= 85);
  });
});
