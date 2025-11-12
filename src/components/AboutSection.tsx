import graphLogo from "@/assets/graph-logo.jpg";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Text Content */}
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="gradient-text">Graph Education</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Graph Education, by the <strong>Balaji Group of Tuitions</strong>, is Surat's premier 
              coaching center dedicated to empowering students from Classes 9 to 12 with world-class 
              education, personalized guidance, and innovative teaching methods. Located in the heart 
              of Surat at <strong>Bhatar and Vesu</strong>, we've been serving students across Surat 
              for years.
            </p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              We specialize in <strong>GSEB, CBSE, and ICSE boards</strong>, offering comprehensive 
              coaching in Mathematics, Science, Physics, Chemistry, Biology, and English. Our mission 
              is to help every student unlock their full potential through expert teachers, engaging 
              content, and a supportive learning environment at both our Bhatar and Vesu branches.
            </p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              As the <strong>top-rated tuition center in Surat</strong>, we believe in making education 
              accessible, enjoyable, and results-driven with personalized batch timings and individual attention.
            </p>
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="text-center glass-card">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground mt-1">Students</div>
              </div>
              <div className="text-center glass-card">
                <div className="text-3xl font-bold text-primary">20+</div>
                <div className="text-sm text-muted-foreground mt-1">Teachers</div>
              </div>
              <div className="text-center glass-card">
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right - Logo Image */}
          <div className="flex justify-center animate-scale-in">
            <div className="glass-card w-full max-w-md">
              <img
                src={graphLogo}
                alt="Graph Education Logo"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
