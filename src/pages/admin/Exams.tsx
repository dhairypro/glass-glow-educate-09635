import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function Exams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classes } = useClasses();
  const queryClient = useQueryClient();
  const [selectedClassForExam, setSelectedClassForExam] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [newExam, setNewExam] = useState({ name: '', date: '', class_id: '' });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: exams } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('id, name, date, class_id')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { subjects } = useSubjects(selectedClassForExam);

  const { data: students } = useQuery({
    queryKey: ['exam-students', selectedClassForExam],
    queryFn: async () => {
      if (!selectedClassForExam) return [];
      const { data: roleRows, error: roleErr } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');
      if (roleErr) throw roleErr;
      const ids = (roleRows ?? []).map(r => r.user_id);
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, roll_no')
        .eq('class_id', selectedClassForExam)
        .in('user_id', ids);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!selectedClassForExam,
  });

  const { data: marks } = useQuery({
    queryKey: ['marks', selectedExam],
    queryFn: async () => {
      if (!selectedExam) return [];
      const { data, error } = await supabase
        .from('student_marks')
        .select('*')
        .eq('exam_id', selectedExam);
      if (error) {
        console.error('Error fetching marks:', error);
        throw error;
      }
      return data;
    },
    enabled: !!selectedExam,
  });

  const createExam = useMutation({
    mutationFn: async (examData: any) => {
      const { error } = await supabase.from('exams').insert({
        ...examData,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Exam created successfully' });
      setIsCreateOpen(false);
      setNewExam({ name: '', date: '', class_id: '' });
    },
  });

  const upsertMarks = useMutation({
    mutationFn: async (marksData: any) => {
      const { data, error } = await supabase
        .from('student_marks')
        .upsert(marksData, { onConflict: 'student_id,exam_id,subject_id' });
      if (error) {
        console.error('Error saving marks:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      toast({ title: 'Marks saved successfully' });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({ 
        title: 'Error saving marks', 
        description: error.message || 'Please check the console for details',
        variant: 'destructive' 
      });
    },
  });

  const [marksInput, setMarksInput] = useState<Record<string, { marks_obtained: number; max_marks: number }>>({});

  // Initialize marksInput when marks data loads or exam/students change
  useEffect(() => {
    if (marks && marks.length > 0) {
      const initialMarks: Record<string, { marks_obtained: number; max_marks: number }> = {};
      marks.forEach((mark) => {
        const key = `${mark.student_id}___${mark.subject_id}`;
        initialMarks[key] = {
          marks_obtained: mark.marks_obtained,
          max_marks: mark.max_marks,
        };
      });
      setMarksInput(initialMarks);
    } else {
      // Reset state when switching to a different exam with no marks
      setMarksInput({});
    }
  }, [marks, selectedExam]);

  const handleMarksChange = (studentId: string, subjectId: string, field: 'marks_obtained' | 'max_marks', value: string) => {
    const key = `${studentId}___${subjectId}`;
    const numValue = value === '' ? 0 : parseFloat(value);
    
    setMarksInput((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { marks_obtained: 0, max_marks: 0 }),
        [field]: isNaN(numValue) ? 0 : numValue,
      },
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) {
      toast({ title: 'Please select an exam', variant: 'destructive' });
      return;
    }

    const marksEntries = Object.entries(marksInput);
    
    if (marksEntries.length === 0) {
      toast({ title: 'Please enter marks for at least one student', variant: 'destructive' });
      return;
    }

    // Filter out entries where both marks are 0 (not entered)
    const validMarks = marksEntries.filter(([_, data]) => 
      data.marks_obtained > 0 || data.max_marks > 0
    );

    if (validMarks.length === 0) {
      toast({ title: 'Please enter valid marks (at least one non-zero value)', variant: 'destructive' });
      return;
    }

    const marksArray = validMarks.map(([key, data]) => {
      const [studentId, subjectId] = key.split('___');
      return {
        student_id: studentId,
        exam_id: selectedExam,
        subject_id: subjectId,
        marks_obtained: data.marks_obtained,
        max_marks: data.max_marks,
      };
    });

    console.log('Saving marks:', marksArray);
    upsertMarks.mutate(marksArray);
  };

  const deleteMarksMutation = useMutation({
    mutationFn: async ({ studentId, subjectId }: { studentId: string; subjectId: string }) => {
      const { error } = await supabase
        .from('student_marks')
        .delete()
        .eq('student_id', studentId)
        .eq('exam_id', selectedExam)
        .eq('subject_id', subjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast({ title: 'Marks deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting marks', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleDeleteMarks = (studentId: string, subjectId: string) => {
    if (confirm('Are you sure you want to delete these marks?')) {
      deleteMarksMutation.mutate({ studentId, subjectId });
      // Clear from local state
      const key = `${studentId}___${subjectId}`;
      setMarksInput((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Exams & Marks</h1>
        </div>

        <Tabs defaultValue="exams" className="animate-slide-up">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="exams" className="flex-1 sm:flex-none">Exams</TabsTrigger>
            <TabsTrigger value="marks" className="flex-1 sm:flex-none">Marks Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="exams">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Exams</CardTitle>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Exam</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Exam Name</Label>
                          <Input
                            value={newExam.name}
                            onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={newExam.date}
                            onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Class</Label>
                          <Select
                            value={newExam.class_id}
                            onValueChange={(value) => setNewExam({ ...newExam, class_id: value })}
                          >
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
                        <Button onClick={() => createExam.mutate(newExam)} className="w-full">
                          Create
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <ScrollArea className="w-full h-[calc(100vh-400px)]">
                    <ScrollBar orientation="horizontal" />
                    <div className="min-w-[700px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Exam Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exams?.map((exam) => (
                            <TableRow key={exam.id}>
                              <TableCell>{exam.name}</TableCell>
                              <TableCell>{classes?.find(c => c.id === exam.class_id)?.title}</TableCell>
                              <TableCell>{format(new Date(exam.date), 'PPP')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marks">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Enter Marks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Select Exam</Label>
                    <Select value={selectedExam} onValueChange={(value) => {
                      setSelectedExam(value);
                      const exam = exams?.find(e => e.id === value);
                      if (exam) setSelectedClassForExam(exam.class_id);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams?.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id}>
                            {exam.name} - {classes?.find(c => c.id === exam.class_id)?.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedExam && subjects && students && (
                  <>
                    {subjects.map((subject) => (
                      <div key={subject.id} className="space-y-2">
                        <h3 className="font-semibold text-lg gradient-text">{subject.name}</h3>
                        <div className="rounded-md border overflow-hidden">
                          <ScrollArea className="w-full h-[calc(100vh-550px)] md:h-[400px]">
                            <ScrollBar orientation="horizontal" />
                            <div className="min-w-[800px]">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Roll No</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Marks Obtained</TableHead>
                                    <TableHead>Max Marks</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {students.map((student) => {
                                    const key = `${student.user_id}___${subject.id}`;
                                    const existingMark = marks?.find(
                                      m => m.student_id === student.user_id && m.subject_id === subject.id
                                    );
                                    return (
                                      <TableRow key={key}>
                                        <TableCell>{student.roll_no}</TableCell>
                                        <TableCell>{student.full_name}</TableCell>
                                        <TableCell>
                                          <Input
                                            type="number"
                                            value={marksInput[key]?.marks_obtained ?? existingMark?.marks_obtained ?? ''}
                                            onChange={(e) =>
                                              handleMarksChange(student.user_id, subject.id, 'marks_obtained', e.target.value)
                                            }
                                            className="w-24"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            type="number"
                                            value={marksInput[key]?.max_marks ?? existingMark?.max_marks ?? ''}
                                            onChange={(e) =>
                                              handleMarksChange(student.user_id, subject.id, 'max_marks', e.target.value)
                                            }
                                            className="w-24"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          {existingMark && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDeleteMarks(student.user_id, subject.id)}
                                            >
                                              <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    ))}
                    <Button onClick={handleSaveMarks} className="w-full">
                      Save All Marks
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
