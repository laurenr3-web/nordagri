
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, Wrench, Tractor, Folder, PieChart, Clock, FileText } from 'lucide-react';
import { TimeTracker } from '@/components/time-tracking/TimeTracker';
import { useTranslation } from "react-i18next";
import { ExpandableTabs } from '@/components/ui/expandable-tabs';

const MobileMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (location.pathname === '/auth') {
    return null;
  }

  const navItems = [
    {
      title: t("mobilemenu.dashboard"),
      icon: PieChart,
      path: '/dashboard',
    },
    {
      title: t("mobilemenu.equipment"),
      icon: Tractor,
      path: '/equipment',
    },
    {
      title: t("mobilemenu.maintenance"),
      icon: Wrench,
      path: '/maintenance',
    },
    {
      title: t("mobilemenu.parts"),
      icon: Folder,
      path: '/parts',
    },
    {
      title: t("mobilemenu.interventions"), 
      icon: FileText,
      path: '/interventions',
    },
    {
      title: t("mobilemenu.time"),
      icon: Clock,
      path: '/time-tracking',
    },
    {
      title: t("mobilemenu.settings"),
      icon: Settings,
      path: '/settings',
    },
  ];

  const handleTabClick = (path: string | undefined) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <>
      <div className="lg:hidden" aria-label={t("mobilemenu.time")}>
        <TimeTracker />
      </div>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden p-2"
        role="navigation"
        aria-label="Menu principal mobile"
      >
        <ExpandableTabs 
          tabs={navItems}
          activeColor="text-primary"
          currentPath={location.pathname}
          onTabClick={handleTabClick}
          className="w-full justify-center"
        />
      </nav>
    </>
  );
};

export default MobileMenu;
