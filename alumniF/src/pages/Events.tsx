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
import { Calendar, MapPin, Users, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface User {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  event_date: string; 
  location: string;
  max_participants?: number;
  image_url?: string;
  application_link?: string;
}

const Events = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    max_participants: "",
    image_url: "",
    application_link: "",
  });

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/events");
      setEvents(res.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Auth + initial data
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/auth");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role === "admin");
    }

    fetchEvents();
  }, [navigate, fetchEvents]);

  // Image upload (like Donations: /upload)
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
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = res.data.secure_url || res.data.imageUrl;
      if (!imageUrl) throw new Error("No URL returned from upload");

      setFormData((prev) => ({ ...prev, image_url: imageUrl }));

      toast({
        title: "Uploaded",
        description: "Event image uploaded successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Image upload failed",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      event_date: "",
      location: "",
      max_participants: "",
      image_url: "",
      application_link: "",
    });
  };

  // Create event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      await api.post(
        "/events",
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          event_date: formData.event_date, // datetime-local string
          location: formData.location.trim(),
          max_participants: formData.max_participants
            ? Number(formData.max_participants)
            : undefined,
          image_url: formData.image_url.trim() || undefined,
          application_link: formData.application_link.trim() || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      setDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
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
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  // Delete event (admin only) – like Donations delete
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Deleted",
        description: "Event removed successfully",
      });
      fetchEvents();
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
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
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gradient">Upcoming Events</h1>
          {isAdmin && (
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="glass-card">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Add a new event for alumni to attend
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Event Title</Label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="glass-card"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="glass-card min-h-[120px]"
                    />
                  </div>
                  <div>
                    <Label>Application/Registration Link (Optional)</Label>
                    <Input
                      value={formData.application_link}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          application_link: e.target.value,
                        })
                      }
                      className="glass-card"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Date & Time</Label>
                      <Input
                        required
                        type="datetime-local"
                        value={formData.event_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            event_date: e.target.value,
                          })
                        }
                        className="glass-card"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        required
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: e.target.value,
                          })
                        }
                        className="glass-card"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Max Participants (Optional)</Label>
                    <Input
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_participants: e.target.value,
                        })
                      }
                      className="glass-card"
                    />
                  </div>

                  {/* NEW: Image upload like Donations */}
                  <div>
                    <Label>Event Image</Label>
                    <Input
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

                  <Button type="submit" className="w-full" disabled={uploading}>
                    Create Event
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No upcoming events yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const dateObj = new Date(event.event_date);
              const dateStr = dateObj.toLocaleDateString();
              const timeStr = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
               <Card key={event._id} className="glass-card overflow-hidden">
  {/* IMAGE MODAL */}
  {event.image_url && (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-48 object-cover cursor-pointer"
        />
      </DialogTrigger>

      <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto">
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-auto object-contain rounded"
        />
      </DialogContent>
    </Dialog>
  )}

  <CardHeader>
    <div className="flex justify-between items-start gap-2">
      <div>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {dateStr} at {timeStr}
        </CardDescription>
      </div>

      {isAdmin && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleDelete(event._id)}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      )}
    </div>
  </CardHeader>

  <CardContent className="space-y-3">
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      <span className="flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {event.location}
      </span>

      {event.max_participants && (
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          Max {event.max_participants} participants
        </span>
      )}

      {event.application_link && (
        <a
          href={event.application_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline mt-2"
        >
          Apply / Register
        </a>
      )}
    </div>

    {/* DESCRIPTION MODAL */}
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          View Description
        </Button>
      </DialogTrigger>

      <DialogContent className="glass-card max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription className="whitespace-pre-line">
            {event.description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  </CardContent>
</Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
