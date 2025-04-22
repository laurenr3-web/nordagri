
import React from 'react';
import { Sidebar, SidebarProvider, SidebarContent } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
        <Sidebar className="border-r border-sidebar-border bg-agri-dark">
          <SidebarContent>
            <Navbar />
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 w-full overflow-x-hidden max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="py-6">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
