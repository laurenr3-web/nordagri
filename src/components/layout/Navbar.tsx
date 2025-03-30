
import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Tractor,
  Calendar,
  Box as BoxIcon,
  ScrollText as ScrollIcon,
  Settings,
} from "lucide-react";

import MaintenanceNotificationsPopover from '../maintenance/notifications/MaintenanceNotificationsPopover';

// Export navItems for use in MobileMenu
export const navItems = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard
  },
  {
    title: "Équipements",
    href: "/equipment",
    icon: Tractor
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    icon: Calendar
  },
  {
    title: "Pièces",
    href: "/parts",
    icon: BoxIcon
  },
  {
    title: "Interventions",
    href: "/interventions",
    icon: ScrollIcon
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: Settings
  }
];

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname || "";

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
          <div className="ml-2">
            {/* Placeholder for UserMenu */}
            <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium">U</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                currentPath === item.href || 
                (item.href !== "/" && currentPath.includes(item.href)) 
                  ? "bg-secondary text-primary" 
                  : "text-muted-foreground"
              } transition-all hover:text-primary`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
