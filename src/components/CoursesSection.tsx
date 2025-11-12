import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

const CoursesSection = () => {
  const courses = [
    {
      title: "Class 9",
      subjects: 6,
      color: "from-purple-600 to-purple-400",
      description: "Build strong foundations in Mathematics, Science, Social Studies, and Languages",
    },
    {
      title: "Class 10",
      subjects: 7,
      color: "from-violet-600 to-violet-400",
      description: "Board exam preparation with comprehensive coverage of all subjects",
    },
    {
      title: "Class 11",
      subjects: 8,
      color: "from-indigo-600 to-indigo-400",
      description: "Stream-specific courses for Science, Commerce, and Arts students",
    },
    {
      title: "Class 12",
      subjects: 8,
      color: "from-blue-600 to-blue-400",
      description: "Advanced preparation for board exams and competitive entrance tests",
    },
  ];

  return (
    <section id="courses" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Our <span className="gradient-text">Courses</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose your class and start your journey to excellence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <Card
              key={course.title}
              className="glass-card border-0 group cursor-pointer"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <CardHeader>
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">
                    {course.subjects} Subjects
                  </span>
                  <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white">
            View All Courses
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
