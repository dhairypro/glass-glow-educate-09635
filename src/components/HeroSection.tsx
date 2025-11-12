import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import studentHero from "@/assets/student-hero.png";

const HeroSection = () => {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Learn Smarter", "Excel Faster", "Achieve Better", "Grow Stronger", "Succeed Together"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
      style={{
        background: "linear-gradient(180deg, hsl(270 60% 97%) 0%, hsl(0 0% 100%) 100%)",
      }}
    >
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/10"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 3 + 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <div className="text-center md:text-left animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Empowering Students to{" "}
            <span className="relative inline-flex overflow-hidden">
              {titles.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute font-bold gradient-text"
                  initial={{ opacity: 0, y: "-100" }}
                  transition={{ type: "spring", stiffness: 50 }}
                  animate={
                    titleNumber === index
                      ? {
                          y: 0,
                          opacity: 1,
                        }
                      : {
                          y: titleNumber > index ? -150 : 150,
                          opacity: 0,
                        }
                  }
                >
                  {title}
                </motion.span>
              ))}
              <span className="invisible">{titles[0]}</span>
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            <strong>Surat's Premier Tuition Center for Classes 9-12</strong>
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Join Graph Education by Balaji Group of Tuitions — where expert guidance meets innovation. 
            <span className="font-semibold text-primary"> Bhatar • Vesu • 500+ Students • 95% Success Rate</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-white hover:shadow-2xl transition-all"
              onClick={() => {
                document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-primary" onClick={() => window.location.href = '/auth/signup'}>
              Join as Student
            </Button>
          </div>
        </div>

        {/* Right Content - 3D Student Image */}
        <div className="relative animate-float">
          <img
            src={studentHero}
            alt="Excited students learning"
            className="w-full h-auto drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
