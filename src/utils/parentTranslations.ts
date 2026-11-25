export type ParentLang = 'en' | 'hi';

export const PARENT_LANG_STORAGE_KEY = 'vs360_parent_lang';

export function loadParentLangPreference(): ParentLang {
  try {
    if (typeof window === 'undefined') return 'en';
    const raw = window.localStorage.getItem(PARENT_LANG_STORAGE_KEY);
    return raw === 'hi' ? 'hi' : 'en';
  } catch {
    return 'en';
  }
}

export function saveParentLangPreference(lang: ParentLang): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PARENT_LANG_STORAGE_KEY, lang);
    }
  } catch {
    // Ignore storage quota / private mode failures gracefully
  }
}

export interface ParentUiStrings {
  welcomePrefix: string;
  languageLabel: string;
  linkedStudentProfile: string;
  meanLearnersScore: string;
  notebookEvidenceLogged: string;
  outstandingFeeBalance: string;
  openStudent360: string;
  openCognitiveGames: string;
  openComplaintsAndFees: string;
  parentPortalNotice: string;
  complaintDeskTitle: string;
  complaintDeskSubtitle: string;
  submitConcernBtn: string;
  privacyNotice: string;
  dailyAttendanceAlertsTitle: string;
  dailyAttendanceAlertsSubtitle: string;
  acknowledgeReceiptBtn: string;
  acknowledgedLabel: string;
  unreadLabel: string;
  noAttendanceMessages: string;
}

export const PARENT_TRANSLATIONS: Record<ParentLang, ParentUiStrings> = {
  en: {
    welcomePrefix: 'Welcome',
    languageLabel: 'Family Portal Language',
    linkedStudentProfile: 'Linked Student Profile',
    meanLearnersScore: 'Learners Score',
    notebookEvidenceLogged: 'Notebook Checks Logged',
    outstandingFeeBalance: 'Outstanding Fee Balance',
    openStudent360: 'Open Student 360° Profiles',
    openCognitiveGames: 'Intelligence Games',
    openComplaintsAndFees: 'Fees & Parent Concerns',
    parentPortalNotice:
      'Family View: Only your child’s approved 360° indicators, attendance, fees, and concerns are shown.',
    complaintDeskTitle: 'Parent Concern & Complaint Desk',
    complaintDeskSubtitle:
      'Submit transport, academic, safety, or fee concerns directly to school leadership with optional photo proof.',
    submitConcernBtn: 'Submit Concern',
    privacyNotice:
      'Coordinator updates and resolutions appear here; internal staff investigation notes stay private to management.',
    dailyAttendanceAlertsTitle: 'Daily Attendance Notifications from School',
    dailyAttendanceAlertsSubtitle:
      'Automated daily attendance updates sent directly to your app once your child’s class roll call is marked.',
    acknowledgeReceiptBtn: 'Acknowledge Message',
    acknowledgedLabel: 'Acknowledged by Parent',
    unreadLabel: 'Unread Update',
    noAttendanceMessages: 'No daily attendance notifications delivered yet for your child.',
  },
  hi: {
    welcomePrefix: 'स्वागत है',
    languageLabel: 'अभिभावक पोर्टल भाषा',
    linkedStudentProfile: 'पंजीकृत विद्यार्थी प्रोफ़ाइल',
    meanLearnersScore: 'लर्नर्स स्कोर (Learners Score)',
    notebookEvidenceLogged: 'नोटबुक जाँच प्रविष्टियाँ',
    outstandingFeeBalance: 'बकाया शुल्क राशि',
    openStudent360: 'विद्यार्थी 360° प्रोफ़ाइल देखें',
    openCognitiveGames: 'बुद्धि एवं संज्ञानात्मक खेल',
    openComplaintsAndFees: 'शुल्क एवं अभिभावक शिकायत डेस्क',
    parentPortalNotice:
      'परिवार पोर्टल: यहाँ केवल आपके बच्चे के स्वीकृत 360° संकेत, उपस्थिति, शुल्क और शिकायतों की स्थिति दिखती है।',
    complaintDeskTitle: 'अभिभावक शिकायत एवं सहायता डेस्क',
    complaintDeskSubtitle:
      'परिवहन, शैक्षणिक, सुरक्षा या शुल्क संबंधी विषय फ़ोटो प्रमाण के साथ सीधे विद्यालय प्रबंधन को भेजें।',
    submitConcernBtn: 'शिकायत दर्ज करें',
    privacyNotice:
      'प्रबंधन के उत्तर और समाधान यहाँ दिखेंगे; आंतरिक स्टाफ़ नोट्स गोपनीय रहते हैं।',
    dailyAttendanceAlertsTitle: 'विद्यालय से दैनिक उपस्थिति सूचनाएँ',
    dailyAttendanceAlertsSubtitle:
      'कक्षा में हाज़िरी लगते ही आपके ऐप पर भेजी गई दैनिक उपस्थिति सूचना।',
    acknowledgeReceiptBtn: 'संदेश की पुष्टि करें',
    acknowledgedLabel: 'अभिभावक द्वारा देखा एवं पुष्ट किया गया',
    unreadLabel: 'नई अपठित सूचना',
    noAttendanceMessages: 'आपके बच्चे के लिए अभी तक कोई दैनिक उपस्थिति सूचना प्राप्त नहीं हुई है।',
  },
};
