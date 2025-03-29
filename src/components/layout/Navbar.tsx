import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart, Settings, Truck, Package, ListChecks } from 'lucide-react';

export const navItems = [
  {
    href: '/',
    title: 'Dashboard',
    icon: Home,
  },
  {
    href: '/equipment',
    title: 'Equipment',
    icon: Truck,
  },
  {
    href: '/maintenance',
    title: 'Maintenance',
    icon: ListChecks,
  },
  {
    href: '/parts',
    title: 'Parts',
    icon: Package,
  },
  {
    href: '/interventions',
    title: 'Interventions',
    icon: BarChart,
  },
  {
    href: '/settings',
    title: 'Settings',
    icon: Settings,
  },
];

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="w-full">
      <div className="px-4 py-4">
        <div className="text-xl font-bold mb-6">Agri ERP Insight</div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
