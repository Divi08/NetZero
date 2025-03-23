import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Index from "./pages/Index";
import CaseDetail from "./pages/CaseDetail";
import CreateCase from "./pages/CreateCase";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import News from "./pages/News";
import History from "./pages/History";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Cases from "@/pages/Cases";
import Dashboard from "./pages/Dashboard";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

// Future flags configuration
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="lg" text="Loading..." className="border-blue-500" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/sign-in" />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="lg" text="Loading application..." className="border-blue-500" />
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/sign-in" element={user ? <Navigate to="/dashboard" /> : <SignIn />} />
      <Route path="/sign-up" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/case/:id" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
      <Route path="/create-case" element={<ProtectedRoute><CreateCase /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
      <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/chat/:chatId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <ChatProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </TooltipProvider>
          </QueryClientProvider>
        </ChatProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;


