
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { navGroups } from './Navbar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import MaintenanceNotificationsPopover from '../maintenance/notifications/MaintenanceNotificationsPopover';

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  return (
    <>
      {/* Menu dépliant avec bouton en haut à droite */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="fixed top-4 right-4 z-50 rounded-full bg-background/80 backdrop-blur-sm border shadow-md"
            aria-label="Menu principal"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-[85vw] sm:max-w-md p-0">
          <SheetHeader className="border-b p-4 flex justify-between items-center">
            <SheetTitle className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/ec804880-63d5-4999-8bd9-4b853ec3360d.png" 
                alt="Agri ERP" 
                className="h-8 w-auto"
              />
              <span>Agri ERP</span>
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </SheetHeader>
          
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-agri-primary text-white">U</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Utilisateur</div>
                  <div className="text-sm text-muted-foreground">utilisateur@exemple.fr</div>
                </div>
              </div>
              <MaintenanceNotificationsPopover />
            </div>
          </div>
          
          <div className="p-2 overflow-y-auto">
            <div className="flex items-center gap-2 mx-2 mb-4 mt-2">
              <Button className="flex-1" onClick={() => navigate('/search')}>
                <Search className="h-4 w-4 mr-2" />
                Rechercher...
              </Button>
            </div>
            
            {navGroups.map((group, index) => (
              <div key={index} className="mb-6">
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </div>
                <div className="space-y-1 mt-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href || 
                      (item.href !== '/' && location.pathname.startsWith(item.href));
                    
                    // Utiliser les mêmes libellés en français que dans la barre latérale
                    let label = item.title;
                    if (item.title === "Home" || item.title === "Dashboard") label = "Tableau de bord";
                    else if (item.title === "Equipment") label = "Équipements";
                    else if (item.title === "Maintenance") label = "Maintenance";
                    else if (item.title === "Interventions") label = "Interventions";
                    else if (item.title === "Parts") label = "Pièces";
                    else if (item.title === "Settings") label = "Paramètres";
                    
                    return (
                      <Button
                        key={item.href}
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start font-normal",
                          isActive ? "bg-primary text-primary-foreground" : ""
                        )}
                        onClick={() => {
                          navigate(item.href);
                          setOpen(false);
                        }}
                      >
                        <item.icon className="mr-2 h-5 w-5" />
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
            
            <div className="border-t mt-6 pt-4">
              <Button variant="outline" className="w-full justify-start text-destructive" onClick={() => setOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Déconnexion
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Bouton de recherche flottant en bas à droite */}
      <Button 
        variant="secondary" 
        size="icon" 
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg"
        onClick={() => navigate('/search')}
        aria-label="Recherche"
      >
        <Search className="h-5 w-5" />
      </Button>
    </>
  );
};

export default MobileNav;
