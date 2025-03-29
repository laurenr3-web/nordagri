
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { navItems } from './Navbar';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileMenu = () => {
  const isMobile = useIsMobile();
  
  // Only render the mobile menu on mobile devices
  if (!isMobile) return null;
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 right-4 z-50">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] p-0">
        <div className="flex flex-col p-4 space-y-2">
          <div className="text-xl font-bold mb-4 p-2">Agri ERP Insight</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex w-full items-center p-2 hover:bg-secondary rounded text-left"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
