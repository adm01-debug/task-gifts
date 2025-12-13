import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AchievementNotificationProvider } from "@/contexts/AchievementNotificationContext";
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
import Attendance from "./pages/Attendance";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Shop from "./pages/Shop";
import ShopAdmin from "./pages/ShopAdmin";
import SocialFeed from "./pages/SocialFeed";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";
import PersonalStats from "./pages/PersonalStats";
import SeasonalEventDetail from "./pages/SeasonalEventDetail";
import Mentorship from "./pages/Mentorship";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AchievementNotificationProvider>
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
              <Route path="/ponto" element={<Attendance />} />
              <Route path="/executivo" element={<ExecutiveDashboard />} />
              <Route path="/feed" element={<SocialFeed />} />
              <Route path="/conquistas" element={<Achievements />} />
              <Route path="/estatisticas" element={<PersonalStats />} />
              <Route path="/loja" element={<Shop />} />
              <Route path="/eventos/:eventId" element={<SeasonalEventDetail />} />
              <Route path="/mentoria" element={<Mentorship />} />
              <Route
                path="/loja/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ShopAdmin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AchievementNotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
