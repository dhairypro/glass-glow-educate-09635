import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useStudents = () => {
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      // Step 1: Get all student user_ids
      const { data: roleRows, error: roleErr } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');
      if (roleErr) throw roleErr;

      const ids = (roleRows ?? []).map(r => r.user_id);
      if (ids.length === 0) return [];

      // Step 2: Get profiles for those users
      const { data: profiles, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', ids)
        .order('created_at', { ascending: false });
      if (profileErr) throw profileErr;

      // Step 3: Get class details for profiles that have class_id
      const classIds = profiles?.filter(p => p.class_id).map(p => p.class_id) ?? [];
      let classesMap: Record<string, any> = {};
      
      if (classIds.length > 0) {
        const { data: classes, error: classErr } = await supabase
          .from('classes')
          .select('id, title')
          .in('id', classIds);
        if (classErr) throw classErr;
        classesMap = (classes ?? []).reduce((acc, cls) => ({ ...acc, [cls.id]: cls }), {});
      }

      // Merge class data into profiles
      return profiles?.map(profile => ({
        ...profile,
        classes: profile.class_id ? classesMap[profile.class_id] : null
      })) ?? [];
    },
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, full_name, roll_no, class_id }: any) => {
      const payload: any = {};
      if (full_name !== undefined) payload.full_name = full_name;
      if (roll_no !== undefined) payload.roll_no = roll_no;
      if (class_id !== undefined) payload.class_id = class_id;
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Student updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating student', description: error.message, variant: 'destructive' });
    },
  });

  const deleteStudent = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Student deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting student', description: error.message, variant: 'destructive' });
    },
  });

  return { students, isLoading, updateStudent, deleteStudent };
};
