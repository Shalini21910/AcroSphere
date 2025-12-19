import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, User } from "lucide-react";
import { toast } from "sonner";

interface NavbarProps {
  user: any; // You can refine this type later
}

const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove JWT from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold text-gradient">AcroSphere</span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to={user?.role === "admin" ? "/admin" : "/dashboard"}>
  <Button variant="ghost">Dashboard</Button>
</Link>
                <Link to="/directory">
                  <Button variant="ghost">Directory</Button>
                </Link>
                <Link to="/events">
                  <Button variant="ghost">Events</Button>
                </Link>
                <Link to="/jobs">
                  <Button variant="ghost">Jobs</Button>
                </Link>
                <Link to="/donations">
                  <Button variant="ghost">Donate</Button>
                </Link>
                <Link to="/stories">
                  <Button variant="ghost">Stories</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="glass" size="sm">
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
               <Link to="/auth">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero">Get Started</Button>
                </Link> 
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
