
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SidebarContextType {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  preventAutoCollapse: boolean;
  setPreventAutoCollapse: (value: boolean) => void;
}

const initialSidebarContext: SidebarContextType = {
  isExpanded: false,
  setIsExpanded: () => {},
  preventAutoCollapse: false,
  setPreventAutoCollapse: () => {}
};

const SidebarContext = createContext<SidebarContextType>(initialSidebarContext);

export const useSimplifiedSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSimplifiedSidebar must be used within a SimplifiedSidebarProvider');
  }
  return context;
};

export const SimplifiedSidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [preventAutoCollapse, setPreventAutoCollapse] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the sidebar
  useEffect(() => {
    if (!isExpanded) return; // Don't add listener if sidebar is collapsed
    
    const handleClickOutside = (event: MouseEvent) => {
      // Only proceed if sidebarRef is valid
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        // Only collapse the sidebar if auto-collapse isn't prevented
        if (!preventAutoCollapse) {
          setIsExpanded(false);
        }
      }
    };

    // Add the listener with a timeout to prevent immediate execution
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, preventAutoCollapse]);

  const contextValue = {
    isExpanded,
    setIsExpanded,
    preventAutoCollapse,
    setPreventAutoCollapse
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div ref={sidebarRef}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

export const SimplifiedSidebar: React.FC<React.HTMLAttributes<HTMLElement>> = ({ 
  className,
  children,
  ...props
}) => {
  const { isExpanded } = useSimplifiedSidebar();
  
  return (
    <aside
      className={cn(
        "h-screen transition-all duration-300 z-10",
        isExpanded ? "w-64" : "w-16",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
};

export const SidebarToggle: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  children,
  ...props
}) => {
  const { isExpanded, setIsExpanded } = useSimplifiedSidebar();
  
  return (
    <button
      className={cn(
        "p-2 rounded-full focus:outline-none",
        className
      )}
      onClick={() => setIsExpanded(!isExpanded)}
      {...props}
    >
      {children || (
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
          className={cn("transition-transform", isExpanded ? "rotate-180" : "")}
        >
          <path d="M8 4L16 12L8 20" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
};

export const SidebarItem: React.FC<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    icon?: React.ReactNode;
    activeIcon?: React.ReactNode;
    isActive?: boolean;
  }
> = ({ 
  className, 
  children, 
  icon,
  activeIcon,
  isActive = false,
  ...props 
}) => {
  const { isExpanded } = useSimplifiedSidebar();
  
  return (
    <a
      className={cn(
        "flex items-center p-3 my-1 rounded-lg transition-colors",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-accent",
        !isExpanded && "justify-center",
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0">
        {isActive && activeIcon ? activeIcon : icon}
      </div>
      {isExpanded && (
        <span className="ml-3 transition-opacity duration-300">{children}</span>
      )}
    </a>
  );
};

export const SidebarSection: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
  }
> = ({ className, title, children, ...props }) => {
  const { isExpanded } = useSimplifiedSidebar();
  
  return (
    <div className={cn("py-2", className)} {...props}>
      {isExpanded && title && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </h3>
      )}
      <div className="space-y-1 px-2">
        {children}
      </div>
    </div>
  );
};
