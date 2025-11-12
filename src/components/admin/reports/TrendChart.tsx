import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { StudentMark } from '@/hooks/useStudentReport';
import html2canvas from 'html2canvas';
import { toast } from '@/hooks/use-toast';

interface TrendChartProps {
  marks: StudentMark[];
}

export const TrendChart = ({ marks }: TrendChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Group marks by exam and calculate average percentage per exam
  const examData = marks.reduce((acc, mark) => {
    const examId = mark.exam.id;
    if (!acc[examId]) {
      acc[examId] = {
        examName: mark.exam.name,
        examDate: mark.exam.date,
        marks: [],
      };
    }
    acc[examId].marks.push({
      obtained: mark.marks_obtained,
      max: mark.max_marks,
    });
    return acc;
  }, {} as Record<string, { examName: string; examDate: string; marks: Array<{ obtained: number; max: number }> }>);

  // Calculate average percentage for each exam and percentage change
  const chartData = Object.values(examData)
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .map((exam, idx, arr) => {
      const totalObtained = exam.marks.reduce((sum, m) => sum + m.obtained, 0);
      const totalMax = exam.marks.reduce((sum, m) => sum + m.max, 0);
      const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100 * 10) / 10 : 0;

      let change = 0;
      if (idx > 0) {
        const prevExam = arr[idx - 1];
        const prevTotalObtained = prevExam.marks.reduce((sum, m) => sum + m.obtained, 0);
        const prevTotalMax = prevExam.marks.reduce((sum, m) => sum + m.max, 0);
        const prevPercentage = prevTotalMax > 0 ? (prevTotalObtained / prevTotalMax) * 100 : 0;
        change = Math.round((percentage - prevPercentage) * 10) / 10;
      }

      return {
        examName: exam.examName,
        percentage,
        change,
      };
    });

  const handleDownload = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'performance-trend.png';
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{payload[0].payload.examName}</p>
          <p className="text-sm">
            Percentage: <span className="font-bold">{payload[0].value}%</span>
          </p>
          {payload[0].payload.change !== 0 && (
            <p className={`text-sm ${payload[0].payload.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              Change: {payload[0].payload.change > 0 ? '+' : ''}{payload[0].payload.change}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trend
          </CardTitle>
          <Button onClick={handleDownload} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Chart
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div ref={chartRef} className="bg-card p-4 rounded-lg">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="examName" 
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                  label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={75} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Percentage"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Performance trend across {chartData.length} exams
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No marks data available for trend analysis
          </p>
        )}
      </CardContent>
    </Card>
  );
};
