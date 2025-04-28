
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import EquipmentDetail from './pages/EquipmentDetail';
import Maintenance from './pages/Maintenance';
import TimeTracking from './pages/TimeTracking';
import Settings from './pages/Settings';
import Parts from './pages/Parts';
import Interventions from './pages/Interventions';
import FieldObservations from './pages/FieldObservations'; // Nouvelle page

// Création du QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/time-tracking" element={<TimeTracking />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/interventions" element={<Interventions />} />
          <Route path="/observations" element={<FieldObservations />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
