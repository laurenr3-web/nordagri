
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Intervention } from '@/types/Intervention';

interface BasicInfoFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  equipment: string;
  setEquipment: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  technician: string;
  setTechnician: (value: string) => void;
  intervention?: Intervention;
  handleInterventionUpdate: (intervention: Intervention) => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  title,
  setTitle,
  equipment,
  setEquipment,
  location,
  setLocation,
  technician,
  setTechnician,
  intervention,
  handleInterventionUpdate
}) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (intervention) {
      const updatedIntervention = {
        ...intervention,
        title: e.target.value
      };
      handleInterventionUpdate(updatedIntervention);
    }
  };
  
  const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEquipment(e.target.value);
    if (intervention) {
      const updatedIntervention = {
        ...intervention,
        equipment: e.target.value
      };
      handleInterventionUpdate(updatedIntervention);
    }
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    if (intervention) {
      const updatedIntervention = {
        ...intervention,
        location: e.target.value
      };
      handleInterventionUpdate(updatedIntervention);
    }
  };
  
  const handleTechnicianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTechnician(e.target.value);
    if (intervention) {
      const updatedIntervention = {
        ...intervention,
        technician: e.target.value
      };
      handleInterventionUpdate(updatedIntervention);
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          Titre
        </Label>
        <Input type="text" id="title" value={title} onChange={handleTitleChange} className="col-span-3" />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="equipment" className="text-right">
          Équipement
        </Label>
        <Input type="text" id="equipment" value={equipment} onChange={handleEquipmentChange} className="col-span-3" />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">
          Lieu
        </Label>
        <Input type="text" id="location" value={location} onChange={handleLocationChange} className="col-span-3" />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="technician" className="text-right">
          Technicien
        </Label>
        <Input type="text" id="technician" value={technician} onChange={handleTechnicianChange} className="col-span-3" />
      </div>
    </>
  );
};

export default BasicInfoFields;
