import React from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Tractor,
  Calendar,
  Box as BoxIcon,
  ScrollText as ScrollIcon,
  Settings,
} from "lucide-react";

import { UserMenu } from "@/components/user-menu";
import MaintenanceNotificationsPopover from '../maintenance/notifications/MaintenanceNotificationsPopover';

const Navbar = () => {
  const currentPath = usePathname() || "";

  return (
    <div>
      <div className="flex h-16 items-center px-6 border-b">
        <a className="flex items-center gap-2" href="/">
          <img
            src="/lovable-uploads/ec804880-63d5-4999-8bd9-4b853ec3360d.png"
            alt="Agri ERP Insight"
            className="h-7 w-auto"
          />
          <span className="text-xl font-bold">Agri ERP</span>
        </a>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex">
            <MaintenanceNotificationsPopover />
          </div>
          <UserMenu />
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          <a
            href="/"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              currentPath === "/" ? "bg-secondary text-primary" : "text-muted-foreground"
            } transition-all hover:text-primary`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Tableau de bord
          </a>
          <a
            href="/equipment"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              currentPath.includes("equipment") ? "bg-secondary text-primary" : "text-muted-foreground"
            } transition-all hover:text-primary`}
          >
            <Tractor className="h-4 w-4" />
            Équipements
          </a>
          <a
            href="/maintenance"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              currentPath.includes("maintenance") ? "bg-secondary text-primary" : "text-muted-foreground"
            } transition-all hover:text-primary`}
          >
            <Calendar className="h-4 w-4" />
            Maintenance
          </a>
          <a
            href="/parts"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              currentPath.includes("parts") ? "bg-secondary text-primary" : "text-muted-foreground"
            } transition-all hover:text-primary`}
          >
            <BoxIcon className="h-4 w-4" />
            Pièces
          </a>
          <a
            href="/interventions"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              currentPath.includes("interventions") ? "bg-secondary text-primary" : "text-muted-foreground"
            } transition-all hover:text-primary`}
          >
            <ScrollIcon className="h-4 w-4" />
            Interventions
          </a>
          <a
            href="/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              currentPath.includes("settings") ? "bg-secondary text-primary" : "text-muted-foreground"
            } transition-all hover:text-primary`}
          >
            <Settings className="h-4 w-4" />
            Paramètres
          </a>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
