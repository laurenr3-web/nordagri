
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Tractor, 
  Calendar, 
  Package, 
  ClipboardList, 
  Settings, 
  Search,
  Bell,
  Menu,
  X,
  User
} from 'lucide-react';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Navigation items for the drawer menu
const navItems = [
  { title: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { title: "Équipements", href: "/equipment", icon: Tractor },
  { title: "Maintenance", href: "/maintenance", icon: Calendar },
  { title: "Pièces", href: "/parts", icon: Package },
  { title: "Interventions", href: "/interventions", icon: ClipboardList },
  { title: "Paramètres", href: "/settings", icon: Settings },
];

export function MobileDrawerMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Close the drawer when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  if (!isMobile) return null;
  
  return (
    <>
      {/* Fixed search button in the bottom right */}
      <Button 
        variant="secondary" 
        size="icon" 
        className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg"
        onClick={() => navigate('/search')}
      >
        <Search className="h-5 w-5" />
      </Button>
      
      {/* Drawer menu trigger */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 right-4 z-50 rounded-full bg-background/80 backdrop-blur-sm border shadow-md"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b pb-2 mb-2">
            <DrawerTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src="/lovable-uploads/ec804880-63d5-4999-8bd9-4b853ec3360d.png" alt="Agri ERP" className="h-8 w-auto" />
                <span className="text-xl font-bold">Agri ERP</span>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 py-2 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 p-2">
              <div className="flex gap-2 items-center w-full">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="search" 
                    placeholder="Recherche..."
                    className="w-full pl-9 pr-4 py-2 rounded-full border focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href));
                
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start text-left font-normal mb-1",
                      isActive ? "bg-primary text-primary-foreground" : ""
                    )}
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                );
              })}
            </div>
            
            <div className="border-t mt-6 pt-6">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Mon Profil
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
