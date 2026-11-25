import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVisReportText, VIS_GOVERNANCE_NOTICE } from './visReportParser';

const SAMPLE_REPORT_TEXT = `
                                   VIS 6 ABHIRAJ  Page 1
     Dear VIS 6 ABHIRAJ
55.03%     44.97%     Left Brain Dominance
Page 17
Visual Learners learn best by seeing images.
28.34%
Auditory learners learn best by listening.
38.75%
Kinesthetic learners learn best by doing.
32.91%
Page 20
26.95% Intelligence Quotient, ( abbreviated as IQ )
22.31% Emotional Quotient, ( abbreviated as EQ )
25.59% Adversity Quotient, ( abbreviated as AQ )
   18.00%                                                                                   16.37%
   16.00%                                             15.01%       14.64%
   14.00%                                13.32%                                                          12.27%
   12.00%                   10.14%                                             10.58%
   10.00%       7.67%
                Inter        Visual    Kinesthetic    Musical       Intra      Logical     Language     Naturalist
Page 44
Primary    You would be highly adaptive     Secondary
ADAPTIVE                                    DECISIVE
MOTIVE LEADING      THOUGHT LEADING
47.54%              52.46%
Page 46
Action : It's your ability to plan and execute your goals.                                    18%
Thinking: It's your ability to apply logical thinking.                                          16%
Tactile : It's your ability to play with hand movements.                                        22%
Auditory : It's your ability to process listening mode.                                         25%
Vishual : It's your ability to see and visualize things.                                        19%
Task Oriented Leadership                                     Relationship Oriented
41%                        # 59%                               Leadership
`;

test('parseVisReportText accurately extracts Brain Dominance, VAK, Quotients, MI columns, Lobes, DISC, and Leadership', () => {
  const parsed = parseVisReportText(SAMPLE_REPORT_TEXT, {
    fileId: '12vdAGTc-69yUv0BDo3GMxIuTZ-Ku_G0a',
  });

  assert.equal(parsed.reportSubjectName, 'VIS 6 ABHIRAJ');
  assert.equal(parsed.brainDominance.leftPct, 55.03);
  assert.equal(parsed.brainDominance.rightPct, 44.97);

  assert.equal(parsed.vak.visualPct, 28.34);
  assert.equal(parsed.vak.auditoryPct, 38.75);
  assert.equal(parsed.vak.kinestheticPct, 32.91);
  assert.equal(parsed.vak.dominantStyle, 'Auditory');

  assert.equal(parsed.quotients.iq, 26.95);
  assert.equal(parsed.quotients.eq, 22.31);
  assert.equal(parsed.quotients.aq, 25.59);
  assert.equal(parsed.quotients.cq, 25.15);

  assert.equal(parsed.multipleIntelligences.interpersonal, 7.67);
  assert.equal(parsed.multipleIntelligences.visualSpatial, 10.14);
  assert.equal(parsed.multipleIntelligences.bodilyKinesthetic, 13.32);
  assert.equal(parsed.multipleIntelligences.musical, 15.01);
  assert.equal(parsed.multipleIntelligences.intrapersonal, 14.64);
  assert.equal(parsed.multipleIntelligences.logicalMathematical, 10.58);
  assert.equal(parsed.multipleIntelligences.verbalLinguistic, 16.37);
  assert.equal(parsed.multipleIntelligences.naturalist, 12.27);
  assert.equal(parsed.topIntelligences[0].label, 'Verbal-Linguistic');

  assert.equal(parsed.brainLobes.action, 18);
  assert.equal(parsed.brainLobes.thinking, 16);
  assert.equal(parsed.brainLobes.tactile, 22);
  assert.equal(parsed.brainLobes.auditory, 25);
  assert.equal(parsed.brainLobes.visual, 19);

  assert.equal(parsed.personality.primaryTrait, 'ADAPTIVE');
  assert.equal(parsed.personality.primaryBird, 'Dove');
  assert.equal(parsed.personality.secondaryTrait, 'DECISIVE');
  assert.equal(parsed.personality.secondaryBird, 'Eagle');

  assert.equal(parsed.motiveThought.motivePct, 47.54);
  assert.equal(parsed.motiveThought.thoughtPct, 52.46);
  assert.equal(parsed.leadership.taskOrientedPct, 41);
  assert.equal(parsed.leadership.relationshipOrientedPct, 59);
  assert.equal(parsed.advisorySummary.governanceNotice, VIS_GOVERNANCE_NOTICE);
});

test('parseVisReportText preserves missing metrics as null and never coerces them to 0', () => {
  const minimalText = `
    Dear VIS 1ST AITIK
    50.52% 49.48% Left Brain Dominance
    Visual Learners learn best here. 33.09%
    Auditory learners learn best here. 38.23%
    Kinesthetic learners learn best by doing. 28.69%
  `;
  const parsed = parseVisReportText(minimalText, {
    fileId: '1-TinxQhvwMwd-icAxIB2nJ1pIVC-s41W',
  });

  assert.equal(parsed.quotients.iq, null);
  assert.equal(parsed.quotients.eq, null);
  assert.equal(parsed.quotients.aq, null);
  assert.equal(parsed.quotients.cq, null);
  assert.equal(parsed.brainLobes.action, null);
  assert.equal(parsed.personality.primaryTrait, null);
  assert.equal(parsed.multipleIntelligences.logicalMathematical, null);
});
