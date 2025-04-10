
import React from 'react';
import { Outlet } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import Navbar from '@/components/layout/Navbar';
import { useLayoutContext } from '@/ui/layouts/MainLayoutContext';
import { Sidebar, SidebarProvider, SidebarContent } from '@/components/ui/sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { UserMenu } from '@/components/layout/UserMenu';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Main layout component for the application
 */
const MainLayout: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed, showContextPanel, setShowContextPanel } = useLayoutContext();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider 
      defaultOpen={!sidebarCollapsed} 
      open={!sidebarCollapsed} 
      onOpenChange={(open) => setSidebarCollapsed(!open)}
      className="w-full"
    >
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar className="h-full border-r border-border">
            <SidebarContent>
              {/* Sidebar content will go here */}
              <div className="p-4">
                <h3 className="text-lg font-medium">Navigation</h3>
                <p className="text-sm text-muted-foreground">Sidebar content goes here</p>
              </div>
            </SidebarContent>
          </Sidebar>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top Navigation */}
          <Navbar />

          {/* Main Content with Resizable Panels */}
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Main Content Panel */}
            <ResizablePanel defaultSize={80} minSize={50}>
              <ScrollArea className="h-full">
                <main className="flex-1 p-4">
                  <Outlet />
                </main>
              </ScrollArea>
            </ResizablePanel>

            {/* Optional Context Panel */}
            {showContextPanel && (
              <>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                  <ScrollArea className="h-full border-l">
                    <div className="p-4">
                      <h3 className="text-lg font-medium mb-2">Context Panel</h3>
                      <p className="text-muted-foreground">
                        Additional information and context for the current view can be displayed here.
                      </p>
                    </div>
                  </ScrollArea>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>

          {/* Mobile Navigation (Bottom) */}
          {isMobile && <MobileNav />}
        </div>

        {/* User Menu (Fixed Position) */}
        <UserMenu />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
