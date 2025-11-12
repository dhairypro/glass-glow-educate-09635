import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFullLeaderboard } from '@/hooks/useFullLeaderboard';
import { Trophy, Medal, Award, ArrowLeft, Calendar, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function Leaderboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const currentUserRef = useRef<HTMLDivElement>(null);

  const { data: leaderboardData, isLoading } = useFullLeaderboard(
    user?.id || '',
    classId || undefined
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/signin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Auto-scroll to current user's position after data loads
    if (leaderboardData?.currentUserEntry && currentUserRef.current) {
      setTimeout(() => {
        currentUserRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 500);
    }
  }, [leaderboardData]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700';
      default:
        return 'bg-muted';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!classId || !leaderboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No leaderboard data available</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { entries, examName, examDate, className, currentUserEntry } = leaderboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card border-b sticky top-0 z-50 backdrop-blur-lg shadow-lg"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2 hover-scale"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2 flex items-center gap-2">
              <Trophy className="w-8 h-8" />
              Class Leaderboard
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {className}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {examName} - {format(new Date(examDate), 'MMM dd, yyyy')}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative">
        {/* Current User Stats */}
        {currentUserEntry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="glass-card border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Your Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold gradient-text">Rank #{currentUserEntry.rank}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Out of {entries.length} students
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{currentUserEntry.percentage.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">
                      {currentUserEntry.totalMarks}/{currentUserEntry.maxMarks} marks
                    </p>
                  </div>
                </div>
                <Progress value={currentUserEntry.percentage} className="mt-4 h-3" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>All Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  ref={entry.isCurrentUser ? currentUserRef : null}
                  initial={{
                    opacity: 0,
                    x: entry.rank === 1 ? 0 : -20,
                    scale: entry.rank === 1 ? 0.8 : 1,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                  }}
                  transition={{
                    delay: Math.min(index * 0.03, 1),
                    type: entry.rank === 1 ? 'spring' : 'tween',
                    duration: entry.rank === 1 ? 0.6 : 0.3,
                  }}
                  className={`p-4 rounded-lg transition-all relative ${
                    entry.rank === 1
                      ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                      : entry.isCurrentUser
                      ? 'bg-primary/10 border-2 border-primary shadow-lg'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  {entry.rank === 1 && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/30 to-amber-400/30"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                  <div className="flex items-center gap-4 relative z-10">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankBadgeColor(
                        entry.rank
                      )} font-bold text-white flex-shrink-0`}
                    >
                      {entry.rank <= 3 ? (
                        getRankIcon(entry.rank)
                      ) : (
                        <span>{entry.rank}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-lg truncate">
                          {entry.studentName}
                          {entry.isCurrentUser && (
                            <span className="ml-2 text-sm text-primary font-bold">
                              (You)
                            </span>
                          )}
                        </p>
                        <span className="text-lg font-bold ml-2">
                          {entry.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={entry.percentage} className="h-2 flex-1" />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {entry.totalMarks}/{entry.maxMarks}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
