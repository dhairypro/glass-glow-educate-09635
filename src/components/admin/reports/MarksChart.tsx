import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, BarChart3 } from 'lucide-react';
import { StudentMark } from '@/hooks/useStudentReport';
import html2canvas from 'html2canvas';
import { toast } from '@/hooks/use-toast';

interface MarksChartProps {
  marks: StudentMark[];
}

export const MarksChart = ({ marks }: MarksChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  // Get unique exams
  const uniqueExams = marks.reduce((acc, mark) => {
    if (!acc.find(e => e.id === mark.exam.id)) {
      acc.push({ id: mark.exam.id, name: mark.exam.name, date: mark.exam.date });
    }
    return acc;
  }, [] as Array<{ id: string; name: string; date: string }>);

  // Initialize with all exams if none selected
  const displayExams = selectedExams.length > 0 
    ? selectedExams 
    : uniqueExams.map(e => e.id);

  // Prepare chart data
  const chartData = uniqueExams
    .filter(exam => displayExams.includes(exam.id))
    .map(exam => {
      const examMarks = marks.filter(m => m.exam.id === exam.id);
      const dataPoint: any = { examName: exam.name };
      
      examMarks.forEach(mark => {
        dataPoint[mark.subject.name] = mark.marks_obtained;
      });
      
      return dataPoint;
    });

  // Get unique subjects for bars
  const subjects = [...new Set(marks.map(m => m.subject.name))];
  
  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const handleDownload = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'marks-chart.png';
      link.href = url;
      link.click();
      
      toast({ title: 'Chart downloaded successfully!' });
    } catch (error) {
      toast({ 
        title: 'Download failed', 
        description: 'Could not download chart',
        variant: 'destructive' 
      });
    }
  };

  const handleExamToggle = (examId: string) => {
    setSelectedExams(prev => {
      if (prev.includes(examId)) {
        return prev.filter(id => id !== examId);
      }
      return [...prev, examId];
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Marks vs Exam Comparison
          </CardTitle>
          <Button onClick={handleDownload} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Chart
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Exams to Compare</label>
          <div className="flex flex-wrap gap-2">
            {uniqueExams.map(exam => (
              <Button
                key={exam.id}
                size="sm"
                variant={displayExams.includes(exam.id) ? 'default' : 'outline'}
                onClick={() => handleExamToggle(exam.id)}
              >
                {exam.name}
              </Button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <div ref={chartRef} className="bg-card p-4 rounded-lg">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="examName" 
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {subjects.map((subject, idx) => (
                  <Bar
                    key={subject}
                    dataKey={subject}
                    fill={COLORS[idx % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {marks.length === 0 ? 'No marks data available' : 'Select exams to display'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
