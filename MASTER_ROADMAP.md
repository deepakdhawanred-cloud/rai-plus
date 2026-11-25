# Virat Student 360° — Master Roadmap & Implementation Ledger

**Institution / Platform:** Virat Student 360° (Multi-Tenant School Operating System & Holistic Student Development ERP)  
**Active Pilot Tenant:** Virat International School (VIS), Jhajjar, Haryana (Session 2026–27)

---

## Completed Milestones

### Phase 0 — Growth Leaderboard Upgrade (Skill Assessments)
- Added relative monthly improvement metrics (`relativeMomPct`, `relativeSessionPct`, `growthIndex`, `growthTier`, class-level `positiveGrowthSharePct`).
- Implemented privacy-conscious view presets (`Full Staff View`, `Relative Initials`, `Classroom Projector Mode`) plus granular identity masking (`Anonymous`, `Initials`, `Full Name`), raw score hiding, and positive-growth spotlight filtering.
- Locked Student and Parent portals strictly to personal growth vs. anonymized class benchmarks.
- Verified with unit tests in `src/utils/skillGrowthLeaderboardEngine.test.ts`.

### Part 1 — Classroom Attendance Heatmap & Early Support Intelligence
- **Class-Wise Attendance Heatmap (`AttendanceHeatmapModule.tsx` & `attendanceHeatmapEngine.ts`)**: Color-coded calendar matrix (Green Present, Red Absent, Amber Late, Blue Approved Leave, Grey Holiday), displaying daily, weekly, monthly, term-wise, overall %, and previous-session baselines with filters for Session, Class/Section, Month, Attendance Category, Benchmark Threshold, and Student Search.
- **Individual Student Attendance Heatmap**: Full April–November academic session calendar grid, monthly trend chart, total working/present/absent/late/leave counts, consecutive absence streaks, Monday/Friday pattern tracking, and month-over-month shift detection.
- **Early Support Identification (Strictly Non-Diagnostic)**: Human-review indicators with explicit ethical policy banner prohibiting automated emotional/behavioural labelling; full teacher observation, parent communication, counsellor referral, and follow-up timeline persisted via `POST /api/attendance/support`.
- **Management Dashboard**: School-wide attendance %, month-over-month delta, declining vs. improving class rankings, follow-up counts, Excel (CSV) export, and Print/PDF support.

### Part 2 — Mind Maps in Academic Resources
- Dedicated **Academic Resources → Mind Maps Library** (`MindMapsLibraryPanel.tsx` & `mindMapResourceEngine.ts`) accessible in both `Academic Resources` and `Academics & Resources`.
- Organised and filterable by Academic Session, Class, Subject, Chapter, Topic, Language (`English`, `Hindi`, `Bilingual`), Teacher, Resource Type, Review Status, Search, and User Bookmarks.
- Teacher file upload (`PDF`, `PNG`, `JPG`, `JPEG`, `PPT/PPTX`, `DOC/DOCX`) + **AI-Assisted Mind Map Draft Builder** (`POST /api/mindmaps/ai-suggest`) generating teacher-editable concepts, branches, key definitions, step-by-step flowcharts, and revision summaries.
- Human approval governance (`draft → pending_review → approved / rejected`) with version history; AI drafts are **never auto-published** without explicit teacher verification and Coordinator/Principal approval.
- Students and Parents see only `approved` Mind Maps with interactive visual exploration, download, and bookmarking (`POST /api/mindmaps/:id/bookmark`).

### Part 3 — Teacher Dashboard Reorganisation & One-Go Attendance Relocation
- Created **`TeacherTodayWorkspace.tsx`** mounted directly on the Teacher Dashboard (`TEACHER → TODAY WORKSPACE`) combining:
  - Embedded **One-Go Class Attendance** (reusing existing `BatchAttendanceRosterPanel` and existing attendance DB — zero duplication).
  - Today's Timetable, Today's Assigned Classes, Notebook Checking quick access, Active Homework & Classwork, Pending Tasks, Today's Lesson Plans, Announcements, Student Support Alerts, and Upcoming Cover Responsibilities.
- Removed One-Go Attendance from `AcademicsModule.tsx` so Academic Resources remains cleanly focused on teaching and learning materials only.

### Part 4 — Remove Active Student Records from Teacher Dashboard
- Removed the `Active Student Records` KPI card from the Teacher Dashboard overview (`DashboardOverview.tsx`) while preserving full visibility for Principal, School Admin, Coordinator, Super Admin, and linked family profiles for Parents/Students without deleting any underlying student records.

### Part 5 — Notebook Checking Fast Checkbox Input
- Upgraded `NotebookCheckModule.tsx` from dropdowns to fast checkbox controls (`Chapter Checked`, `Handwriting Readable`, `Homework Done`) and mutually exclusive checkbox-style `A` / `B` / `C` buttons (`A = Excellent`, `B = Satisfactory`, `C = Needs Improvement`).
- Added bulk quick actions (`Mark All Checked`, `Uncheck All`, `All Readable`, `All HW Done`, `Bulk Quality A/B/C`), keyboard `ArrowUp`/`ArrowDown` row navigation, live `sessionStorage` draft autosave indicator, and preserved existing CSV export and prior-chapter backlog auto-alerts.

### Part 6 — Cognitive Profile (VCIP) Approval Workflow & Student/Parent Access
- Implemented strict release workflow (`draft → under_review → pending_approval → approved → published`, plus `rejected` and `revoked`) via `vcipReleaseGovernanceEngine.ts`, `VcipApprovalGovernancePanel.tsx`, and `/api/vcip/profiles/:studentId/workflow`.
- Server-side `/api/workspace` enforces:
  - Students & Parents ONLY receive VCIP scores and profiles for their own / linked children when `status` is `approved` or `published`.
  - `internalCounsellorNote` is strictly stripped from non-counsellor/non-principal payloads.
  - Teachers do NOT automatically receive complete individual cognitive profiles (directed to Developmental Remedials & anonymized class trends).
  - Every family report view, workflow change, and parent consent toggle is logged to `vcipAccessLogs`.

### Part 7 — Accountant User Account, Provisioning & Finance 360° Operations
- Added dedicated `accountant` role across auth, RBAC (`accountantRbacEngine.ts`, `roleVisibilityAudit.ts`), seed data (`Suresh Kumar`, `accountant@viratinternational.edu.in`), Unified Login Modal, and Admin/Principal provisioning UI (`POST /api/users/provision-accountant` in `OperationsAndGovernanceModule.tsx`, zero hardcoded passwords).
- Built `AccountantDashboardPanel.tsx` integrated into both Accountant Overview and Finance 360° (`FinancialDashboardModule.tsx`): Daily Accounting Ledger, Bus-wise Fuel & Maintenance tracking, Teacher & Driver Payroll preparation, Bank Statement Reconciliation, AI Financial Document Extraction (`POST /api/accounting/extract-document`), Management-assigned Closing Tasks, Student Fee Collection, and CSV/PDF reporting.
- Enforced strict **Segregation of Duties** on the backend: Accountants receive `403 Forbidden` if attempting to approve/self-approve entries, approve payroll, delete posted transactions, modify locked periods (Oct 2026), provision users, or access cross-tenant/confidential student counselling records.

### Part 8 — Integrated Role-Based Experience
- Updated `ErpWorkspace.tsx` navigation and `/api/workspace` scoping for Teacher, Counsellor, Accountant, Coordinator, Principal/School Admin, Super Admin, Student, and Parent roles within strict tenant isolation boundaries.

---

## Remaining Future Roadmap (Post-Release Enhancements)
1. **Live Bank Feed / Tally XML Import**: Automated bank statement CSV/OFX parser and Tally voucher export for Finance 360°.
2. **Binary Object Storage for Large Mind Map Uploads**: Move attachments larger than 1.5 MB from inline data URLs to cloud object storage (GCS/S3) with signed download URLs.
3. **Configurable Multi-Channel Notifications**: Optional WhatsApp/SMS gateway integration for attendance support check-ins and fee receipts (subject to school consent settings).
4. **External SSO / Passwordless Magic Link Auth**: Replace institutional email demo login with verified school SSO/OTP authentication for production deployment.
