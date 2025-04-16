
import React from 'react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TimeEntryDetailError = () => {
  const navigate = useNavigate();
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="text-center mb-6">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h1 className="text-4xl font-bold mb-2">Session introuvable</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Impossible de trouver les détails de cette session de temps.
              <br />
              La session pourrait avoir été supprimée ou vous n'avez pas les permissions nécessaires pour y accéder.
            </p>
          </div>
          <Button onClick={() => navigate('/time-tracking')} size="lg">
            Retour au suivi de temps
          </Button>
        </div>
      </div>
    </SidebarProvider>
  );
};
