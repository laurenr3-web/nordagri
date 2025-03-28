
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import { EquipmentFormValues } from '@/components/equipment/form/equipmentFormTypes';
import { useAddEquipment } from '@/hooks/equipment/useAddEquipment';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AddEquipmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddEquipmentDialog: React.FC<AddEquipmentDialogProps> = ({ 
  isOpen, 
  onOpenChange 
}) => {
  const { mutate, isPending } = useAddEquipment();

  const handleAddEquipment = async (data: EquipmentFormValues) => {
    // Log form data for debugging
    console.log('Form data received:', data);
    
    try {
      // Get current user for owner_id
      const { data: { session } } = await supabase.auth.getSession();
      const owner_id = session?.user?.id;
      
      if (!owner_id) {
        console.warn('No authenticated user found, equipment will be created without owner');
      } else {
        console.log('Adding equipment with owner_id:', owner_id);
      }
      
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
        owner_id: owner_id
      };
      
      console.log('Adding new equipment:', newEquipment);
      
      // Add equipment using the hook's mutate function
      mutate(newEquipment, {
        onSuccess: () => {
          console.log('Equipment added successfully');
          onOpenChange(false);
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ajouter un équipement</DialogTitle>
        </DialogHeader>
        <EquipmentForm 
          onSubmit={handleAddEquipment}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentDialog;
