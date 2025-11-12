import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, BookOpen, FileText, GraduationCap, LogOut, Megaphone, IndianRupee, FileChartLine } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/signin');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const adminSections = [
    { 
      title: 'Student Reports', 
      icon: FileText, 
      description: 'Comprehensive student performance analysis', 
      path: '/admin/reports',
      gradient: 'from-violet-500 to-purple-500',
      className: 'col-span-1 md:col-span-2 md:row-span-2'
    },
    { 
      title: 'Students', 
      icon: Users, 
      description: 'Manage student profiles and assignments', 
      path: '/admin/students',
      gradient: 'from-blue-500 to-cyan-500',
      className: 'col-span-1 md:col-span-1 md:row-span-1'
    },
    { 
      title: 'Announcements', 
      icon: Megaphone, 
      description: 'Post updates and notify students', 
      path: '/admin/announcements',
      gradient: 'from-yellow-500 to-amber-500',
      className: 'col-span-1 md:col-span-1 md:row-span-1'
    },
    { 
      title: 'Attendance', 
      icon: Calendar, 
      description: 'Track and mark daily attendance', 
      path: '/admin/attendance',
      gradient: 'from-green-500 to-emerald-500',
      className: 'col-span-1 md:col-span-1 md:row-span-1'
    },
    { 
      title: 'Exams & Marks', 
      icon: BookOpen, 
      description: 'Create exams and manage grades', 
      path: '/admin/exams',
      gradient: 'from-purple-500 to-pink-500',
      className: 'col-span-1 md:col-span-1 md:row-span-2'
    },
    { 
      title: 'Classes & Subjects', 
      icon: GraduationCap, 
      description: 'Organize curriculum and subjects', 
      path: '/admin/classes',
      gradient: 'from-orange-500 to-red-500',
      className: 'col-span-1 md:col-span-1 md:row-span-1'
    },
    { 
      title: 'Fees Management', 
      icon: IndianRupee, 
      description: 'Track student fees and payments', 
      path: '/admin/fees',
      gradient: 'from-teal-500 to-cyan-500',
      className: 'col-span-1 md:col-span-1 md:row-span-1'
    },
    { 
      title: 'Files', 
      icon: FileChartLine, 
      description: 'Share learning materials and resources', 
      path: '/admin/files',
      gradient: 'from-indigo-500 to-purple-500',
      className: 'col-span-1 md:col-span-1 md:row-span-1'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card border-b sticky top-0 z-50 backdrop-blur-lg shadow-lg"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Admin Control Panel</h1>
              <p className="text-sm md:text-base text-muted-foreground">Comprehensive institution management</p>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut();
                  toast({
                    title: "Logged out",
                    description: "You have been successfully logged out.",
                  });
                  navigate('/auth/signin');
                }}
                className="gap-2 hover-scale"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 md:py-12 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <BentoGrid className="lg:grid-rows-3 grid-cols-1 md:grid-cols-3 auto-rows-[20rem] md:auto-rows-[22rem]">
            {adminSections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <BentoCard
                  name={section.title}
                  className={section.className}
                  Icon={section.icon}
                  description={section.description}
                  background={
                    <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-10`} />
                  }
                  href={section.path}
                  cta="Open"
                  onClick={() => navigate(section.path)}
                />
              </motion.div>
            ))}
          </BentoGrid>
        </motion.div>
      </main>
    </div>
  );
}
