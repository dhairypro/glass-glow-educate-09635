import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FullLeaderboardEntry {
  rank: number;
  userId: string;
  studentName: string;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  isCurrentUser: boolean;
}

export interface LeaderboardData {
  entries: FullLeaderboardEntry[];
  examName: string;
  examDate: string;
  className: string;
  currentUserEntry?: FullLeaderboardEntry;
}

export function useFullLeaderboard(userId: string, classId?: string) {
  return useQuery({
    queryKey: ['full-leaderboard', classId, userId],
    queryFn: async (): Promise<LeaderboardData | null> => {
      if (!classId) return null;

      // Get the most recent exam for this class
      const { data: recentExam } = await supabase
        .from('exams')
        .select('id, name, date')
        .eq('class_id', classId)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!recentExam) return null;

      // Get class name
      const { data: classData } = await supabase
        .from('classes')
        .select('title')
        .eq('id', classId)
        .single();

      // Get all students in this class
      const { data: students } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('class_id', classId);

      if (!students || students.length === 0) return null;

      const studentIds = students.map(s => s.user_id);

      // Get marks for all students for the recent exam
      const { data: marks } = await supabase
        .from('student_marks')
        .select('student_id, marks_obtained, max_marks')
        .eq('exam_id', recentExam.id)
        .in('student_id', studentIds);

      if (!marks || marks.length === 0) return null;

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
      const entries: FullLeaderboardEntry[] = Array.from(studentScores.entries())
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
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      const currentUserEntry = entries.find(e => e.isCurrentUser);

      return {
        entries,
        examName: recentExam.name,
        examDate: recentExam.date,
        className: classData?.title || 'Class',
        currentUserEntry,
      };
    },
    enabled: !!classId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
