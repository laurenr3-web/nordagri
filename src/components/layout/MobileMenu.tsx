
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Wrench, Tractor, Folder, PieChart, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeTracker } from '@/components/time-tracking/TimeTracker';

const MobileMenu = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/dashboard',
      icon: <PieChart className="h-6 w-6" />,
      label: 'Dashboard',
    },
    {
      path: '/equipment',
      icon: <Tractor className="h-6 w-6" />,
      label: 'Équipement',
    },
    {
      path: '/maintenance',
      icon: <Wrench className="h-6 w-6" />,
      label: 'Maintenance',
    },
    {
      path: '/parts',
      icon: <Folder className="h-6 w-6" />,
      label: 'Pièces',
    },
    {
      path: '/time-tracking',
      icon: <Clock className="h-6 w-6" />,
      label: 'Temps',
    },
    {
      path: '/settings',
      icon: <Settings className="h-6 w-6" />,
      label: 'Paramètres',
    },
  ];

  // Masquer le menu sur la page de connexion
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <>
      {/* TimeTrackingButton flottante */}
      <div className="lg:hidden">
        <TimeTracker />
      </div>
      
      {/* Menu de navigation mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden">
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center px-2 transition-colors',
                isActive(item.path) 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default MobileMenu;
