
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import EquipmentContentSection from './EquipmentContentSection';
import { useNavigate } from 'react-router-dom';
import { useEquipmentFilters, EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentPageContentProps {
  equipment: EquipmentItem[];
  isLoading: boolean;
}

const EquipmentPageContent: React.FC<EquipmentPageContentProps> = ({ 
  equipment, 
  isLoading 
}) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('grid');
  const filterState = useEquipmentFilters(equipment);
  
  const handleEquipmentClick = (equipment: EquipmentItem) => {
    navigate(`/equipment/${equipment.id}`);
  };
  
  return (
    <div className="min-h-screen bg-background pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
      <div className="max-w-7xl mx-auto">
        <Navbar />
        
        <EquipmentContentSection
          equipment={equipment}
          isLoading={isLoading}
          filterState={filterState}
          viewState={{ currentView, setCurrentView }}
          handleEquipmentClick={handleEquipmentClick}
        />
      </div>
    </div>
  );
};

export default EquipmentPageContent;
