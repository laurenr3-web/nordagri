
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useEquipmentOptions } from '@/hooks/equipment/useEquipmentOptions';
import { useFieldObservations } from '@/hooks/observations/useFieldObservations';
import { ObservationType, UrgencyLevel, FieldObservationFormValues } from '@/types/FieldObservation';
import { toast } from 'sonner';

export const ObservationForm = () => {
  const { createObservation } = useFieldObservations();
  const { data: equipments = [], isLoading: isLoadingEquipment } = useEquipmentOptions();
  
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<FieldObservationFormValues>>({
    photos: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || !formData.observation_type || !formData.urgency_level) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const equipment = equipments.find(e => e.id === selectedEquipment);
    if (!equipment) return;

    const values: FieldObservationFormValues = {
      equipment_id: selectedEquipment,
      equipment: equipment.name,
      observation_type: formData.observation_type as ObservationType,
      urgency_level: formData.urgency_level as UrgencyLevel,
      photos: formData.photos || [],
      location: formData.location,
      description: formData.description
    };

    await createObservation.mutateAsync(values);
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          onValueChange={(value) => setSelectedEquipment(Number(value))}
          disabled={isLoadingEquipment}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner l'équipement" />
          </SelectTrigger>
          <SelectContent>
            {equipments.map((equipment) => (
              <SelectItem key={equipment.id} value={equipment.id.toString()}>
                {equipment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => 
            setFormData(prev => ({ ...prev, observation_type: value as ObservationType }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type d'observation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="panne">Panne</SelectItem>
            <SelectItem value="usure">Usure</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => 
            setFormData(prev => ({ ...prev, urgency_level: value as UrgencyLevel }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Niveau d'urgence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="surveiller">À surveiller</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Localisation (optionnel)"
          onChange={(e) => 
            setFormData(prev => ({ ...prev, location: e.target.value }))}
        />

        <Textarea
          placeholder="Description détaillée (optionnel)"
          onChange={(e) => 
            setFormData(prev => ({ ...prev, description: e.target.value }))}
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
