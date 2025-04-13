
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { equipmentFormSchema, EquipmentFormValues } from '../form/equipmentFormTypes';
import { Equipment, mapEquipmentToDB } from '@/types/Equipment';
import { Form } from '@/components/ui/form';
import BasicInfoFields from '../form/BasicInfoFields';
import AdditionalInfoFields from '../form/AdditionalInfoFields';
import ImageField from '../form/ImageField';
import NotesField from '../form/NotesField';

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
      serialNumber: equipment.serialNumber || '',
      status: (equipment.status as any) || 'operational',
      location: equipment.location || '',
      purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate) : undefined,
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
        serialNumber: formData.serialNumber,
        status: formData.status,
        location: formData.location,
        purchaseDate: formData.purchaseDate ? formData.purchaseDate.toISOString() : undefined,
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <BasicInfoFields 
                form={form} 
                customCategories={[]} 
                onAddCategoryClick={() => {}} 
              />

              {/* Additional Information */}
              <AdditionalInfoFields form={form} />
            </div>

            <ImageField form={form} />
            
            <NotesField form={form} />

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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentFormDialog;
