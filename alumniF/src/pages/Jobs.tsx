import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, DollarSign, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Jobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    job_type: "Full-time",
    salary_range: "",
    application_link: ""
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/auth");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchJobs();
  }, [navigate]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/jobs");
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch jobs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    // Role check for safety
    if (!(user?.role === "admin" || user?.role === "alumni")) {
      toast({
        title: "Unauthorized",
        description: "Only admins or alumni can post jobs.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/jobs", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Success",
        description: "Job posted successfully! Awaiting admin verification."
      });

      setDialogOpen(false);
      setFormData({
        title: "",
        company: "",
        description: "",
        location: "",
        job_type: "Full-time",
        salary_range: "",
        application_link: ""
      });

      fetchJobs();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await api.delete(`/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Deleted",
        description: "Job deleted successfully",
      });

      setJobs((prev) => prev.filter((job) => job._id !== id));
    } catch (err: any) {
      console.error("Error deleting job:", err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || err.message || "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gradient">Job Board</h1>

          {/* Only admins and alumni can post jobs */}
          {user && (user.role === "admin" || user.role === "alumni") && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="glass-card">
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post a New Job</DialogTitle>
                  <DialogDescription>Share job opportunities with fellow alumni</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="glass-card"
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="glass-card"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="glass-card min-h-[120px]"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Location</Label>
                      <Input
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="glass-card"
                      />
                    </div>
                    <div>
                      <Label>Job Type</Label>
                      <Select
                        value={formData.job_type}
                        onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                      >
                        <SelectTrigger className="glass-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Salary Range (Optional)</Label>
                    <Input
                      value={formData.salary_range}
                      onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                      className="glass-card"
                      placeholder="e.g., ₹50,000 - ₹70,000"
                    />
                  </div>
                  <div>
                    <Label>Application Link (Optional)</Label>
                    <Input
                      value={formData.application_link}
                      onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
                      className="glass-card"
                      placeholder="https://..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Post Job
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <p>Loading jobs...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Dialog key={job._id}>
              <Card className="glass-card">
                <CardHeader>
                 <div className="flex justify-between items-start">
          <div>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Briefcase className="w-4 h-4" />
              {job.company}
            </CardDescription>
          </div>
          {job.is_verified ? (
            <Badge>Verified</Badge>
          ) : (
            <Badge variant="secondary">Pending</Badge>
          )}
          {user?.role === "admin" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(job._id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Truncated description */}
        <p className="text-sm line-clamp-2">{job.description}</p>

        {/* Read More button */}
        <DialogTrigger asChild>
          <Button variant="link" size="sm" className="p-0">
            Read More
          </Button>
        </DialogTrigger>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {job.location}
          </span>
          <Badge variant="outline">{job.job_type}</Badge>
          {job.salary_range && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {job.salary_range}
            </span>
          )}
        </div>

        {job.application_link && (
          <Button asChild variant="outline" size="sm">
            <a
              href={job.application_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply Now
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
    {/* Full description modal */}
    <DialogContent className="glass-card max-w-lg">
      <DialogHeader>
        <DialogTitle>{job.title}</DialogTitle>
        <DialogDescription className="whitespace-pre-line">
  {job.description}
</DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

