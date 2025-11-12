import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar as CalendarIcon, X } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RangeCalendar } from '@/components/ui/calendar-enhanced';
import { StudentMark } from '@/hooks/useStudentReport';
import html2canvas from 'html2canvas';
import { parseDate, getLocalTimeZone, today } from '@internationalized/date';
import { DateRange } from 'react-aria-components';

interface EnhancedMarksChartProps {
  marks: StudentMark[];
}

export const EnhancedMarksChart = ({ marks }: EnhancedMarksChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Extract unique exams
  const allExams = useMemo(() => {
    const examMap = new Map();
    marks.forEach(mark => {
      if (!examMap.has(mark.exam.id)) {
        examMap.set(mark.exam.id, {
          id: mark.exam.id,
          name: mark.exam.name,
          date: mark.exam.date,
        });
      }
    });
    return Array.from(examMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [marks]);

  // Filter marks by date range
  const dateFilteredMarks = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end) return marks;
    
    const startDate = new Date(dateRange.start.year, dateRange.start.month - 1, dateRange.start.day);
    const endDate = new Date(dateRange.end.year, dateRange.end.month - 1, dateRange.end.day);
    
    return marks.filter(mark => {
      const markDate = new Date(mark.exam.date);
      return markDate >= startDate && markDate <= endDate;
    });
  }, [marks, dateRange]);

  // Filter marks by selected tests
  const filteredMarks = useMemo(() => {
    if (selectedTests.length === 0) return dateFilteredMarks;
    return dateFilteredMarks.filter(mark => selectedTests.includes(mark.exam.id));
  }, [dateFilteredMarks, selectedTests]);

  // Extract unique subjects from filtered marks
  const subjects = useMemo(() => {
    const subjectMap = new Map();
    filteredMarks.forEach(mark => {
      if (!subjectMap.has(mark.subject.id)) {
        subjectMap.set(mark.subject.id, mark.subject.name);
      }
    });
    return Array.from(subjectMap.entries());
  }, [filteredMarks]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const examGroups = new Map<string, any>();
    
    filteredMarks.forEach(mark => {
      if (!examGroups.has(mark.exam.name)) {
        examGroups.set(mark.exam.name, {
          exam: mark.exam.name,
          date: mark.exam.date,
        });
      }
      const group = examGroups.get(mark.exam.name);
      const percentage = (mark.marks_obtained / mark.max_marks) * 100;
      group[mark.subject.name] = Math.round(percentage * 10) / 10;
    });

    return Array.from(examGroups.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredMarks]);

  const handleTestToggle = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleDownload = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'marks-chart.png';
      link.href = url;
      link.click();
    }
  };

  const clearDateRange = () => {
    setDateRange(undefined);
  };

  const clearTestSelection = () => {
    setSelectedTests([]);
  };

  const totalSelected = filteredMarks.length;
  const totalTests = marks.length;

  return (
    <Card ref={chartRef}>
      <CardHeader className="border-b">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Performance Analysis</CardTitle>
            <CardDescription>
              Showing {totalSelected} of {totalTests} test results
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange?.start && dateRange?.end
                    ? `${dateRange.start.day}/${dateRange.start.month} - ${dateRange.end.day}/${dateRange.end.month}`
                    : "Filter by date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                <RangeCalendar
                  className="w-full"
                  value={dateRange}
                  onChange={setDateRange}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Active Filters */}
        {(selectedTests.length > 0 || dateRange) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {dateRange && (
              <Badge variant="secondary" className="gap-1">
                Date Range
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={clearDateRange}
                />
              </Badge>
            )}
            {selectedTests.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                {selectedTests.length} test{selectedTests.length > 1 ? 's' : ''} selected
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={clearTestSelection}
                />
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        {/* Test Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Select Tests to Compare:</p>
          <div className="flex flex-wrap gap-2">
            {allExams.map(exam => (
              <Button
                key={exam.id}
                variant={selectedTests.includes(exam.id) ? "default" : "outline"}
                size="sm"
                onClick={() => handleTestToggle(exam.id)}
                className="text-xs"
              >
                {exam.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <ChartContainer
            config={subjects.reduce((acc, [id, name], index) => {
              acc[name] = {
                label: name,
                color: `hsl(var(--chart-${(index % 5) + 1}))`,
              };
              return acc;
            }, {} as any)}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="exam"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 100]}
                  fontSize={12}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[200px]"
                      labelFormatter={(value) => `Exam: ${value}`}
                    />
                  }
                />
                {subjects.map(([id, name]) => (
                  <Bar
                    key={id}
                    dataKey={name}
                    fill={`var(--color-${name})`}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No data available for the selected filters
          </div>
        )}
      </CardContent>
    </Card>
  );
};
