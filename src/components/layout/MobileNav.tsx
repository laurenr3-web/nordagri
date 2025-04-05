
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Tractor, Calendar, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Actions principales pour la barre de navigation inférieure
const mainActions = [
  { title: 'Accueil', href: '/', icon: Home },
  { title: 'Équipements', href: '/equipment', icon: Tractor },
  { title: 'Maintenance', href: '/maintenance', icon: Calendar },
  { title: 'Paramètres', href: '/settings', icon: Settings },
];

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex justify-around items-center h-16">
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
