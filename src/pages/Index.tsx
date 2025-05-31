
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Star, ChevronDown, Play, Users, Shield, Zap } from "lucide-react";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const testimonials = [
    {
      name: "Michael Chen",
      text: "Incredible technology and convenience. The 24/7 access is perfect for my schedule.",
      rating: 5
    },
    {
      name: "Sarah Johnson", 
      text: "Best golf simulator experience in South Jersey. The Uneekor systems are top-notch.",
      rating: 5
    },
    {
      name: "David Rodriguez",
      text: "Game-changing facility. Love the seamless booking and smart lock access.",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-dark-gray overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-white/80 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-dark-gray">
              <span className="gradient-text">GOLF</span><span className="text-forest-green">LABS</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-dark-gray hover:text-bright-green transition-colors">Home</a>
              <a href="#features" className="text-dark-gray hover:text-bright-green transition-colors">Features</a>
              <a href="#pricing" className="text-dark-gray hover:text-bright-green transition-colors">Pricing</a>
              <a href="#about" className="text-dark-gray hover:text-bright-green transition-colors">About</a>
            </div>
            <Button className="bg-bright-green hover:bg-deep-green text-white font-semibold btn-hover">
              Book Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-mint/30 via-white to-white opacity-60"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-dark-gray">PREMIUM</span><br/>
              <span className="gradient-text">GOLF SIMULATION</span><br/>
              <span className="text-forest-green">24/7</span>
            </h1>
            <p className="text-xl md:text-2xl text-medium-gray mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Experience world-class golf simulation with Uneekor QED + GS Pro technology. 
              8 premium bays available around the clock with smart lock access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-scale-in">
              <Button size="lg" className="bg-bright-green hover:bg-deep-green text-white font-semibold px-8 py-4 text-lg btn-hover">
                <Calendar className="mr-2 h-5 w-5" />
                Book Your Bay
              </Button>
              <Button size="lg" variant="outline" className="border-bright-green text-bright-green hover:bg-bright-green hover:text-white px-8 py-4 text-lg btn-hover">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto stagger-children">
              <div className="text-center animate-float">
                <div className="text-4xl font-bold text-bright-green mb-2">8</div>
                <div className="text-medium-gray">Premium Bays</div>
              </div>
              <div className="text-center animate-float" style={{animationDelay: '1s'}}>
                <div className="text-4xl font-bold text-bright-green mb-2">24/7</div>
                <div className="text-medium-gray">Access Available</div>
              </div>
              <div className="text-center animate-float" style={{animationDelay: '2s'}}>
                <div className="text-4xl font-bold text-bright-green mb-2">100+</div>
                <div className="text-medium-gray">Golf Courses</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
          <ChevronDown className="w-8 h-8 text-bright-green" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-gray mb-6 animate-fade-in">
              STATE-OF-THE-ART <span className="gradient-text">TECHNOLOGY</span>
            </h2>
            <p className="text-xl text-medium-gray max-w-3xl mx-auto animate-slide-up">
              Experience the future of golf with our cutting-edge simulator technology and seamless automation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:border-bright-green/50 transition-all duration-300 card-hover shadow-sm">
              <div className="w-16 h-16 bg-mint rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-bright-green" />
              </div>
              <h3 className="text-xl font-bold text-dark-gray mb-4">Uneekor QED</h3>
              <p className="text-medium-gray">
                Professional-grade launch monitors with unparalleled accuracy and ball tracking technology.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:border-bright-green/50 transition-all duration-300 card-hover shadow-sm">
              <div className="w-16 h-16 bg-mint rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-bright-green" />
              </div>
              <h3 className="text-xl font-bold text-dark-gray mb-4">Smart Lock Access</h3>
              <p className="text-medium-gray">
                Secure, automated bay access through our smart lock system. No staff required.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:border-bright-green/50 transition-all duration-300 card-hover shadow-sm">
              <div className="w-16 h-16 bg-mint rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-bright-green" />
              </div>
              <h3 className="text-xl font-bold text-dark-gray mb-4">GS Pro Integration</h3>
              <p className="text-medium-gray">
                Play on 100+ world-famous golf courses with stunning graphics and realistic physics.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:border-bright-green/50 transition-all duration-300 card-hover shadow-sm">
              <div className="w-16 h-16 bg-mint rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-bright-green" />
              </div>
              <h3 className="text-xl font-bold text-dark-gray mb-4">24/7 Availability</h3>
              <p className="text-medium-gray">
                Practice and play whenever it suits you. Our facility never closes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-off-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-gray mb-6 animate-fade-in">
              HOW IT <span className="gradient-text">WORKS</span>
            </h2>
            <p className="text-xl text-medium-gray max-w-3xl mx-auto animate-slide-up">
              Getting started is simple. Book, arrive, and play.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto stagger-children">
            <div className="text-center">
              <div className="w-20 h-20 bg-bright-green rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl animate-scale-in">
                1
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-4">Book Online</h3>
              <p className="text-medium-gray">
                Select your preferred time slot and bay. Pay securely online with our integrated booking system.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-bright-green rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl animate-scale-in">
                2
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-4">Smart Access</h3>
              <p className="text-medium-gray">
                Receive your access code and arrive at your scheduled time. Our smart locks grant you secure entry.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-bright-green rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl animate-scale-in">
                3
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-4">Play & Enjoy</h3>
              <p className="text-medium-gray">
                Step into your bay and start playing. Everything is set up and ready for your session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-gray mb-6 animate-fade-in">
              SIMPLE <span className="gradient-text">PRICING</span>
            </h2>
            <p className="text-xl text-medium-gray max-w-3xl mx-auto animate-slide-up">
              Transparent hourly rates with peak and off-peak options.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto stagger-children">
            <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm card-hover">
              <h3 className="text-2xl font-bold text-dark-gray mb-4">Off-Peak Hours</h3>
              <div className="text-4xl font-bold text-bright-green mb-2">$45<span className="text-xl text-medium-gray">/hour</span></div>
              <p className="text-medium-gray mb-6">Monday-Friday: 9AM-5PM</p>
              <ul className="space-y-3 text-medium-gray">
                <li className="flex items-center"><span className="w-2 h-2 bg-bright-green rounded-full mr-3"></span>Full bay access</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-bright-green rounded-full mr-3"></span>All courses available</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-bright-green rounded-full mr-3"></span>Practice facilities</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-bright-green rounded-full mr-3"></span>Smart lock access</li>
              </ul>
            </div>

            <div className="bg-mint p-8 rounded-lg border-2 border-bright-green relative card-hover">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-bright-green text-white px-4 py-1 rounded-full text-sm font-semibold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-4">Peak Hours</h3>
              <div className="text-4xl font-bold text-bright-green mb-2">$65<span className="text-xl text-medium-gray">/hour</span></div>
              <p className="text-medium-gray mb-6">Evenings & Weekends</p>
              <ul className="space-y-3 text-medium-gray">
                <li className="flex items-center"><span className="w-2 h-2 bg-bright-green rounded-full mr-3"></span>Full bay access</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-bright-green rounded-full mr-3"></span>All courses available</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-bright-green rounded-full mr-3"></span>Practice facilities</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-bright-green rounded-full mr-3"></span>Smart lock access</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-off-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-gray mb-6 animate-fade-in">
              WHAT GOLFERS <span className="gradient-text">SAY</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 text-center shadow-sm card-hover">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-bright-green fill-current" />
                ))}
              </div>
              <p className="text-xl text-medium-gray mb-6 italic">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="text-bright-green font-semibold text-lg">
                {testimonials[currentTestimonial].name}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-dark-gray mb-6">
                VISIT US IN <span className="gradient-text">CHERRY HILL</span>
              </h2>
              <p className="text-xl text-medium-gray mb-8">
                Located in the heart of Cherry Hill, New Jersey. Easy access from major highways 
                with ample parking available.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-medium-gray">
                  <MapPin className="w-6 h-6 text-bright-green mr-3" />
                  <span>Cherry Hill, NJ 08034</span>
                </div>
                <div className="flex items-center text-medium-gray">
                  <Clock className="w-6 h-6 text-bright-green mr-3" />
                  <span>Open 24/7 - Self-Service</span>
                </div>
              </div>
            </div>
            <div className="bg-mint h-64 rounded-lg flex items-center justify-center border border-gray-100 animate-scale-in">
              <MapPin className="w-16 h-16 text-bright-green" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-bright-green via-deep-green to-bright-green">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            READY TO PLAY?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-slide-up">
            Book your bay now and experience the future of golf simulation.
          </p>
          <Button size="lg" className="bg-white hover:bg-gray-50 text-bright-green font-semibold px-12 py-4 text-lg btn-hover animate-scale-in">
            <Calendar className="mr-2 h-6 w-6" />
            Book Your Session
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">
                <span className="text-bright-green">GOLF</span>LABS
              </div>
              <p className="text-gray-400">
                Premium golf simulation experience with 24/7 access and cutting-edge technology.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-bright-green transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-bright-green transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-bright-green transition-colors">Pricing</a></li>
                <li><a href="#about" className="hover:text-bright-green transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Golf Simulation</li>
                <li>Practice Facilities</li>
                <li>Course Play</li>
                <li>24/7 Access</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Cherry Hill, NJ</li>
                <li>Available 24/7</li>
                <li>Self-Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GolfLabs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
