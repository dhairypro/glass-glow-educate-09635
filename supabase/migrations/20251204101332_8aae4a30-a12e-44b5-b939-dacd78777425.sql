-- Recreate student_fee_summary view with security_invoker to fix SECURITY DEFINER warning
DROP VIEW IF EXISTS public.student_fee_summary;

CREATE VIEW public.student_fee_summary 
WITH (security_invoker = true)
AS
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