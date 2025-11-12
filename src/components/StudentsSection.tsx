import SphereImageGrid, { ImageData } from "@/components/ui/img-sphere";
import { WavyBlock, WavyBlockItem } from "@/components/ui/wavy-text-block";
import { useEffect, useState } from "react";

const BASE_IMAGES: Omit<ImageData, 'id'>[] = [
  {
    src: "https://images.unsplash.com/photo-1758178309498-036c3d7d73b3?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=987",
    alt: "Student 1",
    title: "Success Story",
    description: "Achieved excellent results in board examinations"
  },
  {
    src: "https://images.unsplash.com/photo-1757647016230-d6b42abc6cc9?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=2072",
    alt: "Student 2",
    title: "Top Performer",
    description: "Consistent high achiever across all subjects"
  },
  {
    src: "https://images.unsplash.com/photo-1757906447358-f2b2cb23d5d8?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=987",
    alt: "Student 3",
    title: "Academic Excellence",
    description: "Outstanding performance in competitive exams"
  },
  {
    src: "https://images.unsplash.com/photo-1742201877377-03d18a323c18?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1064",
    alt: "Student 4",
    title: "Rising Star",
    description: "Remarkable improvement and dedication"
  },
  {
    src: "https://images.unsplash.com/photo-1757081791153-3f48cd8c67ac?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=987",
    alt: "Student 5",
    title: "Perfect Score",
    description: "100% marks in mathematics"
  },
  {
    src: "https://images.unsplash.com/photo-1757626961383-be254afee9a0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=987",
    alt: "Student 6",
    title: "Scholar",
    description: "Scholarship recipient for exceptional performance"
  },
  {
    src: "https://images.unsplash.com/photo-1756748371390-099e4e6683ae?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=987",
    alt: "Student 7",
    title: "Achiever",
    description: "Excellence in science and mathematics"
  },
  {
    src: "https://images.unsplash.com/photo-1755884405235-5c0213aa3374?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=987",
    alt: "Student 8",
    title: "Top Ranker",
    description: "State-level topper in board exams"
  },
  {
    src: "https://images.unsplash.com/photo-1757495404191-e94ed7e70046?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=987",
    alt: "Student 9",
    title: "Distinction",
    description: "Consistently achieving distinction in all subjects"
  },
  {
    src: "https://images.unsplash.com/photo-1756197256528-f9e6fcb82b04?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1064",
    alt: "Student 10",
    title: "Merit Holder",
    description: "Multiple merit certificates and awards"
  },
  {
    src: "https://images.unsplash.com/photo-1534083220759-4c3c00112ea0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=987",
    alt: "Student 11",
    title: "Excellence Award",
    description: "Recipient of academic excellence award"
  },
  {
    src: "https://images.unsplash.com/photo-1755278338891-e8d8481ff087?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1674",
    alt: "Student 12",
    title: "High Achiever",
    description: "Outstanding results in all examinations"
  }
];

// Generate more images by repeating the base set
const IMAGES: ImageData[] = [];
for (let i = 0; i < 60; i++) {
  const baseIndex = i % BASE_IMAGES.length;
  const baseImage = BASE_IMAGES[baseIndex];
  IMAGES.push({
    id: `student-${i + 1}`,
    ...baseImage,
    alt: `${baseImage.alt} (${Math.floor(i / BASE_IMAGES.length) + 1})`
  });
}

const titles = [
  'Excellence',
  'Innovation',
  'Achievement',
  'Success',
  'Brilliance',
  'Growth',
  'Knowledge',
];

const StudentsSection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Students We've Taught
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Celebrating the success stories of our brilliant students who have excelled in their academic journey
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Wavy Text */}
          <div className="min-h-[400px] md:min-h-[600px] flex items-center justify-start overflow-hidden order-2 md:order-1">
            <WavyBlock className="flex flex-col justify-start items-start gap-3 md:gap-6">
              {titles.map((title, index) => (
                <WavyBlockItem key={title} index={index}>
                  <h2 className="text-[10vw] md:text-[6vw] lg:text-[5vw] font-bold leading-none tracking-tighter uppercase whitespace-nowrap gradient-text">
                    {title}
                  </h2>
                </WavyBlockItem>
              ))}
            </WavyBlock>
          </div>

          {/* Right side - Student Sphere */}
          <div className="flex justify-center items-center min-h-[400px] md:min-h-[600px] order-1 md:order-2">
            <SphereImageGrid
              images={IMAGES}
              containerSize={isMobile ? 350 : 600}
              sphereRadius={isMobile ? 120 : 200}
              dragSensitivity={0.8}
              momentumDecay={0.96}
              maxRotationSpeed={6}
              baseImageScale={isMobile ? 0.12 : 0.15}
              hoverScale={1.3}
              perspective={1000}
              autoRotate={true}
              autoRotateSpeed={0.2}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentsSection;
