
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useMedia } from 'react-use';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Menu, Columns3 } from 'lucide-react';
import Sidebar from '../navigation/Sidebar';
import MobileNav from '@/components/layout/MobileNav'; 
import { useLayoutContext } from '@/contexts/LayoutContext';
import ContextPanel from '../panels/ContextPanel';
import useFixMobileScrolling from '@/hooks/useFixMobileScrolling';

export function MainLayout() {
  // Appliquer le correctif de défilement mobile automatiquement
  useFixMobileScrolling();
  
  const isDesktop = useMedia('(min-width: 1024px)', true);
  const isMobile = useMedia('(max-width: 767px)', false);
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    showContextPanel, 
    setShowContextPanel 
  } = useLayoutContext();
  
  // Collapse sidebar by default on smaller screens but not mobile
  useEffect(() => {
    if (!isDesktop && !isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isDesktop, isMobile, setSidebarCollapsed]);

  return (
    <div className="h-screen flex flex-col">
      {/* Main content area with optional sidebars */}
      <div className="flex-1 overflow-hidden flex">
        <ResizablePanelGroup direction="horizontal" className="min-h-screen">
          {/* Sidebar - hidden on mobile */}
          {!isMobile && (
            <>
              <ResizablePanel 
                defaultSize={18} 
                minSize={12}
                maxSize={25}
                collapsible={true}
                collapsedSize={4}
                collapsed={sidebarCollapsed}
                onCollapse={() => setSidebarCollapsed(true)}
                onExpand={() => setSidebarCollapsed(false)}
                className="bg-background border-r relative"
              >
                <Sidebar collapsed={sidebarCollapsed} />
                <div className="absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6 rounded-full shadow-md"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />
            </>
          )}

          {/* Main content area */}
          <ResizablePanel defaultSize={isMobile ? 100 : showContextPanel ? 64 : 82} minSize={40}>
            <ScrollArea className="h-screen pb-16">
              <main className={cn(
                "py-6 px-4 md:px-6 md:py-8 lg:py-10",
                isMobile && "mobile-pb-safe" // Add bottom padding on mobile for navigation
              )}>
                <Outlet />
              </main>
            </ScrollArea>
          </ResizablePanel>

          {/* Right context panel - hidden on mobile and when not needed */}
          {!isMobile && showContextPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={18} minSize={15} maxSize={30}>
                <ContextPanel />
                <div className="absolute top-4 -left-3">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6 rounded-full shadow-md"
                    onClick={() => setShowContextPanel(false)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
        
        {/* Floating button to toggle context panel on mobile */}
        {isMobile && showContextPanel && (
          <div className="fixed bottom-20 right-4 z-40">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={() => setShowContextPanel(!showContextPanel)}
            >
              <Columns3 className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile navigation - only visible on mobile */}
      {isMobile && <MobileNav />}
    </div>
  );
}

export default MainLayout;
