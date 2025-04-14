
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger 
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { navItems } from './Navbar';

const MobileMenu = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  
  if (!isMobile) return null;
  
  return (
    <Drawer open={open} onOpenChange={setOpen} direction="top">
      <DrawerTrigger asChild>
        <button
          aria-label="Menu principal"
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-agri-primary text-white flex items-center justify-center shadow-lg"
        >
          <Menu className="h-6 w-6" />
        </button>
      </DrawerTrigger>
      <DrawerContent direction="top" className="p-0 max-h-[85vh] rounded-b-xl">
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
                              (item.href !== '/' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center w-full p-3 rounded-lg mb-1 transition-colors ${
                    isActive 
                      ? 'bg-agri-primary/10 text-agri-primary' 
                      : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-agri-primary' : 'text-gray-600'
                  }`} />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileMenu;
