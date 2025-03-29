
import React, { useState, useCallback, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import EditEquipmentDialog from './dialogs/EditEquipmentDialog';
import { EquipmentItem } from '@/hooks/equipment/useEquipmentFilters';
import EquipmentHeader from './details/EquipmentHeader';
import EquipmentTabs from './details/EquipmentTabs';
import { toast } from 'sonner';

interface EquipmentDetailsProps {
  equipment: EquipmentItem;
  onUpdate?: (updatedEquipment: any) => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDialogClosing, setIsDialogClosing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [localEquipment, setLocalEquipment] = useState(equipment);
  
  // Mettre à jour les données locales quand les props changent
  useEffect(() => {
    setLocalEquipment(equipment);
  }, [equipment]);

  // Optimiser avec useCallback pour réduire les re-rendus
  const handleEquipmentUpdate = useCallback((updatedEquipment: any) => {
    console.log('EquipmentDetails received updated equipment:', updatedEquipment);
    
    // Mise à jour de l'état local pour un retour UI immédiat
    setLocalEquipment(updatedEquipment);
    
    // Appeler le gestionnaire de mise à jour parent si fourni
    if (onUpdate) {
      try {
        onUpdate(updatedEquipment);
      } catch (error) {
        console.error('Error during equipment update:', error);
        toast.error('Échec de la mise à jour de l\'équipement sur le serveur');
      }
    }
    
    // Fermer le dialogue en toute sécurité avec animation
    handleDialogOpenChange(false);
  }, [onUpdate]);
  
  // Gestionnaire d'état de dialogue optimisé
  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      // D'abord marquer comme fermant pour déclencher l'animation
      setIsDialogClosing(true);
      
      // Puis définir l'état réel après la fin de l'animation
      setTimeout(() => {
        setIsEditDialogOpen(false);
        setIsDialogClosing(false);
      }, 300);
    } else {
      setIsEditDialogOpen(true);
    }
  }, []);

  return (
    <div className="space-y-6">
      <EquipmentHeader 
        equipment={localEquipment} 
        onEditClick={() => handleDialogOpenChange(true)} 
      />

      <Separator />
      
      <EquipmentTabs
        equipment={localEquipment}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Dialogue de modification d'équipement - Ne rendre que si nécessaire */}
      {(isEditDialogOpen || isDialogClosing) && (
        <EditEquipmentDialog
          isOpen={isEditDialogOpen && !isDialogClosing}
          onOpenChange={handleDialogOpenChange}
          equipment={localEquipment}
          onSubmit={handleEquipmentUpdate}
        />
      )}
    </div>
  );
};

export default EquipmentDetails;
