import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Priya Patel",
      class: "Class 12 - GSEB",
      branch: "Bhatar",
      rating: 5,
      text: "Graph Education transformed my approach to studies. The teachers at Bhatar branch are incredibly supportive and helped me improve my marks from 65% to 92%. Best tuition center in Surat!",
      image: "👩‍🎓",
    },
    {
      name: "Rahul Shah",
      class: "Class 10 - CBSE",
      branch: "Vesu",
      rating: 5,
      text: "My son's grades improved dramatically at the Vesu branch. The personalized attention and expert guidance made all the difference. Highly recommend Graph Education to all parents in Surat.",
      image: "👨‍💼",
    },
    {
      name: "Ananya Desai",
      class: "Class 11 - ICSE",
      branch: "Bhatar",
      rating: 5,
      text: "The teaching methodology at Graph Education is exceptional. They focus on conceptual clarity rather than just memorization. I scored 95% in my science exam thanks to their coaching!",
      image: "👧",
    },
    {
      name: "Karan Mehta",
      class: "Class 12 - GSEB",
      branch: "Vesu",
      rating: 5,
      text: "Best coaching classes in Surat! The teachers are highly qualified and the study material is comprehensive. I cracked my board exams with flying colors. Thank you, Graph Education!",
      image: "👨‍🎓",
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Our <span className="gradient-text">Students Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from our successful students and parents who've experienced 
            the Graph Education difference across Surat.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card p-6 rounded-2xl hover:shadow-xl transition-all duration-300 animate-fade-in relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Student Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="text-3xl">{testimonial.image}</div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.class}</p>
                  <p className="text-xs text-primary font-medium">{testimonial.branch} Branch</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 glass-card px-8 py-4 rounded-full">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.8★</div>
              <div className="text-xs text-muted-foreground">Average Rating</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">250+</div>
              <div className="text-xs text-muted-foreground">Happy Reviews</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-xs text-muted-foreground">Students</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
