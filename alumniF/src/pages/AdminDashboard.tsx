import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Briefcase,
  Calendar,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    events: 0,
    jobs: 0,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [pendingAlumni, setPendingAlumni] = useState<any[]>([]);

  // Dialog state
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);

  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [alumniDialogOpen, setAlumniDialogOpen] = useState(false);

  useEffect(() => {
    verifyAdmin();
  }, []);

  const verifyAdmin = async () => {
    try {
      const { data } = await api.get("/auth/me");

      if (data.role !== "admin") {
        toast({
          title: "Access denied",
          description: "Admins only",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setUser(data);
      await loadDashboardData();
    } catch {
      navigate("/auth");
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, eventsRes, jobsRes, alumniRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/events"),
        api.get("/admin/jobs"), // fetch all jobs including pending
        api.get("/admin/alumni/pending"),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
      setJobs(jobsRes.data);
      setPendingAlumni(alumniRes.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- ACTIONS -------------------- */
  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user permanently?")) return;
    await api.delete(`/admin/users/${id}`);
    toast({ title: "User deleted" });
    loadDashboardData();
  };

  

  /*const deleteJob = async (id: string) => {
    if (!confirm("Delete this job permanently?")) return;
    await api.delete(`/admin/jobs/${id}`);
    toast({ title: "Job deleted" });
    loadDashboardData();
  };*/

  const approveAlumni = async (id: string) => {
    await api.put(`/admin/alumni/approve/${id}`);
    toast({ title: "Alumni approved" });
    loadDashboardData();
  };

  const rejectAlumni = async (id: string) => {
    await api.put(`/admin/alumni/reject/${id}`);
    toast({ title: "Alumni rejected" });
    loadDashboardData();
  };

  const verifyJob = async (id: string) => {
    await api.put(`/admin/jobs/verify/${id}`);
    toast({ title: "Job verified" });
    loadDashboardData();
  };

  const rejectJob = async (id: string) => {
    await api.delete(`/admin/jobs/${id}`);
    toast({ title: "Job rejected" });
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Users" value={stats.users} icon={<Users />} />
          <StatCard title="Events" value={stats.events} icon={<Calendar />} />
          <StatCard title="Jobs" value={stats.jobs} icon={<Briefcase />} />
        </div>

        <Tabs defaultValue="alumni">
          <TabsList>
            <TabsTrigger value="alumni">Pending Alumni</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>

          {/* -------------------- PENDING ALUMNI -------------------- */}
          <TabsContent value="alumni">
            <AdminTable
              title="Pending Alumni Verification"
              headers={["Name", "Email", "Scholar No", "DOB", "Actions"]}
            >
              {pendingAlumni.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.scholarNo}</TableCell>
                  <TableCell>{u.dob}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => { setSelectedAlumni(u); setAlumniDialogOpen(true); }}>
                      View
                    </Button>
                    <Button size="sm" onClick={() => approveAlumni(u._id)}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => rejectAlumni(u._id)}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </AdminTable>

            {/* Alumni Modal */}
            <Dialog open={alumniDialogOpen} onOpenChange={setAlumniDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedAlumni?.name}</DialogTitle>
                  <DialogDescription>{selectedAlumni?.email}</DialogDescription>
                </DialogHeader>
                <Card>
                  <CardContent className="space-y-2">
                    <p><strong>Scholar No:</strong> {selectedAlumni?.scholarNo}</p>
                    <p><strong>DOB:</strong> {selectedAlumni?.dob}</p>
                    <p><strong>Father:</strong> {selectedAlumni?.fatherName}</p>
                    <p><strong>Mother:</strong> {selectedAlumni?.motherName}</p>
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* -------------------- USERS -------------------- */}
          <TabsContent value="users">
            <AdminTable
              title="All Users"
              headers={["Name", "Email", "Role", "Actions"]}
            >
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => deleteUser(u._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </AdminTable>
          </TabsContent>

         
         
          {/* -------------------- JOBS -------------------- */}
          <TabsContent value="jobs">
            <AdminTable headers={["Title", "Company", "Description", "Status", "Actions"]}>
              {jobs.map((j) => (
                <TableRow key={j._id}>
                  <TableCell>{j.title}</TableCell>
                  <TableCell>{j.company}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => { setSelectedJob(j); setJobDialogOpen(true); }}>
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={j.is_verified ? "default" : "secondary"}>
                      {j.is_verified ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {!j.is_verified && (
                      <>
                        <Button size="sm" onClick={() => verifyJob(j._id)}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectJob(j._id)}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                  </TableCell>
                </TableRow>
              ))}
            </AdminTable>

            {/* Job Modal */}
            <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedJob?.title}</DialogTitle>
                  <DialogDescription>{selectedJob?.company}</DialogDescription>
                </DialogHeader>
                <Card>
                  <CardContent className="space-y-2">
                    <p><strong>Description:</strong> {selectedJob?.description || "N/A"}</p>
                    <p><strong>Location:</strong> {selectedJob?.location || "N/A"}</p>
                    <p><strong>Job Type:</strong> {selectedJob?.job_type || "N/A"}</p>
                    <p><strong>Salary Range:</strong> {selectedJob?.salary_range || "N/A"}</p>
                    {selectedJob?.application_link && (
                      <p>
                        <strong>Apply:</strong>{" "}
                        <a href={selectedJob.application_link} target="_blank" rel="noopener noreferrer">
                          {selectedJob.application_link}
                        </a>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

/* -------------------- HELPERS -------------------- */
const StatCard = ({ title, value, icon }: any) => (
  <Card>
    <CardHeader className="flex flex-row justify-between">
      <CardTitle className="text-sm">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent className="text-2xl font-bold">{value}</CardContent>
  </Card>
);

const AdminTable = ({ title, headers, children }: any) => (
  <Card>
    {title && (
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
    )}
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((h: string) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default AdminDashboard;
