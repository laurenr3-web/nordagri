
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white dark:bg-background">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
