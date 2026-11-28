import type { School, UserAccount } from '../types';
import type {
  SchoolAccentTheme,
  SchoolFacilityCategory,
  SchoolGalleryCategory,
  SchoolGalleryItem,
  SchoolManagementMember,
  SchoolParentEngagementItem,
  SchoolPhilosophyConfig,
  SchoolVerificationFlag,
  SchoolWebsiteFeature,
  SchoolWebsiteProfile,
} from '../types/schoolWebsite';

export const SCHOOL_GALLERY_CATEGORIES: Array<'All' | SchoolGalleryCategory> = [
  'All',
  'Campus',
  'Classrooms',
  'Labs & STEM',
  'Events & Culture',
  'Sports & Guidance',
];

export function toSchoolWebsiteSlug(codeOrName: string): string {
  return (
    String(codeOrName || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'school'
  );
}

export function resolveSchoolBySlugOrId(schools: School[], slugOrId: string): School | null {
  const clean = String(slugOrId || '').trim().toLowerCase();
  if (!clean) return schools[0] ?? null;

  // Support legacy VIS bookmarks (/school/vis-jjr-01, /school/vis-15390, /school/vis)
  if (['vis', 'vis-jjr-01', 'vis-15390', 'school-vis-jjr', 'virat-international-school'].includes(clean)) {
    const vis = schools.find((s) => s.id === 'school-vis-jjr');
    if (vis) return vis;
  }

  const exactId = schools.find((s) => s.id.toLowerCase() === clean);
  if (exactId) return exactId;

  const exactCode = schools.find(
    (s) => s.code.toLowerCase() === clean || toSchoolWebsiteSlug(s.code) === clean,
  );
  if (exactCode) return exactCode;

  const nameSlug = schools.find((s) => toSchoolWebsiteSlug(s.name) === clean);
  if (nameSlug) return nameSlug;

  const prefixMatch = schools.find(
    (s) =>
      toSchoolWebsiteSlug(s.code).startsWith(clean) ||
      s.id.toLowerCase().includes(clean),
  );
  return prefixMatch ?? null;
}

function getInitials(name: string): string {
  const parts = String(name || 'SC')
    .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s*/i, '')
    .replace(/\bMa'am\b/gi, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'SC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function buildVisAuthenticGallery(): SchoolGalleryItem[] {
  return [
    {
      id: 'vis-gal-vr-classes',
      title: 'VR Classes — Learn Beyond Books',
      category: 'Labs & STEM',
      imageUrl: '/assets/schools/vis/usp-vr-classes.jpg',
      caption: 'Immersive Virtual Reality (fotonVR) learning sessions where VIS students explore Science, Space, Anatomy, and Geography beyond textbooks.',
      tag: 'VR Education',
    },
    {
      id: 'vis-gal-mind-mapping',
      title: 'Mind Mapping & Interactive Digital Teaching',
      category: 'Classrooms',
      imageUrl: '/assets/schools/vis/usp-mind-mapping.jpg',
      caption: 'Visual mind-mapping techniques on interactive panels helping students grasp complex NCERT/SCERT chapters with high retention.',
      tag: 'Mind Mapping',
    },
    {
      id: 'vis-gal-active-learning',
      title: 'Active Learning Classrooms',
      category: 'Classrooms',
      imageUrl: '/assets/schools/vis/usp-active-learning.jpg',
      caption: 'Participatory, questioning-driven classrooms encouraging every child to speak, reason, and build confidence.',
      tag: 'Active Learning',
    },
    {
      id: 'vis-gal-digital-panels',
      title: 'Activity, Art & Interactive Digital Learning',
      category: 'Events & Culture',
      imageUrl: '/assets/schools/vis/usp-digital-panels.jpg',
      caption: 'Joyful foundational activities, art & creativity showcases, and interactive digital engagement for young learners.',
      tag: 'Art & Creativity',
    },
    {
      id: 'vis-gal-brain-sitting',
      title: 'Brain Testing Sitting Plan & DMIT Guidance',
      category: 'Sports & Guidance',
      imageUrl: '/assets/schools/vis/usp-brain-sitting.jpg',
      caption: 'Scientific brain-based classroom seating and personalised study guidance aligned to each child’s cognitive strengths.',
      tag: 'DMIT & Sitting Plan',
    },
    {
      id: 'vis-gal-counselling',
      title: 'Personalised Student & Parent Counselling',
      category: 'Sports & Guidance',
      imageUrl: '/assets/schools/vis/usp-counselling.jpg',
      caption: 'Dedicated one-to-one student and family counselling sessions supporting academic clarity, emotional wellbeing, and goal setting.',
      tag: 'Counselling',
    },
    {
      id: 'vis-gal-home-visits',
      title: 'Four Annual Home Counselling Visits',
      category: 'Campus',
      imageUrl: '/assets/schools/vis/usp-home-visits.jpg',
      caption: 'Our signature 4×/year family home counselling visits strengthening the school-parent partnership throughout the academic year.',
      tag: '4×/Year Home Visits',
    },
    {
      id: 'vis-gal-weekly-teachers',
      title: 'Weekly Trained Faculty & Exhibitions',
      category: 'Events & Culture',
      imageUrl: '/assets/schools/vis/usp-weekly-teachers.jpg',
      caption: 'Dedicated VIS faculty team participating in weekly pedagogical training and hands-on student exhibitions.',
      tag: 'Faculty Excellence',
    },
    {
      id: 'vis-gal-computer-classes',
      title: 'Daily Computer Education Lab',
      category: 'Labs & STEM',
      imageUrl: '/assets/schools/vis/usp-computer-classes.jpg',
      caption: 'Hands-on daily computer classes building practical digital fluency, typing, and modern technology skills from early grades.',
      tag: 'Daily Computers',
    },
    {
      id: 'vis-gal-memory-personality',
      title: 'Memory & Personality Development Classes',
      category: 'Sports & Guidance',
      imageUrl: '/assets/schools/vis/usp-memory-personality.jpg',
      caption: 'Structured memory training, public speaking, leadership, and life-skills sessions preparing confident future leaders.',
      tag: 'Personality Dev.',
    },
  ];
}

function buildDefaultGallery(school: School): SchoolGalleryItem[] {
  if (school.id === 'school-vis-jjr') {
    return buildVisAuthenticGallery();
  }
  return [
    {
      id: `${school.id}-gal-1`,
      title: `${school.name} Main Academic Wing`,
      category: 'Campus',
      imageUrl: '/assets/images/hero_campus_india_1794713007660.jpg',
      caption: `Clean, green, CCTV-monitored academic block with spacious ventilated corridors in ${school.city}, ${school.state}.`,
      tag: 'Safe Campus',
    },
    {
      id: `${school.id}-gal-2`,
      title: 'Interactive Smart Classrooms & Daily Notebook Check',
      category: 'Classrooms',
      imageUrl: '/assets/images/notebook_classroom_learning_1794713009152.jpg',
      caption: 'Structured concept teaching paired with daily notebook verification and real-time parent transparency.',
      tag: 'Smart Learning',
    },
    {
      id: `${school.id}-gal-3`,
      title: 'Composite Science & Practical Discovery Lab',
      category: 'Labs & STEM',
      imageUrl: '/assets/images/science_lab_collaboration_1794713009857.jpg',
      caption: 'Hands-on Physics, Chemistry & Biology experiments fostering inquiry, observation, and board readiness.',
      tag: 'STEM Lab',
    },
    {
      id: `${school.id}-gal-4`,
      title: 'Personalised Career & OLQ Mentorship Studio',
      category: 'Sports & Guidance',
      imageUrl: '/assets/images/career_counselling_session_1794713007994.jpg',
      caption: 'Individual student mentorship covering leadership qualities, study habits, and senior stream pathways.',
      tag: 'Mentorship',
    },
  ];
}

function buildVisSixteenUsps(): SchoolWebsiteFeature[] {
  return [
    {
      id: 'vis-usp-1',
      title: 'Active Learning Classrooms',
      description: 'Participatory, discussion-rich classrooms where students question, collaborate, and learn actively rather than by rote.',
      badge: 'Academic',
      category: 'Academic Facilities',
      iconKey: 'academics',
      photoUrl: '/assets/schools/vis/usp-active-learning.jpg',
      highlightMetric: 'Interactive',
      displayOrder: 1,
      active: true,
    },
    {
      id: 'vis-usp-2',
      title: 'Mind Mapping Teaching',
      description: 'Visual mind-mapping methodology that connects NCERT/SCERT concepts logically for faster comprehension and long-term recall.',
      badge: 'Pedagogy',
      category: 'Academic Facilities',
      iconKey: 'academics',
      photoUrl: '/assets/schools/vis/usp-mind-mapping.jpg',
      highlightMetric: 'Visual Clarity',
      displayOrder: 2,
      active: true,
    },
    {
      id: 'vis-usp-3',
      title: 'Interactive Digital Panels',
      description: 'Modern touch-enabled digital smart panels turning every lesson into an engaging visual and audio-visual learning experience.',
      badge: 'Digital Learning',
      category: 'Digital Learning',
      iconKey: 'digital',
      photoUrl: '/assets/schools/vis/usp-digital-panels.jpg',
      highlightMetric: 'Smart Panels',
      displayOrder: 3,
      active: true,
    },
    {
      id: 'vis-usp-4',
      title: 'VR Classes',
      description: 'Immersive Virtual Reality (fotonVR) classroom modules letting students experience planets, anatomy, monuments, and science in 360°.',
      badge: 'VR Education',
      category: 'VR Education',
      iconKey: 'stem',
      photoUrl: '/assets/schools/vis/usp-vr-classes.jpg',
      highlightMetric: 'Learn Beyond Books',
      displayOrder: 4,
      active: true,
    },
    {
      id: 'vis-usp-5',
      title: 'Projector-Based Interactive Classes',
      description: 'Concept animations, diagrams, and guided chapter flowcharts projected live in classrooms for clear conceptual understanding.',
      badge: 'Digital Learning',
      category: 'Digital Learning',
      iconKey: 'digital',
      photoUrl: '/assets/schools/vis/usp-mind-mapping.jpg',
      highlightMetric: 'Visual Lessons',
      displayOrder: 5,
      active: true,
    },
    {
      id: 'vis-usp-6',
      title: 'Brain Testing Sitting Plan',
      description: 'Scientific, student-centred classroom seating strategy designed around each learner’s attention profile and learning modality.',
      badge: 'Personalised',
      category: 'Student Counselling',
      iconKey: 'leadership',
      photoUrl: '/assets/schools/vis/usp-brain-sitting.jpg',
      highlightMetric: 'Brain-Aligned',
      displayOrder: 6,
      active: true,
    },
    {
      id: 'vis-usp-7',
      title: 'Personalised Counselling',
      description: 'Individual student and parent counselling sessions supporting academic direction, emotional confidence, and career clarity.',
      badge: 'Counselling',
      category: 'Student Counselling',
      iconKey: 'transparency',
      photoUrl: '/assets/schools/vis/usp-counselling.jpg',
      highlightMetric: '1-on-1 Guidance',
      displayOrder: 7,
      active: true,
    },
    {
      id: 'vis-usp-8',
      title: 'Four Annual Home Counselling Visits',
      description: 'Signature 4×/year quarterly home visits by VIS educators to partner closely with every enrolled family at home.',
      badge: 'Parent Partnership',
      category: 'Parent Engagement',
      iconKey: 'transparency',
      photoUrl: '/assets/schools/vis/usp-home-visits.jpg',
      highlightMetric: '4 Visits / Year',
      displayOrder: 8,
      active: true,
    },
    {
      id: 'vis-usp-9',
      title: 'Weekly Teacher Training',
      description: 'Continuous weekly faculty upskilling in active pedagogy, child psychology, digital tools, and HBSE/NCERT excellence.',
      badge: 'Faculty',
      category: 'Academic Facilities',
      iconKey: 'academics',
      photoUrl: '/assets/schools/vis/usp-weekly-teachers.jpg',
      highlightMetric: 'Weekly Upskilling',
      displayOrder: 9,
      active: true,
    },
    {
      id: 'vis-usp-10',
      title: 'Daily Computer Classes',
      description: 'Dedicated daily hands-on computer periods equipping students with practical digital literacy and modern computing skills.',
      badge: 'Computer Ed.',
      category: 'Computer Education',
      iconKey: 'digital',
      photoUrl: '/assets/schools/vis/usp-computer-classes.jpg',
      highlightMetric: 'Daily Lab',
      displayOrder: 10,
      active: true,
    },
    {
      id: 'vis-usp-11',
      title: 'DMIT Testing and Personalised Study Plans',
      description: 'Learning-style discovery and tailored study plans helping each child study smarter according to their natural strengths.',
      badge: 'Assessment',
      category: 'Student Counselling',
      iconKey: 'stem',
      photoUrl: '/assets/schools/vis/usp-brain-sitting.jpg',
      highlightMetric: 'Custom Study Plan',
      displayOrder: 11,
      active: true,
    },
    {
      id: 'vis-usp-12',
      title: 'Memory Development Classes',
      description: 'Structured memory recall, concentration, and mental agility workshops that strengthen exam confidence and retention.',
      badge: 'Skill Dev.',
      category: 'Skill Development',
      iconKey: 'leadership',
      photoUrl: '/assets/schools/vis/usp-memory-personality.jpg',
      highlightMetric: 'Memory Mastery',
      displayOrder: 12,
      active: true,
    },
    {
      id: 'vis-usp-13',
      title: 'Personality Development Classes',
      description: 'Dedicated communication, stage confidence, etiquette, leadership, and Officer Like Qualities (OLQ) development sessions.',
      badge: 'Personality',
      category: 'Personality Development',
      iconKey: 'leadership',
      photoUrl: '/assets/schools/vis/usp-memory-personality.jpg',
      highlightMetric: 'Future Leaders',
      displayOrder: 13,
      active: true,
    },
    {
      id: 'vis-usp-14',
      title: 'Co-Curricular Activities and Life Skills',
      description: 'Balanced blend of sports, art & creativity, exhibitions, debates, and real-world life skills for holistic character growth.',
      badge: 'Holistic',
      category: 'Art and Creativity',
      iconKey: 'sports',
      photoUrl: '/assets/schools/vis/usp-digital-panels.jpg',
      highlightMetric: 'All-Round Growth',
      displayOrder: 14,
      active: true,
    },
    {
      id: 'vis-usp-15',
      title: 'Safe and Secure Campus',
      description: 'CCTV-monitored campus, verified visitor entry logs, digital student gate passes, and attentive teacher supervision.',
      badge: 'Safety',
      category: 'Safety and Security',
      iconKey: 'safety',
      photoUrl: '/assets/schools/vis/usp-weekly-teachers.jpg',
      highlightMetric: 'Verified Gate',
      displayOrder: 15,
      active: true,
    },
    {
      id: 'vis-usp-16',
      title: 'School Transport',
      description: 'Well-connected campus bus routes serving Kapriwas, Pataudi Road, NH-8 corridor, and surrounding Rewari localities safely.',
      badge: 'Transport',
      category: 'Transport',
      iconKey: 'transport',
      photoUrl: '/assets/schools/vis/vis-vr-hero.jpg',
      highlightMetric: 'Safe Commute',
      displayOrder: 16,
      active: true,
    },
  ];
}

function buildVisTwelveFacilities(): SchoolFacilityCategory[] {
  return [
    {
      id: 'fac-academic',
      category: 'Academic Facilities',
      summary: 'Active learning classrooms, Mind Mapping pedagogy, HBSE/NCERT/SCERT structured lesson plans & weekly trained teachers.',
      highlights: ['Active Learning Classrooms', 'Mind Mapping Teaching', 'Weekly Teacher Training', 'Daily Notebook Monitoring'],
      photoUrl: '/assets/schools/vis/usp-active-learning.jpg',
      active: true,
    },
    {
      id: 'fac-digital',
      category: 'Digital Learning',
      summary: 'Interactive touch digital panels, projector-based interactive lessons, and Classes 6–12 digital Learning Portal.',
      highlights: ['Interactive Digital Panels', 'Projector-Based Classes', '127 Digital Chapters'],
      photoUrl: '/assets/schools/vis/usp-mind-mapping.jpg',
      active: true,
    },
    {
      id: 'fac-computer',
      category: 'Computer Education',
      summary: 'Daily hands-on computer classes ensuring practical digital skills across all classes.',
      highlights: ['Daily Computer Classes', 'Practical Lab Sessions', 'Guided Digital Literacy'],
      photoUrl: '/assets/schools/vis/usp-computer-classes.jpg',
      active: true,
    },
    {
      id: 'fac-vr',
      category: 'VR Education',
      summary: 'Dedicated VR Classes (fotonVR) enabling experiential 360° learning beyond textbooks.',
      highlights: ['VR Classes', '360° Science & Geography Modules', 'Experiential Concept Mastery'],
      photoUrl: '/assets/schools/vis/usp-vr-classes.jpg',
      active: true,
    },
    {
      id: 'fac-sports',
      category: 'Sports',
      summary: 'Physical fitness, outdoor games, teamwork, stamina, and sportsmanship programmes.',
      highlights: ['Team Sports & Athletics', 'Physical Education', 'House Competitions'],
      photoUrl: '/assets/schools/vis/usp-weekly-teachers.jpg',
      active: true,
    },
    {
      id: 'fac-art',
      category: 'Art and Creativity',
      summary: 'Visual arts, craft, exhibitions, and creative expression woven into school life.',
      highlights: ['Creative Art Workshops', 'Science & Craft Exhibitions', 'Cultural Celebrations'],
      photoUrl: '/assets/schools/vis/usp-digital-panels.jpg',
      active: true,
    },
    {
      id: 'fac-skill',
      category: 'Skill Development',
      summary: 'Memory development classes, DMIT personalised study plans, and practical life skills.',
      highlights: ['Memory Development Classes', 'DMIT Study Plans', 'Life Skills Curriculum'],
      photoUrl: '/assets/schools/vis/usp-memory-personality.jpg',
      active: true,
    },
    {
      id: 'fac-personality',
      category: 'Personality Development',
      summary: 'Communication confidence, leadership habits, discipline, kindness, and stage skills.',
      highlights: ['Personality Development Classes', 'Public Speaking & Debate', 'Leadership Habits'],
      photoUrl: '/assets/schools/vis/usp-memory-personality.jpg',
      active: true,
    },
    {
      id: 'fac-counselling',
      category: 'Student Counselling',
      summary: 'Brain testing sitting plan, personalised 1-on-1 counselling, and continuous student mentoring.',
      highlights: ['Personalised Counselling', 'Brain Testing Sitting Plan', 'Individual Learning Guidance'],
      photoUrl: '/assets/schools/vis/usp-counselling.jpg',
      active: true,
    },
    {
      id: 'fac-parent',
      category: 'Parent Engagement',
      summary: 'Four annual home counselling visits, transparent academic tracking, and open parent-teacher dialogue.',
      highlights: ['4 Annual Home Counselling Visits', 'Live Progress Tracking', 'Parent-Teacher Partnership'],
      photoUrl: '/assets/schools/vis/usp-home-visits.jpg',
      active: true,
    },
    {
      id: 'fac-transport',
      category: 'Transport',
      summary: 'Reliable campus bus network connecting Kapriwas, Pataudi Road, NH-8 corridor, and nearby Rewari areas.',
      highlights: ['Dedicated School Buses', 'Route Monitoring', 'Safe Pickup & Drop'],
      photoUrl: '/assets/schools/vis/vis-vr-hero.jpg',
      active: true,
    },
    {
      id: 'fac-safety',
      category: 'Safety and Security',
      summary: 'Safe and secure campus with CCTV monitoring, verified visitor management, and digital early-exit gate passes.',
      highlights: ['CCTV Monitored Campus', 'Verified Gate Pass & Visitors', 'Trained Supervision'],
      photoUrl: '/assets/schools/vis/usp-weekly-teachers.jpg',
      active: true,
    },
  ];
}

function buildDefaultFeatures(school: School): SchoolWebsiteFeature[] {
  if (school.id === 'school-vis-jjr') {
    return buildVisSixteenUsps();
  }
  return [
    {
      id: 'feat-academics-360',
      title: '360° Academic & Daily Progress Tracking',
      description: `Every learner in ${school.board} classes receives daily notebook verification, chapter mastery tracking, and timely parent alerts.`,
      badge: 'Academic Excellence',
      category: 'Academic Facilities',
      iconKey: 'academics',
      highlightMetric: 'Daily Tracking',
      displayOrder: 1,
      active: true,
    },
    {
      id: 'feat-digital-lab',
      title: 'Interactive Learning Portal & 3D Concept Studio',
      description: 'Classes 6–12 digital chapter hub with visual flowcharts, mindmaps, guided practice, and structured board exam revision.',
      badge: 'NEP 2020 Ready',
      category: 'Digital Learning',
      iconKey: 'digital',
      highlightMetric: '127 Chapters',
      displayOrder: 2,
      active: true,
    },
    {
      id: 'feat-olq-leadership',
      title: 'Character, Discipline & Leadership Development',
      description: 'Beyond marks: systematic mentoring of leadership, communication, teamwork, responsibility, and confident public speaking.',
      badge: 'Holistic Growth',
      category: 'Personality Development',
      iconKey: 'leadership',
      highlightMetric: '15 Core Traits',
      displayOrder: 3,
      active: true,
    },
    {
      id: 'feat-stem-labs',
      title: 'Composite Science, Computer & Math Labs',
      description: 'Modern practical laboratories, guided experiential demonstrations, and foundational reading & numeracy mastery clinics.',
      badge: 'Hands-On STEM',
      category: 'Academic Facilities',
      iconKey: 'stem',
      highlightMetric: 'Practical Labs',
      displayOrder: 4,
      active: true,
    },
    {
      id: 'feat-safe-transport',
      title: 'GPS-Monitored Transport & Verified Campus Gate',
      description: 'Dedicated school bus routes with trained attendants, digital student early-exit gate passes, and verified visitor logs.',
      badge: 'Campus Safety',
      category: 'Safety and Security',
      iconKey: 'transport',
      highlightMetric: 'Verified Gate',
      displayOrder: 5,
      active: true,
    },
    {
      id: 'feat-parent-portal',
      title: 'Live Parent App, Transparent Fees & Day-1 Care',
      description: 'Instant attendance updates, digital fee receipts, UDISE+ compliant document vault, and structured 30-day new student onboarding.',
      badge: 'Parent Trust',
      category: 'Parent Engagement',
      iconKey: 'transparency',
      highlightMetric: '100% Transparent',
      displayOrder: 6,
      active: true,
    },
  ];
}

export function buildDefaultSchoolWebsiteProfile(
  school: School,
  schoolUsers: UserAccount[] = [],
): SchoolWebsiteProfile {
  const isVis = school.id === 'school-vis-jjr';
  const isSvm = school.id === 'school-svm-kk';
  const isDpa = school.id === 'school-dpa-knl';

  if (isVis) {
    const philosophy: SchoolPhilosophyConfig = {
      pillars: [
        { key: 'READ', title: 'READ', subtitle: 'To Gain Knowledge' },
        { key: 'LEAD', title: 'LEAD', subtitle: 'To Build Character' },
        { key: 'SUCCEED', title: 'SUCCEED', subtitle: 'To Create a Brighter Future' },
      ],
      coreValues: [
        'Discipline in Learning',
        'Confidence in Thinking',
        'Kindness in Action',
        'Leadership for Tomorrow',
      ],
      statements: [
        'Where Every Child Learns, Grows and Shines.',
        'More Than a School – A Family for Life.',
      ],
    };

    const parentEngagementHighlights: SchoolParentEngagementItem[] = [
      {
        id: 'pe-home-visits',
        title: 'Four Annual Home Counselling Visits',
        description: 'Dedicated quarterly family home visits (Q1–Q4) ensuring personal connection with every enrolled student’s parents.',
      },
      {
        id: 'pe-personalised',
        title: 'Personalised Student Counselling',
        description: 'Individual academic, DMIT learning-style, and emotional mentoring sessions tailored to each child.',
      },
      {
        id: 'pe-progress',
        title: 'Academic Progress Monitoring',
        description: 'Daily notebook checking, unit test analytics, attendance alerts, and transparent report cards inside Rai Plus.',
      },
      {
        id: 'pe-comm',
        title: 'Parent-Teacher Communication',
        description: 'Proactive, respectful two-way parent communication for timely homework, attendance, and development updates.',
      },
      {
        id: 'pe-guidance',
        title: 'Student Development Guidance',
        description: 'Holistic guidance across values, discipline, memory, personality development, and senior stream selection.',
      },
    ];

    const managementTeam: SchoolManagementMember[] = [
      {
        id: 'vis-mgmt-chairman',
        name: 'Mr. Naval Singh',
        roleTitle: 'Chairman',
        qualification: 'Institutional Founder & Governance Leadership',
        bio: 'Provides overarching vision, ethical foundation, and community stewardship for Virat International School in Kapriwas, Rewari.',
        message: 'We are committed to creating a learning environment that nurtures character, curiosity and responsible global citizens.',
        initials: 'NS',
        photoUrl: '/assets/schools/vis/leader-naval-singh.jpg',
        email: 'chairman@viratschool.com',
        contactVisible: false,
      },
      {
        id: 'vis-mgmt-director',
        name: 'Dr. Saurav Yadav',
        roleTitle: 'Director',
        qualification: 'School Direction · Innovation & Holistic Education',
        bio: 'Guides institutional growth, modern classroom technology (VR, Digital Panels), and student life-skills initiatives across VIS.',
        message: 'At Virat, we believe that every child is unique and has the potential to achieve excellence. Our goal is to build confidence, values and life skills for a brighter future.',
        initials: 'SY',
        photoUrl: '/assets/schools/vis/leader-saurav-yadav.jpg',
        email: 'director@viratschool.com',
        contactVisible: false,
      },
      {
        id: 'vis-mgmt-deputy-director',
        name: 'Dr. Deepak Dhawan',
        roleTitle: 'Deputy Director',
        qualification: 'Ph.D. · Psychology, Personalised Counselling & Strategy',
        bio: 'Leads student psychology, DMIT personalised study plans, brain-testing sitting plans, four annual home counselling visits, and 360° digital school systems.',
        message: 'We aim to create a supportive and future-ready learning environment with personalised guidance, modern technology and continuous parent partnership, so that every child can READ | LEAD | SUCCEED in life.',
        initials: 'DD',
        photoUrl: '/assets/schools/vis/leader-deepak-dhawan.jpg',
        email: 'deputydirector@viratinternational.edu.in',
        contactVisible: true,
      },
      {
        id: 'vis-mgmt-principal',
        name: "Niharika Yadav Ma'am",
        roleTitle: 'Principal',
        qualification: 'Academic Leadership · Curriculum & Holistic Growth',
        bio: 'Heads academic quality, HBSE/NCERT-SCERT curriculum delivery, student safety, values education, and parent-school collaboration.',
        message: 'Our focus is on holistic development, academic excellence, life skills, discipline and values. We strive to create a happy and safe environment where every child feels heard, supported and inspired.',
        initials: 'NY',
        photoUrl: '/assets/schools/vis/leader-niharika-yadav.jpg',
        email: 'principal@viratinternational.edu.in',
        contactVisible: true,
      },
      {
        id: 'vis-mgmt-vice-principal',
        name: 'Ms. Nirmla Yadav',
        roleTitle: 'Vice Principal',
        qualification: 'Faculty Mentoring · Discipline & Student Care',
        bio: 'Supports teachers through weekly training, guides students daily, and oversees classroom excellence and quarterly family visits.',
        message: 'Supporting teachers, guiding students and ensuring excellence in every step.',
        initials: 'NY',
        photoUrl: '/assets/schools/vis/leader-nirmla-yadav.jpg',
        email: 'viceprincipal@viratinternational.edu.in',
        contactVisible: true,
      },
    ];

    const pendingAdminVerification: SchoolVerificationFlag[] = [
      {
        id: 'ver-director-spelling',
        fieldLabel: "Director's Name Spelling",
        currentValue: 'Dr. Saurav Yadav',
        discrepancyNote: 'Supplied brochure prints "Dr. Sourabh Yadav"; official instruction lists "Dr. Saurav Yadav". Confirm preferred spelling.',
        status: 'Pending Approval',
      },
      {
        id: 'ver-principal-display',
        fieldLabel: "Principal's Formal Title / Display Name",
        currentValue: "Niharika Yadav Ma'am",
        discrepancyNote: 'Brochure prints "Niharika Ma\'am"; profile currently displays "Niharika Yadav Ma\'am". Confirm preferred formal title.',
        status: 'Pending Approval',
      },
      {
        id: 'ver-secondary-phone',
        fieldLabel: 'Secondary Contact Number',
        currentValue: 'Not configured',
        discrepancyNote: 'Primary contact +91 9992023224 is verified; add secondary admissions helpline if required.',
        status: 'Pending Approval',
      },
      {
        id: 'ver-preprimary-availability',
        fieldLabel: 'Pre-Primary Admission Offering',
        currentValue: 'Classes 1–12 (Pre-Primary Configurable)',
        discrepancyNote: 'Confirm whether Nursery / LKG / UKG admissions should be displayed as open for Session 2026–27.',
        status: 'Pending Approval',
      },
      {
        id: 'ver-infra-counts',
        fieldLabel: 'Current Infrastructure Counts',
        currentValue: 'Configurable (Labs / Smart Panels / Buses)',
        discrepancyNote: 'Exact room, digital panel, VR headset, and bus counts await final administrator verification.',
        status: 'Pending Approval',
      },
    ];

    return {
      schoolId: school.id,
      slug: 'vis',
      shortName: 'VIS',
      logoUrl: '/assets/schools/vis/vis-logo.png',
      tagline: 'READ | LEAD | SUCCEED',
      motto: 'Where Every Child Learns, Grows and Shines. · More Than a School – A Family for Life.',
      establishedYear: 'HBSE · Code 15390',
      gradesOffered: 'Classes 1–12 (Science · Commerce · Humanities) · Pre-Primary Configurable',
      hbseSchoolCode: '15390',
      curriculum: 'NCERT/SCERT Haryana-based',
      streams: ['Science', 'Commerce', 'Humanities'],
      prePrimaryConfigurable: true,
      affiliationNote: 'Haryana Board (HBSE) · School Code: 15390 · UDISE: 06170506608 · NCERT/SCERT Haryana',
      heroImageUrl: '/assets/schools/vis/vis-vr-hero.jpg',
      heroHighlightBadge: `Admissions Open · Session ${school.session || '2026-27'} · HBSE Code 15390`,
      accentTheme: 'royal_navy',
      admissionsOpen: true,
      admissionsSession: school.session || '2026-27',
      admissionsHeadline: `Admissions Open (${school.session || '2026-27'}) — Classes 1–12 (Science, Commerce & Humanities)`,
      philosophy,
      principalMessage: {
        authorName: "Niharika Yadav Ma'am",
        roleTitle: 'Principal, Virat International School',
        quote: 'Our focus is on holistic development, academic excellence, life skills, discipline and values. We strive to create a happy and safe environment where every child feels heard, supported and inspired.',
        fullMessage: 'Welcome to Virat International School, Kapriwas, Rewari (Haryana). Guided by our philosophy — READ to gain knowledge, LEAD to build character, and SUCCEED to create a brighter future — we combine NCERT/SCERT Haryana Board academics with VR Classes, Mind Mapping, Interactive Digital Panels, Daily Computer Classes, Personalised Counselling, and Four Annual Home Counselling Visits. Together with parents, we are more than a school — a family for life.',
        photoUrl: '/assets/schools/vis/leader-niharika-yadav.jpg',
      },
      salientFeatures: buildVisSixteenUsps(),
      managementTeam,
      facilityCategories: buildVisTwelveFacilities(),
      parentEngagementHighlights,
      pendingAdminVerification,
      gallery: buildVisAuthenticGallery(),
      campusStats: [
        {
          label: 'HBSE School Code',
          value: 15390,
          sublabel: 'UDISE: 06170506608',
        },
        {
          label: 'Home Visits / Year',
          value: 4,
          suffix: '×',
          sublabel: 'Annual parent counselling',
        },
        {
          label: 'Signature School USPs',
          value: 16,
          sublabel: 'VR, Mind Maps, DMIT & more',
        },
        {
          label: 'Senior Streams',
          value: 3,
          sublabel: 'Science · Commerce · Humanities',
        },
      ],
      contact: {
        address: 'Kapriwas to Pataudi Road, 1 KM from NH-8, Kapriwas, Rewari, Haryana, India',
        phone: '+91 9992023224',
        admissionsPhone: '+91 9992023224',
        email: 'viratintschool@gmail.com',
        officeHours: 'Mon – Sat · 08:00 AM to 03:00 PM IST',
        websiteDomainLabel: 'www.viratschool.com',
      },
      updatedAt: new Date().toISOString(),
      updatedBy: 'VIS Official Profile Calibration',
    };
  }

  // Non-VIS onboarded partner schools (strictly multi-tenant isolated!)
  const slug = toSchoolWebsiteSlug(school.code || school.name);
  const principalUser =
    schoolUsers.find((u) => u.role === 'principal' && !String(u.designation || '').toLowerCase().includes('vice')) ||
    schoolUsers.find((u) => u.role === 'principal');
  const adminUser = schoolUsers.find((u) => u.role === 'school_admin');
  const coordUser = schoolUsers.find((u) => u.role === 'coordinator');
  const seniorTeacher = schoolUsers.find((u) => u.role === 'teacher');

  const accentTheme: SchoolAccentTheme = isSvm
    ? 'emerald_heritage'
    : isDpa
      ? 'crimson_scholar'
      : 'royal_navy';

  const principalName =
    principalUser?.name ||
    (isSvm ? 'Dr. Meenakshi Deswal' : 'Principal Academic Leadership');
  const adminName = adminUser?.name || (isSvm ? 'Rajeshwar Sharma' : 'Campus Director');
  const coordName = coordUser?.name || (isSvm ? 'Anil Kumar Hooda' : 'Academic Coordinator');

  const managementTeam: SchoolManagementMember[] = [
    {
      id: `${school.id}-mgmt-1`,
      name: adminName,
      roleTitle: 'Management & School Administrator',
      qualification: 'M.A., B.Ed. · Educational Governance & Campus Operations',
      bio: `Oversees campus infrastructure, UDISE+ & ${school.board} compliance, transport safety, and transparent parent-school governance at ${school.name}.`,
      message: 'Every child deserves a safe, disciplined, and inspiring environment where families are true partners in learning.',
      initials: getInitials(adminName),
      email: adminUser?.email || `admin@${slug}.edu.in`,
      contactVisible: true,
    },
    {
      id: `${school.id}-mgmt-2`,
      name: principalName,
      roleTitle: 'Principal & Head of Institution',
      qualification: 'Ph.D., M.Ed. · Academic Leadership & Student Development',
      bio: `Leads curriculum innovation, daily classroom quality, faculty mentoring, and 360° student growth across academic and co-curricular domains.`,
      message: 'Education is not just preparing for exams — it is building clarity of thought, strong character, and lifelong confidence.',
      initials: getInitials(principalName),
      email: principalUser?.email || `principal@${slug}.edu.in`,
      contactVisible: true,
    },
    {
      id: `${school.id}-mgmt-3`,
      name: coordName,
      roleTitle: 'Academic Coordinator & Examination Head',
      qualification: 'M.Sc., B.Ed. · Curriculum & Board Readiness',
      bio: `Coordinates lesson planning, unit tests, reading & numeracy mastery benchmarks, and Day-1 to Day-30 new admission mentoring.`,
      initials: getInitials(coordName),
      email: coordUser?.email || `academics@${slug}.edu.in`,
      contactVisible: true,
    },
    {
      id: `${school.id}-mgmt-4`,
      name: seniorTeacher?.name || 'Admissions & Student Welfare Desk',
      roleTitle: seniorTeacher?.designation || 'Senior Faculty & Student Care Lead',
      qualification: seniorTeacher?.subjectSpecialty || 'Post-Graduate Faculty · Student Mentorship',
      bio: 'Guides families through campus tours, document verification, house allotment, and smooth first-month student integration.',
      initials: getInitials(seniorTeacher?.name || 'Student Care'),
      email: seniorTeacher?.email || `admissions@${slug}.edu.in`,
      contactVisible: true,
    },
  ];

  const tagline = isSvm
    ? 'Rooted in Sanskar & Values. Powered by Modern STEM & 360° Academic Excellence.'
    : isDpa
      ? 'Nurturing Curiosity, Strong Foundations & Holistic Growth in Karnal.'
      : `Delivering 360° Academic Excellence, Strong Values & Modern Learning in ${school.city}.`;

  const motto = isSvm
    ? 'Satyameva Jayate · Knowledge with Integrity'
    : 'Learn with Purpose · Lead with Courage';

  const address = isSvm
    ? 'Sector 7 Educational Enclave, Thanesar, Kurukshetra, Haryana – 136118'
    : isDpa
      ? 'Kunjpura Road Academic Campus, Sector 12, Karnal, Haryana – 132001'
      : `Main Campus Road, ${school.city}, ${school.state}`;

  const phone = isSvm ? '+91 98120 55419' : '+91 98120 66211';
  const studentRatio = Math.max(12, Math.round((school.studentCount || 450) / Math.max(1, school.teacherCount || 25)));

  return {
    schoolId: school.id,
    slug,
    shortName: school.code || slug.toUpperCase(),
    tagline,
    motto,
    establishedYear: isSvm ? '2008' : '2016',
    gradesOffered: 'Nursery to Class XII (Science · Commerce · Humanities)',
    curriculum: 'NCERT/SCERT Aligned',
    streams: ['Science', 'Commerce', 'Humanities'],
    affiliationNote: `${school.board} Affiliated · UDISE+ ${school.udiseCode} · MIS ${school.haryanaMisCode}`,
    heroImageUrl: '/assets/images/hero_campus_india_1794713007660.jpg',
    heroHighlightBadge: `Admissions Open · Session ${school.session}`,
    accentTheme,
    admissionsOpen: true,
    admissionsSession: school.session || '2026-27',
    admissionsHeadline: `Admissions Open for ${school.session || '2026-27'} — Nursery to Class XI`,
    principalMessage: {
      authorName: principalName,
      roleTitle: `Principal, ${school.name}`,
      quote: `At ${school.name}, we combine disciplined Indian values with transparent digital monitoring so every child reaches their full potential.`,
      fullMessage: `Welcome to ${school.name}, ${school.city}. As a Rai Plus powered 360° Smart Campus, we ensure that no student falls behind silently.`,
    },
    salientFeatures: buildDefaultFeatures(school),
    managementTeam,
    gallery: buildDefaultGallery(school),
    campusStats: [
      { label: 'Active Students', value: school.studentCount || 500, suffix: '+', sublabel: 'Tracked with 360° care' },
      { label: 'Dedicated Faculty', value: school.teacherCount || 28, suffix: '+', sublabel: `1:${studentRatio} student-teacher ratio` },
      { label: 'Digital Chapters', value: 127, suffix: '+', sublabel: 'Interactive Classes 6–12 hub' },
      { label: 'Board & Skill Readiness', value: 100, suffix: '%', sublabel: `${school.board} · NEP 2020 aligned` },
    ],
    contact: {
      address,
      phone,
      admissionsPhone: phone,
      email: adminUser?.email || `admissions@${slug}.edu.in`,
      officeHours: 'Mon – Sat · 08:00 AM to 03:00 PM IST',
      websiteDomainLabel: `thecounsellorai.com/school/${slug}`,
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'Rai Plus Onboarded School Engine',
  };
}

export function filterSchoolGallery(
  items: SchoolGalleryItem[],
  category: 'All' | SchoolGalleryCategory,
): SchoolGalleryItem[] {
  if (category === 'All') return items;
  return items.filter((item) => item.category === category);
}

export function validateSchoolWebsiteAdmissionForm(input: {
  studentName: string;
  applyingClass: string;
  parentName: string;
  phone: string;
}): string | null {
  if (!input.studentName.trim()) return 'Please enter the student’s full name.';
  if (!input.applyingClass.trim()) return 'Please select the class applying for.';
  if (!input.parentName.trim()) return 'Please enter the parent or guardian name.';
  if (input.phone.replace(/\D/g, '').length < 8) {
    return 'Please enter a valid 10-digit mobile or WhatsApp number.';
  }
  return null;
}
