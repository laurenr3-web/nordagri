
import React from 'react';
import { Equipment } from '@/services/supabase/equipmentService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEquipmentParts } from '@/hooks/equipment/useEquipmentParts';
import EditPartForm from '@/components/parts/dialogs/form/EditPartForm';
import EquipmentPartsLoading from './parts/EquipmentPartsLoading';
import EquipmentPartsError from './parts/EquipmentPartsError';
import EquipmentPartsHeader from './parts/EquipmentPartsHeader';
import EquipmentPartsTable from './parts/EquipmentPartsTable';
import EquipmentPartsLowStockWarning from './parts/EquipmentPartsLowStockWarning';
import EquipmentPartsAssociation from './parts/EquipmentPartsAssociation';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';
import { useParts } from '@/hooks/useParts';
import { Part } from '@/types/Part';
import { toast } from 'sonner';

interface EquipmentPartsProps {
  equipment: Equipment | any; // Accept both Equipment and EquipmentItem types
}

const EquipmentParts: React.FC<EquipmentPartsProps> = ({ equipment }) => {
  // Get all parts data
  const { parts: allParts, isLoading, error } = useParts();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPart, setSelectedPart] = React.useState<Part | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = React.useState(false);
  
  // Make sure we have a numeric ID (convert from string if needed)
  const equipmentId = typeof equipment.id === 'string' 
    ? parseInt(equipment.id, 10) 
    : equipment.id;

  console.log('Equipment ID for compatibility check:', equipmentId);
  console.log('All parts loaded:', allParts?.length || 0);

  // Filter parts to only show those compatible with this equipment
  const compatibleParts = React.useMemo(() => {
    if (!allParts || allParts.length === 0) return [];
    
    console.log('Filtering parts for equipment ID:', equipmentId);
    
    return allParts.filter(part => {
      // Make sure compatibility is an array
      const compatibility = Array.isArray(part.compatibility) ? part.compatibility : [];
      
      console.log(`Part ${part.id} (${part.name}) compatibility:`, compatibility);
      
      // Check if this equipment's ID is in the compatibility list
      const isCompatible = compatibility.includes(equipmentId);
      if (isCompatible) {
        console.log(`Part ${part.name} is compatible with equipment ${equipmentId}`);
      }
      return isCompatible;
    });
  }, [allParts, equipmentId]);

  console.log('Compatible parts found:', compatibleParts.length);

  // Further filter parts based on search term
  const filteredParts = React.useMemo(() => {
    if (!searchTerm) return compatibleParts;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return compatibleParts.filter(part => 
      part.name.toLowerCase().includes(lowercasedTerm) ||
      (part.partNumber && part.partNumber.toLowerCase().includes(lowercasedTerm)) ||
      (part.category && part.category.toLowerCase().includes(lowercasedTerm))
    );
  }, [compatibleParts, searchTerm]);

  const handleEditPart = (part: Part) => {
    setSelectedPart(part);
    setIsEditDialogOpen(true);
  };

  const handleAddPart = () => {
    setIsAddPartDialogOpen(true);
  };

  const handlePartUpdated = (updatedPart: Part) => {
    // Close dialog
    setIsEditDialogOpen(false);
    setSelectedPart(null);
    toast.success(`La pièce ${updatedPart.name} a été mise à jour`);
  };

  const handleDeletePart = async (partId: number | string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pièce?')) {
      return;
    }
    
    // Refresh will happen through React Query invalidation
    toast.success("La pièce a été supprimée");
  };

  if (isLoading) {
    return <EquipmentPartsLoading />;
  }

  if (error) {
    return <EquipmentPartsError error={error instanceof Error ? error.message : String(error)} />;
  }

  return (
    <Card>
      <CardHeader>
        <EquipmentPartsHeader 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddPart={handleAddPart}
        />
      </CardHeader>
      <CardContent>
        {/* Section d'association */}
        <EquipmentPartsAssociation 
          equipment={equipment}
          onAddPart={handleAddPart}
        />

        {/* Afficher l'alerte de stock bas si nécessaire */}
        <EquipmentPartsLowStockWarning parts={filteredParts} />
        
        <EquipmentPartsTable 
          parts={filteredParts}
          onEditPart={handleEditPart}
          onDeletePart={handleDeletePart}
        />

        {/* Dialog pour modifier une pièce */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Modifier la pièce
              </DialogTitle>
            </DialogHeader>
            {selectedPart && (
              <EditPartForm 
                part={selectedPart} 
                onSubmit={handlePartUpdated}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog pour ajouter une pièce */}
        <AddPartDialog
          isOpen={isAddPartDialogOpen}
          onOpenChange={setIsAddPartDialogOpen}
          onSuccess={(newPart) => {
            console.log("Nouvelle pièce ajoutée:", newPart);
            toast.success(`La pièce ${newPart.name} a été ajoutée`);
            setIsAddPartDialogOpen(false);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default EquipmentParts;
