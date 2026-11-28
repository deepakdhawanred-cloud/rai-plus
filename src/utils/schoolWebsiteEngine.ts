import type { School, UserAccount } from '../types';
import type {
  SchoolAccentTheme,
  SchoolGalleryCategory,
  SchoolGalleryItem,
  SchoolManagementMember,
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
  return String(codeOrName || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'school';
}

export function resolveSchoolBySlugOrId(schools: School[], slugOrId: string): School | null {
  const clean = String(slugOrId || '').trim().toLowerCase();
  if (!clean) return schools[0] ?? null;

  const exactId = schools.find((s) => s.id.toLowerCase() === clean);
  if (exactId) return exactId;

  const exactCode = schools.find(
    (s) => s.code.toLowerCase() === clean || toSchoolWebsiteSlug(s.code) === clean,
  );
  if (exactCode) return exactCode;

  const nameSlug = schools.find((s) => toSchoolWebsiteSlug(s.name) === clean);
  if (nameSlug) return nameSlug;

  // Support shorthand aliases like "vis", "svm", "dpa"
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
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'SC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function buildDefaultGallery(school: School): SchoolGalleryItem[] {
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
      title: 'Nutrition, Food Science & Experiential Activities',
      category: 'Labs & STEM',
      imageUrl: '/assets/images/science_food_test_lab_1795355235616.jpg',
      caption: 'Activity-based NCERT/SCERT demonstrations connecting textbook chapters with everyday scientific reasoning.',
      tag: 'Experiential',
    },
    {
      id: `${school.id}-gal-5`,
      title: 'Personalised Career & OLQ Mentorship Studio',
      category: 'Sports & Guidance',
      imageUrl: '/assets/images/career_counselling_session_1794713007994.jpg',
      caption: 'Individual student mentorship covering Officer Like Qualities (OLQs), study habits, and senior stream pathways.',
      tag: 'Mentorship',
    },
    {
      id: `${school.id}-gal-6`,
      title: 'Balanced Health, Mid-Day Discipline & Wellness Culture',
      category: 'Events & Culture',
      imageUrl: '/assets/images/balanced_indian_thali_1795355235480.jpg',
      caption: 'Holistic focus on student wellbeing, healthy habits, annual exhibitions, and parent community engagement.',
      tag: 'Holistic Care',
    },
  ];
}

function buildDefaultFeatures(school: School): SchoolWebsiteFeature[] {
  return [
    {
      id: 'feat-academics-360',
      title: '360° Academic & Daily Progress Tracking',
      description: `Every learner in ${school.board} classes receives daily notebook verification, chapter mastery tracking, and timely parent alerts.`,
      badge: 'Academic Excellence',
      iconKey: 'academics',
      highlightMetric: 'Daily Tracking',
    },
    {
      id: 'feat-digital-lab',
      title: 'Interactive Learning Portal & 3D Concept Studio',
      description: 'Classes 6–12 digital chapter hub with visual flowcharts, mindmaps, guided practice, and structured board exam revision.',
      badge: 'NEP 2020 Ready',
      iconKey: 'digital',
      highlightMetric: '127 Chapters',
    },
    {
      id: 'feat-olq-leadership',
      title: 'Character, Discipline & 15 OLQ Development',
      description: 'Beyond marks: systematic mentoring of leadership, communication, teamwork, responsibility, and confident public speaking.',
      badge: 'Holistic Growth',
      iconKey: 'leadership',
      highlightMetric: '15 Core Traits',
    },
    {
      id: 'feat-stem-labs',
      title: 'Composite Science, Computer & Math Labs',
      description: 'Modern practical laboratories, guided experiential demonstrations, and foundational reading & numeracy mastery clinics.',
      badge: 'Hands-On STEM',
      iconKey: 'stem',
      highlightMetric: 'Practical Labs',
    },
    {
      id: 'feat-safe-transport',
      title: 'GPS-Monitored Transport & Verified Campus Gate',
      description: 'Dedicated school bus routes with trained attendants, digital student early-exit gate passes, and verified visitor logs.',
      badge: 'Campus Safety',
      iconKey: 'transport',
      highlightMetric: 'Verified Gate',
    },
    {
      id: 'feat-parent-portal',
      title: 'Live Parent App, Transparent Fees & Day-1 Care',
      description: 'Instant attendance updates, digital fee receipts, UDISE+ compliant document vault, and structured 30-day new student onboarding.',
      badge: 'Parent Trust',
      iconKey: 'transparency',
      highlightMetric: '100% Transparent',
    },
  ];
}

export function buildDefaultSchoolWebsiteProfile(
  school: School,
  schoolUsers: UserAccount[] = [],
): SchoolWebsiteProfile {
  const slug = toSchoolWebsiteSlug(school.code || school.name);
  const principalUser = schoolUsers.find((u) => u.role === 'principal');
  const adminUser = schoolUsers.find((u) => u.role === 'school_admin');
  const coordUser = schoolUsers.find((u) => u.role === 'coordinator');
  const seniorTeacher = schoolUsers.find((u) => u.role === 'teacher');

  const isVis = school.id === 'school-vis-jjr';
  const isSvm = school.id === 'school-svm-kk';
  const isDpa = school.id === 'school-dpa-knl';

  const accentTheme: SchoolAccentTheme = isSvm
    ? 'emerald_heritage'
    : isDpa
      ? 'crimson_scholar'
      : 'royal_navy';

  const principalName =
    principalUser?.name ||
    (isVis
      ? 'Dr. Deepak Dhawan'
      : isSvm
        ? 'Dr. Meenakshi Deswal'
        : 'Principal Academic Leadership');
  const adminName =
    adminUser?.name ||
    (isVis ? 'Rameshwar Dayal Kaushik' : isSvm ? 'Rajeshwar Sharma' : 'Campus Director');
  const coordName =
    coordUser?.name ||
    (isVis ? 'Sunita Devi Ahlawat' : isSvm ? 'Anil Kumar Hooda' : 'Academic Coordinator');

  const managementTeam: SchoolManagementMember[] = [
    {
      id: `${school.id}-mgmt-1`,
      name: adminName,
      roleTitle: isVis ? 'Director & School Administrator' : 'Management & School Administrator',
      qualification: 'M.A., B.Ed. · Educational Governance & Campus Operations',
      bio: `Oversees campus infrastructure, UDISE+ & ${school.board} compliance, transport safety, and transparent parent-school governance at ${school.name}.`,
      message: 'Every child deserves a safe, disciplined, and inspiring environment where families are true partners in learning.',
      initials: getInitials(adminName),
      email: adminUser?.email || `admin@${slug}.edu.in`,
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
    },
    {
      id: `${school.id}-mgmt-3`,
      name: coordName,
      roleTitle: 'Academic Coordinator & Examination Head',
      qualification: 'M.Sc., B.Ed. · Curriculum & Board Readiness',
      bio: `Coordinates lesson planning, unit tests, reading & numeracy mastery benchmarks, and Day-1 to Day-30 new admission mentoring.`,
      initials: getInitials(coordName),
      email: coordUser?.email || `academics@${slug}.edu.in`,
    },
    {
      id: `${school.id}-mgmt-4`,
      name: seniorTeacher?.name || 'Admissions & Student Welfare Desk',
      roleTitle: seniorTeacher?.designation || 'Senior Faculty & Student Care Lead',
      qualification: seniorTeacher?.subjectSpecialty || 'Post-Graduate Faculty · Student Mentorship',
      bio: 'Guides families through campus tours, document verification, house allotment, and smooth first-month student integration.',
      initials: getInitials(seniorTeacher?.name || 'Student Care'),
      email: seniorTeacher?.email || `admissions@${slug}.edu.in`,
    },
  ];

  const tagline = isVis
    ? 'Shaping Disciplined Thinkers, Confident Leaders & Future-Ready Scholars in Jhajjar.'
    : isSvm
      ? 'Rooted in Sanskar & Values. Powered by Modern STEM & 360° Academic Excellence.'
      : isDpa
        ? 'Nurturing Curiosity, Strong Foundations & Holistic Growth in Karnal.'
        : `Delivering 360° Academic Excellence, Strong Values & Modern Learning in ${school.city}.`;

  const motto = isVis
    ? 'Vidya Dadati Vinayam · Excellence with Character'
    : isSvm
      ? 'Satyameva Jayate · Knowledge with Integrity'
      : 'Learn with Purpose · Lead with Courage';

  const address = isVis
    ? 'Gwalison Road, Near Kapriwas Chowk, Jhajjar, Haryana – 124103'
    : isSvm
      ? 'Sector 7 Educational Enclave, Thanesar, Kurukshetra, Haryana – 136118'
      : isDpa
        ? 'Kunjpura Road Academic Campus, Sector 12, Karnal, Haryana – 132001'
        : `Main Campus Road, ${school.city}, ${school.state}`;

  const phone = isVis
    ? '+91 98120 44108'
    : isSvm
      ? '+91 98120 55419'
      : '+91 98120 66211';

  const studentRatio = Math.max(12, Math.round((school.studentCount || 450) / Math.max(1, school.teacherCount || 25)));

  return {
    schoolId: school.id,
    slug,
    shortName: school.code || slug.toUpperCase(),
    tagline,
    motto,
    establishedYear: isVis ? '2014' : isSvm ? '2008' : '2016',
    gradesOffered: 'Nursery to Class XII (Science · Commerce · Humanities)',
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
      quote: isVis
        ? 'At Virat International School, every student is personally known, mentored daily, and guided to thrive academically and emotionally.'
        : `At ${school.name}, we combine disciplined Indian values with transparent digital monitoring so every child reaches their full potential.`,
      fullMessage: `Welcome to ${school.name}, ${school.city}. As a Rai Plus powered 360° Smart Campus, we ensure that no student falls behind silently. From daily classroom notebook feedback and foundational reading/numeracy mastery to modern science labs, safe GPS transport, and structured Day-1 onboarding for every new admission, our faculty works hand-in-hand with parents every single day.`,
    },
    salientFeatures: buildDefaultFeatures(school),
    managementTeam,
    gallery: buildDefaultGallery(school),
    campusStats: [
      {
        label: 'Active Students',
        value: school.studentCount || 500,
        suffix: '+',
        sublabel: 'Tracked with 360° care',
      },
      {
        label: 'Dedicated Faculty',
        value: school.teacherCount || 28,
        suffix: '+',
        sublabel: `1:${studentRatio} student-teacher ratio`,
      },
      {
        label: 'Digital Chapters',
        value: 127,
        suffix: '+',
        sublabel: 'Interactive Classes 6–12 hub',
      },
      {
        label: 'Board & Skill Readiness',
        value: 100,
        suffix: '%',
        sublabel: `${school.board} · NEP 2020 aligned`,
      },
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
