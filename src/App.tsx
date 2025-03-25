
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Equipment from "./pages/Equipment";
import EquipmentDetail from "./pages/EquipmentDetail";
import Parts from "./pages/Parts";
import Maintenance from "./pages/Maintenance";
import Interventions from "./pages/Interventions";
import OptiField from "./pages/OptiField";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { supabase } from "./integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useDataInitialization } from "./hooks/useDataInitialization";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes
      retry: 2,
    },
  },
});

// Component to initialize data
const DataInitializer = ({ children }: { children: React.ReactNode }) => {
  const { loading, error } = useDataInitialization();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">Initializing application data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
          <h3 className="text-red-800 font-medium">Error Initializing Data</h3>
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authAttempts, setAuthAttempts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event);
        setSession(session);
        setUser(session?.user || null);
        
        // Log auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log(`Auth event ${event} at ${new Date().toISOString()}`);
        }
      }
    );
    
    // THEN check for existing session
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Session retrieval error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Protected route component with loading state
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen flex-col gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Verifying your session...</p>
        </div>
      );
    }
    
    if (!session) {
      return <Navigate to="/auth" replace />;
    }
    
    // If authenticated, initialize data
    return <DataInitializer>{children}</DataInitializer>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/equipment" element={
              <ProtectedRoute>
                <Equipment />
              </ProtectedRoute>
            } />
            <Route path="/equipment/:id" element={
              <ProtectedRoute>
                <EquipmentDetail />
              </ProtectedRoute>
            } />
            <Route path="/parts" element={
              <ProtectedRoute>
                <Parts />
              </ProtectedRoute>
            } />
            <Route path="/maintenance" element={
              <ProtectedRoute>
                <Maintenance />
              </ProtectedRoute>
            } />
            <Route path="/interventions" element={
              <ProtectedRoute>
                <Interventions />
              </ProtectedRoute>
            } />
            <Route path="/optifield" element={
              <ProtectedRoute>
                <OptiField />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
