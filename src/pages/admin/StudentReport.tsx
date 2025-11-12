import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { StudentSelector } from '@/components/admin/reports/StudentSelector';
import { StudentInfoCard } from '@/components/admin/reports/StudentInfoCard';
import { FeesCard } from '@/components/admin/reports/FeesCard';
import { MarksTable } from '@/components/admin/reports/MarksTable';
import { EnhancedMarksChart } from '@/components/admin/reports/EnhancedMarksChart';
import { TrendChart } from '@/components/admin/reports/TrendChart';
import { useStudentReport } from '@/hooks/useStudentReport';

export default function StudentReport() {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const { data: reportData, isLoading } = useStudentReport(selectedStudent || null);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-3xl font-bold">Student Report</h1>
            <p className="text-muted-foreground">
              Comprehensive performance and fee analysis
            </p>
          </div>
        </div>

        {/* Student Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Student</CardTitle>
            <CardDescription>
              Choose a class and student to view their detailed report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector onStudentSelect={setSelectedStudent} />
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Report Content */}
        {reportData && !isLoading && (
          <>
            {/* Student Info and Fees */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StudentInfoCard 
                profile={reportData.profile} 
                statistics={reportData.statistics}
              />
              <FeesCard 
                feeSummary={reportData.feeSummary} 
                feePayments={reportData.feePayments}
              />
            </div>

            {/* Charts */}
            <div className="space-y-6">
              <EnhancedMarksChart marks={reportData.marks} />
              <TrendChart marks={reportData.marks} />
            </div>

            {/* Detailed Marks Table */}
            <MarksTable marks={reportData.marks} />
          </>
        )}

        {/* Empty State */}
        {!selectedStudent && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-muted-foreground text-center">
                Select a student to view their comprehensive report
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
