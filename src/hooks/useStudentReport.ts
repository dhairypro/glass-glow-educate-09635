import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StudentMark {
  id: string;
  marks_obtained: number;
  max_marks: number;
  created_at: string;
  exam: {
    id: string;
    name: string;
    date: string;
  };
  subject: {
    id: string;
    name: string;
  };
}

export interface StudentReportData {
  profile: {
    user_id: string;
    full_name: string;
    roll_no: string;
    class_id: string;
    class_name: string;
  };
  marks: StudentMark[];
  feeSummary: {
    total_fees: number;
    paid_amount: number;
    pending_amount: number;
    academic_year: string;
  } | null;
  feePayments: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    transaction_reference: string | null;
  }>;
  statistics: {
    averagePercentage: number;
    totalTests: number;
    totalObtained: number;
    totalMax: number;
  };
}

export const useStudentReport = (studentId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['student-report', studentId],
    queryFn: async (): Promise<StudentReportData | null> => {
      if (!studentId) return null;

      // Fetch student profile with class info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          roll_no,
          class_id,
          classes:class_id (title)
        `)
        .eq('user_id', studentId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }
      
      if (!profile) {
        throw new Error('Student profile not found');
      }

      // Fetch all marks with exam and subject details
      const { data: marks, error: marksError } = await supabase
        .from('student_marks')
        .select(`
          id,
          marks_obtained,
          max_marks,
          created_at,
          exams:exam_id (id, name, date),
          subjects:subject_id (id, name)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });

      if (marksError) {
        console.error('Marks fetch error:', marksError);
        throw marksError;
      }

      // Fetch fee summary (may not exist if tables not created)
      const { data: feeSummary, error: feeError } = await supabase
        .from('student_fee_summary')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (feeError) {
        console.warn('Fee summary fetch error (table may not exist):', feeError);
      }

      // Fetch fee payments (may not exist if tables not created)
      const { data: feePayments, error: paymentsError } = await supabase
        .from('fee_payments')
        .select('id, amount, payment_date, payment_method, transaction_reference')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });

      if (paymentsError) {
        console.warn('Fee payments fetch error (table may not exist):', paymentsError);
      }

      // Calculate statistics
      const totalObtained = marks?.reduce((sum, m) => sum + (m.marks_obtained || 0), 0) || 0;
      const totalMax = marks?.reduce((sum, m) => sum + (m.max_marks || 0), 0) || 0;
      const averagePercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100 * 10) / 10 : 0;

      return {
        profile: {
          user_id: profile.user_id,
          full_name: profile.full_name,
          roll_no: profile.roll_no,
          class_id: profile.class_id,
          class_name: (profile.classes as any)?.title || 'N/A',
        },
        marks: marks?.map(m => ({
          id: m.id,
          marks_obtained: m.marks_obtained,
          max_marks: m.max_marks,
          created_at: m.created_at,
          exam: {
            id: (m.exams as any)?.id || '',
            name: (m.exams as any)?.name || 'Unknown',
            date: (m.exams as any)?.date || '',
          },
          subject: {
            id: (m.subjects as any)?.id || '',
            name: (m.subjects as any)?.name || 'Unknown',
          },
        })) || [],
        feeSummary: feeSummary ? {
          total_fees: feeSummary.total_fees || 0,
          paid_amount: feeSummary.paid_amount || 0,
          pending_amount: feeSummary.pending_amount || 0,
          academic_year: feeSummary.academic_year || '',
        } : null,
        feePayments: feePayments || [],
        statistics: {
          averagePercentage,
          totalTests: marks?.length || 0,
          totalObtained,
          totalMax,
        },
      };
    },
    enabled: !!studentId,
  });

  return { data, isLoading, error };
};
