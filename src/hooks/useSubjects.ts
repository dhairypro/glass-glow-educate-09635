import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSubjects = (classId?: string) => {
  const queryClient = useQueryClient();

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: async () => {
      let query = supabase.from('subjects').select('*, chapters(*)');
      
      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  const createSubject = useMutation({
    mutationFn: async (subjectData: any) => {
      const { error } = await supabase.from('subjects').insert(subjectData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Subject created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating subject', description: error.message, variant: 'destructive' });
    },
  });

  const updateSubject = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from('subjects').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Subject updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating subject', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Subject deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting subject', description: error.message, variant: 'destructive' });
    },
  });

  return { subjects, isLoading, createSubject, updateSubject, deleteSubject };
};
