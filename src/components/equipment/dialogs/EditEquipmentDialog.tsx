
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import BasicInfoFields from '../form/BasicInfoFields';
import AdditionalInfoFields from '../form/AdditionalInfoFields';
import ImageField from '../form/ImageField';
import NotesField from '../form/NotesField';
import AddCategorySection from './form/AddCategorySection';
import { equipmentFormSchema, type EquipmentFormValues, type EquipmentStatus } from '../form/equipmentFormTypes';
import { Form } from '@/components/ui/form';
import { WearUnitField } from '../form/WearUnitField';
import MultiPhotoUploader from '../form/MultiPhotoUploader';
import { Separator } from '@/components/ui/separator';

interface EditEquipmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: any;
  onSubmit: (data: any) => void;
}

const EditEquipmentDialog: React.FC<EditEquipmentDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  equipment, 
  onSubmit 
}) => {
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('Editing equipment:', equipment);

  // Format equipment data for the form, ensuring purchaseDate is properly formatted
  const defaultValues: EquipmentFormValues = {
    name: equipment.name,
    type: equipment.type || '',
    manufacturer: equipment.manufacturer || '',
    model: equipment.model || '',
    year: equipment.year ? equipment.year.toString() : '',
    serialNumber: equipment.serialNumber || '',
    status: (equipment.status as EquipmentStatus) || 'operational',
    location: equipment.location || '',
    purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate) : undefined,
    notes: equipment.notes || '',
    image: equipment.image || '',
    unite_d_usure: equipment.unite_d_usure || 'heures',
    valeur_actuelle: equipment.valeur_actuelle || 0
  };

  console.log('Form default values:', defaultValues);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: EquipmentFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Form submitted with values:', data);
      
      // Convert form data back to equipment object format
      const updatedEquipment = {
        ...equipment,
        name: data.name,
        type: data.type,
        manufacturer: data.manufacturer,
        model: data.model,
        year: data.year ? parseInt(data.year) : undefined,
        serialNumber: data.serialNumber,
        status: data.status,
        location: data.location,
        purchaseDate: data.purchaseDate,
        notes: data.notes,
        image: data.image,
        unite_d_usure: data.unite_d_usure,
        valeur_actuelle: data.valeur_actuelle
      };
      
      console.log('Updated equipment to be submitted:', updatedEquipment);
      await onSubmit(updatedEquipment);
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Failed to update equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewCategory = (category: string) => {
    setCustomCategories([...customCategories, category]);
    form.setValue('type', category);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'équipement</DialogTitle>
          <DialogDescription>
            Mettre à jour les informations de cet équipement
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BasicInfoFields 
                form={form}
                customCategories={customCategories}
                onAddCategoryClick={() => setIsAddCategoryDialogOpen(true)}
                language="fr"
              />
              
              <AdditionalInfoFields 
                form={form}
                language="fr"
              />
            </div>

            <WearUnitField form={form} />
            <ImageField form={form} />
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Galerie de photos</h3>
              <p className="text-sm text-muted-foreground">
                Ajoutez plusieurs photos pour montrer différents angles de l'équipement
              </p>
              <MultiPhotoUploader equipmentId={equipment.id} />
            </div>
            
            <NotesField form={form} />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <AddCategorySection
          isOpen={isAddCategoryDialogOpen}
          onOpenChange={setIsAddCategoryDialogOpen}
          onAddCategory={addNewCategory}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditEquipmentDialog;
