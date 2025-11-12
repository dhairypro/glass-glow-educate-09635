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

-- =====================================================
-- FEES MANAGEMENT SYSTEM
-- =====================================================

-- Create fee_structures table (single total fee per class per year)
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  academic_year text NOT NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (class_id, academic_year)
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
  student_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  academic_year text NOT NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL DEFAULT 'cash',
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
  c.title as class_name,
  COALESCE(fs.amount, 0) as total_fees,
  COALESCE(SUM(fp.amount), 0) as paid_amount,
  COALESCE(fs.amount, 0) - COALESCE(SUM(fp.amount), 0) as pending_amount,
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
GROUP BY p.user_id, p.full_name, p.class_id, c.title, fs.academic_year, fs.amount;

-- Update updated_at timestamp trigger
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
