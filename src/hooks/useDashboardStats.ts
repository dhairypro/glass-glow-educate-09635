import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = (userId: string) => {
  // Fetch attendance percentage
  const { data: attendancePercent, isLoading: attendanceLoading } = useQuery({
    queryKey: ['dashboard-attendance', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', userId);
      
      if (error) throw error;
      if (!data || data.length === 0) return 0;

      const presentCount = data.filter(record => record.status === 'present').length;
      return Math.round((presentCount / data.length) * 100);
    },
    enabled: !!userId,
  });

  // Fetch active courses count
  const { data: coursesCount, isLoading: coursesLoading } = useQuery({
    queryKey: ['dashboard-courses', userId],
    queryFn: async () => {
      // First get the student's class_id
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('class_id')
        .eq('user_id', userId)
        .single();
      
      if (profileErr) throw profileErr;
      if (!profile?.class_id) return 0;

      // Count subjects for that class
      const { data, error } = await supabase
        .from('subjects')
        .select('id', { count: 'exact' })
        .eq('class_id', profile.class_id);
      
      if (error) throw error;
      return data?.length ?? 0;
    },
    enabled: !!userId,
  });

  // Fetch average marks with decimal precision
  const { data: averageMarks, isLoading: marksLoading } = useQuery({
    queryKey: ['dashboard-marks', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_marks')
        .select('marks_obtained, max_marks')
        .eq('student_id', userId);
      
      if (error) throw error;
      if (!data || data.length === 0) return 0;

      const totalObtained = data.reduce((sum, record) => sum + (record.marks_obtained || 0), 0);
      const totalMax = data.reduce((sum, record) => sum + (record.max_marks || 0), 0);
      
      if (totalMax === 0) return 0;
      // Return with one decimal place precision
      return Math.round((totalObtained / totalMax) * 100 * 10) / 10;
    },
    enabled: !!userId,
  });

  return {
    attendancePercent: attendancePercent ?? 0,
    coursesCount: coursesCount ?? 0,
    averageMarks: averageMarks ?? 0,
    isLoading: attendanceLoading || coursesLoading || marksLoading,
  };
};
