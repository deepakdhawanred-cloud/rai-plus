import test from 'node:test';
import assert from 'node:assert/strict';
import type { MonthlyReadingReport, ReadingTestSession, StudentRecord } from '../types';
import {
  computeStudentPersonalBest,
  evaluateNewPersonalBestStatus,
} from './personalBestEngine';

function makeStudent(id = 'stu-1', classSection = '6-A'): StudentRecord {
  return {
    id,
    schoolId: 'school-vis-jjr',
    admissionNo: 'VIS-001',
    rollNo: '01',
    name: 'Aarav',
    classSection,
    guardianName: 'Guardian',
    guardianPhone: '+91 98000 00001',
    udiseStudentId: 'UDISE-1',
    haryanaMisId: 'MIS-1',
    house: 'Shakti',
    attendancePct: 92,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 40000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.2',
    confidentialCounsellorNote: '',
    responsibilities: [],
    achievements: [],
    documents: [],
  };
}

test('computeStudentPersonalBest handles empty reading history without fabricating scores', () => {
  const summary = computeStudentPersonalBest({
    student: makeStudent('stu-empty', '4-A'),
    readingTestSessions: [],
    readingReports: [],
  });
  assert.equal(summary.totalAttempts, 0);
  assert.equal(summary.bestWpm, null);
  assert.equal(summary.bestAccuracyPct, null);
  assert.equal(summary.classTargetWpm, 95);
});

test('computeStudentPersonalBest highlights peak WPM & accuracy across live tests and monthly reports without double-counting synced reports', () => {
  const reports: MonthlyReadingReport[] = [
    {
      id: 'mr-apr',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-1',
      month: 'April',
      year: 2026,
      wpm: 92,
      accuracyPct: 81,
      comprehensionPct: 80,
      overallPct: 82,
      readingBand: 'Proficient',
      remarks: 'Apr baseline',
      assessedBy: 'Teacher',
      assessedAt: '2026-04-18',
    },
    {
      id: 'mr-aug',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-1',
      month: 'August',
      year: 2026,
      wpm: 108,
      accuracyPct: 94,
      comprehensionPct: 90,
      overallPct: 92,
      readingBand: 'Fluent',
      remarks: 'Strong accuracy month',
      assessedBy: 'Teacher',
      assessedAt: '2026-08-18',
    },
    {
      // Mirrors the live November reading session (same month + wpm + accuracy)
      id: 'mr-nov-sync',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-1',
      month: 'November',
      year: 2026,
      wpm: 118,
      accuracyPct: 91,
      comprehensionPct: 88,
      overallPct: 91,
      readingBand: 'Fluent',
      remarks: 'Synced from live test',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-16',
    },
  ];

  const liveSessions: ReadingTestSession[] = [
    {
      id: 'rts-nov',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-1',
      month: 'November',
      year: 2026,
      passageId: 'p-1',
      passageTitle: 'Solar Energy in Haryana Villages',
      classTier: 'class_6_8',
      captureMode: 'microphone',
      wordsRead: 68,
      totalPassageWords: 70,
      elapsedSeconds: 35,
      wpm: 118,
      pronunciationPct: 91,
      accuracyPct: 91,
      avgBurstWords: 5.4,
      maxBurstWords: 12,
      burstOneWordPct: 5,
      burstTwoWordsPct: 10,
      burstThreePlusPct: 45,
      burstWholeSentencePct: 40,
      dominantFluencyStyle: 'Phrase Reader (3+ words/go)',
      comprehensionPct: 90,
      translationPct: 86,
      overallPct: 91,
      readingBand: 'Fluent',
      mispronouncedWords: [],
      translationPrompt: 'Solar panels store clean energy.',
      studentTranslation: 'सौर पैनल स्वच्छ ऊर्जा संग्रहित करते हैं।',
      assessedBy: 'Aarav (student)',
      assessedAt: '2026-11-16',
    },
  ];

  const summary = computeStudentPersonalBest({
    student: makeStudent('stu-1', '6-A'),
    readingTestSessions: liveSessions,
    readingReports: reports,
  });

  // Deduplicated synced monthly row => 3 unique attempts (Apr, Aug, Nov live)
  assert.equal(summary.totalAttempts, 3);
  assert.equal(summary.liveTestCount, 1);
  assert.equal(summary.bestWpm, 118);
  assert.equal(summary.bestWpmSource, 'live_test');
  assert.equal(summary.bestAccuracyPct, 94);
  assert.equal(summary.bestAccuracySource, 'monthly_report');
  assert.equal(summary.latestSetNewWpmBest, true);
  assert.equal(summary.latestSetNewAccuracyBest, false);
  assert.equal(summary.wpmGapToBest, 0);
  assert.equal(summary.accuracyGapToBest, -3);
  assert.equal(summary.streakImprovingCount, 2);
});

test('evaluateNewPersonalBestStatus accurately detects new WPM and Accuracy records', () => {
  const reports: MonthlyReadingReport[] = [
    {
      id: 'mr-1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-2',
      month: 'October',
      year: 2026,
      wpm: 102,
      accuracyPct: 88,
      comprehensionPct: 84,
      overallPct: 87,
      readingBand: 'Proficient',
      remarks: 'Oct',
      assessedBy: 'Teacher',
      assessedAt: '2026-10-18',
    },
  ];

  const status = evaluateNewPersonalBestStatus({
    student: makeStudent('stu-2', '6-A'),
    existingSessions: [],
    existingReports: reports,
    candidateWpm: 112,
    candidateAccuracyPct: 86,
  });

  assert.equal(status.beatWpm, true);
  assert.equal(status.beatAccuracy, false);
  assert.equal(status.priorBestWpm, 102);
  assert.equal(status.priorBestAccuracy, 88);
});
