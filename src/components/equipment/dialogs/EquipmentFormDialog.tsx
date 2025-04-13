
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { equipmentFormSchema, EquipmentFormValues } from '../form/equipmentFormTypes';
import EquipmentForm from '../form/EquipmentForm';
import { Equipment } from '@/hooks/equipment/useEquipmentTable';

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Equipment, 'id'>) => Promise<boolean>;
  title: string;
  equipment?: Equipment;
}

const EquipmentFormDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  title, 
  equipment 
}: EquipmentFormDialogProps) => {
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: equipment ? {
      name: equipment.name,
      type: equipment.type || '',
      manufacturer: equipment.manufacturer || '',
      model: equipment.model || '',
      year: equipment.year ? equipment.year.toString() : '',
      serialNumber: equipment.serial_number || '',
      status: (equipment.status as any) || 'operational',
      location: equipment.location || '',
      purchaseDate: equipment.purchase_date ? new Date(equipment.purchase_date) : undefined,
      notes: equipment.notes || '',
      image: equipment.image || ''
    } : {
      name: '',
      type: '',
      manufacturer: '',
      model: '',
      year: '',
      serialNumber: '',
      status: 'operational',
      location: '',
      notes: '',
      image: ''
    }
  });

  const handleSubmit = async (formData: EquipmentFormValues) => {
    try {
      // Convert form data to equipment data structure
      const equipmentData: Omit<Equipment, 'id'> = {
        name: formData.name,
        type: formData.type,
        manufacturer: formData.manufacturer,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : undefined,
        serial_number: formData.serialNumber,
        status: formData.status,
        location: formData.location,
        purchase_date: formData.purchaseDate ? formData.purchaseDate.toISOString() : undefined,
        notes: formData.notes,
        image: formData.image
      };
      
      const success = await onSubmit(equipmentData);
      if (success) {
        onOpenChange(false);
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {equipment 
              ? "Modifiez les informations de l'équipement ci-dessous." 
              : "Remplissez les informations pour ajouter un nouvel équipement."}
          </DialogDescription>
        </DialogHeader>
        
        <EquipmentForm form={form} onSubmit={handleSubmit}>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                form.reset();
                onOpenChange(false);
              }}
            >
              Annuler
            </Button>
            <Button type="submit">
              {equipment ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </EquipmentForm>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentFormDialog;
