# Database Setup Instructions

## Overview
This document contains the SQL schema needed to set up the Graph Educations database in Supabase.

## Setup Steps

### 1. Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://ddsjinvivcfrjltlwnof.supabase.co
2. Navigate to the "SQL Editor" section
3. Create a new query

### 2. Run the Schema SQL

Copy and paste the following SQL into the SQL Editor and execute it:

```sql
-- Create app_role enum
create type public.app_role as enum ('admin', 'teacher', 'student');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create profiles table
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text,
  roll_no text,
  class_id uuid,
  profile_image text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Create classes table
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  academic_year text not null,
  teacher_id uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.classes enable row level security;

-- Add foreign key after classes table is created
alter table public.profiles 
add constraint profiles_class_id_fkey 
foreign key (class_id) references public.classes(id);

-- Create subjects table
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

alter table public.subjects enable row level security;

-- Create chapters table
create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete cascade not null,
  title text not null,
  created_at timestamptz default now()
);

alter table public.chapters enable row level security;

-- Create files table
create table public.files (
  id uuid primary key default gen_random_uuid(),
  parent_type text not null,
  parent_id uuid not null,
  title text not null,
  file_url text not null,
  file_type text not null,
  uploaded_by uuid references auth.users(id) not null,
  created_at timestamptz default now()
);

alter table public.files enable row level security;

-- Create attendance table
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade not null,
  student_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  status text not null check (status in ('present', 'absent', 'late')),
  marked_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  unique(class_id, student_id, date)
);

create index idx_attendance_date_class on public.attendance(date, class_id);

alter table public.attendance enable row level security;

-- Create exams table
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade not null,
  name text not null,
  date date not null,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now()
);

alter table public.exams enable row level security;

-- Create student_marks table
create table public.student_marks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade not null,
  exam_id uuid references public.exams(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  marks_obtained numeric not null,
  max_marks numeric not null,
  created_at timestamptz default now(),
  unique(student_id, exam_id, subject_id)
);

create index idx_student_marks_student_exam on public.student_marks(student_id, exam_id);

alter table public.student_marks enable row level security;

-- Create notifications table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

-- RLS Policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can manage all roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (user_id = auth.uid());

create policy "Admins and teachers can view all profiles"
  on public.profiles for select
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

create policy "Admins and teachers can update all profiles"
  on public.profiles for update
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

-- RLS Policies for classes
create policy "Authenticated users can view classes"
  on public.classes for select
  to authenticated
  using (true);

create policy "Admins and teachers can manage classes"
  on public.classes for all
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

-- RLS Policies for subjects
create policy "Authenticated users can view subjects"
  on public.subjects for select
  to authenticated
  using (true);

create policy "Admins and teachers can manage subjects"
  on public.subjects for all
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

-- RLS Policies for chapters
create policy "Authenticated users can view chapters"
  on public.chapters for select
  to authenticated
  using (true);

create policy "Admins and teachers can manage chapters"
  on public.chapters for all
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

-- RLS Policies for files
create policy "Authenticated users can view files"
  on public.files for select
  to authenticated
  using (true);

create policy "Admins and teachers can manage files"
  on public.files for all
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

-- RLS Policies for attendance
create policy "Students can view their own attendance"
  on public.attendance for select
  to authenticated
  using (student_id = auth.uid());

create policy "Admins and teachers can view all attendance"
  on public.attendance for select
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

create policy "Admins and teachers can manage attendance"
  on public.attendance for all
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

-- RLS Policies for exams
create policy "Authenticated users can view exams"
  on public.exams for select
  to authenticated
  using (true);

create policy "Admins and teachers can manage exams"
  on public.exams for all
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

-- RLS Policies for student_marks
create policy "Students can view their own marks"
  on public.student_marks for select
  to authenticated
  using (student_id = auth.uid());

create policy "Admins and teachers can view all marks"
  on public.student_marks for select
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

create policy "Admins and teachers can manage marks"
  on public.student_marks for all
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

-- RLS Policies for notifications
create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());

create policy "Admins and teachers can create notifications"
  on public.notifications for insert
  to authenticated
  with check (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'teacher')
  );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  
  -- Assign default student role
  insert into public.user_roles (user_id, role)
  values (new.id, 'student');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 3. Verify Tables Created

After running the SQL, verify that the following tables exist:
- user_roles
- profiles
- classes
- subjects
- chapters
- files
- attendance
- exams
- student_marks
- notifications

### 4. Create Your First Admin User

After the first user signs up through the application, you'll need to manually assign them the admin role:

```sql
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

To find the user ID, run:
```sql
SELECT id, email FROM auth.users;
```

### 5. Optional: Disable Email Confirmation

For faster testing during development:
1. Go to Authentication > Settings in Supabase
2. Find "Email Confirmation" under Email Auth
3. Disable "Enable email confirmations"

**Important**: Re-enable this in production!

### 6. Setup Storage Bucket (REQUIRED)

Run this SQL to enable file uploads:

```sql
-- Create storage bucket for course materials
insert into storage.buckets (id, name, public)
values ('course-materials', 'course-materials', true)
on conflict (id) do nothing;

-- RLS policies for storage
create policy "Authenticated users can view files"
on storage.objects for select
to authenticated
using (bucket_id = 'course-materials');

create policy "Admins and teachers can upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'course-materials' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
);

create policy "Admins and teachers can delete files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'course-materials' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
);
```

### 7. CRITICAL: Regenerate TypeScript Types

After running all SQL migrations, you MUST regenerate the Supabase types:

**Option 1 - Using Supabase Dashboard:**
1. Go to API Docs in your Supabase project
2. Find the TypeScript types section
3. Copy all the types
4. Replace the content of `src/integrations/supabase/types.gen.ts`

**Option 2 - Using Supabase CLI:**
```bash
npx supabase gen types typescript --project-id ddsjinvivcfrjltlwnof > src/integrations/supabase/types.gen.ts
```

This is REQUIRED to fix TypeScript errors!

## Database Structure

### Role-Based Access Control
- **student**: Default role, can view their own data
- **teacher**: Can view and manage all student data, attendance, and marks
- **admin**: Full access to all features and data

### Key Tables
- **profiles**: Extended user information
- **classes**: Academic classes
- **subjects**: Subjects within each class
- **attendance**: Daily attendance records
- **exams**: Exam definitions
- **student_marks**: Individual student marks for exams
- **files**: Course materials and documents
- **notifications**: System notifications

## Security
All tables have Row-Level Security (RLS) enabled with appropriate policies based on user roles.
