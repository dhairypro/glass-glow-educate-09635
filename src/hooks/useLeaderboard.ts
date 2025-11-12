import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  studentName: string;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  isCurrentUser: boolean;
}

export function useLeaderboard(userId: string, classId?: string) {
  return useQuery({
    queryKey: ['leaderboard', classId],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      if (!classId) return [];

      // Get the most recent exam for this class
      const { data: recentExam } = await supabase
        .from('exams')
        .select('id')
        .eq('class_id', classId)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!recentExam) return [];

      // Get all students in this class
      const { data: students } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('class_id', classId);

      if (!students || students.length === 0) return [];

      const studentIds = students.map(s => s.user_id);

      // Get marks for all students for the recent exam
      const { data: marks } = await supabase
        .from('student_marks')
        .select('student_id, marks_obtained, max_marks')
        .eq('exam_id', recentExam.id)
        .in('student_id', studentIds);

      if (!marks || marks.length === 0) return [];

      // Calculate totals for each student
      const studentScores = new Map<string, { total: number; max: number; name: string }>();

      students.forEach(student => {
        studentScores.set(student.user_id, {
          total: 0,
          max: 0,
          name: student.full_name || 'Unknown',
        });
      });

      marks.forEach(mark => {
        const current = studentScores.get(mark.student_id);
        if (current) {
          current.total += mark.marks_obtained;
          current.max += mark.max_marks;
        }
      });

      // Create leaderboard entries with percentages
      const leaderboard: LeaderboardEntry[] = Array.from(studentScores.entries())
        .filter(([_, scores]) => scores.max > 0) // Only include students with marks
        .map(([studentId, scores]) => ({
          rank: 0, // Will be assigned after sorting
          userId: studentId,
          studentName: scores.name,
          totalMarks: scores.total,
          maxMarks: scores.max,
          percentage: (scores.total / scores.max) * 100,
          isCurrentUser: studentId === userId,
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // Assign ranks
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Return only top 10 students
      return leaderboard.slice(0, 10);
    },
    enabled: !!classId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
