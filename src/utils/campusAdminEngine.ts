import type {
  GatePassRecord,
  PayrollRegisterEntry,
  SalaryModificationAuditRecord,
  StaffAttendanceRecord,
  StaffProfile,
  StaffRoleCategory,
  StaffSalaryComputation,
  StudentRecord,
  UserAccount,
  UserRole,
  VisitorLogRecord,
} from '../types';

const FULL_STAFF_SALARY_ROLES: UserRole[] = [
  'super_admin',
  'school_admin',
  'principal',
  'accountant',
];

const SELF_ONLY_STAFF_ROLES: UserRole[] = [
  'teacher',
  'coordinator',
  'counsellor',
  'transport_incharge',
  'clinical_psychologist',
  'slp',
  'audiologist',
  'special_educator',
];

const CAMPUS_GATE_ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'school_admin',
  'principal',
  'coordinator',
  'transport_incharge',
];

export function getStaffSalaryAccessScope(role: UserRole): 'full' | 'self' | 'none' {
  if (FULL_STAFF_SALARY_ROLES.includes(role)) return 'full';
  if (SELF_ONLY_STAFF_ROLES.includes(role)) return 'self';
  return 'none';
}

export function canManageAllStaffSalary(role: UserRole): boolean {
  return FULL_STAFF_SALARY_ROLES.includes(role);
}

export function canManageCampusGateAndVisitors(role: UserRole): boolean {
  return CAMPUS_GATE_ADMIN_ROLES.includes(role);
}

export function canViewVisitorRegister(role: UserRole): boolean {
  return CAMPUS_GATE_ADMIN_ROLES.includes(role);
}

export function formatMonthLabel(monthKey: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey.trim());
  if (!match) return monthKey;
  const year = Number(match[1]);
  const monthIdx = Number(match[2]) - 1;
  const names = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${names[monthIdx] ?? 'Month'} ${year}`;
}

/**
 * Masks government ID numbers for visitor privacy, preserving only the last 4 visible characters.
 */
export function maskVisitorIdNumber(rawId: string): string {
  const clean = rawId.trim().replace(/\s+/g, '');
  if (!clean) return 'Verified at Gate';
  if (clean.length <= 4) return `XXXX-${clean.toUpperCase()}`;
  const tail = clean.slice(-4).toUpperCase();
  return `XXXX-XXXX-${tail}`;
}

/**
 * Deterministically computes a staff member's monthly salary directly from daily attendance logs.
 * - Present & Paid Leave: full paid day (1.0)
 * - Half Day: 0.5 paid day, 0.5 LOP day
 * - Absent & Unpaid Leave: 0 paid day, 1.0 LOP day
 * - Paid Leave beyond `paidLeaveAllowance` automatically converts excess days to LOP.
 */
export function computeStaffMonthlySalary(params: {
  profile: StaffProfile;
  attendanceRecords: StaffAttendanceRecord[];
  monthKey: string; // YYYY-MM
  payrollRegisters?: PayrollRegisterEntry[];
}): StaffSalaryComputation {
  const { profile, attendanceRecords, monthKey, payrollRegisters = [] } = params;
  const monthPrefix = `${monthKey}-`;
  const monthRows = attendanceRecords.filter(
    (r) => r.staffId === profile.id && r.date.startsWith(monthPrefix),
  );

  let presentDays = 0;
  let halfDays = 0;
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let absentDays = 0;

  for (const row of monthRows) {
    switch (row.status) {
      case 'Present':
        presentDays += 1;
        break;
      case 'Half Day':
        halfDays += 1;
        break;
      case 'Paid Leave':
        paidLeaveDays += 1;
        break;
      case 'Unpaid Leave':
        unpaidLeaveDays += 1;
        break;
      case 'Absent':
        absentDays += 1;
        break;
    }
  }

  const workingDays = Math.max(1, profile.workingDaysPerMonth || 26);
  const markedDays = monthRows.length;
  const excessPaidLeave = Math.max(0, paidLeaveDays - Math.max(0, profile.paidLeaveAllowance));
  const rawLopDays = absentDays + unpaidLeaveDays + halfDays * 0.5 + excessPaidLeave;
  const lossOfPayDays = Math.min(workingDays, Math.round(rawLopDays * 10) / 10);
  const effectivePaidDays = Math.max(0, Math.round((workingDays - lossOfPayDays) * 10) / 10);

  const perDayRateInr = Math.round(profile.baseMonthlySalaryInr / workingDays);
  const lopDeductionInr = Math.round(lossOfPayDays * perDayRateInr);
  const grossSalaryInr = Math.round(profile.baseMonthlySalaryInr + profile.fixedAllowanceInr);
  const standardDeductionsInr = Math.round(profile.pfOrDeductionInr);
  const totalDeductionsInr = standardDeductionsInr + lopDeductionInr;
  const netPayableInr = Math.max(0, grossSalaryInr - totalDeductionsInr);

  const attendancePct =
    markedDays > 0
      ? Math.round(((presentDays + halfDays * 0.5 + Math.min(paidLeaveDays, profile.paidLeaveAllowance)) / markedDays) * 100)
      : 100;

  const monthLabel = formatMonthLabel(monthKey);
  const syncedRow = payrollRegisters.find(
    (p) =>
      p.schoolId === profile.schoolId &&
      p.monthLabel.toLowerCase() === monthLabel.toLowerCase() &&
      p.staffName.toLowerCase() === profile.name.toLowerCase(),
  );

  return {
    staffId: profile.id,
    employeeCode: profile.employeeCode,
    staffName: profile.name,
    designation: profile.designation,
    department: profile.department,
    roleType: profile.roleType,
    bankAccountNumber: profile.bankAccountNumber,
    ifscCode: profile.ifscCode,
    bankName: profile.bankName,
    bankNote: profile.bankNote,
    monthKey,
    monthLabel,
    workingDaysPerMonth: workingDays,
    presentDays,
    halfDays,
    paidLeaveDays,
    unpaidLeaveDays,
    absentDays,
    markedDays,
    effectivePaidDays,
    lossOfPayDays,
    attendancePct,
    perDayRateInr,
    baseMonthlySalaryInr: profile.baseMonthlySalaryInr,
    fixedAllowanceInr: profile.fixedAllowanceInr,
    grossSalaryInr,
    standardDeductionsInr,
    lopDeductionInr,
    totalDeductionsInr,
    netPayableInr,
    payrollStatus: syncedRow ? 'Synced to Payroll' : 'Pending Sync',
    lastSyncedAt: syncedRow?.approvedAt,
  };
}

/**
 * Strictly filters Staff Attendance, Automated Salaries, Gate Passes, and Visitor Logs
 * on the server according to the authenticated user's role and school tenant.
 */
export function buildRoleScopedCampusAdminPayload(params: {
  user: UserAccount;
  schoolId: string;
  visibleStudentIds: Set<string>;
  staffProfiles: StaffProfile[];
  staffAttendance: StaffAttendanceRecord[];
  gatePasses: GatePassRecord[];
  visitorLogs: VisitorLogRecord[];
  payrollRegisters: PayrollRegisterEntry[];
  salaryAuditLogs?: SalaryModificationAuditRecord[];
  monthKey: string;
}): {
  staffSalaryAccessScope: 'full' | 'self' | 'none';
  staffProfiles: StaffProfile[];
  staffAttendance: StaffAttendanceRecord[];
  staffSalarySummaries: StaffSalaryComputation[];
  salaryAuditLogs: SalaryModificationAuditRecord[];
  gatePasses: GatePassRecord[];
  visitorLogs: VisitorLogRecord[];
} {
  const {
    user,
    schoolId,
    visibleStudentIds,
    staffProfiles,
    staffAttendance,
    gatePasses,
    visitorLogs,
    payrollRegisters,
    salaryAuditLogs = [],
    monthKey,
  } = params;

  const schoolProfiles = staffProfiles.filter((p) => p.schoolId === schoolId);
  const schoolStaffAtt = staffAttendance.filter((a) => a.schoolId === schoolId);
  const scope = getStaffSalaryAccessScope(user.role);

  let scopedProfiles: StaffProfile[] = [];
  let scopedAttendance: StaffAttendanceRecord[] = [];
  let scopedSalaries: StaffSalaryComputation[] = [];

  if (scope === 'full') {
    scopedProfiles = schoolProfiles;
    scopedAttendance = schoolStaffAtt;
    scopedSalaries = scopedProfiles.map((profile) =>
      computeStaffMonthlySalary({
        profile,
        attendanceRecords: scopedAttendance,
        monthKey,
        payrollRegisters,
      }),
    );
  } else if (scope === 'self') {
    const ownProfile = schoolProfiles.find(
      (p) =>
        (p.userId && p.userId === user.id) ||
        p.name.trim().toLowerCase() === user.name.trim().toLowerCase(),
    );
    if (ownProfile) {
      scopedProfiles = [ownProfile];
      scopedAttendance = schoolStaffAtt.filter((a) => a.staffId === ownProfile.id);
      scopedSalaries = [
        computeStaffMonthlySalary({
          profile: ownProfile,
          attendanceRecords: scopedAttendance,
          monthKey,
          payrollRegisters,
        }),
      ];
    }
  }

  // Gate Pass strict scoping
  const schoolGatePasses = gatePasses
    .filter((gp) => gp.schoolId === schoolId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  let scopedGatePasses: GatePassRecord[] = [];
  if (canManageCampusGateAndVisitors(user.role)) {
    scopedGatePasses = schoolGatePasses;
  } else if (user.role === 'parent') {
    scopedGatePasses = schoolGatePasses.filter(
      (gp) =>
        gp.subjectType === 'Student Early Exit' &&
        Boolean(gp.studentId && visibleStudentIds.has(gp.studentId)),
    );
  } else if (user.role === 'student') {
    scopedGatePasses = [];
  } else {
    // Staff roles see their own out-passes or passes they requested
    scopedGatePasses = schoolGatePasses.filter(
      (gp) =>
        gp.requestedByUserId === user.id ||
        gp.staffUserId === user.id ||
        gp.staffName?.toLowerCase() === user.name.toLowerCase(),
    );
  }

  // Visitors Register strict scoping (Security / Campus Operations only)
  const scopedVisitors = canViewVisitorRegister(user.role)
    ? visitorLogs
        .filter((v) => v.schoolId === schoolId)
        .sort((a, b) => b.checkInAt.localeCompare(a.checkInAt))
    : [];

  const scopedSalaryAuditLogs: SalaryModificationAuditRecord[] =
    scope === 'full'
      ? salaryAuditLogs
          .filter((entry) => entry.schoolId === schoolId)
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      : [];

  return {
    staffSalaryAccessScope: scope,
    staffProfiles: scopedProfiles,
    staffAttendance: scopedAttendance,
    staffSalarySummaries: scopedSalaries,
    salaryAuditLogs: scopedSalaryAuditLogs,
    gatePasses: scopedGatePasses,
    visitorLogs: scopedVisitors,
  };
}

export function mapStaffRoleCategoryToPayrollType(
  roleType: StaffRoleCategory,
): 'Teacher' | 'Driver' | 'Support Staff' {
  if (roleType === 'Driver') return 'Driver';
  if (roleType === 'Teacher' || roleType === 'Specialist') return 'Teacher';
  return 'Support Staff';
}

export function createInitialCampusAdminSeedForSchool(params: {
  schoolId: string;
  users: UserAccount[];
  students: StudentRecord[];
}): {
  staffProfiles: StaffProfile[];
  staffAttendance: StaffAttendanceRecord[];
  gatePasses: GatePassRecord[];
  visitorLogs: VisitorLogRecord[];
} {
  const { schoolId, users, students } = params;
  const schoolUsers = users.filter(
    (u) =>
      u.schoolId === schoolId &&
      u.role !== 'parent' &&
      u.role !== 'student' &&
      u.role !== 'super_admin',
  );
  const schoolStudents = students.filter((s) => s.schoolId === schoolId);
  const prefix = schoolId.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase();

  const salaryForRole = (role: UserRole): { base: number; allowance: number; pf: number; cat: StaffRoleCategory; dept: string } => {
    switch (role) {
      case 'principal':
        return { base: 72000, allowance: 6000, pf: 3600, cat: 'Admin & Coordinator', dept: 'Leadership' };
      case 'school_admin':
        return { base: 54000, allowance: 4000, pf: 2700, cat: 'Admin & Coordinator', dept: 'Administration' };
      case 'coordinator':
        return { base: 46000, allowance: 3500, pf: 2200, cat: 'Admin & Coordinator', dept: 'Academic Wing' };
      case 'accountant':
        return { base: 42000, allowance: 3000, pf: 2000, cat: 'Admin & Coordinator', dept: 'Finance & Accounts' };
      case 'transport_incharge':
        return { base: 34000, allowance: 2500, pf: 1600, cat: 'Support Staff', dept: 'Transport & Fleet' };
      case 'clinical_psychologist':
      case 'slp':
      case 'audiologist':
      case 'special_educator':
      case 'counsellor':
        return { base: 48000, allowance: 3000, pf: 2400, cat: 'Specialist', dept: 'Student Care' };
      default:
        return { base: 38000, allowance: 2500, pf: 1800, cat: 'Teacher', dept: 'Teaching Faculty' };
    }
  };

  const staffProfiles: StaffProfile[] = schoolUsers.map((u, idx) => {
    const spec = salaryForRole(u.role);
    return {
      id: `stf-${schoolId}-${u.id}`,
      schoolId,
      userId: u.id,
      employeeCode: `EMP-${prefix}-${String(101 + idx)}`,
      name: u.name,
      roleType: spec.cat,
      designation: u.designation,
      department: u.subjectSpecialty ? `${u.subjectSpecialty} Faculty` : spec.dept,
      phone: `+91 98120 ${String(41000 + idx * 137).slice(0, 5)}`,
      baseMonthlySalaryInr: spec.base,
      fixedAllowanceInr: spec.allowance,
      pfOrDeductionInr: spec.pf,
      workingDaysPerMonth: 26,
      paidLeaveAllowance: 2,
      active: true,
    };
  });

  // Add realistic transport driver & campus security/support staff rows
  const extraStaff: StaffProfile[] = [
    {
      id: `stf-${schoolId}-drv-1`,
      schoolId,
      employeeCode: `EMP-${prefix}-201`,
      name: 'Rajesh Kumar',
      roleType: 'Driver',
      designation: 'Senior Bus Driver (Route R-01)',
      department: 'Transport & Fleet',
      phone: '+91 98125 60114',
      baseMonthlySalaryInr: 22000,
      fixedAllowanceInr: 1500,
      pfOrDeductionInr: 1100,
      workingDaysPerMonth: 26,
      paidLeaveAllowance: 2,
      active: true,
    },
    {
      id: `stf-${schoolId}-sup-1`,
      schoolId,
      employeeCode: `EMP-${prefix}-202`,
      name: 'Suresh Deswal',
      roleType: 'Support Staff',
      designation: 'Main Gate Security Supervisor',
      department: 'Campus Safety & Gate',
      phone: '+91 98125 60298',
      baseMonthlySalaryInr: 19500,
      fixedAllowanceInr: 1000,
      pfOrDeductionInr: 950,
      workingDaysPerMonth: 26,
      paidLeaveAllowance: 2,
      active: true,
    },
  ];
  staffProfiles.push(...extraStaff);

  // Seed November 2026 daily attendance for realistic automated salary demonstration
  const dates = [
    '2026-11-02',
    '2026-11-03',
    '2026-11-04',
    '2026-11-05',
    '2026-11-06',
    '2026-11-09',
    '2026-11-10',
    '2026-11-11',
    '2026-11-12',
    '2026-11-13',
    '2026-11-16',
    '2026-11-17',
    '2026-11-18',
    '2026-11-19',
    '2026-11-20',
    '2026-11-23',
    '2026-11-24',
    '2026-11-25',
  ];

  const staffAttendance: StaffAttendanceRecord[] = [];
  staffProfiles.forEach((profile, pIdx) => {
    dates.forEach((date, dIdx) => {
      let status: StaffAttendanceRecord['status'] = 'Present';
      if (pIdx % 3 === 1 && dIdx === 6) status = 'Paid Leave';
      if (pIdx % 4 === 2 && dIdx === 10) status = 'Half Day';
      if (pIdx % 5 === 3 && dIdx === 12) status = 'Absent';
      if (pIdx % 6 === 4 && dIdx === 14) status = 'Unpaid Leave';

      staffAttendance.push({
        id: `satt-${profile.id}-${date}`,
        schoolId,
        staffId: profile.id,
        date,
        status,
        checkInTime: status === 'Present' || status === 'Half Day' ? '07:52' : undefined,
        checkOutTime: status === 'Present' ? '14:35' : status === 'Half Day' ? '11:30' : undefined,
        markingMode: 'manual',
        markedBy: 'School Admin Office',
        remarks: status === 'Paid Leave' ? 'Pre-approved casual leave' : undefined,
        updatedAt: `${date}T08:15:00.000Z`,
      });
    });
  });

  const sampleStudentA = schoolStudents[0];
  const sampleStudentB = schoolStudents[1];
  const sampleTeacher = staffProfiles.find((p) => p.roleType === 'Teacher') || staffProfiles[0];

  const gatePasses: GatePassRecord[] = [];
  if (sampleStudentA) {
    gatePasses.push({
      id: `gp-${schoolId}-01`,
      schoolId,
      passCode: `GP-2026-${prefix.slice(0, 2)}01`,
      subjectType: 'Student Early Exit',
      studentId: sampleStudentA.id,
      studentName: sampleStudentA.name,
      classSection: sampleStudentA.classSection,
      requestedByName: sampleStudentA.guardianName || 'Parent Guardian',
      requestedByRole: 'parent',
      reason: 'Scheduled dental appointment at Civil Hospital',
      authorizedPickupName: sampleStudentA.guardianName || 'Father / Guardian',
      pickupRelation: 'Father',
      pickupPhone: sampleStudentA.guardianPhone || '+91 98120 11223',
      pickupIdMasked: 'XXXX-XXXX-4821',
      expectedExitTime: '12:15',
      status: 'Approved',
      approvedByName: 'Principal Desk',
      approvedAt: '2026-11-25T05:10:00.000Z',
      gateOfficerNote: 'Guardian ID verified digitally',
      createdAt: '2026-11-25T04:50:00.000Z',
      updatedAt: '2026-11-25T05:10:00.000Z',
    });
  }
  if (sampleStudentB) {
    gatePasses.push({
      id: `gp-${schoolId}-02`,
      schoolId,
      passCode: `GP-2026-${prefix.slice(0, 2)}02`,
      subjectType: 'Student Early Exit',
      studentId: sampleStudentB.id,
      studentName: sampleStudentB.name,
      classSection: sampleStudentB.classSection,
      requestedByName: sampleStudentB.guardianName || 'Parent Guardian',
      requestedByRole: 'parent',
      reason: 'Family travel — early pick-up after 5th period',
      authorizedPickupName: sampleStudentB.guardianName || 'Mother / Guardian',
      pickupRelation: 'Mother',
      pickupPhone: sampleStudentB.guardianPhone || '+91 98120 55890',
      pickupIdMasked: 'XXXX-XXXX-9104',
      expectedExitTime: '13:00',
      status: 'Pending Approval',
      createdAt: '2026-11-25T06:05:00.000Z',
      updatedAt: '2026-11-25T06:05:00.000Z',
    });
  }
  if (sampleTeacher) {
    gatePasses.push({
      id: `gp-${schoolId}-03`,
      schoolId,
      passCode: `GP-2026-${prefix.slice(0, 2)}03`,
      subjectType: 'Staff Out-Pass',
      staffId: sampleTeacher.id,
      staffUserId: sampleTeacher.userId,
      staffName: sampleTeacher.name,
      staffDesignation: sampleTeacher.designation,
      requestedByUserId: sampleTeacher.userId,
      requestedByName: sampleTeacher.name,
      requestedByRole: 'teacher',
      reason: 'District Education Office CBSE/HBSE exam stationery collection',
      expectedExitTime: '11:30',
      expectedReturnTime: '13:15',
      actualExitAt: '2026-11-25T06:02:00.000Z',
      status: 'Exited Campus',
      approvedByName: 'Principal Desk',
      approvedAt: '2026-11-25T05:45:00.000Z',
      gateOfficerNote: 'Exited via Main Gate #1',
      createdAt: '2026-11-25T05:30:00.000Z',
      updatedAt: '2026-11-25T06:02:00.000Z',
    });
  }

  const visitorLogs: VisitorLogRecord[] = [
    {
      id: `vis-${schoolId}-01`,
      schoolId,
      badgeCode: `VIS-${prefix.slice(0, 2)}41`,
      visitorName: 'Ramesh Chander',
      phone: '+91 98122 44019',
      category: 'Parent / Guardian',
      purpose: 'Admission & bus stop verification for Class 4',
      personToMeet: 'Admissions Desk',
      department: 'Admissions Office',
      idProofType: 'Aadhaar Card',
      idProofMasked: 'XXXX-XXXX-7742',
      vehicleNumber: 'HR-14-R-2041',
      checkInAt: '2026-11-25T04:15:00.000Z',
      status: 'On Campus',
      loggedByName: 'Suresh Deswal (Main Gate)',
    },
    {
      id: `vis-${schoolId}-02`,
      schoolId,
      badgeCode: `VIS-${prefix.slice(0, 2)}40`,
      visitorName: 'Vikram Singh (NCERT Book Depot)',
      phone: '+91 98129 77310',
      category: 'Vendor / Delivery',
      purpose: 'Science lab glassware & workbook parcel delivery',
      personToMeet: 'Store & Inventory Incharge',
      department: 'Science Block',
      idProofType: 'Driving License',
      idProofMasked: 'XXXX-XXXX-3318',
      vehicleNumber: 'HR-12-T-8812',
      belongingsNote: '3 sealed lab cartons',
      checkInAt: '2026-11-25T03:00:00.000Z',
      checkOutAt: '2026-11-25T03:42:00.000Z',
      durationMinutes: 42,
      status: 'Checked Out',
      loggedByName: 'Suresh Deswal (Main Gate)',
      checkedOutByName: 'Suresh Deswal (Main Gate)',
    },
  ];

  return { staffProfiles, staffAttendance, gatePasses, visitorLogs };
}
