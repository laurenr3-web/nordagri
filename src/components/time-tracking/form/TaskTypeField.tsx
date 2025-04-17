
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { TimeEntryTaskType } from '@/hooks/time-tracking/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';

interface TaskTypeFieldProps {
  taskType: TimeEntryTaskType;
  customTaskType: string;
  onChange: (field: string, value: any) => void;
}

export function TaskTypeField({ taskType, customTaskType, onChange }: TaskTypeFieldProps) {
  const [availableTaskTypes, setAvailableTaskTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Charger les types de tâche disponibles dans la base de données
  useEffect(() => {
    const fetchTaskTypes = async () => {
      setIsLoading(true);
      try {
        const types = await timeTrackingService.getTaskTypes();
        setAvailableTaskTypes(types);
      } catch (error) {
        console.error("Erreur lors du chargement des types de tâche:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTaskTypes();
  }, []);

  return (
    <>
      <div className="grid gap-2">
        <Label>Type de tâche *</Label>
        <RadioGroup
          value={taskType}
          onValueChange={(value) => onChange('task_type', value as TimeEntryTaskType)}
          className="grid grid-cols-2 gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="maintenance" id="maintenance" />
            <Label htmlFor="maintenance">Maintenance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="repair" id="repair" />
            <Label htmlFor="repair">Réparation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inspection" id="inspection" />
            <Label htmlFor="inspection">Inspection</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="traite" id="traite" />
            <Label htmlFor="traite">Traite</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="entretien" id="entretien" />
            <Label htmlFor="entretien">Entretien</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Autre</Label>
          </div>
        </RadioGroup>
      </div>

      {taskType === 'other' && (
        <div className="grid gap-2">
          <Label htmlFor="custom_task_type">Type de tâche personnalisé *</Label>
          {availableTaskTypes.length > 0 ? (
            <>
              <Select
                value={customTaskType || ""}
                onValueChange={(value) => onChange('custom_task_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTaskTypes
                    .filter(type => !['maintenance', 'repair', 'inspection', 'traite', 'entretien'].includes(type.name.toLowerCase()))
                    .map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  <SelectItem value="custom">Personnalisé...</SelectItem>
                </SelectContent>
              </Select>
              
              {customTaskType === 'custom' && (
                <Input
                  className="mt-2"
                  placeholder="Entrez votre type de tâche..."
                  value=""
                  onChange={(e) => onChange('custom_task_type', e.target.value)}
                />
              )}
            </>
          ) : (
            <Input
              id="custom_task_type"
              value={customTaskType}
              onChange={(e) => onChange('custom_task_type', e.target.value)}
              placeholder="Entrez un type de tâche..."
            />
          )}
        </div>
      )}
    </>
  );
}
