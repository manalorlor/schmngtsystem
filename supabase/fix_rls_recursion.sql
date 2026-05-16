-- ============================================================
-- FIX: Infinite Recursion in profiles RLS Policy
-- Run this in Supabase SQL Editor to fix the issue
-- ============================================================

-- Step 1: Create a helper function that runs as the DB owner
-- (bypasses RLS so it won't cause recursion)
create or replace function public.get_my_school_id()
returns uuid
language sql
security definer
stable
as $$
  select school_id from public.profiles where id = auth.uid()
$$;

-- Step 2: Drop all existing policies that cause recursion
drop policy if exists "school_members_view_school" on public.schools;
drop policy if exists "admins_update_school" on public.schools;
drop policy if exists "school_members_view_profiles" on public.profiles;
drop policy if exists "users_update_own_profile" on public.profiles;
drop policy if exists "school_members_view_students" on public.students;
drop policy if exists "admins_manage_students" on public.students;
drop policy if exists "school_members_view_teachers" on public.teachers;
drop policy if exists "admins_manage_teachers" on public.teachers;
drop policy if exists "school_members_view_classes" on public.classes;
drop policy if exists "admins_manage_classes" on public.classes;
drop policy if exists "school_members_view_subjects" on public.subjects;
drop policy if exists "admins_manage_subjects" on public.subjects;
drop policy if exists "school_members_view_sba" on public.sba_records;
drop policy if exists "staff_manage_sba" on public.sba_records;
drop policy if exists "school_members_view_exams" on public.exam_scores;
drop policy if exists "staff_manage_exams" on public.exam_scores;
drop policy if exists "school_members_view_attendance" on public.attendance;
drop policy if exists "staff_manage_attendance" on public.attendance;
drop policy if exists "school_members_view_fees" on public.fees;
drop policy if exists "admins_manage_fees" on public.fees;
drop policy if exists "school_members_view_payments" on public.payments;
drop policy if exists "admins_manage_payments" on public.payments;
drop policy if exists "admins_manage_payroll" on public.payroll_records;
drop policy if exists "teachers_view_own_payslips" on public.payroll_records;
drop policy if exists "school_members_view_notifications" on public.notifications;
drop policy if exists "admins_manage_notifications" on public.notifications;
drop policy if exists "school_members_update_notifications" on public.notifications;
drop policy if exists "school_members_view_messages" on public.messages;
drop policy if exists "school_members_send_messages" on public.messages;
drop policy if exists "school_members_delete_messages" on public.messages;
drop policy if exists "admins_manage_admissions" on public.admissions;
drop policy if exists "school_members_view_timetable" on public.timetable_slots;
drop policy if exists "admins_manage_timetable" on public.timetable_slots;
drop policy if exists "school_members_view_inventory" on public.inventory;
drop policy if exists "admins_manage_inventory" on public.inventory;

-- Step 3: Recreate all policies using get_my_school_id() to avoid recursion

-- Schools
create policy "school_members_view_school"
  on public.schools for select
  using (id = public.get_my_school_id());

create policy "admins_update_school"
  on public.schools for update
  using (id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Profiles (self-reference safe — uses get_my_school_id())
create policy "school_members_view_profiles"
  on public.profiles for select
  using (school_id = public.get_my_school_id() or id = auth.uid());

create policy "users_update_own_profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "users_insert_own_profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- Students
create policy "school_members_view_students"
  on public.students for select
  using (school_id = public.get_my_school_id());

create policy "admins_manage_students"
  on public.students for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Teachers
create policy "school_members_view_teachers"
  on public.teachers for select
  using (school_id = public.get_my_school_id());

create policy "admins_manage_teachers"
  on public.teachers for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Classes
create policy "school_members_view_classes"
  on public.classes for select
  using (school_id = public.get_my_school_id());

create policy "admins_manage_classes"
  on public.classes for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Subjects
create policy "school_members_view_subjects"
  on public.subjects for select
  using (school_id = public.get_my_school_id());

create policy "admins_manage_subjects"
  on public.subjects for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- SBA Records
create policy "school_members_view_sba"
  on public.sba_records for select
  using (school_id = public.get_my_school_id());

create policy "staff_manage_sba"
  on public.sba_records for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher')));

-- Exam Scores
create policy "school_members_view_exams"
  on public.exam_scores for select
  using (school_id = public.get_my_school_id());

create policy "staff_manage_exams"
  on public.exam_scores for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher')));

-- Attendance
create policy "school_members_view_attendance"
  on public.attendance for select
  using (school_id = public.get_my_school_id());

create policy "staff_manage_attendance"
  on public.attendance for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher')));

-- Fees
create policy "school_members_view_fees"
  on public.fees for select
  using (school_id = public.get_my_school_id());

create policy "admins_manage_fees"
  on public.fees for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Payments
create policy "school_members_view_payments"
  on public.payments for select
  using (school_id = public.get_my_school_id());

create policy "admins_manage_payments"
  on public.payments for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Payroll
create policy "admins_manage_payroll"
  on public.payroll_records for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "teachers_view_own_payslips"
  on public.payroll_records for select
  using (school_id = public.get_my_school_id() and status = 'issued');

-- Notifications
create policy "school_members_view_notifications"
  on public.notifications for select
  using (school_id = public.get_my_school_id());

create policy "admins_manage_notifications"
  on public.notifications for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "school_members_update_notifications"
  on public.notifications for update
  using (school_id = public.get_my_school_id());

-- Messages
create policy "school_members_view_messages"
  on public.messages for select
  using (school_id = public.get_my_school_id());

create policy "school_members_send_messages"
  on public.messages for insert
  with check (school_id = public.get_my_school_id());

create policy "school_members_delete_messages"
  on public.messages for delete
  using (school_id = public.get_my_school_id());

-- Admissions
create policy "admins_manage_admissions"
  on public.admissions for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Timetable
create policy "school_members_view_timetable"
  on public.timetable_slots for select
  using (school_id = public.get_my_school_id());

create policy "admins_manage_timetable"
  on public.timetable_slots for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Inventory
create policy "school_members_view_inventory"
  on public.inventory for select
  using (school_id = public.get_my_school_id());

create policy "admins_manage_inventory"
  on public.inventory for all
  using (school_id = public.get_my_school_id()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Also allow inserting schools publicly (needed during registration before user exists)
create policy "anyone_can_insert_school"
  on public.schools for insert
  with check (true);
