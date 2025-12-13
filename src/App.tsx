import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ManagerDashboard from "./pages/ManagerDashboard";
import QuestBuilder from "./pages/QuestBuilder";
import EngagementReports from "./pages/EngagementReports";
import AuditLogs from "./pages/AuditLogs";
import RealTimeAnalytics from "./pages/RealTimeAnalytics";
import LearningTrails from "./pages/LearningTrails";
import TrailDetail from "./pages/TrailDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/quest-builder" element={<QuestBuilder />} />
            <Route path="/reports" element={<EngagementReports />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/analytics" element={<RealTimeAnalytics />} />
            <Route path="/trails" element={<LearningTrails />} />
            <Route path="/trails/:id" element={<TrailDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
