import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Plus, Target, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

//const API_URL = "http://localhost:5000/api/donations";

const Donations = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal_amount: "",
    image_url: "",
    qr_code_url: ""
  });

  // Fetch user and donation data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth";
      return;
    }
    
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    setIsAdmin(userData?.role === "admin");
    fetchDonations();
  }, []);

  // Fetch all donations
  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/donations");
      setDonations(res.data || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load donations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload (optional)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "qr_code_url") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("image", file);

    try {
       const res = await api.post("/upload", form, {
        headers: {
          // axios will set proper multipart boundary automatically
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Backend upload response:", res.data);
      
      const imageUrl = res.data.secure_url || res.data.imageUrl; 
    if (!imageUrl) throw new Error("No URL returned from upload");

      //const data = await res.json();
      setFormData((prev) => ({ ...prev, [field]: imageUrl }));
      //console.log("Uploaded image URL:", res.data.imageUrl);

      toast({ title: "Uploaded", description: "Image uploaded successfully" });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Image upload failed",
        variant: "destructive",
      });
    }  finally {
      setUploading(false);
    }
  };

  // Handle new campaign creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
       await api.post(
        "/donations",
        {
          ...formData,
          goal_amount: parseFloat(formData.goal_amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({ title: "Success", description: "Donation campaign created successfully" });
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        goal_amount: "",
        image_url: "",
        qr_code_url: "",
      });
      fetchDonations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" });
    }
  };

  // Handle delete (admin only)
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await api.delete(`/donations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({ title: "Deleted", description: "Campaign removed successfully" });
      fetchDonations();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to delete campaign", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gradient">Donation Campaigns</h1>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="glass-card">
                  <Plus className="w-4 h-4 mr-2" /> Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Donation Campaign</DialogTitle>
                  <DialogDescription>Start a new fundraising campaign</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Campaign Title</Label>
                    <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="glass-card" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="glass-card min-h-[120px]" />
                  </div>
                  <div>
                    <Label>Goal Amount (₹)</Label>
                    <Input required type="number" value={formData.goal_amount} onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })} className="glass-card" />
                  </div>
                  <div>
                    <Label>Campaign Image</Label>
                    <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "image_url")} disabled={uploading} className="glass-card" />
                    {formData.image_url && <img src={formData.image_url} alt="Preview" className="mt-2 h-32 rounded object-cover" />}
                  </div>
                  <div>
                    <Label>Payment QR Code</Label>
                    <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "qr_code_url")} disabled={uploading} className="glass-card" />
                    {formData.qr_code_url && <img src={formData.qr_code_url} alt="QR Preview" className="mt-2 h-32 rounded object-cover" />}
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    Create Campaign
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <p>Loading campaigns...</p>
        ) : donations.length === 0 ? (
          <p>No donation campaigns yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
  <Dialog key={donation._id}>
    <Card className="glass-card overflow-hidden">
      {donation.image_url && (
        <img
          src={donation.image_url}
          alt={donation.title}
          className="w-full h-48 object-cover"
        />
      )}

      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{donation.title}</CardTitle>
          {isAdmin && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDelete(donation._id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>

        {/* Description preview */}
        <CardDescription className="line-clamp-2">
          {donation.description}
        </CardDescription>

        {/* Read more */}
        <DialogTrigger asChild>
          <Button variant="link" size="sm" className="p-0 w-fit">
            Read More
          </Button>
        </DialogTrigger>
      </CardHeader>

      <CardContent className="space-y-4">
        {donation.qr_code_url && (
          <div className="text-center">
            <p className="text-sm font-semibold mb-2">Scan to Donate</p>
            <img
              src={donation.qr_code_url}
              alt="QR Code"
              className="mx-auto h-32 w-32"
            />
          </div>
        )}
      </CardContent>
    </Card>

    {/* Full description modal */}
    <DialogContent className="glass-card max-w-lg">
      <DialogHeader>
        <DialogTitle>{donation.title}</DialogTitle>
        <DialogDescription className="whitespace-pre-line">
          {donation.description}
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

export default Donations;
