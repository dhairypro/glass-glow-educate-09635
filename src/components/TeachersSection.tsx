import { Card, CardContent } from "@/components/ui/card";
import teacher1 from "@/assets/teacher-1.jpg";
import teacher2 from "@/assets/teacher-2.jpg";
import teacher3 from "@/assets/teacher-3.jpg";
import teacher4 from "@/assets/teacher-4.jpg";

const TeachersSection = () => {
  const teachers = [
    {
      name: "Dr. Rajesh Kumar",
      subject: "Mathematics & Physics",
      qualification: "Ph.D. in Mathematics",
      image: teacher1,
    },
    {
      name: "Prof. Priya Sharma",
      subject: "Chemistry & Biology",
      qualification: "M.Sc. in Chemistry",
      image: teacher2,
    },
    {
      name: "Mr. Amit Patel",
      subject: "English & Hindi",
      qualification: "M.A. in English Literature",
      image: teacher3,
    },
    {
      name: "Ms. Neha Gupta",
      subject: "Social Studies & History",
      qualification: "M.A. in History",
      image: teacher4,
    },
  ];

  return (
    <section id="teachers" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Meet Our <span className="gradient-text">Expert Teachers</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Learn from the best educators with years of experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teachers.map((teacher, index) => (
            <Card
              key={teacher.name}
              className="glass-card border-0 group overflow-hidden"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{teacher.name}</h3>
                  <p className="text-primary font-semibold mb-2">{teacher.subject}</p>
                  <p className="text-sm text-muted-foreground">{teacher.qualification}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;
