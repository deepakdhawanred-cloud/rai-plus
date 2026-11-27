-- ============================================================================
-- Rai Plus — Supabase PostgreSQL Schema
-- Run this once in your Supabase Dashboard -> SQL Editor to create all tables.
-- ============================================================================

-- 1. Authoritative Full-State Persistence Snapshot (stores every module cleanly)
create table if not exists public.rai_app_state (
  id text primary key,
  schema_version integer not null,
  revision bigint not null default 1,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2. Schools (Multi-Tenant Master Table)
create table if not exists public.rai_schools (
  id text primary key,
  name text not null,
  code text not null,
  city text not null,
  state text not null,
  board text not null,
  session text not null,
  subscription_plan text not null,
  payment_status text not null default 'Paid',
  student_count integer not null default 0,
  enabled_features jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3. Users (Accounts & Role Mapping)
create table if not exists public.rai_users (
  id text primary key,
  school_id text references public.rai_schools(id) on delete set null,
  name text not null,
  email text not null,
  role text not null,
  designation text not null,
  class_teacher_of text,
  subject_specialty text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_rai_users_school_id on public.rai_users(school_id);

-- 4. Students (Tenant-Scoped Roster)
create table if not exists public.rai_students (
  id text primary key,
  school_id text not null references public.rai_schools(id) on delete cascade,
  admission_no text not null,
  name text not null,
  class_section text not null,
  house text,
  guardian_name text,
  guardian_phone text,
  attendance_pct numeric(5,2) default 0,
  updated_at timestamptz not null default now()
);
create index if not exists idx_rai_students_school_id on public.rai_students(school_id);

-- 5. Daily Attendance Records (Manual, RFID, Biometric)
create table if not exists public.rai_attendance (
  id text primary key,
  school_id text not null references public.rai_schools(id) on delete cascade,
  student_id text not null,
  attendance_date text not null,
  status text not null,
  mode text not null default 'manual',
  marked_by text,
  remarks text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_rai_attendance_school_date on public.rai_attendance(school_id, attendance_date);

-- 6. Exam Marks Records
create table if not exists public.rai_exam_marks (
  id text primary key,
  school_id text not null references public.rai_schools(id) on delete cascade,
  student_id text not null,
  exam_name text not null,
  subject text not null,
  marks_obtained numeric(7,2) not null,
  max_marks numeric(7,2) not null,
  exam_date text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_rai_exam_marks_school_student on public.rai_exam_marks(school_id, student_id);

-- 7. Fee Transactions & Receipts
create table if not exists public.rai_fee_transactions (
  id text primary key,
  school_id text not null references public.rai_schools(id) on delete cascade,
  student_id text not null,
  amount_inr numeric(12,2) not null,
  status text not null,
  payment_mode text,
  paid_on text,
  receipt_no text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_rai_fee_tx_school_student on public.rai_fee_transactions(school_id, student_id);

-- 8. Public & Admission Enquiries
create table if not exists public.rai_public_enquiries (
  id text primary key,
  enquiry_type text not null,
  school_or_org_name text,
  contact_name text not null,
  email text not null,
  phone text not null,
  city_state text,
  message text,
  created_date text,
  updated_at timestamptz not null default now()
);

-- 9. Audit Logs
create table if not exists public.rai_audit_logs (
  id text primary key,
  school_id text,
  actor_name text not null,
  actor_role text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  detail text not null,
  logged_at text not null
);
create index if not exists idx_rai_audit_logs_school_time on public.rai_audit_logs(school_id, logged_at desc);

-- 10. Staff Attendance (Synced with Automated Payroll)
create table if not exists public.rai_staff_attendance (
  id text primary key,
  school_id text not null references public.rai_schools(id) on delete cascade,
  staff_id text not null,
  attendance_date text not null,
  status text not null,
  marking_mode text not null default 'manual',
  check_in_time text,
  check_out_time text,
  marked_by text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_rai_staff_att_school_date on public.rai_staff_attendance(school_id, attendance_date);

-- 11. Digital Gate Passes
create table if not exists public.rai_gate_passes (
  id text primary key,
  school_id text not null references public.rai_schools(id) on delete cascade,
  pass_code text not null,
  subject_type text not null,
  person_name text not null,
  reason text not null,
  expected_exit_time text not null,
  status text not null,
  approved_by text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_rai_gate_passes_school on public.rai_gate_passes(school_id, updated_at desc);

-- 12. Digital Visitors Register
create table if not exists public.rai_visitors (
  id text primary key,
  school_id text not null references public.rai_schools(id) on delete cascade,
  badge_code text not null,
  visitor_name text not null,
  phone text not null,
  category text not null,
  purpose text not null,
  person_to_meet text not null,
  id_proof_masked text not null,
  status text not null,
  check_in_at text not null,
  check_out_at text,
  duration_minutes integer,
  updated_at timestamptz not null default now()
);
create index if not exists idx_rai_visitors_school on public.rai_visitors(school_id, check_in_at desc);

-- ============================================================================
-- Row Level Security (RLS)
-- Enabled on every table by default. Connect the Rai Plus server using your
-- Supabase Secret key (SUPABASE_SECRET_KEY) so backend mutations succeed while
-- browser/public keys cannot directly read or modify school data.
-- ============================================================================
alter table public.rai_app_state enable row level security;
alter table public.rai_schools enable row level security;
alter table public.rai_users enable row level security;
alter table public.rai_students enable row level security;
alter table public.rai_attendance enable row level security;
alter table public.rai_exam_marks enable row level security;
alter table public.rai_fee_transactions enable row level security;
alter table public.rai_public_enquiries enable row level security;
alter table public.rai_audit_logs enable row level security;
alter table public.rai_staff_attendance enable row level security;
alter table public.rai_gate_passes enable row level security;
alter table public.rai_visitors enable row level security;
