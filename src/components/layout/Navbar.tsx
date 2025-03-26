
import React from 'react';
import {
  LayoutDashboard,
  Tractor,
  Wrench,
  Package,
  ClipboardList,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';

interface NavItem {
  title: string;
  href: string;
  icon: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
      title?: string | undefined;
      titleId?: string | undefined;
    } & React.RefAttributes<SVGSVGElement>
  >;
}

export const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Équipements",
    href: "/equipment",
    icon: Tractor,
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
  },
  {
    title: "Pièces",
    href: "/parts",
    icon: Package,
  },
  {
    title: "Interventions",
    href: "/interventions",
    icon: ClipboardList,
  },
];

const Navbar: React.FC = () => {
  const { isOpen, close } = useSidebar();

  return (
    <nav className="flex flex-col space-y-0.5">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            `group flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground ${
              isActive
                ? 'bg-secondary text-foreground font-bold'
                : 'text-muted-foreground'
            }`
          }
          onClick={() => isOpen ? close() : null}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
