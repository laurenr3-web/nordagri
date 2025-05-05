
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Intervention } from '@/types/Intervention';

interface DescriptionFieldsProps {
  description: string;
  setDescription: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  intervention?: Intervention;
  handleInterventionUpdate: (intervention: Intervention) => void;
}

const DescriptionFields: React.FC<DescriptionFieldsProps> = ({
  description,
  setDescription,
  notes,
  setNotes,
  intervention,
  handleInterventionUpdate
}) => {
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (intervention) {
      const updatedIntervention = {
        ...intervention,
        description: e.target.value
      };
      handleInterventionUpdate(updatedIntervention);
    }
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    if (intervention) {
      const updatedIntervention = {
        ...intervention,
        notes: e.target.value
      };
      handleInterventionUpdate(updatedIntervention);
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="description" className="text-right mt-2">
          Description
        </Label>
        <Textarea id="description" value={description} onChange={handleDescriptionChange} className="col-span-3" />
      </div>
      
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="notes" className="text-right mt-2">
          Notes
        </Label>
        <Textarea id="notes" value={notes} onChange={handleNotesChange} className="col-span-3" />
      </div>
    </>
  );
};

export default DescriptionFields;
