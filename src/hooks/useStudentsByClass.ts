import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStudentsByClass = (classId: string | null) => {
  const { data: students, isLoading } = useQuery({
    queryKey: ['students-by-class', classId],
    queryFn: async () => {
      if (!classId) return [];
      
      // Get all student user_ids
      const { data: roleRows, error: roleErr } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');
      if (roleErr) throw roleErr;

      const ids = (roleRows ?? []).map(r => r.user_id);
      if (ids.length === 0) return [];

      // Get profiles for those users in the specific class
      const { data: profiles, error: profileErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, roll_no')
        .in('user_id', ids)
        .eq('class_id', classId)
        .order('full_name');
      if (profileErr) throw profileErr;

      return profiles ?? [];
    },
    enabled: !!classId,
  });

  return { students, isLoading };
};
