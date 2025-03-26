
import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSection from '@/components/dashboard/DashboardSection';

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6">
            <DashboardSection />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
