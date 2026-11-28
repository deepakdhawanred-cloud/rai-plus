import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  computeSchoolAnnualQuote,
  createDefaultCommercialPricingRegistry,
} from './commercialPricingRegistry.ts';
import {
  SSB_ACADEMY_ETHICAL_DISCLAIMER,
  analyzeSsbResponse,
  buildSsbOlqProfile,
  generateInitialSsbPracticeSets,
} from './ssbAcademyEngine.ts';
import {
  CAREER_INTELLIGENCE_ETHICAL_DISCLAIMER,
  STAGE1_CAPACITY_QUESTIONS,
  VERIFIED_BUDGET_BYPASS_PATHWAYS,
  VERIFIED_CAREER_MARKET_CATALOG,
  buildStage5CompetitionAndRoadmap,
  evaluateStage1Capacity,
  evaluateStage2Personality,
  evaluateStage3Budget,
  matchStage4MarketOpportunities,
} from './careerFiveStageEngine.ts';
import type { SsbAssessmentSessionRecord } from '../types/flagshipProducts';

describe('Rai Plus Flagship Products — 30-Criteria Verification Suite', () => {
  it('generates exactly 100 complete SSB practice sets with 60 unique words per WAT set and 60 unique situations per SRT set', () => {
    const sets = generateInitialSsbPracticeSets();
    assert.equal(sets.length, 100);

    const byFormat = {
      WAT: sets.filter((s) => s.format === 'WAT'),
      SRT: sets.filter((s) => s.format === 'SRT'),
      TAT: sets.filter((s) => s.format === 'TAT'),
      PPDT: sets.filter((s) => s.format === 'PPDT'),
    };
    assert.equal(byFormat.WAT.length, 25);
    assert.equal(byFormat.SRT.length, 25);
    assert.equal(byFormat.TAT.length, 25);
    assert.equal(byFormat.PPDT.length, 25);

    // Every single WAT set has exact 60 unique words (no duplicates inside any set!) and 15 min duration
    for (const watSet of byFormat.WAT) {
      assert.equal(watSet.stimuli.length, 60, `Expected 60 words in ${watSet.code}, got ${watSet.stimuli.length}`);
      assert.equal(watSet.estimatedMinutes, 15);
      const uniqueInSet = new Set(watSet.stimuli.map((st) => st.prompt.trim().toLowerCase()));
      assert.equal(uniqueInSet.size, 60, `Duplicate words detected inside ${watSet.code}`);
    }
    const allUniqueWatWords = new Set(
      byFormat.WAT.flatMap((s) => s.stimuli.map((st) => st.prompt.trim().toLowerCase())),
    );
    assert.ok(allUniqueWatWords.size >= 115, `Expected >=115 unique WAT words overall, got ${allUniqueWatWords.size}`);

    // Every single SRT set has exact 60 unique situations (no duplicates inside any set!) and 30 min duration
    for (const srtSet of byFormat.SRT) {
      assert.equal(srtSet.stimuli.length, 60, `Expected 60 situations in ${srtSet.code}, got ${srtSet.stimuli.length}`);
      assert.equal(srtSet.estimatedMinutes, 30);
      const uniqueInSet = new Set(srtSet.stimuli.map((st) => st.prompt.trim().toLowerCase()));
      assert.equal(uniqueInSet.size, 60, `Duplicate situations detected inside ${srtSet.code}`);
    }
    const allUniqueSrts = new Set(
      byFormat.SRT.flatMap((s) => s.stimuli.map((st) => st.prompt.trim().toLowerCase())),
    );
    assert.ok(allUniqueSrts.size >= 115, `Expected >=115 unique SRT situations overall, got ${allUniqueSrts.size}`);

    // TAT and PPDT have 100 unique prompts across their 25 sets
    for (const fmt of ['TAT', 'PPDT'] as const) {
      const prompts = byFormat[fmt].flatMap((s) => s.stimuli.map((st) => st.prompt.trim().toLowerCase()));
      assert.ok(prompts.length >= 100, `Expected >=100 stimuli for ${fmt}, got ${prompts.length}`);
      assert.equal(new Set(prompts).size, prompts.length, `Duplicate stimuli detected in ${fmt}`);
    }

    // Hostinger Express deployment guard: root server.js must exist with exact capitalization
    assert.equal(fs.existsSync(path.resolve(process.cwd(), 'server.js')), true);

    // Public pricing hygiene guard: old monthly ERP pricing must NEVER appear on public website files
    for (const rel of [
      'src/components/PublicMarketingEnhancements.tsx',
      'src/components/PublicPortal.tsx',
      'src/components/public/FlagshipPublicPages.tsx',
    ]) {
      const content = fs.readFileSync(path.resolve(process.cwd(), rel), 'utf8');
      assert.equal(/Starter ERP|4,999|8,999|14,999|22,999/.test(content), false, `Old pricing found in ${rel}`);
    }

    const freeDemos = sets.filter((s) => s.isFreeDemo);
    assert.ok(freeDemos.length >= 4);
    assert.equal(new Set(freeDemos.map((s) => s.format)).size, 4);
  });

  it('SRT bank spans all 12 required categories and PPDT plates include GD perspectives', () => {
    const sets = generateInitialSsbPracticeSets();
    const srtCategories = new Set(
      sets.filter((s) => s.format === 'SRT').flatMap((s) => s.stimuli.map((st) => st.category)),
    );
    assert.ok(srtCategories.size >= 12);

    const ppdtStimuli = sets.filter((s) => s.format === 'PPDT').flatMap((s) => s.stimuli);
    assert.equal(
      ppdtStimuli.every((st) => Array.isArray(st.gdPerspectives) && st.gdPerspectives.length >= 3),
      true,
    );
  });

  it('detects memorized clichés vs authentic practical responses in SSB AI evaluator', () => {
    const sets = generateInitialSsbPracticeSets();
    const watStim = sets.find((s) => s.format === 'WAT')!.stimuli[0];

    const clicheEval = analyzeSsbResponse({
      stimulus: watStim,
      responseText: 'I always serve the nation and positive thinking solves everything.',
      timeTakenSeconds: 4,
    });
    assert.equal(clicheEval.authenticityFlag, 'Cliche / Memorized Warning');

    const authenticEval = analyzeSsbResponse({
      stimulus: watStim,
      responseText: `Calm planning around ${watStim.prompt.toLowerCase()} helps a team resolve challenges step by step.`,
      timeTakenSeconds: 11,
    });
    assert.equal(authenticEval.authenticityFlag, 'Authentic & Coherent');
    assert.ok(authenticEval.practicalityScore > clicheEval.practicalityScore);
    assert.ok(authenticEval.positives.length > 0);
    assert.ok(authenticEval.alternativeApproach.length > 10);
  });

  it('enforces multi-evidence corroboration (>=2 signals) before scoring any of the 15 OLQs and includes ethical disclaimer', () => {
    const sets = generateInitialSsbPracticeSets();
    const watSet = sets.find((s) => s.format === 'WAT')!;
    const srtSet = sets.find((s) => s.format === 'SRT')!;

    const singleEval = analyzeSsbResponse({
      stimulus: watSet.stimuli[0],
      responseText: `Disciplined effort around ${watSet.stimuli[0].prompt.toLowerCase()} brings steady results.`,
      timeTakenSeconds: 10,
    });
    const oneSession: SsbAssessmentSessionRecord = {
      id: 'sess-1',
      userId: 'u1',
      setId: watSet.id,
      setCode: watSet.code,
      setTitle: watSet.title,
      format: 'WAT',
      mode: 'timed',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      totalDurationSeconds: 15,
      responses: [singleEval],
      overallPracticality: singleEval.practicalityScore,
      overallClarity: singleEval.clarityScore,
    };

    const singleProfile = buildSsbOlqProfile({ sessions: [oneSession], sets });
    assert.equal(singleProfile.indicators.length, 15);
    const singleEvidence = singleProfile.indicators.filter((i) => i.evidenceCount === 1);
    assert.equal(
      singleEvidence.every((i) => i.score === null && i.developmentLevel === 'Insufficient Evidence'),
      true,
    );

    const srtResponses = srtSet.stimuli.map((st) =>
      analyzeSsbResponse({
        stimulus: st,
        responseText:
          'Assessed immediate priorities, coordinated teammates calmly, took practical responsibility, and ensured safety.',
        timeTakenSeconds: 22,
      }),
    );
    const secondSession: SsbAssessmentSessionRecord = {
      id: 'sess-2',
      userId: 'u1',
      setId: srtSet.id,
      setCode: srtSet.code,
      setTitle: srtSet.title,
      format: 'SRT',
      mode: 'timed',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      totalDurationSeconds: 100,
      responses: srtResponses,
      overallPracticality: 80,
      overallClarity: 80,
    };
    const multiProfile = buildSsbOlqProfile({ sessions: [oneSession, secondSession], sets });
    assert.equal(
      multiProfile.indicators.some((i) => i.score !== null && i.evidenceCount >= 2),
      true,
    );
    assert.ok(multiProfile.weeklyPlan.length >= 5);
    assert.ok(SSB_ACADEMY_ETHICAL_DISCLAIMER.toLowerCase().includes('not an official'));
  });

  it('executes all 5 Free Career Intelligence stages end-to-end with Budget Bypass, India+Global Market & 12-Month Roadmap', () => {
    assert.ok(STAGE1_CAPACITY_QUESTIONS.length >= 12);
    const answers: Record<string, number> = {};
    STAGE1_CAPACITY_QUESTIONS.forEach((q) => {
      answers[q.id] = q.options[0].score;
    });
    const stage1 = evaluateStage1Capacity(answers);
    assert.ok(stage1.iq.overallPct > 0);
    assert.ok(stage1.eq.overallPct > 0);
    assert.ok(stage1.aq.overallPct > 0);
    assert.ok(stage1.cq.overallPct > 0);
    assert.equal(Object.keys(stage1.iq.subdomains).length, 6);

    const stage2 = evaluateStage2Personality({
      extroversion: 3,
      leadershipDrive: 4,
      independence: 5,
      teamOrientation: 4,
      structurePreference: 3,
      riskTolerance: 4,
      creativityDrive: 5,
      routineTolerance: 2,
      competitiveDrive: 4,
      pressureComposure: 4,
      communicationStyle: 'Analytical & Written',
      learningEnvironment: 'Hands-on Labs & Field',
      happinessDriver: 'Solving hard engineering problems',
      topMotivation: 'Mastery & Innovation',
    });
    assert.ok(stage2.preferredEnvironments.length >= 3);
    assert.ok(stage2.challengingEnvironments.length >= 2);

    const stage3 = evaluateStage3Budget({
      currentEducation: 'Class 12',
      annualFamilyEducationBudgetInr: 25000,
      availableSavingsInr: 15000,
      locationCityState: 'Jhajjar, Haryana',
      willingToRelocate: true,
      willingToWorkWhileStudying: true,
      preparationYearsAvailable: 3,
      categoryOrMeritScholarshipInterest: true,
    });
    assert.equal(stage3.capacityTier, 'Very Limited');
    assert.equal(stage3.pathwayComparisons.length, 5);
    assert.ok(stage3.bypassPathways.length >= 8);
    assert.equal(
      VERIFIED_BUDGET_BYPASS_PATHWAYS.every(
        (b) => b.officialUrl.startsWith('https://') && b.verifiedDate.length >= 7,
      ),
      true,
    );

    assert.ok(VERIFIED_CAREER_MARKET_CATALOG.length >= 8);
    assert.equal(
      VERIFIED_CAREER_MARKET_CATALOG.every(
        (c) => c.sourceName.length > 3 && c.sourceDate.length >= 4 && c.licensingOrVisaNotes.length > 5,
      ),
      true,
    );
    const stage4All = matchStage4MarketOpportunities({
      capacity: stage1,
      personality: stage2,
      budget: stage3,
      scopeFilter: 'All',
    });
    const stage4Intl = matchStage4MarketOpportunities({
      capacity: stage1,
      personality: stage2,
      budget: stage3,
      scopeFilter: 'International',
    });
    assert.ok(stage4All.length >= 6);
    assert.ok(stage4Intl.length >= 3);

    const stage5 = buildStage5CompetitionAndRoadmap({
      career: stage4All[0].opportunity,
      capacity: stage1,
      budget: stage3,
    });
    assert.deepEqual(
      stage5.milestones.map((m) => m.horizon),
      ['TODAY', 'NEXT 7 DAYS', 'NEXT 30 DAYS', 'NEXT 90 DAYS', 'NEXT 6 MONTHS', 'NEXT 12 MONTHS'],
    );
    assert.ok(stage5.measurableCompetitionFacts.length > 0);
    assert.ok(stage5.qualitativeMarketAssessment.length > 0);
    assert.ok(CAREER_INTELLIGENCE_ETHICAL_DISCLAIMER.toLowerCase().includes('not a guarantee'));
  });

  it('enforces 2026-27 School Packages, unpriced-by-default SSB enquiry mode, and permanently ₹0 Career Intelligence', () => {
    const registry = createDefaultCommercialPricingRegistry();
    assert.deepEqual(
      registry.schoolPackages.map((p) => p.annualPerStudentInr),
      [199, 399, 699, 999],
    );
    assert.ok(registry.standaloneModules.length >= 10);

    // Commercial honesty invariant: never invent unapproved SSB prices by default
    assert.equal(registry.ssbAcademy.priceStatus, 'enquiry_only');
    assert.equal(registry.ssbAcademy.monthlyInr, null);
    assert.equal(registry.ssbAcademy.annualInr, null);

    // Career Intelligence invariant: permanently FREE ₹0
    assert.equal(registry.careerIntelligence.priceInr, 0);

    const quote = computeSchoolAnnualQuote({
      registry,
      packageId: 'intelligence',
      studentsCount: 500,
      classesCount: 15,
      includeTopLearnerRewards: true,
      includeManagedCampus: false,
    });
    assert.equal(quote.softwareSubtotalInr, 500 * 699);
    assert.ok(quote.rewardsProvisionInr > 0);
    assert.equal(quote.gstInr, Math.round((quote.preGstTotalInr * 18) / 100));
    assert.equal(quote.grandTotalInr, quote.preGstTotalInr + quote.gstInr);
  });
});
