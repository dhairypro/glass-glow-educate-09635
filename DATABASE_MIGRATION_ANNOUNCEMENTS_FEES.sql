-- =====================================================
-- ANNOUNCEMENTS SYSTEM
-- =====================================================

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  link text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements
CREATE POLICY "Admins and teachers can manage announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students can view announcements for their class"
ON public.announcements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.class_id = announcements.class_id
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_announcements_class_id ON public.announcements(class_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);

-- Trigger function to notify students when announcement is created
CREATE OR REPLACE FUNCTION public.notify_students_on_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert notifications for all students in the target class
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT 
    profiles.user_id,
    NEW.title,
    NEW.content,
    'announcement'
  FROM public.profiles
  WHERE profiles.class_id = NEW.class_id
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = profiles.user_id
    AND user_roles.role = 'student'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_announcement_created ON public.announcements;
CREATE TRIGGER on_announcement_created
  AFTER INSERT ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_students_on_announcement();

-- =====================================================
-- FEES MANAGEMENT SYSTEM
-- =====================================================

-- Create fee_structures table
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  academic_year text NOT NULL,
  fee_type text NOT NULL, -- 'tuition', 'exam', 'registration', 'library', 'other'
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (class_id, academic_year, fee_type)
);

-- Enable RLS
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fee_structures
CREATE POLICY "Admins can manage fee structures"
ON public.fee_structures
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students and teachers can view fee structures"
ON public.fee_structures
FOR SELECT
TO authenticated
USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_fee_structures_class_year ON public.fee_structures(class_id, academic_year);

-- Create fee_payments table
CREATE TABLE IF NOT EXISTS public.fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  academic_year text NOT NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL DEFAULT 'cash', -- 'cash', 'online', 'cheque', 'upi'
  transaction_reference text,
  remarks text,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fee_payments
CREATE POLICY "Admins can manage all fee payments"
ON public.fee_payments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view their own fee payments"
ON public.fee_payments
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON public.fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_class_year ON public.fee_payments(class_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_fee_payments_date ON public.fee_payments(payment_date DESC);

-- Create a view for student fee summary
CREATE OR REPLACE VIEW public.student_fee_summary AS
SELECT 
  p.user_id as student_id,
  p.full_name as student_name,
  p.class_id,
  c.name as class_name,
  COALESCE(SUM(fs.amount), 0) as total_fees,
  COALESCE(SUM(fp.amount), 0) as paid_amount,
  COALESCE(SUM(fs.amount), 0) - COALESCE(SUM(fp.amount), 0) as pending_amount,
  fs.academic_year
FROM public.profiles p
INNER JOIN public.classes c ON p.class_id = c.id
LEFT JOIN public.fee_structures fs ON fs.class_id = p.class_id
LEFT JOIN public.fee_payments fp ON fp.student_id = p.user_id 
  AND fp.class_id = p.class_id 
  AND fp.academic_year = fs.academic_year
WHERE EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = p.user_id AND ur.role = 'student'
)
GROUP BY p.user_id, p.full_name, p.class_id, c.name, fs.academic_year;

-- Helper function to get student fee status
CREATE OR REPLACE FUNCTION public.get_student_fee_status(
  _student_id uuid,
  _academic_year text DEFAULT NULL
)
RETURNS TABLE (
  total_fees numeric,
  paid_amount numeric,
  pending_amount numeric,
  payment_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(SUM(fs.amount), 0) as total_fees,
    COALESCE(SUM(fp.amount), 0) as paid_amount,
    COALESCE(SUM(fs.amount), 0) - COALESCE(SUM(fp.amount), 0) as pending_amount,
    CASE 
      WHEN COALESCE(SUM(fs.amount), 0) = 0 THEN 'no_fees'
      WHEN COALESCE(SUM(fp.amount), 0) >= COALESCE(SUM(fs.amount), 0) THEN 'paid'
      WHEN COALESCE(SUM(fp.amount), 0) = 0 THEN 'unpaid'
      ELSE 'partial'
    END as payment_status
  FROM public.profiles p
  LEFT JOIN public.fee_structures fs ON fs.class_id = p.class_id
    AND (_academic_year IS NULL OR fs.academic_year = _academic_year)
  LEFT JOIN public.fee_payments fp ON fp.student_id = p.user_id 
    AND fp.class_id = p.class_id 
    AND fp.academic_year = fs.academic_year
  WHERE p.user_id = _student_id;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_student_fee_status TO authenticated;

-- Update updated_at timestamp trigger for announcements
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_fee_structures_updated_at ON public.fee_structures;
CREATE TRIGGER update_fee_structures_updated_at
  BEFORE UPDATE ON public.fee_structures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
