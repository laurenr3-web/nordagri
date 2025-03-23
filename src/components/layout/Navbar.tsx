
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Tractor, 
  Wrench, 
  Package, 
  ClipboardCheck, 
  LayoutDashboard,
  Menu,
  X,
  Map,
  Settings
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300",
        "hover:bg-secondary/80",
        active ? "bg-primary/10 text-primary font-medium" : "text-foreground/80"
      )}
    >
      <span className={cn(
        "transition-transform duration-300",
        active ? "scale-110" : ""
      )}>
        {icon}
      </span>
      <span className={cn(
        "transition-all duration-300",
        active ? "translate-x-1" : ""
      )}>
        {label}
      </span>
    </Link>
  );
};

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  return (
    <>
      {isMobile && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full bg-primary text-white shadow-lg"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}
      
      <div className={cn(
        "fixed top-0 left-0 h-full bg-white shadow-subtle z-40 transition-all duration-300 ease-in-out",
        isMobile ? (
          isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"
        ) : "w-64"
      )}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Tractor className="text-primary h-6 w-6" />
            </div>
            <div>
              <h2 className="font-medium text-lg">Agri-ERP</h2>
              <p className="text-xs text-muted-foreground">Insight Platform</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <NavItem 
              to="/" 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={isActive("/")} 
            />
            <NavItem 
              to="/equipment" 
              icon={<Tractor size={20} />} 
              label="Equipment" 
              active={isActive("/equipment")} 
            />
            <NavItem 
              to="/parts" 
              icon={<Package size={20} />} 
              label="Parts Catalog" 
              active={isActive("/parts")} 
            />
            <NavItem 
              to="/maintenance" 
              icon={<Wrench size={20} />} 
              label="Maintenance" 
              active={isActive("/maintenance")} 
            />
            <NavItem 
              to="/interventions" 
              icon={<ClipboardCheck size={20} />} 
              label="Interventions" 
              active={isActive("/interventions")} 
            />
            <NavItem 
              to="/optifield" 
              icon={<Map size={20} />} 
              label="OptiField" 
              active={isActive("/optifield")} 
            />
            <NavItem 
              to="/settings" 
              icon={<Settings size={20} />} 
              label="Settings" 
              active={isActive("/settings")} 
            />
          </nav>
        </div>
      </div>
      
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isMobile ? (
          isOpen ? "ml-0 opacity-50" : "ml-0 opacity-100"
        ) : "ml-64"
      )}>
        {/* Content wrapper for page content */}
      </div>
    </>
  );
};

export default Navbar;
