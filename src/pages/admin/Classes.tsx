import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function Classes() {
  const navigate = useNavigate();
  const { classes, createClass, updateClass, deleteClass } = useClasses();
  const queryClient = useQueryClient();
  const [newClass, setNewClass] = useState({ title: '', academic_year: '' });
  const [selectedClass, setSelectedClass] = useState('');
  const [newSubject, setNewSubject] = useState({ name: '', class_id: '' });
  const [newChapter, setNewChapter] = useState({ title: '', subject_id: '' });
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data: roleRows, error: roleErr } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'teacher');
      if (roleErr) throw roleErr;
      const ids = (roleRows ?? []).map(r => r.user_id);
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name')
        .in('user_id', ids);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { subjects } = useSubjects(selectedClass);

  const createSubject = useMutation({
    mutationFn: async (subjectData: any) => {
      const { error } = await supabase.from('subjects').insert(subjectData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Subject created successfully' });
      setIsSubjectDialogOpen(false);
      setNewSubject({ name: '', class_id: '' });
    },
  });

  const createChapter = useMutation({
    mutationFn: async (chapterData: any) => {
      const { error } = await supabase.from('chapters').insert(chapterData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Chapter created successfully' });
      setNewChapter({ title: '', subject_id: '' });
    },
  });

  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Subject deleted successfully' });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Classes & Subjects</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Classes</CardTitle>
                <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Class</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Class Title</Label>
                        <Input
                          value={newClass.title}
                          onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                          placeholder="e.g., Class 10A"
                        />
                      </div>
                      <div>
                        <Label>Academic Year</Label>
                        <Input
                          value={newClass.academic_year}
                          onChange={(e) => setNewClass({ ...newClass, academic_year: e.target.value })}
                          placeholder="e.g., 2024-2025"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          createClass.mutate(newClass);
                          setIsClassDialogOpen(false);
                          setNewClass({ title: '', academic_year: '' });
                        }}
                        className="w-full"
                      >
                        Create
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <ScrollArea className="w-full h-[calc(100vh-400px)] md:h-[400px]">
                  <ScrollBar orientation="horizontal" />
                  <div className="min-w-[500px]">
                    <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes?.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell>{cls.title}</TableCell>
                      <TableCell>{cls.academic_year}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteClass.mutate(cls.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Subjects</CardTitle>
                <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Subject</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Class</Label>
                        <Select
                          value={newSubject.class_id}
                          onValueChange={(value) => setNewSubject({ ...newSubject, class_id: value })}
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
                      <div>
                        <Label>Subject Name</Label>
                        <Input
                          value={newSubject.name}
                          onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                          placeholder="e.g., Mathematics"
                        />
                      </div>
                      <Button onClick={() => createSubject.mutate(newSubject)} className="w-full">
                        Create
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Filter by Class</Label>
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

              {selectedClass && subjects && (
                <ScrollArea className="h-[calc(100vh-500px)] md:h-[400px]">
                  <ScrollBar orientation="horizontal" />
                  <div className="space-y-2 pr-4">
                  {subjects.map((subject) => (
                    <Collapsible
                      key={subject.id}
                      open={expandedSubjects[subject.id]}
                      onOpenChange={(open) =>
                        setExpandedSubjects({ ...expandedSubjects, [subject.id]: open })
                      }
                    >
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {expandedSubjects[subject.id] ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <span className="font-medium">{subject.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubject.mutate(subject.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <CollapsibleContent className="ml-8 mt-2 space-y-1">
                        {subject.chapters?.map((chapter: any) => (
                          <div key={chapter.id} className="p-2 border rounded text-sm">
                            {chapter.title}
                          </div>
                        ))}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Chapter
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Chapter to {subject.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Chapter Title</Label>
                                <Input
                                  value={newChapter.title}
                                  onChange={(e) =>
                                    setNewChapter({ ...newChapter, title: e.target.value, subject_id: subject.id })
                                  }
                                  placeholder="e.g., Introduction to Algebra"
                                />
                              </div>
                              <Button
                                onClick={() => createChapter.mutate({ ...newChapter, subject_id: subject.id })}
                                className="w-full"
                              >
                                Create Chapter
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
