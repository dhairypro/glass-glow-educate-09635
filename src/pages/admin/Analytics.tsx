import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClasses } from '@/hooks/useClasses';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function Analytics() {
  const navigate = useNavigate();
  const { classes } = useClasses();
  const [selectedClass, setSelectedClass] = useState('');
  const [dateRange, setDateRange] = useState(30);

  const { data: attendanceStats } = useQuery({
    queryKey: ['attendance-stats', selectedClass, dateRange],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), dateRange), 'yyyy-MM-dd');
      let query = supabase
        .from('attendance')
        .select('status, date, class_id')
        .gte('date', startDate);

      if (selectedClass) {
        query = query.eq('class_id', selectedClass);
      }

      const { data, error } = await query;
      if (error) throw error;

      const statusCount = { present: 0, absent: 0, late: 0 };
      data?.forEach((record) => {
        statusCount[record.status as keyof typeof statusCount]++;
      });

      const total = statusCount.present + statusCount.absent + statusCount.late;
      const attendanceRate = total > 0 ? ((statusCount.present / total) * 100).toFixed(1) : 0;

      return { statusCount, attendanceRate, total };
    },
  });

  const { data: marksStats } = useQuery({
    queryKey: ['marks-stats', selectedClass],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_marks')
        .select(`
          marks_obtained,
          max_marks,
          student_id,
          subjects(name)
        `);
      
      if (error) throw error;

      // Get student profiles separately
      const studentIds = data?.map(m => m.student_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', studentIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]));

      const subjectAverages: Record<string, { total: number; count: number }> = {};
      const topStudents: Record<string, number> = {};

      data?.forEach((mark: any) => {
        const percentage = (mark.marks_obtained / mark.max_marks) * 100;
        const subjectName = mark.subjects?.name || 'Unknown';
        const studentName = profileMap.get(mark.student_id) || 'Unknown';

        if (!subjectAverages[subjectName]) {
          subjectAverages[subjectName] = { total: 0, count: 0 };
        }
        subjectAverages[subjectName].total += percentage;
        subjectAverages[subjectName].count++;

        if (!topStudents[studentName]) {
          topStudents[studentName] = 0;
        }
        topStudents[studentName] += percentage;
      });

      const subjectData = Object.entries(subjectAverages).map(([name, stats]) => ({
        name,
        average: (stats.total / stats.count).toFixed(1),
      }));

      const topPerformers = Object.entries(topStudents)
        .map(([name, total]) => ({ name, average: total }))
        .sort((a, b) => b.average - a.average)
        .slice(0, 10);

      return { subjectData, topPerformers };
    },
  });

  const { data: classStats } = useQuery({
    queryKey: ['class-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, title, profiles!inner(user_roles!inner(role))')
        .eq('profiles.user_roles.role', 'student');

      if (error) throw error;

      const classDistribution = data?.reduce((acc: any, cls: any) => {
        const className = cls.title;
        acc[className] = (acc[className] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(classDistribution || {}).map(([name, value]) => ({
        name,
        students: value,
      }));
    },
  });

  const pieData = [
    { name: 'Present', value: attendanceStats?.statusCount.present || 0 },
    { name: 'Absent', value: attendanceStats?.statusCount.absent || 0 },
    { name: 'Late', value: attendanceStats?.statusCount.late || 0 },
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{classStats?.reduce((acc, cls) => acc + (cls.students as number), 0) || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{attendanceStats?.attendanceRate}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{classes?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Students per Class</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Marks by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marksStats?.subjectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {marksStats?.topPerformers.slice(0, 5).map((student, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span>{student.name}</span>
                    <span className="font-bold">{student.average.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
