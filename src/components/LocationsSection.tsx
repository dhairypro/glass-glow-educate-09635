import { MapPin, Phone, Clock, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const LocationsSection = () => {
  const branches = [
    {
      name: "Bhatar Branch",
      address: "Silver Point, Opp Vidya Bharti School, Bhatar, Surat",
      phones: ["98792 98791", "98981 85792", "98251 32311"],
      mapUrl: "https://maps.google.com/?q=Silver+Point+Bhatar+Surat",
      timing: "Mon-Sat: 8:00 AM - 8:00 PM",
    },
    {
      name: "Vesu Branch",
      address: "Raj Mahal AC Complex, Besides Hills High School, Vesu, Surat",
      phones: ["93747 36178", "99789 70090", "97262 75412"],
      mapUrl: "https://maps.google.com/?q=Raj+Mahal+AC+Complex+Vesu+Surat",
      timing: "Mon-Sat: 8:00 AM - 8:00 PM",
    },
  ];

  return (
    <section id="locations" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="gradient-text">Branches in Surat</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visit us at any of our conveniently located branches in Surat. 
            We're here to help you excel in your academic journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {branches.map((branch, index) => (
            <div
              key={index}
              className="glass-card p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 animate-fade-in border-2 border-primary/10"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                {branch.name}
              </h3>

              {/* Address */}
              <div className="mb-6">
                <p className="text-muted-foreground flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <span className="leading-relaxed">{branch.address}</span>
                </p>
              </div>

              {/* Timing */}
              <div className="mb-6">
                <p className="text-muted-foreground flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{branch.timing}</span>
                </p>
              </div>

              {/* Phone Numbers */}
              <div className="mb-6 space-y-2">
                <p className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Numbers:
                </p>
                <div className="flex flex-wrap gap-2">
                  {branch.phones.map((phone, phoneIndex) => (
                    <a
                      key={phoneIndex}
                      href={`tel:+91${phone.replace(/\s/g, "")}`}
                      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors border border-primary/20"
                    >
                      +91 {phone}
                    </a>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg transition-all"
                onClick={() => window.open(branch.mapUrl, "_blank", "noopener,noreferrer")}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Get Directions
              </Button>
            </div>
          ))}
        </div>

        {/* Social Media Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 glass-card px-8 py-4 rounded-full">
            <Instagram className="h-6 w-6 text-primary" />
            <span className="text-muted-foreground">Follow us on Instagram:</span>
            <button
              onClick={() => window.open("https://www.instagram.com/balaji_group_of_tuitions/", "_blank", "noopener,noreferrer")}
              className="font-semibold text-primary hover:text-accent transition-colors cursor-pointer"
            >
              @balaji_group_of_tuitions
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
