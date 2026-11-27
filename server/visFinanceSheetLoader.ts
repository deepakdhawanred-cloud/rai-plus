import fs from 'node:fs';
import path from 'node:path';
import type {
  AccountingEntry,
  PayrollRegisterEntry,
  StaffAttendanceRecord,
  StaffProfile,
  UserAccount,
} from '../src/types';
import {
  buildVisStaffProfilesFromParsed,
  parseVisExpenseSheetCsv,
  parseVisSalarySheetCsv,
} from '../src/utils/visSalaryExpenseParser.ts';
import { mapStaffRoleCategoryToPayrollType } from '../src/utils/campusAdminEngine.ts';

export const VIS_SALARY_SHEET_RELATIVE_PATH =
  'server/private_seeds/vis_salary_2026_27.csv';

export const VIS_EXPENSE_SHEET_RELATIVE_PATH =
  'server/private_seeds/vis_expense_2026_27.csv';

export const VIS_SALARY_EXPENSE_VERSION = 'VIS_SALARY_7F354103_EXPENSE_034069F4_V1';

const VIS_SALARY_CSV_PATH = path.resolve(process.cwd(), VIS_SALARY_SHEET_RELATIVE_PATH);
const VIS_EXPENSE_CSV_PATH = path.resolve(process.cwd(), VIS_EXPENSE_SHEET_RELATIVE_PATH);

export function loadVisSalarySheetProfiles(
  users: UserAccount[] = [],
  schoolId = 'school-vis-jjr',
): {
  staffProfiles: StaffProfile[];
  staffAttendance: StaffAttendanceRecord[];
  payrollRegisters: PayrollRegisterEntry[];
} {
  let staffProfiles: StaffProfile[] = [];
  try {
    if (fs.existsSync(VIS_SALARY_CSV_PATH)) {
      const csvRaw = fs.readFileSync(VIS_SALARY_CSV_PATH, 'utf-8');
      const parsed = parseVisSalarySheetCsv(csvRaw);
      staffProfiles = buildVisStaffProfilesFromParsed(parsed, schoolId);
    }
  } catch (err) {
    console.warn('Could not read VIS salary sheet CSV:', err);
  }

  // Link any matching VIS staff user accounts (for self-service payslip access)
  const visStaffUsers = users.filter(
    (u) =>
      u.schoolId === schoolId &&
      u.role !== 'parent' &&
      u.role !== 'student' &&
      u.role !== 'super_admin',
  );
  for (const profile of staffProfiles) {
    const normProfileName = profile.name.toLowerCase();
    const matchedUser = visStaffUsers.find((u) => {
      const uName = u.name.trim().toLowerCase();
      return (
        uName === normProfileName ||
        uName.startsWith(`${normProfileName} `) ||
        normProfileName.startsWith(`${uName} `)
      );
    });
    if (matchedUser) {
      profile.userId = matchedUser.id;
    }
  }

  // Seed November 2026 daily attendance for VIS staff so automated payroll works immediately
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
      if (pIdx % 5 === 1 && dIdx === 6) status = 'Paid Leave';
      if (pIdx % 7 === 2 && dIdx === 10) status = 'Half Day';
      if (pIdx % 9 === 3 && dIdx === 12) status = 'Absent';

      staffAttendance.push({
        id: `satt-${profile.id}-${date}`,
        schoolId,
        staffId: profile.id,
        date,
        status,
        checkInTime: status === 'Present' || status === 'Half Day' ? '07:55' : undefined,
        checkOutTime:
          status === 'Present' ? '14:20' : status === 'Half Day' ? '11:30' : undefined,
        markingMode: 'manual',
        markedBy: 'VIS Admin Office',
        remarks: status === 'Paid Leave' ? 'Pre-approved leave' : undefined,
        updatedAt: `${date}T08:10:00.000Z`,
      });
    });
  });

  const payrollRegisters: PayrollRegisterEntry[] = staffProfiles.map((profile) => {
    const gross = profile.baseMonthlySalaryInr + profile.fixedAllowanceInr;
    const ded = profile.pfOrDeductionInr;
    return {
      id: `pay-${schoolId}-${profile.id}-2026-11`,
      schoolId,
      monthLabel: 'November 2026',
      staffName: profile.name,
      staffRoleType: mapStaffRoleCategoryToPayrollType(profile.roleType),
      designation: profile.designation,
      bankAccountNumber: profile.bankAccountNumber,
      ifscCode: profile.ifscCode,
      bankName: profile.bankName,
      daysWorked: profile.workingDaysPerMonth,
      grossSalaryInr: gross,
      deductionsInr: ded,
      netPayableInr: Math.max(0, gross - ded),
      status: 'submitted',
      preparedBy: 'VIS Accounts Office',
    };
  });

  return { staffProfiles, staffAttendance, payrollRegisters };
}

export function loadVisExpenseSheetEntries(schoolId = 'school-vis-jjr'): AccountingEntry[] {
  try {
    if (fs.existsSync(VIS_EXPENSE_CSV_PATH)) {
      const csvRaw = fs.readFileSync(VIS_EXPENSE_CSV_PATH, 'utf-8');
      const parsed = parseVisExpenseSheetCsv(csvRaw, schoolId, 'vis_expense_2026_27');
      return parsed.entries;
    }
  } catch (err) {
    console.warn('Could not read VIS expense sheet CSV:', err);
  }
  return [];
}
