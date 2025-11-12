import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FeeStructure {
  id: string;
  class_id: string;
  academic_year: string;
  amount: number;
  description?: string;
  created_at: string;
  classes?: {
    title: string;
  };
}

export interface FeePayment {
  id: string;
  student_id: string;
  class_id: string;
  academic_year: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_reference?: string;
  remarks?: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
  classes?: {
    title: string;
  };
}

export interface StudentFeeSummary {
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  academic_year: string;
}

export const useFees = () => {
  const queryClient = useQueryClient();

  const { data: feeStructures, isLoading: structuresLoading } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_structures')
        .select(`
          *,
          classes:class_id (title)
        `)
        .order('academic_year', { ascending: false });

      if (error) throw error;
      return data as FeeStructure[];
    },
  });

  const { data: feePayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['fee-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_payments')
        .select(`
          *,
          profiles:student_id (full_name),
          classes:class_id (title)
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as FeePayment[];
    },
  });

  const { data: studentFeeSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['student-fee-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_fee_summary')
        .select('*')
        .order('student_name');

      if (error) throw error;
      return data as StudentFeeSummary[];
    },
  });

  const createFeeStructure = useMutation({
    mutationFn: async (structure: {
      class_id: string;
      academic_year: string;
      amount: number;
      description?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('fee_structures')
        .insert([{ ...structure, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      queryClient.invalidateQueries({ queryKey: ['student-fee-summary'] });
      toast({
        title: 'Success',
        description: 'Fee structure created',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const recordPayment = useMutation({
    mutationFn: async (payment: {
      student_id: string;
      class_id: string;
      academic_year: string;
      amount: number;
      payment_date: string;
      payment_method: string;
      transaction_reference?: string;
      remarks?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('fee_payments')
        .insert([{ ...payment, recorded_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] });
      queryClient.invalidateQueries({ queryKey: ['student-fee-summary'] });
      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteFeeStructure = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fee_structures')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      queryClient.invalidateQueries({ queryKey: ['student-fee-summary'] });
      toast({
        title: 'Success',
        description: 'Fee structure deleted',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    feeStructures,
    feePayments,
    studentFeeSummary,
    isLoading: structuresLoading || paymentsLoading || summaryLoading,
    createFeeStructure,
    recordPayment,
    deleteFeeStructure,
  };
};
