
import React, { useState } from 'react';
import { Sidebar, SidebarProvider, SidebarContent, SidebarTrigger, SidebarToggleButton } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDrawerMenu } from '@/components/layout/MobileDrawerMenu';
import { MobileNav } from '@/components/layout/MobileNav';
import { columns3 } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  showBreadcrumbs?: boolean;
  breadcrumbs?: {label: string, path: string}[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  rightPanel,
  showBreadcrumbs = true,
  breadcrumbs,
}) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  
  // Generate breadcrumbs based on the current path if not provided
  const generatedBreadcrumbs = breadcrumbs || (() => {
    const paths = location.pathname.split('/').filter(path => path);
    let currentPath = '';
    
    return [
      { label: 'Accueil', path: '/' },
      ...paths.map(path => {
        currentPath += `/${path}`;
        return {
          label: path.charAt(0).toUpperCase() + path.slice(1),
          path: currentPath
        };
      })
    ];
  })();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden overflow-x-hidden bg-bg-light">
        {!isMobile ? (
          <Sidebar className="border-r border-sidebar-border bg-agri-dark">
            <SidebarContent>
              <Navbar />
            </SidebarContent>
          </Sidebar>
        ) : (
          <MobileDrawerMenu />
        )}
        
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top navigation bar for global actions */}
          {!isMobile && (
            <div className="border-b h-14 flex items-center px-4 bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60 z-20">
              <div className="flex-1">
                {showBreadcrumbs && generatedBreadcrumbs.length > 1 && (
                  <Breadcrumb>
                    <BreadcrumbList>
                      {generatedBreadcrumbs.map((item, index) => (
                        <React.Fragment key={item.path}>
                          <BreadcrumbItem>
                            <BreadcrumbLink href={item.path}>
                              {item.label}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          {index < generatedBreadcrumbs.length - 1 && (
                            <BreadcrumbSeparator />
                          )}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                {rightPanel && (
                  <button 
                    onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                    className="p-2 rounded hover:bg-accent"
                  >
                    <columns3 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div className="flex flex-1 overflow-hidden">
            <div className={cn(
              "flex-1 overflow-auto transition-all duration-300",
              isMobile ? "pb-16" : ""
            )}>
              {children}
            </div>
            
            {rightPanel && !isMobile && (
              <div className={cn(
                "border-l bg-muted/10 overflow-auto transition-all duration-300",
                isRightPanelOpen ? "w-80" : "w-0"
              )}>
                {isRightPanelOpen && rightPanel}
              </div>
            )}
          </div>
          
          {isMobile && <MobileNav />}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
