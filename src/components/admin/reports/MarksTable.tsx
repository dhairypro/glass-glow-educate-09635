import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { StudentMark } from '@/hooks/useStudentReport';

interface MarksTableProps {
  marks: StudentMark[];
}

export const MarksTable = ({ marks }: MarksTableProps) => {
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPercentageBadgeVariant = (percentage: number): "default" | "destructive" | "secondary" => {
    if (percentage >= 75) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Detailed Marks Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        {marks.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Marks</TableHead>
                  <TableHead className="text-right">Max</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marks.map((mark) => {
                  const percentage = Math.round((mark.marks_obtained / mark.max_marks) * 100);
                  return (
                    <TableRow key={mark.id}>
                      <TableCell className="font-medium">{mark.exam.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {mark.exam.date ? format(new Date(mark.exam.date), 'PP') : 'N/A'}
                      </TableCell>
                      <TableCell>{mark.subject.name}</TableCell>
                      <TableCell className="text-right font-semibold">{mark.marks_obtained}</TableCell>
                      <TableCell className="text-right">{mark.max_marks}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={getPercentageBadgeVariant(percentage)}>
                          {percentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground py-8">No marks recorded yet</p>
        )}
      </CardContent>
    </Card>
  );
};
