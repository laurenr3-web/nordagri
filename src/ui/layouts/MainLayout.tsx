
import React from 'react';
import { Sidebar, SidebarProvider, SidebarContent } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children
}) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
        <Sidebar className="border-r">
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
