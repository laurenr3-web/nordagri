
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Intervention } from '@/types/Intervention';

interface StatusFieldsProps {
  priority: Intervention['priority'];
  setPriority: (value: Intervention['priority']) => void;
  status: Intervention['status'];
  setStatus: (value: Intervention['status']) => void;
  intervention?: Intervention;
  handleInterventionUpdate: (intervention: Intervention) => void;
}

const StatusFields: React.FC<StatusFieldsProps> = ({
  priority,
  setPriority,
  status,
  setStatus,
  intervention,
  handleInterventionUpdate
}) => {
  const handlePriorityChange = (value: Intervention['priority']) => {
    setPriority(value);
    if (intervention) {
      const updatedIntervention = {
        ...intervention,
        priority: value
      };
      handleInterventionUpdate(updatedIntervention);
    }
  };
  
  const handleStatusChange = (value: Intervention['status']) => {
    setStatus(value);
    if (intervention) {
      const updatedIntervention = {
        ...intervention,
        status: value
      };
      handleInterventionUpdate(updatedIntervention);
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="priority" className="text-right">
          Priorité
        </Label>
        <Select value={priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">Haute</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="low">Basse</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Statut
        </Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Planifié</SelectItem>
            <SelectItem value="in-progress">En cours</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="canceled">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default StatusFields;
