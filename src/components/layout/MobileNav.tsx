
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tractor, Calendar, Package, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Actions principales pour la barre de navigation inférieure
const mainActions = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Équipements', href: '/equipment', icon: Tractor },
  { title: 'Maintenance', href: '/maintenance', icon: Calendar },
  { title: 'Pièces', href: '/parts', icon: Package },
];

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  // Use swipe gestures with touch events
  const handleSwipe = (() => {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: React.TouchEvent) => {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipeGesture();
    };
    
    const handleSwipeGesture = () => {
      const currentIndex = mainActions.findIndex(action => 
        location.pathname === action.href || 
        (action.href !== '/' && location.pathname.startsWith(action.href))
      );
      
      if (currentIndex === -1) return;
      
      // Swipe right to left: next page
      if (touchEndX < touchStartX - 100 && currentIndex < mainActions.length - 1) {
        navigate(mainActions[currentIndex + 1].href);
      }
      
      // Swipe left to right: previous page
      if (touchEndX > touchStartX + 100 && currentIndex > 0) {
        navigate(mainActions[currentIndex - 1].href);
      }
    };
    
    return { handleTouchStart, handleTouchEnd };
  })();
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex justify-around items-center h-16"
      onTouchStart={handleSwipe.handleTouchStart}
      onTouchEnd={handleSwipe.handleTouchEnd}
    >
      {mainActions.map((action) => {
        const isActive = location.pathname === action.href || 
                        (action.href !== '/' && location.pathname.startsWith(action.href));
        
        return (
          <button
            key={action.title}
            className={`flex flex-col items-center justify-center w-1/4 h-full py-1 ${
              isActive ? 'text-agri-primary' : 'text-gray-600'
            }`}
            onClick={() => navigate(action.href)}
            aria-label={action.title}
          >
            <action.icon className={`h-5 w-5 ${isActive ? 'text-agri-primary' : 'text-gray-600'}`} />
            <span className="text-xs mt-1">{action.title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileNav;
