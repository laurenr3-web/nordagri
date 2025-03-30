
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { navItems } from './Navbar';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileMenu = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Only render the mobile menu on mobile devices
  if (!isMobile) return null;
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 z-50 md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] p-0">
        <div className="flex flex-col p-4 space-y-2">
          <div className="text-xl font-bold mb-4 p-2">Agri ERP Insight</div>
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost" 
              className="justify-start w-full text-left hover:bg-secondary"
              onClick={() => {
                navigate(item.href);
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
