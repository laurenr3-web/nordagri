
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from '@/components/parts/form/partFormTypes';

export function useEquipmentSelection(form: UseFormReturn<PartFormValues>) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Synchroniser avec les valeurs du formulaire au chargement
  useEffect(() => {
    const currentCompatibility = form.getValues('compatibility') || [];
    setSelectedIds(currentCompatibility);
  }, [form]);

  const handleSelectionChange = (newSelection: string[]) => {
    // Convertir les string[] en number[]
    const numericIds = newSelection.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    
    // Mettre à jour l'état local
    setSelectedIds(numericIds);
    
    // Mettre à jour le formulaire
    form.setValue('compatibility', numericIds, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
    form.setValue('compatibility', [], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return {
    selectedIds,
    handleSelectionChange,
    clearSelection
  };
}
