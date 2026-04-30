
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { TimeTracker } from '@/components/time-tracking/TimeTracker';
import { useTranslation } from "react-i18next";
import { NetworkStatus } from './NetworkStatus';
import { navGroups, accountItem, type NavItem } from './navConfig';

// NavLink now supports ARIA for accessibility
const NavLink = ({ path, icon, label, isActive, priority }: {
  path: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  priority: 'primary' | 'secondary';
}) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 transition-all",
        priority === 'primary' ? "py-2.5 font-medium" : "py-2 text-sm",
        isActive
          ? priority === 'primary'
            ? "bg-sidebar-accent text-sidebar-primary-foreground ring-1 ring-sidebar-primary/40"
            : "bg-sidebar-accent text-sidebar-accent-foreground"
          : priority === 'primary'
            ? "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
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
    // Exact match for /time-tracking so it does not also light up for /time-tracking/statistics
    if (path === '/time-tracking') {
      return location.pathname === '/time-tracking';
    }
    return location.pathname.startsWith(path);
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const iconClass = item.priority === 'primary' ? 'h-5 w-5' : 'h-4 w-4';
    return (
      <NavLink
        key={item.path}
        path={item.path}
        icon={<Icon className={iconClass} aria-hidden="true" />}
        label={t(item.labelKey)}
        isActive={isActive(item.path)}
        priority={item.priority}
      />
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-4" role="navigation" aria-label="Barre latérale principale">
      <div className="flex items-center justify-between px-3 py-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Accueil">
          <img
            src="/placeholder.svg"
            alt="Logo"
            className="h-6 w-6"
          />
          <span className="text-xl font-semibold">NordAgri</span>
        </Link>
        
        <NetworkStatus />
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="flex flex-col" role="tablist">
          {navGroups.map((group, idx) => (
            <div key={group.id} className={cn(idx === 0 ? 'mt-0' : 'mt-6')}>
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t(group.labelKey)}
              </div>
              <div className="grid gap-1">
                {group.items.map(renderItem)}
              </div>
            </div>
          ))}
          <div className="mt-6 pt-4 border-t border-border/60">
            {renderItem(accountItem)}
          </div>
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
