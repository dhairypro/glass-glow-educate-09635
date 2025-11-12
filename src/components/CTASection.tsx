import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import waveBg from "@/assets/wave-bg.png";

const CTASection = () => {
  return (
    <section
      id="contact"
      className="py-32 relative overflow-hidden"
      style={{
        backgroundImage: `url(${waveBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-6">
            Join 500+ students across Surat who are already learning smarter and achieving their 
            dreams with Graph Education at our Bhatar and Vesu branches.
          </p>
          <p className="text-lg text-white/90 mb-10 font-medium">
            📞 Call us: Bhatar - 98792 98791 | Vesu - 93747 36178
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8"
              onClick={() => window.location.href = '/auth/signup'}
            >
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white bg-white/20 hover:bg-white/30 text-lg px-8"
            >
              <Mail className="mr-2 h-5 w-5" />
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
