import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Hash, GraduationCap, TrendingUp } from 'lucide-react';

interface StudentInfoCardProps {
  profile: {
    full_name: string;
    roll_no: string;
    class_name: string;
  };
  statistics: {
    averagePercentage: number;
    totalTests: number;
  };
}

export const StudentInfoCard = ({ profile, statistics }: StudentInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Student Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-medium">{profile.full_name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Roll Number</p>
            <p className="font-medium">{profile.roll_no}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Class</p>
            <p className="font-medium">{profile.class_name}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Overall Average</p>
              <p className="text-2xl font-bold text-primary">{statistics.averagePercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">Based on {statistics.totalTests} tests</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
