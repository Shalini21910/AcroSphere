import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api"; 

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"alumni" | "student">("alumni");

  //alumni specific fields
  const[dob, setDob]=useState("");
  const[fatherName, setFatherName]=useState("");
  const[motherName,setMotherName]=useState("");
  const[scholarNo, setScholarNo]=useState("");
  //  Register user
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast.error("Please fill in all fields");
      return;
    }

   if(role==="alumni" && (!dob||!fatherName||!scholarNo)){
     toast.error("Please fill all the fields");
     return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        name: fullName,
        email,
        password,
        role:role==="alumni"?"student":role,
        ...(role==="alumni" &&{
          dob,
          fatherName,
          motherName,
          scholarNo,
          pendingAlumni:true,
        }),
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
     toast.success(
  role === "alumni"
    ? "Account created! Alumni verification pending."
    : "Account created successfully!"
);

//  everyone goes to dashboard
navigate("/dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
     

      toast.success("Signed in successfully!");
    const user = res.data.user;

if (res.data.user.role === "admin") {
  console.log("Navigating to /admin now");
  navigate("/admin");
} else {
  navigate("/dashboard");
}
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <Card className="w-full max-w-md glass-card p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Connect with your alumni network</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="glass-card"
                />
              </div>

              <Button type="submit" className="w-full" variant="hero" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="glass-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-role">I am a</Label>
                <Select value={role} onValueChange={(value: "alumni" | "student") => setRole(value)}>
                  <SelectTrigger id="signup-role" className="glass-card">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alumni">Alumni</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/*Alumni-specific fields*/}
              {role === "alumni" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="signup-dob">Date of Birth</Label>
                    <Input
                      id="signup-dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="glass-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-father-name">Father's Name</Label>
                    <Input
                      id="signup-father-name"
                      type="text"
                      placeholder="Father's Name"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      required
                      className="glass-card"
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="signup-mother-name">Mother's Name</Label>
                    <Input
                      id="signup-mother-name"
                      type="text"
                      placeholder="Mother's Name"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      required
                      className="glass-card"
                    />
                  </div>
                 <div className="space-y-2">
                    <Label htmlFor="signup-scholar-no">Scholar Number</Label>
                    <Input
                      id="signup-scholar-no"
                      type="text"
                      placeholder="Scholar Number"
                      value={scholarNo}
                      onChange={(e) => setScholarNo(e.target.value)}
                      required
                      className="glass-card"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="glass-card"
                />
              </div>

              <Button type="submit" className="w-full" variant="hero" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google login removed since we’re not using Supabase */}
          <Button type="button" variant="outline" className="w-full mt-4" disabled>
            <Mail className="w-4 h-4 mr-2" />
            Google (Coming Soon)
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;

