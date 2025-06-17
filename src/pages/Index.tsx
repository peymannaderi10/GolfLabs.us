import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock3, MapPin, Star, ChevronDown, Play, Users, Shield, Zap, Check, Lock, Smartphone, Target, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { API, LOCATION_IDS } from "@/constants";
import { UserNav } from "@/components/UserNav";

interface PricingRule {
  name: string;
  hourlyRate: number;
  startTime: string;
  endTime: string;
  daysOfWeek: string;
}

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch pricing rules
  useEffect(() => {
    const fetchPricingRules = async () => {
      try {
        const response = await fetch(`${API.BASE_URL}/pricing-rules?locationId=${LOCATION_IDS.CHERRY_HILL}`);
        if (!response.ok) {
          throw new Error('Failed to fetch pricing rules');
        }
        const data = await response.json();
        setPricingRules(data);
      } catch (error) {
        console.error('Error fetching pricing rules:', error);
      } finally {
        setIsLoadingPricing(false);
      }
    };

    fetchPricingRules();
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
      name: "Off-Peak Rate",
      price: pricingRules.find(rule => rule.name === "Off-Peak Rate")?.hourlyRate,
      period: "per hour",
      description: "2AM-9AM",
      features: ["Full bay access", "All courses available", "Practice facilities", "Smart lock access"],
      highlight: false,
      icon: Clock3,
    },
    {
      name: "Standard Rate",
      price: pricingRules.find(rule => rule.name === "Standard Rate")?.hourlyRate,
      period: "per hour",
      description: "9AM-2AM",
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

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-background/80 backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-2xl font-bold text-foreground"
            >
              <span className="text-primary">GOLF</span><span className="text-foreground">LABS</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden md:flex space-x-8"
            >
              <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">How It Works</a>
              <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center space-x-4"
            >
              <UserNav />
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-background bg-[url('/images/mobileHero.png')] md:bg-[url('/images/heroBanner.png')] bg-cover bg-center">
        {/* Top fade effect for mobile */}
        <div className="absolute top-0 left-0 right-0 h-3/4 bg-gradient-to-b from-background via-background/80 to-transparent md:hidden"></div>
        {/* Bottom fade effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-foreground">ELEVATE YOUR</span><br/>
              <span className="text-primary">GOLF GAME</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              24/7 Self-Service Golf Simulators in Cherry Hill, NJ
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link to="/booking">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg btn-hover">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Your Bay
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg btn-hover">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {[
                { number: "8", text: "Premium Bays" },
                { number: "24/7", text: "Access Available" },
                { number: "100+", text: "Golf Courses" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.text}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.text}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide text-foreground">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h2>
            <p className="text-xl text-muted-foreground">Pay by the hour, no membership required.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          >
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                variants={scaleIn}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Card
                  className={`h-full flex flex-col ${
                    tier.highlight ? "border-primary bg-card shadow-xl" : "border-border bg-card shadow-lg"
                  } hover:shadow-2xl transition-shadow duration-300`}
                >
                  {tier.highlight && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold"
                    >
                      POPULAR
                    </motion.div>
                  )}
                  <CardHeader className="items-center text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="p-3 bg-primary/10 rounded-full mb-3"
                    >
                      <tier.icon className="h-8 w-8 text-primary" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-card-foreground">{tier.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-6 text-center">
                      <span className="text-4xl font-bold text-primary">${tier.price}</span>
                      <span className="text-muted-foreground ml-1">{tier.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6 flex-grow">
                      {tier.features.map((feature, featureIndex) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-start"
                        >
                          <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide text-foreground">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground">Get on the course in 4 simple steps</p>
          </motion.div>

          <motion.div 
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={{
                  initial: { opacity: 0, y: 30 },
                  animate: { 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      duration: 0.6,
                      delay: typeof window !== 'undefined' && window.innerWidth < 768 ? 0.5 + (index * 0.3) : 0.2 + (index * 0.2)
                    } 
                  }
                }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center group p-6 rounded-lg shadow-xl transition-shadow duration-300 bg-muted/30"
              >
                <div className="mb-6 relative">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md"
                  >
                    <step.icon className="h-10 w-10 text-primary-foreground" />
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent opacity-50" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              STATE-OF-THE-ART <span className="text-primary">TECHNOLOGY</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of golf with our cutting-edge simulator technology and seamless automation.
            </p>
          </motion.div>

          <motion.div 
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: Zap, title: "Uneekor QED", description: "Professional-grade launch monitors with unparalleled accuracy and ball tracking technology." },
              { icon: Shield, title: "Smart Lock Access", description: "Secure, automated bay access through our smart lock system. No staff required." },
              { icon: Users, title: "GS Pro Integration", description: "Play on 100+ world-famous golf courses with stunning graphics and realistic physics." },
              { icon: Clock3, title: "24/7 Availability", description: "Practice and play whenever it suits you. Our facility never closes." }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={{
                  initial: { opacity: 0, y: 30 },
                  animate: { 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      duration: 0.6,
                      delay: typeof window !== 'undefined' && window.innerWidth < 768 ? 0.5 + (index * 0.3) : 0.2 + (index * 0.2)
                    } 
                  }
                }}
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="bg-card p-8 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 shadow-[0_0_20px_rgba(0,163,108,0.3)] hover:shadow-[0_0_40px_rgba(0,163,108,0.5)]"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6"
                >
                  <feature.icon className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-card-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              WHAT GOLFERS <span className="text-primary">SAY</span>
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonialsData.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                      viewport={{ once: true }}
                      className="flex mb-4"
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-primary fill-current" />
                      ))}
                    </motion.div>
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Location */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                VISIT US IN <span className="text-primary">CHERRY HILL</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Located in the heart of Cherry Hill, New Jersey. Easy access from major highways 
                with ample parking available.
              </p>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex items-center text-muted-foreground"
                >
                  <MapPin className="w-6 h-6 text-primary mr-3" />
                  <span>Cherry Hill, NJ 08034</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex items-center text-muted-foreground"
                >
                  <Clock3 className="w-6 h-6 text-primary mr-3" />
                  <span>Open 24/7 - Self-Service</span>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-primary/5 h-64 rounded-lg flex items-center justify-center border border-border"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MapPin className="w-16 h-16 text-primary" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-r from-primary via-primary/90 to-primary"
      >
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6"
          >
            READY TO PLAY?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto"
          >
            Book your bay now and experience the future of golf simulation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/booking">
              <Button size="lg" className="bg-background hover:bg-background/90 text-foreground font-semibold px-12 py-4 text-lg">
                <Calendar className="mr-2 h-6 w-6" />
                Book Your Session
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-foreground py-12"
      >
        <div className="container mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <div className="text-2xl font-bold text-background mb-4">
                <span className="text-primary">GOLF</span>LABS
              </div>
              <p className="text-muted">
                Premium golf simulation experience with 24/7 access and cutting-edge technology.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h4 className="text-background font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted">
                <li><a href="#home" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h4 className="text-background font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-muted">
                <li>Golf Simulation</li>
                <li>Practice Facilities</li>
                <li>Course Play</li>
                <li>24/7 Access</li>
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h4 className="text-background font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-muted">
                <li>Cherry Hill, NJ</li>
                <li>Available 24/7</li>
                <li>Self-Service</li>
              </ul>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="border-t border-muted/20 mt-8 pt-8 text-center text-muted"
          >
            <p>&copy; 2024 GolfLabs. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
