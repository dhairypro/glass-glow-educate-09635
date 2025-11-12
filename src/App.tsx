import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/Students";
import Attendance from "./pages/admin/Attendance";
import Exams from "./pages/admin/Exams";
import Classes from "./pages/admin/Classes";
import Files from "./pages/admin/Files";
import Leaderboard from "./pages/Leaderboard";
import Announcements from "./pages/admin/Announcements";
import Fees from "./pages/admin/Fees";
import StudentReport from "./pages/admin/StudentReport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute role="admin"><Students /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute role="admin"><Attendance /></ProtectedRoute>} />
            <Route path="/admin/exams" element={<ProtectedRoute role="admin"><Exams /></ProtectedRoute>} />
            <Route path="/admin/classes" element={<ProtectedRoute role="admin"><Classes /></ProtectedRoute>} />
            <Route path="/admin/files" element={<ProtectedRoute role="admin"><Files /></ProtectedRoute>} />
            <Route path="/admin/announcements" element={<ProtectedRoute role="admin"><Announcements /></ProtectedRoute>} />
            <Route path="/admin/fees" element={<ProtectedRoute role="admin"><Fees /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute role="admin"><StudentReport /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
