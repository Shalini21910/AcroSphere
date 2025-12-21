import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Directory from "./pages/Directory";
import Events from "./pages/Events";
import Jobs from "./pages/Jobs";
import Donations from "./pages/Donations";
import Stories from "./pages/Stories";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

import { useEffect } from "react";


const queryClient = new QueryClient();

const Protected = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/auth" replace />;
  return children;
};

const AdminProtected = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/auth" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
};

const App = () => {
  useEffect(() => {
  
   // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
  fetch(`${import.meta.env.VITE_API_BASE_URL}/health`)
    .then(res => res.json())
    .then(data => console.log(" Backend says:", data))
    .catch(err => console.error(" Connection failed:", err));
}, []);
return(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/events" element={<Events />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
};

export default App;
