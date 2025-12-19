import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Award, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

// ===== Types matching your backend =====

type User = {
  _id: string;
  full_name: string;
  email: string;
  role: string; // e.g. "admin" | "user"
};

type StoryAuthor = {
  _id: string;
  full_name: string;
  email: string;
};

type Story = {
  _id: string;
  title: string;
  story: string;
  achievement?: string;
  image_url?: string;
  author?: StoryAuthor;
  createdAt?: string;
  updatedAt?: string;
};

// ===== Component =====

const Stories = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    achievement: "",
    image_url: "",
  });

  // Helper to extract error messages from Axios / fetch
  const getErrorMessage = (err: any): string => {
    return (
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong. Please try again."
    );
  };

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Story[]>("/stories");
      setStories(res.data || []);
    } catch (err: any) {
      console.error("Error fetching stories:", err);
      toast({
        title: "Error",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/auth");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }

    fetchStories();
  }, [navigate, fetchStories]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      setFormData((prev) => ({ ...prev, image_url: res.data.imageUrl }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(
        "/stories",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Story posted successfully!",
      });

      setDialogOpen(false);
      setFormData({
        title: "",
        story: "",
        achievement: "",
        image_url: "",
      });

      fetchStories();
    } catch (err: any) {
      console.error("Error creating story:", err);
      toast({
        title: "Error",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Optional: delete story for admins (backend route already exists)
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
 if (!window.confirm("Are you sure you want to delete this story?")) return;

    try {
      await api.delete(`/stories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Deleted",
        description: "Story deleted successfully",
      });

      setStories((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      console.error("Error deleting story:", err);
      if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/auth");
      toast({
        title: "Session expired",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }

      toast({
        title: "Error",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gradient">Success Stories</h1>

          {user?.role === "admin" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="glass-card">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Story
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post Success Story</DialogTitle>
                  <DialogDescription>
                    Share inspiring alumni achievements
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="glass-card"
                    />
                  </div>
                  <div>
                    <Label htmlFor="achievement">Achievement Summary</Label>
                    <Input
                      id="achievement"
                      required
                      value={formData.achievement}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          achievement: e.target.value,
                        })
                      }
                      className="glass-card"
                      placeholder="e.g., CEO of Tech Company, Published Author"
                    />
                  </div>
                  <div>
                    <Label htmlFor="story">Full Story</Label>
                    <Textarea
                      id="story"
                      required
                      value={formData.story}
                      onChange={(e) =>
                        setFormData({ ...formData, story: e.target.value })
                      }
                      className="glass-card min-h-[150px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Story Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="glass-card"
                    />
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="mt-2 h-32 rounded object-cover"
                      />
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={uploading || submitting}
                  >
                    {submitting ? "Posting..." : "Post Story"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <p>Loading stories...</p>
        ) : stories.length === 0 ? (
          <p className="text-muted-foreground">
            No stories yet. Check back soon.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
           {stories.map((story) => (
  <Dialog key={story._id}>
    <Card className="glass-card overflow-hidden">
      {story.image_url && (
        <img
          src={story.image_url}
          alt={story.title}
          className="w-full h-64 object-cover"
        />
      )}

      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {story.title}
            </CardTitle>

            {story.achievement && (
              <CardDescription className="font-semibold text-primary">
                {story.achievement}
              </CardDescription>
            )}

            {story.author && (
              <p className="mt-1 text-xs text-muted-foreground">
                By {story.author.full_name} ({story.author.email})
              </p>
            )}
          </div>

          {user?.role === "admin" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(story._id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Preview (do NOT preserve whitespace here) */}
        <p className="text-sm line-clamp-2">
          {story.story}
        </p>

        {/* Read more */}
        <DialogTrigger asChild>
          <Button variant="link" size="sm" className="p-0 w-fit">
            Read More
          </Button>
        </DialogTrigger>
      </CardContent>
    </Card>

    {/* Full story modal */}
    <DialogContent className="glass-card max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{story.title}</DialogTitle>
        {story.achievement && (
          <DialogDescription className="font-semibold text-primary">
            {story.achievement}
          </DialogDescription>
        )}
      </DialogHeader>

      <div className="mt-4 whitespace-pre-line text-sm">
        {story.story}
      </div>
    </DialogContent>
  </Dialog>
))}

          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;
