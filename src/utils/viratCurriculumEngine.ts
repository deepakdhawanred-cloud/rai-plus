import type {
  ProductionRegisterRow,
  RegisterApprovalRecord,
  ResourceCategory,
  ViratDriveFileItem,
  ViratResourcePack,
} from '../types';

export const DRIVE_FOLDER_TO_RESOURCE_CATEGORY: Record<string, ResourceCategory> = {
  '01_Presentations': 'Presentations',
  '02_Teacher_Guides': 'Teacher Guides',
  '03_Worksheets': 'Worksheets',
  '04_Answer_Keys': 'Answer Keys',
  '05_Assessments_and_Rubrics': 'Assessments and Rubrics',
};

export function mapFolderCategoryToResourceCategory(folderName: string): ResourceCategory | null {
  if (folderName in DRIVE_FOLDER_TO_RESOURCE_CATEGORY) {
    return DRIVE_FOLDER_TO_RESOURCE_CATEGORY[folderName];
  }
  const clean = folderName.toLowerCase();
  if (clean.includes('presentation')) return 'Presentations';
  if (clean.includes('guide')) return 'Teacher Guides';
  if (clean.includes('worksheet')) return 'Worksheets';
  if (clean.includes('answer')) return 'Answer Keys';
  if (clean.includes('assessment') || clean.includes('rubric')) return 'Assessments and Rubrics';
  return null;
}

export function buildDriveFileLinks(fileId: string): {
  viewUrl: string;
  downloadUrl: string;
} {
  return {
    viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=drive_web`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}

export type RegisterApprovalState =
  | 'Teacher Approved'
  | 'QA Passed · Awaiting Teacher Approval'
  | 'In Production · Awaiting Teacher Approval'
  | 'Not Produced';

export function resolveRegisterApprovalState(
  row: ProductionRegisterRow,
  approvals: Record<string, RegisterApprovalRecord> = {},
): RegisterApprovalState {
  if (approvals[row.rowId]) {
    return 'Teacher Approved';
  }
  const qa = (row.aiQaStatus || '').toLowerCase();
  const ta = (row.teacherApproval || '').toLowerCase();

  // Enforce: AI QA is never Teacher Approval.
  if (qa.includes('qa passed')) {
    return 'QA Passed · Awaiting Teacher Approval';
  }
  if (qa.includes('production') || ta.includes('awaiting teacher approval')) {
    return 'In Production · Awaiting Teacher Approval';
  }
  return 'Not Produced';
}

export function computeRegisterStats(
  rows: ProductionRegisterRow[],
  approvals: Record<string, RegisterApprovalRecord> = {},
): {
  totalChapters: number;
  producedOrActive: number;
  aiQaPassedCount: number;
  inProductionCount: number;
  teacherApprovedCount: number;
  awaitingTeacherApprovalCount: number;
  byClass: Record<string, { total: number; active: number; teacherApproved: number }>;
} {
  const byClass: Record<string, { total: number; active: number; teacherApproved: number }> = {};
  let aiQaPassedCount = 0;
  let inProductionCount = 0;
  let teacherApprovedCount = 0;
  let awaitingTeacherApprovalCount = 0;

  for (const row of rows) {
    const clsKey = `Class ${row.classLabel}`;
    if (!byClass[clsKey]) {
      byClass[clsKey] = { total: 0, active: 0, teacherApproved: 0 };
    }
    byClass[clsKey].total += 1;

    const state = resolveRegisterApprovalState(row, approvals);
    const qa = (row.aiQaStatus || '').toLowerCase();
    if (qa.includes('qa passed')) aiQaPassedCount += 1;
    if (qa.includes('production')) inProductionCount += 1;

    if (state === 'Teacher Approved') {
      teacherApprovedCount += 1;
      byClass[clsKey].active += 1;
      byClass[clsKey].teacherApproved += 1;
    } else if (
      state === 'QA Passed · Awaiting Teacher Approval' ||
      state === 'In Production · Awaiting Teacher Approval'
    ) {
      awaitingTeacherApprovalCount += 1;
      byClass[clsKey].active += 1;
    }
  }

  return {
    totalChapters: rows.length,
    producedOrActive: awaitingTeacherApprovalCount + teacherApprovedCount,
    aiQaPassedCount,
    inProductionCount,
    teacherApprovedCount,
    awaitingTeacherApprovalCount,
    byClass,
  };
}

export function filterRegisterRows(
  rows: ProductionRegisterRow[],
  approvals: Record<string, RegisterApprovalRecord>,
  filters: {
    classLabel?: string;
    subject?: string;
    statusFilter?: 'all' | 'active' | 'qa_passed' | 'teacher_approved' | 'not_produced';
    query?: string;
  },
): ProductionRegisterRow[] {
  const q = (filters.query || '').trim().toLowerCase();
  return rows.filter((row) => {
    if (filters.classLabel && filters.classLabel !== 'All' && row.classLabel !== filters.classLabel) {
      return false;
    }
    if (filters.subject && filters.subject !== 'All' && row.subject !== filters.subject) {
      return false;
    }
    const state = resolveRegisterApprovalState(row, approvals);
    if (filters.statusFilter === 'active' && state === 'Not Produced') {
      return false;
    }
    if (filters.statusFilter === 'qa_passed' && !row.aiQaStatus.toLowerCase().includes('qa passed')) {
      return false;
    }
    if (filters.statusFilter === 'teacher_approved' && state !== 'Teacher Approved') {
      return false;
    }
    if (filters.statusFilter === 'not_produced' && state !== 'Not Produced') {
      return false;
    }
    if (q) {
      const hay = `${row.classLabel} ${row.subject} ${row.chapterTitle} ${row.book} ${row.notes}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function filterDriveResourcePacks(
  packs: ViratResourcePack[],
  filters: {
    className?: string;
    subject?: string;
    category?: ResourceCategory | 'All';
    query?: string;
  },
): ViratResourcePack[] {
  const q = (filters.query || '').trim().toLowerCase();
  return packs.filter((pack) => {
    if (filters.className && filters.className !== 'All' && pack.className !== filters.className) {
      return false;
    }
    if (filters.subject && filters.subject !== 'All' && pack.subject !== filters.subject) {
      return false;
    }
    if (filters.category && filters.category !== 'All') {
      const files = pack.filesByCategory[filters.category] || [];
      if (files.length === 0) return false;
    }
    if (q) {
      const allTitles = Object.values(pack.filesByCategory)
        .flat()
        .map((f: ViratDriveFileItem) => f.title)
        .join(' ');
      const hay = `${pack.className} ${pack.subject} ${pack.chapterTitle} ${allTitles}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
