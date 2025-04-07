
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Menu, Columns3 } from 'lucide-react';
import MobileNav from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/ui/sidebar';
import useFixMobileScrolling from '@/hooks/useFixMobileScrolling';

// Create a context for layout management
import React, { createContext, useContext, useState } from 'react';

// Create the context
const LayoutContext = createContext({
  sidebarCollapsed: false,
  setSidebarCollapsed: (value: boolean) => {},
  showContextPanel: false,
  setShowContextPanel: (value: boolean) => {},
});

// Create a provider component
export const LayoutProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);

  return (
    <LayoutContext.Provider value={{
      sidebarCollapsed,
      setSidebarCollapsed,
      showContextPanel,
      setShowContextPanel
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

// Create a hook for using the context
export const useLayoutContext = () => useContext(LayoutContext);

// Simple context panel component
const ContextPanel = () => {
  return (
    <div className="h-full bg-background border-l p-4">
      <h3 className="text-lg font-medium mb-4">Context Panel</h3>
      <div className="text-sm text-muted-foreground">
        <p>This panel shows context-specific information related to the current view.</p>
      </div>
    </div>
  );
};

export function MainLayout() {
  // Apply mobile scrolling fix automatically
  useFixMobileScrolling();
  
  // Use media queries for responsive design
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  
  // Get layout context for sidebar and context panel state
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    showContextPanel,
    setShowContextPanel
  } = useLayoutContext();
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsMobile(window.innerWidth <= 767);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
                collapsible
                collapsedSize={4}
                onCollapse={() => setSidebarCollapsed(true)}
                onExpand={() => setSidebarCollapsed(false)}
                className="bg-background border-r relative"
              >
                <Sidebar>
                  {/* Sidebar content here */}
                </Sidebar>
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
