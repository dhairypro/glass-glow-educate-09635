import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useClasses } from '@/hooks/useClasses';
import { useStudentsByClass } from '@/hooks/useStudentsByClass';

interface StudentSelectorProps {
  onStudentSelect: (studentId: string) => void;
}

export const StudentSelector = ({ onStudentSelect }: StudentSelectorProps) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  
  const { classes, isLoading: classesLoading } = useClasses();
  const { students, isLoading: studentsLoading } = useStudentsByClass(selectedClass || null);

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedStudent('');
    onStudentSelect('');
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudent(studentId);
    onStudentSelect(studentId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Select Class</Label>
        <Select value={selectedClass} onValueChange={handleClassChange}>
          <SelectTrigger>
            <SelectValue placeholder={classesLoading ? "Loading..." : "Select a class"} />
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

      <div className="space-y-2">
        <Label>Select Student</Label>
        <Select 
          value={selectedStudent} 
          onValueChange={handleStudentChange}
          disabled={!selectedClass}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !selectedClass 
                ? "Select a class first" 
                : studentsLoading 
                  ? "Loading..." 
                  : students?.length === 0 
                    ? "No students in this class" 
                    : "Select a student"
            } />
          </SelectTrigger>
          <SelectContent>
            {students?.map((student) => (
              <SelectItem key={student.user_id} value={student.user_id}>
                {student.full_name} ({student.roll_no})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
