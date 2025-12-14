import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AchievementNotificationProvider } from "@/contexts/AchievementNotificationContext";
import { SoundSettingsProvider } from "@/contexts/SoundSettingsContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { lazy, Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

// Eagerly loaded routes (critical path)
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy loaded routes (code splitting)
const Profile = lazy(() => import("./pages/Profile"));
const ManagerDashboard = lazy(() => import("./pages/ManagerDashboard"));
const QuestBuilder = lazy(() => import("./pages/QuestBuilder"));
const EngagementReports = lazy(() => import("./pages/EngagementReports"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const RealTimeAnalytics = lazy(() => import("./pages/RealTimeAnalytics"));
const LearningTrails = lazy(() => import("./pages/LearningTrails"));
const TrailDetail = lazy(() => import("./pages/TrailDetail"));
const Attendance = lazy(() => import("./pages/Attendance"));
const ExecutiveDashboard = lazy(() => import("./pages/ExecutiveDashboard"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopAdmin = lazy(() => import("./pages/ShopAdmin"));
const SocialFeed = lazy(() => import("./pages/SocialFeed"));
const Achievements = lazy(() => import("./pages/Achievements"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PersonalStats = lazy(() => import("./pages/PersonalStats"));
const SeasonalEventDetail = lazy(() => import("./pages/SeasonalEventDetail"));
const Mentorship = lazy(() => import("./pages/Mentorship"));
const Duels = lazy(() => import("./pages/Duels"));
const DailyQuiz = lazy(() => import("./pages/DailyQuiz"));
const QuizAdmin = lazy(() => import("./pages/QuizAdmin"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Bitrix24CRM = lazy(() => import("./pages/Bitrix24CRM"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground animate-pulse">Carregando...</p>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SoundSettingsProvider>
        <AuthProvider>
          <AchievementNotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
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
                    <Route path="/duelos" element={<Duels />} />
                    <Route path="/quiz" element={<DailyQuiz />} />
                    <Route path="/quiz/admin" element={<QuizAdmin />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/bitrix24" element={<Bitrix24CRM />} />
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
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </AchievementNotificationProvider>
        </AuthProvider>
      </SoundSettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
