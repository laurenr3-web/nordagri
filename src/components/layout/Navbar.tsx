
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
import { useTranslation } from "react-i18next";

// NavLink now supports ARIA for accessibility
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
      role="tab"
      aria-selected={isActive}
      aria-label={label}
      tabIndex={0}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/dashboard',
      icon: <PieChart className="h-5 w-5" aria-hidden="true" />,
      label: t("navbar.dashboard"),
    },
    {
      path: '/equipment',
      icon: <Tractor className="h-5 w-5" aria-hidden="true" />,
      label: t("navbar.equipment"),
    },
    {
      path: '/maintenance',
      icon: <Wrench className="h-5 w-5" aria-hidden="true" />,
      label: t("navbar.maintenance"),
    },
    {
      path: '/parts',
      icon: <Folder className="h-5 w-5" aria-hidden="true" />,
      label: t("navbar.parts"),
    },
    {
      path: '/interventions',
      icon: <MessageSquare className="h-5 w-5" aria-hidden="true" />,
      label: t("navbar.interventions"),
    },
    {
      path: '/time-tracking',
      icon: <Clock className="h-5 w-5" aria-hidden="true" />,
      label: t("navbar.time"),
    },
    {
      path: '/settings',
      icon: <Settings className="h-5 w-5" aria-hidden="true" />,
      label: t("navbar.settings"),
    },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-4" role="navigation" aria-label="Barre latérale principale">
      <Link to="/" className="flex items-center gap-2 px-3 py-4" aria-label="Accueil">
        <img
          src="/placeholder.svg"
          alt="Logo"
          className="h-6 w-6"
        />
        <span className="text-xl font-semibold">NordAgri</span>
      </Link>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1" role="tablist">
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
      {!isMobile && (
        <div className="mt-auto p-4 border-t">
          <TimeTracker className="w-full justify-center rounded-lg p-2" />
        </div>
      )}
    </div>
  );
};

export default Navbar;
