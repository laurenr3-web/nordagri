
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Settings, 
  Wrench, 
  Tractor, 
  Folder, 
  MessageSquare, 
  PieChart,
  Clock 
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { TimeTracker } from '@/components/time-tracking/TimeTracker';

// Shared component for a navigation link
const NavLink = ({ path, icon, label, isActive }: { 
  path: string; 
  icon: React.ReactNode; 
  label: string;
  isActive: boolean;
}) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        isActive 
          ? "bg-secondary text-secondary-foreground" 
          : "text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/dashboard',
      icon: <PieChart className="h-5 w-5" />,
      label: 'Dashboard',
    },
    {
      path: '/equipment',
      icon: <Tractor className="h-5 w-5" />,
      label: 'Équipement',
    },
    {
      path: '/maintenance',
      icon: <Wrench className="h-5 w-5" />,
      label: 'Maintenance',
    },
    {
      path: '/parts',
      icon: <Folder className="h-5 w-5" />,
      label: 'Pièces',
    },
    {
      path: '/interventions',
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Interventions',
    },
    {
      path: '/time-tracking',
      icon: <Clock className="h-5 w-5" />,
      label: 'Suivi du temps',
    },
    {
      path: '/settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Paramètres',
    },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-4">
      <Link to="/" className="flex items-center gap-2 px-3 py-4">
        <img
          src="/placeholder.svg"
          alt="Logo"
          className="h-6 w-6"
        />
        <span className="text-xl font-semibold">NordAgri</span>
      </Link>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              path={item.path} 
              icon={item.icon} 
              label={item.label}
              isActive={isActive(item.path)}
            />
          ))}
        </nav>
      </div>
      
      {/* TimeTracker affiché uniquement sur desktop */}
      {!isMobile && (
        <div className="mt-auto p-4 border-t">
          <TimeTracker className="w-full justify-center rounded-lg p-2" />
        </div>
      )}
    </div>
  );
};

export default Navbar;
