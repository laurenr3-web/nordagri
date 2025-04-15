
import React from 'react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
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
            <h1 className="text-4xl font-bold mb-2">Session introuvable</h1>
            <p className="text-lg text-muted-foreground">
              Impossible de trouver les détails de cette session de temps
            </p>
          </div>
          <Button onClick={() => navigate('/time-tracking')}>
            Retour au suivi de temps
          </Button>
        </div>
      </div>
    </SidebarProvider>
  );
};
