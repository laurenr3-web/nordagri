
import React from 'react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import EquipmentOverview from './EquipmentOverview';

interface EquipmentTabsProps {
  equipment: EquipmentItem;
}

// Note: Ce composant est simplifié pour ne montrer que l'aperçu, 
// sans les onglets d'historique et de performance
const EquipmentTabs: React.FC<EquipmentTabsProps> = ({ equipment }) => {
  return <EquipmentOverview equipment={equipment} />;
};

export default EquipmentTabs;
