import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CoursesSection from "@/components/CoursesSection";
import LocationsSection from "@/components/LocationsSection";
import StudentsSection from "@/components/StudentsSection";
import TeachersSection from "@/components/TeachersSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <CoursesSection />
      <LocationsSection />
      <StudentsSection />
      <TeachersSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
