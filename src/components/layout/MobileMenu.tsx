
import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Settings, Tool, Tractor, Clock, FileText, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModules } from '@/providers/ModulesProvider';

export default function MobileMenu() {
  const location = useLocation();
  const { canAccess } = useModules();
  
  const menuItems = [
    { 
      icon: <Tractor className="h-5 w-5" />, 
      label: 'Équipements', 
      href: '/equipment',
      moduleKey: 'show_equipment'
    },
    { 
      icon: <Tool className="h-5 w-5" />, 
      label: 'Maintenance', 
      href: '/maintenance',
      moduleKey: 'show_maintenance' 
    },
    { 
      icon: <Clock className="h-5 w-5" />, 
      label: 'Temps', 
      href: '/time-tracking',
      moduleKey: 'show_time_tracking'
    },
    { 
      icon: <FileText className="h-5 w-5" />, 
      label: 'Interventions', 
      href: '/interventions',
      moduleKey: 'show_interventions'
    },
    { 
      icon: <Shield className="h-5 w-5" />, 
      label: 'Pièces', 
      href: '/parts',
      moduleKey: 'show_parts'
    },
    { 
      icon: <Settings className="h-5 w-5" />, 
      label: 'Paramètres', 
      href: '/settings',
      moduleKey: null // Toujours visible
    },
  ];

  // Filtrer les modules non activés
  const visibleMenuItems = menuItems.filter(
    item => item.moduleKey === null || canAccess(item.moduleKey as any)
  );

  return (
    <div className="btm-nav md:hidden bg-white border-t border-gray-200 z-50">
      {visibleMenuItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) => cn(
            'text-xs flex flex-col items-center justify-center transition-colors',
            isActive 
              ? 'text-green-700 border-t-2 border-green-700' 
              : 'text-gray-500 hover:text-green-600'
          )}
        >
          {item.icon}
          <span className="text-[10px] mt-1">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
