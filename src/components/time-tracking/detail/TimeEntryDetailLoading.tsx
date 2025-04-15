
import React from 'react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';

export const TimeEntryDetailLoading = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Chargement des détails...</p>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
