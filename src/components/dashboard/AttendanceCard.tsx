import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
}

export default function AttendanceCard({ studentId }: { studentId: string }) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchAttendance();
  }, [studentId]);

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(30);

    const typedData: AttendanceRecord[] = (data || []).map(d => ({
      date: d.date,
      status: d.status as 'present' | 'absent' | 'late'
    }));
    setAttendance(typedData);
    setLoading(false);
  };

  const getAttendancePercentage = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getAttendanceStats = () => {
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    return { present, absent, late };
  };

  const getAttendanceForDate = (date: Date) => {
    return attendance.find(a => isSameDay(new Date(a.date), date));
  };

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = monthStart.getDay();

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-semibold text-center text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}
          {daysInMonth.map((date, idx) => {
            const record = getAttendanceForDate(date);
            const isToday = isSameDay(date, new Date());
            return (
              <div
                key={idx}
                className={`aspect-square flex flex-col items-center justify-center rounded border ${
                  record
                    ? getStatusColor(record.status)
                    : 'bg-muted/30 border-muted'
                } ${isToday ? 'ring-2 ring-primary' : ''}`}
                title={record ? `${format(date, 'PPP')}: ${record.status}` : format(date, 'PPP')}
              >
                <span className={`text-xs font-medium ${record ? 'text-white' : 'text-muted-foreground'}`}>
                  {format(date, 'd')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const stats = getAttendanceStats();

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Attendance Overview
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        ) : attendance.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No attendance records yet</p>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{getAttendancePercentage()}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-xl font-semibold text-green-600">{stats.present}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Late</p>
                <p className="text-xl font-semibold text-yellow-600">{stats.late}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Absent</p>
                <p className="text-xl font-semibold text-red-600">{stats.absent}</p>
              </div>
            </div>

            {/* View Toggle Content */}
            {viewMode === 'calendar' ? (
              renderCalendarView()
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {attendance.slice(0, 30).map((record, idx) => {
                  const date = new Date(record.date);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 glass rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{format(date, 'EEEE, MMM d, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">{format(date, 'PPP')}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(
                          record.status
                        )}`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex gap-4 text-xs pt-2 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span>Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span>Absent</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
