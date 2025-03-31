
import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { interventionFormSchema, InterventionFormValues } from './interventionFormSchema';
import { InterventionFormValues as ServiceInterventionFormValues } from '@/types/Intervention';

interface UseInterventionFormProps {
  onCreate: (intervention: ServiceInterventionFormValues) => void;
  onClose: () => void;
  equipments: { id: number; name: string }[];
}

export function useInterventionForm({ onCreate, onClose, equipments }: UseInterventionFormProps) {
  const form = useForm<InterventionFormValues>({
    resolver: zodResolver(interventionFormSchema),
    defaultValues: {
      title: "",
      equipment: "",
      equipmentId: 0,
      location: "",
      priority: "medium",
      date: new Date(),
      scheduledDuration: 1,
      technician: "",
      description: "",
      notes: "",
    },
  });
  
  // Gérer le changement d'équipement pour mettre à jour l'ID
  const handleEquipmentChange = (value: string) => {
    const selectedEquipment = equipments.find(eq => eq.name === value);
    if (selectedEquipment) {
      form.setValue('equipmentId', selectedEquipment.id);
    }
    return value;
  };
  
  const onSubmit = (values: InterventionFormValues) => {
    onCreate(values as ServiceInterventionFormValues);
    form.reset();
    onClose();
  };

  return {
    form,
    onSubmit,
    handleEquipmentChange
  };
}
