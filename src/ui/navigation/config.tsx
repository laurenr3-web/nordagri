
import React from 'react';
import { 
  LayoutDashboard, Settings, 
  Tractor, Wrench, 
  Clock, Menu, Package, 
  Hammer, Scroll, FlaskConical 
} from 'lucide-react';

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  children?: NavigationItem[];
}

export const navigationConfig: NavigationItem[] = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Équipements",
    href: "/equipment",
    icon: <Tractor className="h-5 w-5" />,
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    title: "Temps",
    href: "/time-tracking",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    title: "Pièces",
    href: "/parts",
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "Interventions",
    href: "/interventions",
    icon: <Hammer className="h-5 w-5" />,
  },
  {
    title: "Observations Terrain",
    href: "/observations",
    icon: <FlaskConical className="h-5 w-5" />,
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];
