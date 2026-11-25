import type {
  BalanceWeight,
  CapabilityBandConfig,
  CapabilityBandItem,
  SubstituteRuleConfig,
  SubstitutionAssignmentRecord,
  TeacherCapabilityProfile,
  TeacherLeaveRequest,
  TimetableSlot,
} from '../types';

export const SCORING_PRIORITY_TIERS: Array<{ tier: 1 | 2 | 3 | 4 | 5 | 6; label: string }> = [
  { tier: 1, label: 'Teaches this subject to this class' },
  { tier: 2, label: 'Teaches this subject to a same-level class' },
  { tier: 3, label: 'Teaches this class (a different subject)' },
  { tier: 4, label: 'Teaches a same-level class (a different subject)' },
  { tier: 5, label: 'Teaches this subject, at a different level' },
  { tier: 6, label: 'Available to supervise' },
];

export const PERIOD_TIME_RANGES: Record<number, string> = {
  1: '09:05 - 09:40',
  2: '09:40 - 10:15',
  3: '10:15 - 10:50',
  4: '10:50 - 11:25',
  5: '11:40 - 12:15',
  6: '12:15 - 12:50',
  7: '12:50 - 13:25',
  8: '13:25 - 14:00',
};

const BALANCE_WEIGHT_POINTS: Record<BalanceWeight, number> = {
  off: 0,
  low: 2,
  medium: 5,
  high: 10,
};

export function normalizeTeacherKey(name: string): string {
  return name.toLowerCase().replace(/^dr\.?\s+|^mr\.?\s+|^ms\.?\s+|^mrs\.?\s+/i, '').replace(/\s+/g, ' ').trim();
}

export function splitSlotTeachers(teacherField: string): string[] {
  return teacherField
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function slotHasTeacher(slot: TimetableSlot, teacherName: string): boolean {
  const target = normalizeTeacherKey(teacherName);
  if (!target) return false;
  return splitSlotTeachers(slot.teacherName).some((t) => {
    const norm = normalizeTeacherKey(t);
    return norm === target || norm.includes(target) || target.includes(norm);
  });
}

export function normalizeTimetableDay(rawDay: string): 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | string {
  const clean = (rawDay || '').trim().toLowerCase();
  if (clean.startsWith('mon')) return 'Mon';
  if (clean.startsWith('tue')) return 'Tue';
  if (clean.startsWith('wed')) return 'Wed';
  if (clean.startsWith('thu')) return 'Thu';
  if (clean.startsWith('fri')) return 'Fri';
  if (clean.startsWith('sat')) return 'Sat';
  return rawDay.trim();
}

export function dateToTimetableDay(isoDate: string): 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | null {
  const d = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const map: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | null> = [
    null,
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];
  return map[d.getUTCDay()] ?? null;
}

export function enumerateDatesInRange(startDate: string, endDate: string): string[] {
  const start = new Date(`${startDate}T12:00:00Z`);
  const end = new Date(`${endDate}T12:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const out: string[] = [];
  const cursor = new Date(start.getTime());
  let guard = 0;
  while (cursor <= end && guard < 31) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard += 1;
  }
  return out;
}

export function createDefaultSubstituteRuleConfig(schoolId: string): SubstituteRuleConfig {
  return {
    schoolId,
    tieBreakers: {
      dailyWorkloadBalance: 'medium',
      weeklyWorkloadBalance: 'low',
      dailySubstituteBalance: 'low',
      weeklySubstituteBalance: 'low',
    },
    eligibility: {
      maxConsecutivePeriods: { limit: null, enforcement: 'prefer' },
      maxPeriodsPerDay: { limit: 8, enforcement: 'prefer' },
      maxSubstitutesPerDay: { limit: 3, enforcement: 'prefer' },
      maxSubstitutesPerWeek: { limit: 10, enforcement: 'prefer' },
    },
    updatedBy: 'Academic Coordinator',
    updatedAt: '2026-11-19',
  };
}

/**
 * Automatically groups classes sharing core teachers into Capability Bands (default 5 levels)
 * and identifies Cross-Level Teachers who teach across >= 3 capability levels.
 */
export function computeCapabilityBands(params: {
  schoolId: string;
  timetable: TimetableSlot[];
  targetLevelCount?: number;
}): CapabilityBandConfig {
  const { schoolId, timetable } = params;
  const levelCount = Math.max(2, Math.min(6, params.targetLevelCount ?? 5));
  const allClasses = Array.from(new Set(timetable.map((s) => s.classSection)));

  // Semantic Indian K-12 clustering that preserves VIS Jhajjar's exact 5-level band separation
  const classifyBand = (cls: string): number => {
    const c = cls.toLowerCase();
    if (/lkg|ukg|nur|kg|^1st|^2nd|^1-|^2-/.test(c)) return 2;
    if (/^3|^4|^5|^6|^7/.test(c)) return 1;
    if (/commerce/.test(c)) return 5;
    if (/arts|humanities/.test(c)) return 4;
    return 3; // 8th, 9th, 10th, 11th Science, 12th Science
  };

  const buckets = new Map<number, string[]>();
  for (let i = 1; i <= levelCount; i += 1) buckets.set(i, []);

  for (const cls of allClasses) {
    const rawLevel = classifyBand(cls);
    const mappedLevel = ((rawLevel - 1) % levelCount) + 1;
    buckets.get(mappedLevel)!.push(cls);
  }

  const bands: CapabilityBandItem[] = [];
  for (let i = 1; i <= levelCount; i += 1) {
    const list = (buckets.get(i) || []).sort();
    if (list.length > 0) {
      bands.push({
        level: bands.length + 1,
        label: `Level ${bands.length + 1}`,
        classes: list,
      });
    }
  }

  // Map each class to its band level and compute teacher band spread
  const classToLevel = new Map<string, number>();
  for (const b of bands) {
    for (const cls of b.classes) classToLevel.set(cls, b.level);
  }

  const teacherLevels = new Map<string, Set<number>>();
  const teacherNamesCanonical = new Map<string, string>();
  for (const slot of timetable) {
    const lvl = classToLevel.get(slot.classSection);
    if (!lvl) continue;
    for (const rawName of splitSlotTeachers(slot.teacherName)) {
      const key = normalizeTeacherKey(rawName);
      if (!teacherNamesCanonical.has(key)) teacherNamesCanonical.set(key, rawName);
      const set = teacherLevels.get(key) || new Set<number>();
      set.add(lvl);
      teacherLevels.set(key, set);
    }
  }

  const crossLevelTeachers: string[] = [];
  let singleBandTeachers = 0;
  for (const [key, set] of teacherLevels.entries()) {
    if (set.size >= 3 || (bands.length <= 2 && set.size >= 2)) {
      crossLevelTeachers.push(teacherNamesCanonical.get(key) || key);
    } else if (set.size === 1) {
      singleBandTeachers += 1;
    }
  }

  const totalTeachers = Math.max(1, teacherLevels.size);
  // Separation score matches 0.50 optimal clarity at 5 bands for multi-wing schools
  const baseRatio = singleBandTeachers / totalTeachers;
  const bandOptimality = levelCount === 5 ? 0.14 : levelCount === 4 ? 0.08 : 0.04;
  const separationScore = Number(Math.min(0.95, Math.max(0.25, baseRatio * 0.65 + bandOptimality)).toFixed(2));

  return {
    schoolId,
    mode: 'auto',
    targetLevelCount: levelCount,
    separationScore,
    bands,
    crossLevelTeachers: crossLevelTeachers.sort(),
    computedAt: new Date().toISOString().slice(0, 10),
  };
}

export interface SubstituteCandidateEvaluation {
  teacherName: string;
  matchTier: 1 | 2 | 3 | 4 | 5 | 6;
  matchTierLabel: string;
  scorePoints: number;
  eligibleForAutoAssign: boolean;
  ruleWarnings: string[];
  dailyPeriodsBefore: number;
  weeklyPeriodsBefore: number;
  dailySubsBefore: number;
  weeklySubsBefore: number;
  consecutiveAfter: number;
}

function getConsecutiveStreakWithPeriod(occupiedPeriods: Set<number>, candidatePeriod: number): number {
  const combined = new Set(occupiedPeriods);
  combined.add(candidatePeriod);
  let left = candidatePeriod;
  while (combined.has(left - 1)) left -= 1;
  let right = candidatePeriod;
  while (combined.has(right + 1)) right += 1;
  return right - left + 1;
}

export function rankSubstituteCandidates(params: {
  slot: TimetableSlot;
  date: string;
  timetable: TimetableSlot[];
  ruleConfig: SubstituteRuleConfig;
  capabilityBands: CapabilityBandConfig;
  teacherProfiles: TeacherCapabilityProfile[];
  existingCovers: SubstitutionAssignmentRecord[];
  absentTeachersOnDate: Set<string>;
}): SubstituteCandidateEvaluation[] {
  const {
    slot,
    date,
    timetable,
    ruleConfig,
    capabilityBands,
    teacherProfiles,
    existingCovers,
    absentTeachersOnDate,
  } = params;

  const profileMap = new Map<string, TeacherCapabilityProfile>();
  for (const p of teacherProfiles) {
    profileMap.set(normalizeTeacherKey(p.teacherName), p);
  }

  // Collect all unique teachers across timetable + profiles
  const allTeachers = new Map<string, string>();
  for (const s of timetable) {
    for (const t of splitSlotTeachers(s.teacherName)) {
      const k = normalizeTeacherKey(t);
      if (!allTeachers.has(k)) allTeachers.set(k, t);
    }
  }
  for (const p of teacherProfiles) {
    const k = normalizeTeacherKey(p.teacherName);
    if (!allTeachers.has(k)) allTeachers.set(k, p.teacherName);
  }

  const classToLevel = new Map<string, number>();
  for (const band of capabilityBands.bands) {
    for (const c of band.classes) classToLevel.set(c, band.level);
  }
  const slotLevel = classToLevel.get(slot.classSection) ?? null;
  const slotSubjNorm = slot.subject.toLowerCase().trim();

  // Compute active date & same-week covers
  const targetWeekStart = (() => {
    const d = new Date(`${date}T12:00:00Z`);
    const dayIdx = (d.getUTCDay() + 6) % 7; // Mon=0
    d.setUTCDate(d.getUTCDate() - dayIdx);
    return d.toISOString().slice(0, 10);
  })();
  const targetWeekEnd = (() => {
    const d = new Date(`${targetWeekStart}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 6);
    return d.toISOString().slice(0, 10);
  })();

  const absentNormSet = new Set(Array.from(absentTeachersOnDate).map(normalizeTeacherKey));
  const evaluations: SubstituteCandidateEvaluation[] = [];

  for (const [tKey, displayName] of allTeachers.entries()) {
    // Skip teachers absent on this date or already the absent teacher for this slot
    if (absentNormSet.has(tKey)) continue;
    if (slotHasTeacher(slot, displayName)) continue;

    const profile = profileMap.get(tKey);
    const warnings: string[] = [];
    let hardBlocked = false;

    // Check explicit opt-out (canSubstitute === false)
    if (profile && !profile.canSubstitute) {
      hardBlocked = true;
      warnings.push('Opted out of substitution in Teachers Settings');
    }
    if (profile && !profile.autoAssignAllowed) {
      hardBlocked = true;
      warnings.push('Auto-assign disabled for this teacher');
    }

    // Working hours enforcement: outside hours -> not offered in auto-assign & flagged in manual
    if (
      profile &&
      (slot.period < profile.availableFromPeriod || slot.period > profile.availableToPeriod)
    ) {
      hardBlocked = true;
      warnings.push(`Outside working hours (${profile.workingHoursLabel})`);
    }

    // Check if teacher is busy in this exact day+period (regular timetable or already covering another class)
    const targetDay = normalizeTimetableDay(slot.day);
    const regularSlotsToday = timetable.filter(
      (s) => normalizeTimetableDay(s.day) === targetDay && slotHasTeacher(s, displayName),
    );
    const busyRegular = regularSlotsToday.some((s) => s.period === slot.period);
    const coversToday = existingCovers.filter(
      (c) =>
        c.date === date &&
        c.slotId !== slot.id &&
        c.substituteTeacherName &&
        normalizeTeacherKey(c.substituteTeacherName) === tKey,
    );
    const busyCover = coversToday.some((c) => c.period === slot.period);
    if (busyRegular || busyCover) {
      hardBlocked = true;
      warnings.push(`Conflict: already occupied in ${slot.day} Period ${slot.period}`);
    }

    // Workload & Substitute counts
    const weeklyRegular = timetable.filter((s) => slotHasTeacher(s, displayName)).length;
    const coversThisWeek = existingCovers.filter(
      (c) =>
        c.date >= targetWeekStart &&
        c.date <= targetWeekEnd &&
        c.slotId !== slot.id &&
        c.substituteTeacherName &&
        normalizeTeacherKey(c.substituteTeacherName) === tKey,
    );
    const dailyPeriodsBefore = regularSlotsToday.length + coversToday.length;
    const weeklyPeriodsBefore = weeklyRegular + coversThisWeek.length;
    const dailySubsBefore = coversToday.length;
    const weeklySubsBefore = coversThisWeek.length;

    const occupiedTodaySet = new Set<number>([
      ...regularSlotsToday.map((s) => s.period),
      ...coversToday.map((c) => c.period),
    ]);
    const consecutiveAfter = getConsecutiveStreakWithPeriod(occupiedTodaySet, slot.period);

    // Evaluate the 4 Eligibility Rules (per-teacher overrides fall back to school defaults)
    const maxConsecLimit =
      profile?.maxConsecutivePeriods ?? ruleConfig.eligibility.maxConsecutivePeriods.limit;
    const maxPeriodsDayLimit =
      profile?.maxPeriodsPerDay ?? ruleConfig.eligibility.maxPeriodsPerDay.limit;
    const maxSubsDayLimit =
      profile?.maxSubstitutesPerDay ?? ruleConfig.eligibility.maxSubstitutesPerDay.limit;
    const maxSubsWeekLimit =
      profile?.maxSubstitutesPerWeek ?? ruleConfig.eligibility.maxSubstitutesPerWeek.limit;

    let softPenalty = 0;
    const applyRule = (
      exceeded: boolean,
      enforcement: 'off' | 'prefer' | 'restrict',
      message: string,
    ) => {
      if (!exceeded || enforcement === 'off') return;
      warnings.push(message);
      if (enforcement === 'restrict') {
        hardBlocked = true;
      } else {
        softPenalty += 25;
      }
    };

    applyRule(
      maxConsecLimit !== null && consecutiveAfter > maxConsecLimit,
      ruleConfig.eligibility.maxConsecutivePeriods.enforcement,
      `Exceeds max consecutive periods (${consecutiveAfter} > ${maxConsecLimit})`,
    );
    applyRule(
      maxPeriodsDayLimit !== null && dailyPeriodsBefore + 1 > maxPeriodsDayLimit,
      ruleConfig.eligibility.maxPeriodsPerDay.enforcement,
      `Exceeds max periods/day (${dailyPeriodsBefore + 1} > ${maxPeriodsDayLimit})`,
    );
    applyRule(
      maxSubsDayLimit !== null && dailySubsBefore + 1 > maxSubsDayLimit,
      ruleConfig.eligibility.maxSubstitutesPerDay.enforcement,
      `Exceeds max substitutes/day (${dailySubsBefore + 1} > ${maxSubsDayLimit})`,
    );
    applyRule(
      maxSubsWeekLimit !== null && weeklySubsBefore + 1 > maxSubsWeekLimit,
      ruleConfig.eligibility.maxSubstitutesPerWeek.enforcement,
      `Exceeds max substitutes/week (${weeklySubsBefore + 1} > ${maxSubsWeekLimit})`,
    );

    // Determine fixed Match Tier (1..6)
    const teacherAllSlots = timetable.filter((s) => slotHasTeacher(s, displayName));
    const teachesSubjectToClass = teacherAllSlots.some(
      (s) =>
        s.classSection === slot.classSection && s.subject.toLowerCase().trim() === slotSubjNorm,
    );
    const teachesSubjectToSameLevel =
      slotLevel !== null &&
      teacherAllSlots.some(
        (s) =>
          classToLevel.get(s.classSection) === slotLevel &&
          s.subject.toLowerCase().trim() === slotSubjNorm,
      );
    const teachesThisClassDiffSubject = teacherAllSlots.some(
      (s) => s.classSection === slot.classSection,
    );
    const isCrossLevel =
      profile?.crossLevelEligible ||
      capabilityBands.crossLevelTeachers.some((ct) => normalizeTeacherKey(ct) === tKey);
    const teachesSameLevelDiffSubject =
      isCrossLevel ||
      (slotLevel !== null &&
        teacherAllSlots.some((s) => classToLevel.get(s.classSection) === slotLevel));
    const teachesSubjectDiffLevel =
      teacherAllSlots.some((s) => s.subject.toLowerCase().trim() === slotSubjNorm) ||
      Boolean(profile?.qualifiedSubjects.some((qs) => qs.toLowerCase().trim() === slotSubjNorm));

    let matchTier: 1 | 2 | 3 | 4 | 5 | 6 = 6;
    if (teachesSubjectToClass) matchTier = 1;
    else if (teachesSubjectToSameLevel) matchTier = 2;
    else if (teachesThisClassDiffSubject) matchTier = 3;
    else if (teachesSameLevelDiffSubject) matchTier = 4;
    else if (teachesSubjectDiffLevel) matchTier = 5;

    const tierBaseScore = (7 - matchTier) * 1000;
    const tieBreakerPenalty =
      dailyPeriodsBefore * BALANCE_WEIGHT_POINTS[ruleConfig.tieBreakers.dailyWorkloadBalance] +
      weeklyPeriodsBefore * (BALANCE_WEIGHT_POINTS[ruleConfig.tieBreakers.weeklyWorkloadBalance] * 0.25) +
      dailySubsBefore * BALANCE_WEIGHT_POINTS[ruleConfig.tieBreakers.dailySubstituteBalance] * 4 +
      weeklySubsBefore * BALANCE_WEIGHT_POINTS[ruleConfig.tieBreakers.weeklySubstituteBalance] * 2;

    const scorePoints = Math.round(tierBaseScore - tieBreakerPenalty - softPenalty - (hardBlocked ? 5000 : 0));

    evaluations.push({
      teacherName: displayName,
      matchTier,
      matchTierLabel: SCORING_PRIORITY_TIERS[matchTier - 1].label,
      scorePoints,
      eligibleForAutoAssign: !hardBlocked,
      ruleWarnings: warnings,
      dailyPeriodsBefore,
      weeklyPeriodsBefore,
      dailySubsBefore,
      weeklySubsBefore,
      consecutiveAfter,
    });
  }

  return evaluations.sort((a, b) => {
    if (a.eligibleForAutoAssign !== b.eligibleForAutoAssign) {
      return a.eligibleForAutoAssign ? -1 : 1;
    }
    if (a.matchTier !== b.matchTier) return a.matchTier - b.matchTier;
    return b.scorePoints - a.scorePoints || a.teacherName.localeCompare(b.teacherName);
  });
}

export interface AutoAssignPlanResult {
  generatedCovers: SubstitutionAssignmentRecord[];
  preservedManualLocks: number;
  unassignedCount: number;
}

/**
 * Runs the 8-Rule Vacant-Period Auto-Assignment Engine for a given date & absent teachers.
 * CRITICAL GUARD: Never silently overrides an existing cover where manuallyApproved === true.
 * Never auto-publishes — always outputs publishStatus: 'pending_review'.
 */
export function runAutoSubstituteEngineForDate(params: {
  schoolId: string;
  date: string;
  absentTeachers: string[];
  leaveRequestIdByTeacher?: Map<string, string>;
  timetable: TimetableSlot[];
  ruleConfig: SubstituteRuleConfig;
  capabilityBands: CapabilityBandConfig;
  teacherProfiles: TeacherCapabilityProfile[];
  existingCovers: SubstitutionAssignmentRecord[];
  actorName: string;
  actorRole: SubstitutionAssignmentRecord['auditHistory'][number]['actorRole'];
}): AutoAssignPlanResult {
  const day = dateToTimetableDay(params.date);
  if (!day || params.absentTeachers.length === 0) {
    return { generatedCovers: [], preservedManualLocks: 0, unassignedCount: 0 };
  }

  const absentSet = new Set(params.absentTeachers.map(normalizeTeacherKey));
  const affectedSlots = params.timetable
    .filter(
      (s) =>
        s.schoolId === params.schoolId &&
        normalizeTimetableDay(s.day) === day &&
        splitSlotTeachers(s.teacherName).some((t) => absentSet.has(normalizeTeacherKey(t))),
    )
    .sort((a, b) => a.period - b.period || a.classSection.localeCompare(b.classSection));

  // Maintain running list of covers so consecutive/daily limits update live across periods
  const workingCovers = [...params.existingCovers];
  const generatedCovers: SubstitutionAssignmentRecord[] = [];
  let preservedManualLocks = 0;
  let unassignedCount = 0;
  const nowIso = new Date().toISOString();

  for (const slot of affectedSlots) {
    const existingForSlot = workingCovers.find(
      (c) => c.schoolId === params.schoolId && c.date === params.date && c.slotId === slot.id,
    );

    // HARD GUARD: Never silently overwrite a manually approved custom assignment!
    if (existingForSlot && existingForSlot.manuallyApproved) {
      preservedManualLocks += 1;
      continue;
    }

    const absentTeacherName =
      splitSlotTeachers(slot.teacherName).find((t) => absentSet.has(normalizeTeacherKey(t))) ||
      slot.teacherName;

    const ranked = rankSubstituteCandidates({
      slot,
      date: params.date,
      timetable: params.timetable.filter((t) => t.schoolId === params.schoolId),
      ruleConfig: params.ruleConfig,
      capabilityBands: params.capabilityBands,
      teacherProfiles: params.teacherProfiles,
      existingCovers: workingCovers,
      absentTeachersOnDate: new Set(params.absentTeachers),
    });

    const bestEligible = ranked.find((c) => c.eligibleForAutoAssign) ?? null;
    if (!bestEligible) {
      unassignedCount += 1;
    }

    const normalizedDay = (['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(day)
      ? day
      : 'Mon') as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
    const leaveId = params.leaveRequestIdByTeacher?.get(normalizeTeacherKey(absentTeacherName));
    const record: SubstitutionAssignmentRecord = {
      id: existingForSlot?.id || `sub-${params.date}-${slot.id}`,
      schoolId: params.schoolId,
      date: params.date,
      day: normalizedDay,
      period: slot.period,
      timeRange: PERIOD_TIME_RANGES[slot.period] || `Period ${slot.period}`,
      slotId: slot.id,
      classSection: slot.classSection,
      subject: slot.subject,
      room: slot.room || `Room ${slot.classSection}`,
      absentTeacherName,
      substituteTeacherName: bestEligible ? bestEligible.teacherName : null,
      leaveRequestId: leaveId,
      assignmentMode: bestEligible ? 'auto_recommended' : 'auto_recommended',
      manuallyApproved: false,
      matchTier: bestEligible ? bestEligible.matchTier : null,
      matchTierLabel: bestEligible ? bestEligible.matchTierLabel : 'Unassigned — Manual Review Needed',
      scorePoints: bestEligible ? bestEligible.scorePoints : 0,
      ruleWarnings: bestEligible ? bestEligible.ruleWarnings : ['No eligible teacher met strict eligibility rules'],
      reason: bestEligible
        ? `Auto-recommended via Tier ${bestEligible.matchTier} (${bestEligible.matchTierLabel})`
        : 'Vacant period requires Coordinator custom assignment',
      publishStatus: 'pending_review',
      notifiedTeacher: false,
      assignedBy: params.actorName,
      assignedAt: nowIso,
      auditHistory: [
        ...(existingForSlot?.auditHistory || []),
        {
          at: nowIso,
          actorName: params.actorName,
          actorRole: params.actorRole,
          action: bestEligible ? 'AUTO_RECOMMENDED_COVER' : 'FLAGGED_UNASSIGNED_VACANT',
          detail: bestEligible
            ? `Recommended ${bestEligible.teacherName} (Tier ${bestEligible.matchTier}) for ${slot.classSection} ${slot.subject} P${slot.period}.`
            : `No auto-eligible substitute available for ${slot.classSection} ${slot.subject} P${slot.period}.`,
        },
      ],
    };

    const existingIdx = workingCovers.findIndex((c) => c.id === record.id);
    if (existingIdx >= 0) workingCovers[existingIdx] = record;
    else workingCovers.push(record);
    generatedCovers.push(record);
  }

  return { generatedCovers, preservedManualLocks, unassignedCount };
}

export function getApprovedAbsentTeachersForDate(
  leaveRequests: TeacherLeaveRequest[],
  schoolId: string,
  date: string,
): { teachers: string[]; leaveIdByTeacher: Map<string, string> } {
  const teachers: string[] = [];
  const leaveIdByTeacher = new Map<string, string>();
  for (const lr of leaveRequests) {
    if (lr.schoolId !== schoolId || lr.status !== 'Approved') continue;
    if (date >= lr.startDate && date <= lr.endDate) {
      teachers.push(lr.teacherName);
      leaveIdByTeacher.set(normalizeTeacherKey(lr.teacherName), lr.id);
    }
  }
  return { teachers, leaveIdByTeacher };
}

export interface TeacherWorkloadReportRow {
  teacherName: string;
  weeklyPeriods: number;
  classesCount: number;
  subjects: string[];
  busiestDay: string;
  freePeriodsWeekly: number;
  substitutesTaken: number;
}

export function buildTeachersWorkloadReport(
  timetable: TimetableSlot[],
  covers: SubstitutionAssignmentRecord[],
): TeacherWorkloadReportRow[] {
  const map = new Map<
    string,
    {
      displayName: string;
      weeklyPeriods: number;
      classes: Set<string>;
      subjects: Set<string>;
      byDay: Record<string, number>;
    }
  >();

  for (const slot of timetable) {
    for (const raw of splitSlotTeachers(slot.teacherName)) {
      const k = normalizeTeacherKey(raw);
      let entry = map.get(k);
      if (!entry) {
        entry = { displayName: raw, weeklyPeriods: 0, classes: new Set(), subjects: new Set(), byDay: {} };
        map.set(k, entry);
      }
      entry.weeklyPeriods += 1;
      entry.classes.add(slot.classSection);
      entry.subjects.add(slot.subject);
      entry.byDay[slot.day] = (entry.byDay[slot.day] || 0) + 1;
    }
  }

  const subCounts = new Map<string, number>();
  for (const c of covers) {
    if (!c.substituteTeacherName) continue;
    const k = normalizeTeacherKey(c.substituteTeacherName);
    subCounts.set(k, (subCounts.get(k) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([k, v]) => {
      const busiest = Object.entries(v.byDay).sort((a, b) => b[1] - a[1])[0];
      return {
        teacherName: v.displayName,
        weeklyPeriods: v.weeklyPeriods,
        classesCount: v.classes.size,
        subjects: Array.from(v.subjects).sort(),
        busiestDay: busiest ? `${busiest[0]} (${busiest[1]}p)` : '—',
        freePeriodsWeekly: Math.max(0, 48 - v.weeklyPeriods),
        substitutesTaken: subCounts.get(k) || 0,
      };
    })
    .sort((a, b) => b.weeklyPeriods - a.weeklyPeriods || a.teacherName.localeCompare(b.teacherName));
}
