import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  onClick,
  disable3D = false,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: any;
  description: string;
  href?: string;
  cta?: string;
  onClick?: () => void;
  disable3D?: boolean;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl cursor-pointer",
      // 3D perspective and transforms
      "transition-all duration-500 ease-out",
      "hover:scale-[1.02] hover:-translate-y-2",
      "hover:shadow-2xl hover:shadow-primary/20",
      "[transform-style:preserve-3d]",
      // light styles
      "bg-card [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "transform-gpu dark:bg-card dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className,
    )}
    onClick={onClick}
    onMouseMove={!disable3D ? (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px) scale(1.02) translateY(-8px)`;
    } : undefined}
    onMouseLeave={!disable3D ? (e) => {
      const card = e.currentTarget;
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1) translateY(0)';
    } : undefined}
  >
    <div className="transition-transform duration-500 group-hover:[transform:translateZ(20px)]">
      {background}
    </div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-500 group-hover:-translate-y-10 group-hover:[transform:translateZ(30px)_translateY(-40px)]">
      <Icon className="h-12 w-12 origin-left transform-gpu text-foreground transition-all duration-500 ease-in-out group-hover:scale-75 group-hover:rotate-12" />
      <h3 className="text-xl font-semibold text-foreground drop-shadow-sm">
        {name}
      </h3>
      <p className="max-w-lg text-muted-foreground">{description}</p>
    </div>

    {cta && href && (
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-hover:[transform:translateZ(40px)_translateY(0)]",
        )}
      >
        <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
          <a href={href}>
            {cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    )}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-500 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
    
    {/* Depth shadow effect */}
    <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 [box-shadow:0_20px_60px_-15px_rgba(0,0,0,0.3)]" />
  </div>
);

export { BentoCard, BentoGrid };
