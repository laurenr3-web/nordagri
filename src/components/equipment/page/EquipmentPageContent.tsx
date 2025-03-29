
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EquipmentHeader from '../display/EquipmentHeader';
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
  
  // Set up filter state
  const filterState = useEquipmentFilters(equipment);
  
  // Handle clicking on an equipment item
  const handleEquipmentClick = (item: EquipmentItem) => {
    if (isMounted.current) {
      console.log('Equipment clicked, navigating to detail page:', item.id);
      navigate(`/equipment/${item.id}`);
    }
  };
  
  // Cleanup function to prevent state updates after unmounting
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
      <div className="max-w-7xl mx-auto">
        <EquipmentContentSection
          equipment={equipment}
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
        />
      </div>
    </div>
  );
};

export default EquipmentPageContent;
