import crypto from 'node:crypto';
import type { Express, NextFunction, Request, Response } from 'express';
import type { OlqKey, UserAccount, UserRole } from '../src/types';
import type {
  CareerBudgetInput,
  CareerPersonalityInput,
  CommercialPricingRegistry,
  ProductEnquiryRecord,
  SsbAssessmentSessionRecord,
  SsbPracticeSet,
  SsbStudentProfile,
  SsbTestFormat,
  CareerUserWorkspaceState,
} from '../src/types/flagshipProducts';
import { getDb, saveDb } from './store.ts';
import type { DatabaseState } from './seedData.ts';
import { hashPassword, sanitizeUserForClient, setSessionCookie } from './security.ts';
import { createDefaultCommercialPricingRegistry } from '../src/utils/commercialPricingRegistry.ts';
import {
  SSB_ACADEMY_ETHICAL_DISCLAIMER,
  analyzeSsbResponse,
  buildSsbOlqProfile,
  generateInitialSsbPracticeSets,
} from '../src/utils/ssbAcademyEngine.ts';
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
} from '../src/utils/careerFiveStageEngine.ts';

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
  sessionToken?: string;
}

interface FlagshipRouteDeps {
  requireAuth: (req: AuthedRequest, res: Response, next: NextFunction) => void;
  requireRoles: (allowed: UserRole[]) => (req: AuthedRequest, res: Response, next: NextFunction) => void;
  appendAuditLog: (params: {
    schoolId: string | null;
    actor: UserAccount;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
  createSessionForUser: (user: UserAccount, res: Response, req: Request) => string;
}

export function createDefaultSsbStudentProfile(userId: string): SsbStudentProfile {
  const nowIso = new Date().toISOString();
  const validUntil = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  return {
    userId,
    targetEntry: 'NDA',
    attemptNumber: 1,
    streakDays: 0,
    lastPracticedDate: null,
    selfReflections: [],
    subscription: {
      userId,
      planStatus: 'Trial Active',
      billingTier: 'demo',
      startedAt: nowIso.slice(0, 10),
      validUntil,
      unlockedSetLimit: 12,
      couponApplied: null,
      paymentHistory: [
        {
          id: `ssb-pay-trial-${userId}`,
          date: nowIso.slice(0, 10),
          amountInr: 0,
          gstInr: 0,
          status: 'Trial',
          reference: 'FREE-7DAY-DEMO',
        },
      ],
    },
    sessions: [],
  };
}

export function createDefaultCareerWorkspace(userId: string): CareerUserWorkspaceState {
  return {
    userId,
    stage1Capacity: null,
    stage2Personality: null,
    stage3Budget: null,
    selectedCareerIds: [],
    stage4Matches: [],
    stage5Roadmap: null,
    savedReports: [],
    updatedAt: new Date().toISOString(),
  };
}

export function ensureFlagshipProductsInitialized(db: DatabaseState): void {
  let dirty = false;

  if (!db.commercialRegistry) {
    db.commercialRegistry = createDefaultCommercialPricingRegistry();
    dirty = true;
  }
  // Always enforce Career Intelligence is ₹0 FREE
  if (db.commercialRegistry.careerIntelligence.priceInr !== 0) {
    db.commercialRegistry.careerIntelligence.priceInr = 0;
    dirty = true;
  }

  if (!Array.isArray(db.ssbPracticeSets) || db.ssbPracticeSets.length < 100) {
    db.ssbPracticeSets = generateInitialSsbPracticeSets();
    dirty = true;
  }
  if (!db.ssbStudentProfiles) {
    db.ssbStudentProfiles = {};
    dirty = true;
  }
  if (!db.careerUserWorkspaces) {
    db.careerUserWorkspaces = {};
    dirty = true;
  }
  if (!Array.isArray(db.productEnquiries)) {
    db.productEnquiries = [];
    dirty = true;
  }
  if (!Array.isArray(db.dataDeletionRequests)) {
    db.dataDeletionRequests = [];
    dirty = true;
  }

  // Ensure standalone demo users exist (completely isolated with schoolId: null)
  const ssbDemoId = 'usr-ssb-aspirant';
  if (!db.users.some((u) => u.id === ssbDemoId)) {
    db.users.push({
      id: ssbDemoId,
      name: 'Cadet Arjun Pratap',
      email: 'ssb.aspirant@raiplus.in',
      role: 'ssb_student',
      schoolId: null,
      designation: 'SSB Aspirant (NDA / CDS Standalone)',
      consentAcceptedAt: '2026-04-01T09:00:00.000Z',
      productEntitlements: ['ssb_academy'],
    });
    dirty = true;
  }

  const careerDemoId = 'usr-career-explorer';
  if (!db.users.some((u) => u.id === careerDemoId)) {
    db.users.push({
      id: careerDemoId,
      name: 'Riya Deshmukh',
      email: 'career.explorer@raiplus.in',
      role: 'career_user',
      schoolId: null,
      designation: 'Free Career Intelligence Explorer',
      consentAcceptedAt: '2026-04-01T09:00:00.000Z',
      productEntitlements: ['career_intelligence'],
    });
    dirty = true;
  }

  if (!db.ssbStudentProfiles[ssbDemoId]) {
    const profile = createDefaultSsbStudentProfile(ssbDemoId);
    profile.streakDays = 3;
    profile.lastPracticedDate = new Date().toISOString().slice(0, 10);
    profile.subscription.unlockedSetLimit = 100; // Full demo preview in demo mode
    profile.subscription.planStatus = 'Subscribed';
    // Seed 2 starter practice sessions so OLQ corroboration & progress UI are alive immediately
    const watSet1 = db.ssbPracticeSets.find((s) => s.format === 'WAT');
    const srtSet1 = db.ssbPracticeSets.find((s) => s.format === 'SRT');
    if (watSet1) {
      const watResponses = watSet1.stimuli.slice(0, 3).map((st) =>
        analyzeSsbResponse({
          stimulus: st,
          responseText: `Structured preparation around ${st.prompt.toLowerCase()} helps a team achieve practical milestones calmly.`,
          timeTakenSeconds: 11,
        }),
      );
      profile.sessions.push({
        id: 'ssb-sess-seed-wat-1',
        userId: ssbDemoId,
        setId: watSet1.id,
        setCode: watSet1.code,
        setTitle: watSet1.title,
        format: 'WAT',
        mode: 'timed',
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000 + 180000).toISOString(),
        totalDurationSeconds: 180,
        responses: watResponses,
        overallPracticality: Math.round(
          watResponses.reduce((a, b) => a + b.practicalityScore, 0) / watResponses.length,
        ),
        overallClarity: Math.round(
          watResponses.reduce((a, b) => a + b.clarityScore, 0) / watResponses.length,
        ),
      });
    }
    if (srtSet1) {
      const srtResponses = srtSet1.stimuli.slice(0, 3).map((st) =>
        analyzeSsbResponse({
          stimulus: st,
          responseText:
            'Assessed the immediate safety risk, coordinated nearby volunteers, delegated first-aid and communication, and stayed until resolved.',
          timeTakenSeconds: 24,
        }),
      );
      profile.sessions.push({
        id: 'ssb-sess-seed-srt-1',
        userId: ssbDemoId,
        setId: srtSet1.id,
        setCode: srtSet1.code,
        setTitle: srtSet1.title,
        format: 'SRT',
        mode: 'timed',
        startedAt: new Date(Date.now() - 43200000).toISOString(),
        completedAt: new Date(Date.now() - 43200000 + 240000).toISOString(),
        totalDurationSeconds: 240,
        responses: srtResponses,
        overallPracticality: Math.round(
          srtResponses.reduce((a, b) => a + b.practicalityScore, 0) / srtResponses.length,
        ),
        overallClarity: Math.round(
          srtResponses.reduce((a, b) => a + b.clarityScore, 0) / srtResponses.length,
        ),
      });
    }
    db.ssbStudentProfiles[ssbDemoId] = profile;
    dirty = true;
  }

  if (!db.careerUserWorkspaces[careerDemoId]) {
    db.careerUserWorkspaces[careerDemoId] = createDefaultCareerWorkspace(careerDemoId);
    dirty = true;
  }

  if (dirty) {
    saveDb();
  }
}

export function registerFlagshipProductsRoutes(app: Express, deps: FlagshipRouteDeps): void {
  const { requireAuth, requireRoles, appendAuditLog, createSessionForUser } = deps;

  // ============================================================================
  // PUBLIC COMMERCIAL REGISTRY, ENQUIRIES & ISOLATED SELF-REGISTRATION
  // ============================================================================

  app.get('/api/public/commercial-registry', (_req, res) => {
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const registry = db.commercialRegistry!;
    const sets = db.ssbPracticeSets || [];
    res.json({
      registry,
      ssbCatalogSummary: {
        totalSets: sets.filter((s) => s.published).length,
        watSets: sets.filter((s) => s.published && s.format === 'WAT').length,
        srtSets: sets.filter((s) => s.published && s.format === 'SRT').length,
        tatSets: sets.filter((s) => s.published && s.format === 'TAT').length,
        ppdtSets: sets.filter((s) => s.published && s.format === 'PPDT').length,
        freeDemoSets: sets.filter((s) => s.published && s.isFreeDemo).length,
        sampleWatStimuli: sets.find((s) => s.format === 'WAT')?.stimuli.slice(0, 4) || [],
        sampleSrtStimuli: sets.find((s) => s.format === 'SRT')?.stimuli.slice(0, 2) || [],
      },
      careerIntelligenceSummary: {
        priceInr: 0,
        stagesCount: 5,
        verifiedBypassCount: VERIFIED_BUDGET_BYPASS_PATHWAYS.length,
        marketOpportunitiesCount: VERIFIED_CAREER_MARKET_CATALOG.length,
      },
    });
  });

  app.post('/api/public/product-enquiry', (req, res) => {
    const body = (req.body || {}) as {
      product?: string;
      name?: string;
      contactName?: string;
      email?: string;
      phone?: string;
      organizationOrGoal?: string;
      organizationOrEntry?: string;
      message?: string;
    };
    const finalName = (body.name || body.contactName || '').trim();
    if (!finalName || !body.email?.trim() || !body.phone?.trim()) {
      res.status(400).json({ error: 'Name, email, and phone number are required.' });
      return;
    }
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const productMap: Record<string, ProductEnquiryRecord['product']> = {
      ssb_academy: 'SSB Academy',
      'SSB Academy': 'SSB Academy',
      career_intelligence: 'Career Intelligence',
      'Career Intelligence': 'Career Intelligence',
      school_erp: 'School ERP',
      'School ERP': 'School ERP',
      smart_campus: 'Smart Campus',
      'Smart Campus': 'Smart Campus',
      'AI Learning Ecosystem': 'AI Learning Ecosystem',
    };
    const record: ProductEnquiryRecord = {
      id: `penq-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      product: productMap[body.product || ''] || 'SSB Academy',
      name: finalName,
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      organizationOrGoal: (body.organizationOrGoal || body.organizationOrEntry || '').trim(),
      message: (body.message || '').trim() || 'Requested product information & onboarding callback.',
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    db.productEnquiries!.unshift(record);
    saveDb();
    res.status(201).json({ ok: true, enquiry: record });
  });

  app.post('/api/auth/register-ssb', (req, res) => {
    const {
      name,
      email,
      password,
      targetEntry,
      isMinor,
      guardianConsentName,
      consentAccepted,
    } = (req.body || {}) as {
      name?: string;
      email?: string;
      password?: string;
      targetEntry?: SsbStudentProfile['targetEntry'];
      isMinor?: boolean;
      guardianConsentName?: string;
      consentAccepted?: boolean;
    };

    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      res.status(400).json({ error: 'Name, valid email, and password (minimum 8 characters) are required.' });
      return;
    }
    if (!consentAccepted) {
      res.status(400).json({ error: 'Please accept the DPDP Privacy & Assessment Practice Notice to continue.' });
      return;
    }
    if (isMinor && (!guardianConsentName || guardianConsentName.trim().length < 2)) {
      res.status(400).json({
        error: 'Parent or legal guardian consent name is required for learners under 18 years of age (DPDP compliance).',
      });
      return;
    }

    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const normalizedEmail = email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
      return;
    }

    const user: UserAccount = {
      id: `usr-ssb-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      name: name.trim(),
      email: normalizedEmail,
      role: 'ssb_student',
      schoolId: null,
      designation: `SSB Aspirant (${targetEntry || 'NDA'})`,
      passwordHash: hashPassword(password),
      isMinor: Boolean(isMinor),
      guardianConsentName: isMinor ? guardianConsentName?.trim() : undefined,
      consentAcceptedAt: new Date().toISOString(),
      productEntitlements: ['ssb_academy'],
    };
    db.users.push(user);
    const profile = createDefaultSsbStudentProfile(user.id);
    if (targetEntry) profile.targetEntry = targetEntry;
    db.ssbStudentProfiles![user.id] = profile;

    const token = createSessionForUser(user, res, req);
    setSessionCookie(res, token, req);
    appendAuditLog({
      schoolId: null,
      actor: user,
      action: 'SSB_STUDENT_REGISTERED',
      entityType: 'UserAccount',
      entityId: user.id,
      detail: `${user.name} registered for standalone Rai Plus SSB Academy (${profile.targetEntry}).`,
    });
    saveDb();
    res.status(201).json({ token, user: sanitizeUserForClient(user), activeSchoolId: null });
  });

  app.post('/api/auth/register-career', (req, res) => {
    const {
      name,
      email,
      password,
      isMinor,
      guardianConsentName,
      consentAccepted,
    } = (req.body || {}) as {
      name?: string;
      email?: string;
      password?: string;
      isMinor?: boolean;
      guardianConsentName?: string;
      consentAccepted?: boolean;
    };

    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      res.status(400).json({ error: 'Name, valid email, and password (minimum 8 characters) are required.' });
      return;
    }
    if (!consentAccepted) {
      res.status(400).json({ error: 'Please accept the DPDP Privacy Notice to create your free Career Intelligence account.' });
      return;
    }
    if (isMinor && (!guardianConsentName || guardianConsentName.trim().length < 2)) {
      res.status(400).json({
        error: 'Parent or legal guardian consent name is required for learners under 18 years of age (DPDP compliance).',
      });
      return;
    }

    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const normalizedEmail = email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
      return;
    }

    const user: UserAccount = {
      id: `usr-career-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      name: name.trim(),
      email: normalizedEmail,
      role: 'career_user',
      schoolId: null,
      designation: 'Free Career Intelligence Explorer',
      passwordHash: hashPassword(password),
      isMinor: Boolean(isMinor),
      guardianConsentName: isMinor ? guardianConsentName?.trim() : undefined,
      consentAcceptedAt: new Date().toISOString(),
      productEntitlements: ['career_intelligence'],
    };
    db.users.push(user);
    db.careerUserWorkspaces![user.id] = createDefaultCareerWorkspace(user.id);

    const token = createSessionForUser(user, res, req);
    setSessionCookie(res, token, req);
    appendAuditLog({
      schoolId: null,
      actor: user,
      action: 'CAREER_USER_REGISTERED',
      entityType: 'UserAccount',
      entityId: user.id,
      detail: `${user.name} registered for 100% Free Rai Plus Career Intelligence.`,
    });
    saveDb();
    res.status(201).json({ token, user: sanitizeUserForClient(user), activeSchoolId: null });
  });

  // ============================================================================
  // PART A — ISOLATED SSB ACADEMY ROUTES (ssb_student | ssb_admin | super_admin)
  // ============================================================================

  const ssbRoles: UserRole[] = ['ssb_student', 'ssb_admin', 'super_admin'];

  const formatOlqPayload = (sessions: SsbAssessmentSessionRecord[], sets: SsbPracticeSet[]) => {
    const raw = buildSsbOlqProfile({ sessions, sets });
    const daySchedule: Array<{ day: string; focus: string; module: SsbTestFormat; minutes: number }> = [
      { day: 'Monday', focus: 'Timed WAT Speed & Authenticity Drill', module: 'WAT', minutes: 20 },
      { day: 'Tuesday', focus: 'SRT Practical Leadership & Emergency Reactions', module: 'SRT', minutes: 25 },
      { day: 'Wednesday', focus: 'TAT Visual Story Arc & Hero Action Depth', module: 'TAT', minutes: 30 },
      { day: 'Thursday', focus: 'PPDT Observation + 60s Voice Narration + GD', module: 'PPDT', minutes: 30 },
      { day: 'Friday', focus: 'Mixed Weak-Area WAT + SRT Refinement', module: 'SRT', minutes: 25 },
      { day: 'Saturday', focus: 'Full Timed Officer-Level Psychological Mock', module: 'TAT', minutes: 45 },
      { day: 'Sunday', focus: '15-OLQ Corroboration Review & Habit Journal', module: 'PPDT', minutes: 20 },
    ];
    return {
      indicators: raw.indicators,
      strengths: raw.observedStrengths.length > 0 ? raw.observedStrengths : ['Complete 2+ sets to identify corroborated OLQ strengths'],
      improvementAreas: raw.developingQualities,
      recurringMistakes: raw.recurringPatterns,
      recommendedSetIds: raw.recommendedNextSets.map((r) => r.set.id),
      weeklyPlan: daySchedule,
    };
  };

  app.get('/api/ssb-academy/workspace', requireAuth, requireRoles(ssbRoles), (req: AuthedRequest, res) => {
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    if (!db.ssbStudentProfiles![user.id]) {
      db.ssbStudentProfiles![user.id] = createDefaultSsbStudentProfile(user.id);
      saveDb();
    }
    const profile = db.ssbStudentProfiles![user.id];
    const allPublishedSets = (db.ssbPracticeSets || []).filter((s) => s.published);
    const olqProfile = formatOlqPayload(profile.sessions, allPublishedSets);
    const unlockedLimit =
      profile.subscription.planStatus === 'Subscribed' || user.role === 'super_admin' || user.role === 'ssb_admin'
        ? allPublishedSets.length
        : Math.max(profile.subscription.unlockedSetLimit, 4);

    // Determine which sets are unlocked for this student
    let unlockedCounter = 0;
    const practiceSets = allPublishedSets.map((set) => {
      const unlocked = set.isFreeDemo || unlockedCounter < unlockedLimit;
      if (!set.isFreeDemo) unlockedCounter += 1;
      return {
        ...set,
        unlocked,
      };
    });

    res.json({
      user: sanitizeUserForClient(user),
      profile,
      practiceSets,
      olqProfile,
      pricingConfig: db.commercialRegistry!.ssbAcademy,
      disclaimer: SSB_ACADEMY_ETHICAL_DISCLAIMER,
    });
  });

  app.post('/api/ssb-academy/sessions', requireAuth, requireRoles(ssbRoles), (req: AuthedRequest, res) => {
    const {
      setId,
      mode,
      responses,
      ppdtPerception,
      reflectionNote,
      totalDurationSeconds,
    } = (req.body || {}) as {
      setId?: string;
      mode?: SsbAssessmentSessionRecord['mode'];
      responses?: Array<{ stimulusId: string; candidateResponse: string; timeTakenSeconds: number }>;
      ppdtPerception?: SsbAssessmentSessionRecord['ppdtPerception'];
      reflectionNote?: string;
      totalDurationSeconds?: number;
    };

    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    const set = (db.ssbPracticeSets || []).find((s) => s.id === setId);
    if (!set) {
      res.status(404).json({ error: 'Practice set not found.' });
      return;
    }
    if (!Array.isArray(responses) || responses.length === 0) {
      res.status(400).json({ error: 'At least one response is required to evaluate this session.' });
      return;
    }

    if (!db.ssbStudentProfiles![user.id]) {
      db.ssbStudentProfiles![user.id] = createDefaultSsbStudentProfile(user.id);
    }
    const profile = db.ssbStudentProfiles![user.id];

    const analyzed = responses.map((entry) => {
      const stimulus = set.stimuli.find((st) => st.id === entry.stimulusId) || set.stimuli[0];
      return analyzeSsbResponse({
        stimulus,
        responseText: String(entry.candidateResponse || ''),
        timeTakenSeconds: Number(entry.timeTakenSeconds || 0),
      });
    });

    const overallPracticality = Math.round(
      analyzed.reduce((sum, r) => sum + r.practicalityScore, 0) / analyzed.length,
    );
    const overallClarity = Math.round(
      analyzed.reduce((sum, r) => sum + r.clarityScore, 0) / analyzed.length,
    );

    // Optional PPDT Group Discussion constructive coaching feedback
    let enrichedPpdt = ppdtPerception;
    if (set.format === 'PPDT' && ppdtPerception) {
      const gdText = (ppdtPerception.gdContribution || '').trim();
      const gdFeedback: string[] = [];
      if (gdText.length >= 60) {
        gdFeedback.push('Good structured GD contribution: clearly stated theme and invited consensus.');
      } else if (gdText.length > 0) {
        gdFeedback.push('Expand your GD contribution slightly to connect 2 peer viewpoints into one common group story.');
      }
      if (/common|agree|combine|together|consensus|team/i.test(gdText)) {
        gdFeedback.push('Constructive consensus-building tone detected — avoids aggressive dominance.');
      } else if (gdText.length > 0) {
        gdFeedback.push('Acknowledge at least one fellow candidate’s point before proposing the common group theme.');
      }
      if (ppdtPerception.narrationPracticed) {
        gdFeedback.push('60-second voice narration completed — keep maintaining steady pace and eye contact.');
      }
      enrichedPpdt = { ...ppdtPerception, gdFeedback };
    }

    const nowIso = new Date().toISOString();
    const todayStr = nowIso.slice(0, 10);
    if (profile.lastPracticedDate !== todayStr) {
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      profile.streakDays = profile.lastPracticedDate === yesterdayStr ? profile.streakDays + 1 : Math.max(1, profile.streakDays + 1);
      profile.lastPracticedDate = todayStr;
    }

    const sessionRecord: SsbAssessmentSessionRecord = {
      id: `ssb-sess-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      userId: user.id,
      setId: set.id,
      setCode: set.code,
      setTitle: set.title,
      format: set.format,
      mode: mode || 'timed',
      startedAt: new Date(Date.now() - Math.max(10, Number(totalDurationSeconds || 60)) * 1000).toISOString(),
      completedAt: nowIso,
      totalDurationSeconds: Math.max(10, Number(totalDurationSeconds || 60)),
      responses: analyzed,
      overallPracticality,
      overallClarity,
      ppdtPerception: enrichedPpdt,
      reflectionNote: reflectionNote?.trim() || undefined,
    };

    profile.sessions.unshift(sessionRecord);
    const olqProfile = formatOlqPayload(profile.sessions, db.ssbPracticeSets || []);
    saveDb();

    res.status(201).json({
      session: sessionRecord,
      profile,
      olqProfile,
    });
  });

  app.post('/api/ssb-academy/reflections', requireAuth, requireRoles(ssbRoles), (req: AuthedRequest, res) => {
    const { note, focusOlq } = (req.body || {}) as { note?: string; focusOlq?: OlqKey };
    if (!note?.trim()) {
      res.status(400).json({ error: 'Reflection note cannot be empty.' });
      return;
    }
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    const profile = db.ssbStudentProfiles![user.id] || createDefaultSsbStudentProfile(user.id);
    db.ssbStudentProfiles![user.id] = profile;
    profile.selfReflections.unshift({
      id: `refl-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      note: note.trim(),
      focusOlq: focusOlq || 'organising_ability',
    });
    saveDb();
    res.status(201).json({ reflections: profile.selfReflections });
  });

  app.patch('/api/ssb-academy/profile', requireAuth, requireRoles(ssbRoles), (req: AuthedRequest, res) => {
    const { targetEntry, attemptNumber } = (req.body || {}) as {
      targetEntry?: SsbStudentProfile['targetEntry'];
      attemptNumber?: number;
    };
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    const profile = db.ssbStudentProfiles![user.id] || createDefaultSsbStudentProfile(user.id);
    db.ssbStudentProfiles![user.id] = profile;
    if (targetEntry) profile.targetEntry = targetEntry;
    if (typeof attemptNumber === 'number' && attemptNumber >= 1 && attemptNumber <= 20) {
      profile.attemptNumber = Math.round(attemptNumber);
    }
    saveDb();
    res.json({ profile });
  });

  app.post('/api/ssb-academy/subscription/apply-coupon', requireAuth, requireRoles(ssbRoles), (req: AuthedRequest, res) => {
    const { code } = (req.body || {}) as { code?: string };
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const normalized = String(code || '').trim().toUpperCase();
    const coupon = db.commercialRegistry!.ssbAcademy.coupons.find(
      (c) => c.code.toUpperCase() === normalized && c.active,
    );
    if (!coupon) {
      res.status(404).json({ error: 'Coupon code is invalid or expired.' });
      return;
    }
    const user = req.user!;
    const profile = db.ssbStudentProfiles![user.id] || createDefaultSsbStudentProfile(user.id);
    db.ssbStudentProfiles![user.id] = profile;
    profile.subscription.couponApplied = coupon.code;
    saveDb();
    res.json({ ok: true, coupon, subscription: profile.subscription });
  });

  app.post('/api/ssb-academy/subscription/activate', requireAuth, requireRoles(ssbRoles), (req: AuthedRequest, res) => {
    const { billingTier } = (req.body || {}) as {
      billingTier?: 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
    };
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const ssbPricing = db.commercialRegistry!.ssbAcademy;
    if (ssbPricing.priceStatus !== 'published') {
      res.status(400).json({
        error:
          'Official SSB Academy paid subscription fees are currently enquiry-only until published by Super Admin. Please submit an Early Access enquiry or continue using your included demo & trial sets.',
      });
      return;
    }
    const priceMap: Record<'monthly' | 'quarterly' | 'half_yearly' | 'annual', { amount: number | null; days: number }> = {
      monthly: { amount: ssbPricing.monthlyInr, days: 30 },
      quarterly: { amount: ssbPricing.quarterlyInr, days: 90 },
      half_yearly: { amount: ssbPricing.halfYearlyInr, days: 180 },
      annual: { amount: ssbPricing.annualInr, days: 365 },
    };
    const chosen = priceMap[billingTier || 'quarterly'];
    if (!chosen || !chosen.amount || chosen.amount <= 0) {
      res.status(400).json({ error: 'Selected billing tier is not configured yet.' });
      return;
    }
    const user = req.user!;
    const profile = db.ssbStudentProfiles![user.id] || createDefaultSsbStudentProfile(user.id);
    db.ssbStudentProfiles![user.id] = profile;
    const coupon = ssbPricing.coupons.find(
      (c) => c.code === profile.subscription.couponApplied && c.active,
    );
    const netAmount = coupon
      ? Math.round(chosen.amount * (1 - coupon.discountPct / 100))
      : chosen.amount;
    const gstInr = Math.round((netAmount * ssbPricing.gstPct) / 100);
    const validUntil = new Date(Date.now() + chosen.days * 86400000).toISOString().slice(0, 10);

    profile.subscription.planStatus = 'Subscribed';
    profile.subscription.billingTier = billingTier || 'quarterly';
    profile.subscription.validUntil = validUntil;
    profile.subscription.unlockedSetLimit = ssbPricing.paidSetsIncluded || 100;
    profile.subscription.paymentHistory.unshift({
      id: `ssb-pay-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      amountInr: netAmount,
      gstInr,
      status: 'Paid',
      reference: `SSB-${(billingTier || 'quarterly').toUpperCase()}-${Date.now().toString().slice(-6)}`,
    });
    saveDb();
    res.json({ ok: true, subscription: profile.subscription });
  });

  app.get('/api/ssb-academy/privacy/export', requireAuth, requireRoles(ssbRoles), (req: AuthedRequest, res) => {
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    res.json({
      exportedAt: new Date().toISOString(),
      product: 'Rai Plus SSB Academy',
      account: sanitizeUserForClient(user),
      ssbProfile: db.ssbStudentProfiles![user.id] || null,
    });
  });

  app.post('/api/ssb-academy/privacy/delete-request', requireAuth, requireRoles(ssbRoles), (req: AuthedRequest, res) => {
    const { reason } = (req.body || {}) as { reason?: string };
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    const reqRecord = {
      id: `del-${Date.now()}`,
      userId: user.id,
      email: user.email,
      product: 'ssb_academy' as const,
      reason: (reason || 'User requested DPDP data erasure').trim(),
      status: 'Requested' as const,
      requestedAt: new Date().toISOString(),
    };
    db.dataDeletionRequests!.unshift(reqRecord);
    saveDb();
    res.status(201).json({ ok: true, request: reqRecord });
  });

  // ============================================================================
  // PART B — ISOLATED FREE CAREER INTELLIGENCE ROUTES (100% FREE — ₹0)
  // ============================================================================

  const careerRoles: UserRole[] = ['career_user', 'career_admin', 'super_admin'];

  app.get('/api/career-intelligence/workspace', requireAuth, requireRoles(careerRoles), (req: AuthedRequest, res) => {
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    if (!db.careerUserWorkspaces![user.id]) {
      db.careerUserWorkspaces![user.id] = createDefaultCareerWorkspace(user.id);
      saveDb();
    }
    res.json({
      user: sanitizeUserForClient(user),
      workspace: db.careerUserWorkspaces![user.id],
      stage1Questions: STAGE1_CAPACITY_QUESTIONS,
      verifiedBypassPathways: VERIFIED_BUDGET_BYPASS_PATHWAYS,
      marketCatalog: VERIFIED_CAREER_MARKET_CATALOG,
      alwaysFreeBadge: '100% FREE — ₹0 Forever',
      disclaimer: CAREER_INTELLIGENCE_ETHICAL_DISCLAIMER,
    });
  });

  app.post('/api/career-intelligence/stage1', requireAuth, requireRoles(careerRoles), (req: AuthedRequest, res) => {
    const { answers } = (req.body || {}) as { answers?: Record<string, number> };
    if (!answers || typeof answers !== 'object' || Object.keys(answers).length < 6) {
      res.status(400).json({ error: 'Please complete at least 6 assessment items across IQ, EQ, AQ & CQ.' });
      return;
    }
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    const ws = db.careerUserWorkspaces![user.id] || createDefaultCareerWorkspace(user.id);
    db.careerUserWorkspaces![user.id] = ws;
    ws.stage1Capacity = evaluateStage1Capacity(answers);
    ws.updatedAt = new Date().toISOString();
    saveDb();
    res.json({ stage1Capacity: ws.stage1Capacity, workspace: ws });
  });

  app.post('/api/career-intelligence/stage2', requireAuth, requireRoles(careerRoles), (req: AuthedRequest, res) => {
    const input = req.body as Partial<CareerPersonalityInput>;
    if (!input || typeof input.extroversion !== 'number') {
      res.status(400).json({ error: 'Personality and work-environment preferences are required.' });
      return;
    }
    const normalized: CareerPersonalityInput = {
      extroversion: Number(input.extroversion || 3),
      leadershipDrive: Number(input.leadershipDrive || 3),
      independence: Number(input.independence || 3),
      teamOrientation: Number(input.teamOrientation || 3),
      structurePreference: Number(input.structurePreference || 3),
      riskTolerance: Number(input.riskTolerance || 3),
      creativityDrive: Number(input.creativityDrive || 3),
      routineTolerance: Number(input.routineTolerance || 3),
      competitiveDrive: Number(input.competitiveDrive || 3),
      pressureComposure: Number(input.pressureComposure || 3),
      communicationStyle: input.communicationStyle || 'Analytical & Written',
      learningEnvironment: input.learningEnvironment || 'Hands-on Labs & Field',
      happinessDriver: String(input.happinessDriver || 'Solving meaningful real-world problems'),
      topMotivation: input.topMotivation || 'Mastery & Innovation',
    };
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    const ws = db.careerUserWorkspaces![user.id] || createDefaultCareerWorkspace(user.id);
    db.careerUserWorkspaces![user.id] = ws;
    ws.stage2Personality = evaluateStage2Personality(normalized);
    ws.updatedAt = new Date().toISOString();
    saveDb();
    res.json({ stage2Personality: ws.stage2Personality, workspace: ws });
  });

  const ensureCareerBaseline = (ws: CareerUserWorkspaceState) => {
    const capacity =
      ws.stage1Capacity ||
      evaluateStage1Capacity(
        Object.fromEntries(STAGE1_CAPACITY_QUESTIONS.map((q) => [q.id, q.options[1]?.score ?? 70])),
      );
    const personality =
      ws.stage2Personality ||
      evaluateStage2Personality({
        extroversion: 3,
        leadershipDrive: 3,
        independence: 4,
        teamOrientation: 4,
        structurePreference: 3,
        riskTolerance: 3,
        creativityDrive: 4,
        routineTolerance: 3,
        competitiveDrive: 3,
        pressureComposure: 4,
        communicationStyle: 'Analytical & Written',
        learningEnvironment: 'Hands-on Labs & Field',
        happinessDriver: 'Solving practical problems',
        topMotivation: 'Mastery & Innovation',
      });
    const budget =
      ws.stage3Budget ||
      evaluateStage3Budget({
        currentEducation: 'Class 12 / Undergraduate',
        annualFamilyEducationBudgetInr: 50000,
        availableSavingsInr: 25000,
        locationCityState: 'India',
        willingToRelocate: true,
        willingToWorkWhileStudying: true,
        preparationYearsAvailable: 3,
        categoryOrMeritScholarshipInterest: true,
      });
    return { capacity, personality, budget };
  };

  app.post('/api/career-intelligence/stage3', requireAuth, requireRoles(careerRoles), (req: AuthedRequest, res) => {
    const input = req.body as Partial<CareerBudgetInput>;
    const normalized: CareerBudgetInput = {
      currentEducation: String(input?.currentEducation || 'Class 12 / Undergraduate'),
      annualFamilyEducationBudgetInr: Math.max(0, Number(input?.annualFamilyEducationBudgetInr ?? 50000)),
      availableSavingsInr: Math.max(0, Number(input?.availableSavingsInr ?? 25000)),
      locationCityState: String(input?.locationCityState || 'India'),
      willingToRelocate: Boolean(input?.willingToRelocate ?? true),
      willingToWorkWhileStudying: Boolean(input?.willingToWorkWhileStudying ?? true),
      preparationYearsAvailable: Math.max(1, Math.min(8, Number(input?.preparationYearsAvailable ?? 3))),
      categoryOrMeritScholarshipInterest: Boolean(input?.categoryOrMeritScholarshipInterest ?? true),
    };
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    const ws = db.careerUserWorkspaces![user.id] || createDefaultCareerWorkspace(user.id);
    db.careerUserWorkspaces![user.id] = ws;
    ws.stage3Budget = evaluateStage3Budget(normalized);
    const base = ensureCareerBaseline(ws);
    ws.stage4Matches = matchStage4MarketOpportunities({
      capacity: base.capacity,
      personality: base.personality,
      budget: ws.stage3Budget,
      scopeFilter: 'All',
    });
    ws.updatedAt = new Date().toISOString();
    saveDb();
    res.json({ stage3Budget: ws.stage3Budget, stage4Matches: ws.stage4Matches, workspace: ws });
  });

  app.post('/api/career-intelligence/stage4', requireAuth, requireRoles(careerRoles), (req: AuthedRequest, res) => {
    const { scopeFilter, selectedCareerIds } = (req.body || {}) as {
      scopeFilter?: 'All' | 'India' | 'International';
      selectedCareerIds?: string[];
    };
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    const ws = db.careerUserWorkspaces![user.id] || createDefaultCareerWorkspace(user.id);
    db.careerUserWorkspaces![user.id] = ws;
    const base = ensureCareerBaseline(ws);
    ws.stage4Matches = matchStage4MarketOpportunities({
      capacity: base.capacity,
      personality: base.personality,
      budget: base.budget,
      scopeFilter: scopeFilter || 'All',
    });
    if (Array.isArray(selectedCareerIds)) {
      ws.selectedCareerIds = selectedCareerIds.slice(0, 3);
    }
    ws.updatedAt = new Date().toISOString();
    saveDb();
    res.json({ stage4Matches: ws.stage4Matches, workspace: ws });
  });

  app.post('/api/career-intelligence/stage5', requireAuth, requireRoles(careerRoles), (req: AuthedRequest, res) => {
    const { targetCareerId, saveReport } = (req.body || {}) as {
      targetCareerId?: string;
      saveReport?: boolean;
    };
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    const ws = db.careerUserWorkspaces![user.id] || createDefaultCareerWorkspace(user.id);
    db.careerUserWorkspaces![user.id] = ws;

    const chosenId = targetCareerId || ws.selectedCareerIds[0] || ws.stage4Matches[0]?.opportunity.id || VERIFIED_CAREER_MARKET_CATALOG[0].id;
    const chosenCareer =
      VERIFIED_CAREER_MARKET_CATALOG.find((c) => c.id === chosenId) || VERIFIED_CAREER_MARKET_CATALOG[0];
    const base = ensureCareerBaseline(ws);
    const roadmap = buildStage5CompetitionAndRoadmap({
      career: chosenCareer,
      capacity: base.capacity,
      budget: base.budget,
    });
    ws.stage5Roadmap = roadmap;
    if (saveReport !== false) {
      ws.savedReports.unshift({
        id: `crep-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
        title: `Career Intelligence Report — ${roadmap.targetCareerTitle}`,
        topCareerTitle: roadmap.targetCareerTitle,
        summary: `Capacity IQ ${ws.stage1Capacity?.iq.overallPct ?? '—'}% · Budget Tier: ${ws.stage3Budget?.capacityTier ?? 'Moderate'} · 6-Horizon Action Roadmap Ready.`,
      });
      ws.savedReports = ws.savedReports.slice(0, 12);
    }
    ws.updatedAt = new Date().toISOString();
    saveDb();
    res.json({ stage5Roadmap: ws.stage5Roadmap, workspace: ws });
  });

  app.get('/api/career-intelligence/privacy/export', requireAuth, requireRoles(careerRoles), (req: AuthedRequest, res) => {
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    res.json({
      exportedAt: new Date().toISOString(),
      product: 'Rai Plus Free Career Intelligence',
      account: sanitizeUserForClient(user),
      careerWorkspace: db.careerUserWorkspaces![user.id] || null,
    });
  });

  app.post('/api/career-intelligence/privacy/delete-request', requireAuth, requireRoles(careerRoles), (req: AuthedRequest, res) => {
    const { reason } = (req.body || {}) as { reason?: string };
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const user = req.user!;
    const reqRecord = {
      id: `del-${Date.now()}`,
      userId: user.id,
      email: user.email,
      product: 'career_intelligence' as const,
      reason: (reason || 'User requested DPDP data erasure').trim(),
      status: 'Requested' as const,
      requestedAt: new Date().toISOString(),
    };
    db.dataDeletionRequests!.unshift(reqRecord);
    saveDb();
    res.status(201).json({ ok: true, request: reqRecord });
  });

  // ============================================================================
  // PART E — SUPER ADMIN PRODUCTS, SSB BANK & CENTRAL PRICING REGISTRY CONSOLE
  // ============================================================================

  app.get(
    '/api/admin/flagship/overview',
    requireAuth,
    requireRoles(['super_admin', 'ssb_admin', 'career_admin']),
    (_req, res) => {
      const db = getDb();
      ensureFlagshipProductsInitialized(db);
      const ssbUsers = db.users.filter((u) => u.role === 'ssb_student');
      const careerUsers = db.users.filter((u) => u.role === 'career_user');
      const totalSsbSessions = Object.values(db.ssbStudentProfiles || {}).reduce(
        (sum, p) => sum + p.sessions.length,
        0,
      );
      const completedCareerRoadmaps = Object.values(db.careerUserWorkspaces || {}).filter(
        (w) => Boolean(w.stage5Roadmap),
      ).length;

      res.json({
        registry: db.commercialRegistry!,
        ssbPracticeSets: db.ssbPracticeSets || [],
        enquiries: db.productEnquiries || [],
        deletionRequests: db.dataDeletionRequests || [],
        metrics: {
          ssbStudentCount: ssbUsers.length,
          totalSsbSessions,
          careerUserCount: careerUsers.length,
          completedCareerRoadmaps,
          publishedSetsCount: (db.ssbPracticeSets || []).filter((s) => s.published).length,
          openEnquiriesCount: (db.productEnquiries || []).filter((e) => e.status === 'New').length,
        },
      });
    },
  );

  app.put(
    '/api/admin/commercial-registry',
    requireAuth,
    requireRoles(['super_admin']),
    (req: AuthedRequest, res) => {
      const incoming = req.body as Partial<CommercialPricingRegistry>;
      const db = getDb();
      ensureFlagshipProductsInitialized(db);
      const current = db.commercialRegistry!;
      const nowIso = new Date().toISOString();

      const updated: CommercialPricingRegistry = {
        ...current,
        ...incoming,
        schoolPackages: Array.isArray(incoming.schoolPackages)
          ? incoming.schoolPackages
          : current.schoolPackages,
        standaloneModules: Array.isArray(incoming.standaloneModules)
          ? incoming.standaloneModules
          : current.standaloneModules,
        topLearnerRewardsRule: incoming.topLearnerRewardsRule
          ? { ...current.topLearnerRewardsRule, ...incoming.topLearnerRewardsRule }
          : current.topLearnerRewardsRule,
        ssbAcademy: incoming.ssbAcademy
          ? {
              ...current.ssbAcademy,
              ...incoming.ssbAcademy,
              updatedAt: nowIso,
              updatedBy: req.user!.name,
            }
          : current.ssbAcademy,
        // Hard commercial invariant: Career Intelligence is ALWAYS ₹0 FREE
        careerIntelligence: {
          ...current.careerIntelligence,
          ...(incoming.careerIntelligence || {}),
          priceInr: 0,
        },
        publicCms: incoming.publicCms
          ? {
              ...current.publicCms,
              ...incoming.publicCms,
              ssbAcademy: {
                ...current.publicCms.ssbAcademy,
                ...(incoming.publicCms.ssbAcademy || {}),
              },
              careerIntelligence: {
                ...current.publicCms.careerIntelligence,
                ...(incoming.publicCms.careerIntelligence || {}),
              },
            }
          : current.publicCms,
        updatedAt: nowIso,
        updatedBy: req.user!.name,
      };

      db.commercialRegistry = updated;
      appendAuditLog({
        schoolId: null,
        actor: req.user!,
        action: 'COMMERCIAL_REGISTRY_UPDATED',
        entityType: 'CommercialPricingRegistry',
        entityId: 'global-pricing-registry',
        detail: `Updated central pricing & CMS registry (SSB status: ${updated.ssbAcademy.priceStatus}).`,
      });
      saveDb();
      res.json({ ok: true, registry: updated });
    },
  );

  app.post(
    '/api/admin/ssb/sets',
    requireAuth,
    requireRoles(['super_admin', 'ssb_admin']),
    (req: AuthedRequest, res) => {
      const { title, format, difficulty, categoryFocus, isFreeDemo, prompts } = (req.body || {}) as {
        title?: string;
        format?: SsbTestFormat;
        difficulty?: SsbPracticeSet['difficulty'];
        categoryFocus?: string;
        isFreeDemo?: boolean;
        prompts?: string[];
      };
      if (!title?.trim() || !format || !Array.isArray(prompts) || prompts.length === 0) {
        res.status(400).json({ error: 'Title, format (WAT/SRT/TAT/PPDT), and at least one prompt are required.' });
        return;
      }
      const db = getDb();
      ensureFlagshipProductsInitialized(db);
      const nextNum = (db.ssbPracticeSets?.length || 0) + 1;
      const newSet: SsbPracticeSet = {
        id: `ssb-set-custom-${Date.now()}`,
        setNumber: nextNum,
        code: `${format}-${String(nextNum).padStart(3, '0')}`,
        title: title.trim(),
        format,
        difficulty: difficulty || 'Intermediate',
        categoryFocus: categoryFocus?.trim() || 'Custom Officer Drill',
        isFreeDemo: Boolean(isFreeDemo),
        published: true,
        estimatedMinutes: format === 'WAT' ? 4 : format === 'SRT' ? 8 : 12,
        tags: [format, difficulty || 'Intermediate', 'Super Admin Curated'],
        createdAt: new Date().toISOString().slice(0, 10),
        stimuli: prompts.filter((p) => p.trim().length > 0).map((p, idx) => ({
          id: `custom-stim-${Date.now()}-${idx + 1}`,
          format,
          prompt: p.trim(),
          category: categoryFocus?.trim() || 'Custom',
          difficulty: difficulty || 'Intermediate',
          recommendedSeconds: format === 'WAT' ? 15 : format === 'SRT' ? 30 : 240,
          observationSeconds: format === 'TAT' || format === 'PPDT' ? 30 : undefined,
          targetOlqs: ['effective_intelligence', 'organising_ability', 'initiative'],
        })),
      };
      db.ssbPracticeSets!.unshift(newSet);
      appendAuditLog({
        schoolId: null,
        actor: req.user!,
        action: 'SSB_SET_CREATED',
        entityType: 'SsbPracticeSet',
        entityId: newSet.id,
        detail: `Added custom SSB practice set ${newSet.code}: ${newSet.title}.`,
      });
      saveDb();
      res.status(201).json({ ok: true, set: newSet });
    },
  );

  app.patch(
    '/api/admin/ssb/sets/:id',
    requireAuth,
    requireRoles(['super_admin', 'ssb_admin']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      ensureFlagshipProductsInitialized(db);
      const target = (db.ssbPracticeSets || []).find((s) => s.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'Practice set not found.' });
        return;
      }
      const { published, isFreeDemo, title, difficulty } = (req.body || {}) as Partial<SsbPracticeSet>;
      if (typeof published === 'boolean') target.published = published;
      if (typeof isFreeDemo === 'boolean') target.isFreeDemo = isFreeDemo;
      if (typeof title === 'string' && title.trim()) target.title = title.trim();
      if (difficulty) target.difficulty = difficulty;
      saveDb();
      res.json({ ok: true, set: target });
    },
  );

  app.patch(
    '/api/admin/flagship/enquiries/:id',
    requireAuth,
    requireRoles(['super_admin']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      ensureFlagshipProductsInitialized(db);
      const enq = (db.productEnquiries || []).find((e) => e.id === req.params.id);
      if (!enq) {
        res.status(404).json({ error: 'Enquiry not found.' });
        return;
      }
      const { status } = (req.body || {}) as { status?: ProductEnquiryRecord['status'] };
      if (status && ['New', 'Contacted', 'Converted', 'Closed'].includes(status)) {
        enq.status = status;
      }
      saveDb();
      res.json({ ok: true, enquiry: enq });
    },
  );
}
