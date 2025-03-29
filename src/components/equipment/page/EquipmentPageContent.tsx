
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/ui/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import EquipmentContentSection from './EquipmentContentSection';
import { EquipmentItem, useEquipmentFilters } from '@/hooks/equipment/useEquipmentFilters';

interface EquipmentPageContentProps {
  equipment: EquipmentItem[];
  isLoading: boolean;
}

const EquipmentPageContent: React.FC<EquipmentPageContentProps> = ({
  equipment,
  isLoading
}) => {
  const [currentView, setCurrentView] = useState<string>('grid');
  const navigate = useNavigate();
  
  // Use a ref to track mounting state to prevent state updates on unmounted components
  const isMounted = React.useRef(true);
  
  // Set up filter state with the hook from /hooks/equipment/useEquipmentFilters
  const filterState = useEquipmentFilters(equipment || []);
  
  // Handle clicking on an equipment item
  const handleEquipmentClick = (item: EquipmentItem) => {
    if (isMounted.current) {
      console.log('Equipment clicked, navigating to detail page:', item.id);
      navigate(`/equipment/${item.id}`);
    }
  };

  // Helper function to open add equipment dialog
  const openAddDialog = () => {
    console.log('Opening add equipment dialog');
    const event = new CustomEvent('open-add-equipment-dialog');
    window.dispatchEvent(event);
  };
  
  // Cleanup function to prevent state updates after unmounting
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 p-6">
          <EquipmentContentSection
            equipment={equipment || []}
            isLoading={isLoading}
            filterState={filterState}
            viewState={{
              currentView,
              setCurrentView: (view) => {
                if (isMounted.current) {
                  setCurrentView(view);
                }
              }
            }}
            handleEquipmentClick={handleEquipmentClick}
            openAddDialog={openAddDialog}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EquipmentPageContent;
