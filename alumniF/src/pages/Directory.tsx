import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Linkedin, Github, Briefcase, Users, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { api } from "@/lib/api";

interface Profile {
  _id: string;
  user: { _id: string; name: string; email: string };
  currentPosition?: string;
  company?: string;
  department?: string;
  location?: string;
  graduation_year?: number;
  linkedin?: string;
  github?: string;
  bio?: string;
  photo?: string;
}

const Directory = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [user, setUser] = useState<any>(null);

  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  const [locations, setLocations] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [modalProfile, setModalProfile] = useState<Profile | null>(null);

  // Load profiles and user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchProfiles = async () => {
      try {
        const res = await api.get("/alumni");
        console.log("ALUMNI DATA", res.data);

        const data: Profile[] = res.data;
        setProfiles(data);

        setLocations(Array.from(new Set(data.map(p => p.location).filter(Boolean))).sort());
        setDepartments(Array.from(new Set(data.map(p => p.department).filter(Boolean))).sort());
      } catch (err) {
        console.error("Error fetching profiles:", err);
      }
    };

    fetchProfiles();
  }, []);

  // Combined filtering
  const filteredProfiles = profiles.filter(p => {
    const matchesName = !nameFilter || p.user.name.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesCompany = !companyFilter || p.company?.toLowerCase().includes(companyFilter.toLowerCase());
    const matchesPosition = !positionFilter || p.currentPosition?.toLowerCase().includes(positionFilter.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || p.department?.toLowerCase().includes(departmentFilter.toLowerCase());
    const matchesLocation = locationFilter === "all" || p.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesYear = !yearFilter || Number(p.graduation_year) === Number(yearFilter);

    return matchesName && matchesCompany && matchesPosition && matchesDepartment && matchesLocation && matchesYear;
  });

  return (
    <div className="min-h-screen pb-20">
      <Navbar user={user} />
      <div className="flex container mx-auto px-4 pt-24 gap-6">

        {/* Sidebar filters */}
        <aside className="w-64 bg-white p-6 rounded-lg shadow-md flex-shrink-0 fixed top-24 left-4 h-[calc(100vh-96px)] overflow-y-auto">
          <h3 className="text-sm text-muted-foreground uppercase mb-4 font-semibold">Filters</h3>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <Input placeholder="Name" value={nameFilter} onChange={e => setNameFilter(e.target.value)} className="flex-1" />
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <Input placeholder="Company" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="flex-1" />
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <Input placeholder="Position" value={positionFilter} onChange={e => setPositionFilter(e.target.value)} className="flex-1" />
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <Select value={locationFilter} onValueChange={setLocationFilter}>
  <SelectTrigger className="flex-1">
    <SelectValue placeholder="Location" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Locations</SelectItem>
    {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
  </SelectContent>
</Select>

            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
  <SelectTrigger className="flex-1">
    <SelectValue placeholder="Department" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Departments</SelectItem>
    {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
  </SelectContent>
</Select>

            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Graduation Year"
                type="number"
                value={yearFilter ?? ""}
                onChange={e => setYearFilter(e.target.value ? Number(e.target.value) : null)}
                className="flex-1"
              />
            </div>

            <Button variant="secondary" onClick={() => {
              setNameFilter("");
              setCompanyFilter("");
              setPositionFilter("");
              setDepartmentFilter("all");
              setLocationFilter("all");
              setYearFilter(null);
            }}>
              Reset Filters
            </Button>
          </div>
        </aside>

        {/* Alumni cards */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-72">
          {filteredProfiles.length === 0 && (
            <p className="text-center col-span-full mt-6 text-muted-foreground">No alumni found.</p>
          )}

          {filteredProfiles.map(profile => (
            <Card key={profile._id} className="glass-card p-6 flex flex-col items-center text-center">
              <img
                src={profile.photo || "https://res.cloudinary.com/dddqt6qjf/image/upload/v1765099637/9815472_tkoi09.png"}
                alt={profile.user.name}
                className="w-20 h-20 rounded-full mb-2 object-cover"
              />
              <h3 className="text-xl font-semibold">{profile.user.name}</h3>
              {profile.currentPosition && profile.company && <p className="text-muted-foreground text-sm">{profile.currentPosition} at {profile.company}</p>}
              {profile.department && <p className="text-sm text-muted-foreground">Department: {profile.department}</p>}
              {profile.graduation_year && <p className="text-sm text-muted-foreground">Class of {profile.graduation_year}</p>}
              <Button variant="secondary" className="mt-2" onClick={() => setModalProfile(profile)}>View More</Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Profile modal */}
      <Dialog open={!!modalProfile} onOpenChange={() => setModalProfile(null)}>
        <DialogContent className="max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle>{modalProfile?.user.name}</DialogTitle>

          </DialogHeader>
          {modalProfile && (
            <div className="space-y-2 mt-4 text-sm">
              {modalProfile.currentPosition && modalProfile.company && (
                <p><Briefcase className="w-4 h-4 inline mr-1" /> {modalProfile.currentPosition} at {modalProfile.company}</p>
              )}
              {modalProfile.department && (
                <p><Users className="w-4 h-4 inline mr-1" /> Department: {modalProfile.department}</p>
              )}
              {modalProfile.graduation_year && (
                <p><Calendar className="w-4 h-4 inline mr-1" /> Class of {modalProfile.graduation_year}</p>
              )}
              {modalProfile.location && (
                <p><MapPin className="w-4 h-4 inline mr-1" /> {modalProfile.location}</p>
              )}
              <p><strong>Email:</strong> {modalProfile.user.email}</p>
              <div className="flex gap-2 mt-2">
                {modalProfile.linkedin && <a href={modalProfile.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-4 h-4 inline mr-1" />LinkedIn</a>
                  }
                {modalProfile.github && <a href={modalProfile.github} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 inline mr-1" />GitHub</a>
                  }                
              </div>
               {modalProfile.bio && <p>Bio: {modalProfile.bio}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Directory;
