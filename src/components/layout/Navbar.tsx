
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tractor, Calendar, Box as BoxIcon, ScrollText as ScrollIcon, Settings, ChevronRight } from "lucide-react";
import MaintenanceNotificationsPopover from '../maintenance/notifications/MaintenanceNotificationsPopover';
import { cn } from '@/lib/utils';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter 
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Groupes de navigation pour une meilleure organisation
export const navGroups = [
  {
    label: "Gestion",
    items: [
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
    ]
  },
  {
    label: "Opérations",
    items: [
      {
        title: "Maintenance",
        href: "/maintenance",
        icon: Calendar
      },
      {
        title: "Interventions",
        href: "/interventions",
        icon: ScrollIcon
      },
      {
        title: "Pièces",
        href: "/parts",
        icon: BoxIcon
      },
    ]
  },
  {
    label: "Système",
    items: [
      {
        title: "Paramètres",
        href: "/settings",
        icon: Settings
      },
    ]
  },
];

// Liste plate pour les composants qui n'utilisent pas les groupes
export const navItems = navGroups.flatMap(group => group.items);

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname || "";
  
  // Fonction pour gérer les erreurs de navigation
  const handleNavigation = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error("Erreur de navigation:", error);
      toast.error("Navigation impossible. Veuillez rafraîchir la page.");
    }
  };
  
  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatar.png" alt="Photo de profil" />
            <AvatarFallback className="bg-agri-primary text-white">U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link to="/profile" className="flex w-full items-center">Profil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/settings" className="flex w-full items-center">Paramètres</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button className="flex w-full items-center text-destructive">
            Déconnexion
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="h-16 px-6 flex items-center border-b border-sidebar-border">
        <button 
          className="flex items-center gap-2" 
          onClick={() => handleNavigation("/")}
        >
          <img src="/lovable-uploads/ec804880-63d5-4999-8bd9-4b853ec3360d.png" alt="Agri ERP Insight" className="h-8 w-auto" />
          <span className="text-xl font-bold text-white">Agri ERP</span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex">
            <MaintenanceNotificationsPopover />
          </div>
          <div className="ml-2">
            <UserMenu />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-auto bg-polka mx-0 my-0 py-2 px-3">
        {navGroups.map((group, index) => (
          <SidebarGroup key={index} className="mb-4">
            <SidebarGroupLabel className="px-4 py-1 text-xs uppercase tracking-wider text-sidebar-foreground/50">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    isActive={currentPath === item.href || (item.href !== "/" && currentPath.includes(item.href))}
                    asChild
                  >
                    <button 
                      className="w-full flex items-center"
                      onClick={() => handleNavigation(item.href)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      <ChevronRight className={cn(
                        "ml-auto h-4 w-4 text-sidebar-foreground/30 transition-transform",
                        (currentPath === item.href || (item.href !== "/" && currentPath.includes(item.href))) && 
                        "text-sidebar-accent-foreground transform rotate-90"
                      )} />
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50">
        <div className="flex items-center justify-between">
          <div>Agri ERP v1.0.2</div>
          <div>© 2025</div>
        </div>
      </SidebarFooter>
    </div>
  );
};

export default Navbar;
