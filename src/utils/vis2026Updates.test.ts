import test from 'node:test';
import assert from 'node:assert/strict';
import visUpdatedMarksRaw from '../data/visUpdatedMarks80AndUt.json' with { type: 'json' };
import {
  VIS_BELL_SCHEDULE_40MIN,
  VIS_SCHOOL_ID,
  VIS_SUBJECT_PLANNERS_2026,
  buildVisOfficialCalendarEntries,
  recalculatePeriodsForDuration,
} from '../data/visAcademicPlanners2026.ts';
import { createInitialAcademicCalendar } from './smartAcademicCalendarEngine.ts';
import { getDefaultBellScheduleForSchool } from './liveSchoolTimelineEngine.ts';
import {
  createInitialBusRoutesForSchool,
  getSchoolGeoAnchor,
  recommendRouteForLocality,
} from './transportEngine.ts';
import {
  classifyDmitFingerprintPotential,
  enrichVisDmitProfileWithFingerprint,
  parseVisReportText,
} from './visReportParser.ts';
import { filterAuthoritativeVis80AndUtMarks } from '../../server/visRosterBuilder.ts';

test('VIS 40-min period shift engine recalculates 30-min planner periods proportionally and populates VIS 2026-27 calendar', () => {
  assert.equal(recalculatePeriodsForDuration(36, 30, 40), 27);
  assert.equal(recalculatePeriodsForDuration(42, 30, 40), 32);
  assert.equal(recalculatePeriodsForDuration(900, 30, 40), 675);
  assert.equal(recalculatePeriodsForDuration(1344, 30, 40), 1008);

  const visBell = getDefaultBellScheduleForSchool(VIS_SCHOOL_ID);
  const periods = visBell.filter((s) => s.kind === 'period');
  assert.equal(periods.length, 7);
  assert.equal(visBell[1].startTime, '08:50');
  assert.equal(visBell[1].endTime, '09:30'); // 40 minutes
  assert.equal(VIS_BELL_SCHEDULE_40MIN.length, visBell.length);

  const cal = createInitialAcademicCalendar({
    schoolId: VIS_SCHOOL_ID,
    board: 'HBSE',
    session: '2026-27',
    mode: 'Hybrid',
  });
  const entries = buildVisOfficialCalendarEntries(VIS_SCHOOL_ID);
  assert.equal(cal.entries.length, entries.length);
  assert.ok(cal.entries.some((e) => e.title.includes('Summer Vacation') && e.date === '2026-05-25'));
  assert.ok(cal.entries.some((e) => e.title.includes('Dussehra Break') && e.date === '2026-10-18'));
  assert.ok(cal.entries.some((e) => e.title.includes('Diwali Break') && e.date === '2026-11-07'));
  assert.ok(cal.entries.some((e) => e.title.includes('Winter Break') && e.date === '2027-01-01'));
  assert.ok(cal.entries.some((e) => e.title.includes('Unit Test 1') && e.date === '2026-05-19'));
  assert.ok(cal.entries.some((e) => e.title.includes('Re-UT-1') && e.date === '2026-07-06'));
  assert.ok(cal.entries.some((e) => e.title.includes('Half-Yearly') && e.date === '2026-09-15'));
  assert.ok(cal.entries.some((e) => e.title.includes('Final / Annual') && e.date === '2027-03-09'));
  assert.ok(cal.entries.some((e) => e.title.includes('Syllabus Completion Deadline') && e.date === '2026-12-31'));
  assert.ok(VIS_SUBJECT_PLANNERS_2026.length >= 11);
  assert.ok(cal.curriculumPlans.length >= 50);
  assert.ok(cal.curriculumPlans.every((c) => c.chapterTitle.includes('40m')));
});

test('VIS Transport Routes reflect authentic Kapriwas / Rewari routes, drivers, and stops from Route.xlsx', () => {
  const anchor = getSchoolGeoAnchor(VIS_SCHOOL_ID);
  assert.match(anchor.label, /Kapriwas/i);

  const routes = createInitialBusRoutesForSchool(VIS_SCHOOL_ID);
  assert.equal(routes.length, 7);

  const byCode = new Map(routes.map((r) => [r.routeCode, r]));
  assert.equal(byCode.get('R-01')?.driverName, 'Rahul');
  assert.match(byCode.get('R-01')?.driverPhone || '', /98137\s*00934/);
  assert.equal(byCode.get('R-02')?.driverName, 'Sunil Yadav');
  assert.match(byCode.get('R-02')?.driverPhone || '', /82959\s*43878/);
  assert.equal(byCode.get('R-03')?.driverName, 'Yaspal');
  assert.match(byCode.get('R-03')?.driverPhone || '', /82958\s*57680/);
  assert.equal(byCode.get('R-04')?.driverName, 'Bir Singh');
  assert.match(byCode.get('R-04')?.driverPhone || '', /94679\s*31227/);
  assert.equal(byCode.get('R-05')?.driverName, 'Sunil Gujjar');
  assert.match(byCode.get('R-05')?.driverPhone || '', /95180\s*20049/);
  assert.ok(byCode.get('R-06')?.areasCovered.includes('Palasoli'));
  assert.ok(byCode.get('R-07')?.areasCovered.includes('Dharam Kanta'));
  assert.ok(byCode.get('R-07')?.areasCovered.includes('Mamta Medical'));

  const sidhRec = recommendRouteForLocality('Sidhrawali', 'Near Sidhrawali Mandir', routes, []);
  assert.equal(sidhRec?.routeCode, 'R-03');

  const mamtaRec = recommendRouteForLocality('Mamta Medical', 'Dharam Kanta road', routes, []);
  assert.equal(mamtaRec?.routeCode, 'R-07');
});

test('VIS updated marks dataset strictly includes ONLY /80 Theory marks and raw UT marks (zero /100 theory)', () => {
  const payload = visUpdatedMarksRaw as {
    students: Array<{ marks?: Array<{ subject: string; examName: string; maxMarks: number; obtainedMarks: number }> }>;
  };
  assert.ok(payload.students.length >= 250);

  let theory80Count = 0;
  let utCount = 0;
  for (const st of payload.students) {
    for (const m of st.marks || []) {
      assert.notEqual(m.maxMarks, 100, 'Must NEVER import /100 theory marks');
      if (m.examName === 'Half-Yearly Theory') {
        assert.equal(m.maxMarks, 80);
        theory80Count += 1;
      } else {
        assert.match(m.examName, /^Unit Test [1-4]$/);
        assert.ok(m.maxMarks <= 50);
        utCount += 1;
      }
    }
  }
  assert.ok(theory80Count > 900, `Expected >900 /80 Theory marks, got ${theory80Count}`);
  assert.ok(utCount > 2000, `Expected >2000 UT marks, got ${utCount}`);

  // Defensive filter guard verification
  const filtered = filterAuthoritativeVis80AndUtMarks([
    { subject: 'English', examName: 'Half-Yearly Theory', maxMarks: 100, obtainedMarks: 82 },
    { subject: 'Mathematics', examName: 'Half-Yearly Theory', maxMarks: 80, obtainedMarks: 68 },
    { subject: 'Science', examName: 'Unit Test 1', maxMarks: 40, obtainedMarks: 34 },
    { subject: 'Hindi', examName: 'Notebook', maxMarks: 5, obtainedMarks: 5 },
  ]);
  assert.equal(filtered.length, 2);
  assert.deepEqual(
    filtered.map((m) => `${m.subject}:${m.maxMarks}`),
    ['Mathematics:80', 'Science:40'],
  );
});

test('DMIT fingerprint classifier flags X, X1, X2, X2.1, X2.2 prints as Expandable Potential Reflective Learners needing 1-on-1 focus & guided pressure', () => {
  for (const code of ['x', 'x1', 'X2', 'x2.1', 'X2.2']) {
    const res = classifyDmitFingerprintPotential({ fingerprintCodes: [code] });
    assert.equal(res.hasExpandableXSeries, true, `Expected ${code} to trigger Expandable Potential`);
    assert.equal(res.potentialBand, 'Expandable Potential');
    assert.equal(res.learnerArchetype, 'Reflective Learner');
    assert.equal(res.requiresOneOnOneFocus, true);
    assert.equal(res.respondsToGuidedPressure, true);
    assert.match(res.coachingDirective, /1-on-1/i);
    assert.match(res.coachingDirective, /pressure/i);
  }

  const standard = classifyDmitFingerprintPotential({ fingerprintCodes: ['W1', 'U2', 'R1'] });
  assert.equal(standard.hasExpandableXSeries, false);
  assert.equal(standard.potentialBand, 'Standard Progressive Potential');
  assert.equal(standard.requiresOneOnOneFocus, false);

  const parsed = parseVisReportText(
    `
      Dear VIS 7 AARAV
      Fingerprint Pattern: X2.1, X2.2
      52.00% 48.00% Left Brain Dominance
      Visual Learners learn best by images. 38.00%
      Auditory learners learn best by sound. 32.00%
      Kinesthetic learners learn best by doing. 30.00%
    `,
    { fileId: 'test-x-series' },
  );
  assert.equal(parsed.fingerprintProfile?.hasExpandableXSeries, true);
  assert.deepEqual(parsed.fingerprintProfile?.matchedXPatterns, ['X2.1', 'X2.2']);
  assert.ok(parsed.advisorySummary.classroomSupport.some((s) => /1-on-1/i.test(s)));
  assert.ok(parsed.advisorySummary.studyTips.some((s) => /pressure/i.test(s)));

  const enriched = enrichVisDmitProfileWithFingerprint(parsed, { fingerprintCodes: ['X1'] });
  assert.equal(enriched.fingerprintProfile?.hasExpandableXSeries, true);
});
