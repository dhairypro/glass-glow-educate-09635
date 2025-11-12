import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, BookOpen, TrendingUp, FileText, Award, Copy, CheckCircle2, XCircle, Clock, LogOut, Megaphone, ExternalLink } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useQuery } from '@tanstack/react-query';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { attendancePercent, coursesCount, averageMarks, isLoading: statsLoading } = useDashboardStats(user?.id || '');

  // Fetch recent materials
  const { data: recentMaterials, isLoading: materialsLoading } = useQuery({
    queryKey: ['recent-materials', profile?.class_id],
    queryFn: async () => {
      if (!profile?.class_id) return [];
      
      const { data: classFiles } = await supabase
        .from('files')
        .select('*')
        .eq('parent_type', 'class')
        .eq('parent_id', profile.class_id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id')
        .eq('class_id', profile.class_id);
      
      const subjectIds = subjects?.map(s => s.id) || [];
      
      const { data: subjectFiles } = await supabase
        .from('files')
        .select('*')
        .eq('parent_type', 'subject')
        .in('parent_id', subjectIds)
        .order('created_at', { ascending: false })
        .limit(5);
      
      const allFiles = [...(classFiles || []), ...(subjectFiles || [])];
      return allFiles.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 4);
    },
    enabled: !!profile?.class_id,
  });

  // Fetch attendance records
  const { data: attendanceRecords, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance-records', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('date, status')
        .eq('student_id', user?.id)
        .order('date', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch recent test scores
  const { data: recentTests, isLoading: testsLoading } = useQuery({
    queryKey: ['recent-tests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_marks')
        .select(`
          marks_obtained,
          max_marks,
          created_at,
          subjects:subject_id (name),
          exams:exam_id (name, date)
        `)
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Link copied to clipboard!' });
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getAttendanceBadgeVariant = (status: string): "default" | "destructive" | "secondary" => {
    switch (status) {
      case 'present':
        return 'default';
      case 'absent':
        return 'destructive';
      case 'late':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTodayAttendance = () => {
    if (!attendanceRecords || attendanceRecords.length === 0) return 'N/A';
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRecord = attendanceRecords.find(r => r.date === today);
    return todayRecord ? todayRecord.status : 'N/A';
  };

  const presentCount = attendanceRecords?.filter((r: any) => r.status === 'present').length || 0;
  const absentCount = attendanceRecords?.filter((r: any) => r.status === 'absent').length || 0;
  const lateCount = attendanceRecords?.filter((r: any) => r.status === 'late').length || 0;

  // Fetch announcements for student's class
  const { announcements } = useAnnouncements(profile?.class_id);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/signin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserRole();
    }
  }, [user]);

  // Redirect admins to admin panel
  useEffect(() => {
    if (userRole === 'admin') {
      navigate('/admin');
    }
  }, [userRole, navigate]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    setProfile(data);
  };

  const fetchUserRole = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id)
      .maybeSingle();
    const roleData = data as { role: string } | null;
    setUserRole(roleData?.role || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.full_name || user.email}</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Marks Card */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Marks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {statsLoading ? '...' : `${averageMarks}%`}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Overall performance across all subjects
              </p>
            </CardContent>
          </Card>

          {/* Today's Attendance Card */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {getAttendanceIcon(getTodayAttendance())}
                <span className="text-2xl font-bold capitalize">{getTodayAttendance()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Status for {format(new Date(), 'PP')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Report */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Report
              </CardTitle>
              <CardDescription>
                Overall attendance summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
                  <div className="text-xs text-muted-foreground">Late</div>
                </div>
              </div>
              
              <Separator />
              
              <ScrollArea className="h-[240px] pr-4">
                {attendanceLoading ? (
                  <div className="text-muted-foreground">Loading...</div>
                ) : attendanceRecords && attendanceRecords.length > 0 ? (
                  <div className="space-y-3">
                    {attendanceRecords.map((record: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          {getAttendanceIcon(record.status)}
                          <span className="text-sm font-medium">{format(new Date(record.date), 'PP')}</span>
                        </div>
                        <Badge variant={getAttendanceBadgeVariant(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No attendance records yet</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Test Scores */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Test Scores
              </CardTitle>
              <CardDescription>
                Your latest test results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[340px] pr-4">
                {testsLoading ? (
                  <div className="text-muted-foreground">Loading...</div>
                ) : recentTests && recentTests.length > 0 ? (
                  <div className="space-y-4">
                    {recentTests.map((test: any, index: number) => (
                      <div key={index} className="space-y-2 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-sm">{test.exams?.name || 'Exam'}</h4>
                            <p className="text-xs text-muted-foreground">{test.subjects?.name || 'Subject'}</p>
                          </div>
                          <div className={`text-right ${getScoreColor(test.marks_obtained, test.max_marks)}`}>
                            <div className="text-2xl font-bold">{test.marks_obtained}</div>
                            <div className="text-xs">/ {test.max_marks}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{test.exams?.date ? format(new Date(test.exams.date), 'PP') : 'N/A'}</span>
                          <span>{Math.round((test.marks_obtained / test.max_marks) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No test scores available yet</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Announcements
            </CardTitle>
            <CardDescription>
              Latest updates from your class
            </CardDescription>
          </CardHeader>
          <CardContent>
            {announcements && announcements.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {announcements.slice(0, 5).map((announcement: any) => (
                    <div key={announcement.id} className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Megaphone className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold text-sm">{announcement.title}</h4>
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-muted-foreground">{format(new Date(announcement.created_at), 'PP')}</span>
                            {announcement.link && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => window.open(announcement.link, '_blank', 'noopener,noreferrer')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Link
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground">No announcements yet</p>
            )}
          </CardContent>
        </Card>

        {/* Study Materials */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Study Materials
            </CardTitle>
            <CardDescription>
              Access your course materials and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            {materialsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : recentMaterials && recentMaterials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentMaterials.map((material: any) => (
                  <div key={material.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{material.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{format(new Date(material.created_at), 'PP')}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-3 flex-shrink-0"
                      onClick={() => copyToClipboard(material.file_url, material.id)}
                    >
                      {copiedId === material.id ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent materials available</p>
            )}
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={async () => {
              await signOut();
              toast({
                title: "Signed out successfully",
                description: "You have been logged out of your account.",
              });
              navigate('/auth/signin');
            }}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
