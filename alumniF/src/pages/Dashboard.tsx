import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Briefcase,
  Heart,
  TrendingUp,
  Award,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalAlumni: 0,
    upcomingEvents: 0,
    activeJobs: 0,
    donations: 0,
  });

  //  Fetch logged-in user and dashboard stats
  useEffect(() => {
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      // Fetch logged-in user as-is (don't filter by role)
      const userRes = await api.get("/users/me");
      setUser(userRes.data);

      // Fetch all data in parallel
      const [usersRes, eventsRes, jobsRes, donationsRes] = await Promise.all([
        api.get("/admin/users"),  // all users, no filter
        api.get("/events"),
        api.get("/jobs"),
        api.get("/donations"),
      ]);

      // Only count alumni for the alumni stat card
      const alumniUsers = usersRes.data.filter(user => user.role === "alumni");

      setStats({
        totalAlumni: alumniUsers.length || 0,  // alumni count only here
        upcomingEvents: eventsRes.data.length || 0,
        activeJobs: jobsRes.data.length || 0,
        donations: donationsRes.data.length || 0,
      });
    } catch (error) {
      console.error("Dashboard load error:", error);
      toast.error("Session expired, please login again");
      localStorage.removeItem("token");
      navigate("/auth");
    }
  };

  fetchData();
}, [navigate]);

  const quickLinks = [
    { title: "Alumni Directory", description: "Connect with fellow alumni", icon: <Users className="w-8 h-8" />, link: "/directory", color: "from-blue-500 to-purple-500" },
    { title: "Upcoming Events", description: "Register for events", icon: <Calendar className="w-8 h-8" />, link: "/events", color: "from-purple-500 to-pink-500" },
    { title: "Job Board", description: "Find opportunities", icon: <Briefcase className="w-8 h-8" />, link: "/jobs", color: "from-cyan-500 to-blue-500" },
    { title: "Make a Donation", description: "Support your alma mater", icon: <Heart className="w-8 h-8" />, link: "/donations", color: "from-pink-500 to-red-500" },
  ];

  const statCards = [
    { label: "Total Alumni", value: stats.totalAlumni, icon: <Users className="w-6 h-6" /> },
    { label: "Upcoming Events", value: stats.upcomingEvents, icon: <Calendar className="w-6 h-6" /> },
    { label: "Active Jobs", value: stats.activeJobs, icon: <Briefcase className="w-6 h-6" /> },
    { label: "Donation Drives", value: stats.donations, icon: <Heart className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen pb-20">
      <Navbar user={user} />

      <div className="container mx-auto px-4 pt-24">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{user?.name || "User"}</span>! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening in your alumni network today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <Card key={index} className="glass-card p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg gradient-primary text-white">
                  {stat.icon}
                </div>
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Link key={index} to={link.link}>
                <Card className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group h-full">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 group-hover:animate-glow`}>
                    <div className="text-white">{link.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{link.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{link.description}</p>
                  <div className="flex items-center text-accent text-sm font-medium">
                    Explore <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Success Stories Section */}
        <Card className="glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Award className="w-6 h-6 text-accent" />
                Latest Success Stories
              </h2>
              <p className="text-muted-foreground">
                Get inspired by fellow alumni achievements
              </p>
            </div>
            <Link to="/stories">
              <Button variant="hero">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="text-center py-12 text-muted-foreground">
            Browse inspiring stories from your fellow alumni
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

