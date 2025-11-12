import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useClasses = () => {
  const queryClient = useQueryClient();

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createClass = useMutation({
    mutationFn: async (classData: any) => {
      const { error } = await supabase.from('classes').insert(classData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Class created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating class', description: error.message, variant: 'destructive' });
    },
  });

  const updateClass = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from('classes').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: 'Class updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating class', description: error.message, variant: 'destructive' });
    },
  });

  const deleteClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Class deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting class', description: error.message, variant: 'destructive' });
    },
  });

  return { classes, isLoading, createClass, updateClass, deleteClass };
};
