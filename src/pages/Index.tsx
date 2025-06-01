
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock3, MapPin, Star, ChevronDown, Play, Users, Shield, Zap, Check, Lock, Smartphone, Target, Sun } from "lucide-react";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const testimonialsData = [
    {
      name: "Mike Johnson",
      role: "Weekend Warrior",
      content: "The 24/7 access is a game changer. I can practice after work without rushing.",
      rating: 5,
    },
    {
      name: "Sarah Chen",
      role: "Golf Enthusiast",
      content: "Best simulators in the area. The Uneekor system is incredibly accurate.",
      rating: 5,
    },
    {
      name: "Tom Williams",
      role: "Local Pro",
      content: "I use this for off-season training. The data and analytics are top-notch.",
      rating: 5,
    },
  ];

  const pricingTiers = [
    {
      name: "Off-Peak Hours",
      price: "$45",
      period: "per hour",
      description: "Monday-Friday: 9AM-5PM",
      features: ["Full bay access", "All courses available", "Practice facilities", "Smart lock access"],
      highlight: false,
      icon: Clock3,
    },
    {
      name: "Peak Hours",
      price: "$65",
      period: "per hour",
      description: "Evenings & Weekends",
      features: ["Full bay access", "All courses available", "Practice facilities", "Smart lock access"],
      highlight: true,
      icon: Sun,
    },
  ];

  const steps = [
    {
      icon: Calendar,
      title: "Book Online",
      description: "Select your preferred time slot and bay. Pay securely online with our integrated booking system.",
    },
    {
      icon: Smartphone,
      title: "Get Access Code",
      description: "Receive your access code and arrive at your scheduled time. Our smart locks grant you secure entry.",
    },
    {
      icon: Lock,
      title: "Enter Facility",
      description: "Use your code to unlock the door - no staff needed",
    },
    {
      icon: Target,
      title: "Start Playing",
      description: "Step into your bay and start playing. Everything is set up and ready for your session.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-background/80 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-foreground">
              <span className="text-primary">GOLF</span><span className="text-foreground">LABS</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">How It Works</a>
              <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-hover">
              Book Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background opacity-60"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">PREMIUM</span><br/>
              <span className="text-primary">GOLF SIMULATION</span><br/>
              <span className="text-foreground">24/7</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Experience world-class golf simulation with Uneekor QED + GS Pro technology. 
              8 premium bays available around the clock with smart lock access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-scale-in">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg btn-hover">
                <Calendar className="mr-2 h-5 w-5" />
                Book Your Bay
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg btn-hover">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto stagger-children">
              <div className="text-center animate-float">
                <div className="text-4xl font-bold text-primary mb-2">8</div>
                <div className="text-muted-foreground">Premium Bays</div>
              </div>
              <div className="text-center animate-float" style={{animationDelay: '1s'}}>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Access Available</div>
              </div>
              <div className="text-center animate-float" style={{animationDelay: '2s'}}>
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <div className="text-muted-foreground">Golf Courses</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
          <ChevronDown className="w-8 h-8 text-primary" />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide text-foreground">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h2>
            <p className="text-xl text-muted-foreground">Pay by the hour, no membership required.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto stagger-children">
            {pricingTiers.map((tier, index) => (
              <div key={tier.name} className="animate-scale-in">
                <Card
                  className={`h-full flex flex-col card-hover ${
                    tier.highlight ? "border-primary bg-card shadow-xl" : "border-border bg-card shadow-lg"
                  } hover:shadow-2xl transition-shadow duration-300`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      POPULAR
                    </div>
                  )}
                  <CardHeader className="items-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                      <tier.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-card-foreground">{tier.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-6 text-center">
                      <span className="text-4xl font-bold text-primary">{tier.price}</span>
                      <span className="text-muted-foreground ml-1">{tier.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6 flex-grow">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide text-foreground">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground">Get on the course in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 stagger-children">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="text-center group p-6 rounded-lg hover:shadow-xl transition-shadow duration-300 bg-muted/30 card-hover"
              >
                <div className="mb-6 relative">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <step.icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent opacity-50" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in">
              STATE-OF-THE-ART <span className="text-primary">TECHNOLOGY</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-slide-up">
              Experience the future of golf with our cutting-edge simulator technology and seamless automation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            <div className="bg-card p-8 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 card-hover shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-4">Uneekor QED</h3>
              <p className="text-muted-foreground">
                Professional-grade launch monitors with unparalleled accuracy and ball tracking technology.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 card-hover shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-4">Smart Lock Access</h3>
              <p className="text-muted-foreground">
                Secure, automated bay access through our smart lock system. No staff required.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 card-hover shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-4">GS Pro Integration</h3>
              <p className="text-muted-foreground">
                Play on 100+ world-famous golf courses with stunning graphics and realistic physics.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 card-hover shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Clock3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-4">24/7 Availability</h3>
              <p className="text-muted-foreground">
                Practice and play whenever it suits you. Our facility never closes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in">
              WHAT GOLFERS <span className="text-primary">SAY</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => (
              <Card key={testimonial.name} className="h-full bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-primary fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                VISIT US IN <span className="text-primary">CHERRY HILL</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Located in the heart of Cherry Hill, New Jersey. Easy access from major highways 
                with ample parking available.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-6 h-6 text-primary mr-3" />
                  <span>Cherry Hill, NJ 08034</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock3 className="w-6 h-6 text-primary mr-3" />
                  <span>Open 24/7 - Self-Service</span>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 h-64 rounded-lg flex items-center justify-center border border-border animate-scale-in">
              <MapPin className="w-16 h-16 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary/90 to-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-in">
            READY TO PLAY?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-slide-up">
            Book your bay now and experience the future of golf simulation.
          </p>
          <Button size="lg" className="bg-background hover:bg-background/90 text-foreground font-semibold px-12 py-4 text-lg btn-hover animate-scale-in">
            <Calendar className="mr-2 h-6 w-6" />
            Book Your Session
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-background mb-4">
                <span className="text-primary">GOLF</span>LABS
              </div>
              <p className="text-muted">
                Premium golf simulation experience with 24/7 access and cutting-edge technology.
              </p>
            </div>
            <div>
              <h4 className="text-background font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted">
                <li><a href="#home" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-background font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-muted">
                <li>Golf Simulation</li>
                <li>Practice Facilities</li>
                <li>Course Play</li>
                <li>24/7 Access</li>
              </ul>
            </div>
            <div>
              <h4 className="text-background font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-muted">
                <li>Cherry Hill, NJ</li>
                <li>Available 24/7</li>
                <li>Self-Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-muted/20 mt-8 pt-8 text-center text-muted">
            <p>&copy; 2024 GolfLabs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
