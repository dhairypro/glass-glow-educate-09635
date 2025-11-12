import { Trophy, Medal, Award, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LeaderboardCardProps {
  userId: string;
  classId?: string;
}

export default function LeaderboardCard({ userId, classId }: LeaderboardCardProps) {
  const { data: leaderboard, isLoading } = useLeaderboard(userId, classId);
  const navigate = useNavigate();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
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

  if (!classId) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Class Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Join a class to see the leaderboard
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Class Leaderboard
        </CardTitle>
        <p className="text-xs text-muted-foreground">Based on most recent exam</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No exam results available yet
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ 
                  opacity: 0, 
                  x: entry.rank === 1 ? 0 : -20,
                  scale: entry.rank === 1 ? 0.8 : 1
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: 1
                }}
                transition={{ 
                  delay: index * 0.05,
                  type: entry.rank === 1 ? "spring" : "tween",
                  duration: entry.rank === 1 ? 0.6 : 0.3
                }}
                className={`p-3 rounded-lg transition-all relative ${
                  entry.rank === 1 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                    : entry.isCurrentUser
                    ? 'bg-primary/10 border-2 border-primary'
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
                      ease: "easeInOut"
                    }}
                  />
                )}
                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${getRankBadgeColor(
                      entry.rank
                    )} font-bold text-white`}
                  >
                    {entry.rank <= 3 ? (
                      getRankIcon(entry.rank)
                    ) : (
                      <span className="text-sm">{entry.rank}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">
                        {entry.studentName}
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-xs text-primary font-semibold">
                            (You)
                          </span>
                        )}
                      </p>
                      <span className="text-sm font-bold ml-2">
                        {entry.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={entry.percentage} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {entry.totalMarks}/{entry.maxMarks}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {leaderboard && leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <Button
              variant="outline"
              className="w-full gap-2 hover-scale"
              onClick={() => navigate(`/leaderboard?classId=${classId}`)}
            >
              View Full Leaderboard & Your Rank
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
