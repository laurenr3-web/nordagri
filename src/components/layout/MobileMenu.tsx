
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Wrench, Tractor, Folder, PieChart, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeTracker } from '@/components/time-tracking/TimeTracker';
import { useTranslation } from "react-i18next";

const MobileMenu = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/dashboard',
      icon: <PieChart className="h-5 w-5" aria-hidden="true" />,
      label: t("mobilemenu.dashboard"),
    },
    {
      path: '/equipment',
      icon: <Tractor className="h-5 w-5" aria-hidden="true" />,
      label: t("mobilemenu.equipment"),
    },
    {
      path: '/maintenance',
      icon: <Wrench className="h-5 w-5" aria-hidden="true" />,
      label: t("mobilemenu.maintenance"),
    },
    {
      path: '/parts',
      icon: <Folder className="h-5 w-5" aria-hidden="true" />,
      label: t("mobilemenu.parts"),
    },
    {
      path: '/time-tracking',
      icon: <Clock className="h-5 w-5" aria-hidden="true" />,
      label: t("mobilemenu.time"),
    },
    {
      path: '/settings',
      icon: <Settings className="h-5 w-5" aria-hidden="true" />,
      label: t("mobilemenu.settings"),
    },
  ];

  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <>
      <div className="lg:hidden px-2 py-2" aria-label={t("mobilemenu.time")}>
        <TimeTracker />
      </div>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden"
        role="navigation"
        aria-label="Menu principal mobile"
      >
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center px-1 transition-colors min-h-[64px]',
                isActive(item.path) 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              )}
              role="tab"
              aria-selected={isActive(item.path)}
              aria-label={item.label}
              tabIndex={0}
            >
              {item.icon}
              <span className="text-[10px] sm:text-xs mt-1 truncate w-full text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default MobileMenu;
