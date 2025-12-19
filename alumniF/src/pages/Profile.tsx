import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface ProfileData {
  full_name: string;
  email: string;
  graduation_year: number | null;
  department: string;
  company: string;
  designation: string;
  bio: string;
  location: string;
  linkedin: string;
  github:string;
  photo?: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    graduation_year: null,
    department: "",
    company: "",
    designation: "",
    bio: "",
    location: "",
    linkedin: "",
    github:"",
    photo: null,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Load user and profile data
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/auth");

      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));

      try {
        const res = await api.get("/profile");
        const p = res.data;
        setProfile({
          full_name: p.user?.name || p.full_name || "",
          email: p.user?.email || p.email || "",
          graduation_year: p.graduation_year || null,
          department: p.department || "",
          company: p.company || "",
          designation: p.designation || p.currentPosition || "",
          bio: p.bio || "",
          location: p.location || "",
          linkedin: p.linkedin || "",
          github:p.github||"",
          photo: p.photo || null,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch profile");
      }
    };

    checkUser();
  }, [navigate]);

  // Handle profile submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, value]) => {
        if (value !== null && key !== "photo") formData.append(key, value as any);
      });
      if (photoFile) formData.append("photo", photoFile);

      await api.put("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar user={user} />
      <div className="container mx-auto px-4 pt-24">
        <Card className="glass-card p-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gradient">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={profile.full_name}
                  onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                  className="glass-card"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={profile.email} disabled className="glass-card" />
              </div>
              <div>
                <Label>Graduation Year</Label>
                <Input
                  type="number"
                  value={profile.graduation_year || ""}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      graduation_year: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="glass-card"
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  value={profile.department}
                  onChange={e => setProfile({ ...profile, department: e.target.value })}
                  className="glass-card"
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={profile.company}
                  onChange={e => setProfile({ ...profile, company: e.target.value })}
                  className="glass-card"
                />
              </div>
              <div>
                <Label>Designation</Label>
                <Input
                  value={profile.designation}
                  onChange={e => setProfile({ ...profile, designation: e.target.value })}
                  className="glass-card"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={profile.location}
                  onChange={e => setProfile({ ...profile, location: e.target.value })}
                  className="glass-card"
                />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input
                  value={profile.linkedin}
                  onChange={e => setProfile({ ...profile, linkedin: e.target.value })}
                  className="glass-card"
                />
              </div>
              
              <div>
                <Label>GitHub URL</Label>
                <Input
                  value={profile.github}
                  onChange={e=>setProfile({...profile, github: e.target.value})}
                  className="glass-card"
                  />
              </div>
              <div>
                <Label>Profile Photo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                  className="glass-card"
                />
                {profile.photo && (
                  <img
                    src={profile.photo}
                    alt="Profile"
                    className="w-20 h-20 rounded-full mt-2 object-cover"
                  />
                )}
              </div>
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                className="glass-card"
                rows={4}
              />
            </div>

            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
