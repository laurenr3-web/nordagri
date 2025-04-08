
import React, { useEffect, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useMedia } from 'react-use';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Columns3 } from 'lucide-react';
import MobileNav from '@/components/layout/MobileNav';
import { useLayoutContext } from './MainLayoutContext';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';

// Define props interface for MainLayout
interface MainLayoutProps {
  children?: ReactNode;
  rightPanel?: ReactNode;
  breadcrumbs?: {
    label: string;
    path: string;
  }[];
}

// Simple context panel component
const ContextPanel = () => {
  return (
    <div className="h-full bg-background border-l p-4">
      <h3 className="text-lg font-medium mb-4">Informations contextuelles</h3>
      <div className="text-sm text-muted-foreground">
        <p>Ce panneau affiche des informations spécifiques au contexte liées à la vue actuelle.</p>
      </div>
    </div>
  );
};

export function MainLayout({ children, rightPanel, breadcrumbs }: MainLayoutProps = {}) {
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
                collapsible
                collapsedSize={4}
                onCollapse={() => setSidebarCollapsed(true)}
                onExpand={() => setSidebarCollapsed(false)}
                className="relative"
              >
                <div className="absolute inset-0">
                  <SidebarProvider>
                    <Sidebar className="h-full" variant="sidebar">
                      <Navbar />
                    </Sidebar>
                  </SidebarProvider>
                </div>
                <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6 rounded-full shadow-md"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    aria-label={sidebarCollapsed ? "Déplier le menu" : "Replier le menu"}
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
            <ScrollArea className="h-screen pb-16 bg-background">
              <main className={cn(
                "py-6 px-6 md:px-8 md:py-8 lg:py-10", // Increased padding
                isMobile && "mobile-pb-safe" // Add bottom padding on mobile for navigation
              )}>
                {children || <Outlet />}
              </main>
            </ScrollArea>
          </ResizablePanel>

          {/* Right context panel - hidden on mobile and when not needed */}
          {!isMobile && showContextPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={18} minSize={15} maxSize={30}>
                {rightPanel || <ContextPanel />}
                <div className="absolute top-4 -left-3">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6 rounded-full shadow-md"
                    onClick={() => setShowContextPanel(false)}
                    aria-label="Fermer le panneau contextuel"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
        
        {/* Floating button to toggle context panel */}
        {showContextPanel && isMobile && (
          <div className="fixed bottom-20 right-4 z-40">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={() => setShowContextPanel(!showContextPanel)}
              aria-label="Afficher/masquer le panneau contextuel"
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
