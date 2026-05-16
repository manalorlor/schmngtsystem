-- ScholarFlow Complete Database Schema
-- Run this entire script in Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- ── TABLE DEFINITIONS (all created first, no cross-references) ──

create table if not exists public.schools (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  motto          text,
  address        text,
  logo_url       text,
  school_code    text unique not null,
  plan           text not null default 'basic' check (plan in ('basic','standard','premium')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid')),
  current_term   text,
  academic_year  text,
  created_at     timestamptz not null default now()
);

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  school_id  uuid references public.schools(id) on delete cascade,
  name       text not null,
  role       text not null default 'teacher' check (role in ('admin','teacher')),
  phone      text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id                 uuid primary key default uuid_generate_v4(),
  school_id          uuid not null references public.schools(id) on delete cascade,
  student_id_code    text not null,
  name               text not null,
  class              text not null,
  gender             text,
  dob                date,
  nationality        text default 'Ghanaian',
  address            text,
  phone              text,
  allergies          text,
  chronic_conditions text,
  status             text not null default 'active' check (status in ('active','inactive')),
  guardian_name      text,
  guardian_email     text,
  guardian_phone     text,
  enrollment_date    date,
  fee_balance        numeric(12,2) default 0,
  created_at         timestamptz not null default now(),
  unique(school_id, student_id_code)
);

create table if not exists public.teachers (
  id            uuid primary key default uuid_generate_v4(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  profile_id    uuid references public.profiles(id) on delete set null,
  employee_id   text not null,
  name          text not null,
  email         text,
  phone         text,
  subject       text,
  class         text,
  qualification text,
  status        text not null default 'active' check (status in ('active','on_leave','inactive')),
  join_date     date,
  created_at    timestamptz not null default now(),
  unique(school_id, employee_id)
);

create table if not exists public.classes (
  id            uuid primary key default uuid_generate_v4(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  name          text not null,
  level         text,
  section       text,
  class_teacher text,
  student_count integer default 0,
  room          text,
  created_at    timestamptz not null default now(),
  unique(school_id, name)
);

create table if not exists public.subjects (
  id         uuid primary key default uuid_generate_v4(),
  school_id  uuid not null references public.schools(id) on delete cascade,
  name       text not null,
  code       text,
  teacher    text,
  created_at timestamptz not null default now()
);

create table if not exists public.sba_records (
  id           uuid primary key default uuid_generate_v4(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  student_id   uuid references public.students(id) on delete cascade,
  student_name text,
  class        text,
  subject      text,
  term         text,
  class_ex1    numeric(5,2) default 0,
  class_ex2    numeric(5,2) default 0,
  class_ex3    numeric(5,2) default 0,
  class_test   numeric(5,2) default 0,
  project      numeric(5,2) default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique(school_id, student_id, subject, term)
);

create table if not exists public.exam_scores (
  id           uuid primary key default uuid_generate_v4(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  student_id   uuid references public.students(id) on delete cascade,
  student_name text,
  class        text,
  subject      text,
  term         text,
  score        numeric(5,2) default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique(school_id, student_id, subject, term)
);

create table if not exists public.attendance (
  id           uuid primary key default uuid_generate_v4(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  student_id   uuid references public.students(id) on delete cascade,
  student_name text,
  class        text,
  date         date not null,
  status       text not null check (status in ('present','absent','late')),
  created_at   timestamptz not null default now(),
  unique(school_id, student_id, date)
);

create table if not exists public.fees (
  id            uuid primary key default uuid_generate_v4(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  student_id    uuid references public.students(id) on delete cascade,
  student_name  text,
  class         text,
  term          text,
  academic_year text,
  total_fee     numeric(12,2) default 0,
  amount_paid   numeric(12,2) default 0,
  balance       numeric(12,2) default 0,
  due_date      date,
  status        text not null default 'pending' check (status in ('pending','partial','paid')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.payments (
  id            uuid primary key default uuid_generate_v4(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  student_id    uuid references public.students(id) on delete cascade,
  fee_id        uuid references public.fees(id) on delete set null,
  receipt_no    text,
  student_name  text,
  class         text,
  amount        numeric(12,2) not null,
  term          text,
  academic_year text,
  payment_date  date not null default current_date,
  method        text check (method in ('cash','momo','bank','cheque','other')),
  recorded_by   text,
  created_at    timestamptz not null default now()
);

create table if not exists public.payroll_records (
  id                  uuid primary key default uuid_generate_v4(),
  school_id           uuid not null references public.schools(id) on delete cascade,
  teacher_id          uuid references public.teachers(id) on delete cascade,
  name                text,
  employee_id         text,
  period              text not null,
  term                text,
  academic_year       text,
  basic_salary        numeric(12,2) default 0,
  transport_allowance numeric(12,2) default 0,
  housing_allowance   numeric(12,2) default 0,
  medical_allowance   numeric(12,2) default 0,
  other_allowance     numeric(12,2) default 0,
  gross_salary        numeric(12,2) default 0,
  ssnit_employee      numeric(12,2) default 0,
  ssnit_employer      numeric(12,2) default 0,
  income_tax          numeric(12,2) default 0,
  other_deductions    numeric(12,2) default 0,
  total_deductions    numeric(12,2) default 0,
  net_pay             numeric(12,2) default 0,
  status              text not null default 'configured' check (status in ('configured','issued')),
  issued_date         date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(school_id, teacher_id, period)
);

create table if not exists public.notifications (
  id           uuid primary key default uuid_generate_v4(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  title        text not null,
  description  text,
  type         text default 'info' check (type in ('info','success','warning','error')),
  audience     text default 'Everyone',
  target_class text,
  read_by      uuid[] default '{}',
  created_at   timestamptz not null default now()
);

create table if not exists public.messages (
  id          uuid primary key default uuid_generate_v4(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  thread_id   text not null,
  sender_role text not null check (sender_role in ('admin','teacher')),
  sender_name text,
  text        text not null,
  sent_at     timestamptz not null default now(),
  read_at     timestamptz
);

create table if not exists public.admissions (
  id              uuid primary key default uuid_generate_v4(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  applicant_name  text not null,
  dob             date,
  gender          text,
  address         text,
  guardian_name   text,
  guardian_phone  text,
  guardian_email  text,
  applying_for    text,
  previous_school text,
  status          text not null default 'pending' check (status in ('pending','accepted','rejected')),
  applied_date    date not null default current_date,
  created_at      timestamptz not null default now()
);

create table if not exists public.timetable_slots (
  id         uuid primary key default uuid_generate_v4(),
  school_id  uuid not null references public.schools(id) on delete cascade,
  class      text not null,
  day        text not null,
  period_id  text not null,
  subject    text,
  teacher    text,
  teacher_id uuid references public.teachers(id) on delete set null,
  type       text default 'class' check (type in ('class','break')),
  display    text,
  created_at timestamptz not null default now(),
  unique(school_id, class, day, period_id)
);

create table if not exists public.inventory (
  id           uuid primary key default uuid_generate_v4(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  name         text not null,
  category     text,
  quantity     integer default 0,
  unit         text,
  condition    text check (condition in ('good','fair','poor','damaged')),
  location     text,
  last_updated date,
  notes        text,
  created_at   timestamptz not null default now()
);


-- ── ENABLE ROW LEVEL SECURITY ON ALL TABLES ──

alter table public.schools         enable row level security;
alter table public.profiles        enable row level security;
alter table public.students        enable row level security;
alter table public.teachers        enable row level security;
alter table public.classes         enable row level security;
alter table public.subjects        enable row level security;
alter table public.sba_records     enable row level security;
alter table public.exam_scores     enable row level security;
alter table public.attendance      enable row level security;
alter table public.fees            enable row level security;
alter table public.payments        enable row level security;
alter table public.payroll_records enable row level security;
alter table public.notifications   enable row level security;
alter table public.messages        enable row level security;
alter table public.admissions      enable row level security;
alter table public.timetable_slots enable row level security;
alter table public.inventory       enable row level security;


-- ── RLS POLICIES (applied after all tables exist) ──

create policy "school_members_view_school"
  on public.schools for select
  using (id in (select school_id from public.profiles where id = auth.uid()));

create policy "admins_update_school"
  on public.schools for update
  using (id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));

create policy "school_members_view_profiles"
  on public.profiles for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "users_update_own_profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "school_members_view_students"
  on public.students for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "admins_manage_students"
  on public.students for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));

create policy "school_members_view_teachers"
  on public.teachers for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "admins_manage_teachers"
  on public.teachers for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));

create policy "school_members_view_classes"
  on public.classes for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "admins_manage_classes"
  on public.classes for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));

create policy "school_members_view_subjects"
  on public.subjects for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "admins_manage_subjects"
  on public.subjects for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));

create policy "school_members_view_sba"
  on public.sba_records for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "staff_manage_sba"
  on public.sba_records for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role in ('admin','teacher')));

create policy "school_members_view_exams"
  on public.exam_scores for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "staff_manage_exams"
  on public.exam_scores for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role in ('admin','teacher')));

create policy "school_members_view_attendance"
  on public.attendance for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "staff_manage_attendance"
  on public.attendance for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role in ('admin','teacher')));

create policy "school_members_view_fees"
  on public.fees for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "admins_manage_fees"
  on public.fees for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));

create policy "school_members_view_payments"
  on public.payments for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "admins_manage_payments"
  on public.payments for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));

create policy "admins_manage_payroll"
  on public.payroll_records for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));

create policy "teachers_view_own_payslips"
  on public.payroll_records for select
  using (
    status = 'issued'
    and school_id in (select school_id from public.profiles where id = auth.uid())
    and lower(name) in (
      select lower(p.name) from public.profiles p where p.id = auth.uid()
    )
  );

create policy "school_members_view_notifications"
  on public.notifications for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "admins_manage_notifications"
  on public.notifications for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));

create policy "school_members_update_notifications"
  on public.notifications for update
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "school_members_view_messages"
  on public.messages for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "school_members_send_messages"
  on public.messages for insert
  with check (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "school_members_delete_messages"
  on public.messages for delete
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "admins_manage_admissions"
  on public.admissions for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));

create policy "school_members_view_timetable"
  on public.timetable_slots for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "admins_manage_timetable"
  on public.timetable_slots for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));

create policy "school_members_view_inventory"
  on public.inventory for select
  using (school_id in (select school_id from public.profiles where id = auth.uid()));

create policy "admins_manage_inventory"
  on public.inventory for all
  using (school_id in (select school_id from public.profiles where id = auth.uid() and role = 'admin'));


-- ── AUTO-CREATE PROFILE ON SIGNUP TRIGGER ──

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, school_id, name, role)
  values (
    new.id,
    (new.raw_user_meta_data->>'school_id')::uuid,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'teacher')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
