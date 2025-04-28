
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFieldObservations } from '@/hooks/observations/useFieldObservations';
import { FieldObservationFormValues } from '@/types/FieldObservation';
import { toast } from 'sonner';
import { ObservationFormData } from './form/ObservationFormTypes';
import { PhotosUploader } from './form/PhotosUploader';
import { EquipmentSelect, ObservationTypeSelect, UrgencyLevelSelect } from './form/SelectFields';
import { LocationInput, DescriptionTextarea } from './form/TextFields';

export const ObservationForm = () => {
  const { createObservation } = useFieldObservations();
  
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
  const [formData, setFormData] = useState<ObservationFormData>({
    photos: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || !formData.observation_type || !formData.urgency_level) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const equipment = await getEquipmentName(selectedEquipment);
    if (!equipment) {
      toast.error("Erreur: impossible de trouver l'équipement sélectionné");
      return;
    }

    try {
      const values: FieldObservationFormValues = {
        equipment_id: selectedEquipment,
        equipment: equipment,
        observation_type: formData.observation_type!,
        urgency_level: formData.urgency_level!,
        photos: formData.photos || [],
        location: formData.location,
        description: formData.description
      };

      await createObservation.mutateAsync(values);
      
      // Réinitialiser le formulaire
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la création de l'observation:", error);
      toast.error("Une erreur s'est produite lors de la création de l'observation");
    }
  };

  // Récupérer le nom de l'équipement à partir de l'ID
  const getEquipmentName = async (equipmentId: number): Promise<string> => {
    try {
      const { data: equipments } = useEquipmentOptions.getState();
      const equipment = equipments?.find(e => e.id === equipmentId);
      return equipment?.name || '';
    } catch (error) {
      console.error("Erreur lors de la récupération du nom de l'équipement:", error);
      return '';
    }
  };
  
  // Mettre à jour les données du formulaire
  const updateFormData = (partialData: Partial<ObservationFormData>) => {
    setFormData(prev => ({ ...prev, ...partialData }));
  };
  
  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedEquipment(null);
    setFormData({ photos: [] });
    // Note: PhotosUploader gère sa propre réinitialisation interne
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <EquipmentSelect
          selectedEquipment={selectedEquipment}
          onEquipmentChange={setSelectedEquipment}
        />

        <ObservationTypeSelect
          value={formData.observation_type}
          onChange={(value) => updateFormData({ observation_type: value })}
        />

        <UrgencyLevelSelect
          value={formData.urgency_level}
          onChange={(value) => updateFormData({ urgency_level: value })}
        />

        <LocationInput
          value={formData.location}
          onChange={(value) => updateFormData({ location: value })}
        />

        <DescriptionTextarea
          value={formData.description}
          onChange={(value) => updateFormData({ description: value })}
        />
        
        <PhotosUploader
          photos={formData.photos || []}
          onPhotosChange={(photos) => updateFormData({ photos })}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={createObservation.isPending}
        >
          {createObservation.isPending ? 'Enregistrement...' : 'Enregistrer l\'observation'}
        </Button>
      </form>
    </Card>
  );
};
