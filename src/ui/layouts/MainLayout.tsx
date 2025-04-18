
import React from 'react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarContent } from '@/components/ui/sidebar/sidebar-structure';
import Navbar from '@/components/layout/Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-bg-light">
        <Sidebar className="border-r border-sidebar-border bg-agri-dark">
          <SidebarContent>
            <Navbar />
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
