
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Loader2 } from 'lucide-react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger 
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { navItems } from './Navbar';
import { toast } from 'sonner';
import AppRoutes from '@/core/routes';

const MobileMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  
  // Ne rendre le menu que sur mobile
  if (!isMobile) return null;
  
  // Gestion de la navigation avec gestion simplifiée pour éviter les erreurs
  const handleNavigation = (href: string) => {
    if (location.pathname === href) {
      setOpen(false);
      return;
    }
    
    setLoadingItemId(href);
    setIsNavigating(true);
    setOpen(false);
    
    // Naviguer après un court délai
    setTimeout(() => {
      navigate(href);
      
      // Réinitialiser les états
      setIsNavigating(false);
      setLoadingItemId(null);
    }, 300);
  };
  
  // Réinitialiser les états lors des changements de route
  useEffect(() => {
    setIsNavigating(false);
    setLoadingItemId(null);
  }, [location.pathname]);
  
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          aria-label="Menu principal"
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-agri-primary text-white flex items-center justify-center shadow-lg md:hidden"
          disabled={isNavigating}
        >
          {isNavigating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </DrawerTrigger>
      <DrawerContent className="p-0 max-h-[85vh]">
        <div className="flex flex-col p-4 space-y-1">
          <div className="flex items-center justify-between mb-4 p-2">
            <div className="text-xl font-bold">Agri ERP Insight</div>
            <button 
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== AppRoutes.DASHBOARD && location.pathname.startsWith(item.href));
              const isLoading = loadingItemId === item.href;
              
              return (
                <button
                  key={item.href}
                  disabled={isNavigating}
                  className={`flex items-center w-full p-3 rounded-lg mb-1 transition-colors ${
                    isActive 
                      ? 'bg-agri-primary/10 text-agri-primary' 
                      : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNavigation(item.href)}
                >
                  {isLoading ? (
                    <Loader2 className="mr-3 h-5 w-5 animate-spin text-agri-primary" />
                  ) : (
                    <item.icon className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-agri-primary' : 'text-gray-600'
                    }`} />
                  )}
                  {item.title}
                </button>
              );
            })}
          </div>
          
          <div className="text-xs text-muted-foreground pt-4 text-center border-t mt-4">
            <p>Agri ERP Insight</p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileMenu;
