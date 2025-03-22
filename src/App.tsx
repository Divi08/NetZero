
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
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

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="lg" text="Loading application..." className="border-blue-500" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
              <Route path="/sign-in" element={user ? <Navigate to="/dashboard" /> : <SignIn />} />
              <Route path="/sign-up" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={user ? <Index /> : <Navigate to="/sign-in" />} />
              <Route path="/case/:id" element={user ? <CaseDetail /> : <Navigate to="/sign-in" />} />
              <Route path="/create-case" element={user ? <CreateCase /> : <Navigate to="/sign-in" />} />
              <Route path="/settings" element={user ? <Settings /> : <Navigate to="/sign-in" />} />
              <Route path="/news" element={user ? <News /> : <Navigate to="/sign-in" />} />
              <Route path="/history" element={user ? <History /> : <Navigate to="/sign-in" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </div>
    </QueryClientProvider>
  );
};

export default App;


