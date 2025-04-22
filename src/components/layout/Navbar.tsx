
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Settings, Tool, Tractor, Clock, FileText, Shield, Home, Server, BarChart2 
} from 'lucide-react';
import { useModules } from '@/providers/ModulesProvider';

export default function Navbar() {
  const location = useLocation();
  const { canAccess } = useModules();

  const menuItems = [
    { 
      icon: <Home className="h-5 w-5" />, 
      label: 'Tableau de bord', 
      href: '/dashboard', 
      moduleKey: null  // Toujours visible
    },
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
      icon: <Shield className="h-5 w-5" />, 
      label: 'Pièces', 
      href: '/parts',
      moduleKey: 'show_parts'
    },
    { 
      icon: <Clock className="h-5 w-5" />, 
      label: 'Suivi du temps', 
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
      icon: <BarChart2 className="h-5 w-5" />, 
      label: 'Rapports', 
      href: '/reports',
      moduleKey: 'show_reports'
    },
    { 
      icon: <Settings className="h-5 w-5" />, 
      label: 'Paramètres', 
      href: '/settings',
      moduleKey: null  // Toujours visible
    },
  ];

  // Filtrer les modules non activés
  const visibleMenuItems = menuItems.filter(
    item => item.moduleKey === null || canAccess(item.moduleKey as any)
  );

  return (
    <div className="flex flex-col w-full py-4 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center justify-center mb-8">
        <h2 className="text-xl font-bold text-green-600">NordAgri</h2>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 px-2">
        {visibleMenuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="hidden lg:block">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
