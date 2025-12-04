import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useClasses } from '@/hooks/useClasses';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function Attendance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classes } = useClasses();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass, selectedDate]);

  const loadStudents = async () => {
    setLoading(true);

    // Get student user_ids
    const { data: roleRows, error: roleErr } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'student');
    if (roleErr) {
      setLoading(false);
      toast({ title: 'Error loading roles', description: roleErr.message, variant: 'destructive' });
      return;
    }
    const ids = (roleRows ?? []).map(r => r.user_id);

    // Get students by class and user_ids
    const { data: studentsData, error: studentsErr } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, roll_no')
      .eq('class_id', selectedClass)
      .in('user_id', ids);
    if (studentsErr) {
      setLoading(false);
      toast({ title: 'Error loading students', description: studentsErr.message, variant: 'destructive' });
      return;
    }

    setStudents(studentsData ?? []);

    // Load existing attendance
    const { data: existingAttendance, error: attErr } = await supabase
      .from('attendance')
      .select('*')
      .eq('class_id', selectedClass)
      .eq('date', format(selectedDate, 'yyyy-MM-dd'));

    if (attErr) {
      setLoading(false);
      toast({ title: 'Error loading attendance', description: attErr.message, variant: 'destructive' });
      return;
    }

    const attendanceMap: Record<string, 'present' | 'absent' | 'late'> = {};
    existingAttendance?.forEach((record) => {
      attendanceMap[record.student_id] = record.status as 'present' | 'absent' | 'late';
    });

    (studentsData ?? []).forEach((student) => {
      if (!attendanceMap[student.user_id]) {
        attendanceMap[student.user_id] = 'present';
      }
    });

    setAttendance(attendanceMap);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedClass || students.length === 0 || !user?.id) return;

    const records = students.map((student) => ({
      class_id: selectedClass,
      student_id: student.user_id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status: attendance[student.user_id] as 'present' | 'absent' | 'late',
      marked_by: user.id,
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'class_id,student_id,date' });

    if (error) {
      toast({ title: 'Error saving attendance', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Attendance saved successfully' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Attendance Management</h1>
        </div>

        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Select Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedClass && students.length > 0 && (
              <>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => {
                    const newAttendance = { ...attendance };
                    students.forEach(s => newAttendance[s.user_id] = 'present');
                    setAttendance(newAttendance);
                  }} className="w-full sm:w-auto">
                    Mark All Present
                  </Button>
                  <Button variant="outline" onClick={() => {
                    const newAttendance = { ...attendance };
                    students.forEach(s => newAttendance[s.user_id] = 'absent');
                    setAttendance(newAttendance);
                  }} className="w-full sm:w-auto">
                    Mark All Absent
                  </Button>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <ScrollArea className="w-full h-[calc(100vh-500px)]">
                    <ScrollBar orientation="horizontal" />
                    <div className="min-w-[700px]">
                      <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.roll_no}</TableCell>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>
                          <RadioGroup
                            value={attendance[student.user_id]}
                            onValueChange={(value) =>
                              setAttendance({ ...attendance, [student.user_id]: value })
                            }
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="present" id={`present-${student.id}`} />
                              <Label htmlFor={`present-${student.id}`}>Present</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                              <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="late" id={`late-${student.id}`} />
                              <Label htmlFor={`late-${student.id}`}>Late</Label>
                            </div>
                          </RadioGroup>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>

                <Button onClick={handleSave} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Attendance
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
