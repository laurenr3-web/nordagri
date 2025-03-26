
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/theme-provider';
import { Analytics } from './components/analytics';

// Pages
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Maintenance from './pages/Maintenance';
import Parts from './pages/Parts';
import Interventions from './pages/Interventions';
import NotFound from './pages/NotFound';

// Providers
import { SidebarProvider } from './components/ui/sidebar';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <SidebarProvider>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/parts" element={<Parts />} />
              <Route path="/interventions" element={<Interventions />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
          <Toaster />
        </Router>
        <Analytics />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
