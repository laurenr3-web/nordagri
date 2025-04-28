
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useFieldObservations } from '@/hooks/observations/useFieldObservations';
import { toast } from 'sonner';
import { PhotosUploader } from './form/PhotosUploader';
import { EquipmentSelect, ObservationTypeSelect, UrgencyLevelSelect } from './form/SelectFields';
import { LocationInput, DescriptionTextarea } from './form/TextFields';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { observationFormSchema, ObservationFormValues } from './form/validationSchema';
import { useEquipmentOptions } from '@/hooks/equipment/useEquipmentOptions';

interface ObservationFormProps {
  onSuccess?: () => void;
}

export const ObservationForm = ({ onSuccess }: ObservationFormProps) => {
  const { createObservation } = useFieldObservations();
  const { data: equipments = [] } = useEquipmentOptions();

  // Initialiser le formulaire avec react-hook-form et zod
  const form = useForm<ObservationFormValues>({
    resolver: zodResolver(observationFormSchema),
    defaultValues: {
      equipment_id: null,
      observation_type: undefined,
      urgency_level: undefined,
      location: '',
      description: '',
      photos: []
    }
  });
  
  // Réinitialiser le formulaire après une soumission réussie
  useEffect(() => {
    if (createObservation.isSuccess) {
      form.reset();
      // Appeler le callback onSuccess si défini
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [createObservation.isSuccess, form, onSuccess]);

  const handleSubmit = async (values: ObservationFormValues) => {
    if (!values.equipment_id) {
      toast.error('Veuillez sélectionner un équipement');
      return;
    }

    try {
      const equipment = equipments.find(eq => eq.id === values.equipment_id);
      if (!equipment) {
        toast.error("Erreur: impossible de trouver l'équipement sélectionné");
        return;
      }

      // Préparer les valeurs pour la création de l'observation
      await createObservation.mutateAsync({
        equipment_id: values.equipment_id,
        equipment: equipment.name,
        observation_type: values.observation_type!,
        urgency_level: values.urgency_level!,
        photos: values.photos || [],
        location: values.location || 'Non spécifiée',
        description: values.description || ''
      });
      
    } catch (error) {
      console.error("Erreur lors de la création de l'observation:", error);
      // L'erreur sera traitée par le hook useFieldObservations via onError
    }
  };

  return (
    <Card className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {createObservation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                Une erreur s'est produite lors de la création de l'observation. 
                Veuillez réessayer ou contacter le support.
              </AlertDescription>
            </Alert>
          )}

          <EquipmentSelect form={form} />
          <ObservationTypeSelect form={form} />
          <UrgencyLevelSelect form={form} />
          <LocationInput form={form} />
          <DescriptionTextarea form={form} />
          <PhotosUploader form={form} />

          <Button 
            type="submit" 
            className="w-full"
            disabled={createObservation.isPending || !form.formState.isValid}
          >
            {createObservation.isPending ? 'Enregistrement...' : 'Enregistrer l\'observation'}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
