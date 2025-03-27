
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { useAddEquipment } from '@/hooks/equipment/useAddEquipment';
import { EquipmentFormValues } from '../form/equipmentFormTypes';
import { toast } from 'sonner';
import { equipmentService } from '@/services/supabase/equipmentService';
import { useQueryClient } from '@tanstack/react-query';

const EquipmentDialogs: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const { mutate, isPending } = useAddEquipment();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Listen for custom events to open the dialogs
    const handleOpenAddDialog = () => {
      console.log('Opening add equipment dialog');
      setIsAddDialogOpen(true);
    };

    const handleEquipmentSelected = (event: CustomEvent<EquipmentItem>) => {
      console.log('Equipment selected event received:', event.detail);
      setSelectedEquipment(event.detail);
    };

    window.addEventListener('open-add-equipment-dialog', handleOpenAddDialog);
    window.addEventListener('equipment-selected', 
      handleEquipmentSelected as EventListener);

    return () => {
      window.removeEventListener('open-add-equipment-dialog', handleOpenAddDialog);
      window.removeEventListener('equipment-selected', 
        handleEquipmentSelected as EventListener);
    };
  }, []);

  const handleEquipmentUpdate = async (updatedEquipment: any) => {
    console.log('Equipment dialog updating equipment:', updatedEquipment);
    
    try {
      // Remove UI-specific properties before sending to server
      const { usage, nextService, ...equipmentToUpdate } = updatedEquipment;
      
      // Call the update service
      const result = await equipmentService.updateEquipment(equipmentToUpdate);
      
      console.log('Equipment updated successfully:', result);
      
      // Update the local state - ensure all properties match EquipmentItem type
      setSelectedEquipment(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          ...result,
          // Convert potential Date objects to strings for type compatibility
          lastMaintenance: typeof result.lastMaintenance === 'object' && result.lastMaintenance instanceof Date 
            ? result.lastMaintenance.toISOString() 
            : result.lastMaintenance?.toString() || prev.lastMaintenance,
          purchaseDate: typeof result.purchaseDate === 'object' && result.purchaseDate instanceof Date 
            ? result.purchaseDate.toISOString() 
            : result.purchaseDate?.toString() || prev.purchaseDate,
          // Keep UI properties
          usage: prev.usage,
          nextService: prev.nextService
        } as EquipmentItem;
      });
      
      // Invalidate queries to refresh data across the app
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      if (updatedEquipment.id) {
        queryClient.invalidateQueries({ queryKey: ['equipment', updatedEquipment.id] });
      }
      
      // Close the dialog
      setTimeout(() => setSelectedEquipment(null), 500);
      
      toast.success("Équipement mis à jour avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'équipement:", error);
      toast.error("Erreur lors de la mise à jour de l'équipement", { 
        description: error.message || "Une erreur s'est produite"
      });
    }
  };

  const handleAddEquipment = (data: EquipmentFormValues) => {
    // Log form data for debugging
    console.log('Form data received:', data);
    
    try {
      // Create new equipment object from form data
      const newEquipment = {
        name: data.name,
        type: data.type,
        category: data.category.charAt(0).toUpperCase() + data.category.slice(1),
        manufacturer: data.manufacturer,
        model: data.model || '',
        year: data.year ? parseInt(data.year) : null,
        status: data.status,
        location: data.location || '',
        serialNumber: data.serialNumber || null,  // Handle null case explicitly
        purchaseDate: data.purchaseDate,
        notes: data.notes || '',
        image: data.image || '',
      };
      
      console.log('Adding new equipment:', newEquipment);
      
      // Add equipment using the hook's mutate function
      mutate(newEquipment, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          toast.success("Équipement ajouté avec succès");
        },
        onError: (error: any) => {
          console.error("Erreur lors de l'ajout de l'équipement:", error);
          // Add detailed error logging
          if (error.code) {
            console.error("Code d'erreur:", error.code);
          }
          if (error.details) {
            console.error("Détails de l'erreur:", error.details);
          }
          if (error.hint) {
            console.error("Suggestion:", error.hint);
          }
          
          toast.error("Erreur lors de l'ajout de l'équipement", { 
            description: error.message || "Une erreur s'est produite" 
          });
        }
      });
    } catch (error: any) {
      console.error("Exception lors de l'ajout de l'équipement:", error);
      toast.error("Erreur lors de l'ajout de l'équipement", { 
        description: error.message || "Une erreur s'est produite"
      });
    }
  };

  return (
    <>
      {/* Add Equipment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ajouter un équipement</DialogTitle>
          </DialogHeader>
          <EquipmentForm 
            onSubmit={handleAddEquipment}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Equipment Details Dialog */}
      <Dialog 
        open={!!selectedEquipment} 
        onOpenChange={(open) => {
          console.log('Equipment dialog open state changed to:', open);
          if (!open) setSelectedEquipment(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'équipement</DialogTitle>
          </DialogHeader>
          {selectedEquipment && (
            <EquipmentDetails 
              equipment={selectedEquipment} 
              onUpdate={handleEquipmentUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EquipmentDialogs;
