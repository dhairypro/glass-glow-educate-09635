import { MapPin, Phone, Mail, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Graph Education</h3>
            <p className="text-white/80 mb-4">
              By Balaji Group of Tuitions
            </p>
            <p className="text-white/80 text-sm mb-4">
              Surat's premier tuition center for Classes 9-12. Serving students with excellence since years.
            </p>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <span className="font-semibold">500+</span> Happy Students •
              <span className="font-semibold">95%</span> Success Rate
            </div>
          </div>
          
          {/* Bhatar Branch */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Bhatar Branch
            </h4>
            <div className="space-y-3 text-white/80 text-sm">
              <p>Silver Point, Opp Vidya Bharti School, Bhatar, Surat</p>
              <div className="space-y-1">
                <a href="tel:+919879298791" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-3 w-3" />
                  +91 98792 98791
                </a>
                <a href="tel:+919898185792" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-3 w-3" />
                  +91 98981 85792
                </a>
                <a href="tel:+919825132311" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-3 w-3" />
                  +91 98251 32311
                </a>
              </div>
            </div>
          </div>

          {/* Vesu Branch */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Vesu Branch
            </h4>
            <div className="space-y-3 text-white/80 text-sm">
              <p>Raj Mahal AC Complex, Besides Hills High School, Vesu, Surat</p>
              <div className="space-y-1">
                <a href="tel:+919374736178" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-3 w-3" />
                  +91 93747 36178
                </a>
                <a href="tel:+919978970090" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-3 w-3" />
                  +91 99789 70090
                </a>
                <a href="tel:+919726275412" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-3 w-3" />
                  +91 97262 75412
                </a>
              </div>
            </div>
          </div>
          
          {/* Quick Links & Social */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-white/80 text-sm mb-6">
              <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#courses" className="hover:text-white transition-colors">Courses</a></li>
              <li><a href="#locations" className="hover:text-white transition-colors">Locations</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
            
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <button 
              onClick={() => window.open("https://www.instagram.com/balaji_group_of_tuitions/", "_blank", "noopener,noreferrer")}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Instagram className="h-5 w-5" />
              <span className="text-sm">@balaji_group_of_tuitions</span>
            </button>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8 text-center text-white/80">
          <p>© 2025 Graph Education. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
