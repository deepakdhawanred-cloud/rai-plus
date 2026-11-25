import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyBulkSalaryAdjustment,
  computeNetPayable,
  parseBulkPayrollPaste,
  summarizePayrollSheet,
  type EditablePayrollRow,
} from './bulkPayrollEngine.ts';
import {
  generateChapterVisualStudyPack,
  getChaptersForClassSubject,
} from './chapterVisualStudyEngine.ts';
import {
  aggregateChapterMasteryLeaderboard,
  buildChapterStudyGameDeck,
  computeChapterGameMastery,
  computeSubjectChampions,
  computeTimedQuizBonusXp,
  evaluateChapterMasteryBadges,
  normalizeLeaderboardSubject,
  type ChapterMasteryAttemptInput,
  type ChapterMasteryRecord,
} from './chapterStudyGameEngine.ts';
import {
  getPackageEntitlements,
  hasGoogleMapsAccess,
} from './subscriptionEntitlements.ts';

test('applyBulkSalaryAdjustment updates matching categories while protecting approved rows for accountants', () => {
  const rows: EditablePayrollRow[] = [
    {
      rowKey: 'r1',
      id: 'p1',
      monthLabel: 'November 2026',
      staffName: 'Sunita Sharma',
      staffRoleType: 'Teacher',
      designation: 'PGT Maths',
      daysWorked: 26,
      grossSalaryInr: 40000,
      deductionsInr: 2000,
      netPayableInr: 38000,
      status: 'submitted',
    },
    {
      rowKey: 'r2',
      id: 'p2',
      monthLabel: 'November 2026',
      staffName: 'Suresh Yadav',
      staffRoleType: 'Driver',
      designation: 'Bus Driver (BUS-02)',
      daysWorked: 26,
      grossSalaryInr: 20000,
      deductionsInr: 500,
      netPayableInr: 19500,
      status: 'submitted',
    },
    {
      rowKey: 'r3',
      id: 'p3',
      monthLabel: 'November 2026',
      staffName: 'Anil Verma',
      staffRoleType: 'Teacher',
      designation: 'TGT Science',
      daysWorked: 26,
      grossSalaryInr: 30000,
      deductionsInr: 1500,
      netPayableInr: 28500,
      status: 'approved',
    },
  ];

  // 10% increment for Teachers only (excluding approved)
  const incremented = applyBulkSalaryAdjustment(rows, {
    category: 'Teacher',
    mode: 'percent_gross',
    value: 10,
    includeApproved: false,
  });

  assert.equal(incremented[0].grossSalaryInr, 44000);
  assert.equal(incremented[0].netPayableInr, 42000);
  assert.equal(incremented[0].dirty, true);
  // Driver untouched
  assert.equal(incremented[1].grossSalaryInr, 20000);
  // Approved teacher untouched when includeApproved is false
  assert.equal(incremented[2].grossSalaryInr, 30000);

  // Flat +1500 for Drivers
  const driverBonus = applyBulkSalaryAdjustment(incremented, {
    category: 'Driver',
    mode: 'flat_gross',
    value: 1500,
  });
  assert.equal(driverBonus[1].grossSalaryInr, 21500);
  assert.equal(driverBonus[1].netPayableInr, 21000);

  // Uniform days worked across all (including approved for Principal)
  const daysUpdated = applyBulkSalaryAdjustment(driverBonus, {
    category: 'All',
    mode: 'set_days',
    value: 28,
    includeApproved: true,
  });
  assert.ok(daysUpdated.every((r) => r.daysWorked === 28));

  const summary = summarizePayrollSheet(daysUpdated);
  assert.equal(summary.totalStaff, 3);
  assert.equal(summary.totalNetInr, computeNetPayable(44000, 2000) + computeNetPayable(21500, 500) + computeNetPayable(30000, 1500));
});

test('parseBulkPayrollPaste parses Excel TSV, CSV with headers, and quick 2-column paste', () => {
  const tsvInput = [
    'Staff Name\tCategory\tDesignation\tDays Worked\tGross Salary\tDeductions',
    'Meena Kumari\tTeacher\tPRT Hindi\t26\t₹28,000\t1200',
    'Rajpal Singh\tDriver\tBus Driver BUS-01\t27\t19500\t500',
  ].join('\n');

  const parsedTsv = parseBulkPayrollPaste(tsvInput, 'December 2026');
  assert.equal(parsedTsv.rows.length, 2);
  assert.equal(parsedTsv.rows[0].staffName, 'Meena Kumari');
  assert.equal(parsedTsv.rows[0].grossSalaryInr, 28000);
  assert.equal(parsedTsv.rows[0].netPayableInr, 26800);
  assert.equal(parsedTsv.rows[1].staffRoleType, 'Driver');
  assert.equal(parsedTsv.rows[1].daysWorked, 27);

  const quickCsv = 'Deepak Sharma, 35000\nInvalidRow, 0';
  const parsedQuick = parseBulkPayrollPaste(quickCsv, 'December 2026');
  assert.equal(parsedQuick.rows.length, 1);
  assert.equal(parsedQuick.rows[0].grossSalaryInr, 35000);
  assert.equal(parsedQuick.warnings.length, 1);
});

test('buildChapterStudyGameDeck builds complete 4-stage chapter mastery deck across classes', () => {
  const class10MathsChapters = getChaptersForClassSubject(10, 'Mathematics');
  assert.ok(class10MathsChapters.length > 0);
  const pack = generateChapterVisualStudyPack(class10MathsChapters[0], 'HBSE');
  const deck = buildChapterStudyGameDeck(pack);

  assert.ok(deck.matchPairs.length >= 3, 'Should have concept match pairs');
  assert.ok(deck.sequenceCorrectOrder.length >= 3, 'Should have flowchart sequence steps');
  assert.equal(deck.sequenceScrambled.length, deck.sequenceCorrectOrder.length);
  assert.ok(deck.trapCards.length >= 4, 'Should include both solid concepts and exam traps');
  assert.ok(deck.trapCards.some((c) => c.isTrap), 'Must include exam traps');
  assert.ok(deck.trapCards.some((c) => !c.isTrap), 'Must include solid concepts');
  assert.ok(deck.blitzQuestions.length >= 4, 'Should have Boss Recall Blitz MCQs');

  for (const q of deck.blitzQuestions) {
    assert.equal(q.options.length, 4, `Question "${q.id}" must have 4 options`);
    assert.ok(
      q.correctIndex >= 0 && q.correctIndex < q.options.length,
      `Question "${q.id}" must have valid correctIndex`,
    );
  }

  // Also test Class 6 Science to ensure universal coverage
  const class6Sci = getChaptersForClassSubject(6, 'Science');
  const sciPack = generateChapterVisualStudyPack(class6Sci[0], 'CBSE');
  const sciDeck = buildChapterStudyGameDeck(sciPack);
  assert.ok(sciDeck.totalChallengeCount >= 14);
});

test('computeChapterGameMastery awards 1–3 stars and rewards mistake recovery', () => {
  const threeStar = computeChapterGameMastery({
    correctActions: 19,
    totalAttempts: 20,
    mistakesRecovered: 1,
    totalMistakes: 1,
  });
  assert.equal(threeStar.stars, 3);
  assert.ok(threeStar.masteryPct >= 88);

  const twoStar = computeChapterGameMastery({
    correctActions: 13,
    totalAttempts: 20,
    mistakesRecovered: 3,
    totalMistakes: 5,
  });
  assert.equal(twoStar.stars, 2);

  const oneStar = computeChapterGameMastery({
    correctActions: 8,
    totalAttempts: 20,
    mistakesRecovered: 0,
    totalMistakes: 6,
  });
  assert.equal(oneStar.stars, 1);
});

test('hasGoogleMapsAccess and getPackageEntitlements restrict Google Maps strictly to Premium packages', () => {
  assert.equal(hasGoogleMapsAccess('Starter ERP'), false);
  assert.equal(hasGoogleMapsAccess('Growth ERP'), false);
  assert.equal(hasGoogleMapsAccess(undefined), false);
  assert.equal(hasGoogleMapsAccess('Premium Campus'), true);
  assert.equal(hasGoogleMapsAccess('Enterprise 360°'), true);

  const standard = getPackageEntitlements('Growth ERP');
  assert.equal(standard.isPremium, false);
  assert.equal(standard.googleMapsEnabled, false);

  const premium = getPackageEntitlements('Premium Campus');
  assert.equal(premium.isPremium, true);
  assert.equal(premium.googleMapsEnabled, true);
});

test('computeTimedQuizBonusXp rewards fast accurate timed quiz finishes and returns 0 when untimed', () => {
  assert.equal(
    computeTimedQuizBonusXp({
      timedMode: false,
      timeRemainingSec: 60,
      timeLimitSec: 100,
      correctCount: 4,
    }),
    0,
  );

  const fastBonus = computeTimedQuizBonusXp({
    timedMode: true,
    timeRemainingSec: 75,
    timeLimitSec: 100,
    correctCount: 4,
  });
  const slowBonus = computeTimedQuizBonusXp({
    timedMode: true,
    timeRemainingSec: 10,
    timeLimitSec: 100,
    correctCount: 2,
  });
  assert.ok(fastBonus > slowBonus && fastBonus >= 120);
});

test('evaluateChapterMasteryBadges unlocks tiered badges accurately from student mastery records', () => {
  const records: ChapterMasteryRecord[] = [
    {
      chapterId: 'ch-1',
      chapterTitle: 'Real Numbers',
      subject: 'Mathematics',
      classNumber: 10,
      bestMasteryPct: 96,
      stars: 3,
      bestXp: 480,
      bestStreak: 6,
      timedBestPct: 100,
      fastestTimedRatio: 0.45,
      zeroTrapMistakeClears: 1,
      perfectRecoveryClears: 1,
      completedCount: 1,
      lastPlayedIso: '2026-11-20T09:00:00Z',
    },
    {
      chapterId: 'ch-2',
      chapterTitle: 'Chemical Reactions',
      subject: 'Science',
      classNumber: 10,
      bestMasteryPct: 92,
      stars: 3,
      bestXp: 440,
      bestStreak: 5,
      timedBestPct: 88,
      fastestTimedRatio: 0.55,
      zeroTrapMistakeClears: 1,
      perfectRecoveryClears: 0,
      completedCount: 1,
      lastPlayedIso: '2026-11-21T09:00:00Z',
    },
  ];

  const badges = evaluateChapterMasteryBadges(records);
  const byId = Object.fromEntries(badges.map((b) => [b.id, b]));
  assert.equal(byId.first_chapter.unlocked, true);
  assert.equal(byId.timed_quiz_ace.unlocked, true);
  assert.equal(byId.speed_scholar.unlocked, true);
  assert.equal(byId.combo_streaker.unlocked, true);
  assert.equal(byId.trap_hunter.unlocked, true);
  assert.equal(byId.perfect_scholar.unlocked, true);
  assert.equal(byId.recovery_hero.unlocked, true);
  assert.equal(byId.syllabus_champion.unlocked, false);
  assert.equal(byId.syllabus_champion.currentCount, 2);
});

test('aggregateChapterMasteryLeaderboard ranks students by best XP per chapter and supports filters', () => {
  const attempts: ChapterMasteryAttemptInput[] = [
    {
      userId: 'u-1',
      studentName: 'Diya Verma',
      classSection: '10-A',
      classNumber: 10,
      subject: 'Mathematics',
      chapterId: 'ch-1',
      xpEarned: 320,
      masteryPct: 80,
      accuracyPct: 78,
      bestStreak: 4,
      timedMode: true,
      badgesEarned: ['first_chapter'],
      completedAt: '2026-11-20T09:00:00Z',
    },
    // Repeat attempt on same chapter with higher XP should keep best XP (not double-count)
    {
      userId: 'u-1',
      studentName: 'Diya Verma',
      classSection: '10-A',
      classNumber: 10,
      subject: 'Mathematics',
      chapterId: 'ch-1',
      xpEarned: 460,
      masteryPct: 95,
      accuracyPct: 95,
      bestStreak: 7,
      timedMode: true,
      badgesEarned: ['first_chapter', 'timed_quiz_ace', 'perfect_scholar'],
      completedAt: '2026-11-21T09:00:00Z',
    },
    {
      userId: 'u-2',
      studentName: 'Kabir Mehta',
      classSection: '10-A',
      classNumber: 10,
      subject: 'Mathematics',
      chapterId: 'ch-1',
      xpEarned: 410,
      masteryPct: 90,
      accuracyPct: 88,
      bestStreak: 5,
      timedMode: true,
      badgesEarned: ['first_chapter', 'timed_quiz_ace'],
      completedAt: '2026-11-21T10:00:00Z',
    },
    {
      userId: 'u-3',
      studentName: 'Ananya Rao',
      classSection: '9-B',
      classNumber: 9,
      subject: 'Science',
      chapterId: 'ch-sci-1',
      xpEarned: 500,
      masteryPct: 92,
      accuracyPct: 90,
      bestStreak: 6,
      timedMode: true,
      badgesEarned: ['first_chapter', 'speed_scholar'],
      completedAt: '2026-11-21T11:00:00Z',
    },
  ];

  const allBoard = aggregateChapterMasteryLeaderboard({ attempts, currentUserId: 'u-1' });
  assert.equal(allBoard.length, 3);
  assert.equal(allBoard[0].studentName, 'Ananya Rao');
  assert.equal(allBoard[0].rank, 1);
  assert.equal(allBoard[1].studentName, 'Diya Verma');
  assert.equal(allBoard[1].totalXp, 460); // deduplicated best attempt for ch-1
  assert.equal(allBoard[1].chaptersMastered, 1);
  assert.equal(allBoard[1].isCurrentUser, true);

  const class10Board = aggregateChapterMasteryLeaderboard({
    attempts,
    classFilter: '10',
    subjectFilter: 'Mathematics',
    currentUserId: 'u-2',
  });
  assert.equal(class10Board.length, 2);
  assert.equal(class10Board[0].studentName, 'Diya Verma');
  assert.equal(class10Board[1].studentName, 'Kabir Mehta');
  assert.equal(class10Board[1].isCurrentUser, true);
});

test('computeSubjectChampions normalizes Maths/Mathematics and highlights studentId matches for Global Classroom', () => {
  assert.equal(normalizeLeaderboardSubject('Maths'), 'Mathematics');
  assert.equal(normalizeLeaderboardSubject('Mathematics'), 'Mathematics');
  assert.equal(normalizeLeaderboardSubject('Science'), 'Science');

  const attempts: ChapterMasteryAttemptInput[] = [
    {
      userId: 'stu-user-s1',
      studentId: 's1',
      studentName: 'Aarav Sharma',
      classSection: '8-A',
      classNumber: 8,
      subject: 'Maths',
      chapterId: 'qr-m-1',
      xpEarned: 380,
      masteryPct: 92,
      accuracyPct: 92,
      bestStreak: 6,
      timedMode: false,
      badgesEarned: ['quick-revise-3star'],
      completedAt: '2026-11-24T09:00:00Z',
    },
    {
      userId: 'u-live-student-s1',
      studentId: 's1',
      studentName: 'Aarav Sharma',
      classSection: '8-A',
      classNumber: 8,
      subject: 'Mathematics',
      chapterId: 'qr-m-2',
      xpEarned: 220,
      masteryPct: 88,
      accuracyPct: 88,
      bestStreak: 4,
      timedMode: false,
      badgesEarned: [],
      completedAt: '2026-11-24T10:00:00Z',
    },
    {
      userId: 'stu-user-s2',
      studentId: 's2',
      studentName: 'Meera Nair',
      classSection: '9-B',
      classNumber: 9,
      subject: 'Science',
      chapterId: 'qr-sci-1',
      xpEarned: 740,
      masteryPct: 96,
      accuracyPct: 95,
      bestStreak: 9,
      timedMode: true,
      badgesEarned: ['perfect_scholar'],
      completedAt: '2026-11-24T10:30:00Z',
    },
  ];

  const { availableSubjects, champions } = computeSubjectChampions({
    attempts,
    currentUserId: 'u-live-student-s1',
    currentStudentId: 's1',
  });

  assert.deepEqual(availableSubjects, ['Mathematics', 'Science']);
  assert.equal(champions.length, 2);
  assert.equal(champions[0].subject, 'Science');
  assert.equal(champions[0].topStudentName, 'Meera Nair');
  assert.equal(champions[0].topXp, 740);
  assert.equal(champions[1].subject, 'Mathematics');
  assert.equal(champions[1].topStudentName, 'Aarav Sharma');
  assert.equal(champions[1].topXp, 600); // merged Maths + Mathematics under same studentId
  assert.equal(champions[1].isCurrentUser, true);
});


