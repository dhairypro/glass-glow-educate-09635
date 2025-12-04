import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function Students() {
  const navigate = useNavigate();
  const { students, isLoading, updateStudent, deleteStudent } = useStudents();
  const { classes } = useClasses();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const filteredStudents = students?.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdate = () => {
    if (editingStudent) {
      updateStudent.mutate(editingStudent);
      setIsEditOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Students Management</h1>
        </div>

        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle>All Students</CardTitle>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <ScrollArea className="w-full h-[calc(100vh-300px)]">
                  <ScrollBar orientation="horizontal" />
                  <div className="min-w-[800px]">
                    <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents?.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.roll_no || 'N/A'}</TableCell>
                      <TableCell>{student.full_name || 'N/A'}</TableCell>
                      <TableCell>{student.classes?.title || 'Not Assigned'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingStudent(student)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Student</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Full Name</Label>
                                  <Input
                                    value={editingStudent?.full_name || ''}
                                    onChange={(e) =>
                                      setEditingStudent({ ...editingStudent, full_name: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Roll Number</Label>
                                  <Input
                                    value={editingStudent?.roll_no || ''}
                                    onChange={(e) =>
                                      setEditingStudent({ ...editingStudent, roll_no: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Class</Label>
                                  <Select
                                    value={editingStudent?.class_id || ''}
                                    onValueChange={(value) =>
                                      setEditingStudent({ ...editingStudent, class_id: value })
                                    }
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
                                <Button onClick={handleUpdate} className="w-full">
                                  Save Changes
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this student? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteStudent.mutate(student.user_id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
