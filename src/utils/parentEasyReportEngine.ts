import type {
  AttendanceRecord,
  ComputerSkillAttempt,
  ExamMark,
  HomeworkAssignment,
  HomeworkSubmission,
  LearnersScoreBreakdown,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  NotebookEntry,
  StudentRecord,
  ThinkingAssessmentSession,
} from '../types';
import type { VcipAttemptRecord } from '../types/vcip';
import type { ParentLang } from './parentTranslations';

export type EasyStatusLevel = 'great' | 'good' | 'practice';

export interface EasySkillItem {
  id: 'reading' | 'math' | 'computer' | 'thinking';
  title: string;
  level: EasyStatusLevel;
  statusLabel: string;
  headlineStat: string;
  plainExplanation: string;
  homeTip: string;
}

export interface ParentEasyChildSummary {
  student: StudentRecord;
  overallLevel: EasyStatusLevel;
  overallHeadline: string;
  overallSummarySentence: string;
  attendance: {
    level: EasyStatusLevel;
    todayStatusLabel: string;
    attendancePct: number;
    plainNote: string;
  };
  homeworkAndNotebooks: {
    level: EasyStatusLevel;
    pendingHomeworkCount: number;
    notebookAttentionCount: number;
    headline: string;
    plainItems: string[];
  };
  skills: EasySkillItem[];
  characterStrengths: {
    topStrengths: string[];
    focusHabit: string;
  };
  fees: {
    isCleared: boolean;
    balanceInr: number;
    annualInr: number;
    statusLabel: string;
    plainNote: string;
  };
  attentionCount: number;
}

export interface ParentEasyFamilyOverview {
  childCount: number;
  children: ParentEasyChildSummary[];
  totalFeeDueInr: number;
  totalAttentionItems: number;
  familyHeadline: string;
}

function levelLabel(level: EasyStatusLevel, lang: ParentLang): string {
  if (lang === 'hi') {
    if (level === 'great') return 'बहुत अच्छा';
    if (level === 'good') return 'अच्छी प्रगति';
    return 'अभ्यास ज़रूरी';
  }
  if (level === 'great') return 'Doing Great';
  if (level === 'good') return 'Growing Well';
  return 'Needs Extra Practice';
}

function scoreToLevel(score: number | null, greatAt = 80, goodAt = 65): EasyStatusLevel {
  if (score === null) return 'good';
  if (score >= greatAt) return 'great';
  if (score >= goodAt) return 'good';
  return 'practice';
}

export function buildParentEasyChildSummary(params: {
  student: StudentRecord;
  lang: ParentLang;
  breakdown?: LearnersScoreBreakdown | null;
  attendanceRecords?: AttendanceRecord[];
  homeworkAssignments?: HomeworkAssignment[];
  homeworkSubmissions?: HomeworkSubmission[];
  notebookEntries?: NotebookEntry[];
  readingReports?: MonthlyReadingReport[];
  numeracyReports?: MonthlyNumeracyReport[];
  computerSkillAttempts?: ComputerSkillAttempt[];
  thinkingAssessments?: ThinkingAssessmentSession[];
  vcipAttempts?: VcipAttemptRecord[];
  examMarks?: ExamMark[];
}): ParentEasyChildSummary {
  const {
    student,
    lang,
    attendanceRecords = [],
    homeworkAssignments = [],
    homeworkSubmissions = [],
    notebookEntries = [],
    readingReports = [],
    numeracyReports = [],
    computerSkillAttempts = [],
    thinkingAssessments = [],
    vcipAttempts = [],
    examMarks = [],
  } = params;

  const isHi = lang === 'hi';

  // 1. Attendance in simple words
  const stuAttendance = attendanceRecords
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const latestAtt = stuAttendance[0];
  const attLevel: EasyStatusLevel =
    student.attendancePct >= 90
      ? 'great'
      : student.attendancePct >= 78
        ? 'good'
        : 'practice';

  const todayStatusLabel = latestAtt
    ? latestAtt.status === 'Present'
      ? isHi
        ? 'आज स्कूल में उपस्थित'
        : 'Present in School'
      : latestAtt.status === 'Leave'
        ? isHi
          ? 'आज अवकाश पर हैं'
          : 'On Approved Leave'
        : isHi
          ? 'आज अनुपस्थित रहे'
          : 'Absent Today'
    : isHi
      ? 'नियमित उपस्थिति'
      : 'Regular Attendance';

  const attPlainNote =
    attLevel === 'great'
      ? isHi
        ? `${student.attendancePct}% उपस्थिति — नियमित स्कूल आना बहुत अच्छी आदत है।`
        : `${student.attendancePct}% attendance — coming to school regularly is helping ${student.name} learn steadily.`
      : attLevel === 'good'
        ? isHi
          ? `${student.attendancePct}% उपस्थिति — अच्छी है, कृपया 90% से ऊपर बनाए रखें।`
          : `${student.attendancePct}% attendance — steady, try to keep it above 90%.`
        : isHi
          ? `${student.attendancePct}% उपस्थिति — ज़्यादा छुट्टियों से पढ़ाई छूटती है, नियमित भेजें।`
          : `${student.attendancePct}% attendance — missed days make classwork harder to catch up.`;

  // 2. Homework & Notebooks in simple words
  const classHw = homeworkAssignments.filter(
    (h) => h.classSection === student.classSection,
  );
  const stuSubs = homeworkSubmissions.filter((s) => s.studentId === student.id);
  const completedIds = new Set(
    stuSubs.filter((s) => s.status !== 'Pending').map((s) => s.assignmentId),
  );
  const pendingHw = classHw.filter((h) => !completedIds.has(h.id));

  const stuNotebooks = notebookEntries.filter((n) => n.studentId === student.id);
  const weakNotebooks = stuNotebooks.filter((n) => n.workQuality === 'C');

  const hwLevel: EasyStatusLevel =
    pendingHw.length === 0 && weakNotebooks.length === 0
      ? 'great'
      : pendingHw.length <= 1 && weakNotebooks.length <= 1
        ? 'good'
        : 'practice';

  const plainItems: string[] = [];
  for (const hw of pendingHw.slice(0, 2)) {
    plainItems.push(
      isHi
        ? `होमवर्क बाकी: ${hw.subject} — ${hw.title}`
        : `Homework due: ${hw.subject} — ${hw.title}`,
    );
  }
  for (const nb of weakNotebooks.slice(0, 2)) {
    plainItems.push(
      isHi
        ? `${nb.subject} कॉपी अधूरी या सुधार की ज़रूरत है`
        : `${nb.subject} notebook needs neat completion at home`,
    );
  }
  if (plainItems.length === 0) {
    plainItems.push(
      isHi
        ? 'सभी कॉपियाँ और होमवर्क समय पर पूरे हैं।'
        : 'All homework and class notebooks are up to date.',
    );
  }

  const hwHeadline =
    hwLevel === 'great'
      ? isHi
        ? 'होमवर्क और कॉपियाँ बिल्कुल ठीक हैं'
        : 'Homework & Notebooks All Clear'
      : isHi
        ? `${pendingHw.length} होमवर्क बाकी · ${weakNotebooks.length} कॉपी पर ध्यान दें`
        : `${pendingHw.length} homework due · ${weakNotebooks.length} notebook check(s)`;

  // 3. Skills in plain language (Reading, Math/Tables, Computer, Thinking/Brain)
  const stuReading = readingReports.filter((r) => r.studentId === student.id);
  const latestReading = stuReading[stuReading.length - 1] || null;
  const readingAvg = latestReading ? Math.round(latestReading.overallPct) : null;
  const readingLevel = scoreToLevel(readingAvg, 80, 65);

  const stuNumeracy = numeracyReports.filter((n) => n.studentId === student.id);
  const latestNum = stuNumeracy[stuNumeracy.length - 1] || null;
  const numAvg = latestNum ? Math.round(latestNum.overallPct) : null;
  const numLevel = scoreToLevel(numAvg, 80, 65);

  const stuComp = computerSkillAttempts.filter((c) => c.studentId === student.id);
  const latestComp = stuComp[stuComp.length - 1] || null;
  const compLevel = scoreToLevel(latestComp?.overallScore ?? null, 80, 65);

  const stuThink = thinkingAssessments.filter((t) => t.studentId === student.id);
  const stuVcip = vcipAttempts.filter((v) => v.studentId === student.id);
  const latestThinkPct =
    stuThink.length > 0
      ? Math.round(
          (stuThink[stuThink.length - 1].dimensionScores.betterThinking +
            stuThink[stuThink.length - 1].dimensionScores.positiveThinking) /
            2,
        )
      : stuVcip.length > 0
        ? Math.round(
            stuVcip.reduce((acc, item) => acc + item.developmentalScore, 0) /
              stuVcip.length,
          )
        : null;
  const thinkLevel = scoreToLevel(latestThinkPct, 78, 62);

  const skills: EasySkillItem[] = [
    {
      id: 'reading',
      title: isHi ? 'पढ़ना और समझना (Reading)' : 'Reading & Understanding',
      level: readingLevel,
      statusLabel: levelLabel(readingLevel, lang),
      headlineStat: latestReading
        ? isHi
          ? `${latestReading.wpm} शब्द/मिनट · ${readingAvg}% समझ`
          : `${latestReading.wpm} words/min · ${readingAvg}% accuracy`
        : isHi
          ? 'जल्द ही जाँच होगी'
          : 'Reading check upcoming',
      plainExplanation:
        readingLevel === 'great'
          ? isHi
            ? `${student.name} साफ़ और आत्मविश्वास के साथ पढ़ते हैं।`
            : `${student.name} reads smoothly and understands the story well.`
          : readingLevel === 'good'
            ? isHi
              ? 'पढ़ाई सही दिशा में है, रोज़ 10 मिनट ज़ोर से पढ़ने से और तेज़ी आएगी।'
              : 'Reading is steady; reading aloud for 10 minutes daily will build even more speed.'
            : isHi
              ? 'पढ़ते समय थोड़ा अटकते हैं — रोज़ एक छोटा पैराग्राफ़ साथ में पढ़ाएँ।'
              : 'Needs gentle reading practice — sit together for 10 minutes of aloud reading each evening.',
      homeTip: isHi
        ? 'घर का सुझाव: रोज़ शाम 10 मिनट किताब का 1 पेज ज़ोर से पढ़वाएँ।'
        : 'Home tip: Ask your child to read 1 page aloud after dinner and explain it in 2 lines.',
    },
    {
      id: 'math',
      title: isHi ? 'गणित और पहाड़े (Math & Tables)' : 'Maths & Multiplication Tables',
      level: numLevel,
      statusLabel: levelLabel(numLevel, lang),
      headlineStat: latestNum
        ? isHi
          ? `पहाड़े ${latestNum.tablesFluencyPct}% · कुल ${latestNum.overallPct}%`
          : `${latestNum.tablesFluencyPct}% tables speed · ${latestNum.overallPct}% overall`
        : isHi
          ? 'अगले टेस्ट में अपडेट होगा'
          : 'Tables sprint upcoming',
      plainExplanation:
        numLevel === 'great'
          ? isHi
            ? 'पहाड़े और गणित की गणना बहुत तेज़ और सही है।'
            : 'Quick and accurate with multiplication tables and daily maths.'
          : numLevel === 'good'
            ? isHi
              ? 'गणित अच्छा है, बीच-बीच से पहाड़े पूछने से और पक्का होगा।'
              : 'Good maths foundation; mixing up table questions helps recall faster.'
            : isHi
              ? 'पहाड़ों में थोड़ा समय लगता है — रोज़ 5 मिनट मौखिक अभ्यास करवाएँ।'
              : 'Takes extra time on tables — 5 minutes of fun oral table practice daily will help quickly.',
      homeTip: isHi
        ? 'घर का सुझाव: रोज़ 5 मिनट बीच-बीच से पहाड़े (जैसे 7×8, 12×6) पूछें।'
        : 'Home tip: Play a 5-minute quick quiz on 2 tables (like 7× and 8×) every evening.',
    },
    {
      id: 'computer',
      title: isHi ? 'कंप्यूटर और टाइपिंग कौशल' : 'Computer & Typing Skills',
      level: compLevel,
      statusLabel: levelLabel(compLevel, lang),
      headlineStat: latestComp
        ? isHi
          ? `${latestComp.netWpm} WPM टाइपिंग · ${latestComp.overallScore}/100`
          : `${latestComp.netWpm} WPM typing · Score ${latestComp.overallScore}/100`
        : isHi
          ? 'कंप्यूटर लैब अभ्यास जारी'
          : 'Lab practice in progress',
      plainExplanation:
        compLevel === 'great'
          ? isHi
            ? 'कंप्यूटर के काम और टाइपिंग में बहुत बढ़िया पकड़ है।'
            : 'Confident with keyboard typing and practical computer tasks.'
          : isHi
            ? 'स्कूल की कंप्यूटर लैब में नियमित अभ्यास से कौशल बढ़ रहा है।'
            : 'Building steady typing speed and practical computer confidence in school lab.',
      homeTip: isHi
        ? 'घर का सुझाव: पढ़ाई से जुड़े प्रोजेक्ट साफ़ टाइप करने के लिए प्रोत्साहित करें।'
        : 'Home tip: Encourage neat keyboard practice during school project work.',
    },
    {
      id: 'thinking',
      title: isHi ? 'सोचने की क्षमता और दिमाग़ी खेल' : 'Thinking & Problem Solving',
      level: thinkLevel,
      statusLabel: levelLabel(thinkLevel, lang),
      headlineStat:
        latestThinkPct !== null
          ? isHi
            ? `सोच सूचकांक ${latestThinkPct}%`
            : `${latestThinkPct}% thinking readiness`
          : isHi
            ? 'डेली ब्रेन जिम के लिए तैयार'
            : 'Ready for Daily Brain Gym',
      plainExplanation:
        thinkLevel === 'great'
          ? isHi
            ? 'नई परिस्थितियों में शांत और समझदारी से हल निकालते हैं।'
            : 'Solves puzzles and everyday school situations calmly and thoughtfully.'
          : isHi
            ? 'रोज़ 5 मिनट के ब्रेन जिम खेल से एकाग्रता और याददाश्त और बेहतर होगी।'
            : '5 minutes of Daily Brain Gym exercises will strengthen focus and memory even more.',
      homeTip: isHi
        ? 'घर का सुझाव: छोटे फैसलों में बच्चे की राय पूछें और उन्हें कारण बताने दें।'
        : 'Home tip: Ask "How would you solve this?" on small daily decisions to build confidence.',
    },
  ];

  // 4. Character & Everyday Strengths (zero psych jargon)
  const topStrengths: string[] = [];
  if (student.responsibilities.length > 0) {
    topStrengths.push(student.responsibilities[0]);
  }
  if (student.achievements.length > 0) {
    topStrengths.push(student.achievements[0]);
  }
  if (attLevel === 'great') {
    topStrengths.push(isHi ? 'नियमित और समय के पाबंद' : 'Punctual & Regular');
  }
  if (readingLevel === 'great') {
    topStrengths.push(isHi ? 'स्पष्ट वाचन व संवाद कौशल' : 'Clear Reader & Communicator');
  }
  if (topStrengths.length === 0) {
    topStrengths.push(
      isHi ? 'सहयोगी स्वभाव' : 'Helpful Classmate',
      isHi ? 'सीखने की जिज्ञासा' : 'Eager to Learn',
    );
  }

  const weakSkill = skills.find((s) => s.level === 'practice');
  const focusHabit = weakSkill
    ? isHi
      ? `${weakSkill.title} में रोज़ 10 मिनट का शांत अभ्यास।`
      : `10 minutes of calm daily practice on ${weakSkill.title}.`
    : hwLevel !== 'great'
      ? isHi
        ? 'रात में सोने से पहले स्कूल बैग और कॉपी की जाँच करना।'
        : 'Checking school diary and notebook completion together before bedtime.'
      : isHi
        ? 'अपनी अच्छी दिनचर्या बनाए रखना और हर हफ़्ते एक नई किताब पढ़ना।'
        : 'Keeping up the great daily routine and reading one short story each week.';

  // 5. Fees in clear words
  const isCleared = student.feeBalanceInr <= 0;
  const fees = {
    isCleared,
    balanceInr: student.feeBalanceInr,
    annualInr: student.totalFeeAnnualInr,
    statusLabel: isCleared
      ? isHi
        ? 'सभी शुल्क जमा हैं'
        : 'All Fees Paid'
      : isHi
        ? `₹${student.feeBalanceInr.toLocaleString('en-IN')} बकाया`
        : `₹${student.feeBalanceInr.toLocaleString('en-IN')} Pending`,
    plainNote: isCleared
      ? isHi
        ? 'अभी कोई शुल्क बकाया नहीं है। धन्यवाद!'
        : 'No pending fee balance right now. Thank you!'
      : isHi
        ? `वार्षिक शुल्क ₹${student.totalFeeAnnualInr.toLocaleString('en-IN')} में से ₹${student.feeBalanceInr.toLocaleString('en-IN')} जमा करना शेष है।`
        : `₹${student.feeBalanceInr.toLocaleString('en-IN')} is pending out of ₹${student.totalFeeAnnualInr.toLocaleString('en-IN')} annual fee.`,
  };

  // Compute overall calm summary
  const practiceCount =
    (attLevel === 'practice' ? 1 : 0) +
    (hwLevel === 'practice' ? 1 : 0) +
    skills.filter((s) => s.level === 'practice').length;

  const examAvg =
    examMarks.filter((m) => m.studentId === student.id).length > 0
      ? Math.round(
          examMarks
            .filter((m) => m.studentId === student.id)
            .reduce((sum, m) => sum + (m.obtainedMarks / Math.max(1, m.maxMarks)) * 100, 0) /
            examMarks.filter((m) => m.studentId === student.id).length,
        )
      : null;

  const overallLevel: EasyStatusLevel =
    practiceCount >= 2 ? 'practice' : practiceCount === 0 && (examAvg === null || examAvg >= 75) ? 'great' : 'good';

  const overallHeadline =
    overallLevel === 'great'
      ? isHi
        ? `${student.name} स्कूल में बहुत अच्छा प्रदर्शन कर रहे हैं`
        : `${student.name} is doing very well at school`
      : overallLevel === 'good'
        ? isHi
          ? `${student.name} अच्छी प्रगति कर रहे हैं`
          : `${student.name} is progressing steadily`
        : isHi
          ? `${student.name} को कुछ विषयों में घर पर थोड़ा सहयोग चाहिए`
          : `${student.name} needs a little extra practice at home`;

  const overallSummarySentence =
    overallLevel === 'great'
      ? isHi
        ? 'उपस्थिति, कक्षा का काम और सीखने की गति सभी सकारात्मक हैं।'
        : 'Attendance, classwork, and learning habits are all on a strong, healthy track.'
      : isHi
        ? 'नीचे आसान भाषा में आज की उपस्थिति, होमवर्क, पढ़ाई के कौशल और घर के लिए छोटे सुझाव दिए गए हैं।'
        : 'Below is a simple, plain-language summary of attendance, homework, learning progress, and easy ways to support at home.';

  const attentionCount =
    pendingHw.length + weakNotebooks.length + (isCleared ? 0 : 1) + (attLevel === 'practice' ? 1 : 0);

  return {
    student,
    overallLevel,
    overallHeadline,
    overallSummarySentence,
    attendance: {
      level: attLevel,
      todayStatusLabel,
      attendancePct: student.attendancePct,
      plainNote: attPlainNote,
    },
    homeworkAndNotebooks: {
      level: hwLevel,
      pendingHomeworkCount: pendingHw.length,
      notebookAttentionCount: weakNotebooks.length,
      headline: hwHeadline,
      plainItems,
    },
    skills,
    characterStrengths: {
      topStrengths: topStrengths.slice(0, 3),
      focusHabit,
    },
    fees,
    attentionCount,
  };
}

export function buildParentFamilyOverview(params: {
  students: StudentRecord[];
  lang: ParentLang;
  studentBreakdowns?: Record<string, LearnersScoreBreakdown>;
  attendanceRecords?: AttendanceRecord[];
  homeworkAssignments?: HomeworkAssignment[];
  homeworkSubmissions?: HomeworkSubmission[];
  notebookEntries?: NotebookEntry[];
  readingReports?: MonthlyReadingReport[];
  numeracyReports?: MonthlyNumeracyReport[];
  computerSkillAttempts?: ComputerSkillAttempt[];
  thinkingAssessments?: ThinkingAssessmentSession[];
  vcipAttempts?: VcipAttemptRecord[];
  examMarks?: ExamMark[];
}): ParentEasyFamilyOverview {
  const children = params.students.map((student) =>
    buildParentEasyChildSummary({
      student,
      lang: params.lang,
      breakdown: params.studentBreakdowns?.[student.id] || null,
      attendanceRecords: params.attendanceRecords,
      homeworkAssignments: params.homeworkAssignments,
      homeworkSubmissions: params.homeworkSubmissions,
      notebookEntries: params.notebookEntries,
      readingReports: params.readingReports,
      numeracyReports: params.numeracyReports,
      computerSkillAttempts: params.computerSkillAttempts,
      thinkingAssessments: params.thinkingAssessments,
      vcipAttempts: params.vcipAttempts,
      examMarks: params.examMarks,
    }),
  );

  const totalFeeDueInr = children.reduce((sum, c) => sum + c.fees.balanceInr, 0);
  const totalAttentionItems = children.reduce((sum, c) => sum + c.attentionCount, 0);
  const isHi = params.lang === 'hi';

  const familyHeadline =
    children.length > 1
      ? isHi
        ? `आपके ${children.length} बच्चों की आसान स्कूल रिपोर्ट`
        : `Simple School Overview for All ${children.length} Children`
      : children.length === 1
        ? isHi
          ? `${children[0].student.name} की आसान स्कूल रिपोर्ट`
          : `${children[0].student.name}'s Easy School Summary`
        : isHi
          ? 'परिवार रिपोर्ट'
          : 'Family Report';

  return {
    childCount: children.length,
    children,
    totalFeeDueInr,
    totalAttentionItems,
    familyHeadline,
  };
}
