import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  Calendar,
  Briefcase,
  Heart,
  Award,
  Network,
  ArrowRight,
} from "lucide-react";
import collegeHero from "@/assets/college-hero.jpg";
import Navbar from "@/components/Navbar";

const LandingPage = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Alumni Directory",
      description: "Connect with thousands of alumni from your college",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Events & Meetups",
      description: "Join exclusive alumni events and networking sessions",
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Job Board",
      description: "Access exclusive job opportunities from alumni",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Give Back",
      description: "Support your alma mater through donations",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Success Stories",
      description: "Get inspired by fellow alumni achievements",
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: "Professional Network",
      description: "Build meaningful connections with industry leaders",
    },
  ];

  return (
    <div
  className="min-h-screen bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('/src/assets/college-hero.jpg')" }}
>

      <Navbar user={null} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={collegeHero}
            alt="College Campus"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-[#9A77C3]/20" />


        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 glass-card rounded-full">
              <span className="text-accent font-semibold">🎓 Connect • Network • Grow</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
  <span className=" relative inline-block text-white drop-shadow-[0_0_12px_rgba(0,0,0,0.45)] [-webkit-text-stroke:1.5px_rgba(0,0,0,0.45)] " > AcroSphere </span>

              <br />
              A Digital Sphere of Lifelong Bonds
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of alumni connecting, collaborating, and creating opportunities. 
              Your journey doesn't end at graduation—it begins here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="text-lg px-8">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span>Large Alumni network</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Jobs opportunities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span>Hosted events</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to <span className="text-gradient">Stay Connected</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform offers a comprehensive suite of features designed to keep you engaged with your alumni community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:animate-glow">
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Reconnect?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join your fellow alumni and unlock endless networking opportunities
              </p>
              <Link to="/auth">
                <Button variant="hero" size="lg" className="text-lg px-12">
                  Join Now - It's Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; AcroSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
