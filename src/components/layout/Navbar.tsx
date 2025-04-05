
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tractor, Calendar, Box as BoxIcon, ScrollText as ScrollIcon, Settings } from "lucide-react";
import MaintenanceNotificationsPopover from '../maintenance/notifications/MaintenanceNotificationsPopover';

// Export navItems for use in MobileMenu
export const navItems = [{
  title: "Tableau de bord",
  href: "/",
  icon: LayoutDashboard
}, {
  title: "Équipements",
  href: "/equipment",
  icon: Tractor
}, {
  title: "Maintenance",
  href: "/maintenance",
  icon: Calendar
}, {
  title: "Pièces",
  href: "/parts",
  icon: BoxIcon
}, {
  title: "Interventions",
  href: "/interventions",
  icon: ScrollIcon
}, {
  title: "Paramètres",
  href: "/settings",
  icon: Settings
}];

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname || "";
  
  return <div className="flex flex-col h-full">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link className="flex items-center gap-2" to="/">
          <img src="/lovable-uploads/ec804880-63d5-4999-8bd9-4b853ec3360d.png" alt="Agri ERP Insight" className="h-8 w-auto" />
          <span className="text-xl font-bold text-white">Agri ERP</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex">
            <MaintenanceNotificationsPopover />
          </div>
          <div className="ml-2">
            {/* Placeholder for UserMenu */}
            <button className="w-8 h-8 rounded-full bg-agri-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-white">U</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-polka mx-0 my-0 py-0 px-0">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map(item => (
            <Link 
              key={item.href} 
              to={item.href} 
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 my-1 transition-all duration-200 ${
                currentPath === item.href || (item.href !== "/" && currentPath.includes(item.href)) 
                  ? "bg-sidebar-accent text-white" 
                  : "text-agri-light hover:bg-sidebar-accent/50 hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${
                currentPath === item.href || (item.href !== "/" && currentPath.includes(item.href)) 
                  ? "text-agri-primary" 
                  : "text-current"
              }`} />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>;
};

export default Navbar;
