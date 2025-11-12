import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface Mark {
  marks_obtained: number;
  max_marks: number;
  subject: {
    name: string;
  };
  exam: {
    name: string;
    date: string;
  };
}

export default function MarksCard({ studentId }: { studentId: string }) {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
  }, [studentId]);

  const fetchMarks = async () => {
    const { data } = await supabase
      .from('student_marks')
      .select(`
        marks_obtained,
        max_marks,
        subjects:subject_id (name),
        exams:exam_id (name, date)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(5);

    setMarks(data as any || []);
    setLoading(false);
  };

  const getAverage = () => {
    if (marks.length === 0) return 0;
    const total = marks.reduce((sum, m) => sum + (m.marks_obtained / m.max_marks) * 100, 0);
    return Math.round(total / marks.length);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recent Marks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average</span>
              <span className="text-2xl font-bold">{getAverage()}%</span>
            </div>
            <div className="space-y-3">
              {marks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No marks available yet</p>
              ) : (
                marks.map((mark, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 glass rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{mark.subject?.name || 'Subject'}</p>
                      <p className="text-xs text-muted-foreground">{mark.exam?.name || 'Exam'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {mark.marks_obtained}/{mark.max_marks}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((mark.marks_obtained / mark.max_marks) * 100)}%
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
