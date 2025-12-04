-- Fix security issues

-- 1. Drop and recreate student_fee_summary view without SECURITY DEFINER
DROP VIEW IF EXISTS public.student_fee_summary;

CREATE VIEW public.student_fee_summary AS
SELECT 
  p.user_id as student_id,
  p.full_name as student_name,
  p.class_id,
  c.title as class_name,
  fs.academic_year,
  COALESCE(fs.amount, 0) as total_fees,
  COALESCE(
    (SELECT SUM(fp.amount) 
     FROM public.fee_payments fp 
     WHERE fp.student_id = p.user_id 
     AND fp.academic_year = fs.academic_year),
    0
  ) as paid_amount,
  COALESCE(fs.amount, 0) - COALESCE(
    (SELECT SUM(fp.amount) 
     FROM public.fee_payments fp 
     WHERE fp.student_id = p.user_id 
     AND fp.academic_year = fs.academic_year),
    0
  ) as pending_amount
FROM public.profiles p
LEFT JOIN public.classes c ON c.id = p.class_id
LEFT JOIN public.fee_structures fs ON fs.class_id = p.class_id
WHERE EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.user_id AND ur.role = 'student'
);

-- 2. Update update_announcement_timestamp function with proper search_path
CREATE OR REPLACE FUNCTION public.update_announcement_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Update update_fee_structure_timestamp function with proper search_path
CREATE OR REPLACE FUNCTION public.update_fee_structure_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. Update update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Fix attendance RLS: Teachers can only view/manage attendance for classes they teach
DROP POLICY IF EXISTS "Admins and teachers can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins and teachers can manage attendance" ON public.attendance;

-- Admins can view all attendance
CREATE POLICY "Admins can view all attendance" ON public.attendance
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Teachers can view attendance for their classes only
CREATE POLICY "Teachers can view their class attendance" ON public.attendance
FOR SELECT USING (
  has_role(auth.uid(), 'teacher') AND 
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = attendance.class_id 
    AND classes.teacher_id = auth.uid()
  )
);

-- Admins can manage all attendance
CREATE POLICY "Admins can manage all attendance" ON public.attendance
FOR ALL USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Teachers can manage attendance for their classes only
CREATE POLICY "Teachers can manage their class attendance" ON public.attendance
FOR ALL USING (
  has_role(auth.uid(), 'teacher') AND 
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = attendance.class_id 
    AND classes.teacher_id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'teacher') AND 
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = attendance.class_id 
    AND classes.teacher_id = auth.uid()
  )
);

-- 6. Fix profiles RLS: More restrictive access
DROP POLICY IF EXISTS "Admins and teachers can view all profiles" ON public.profiles;

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Teachers can only view profiles of students in their classes
CREATE POLICY "Teachers can view their class student profiles" ON public.profiles
FOR SELECT USING (
  has_role(auth.uid(), 'teacher') AND 
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = profiles.class_id 
    AND classes.teacher_id = auth.uid()
  )
);