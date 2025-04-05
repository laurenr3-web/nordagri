
import React, { useState, useEffect } from 'react';
import EquipmentContentSection from './EquipmentContentSection';
import { useNavigate } from 'react-router-dom';
import { useEquipmentFilters, EquipmentItem } from '../hooks/useEquipmentFilters';
import { toast } from 'sonner';

interface EquipmentPageContentProps {
  equipment: EquipmentItem[];
  isLoading: boolean;
}

const EquipmentPageContent: React.FC<EquipmentPageContentProps> = ({ 
  equipment, 
  isLoading 
}) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('list'); // Changed default from 'grid' to 'list'
  const filterState = useEquipmentFilters(equipment);
  const [error, setError] = useState<string | null>(null);
  
  // Load saved view preference on component mount
  useEffect(() => {
    try {
      const savedView = localStorage.getItem('equipmentViewPreference');
      if (savedView && (savedView === 'grid' || savedView === 'list')) {
        setCurrentView(savedView);
      } else {
        // Set a default value of 'list' if nothing is saved
        localStorage.setItem('equipmentViewPreference', 'list');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      setError('Impossible de charger vos préférences d\'affichage');
      // Use list view as default in case of error
      setCurrentView('list');
    }
  }, []);
  
  // Save view preference when it changes
  useEffect(() => {
    try {
      localStorage.setItem('equipmentViewPreference', currentView);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des préférences:', error);
      toast.error('Impossible d\'enregistrer vos préférences d\'affichage');
    }
  }, [currentView]);
  
  const handleEquipmentClick = (equipment: EquipmentItem) => {
    navigate(`/equipment/${equipment.id}`);
  };
  
  // Si une erreur se produit, on affiche quand même le contenu avec la vue par défaut
  if (error) {
    toast.error(error, { id: 'equipment-view-error' });
  }
  
  return (
    <div className="flex flex-col flex-1 h-full">
      <EquipmentContentSection
        equipment={equipment}
        isLoading={isLoading}
        filterState={filterState}
        viewState={{ currentView, setCurrentView }}
        handleEquipmentClick={handleEquipmentClick}
      />
    </div>
  );
};

export default EquipmentPageContent;
