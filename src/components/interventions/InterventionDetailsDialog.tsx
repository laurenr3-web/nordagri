
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Intervention } from '@/types/Intervention';
import { ScrollArea } from '@/components/ui/scroll-area';
import InterventionDialogHeader from './details/DialogHeader';
import BasicInfoFields from './details/BasicInfoFields';
import DescriptionFields from './details/DescriptionFields';
import DateField from './details/DateField';
import StatusFields from './details/StatusFields';
import PartsUsedList from './details/PartsUsedList';
import DialogFooterActions from './details/DialogFooterActions';

interface InterventionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  intervention: Intervention | undefined;
  handleInterventionUpdate: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
}

const InterventionDetailsDialog: React.FC<InterventionDetailsDialogProps> = ({
  isOpen,
  onClose,
  intervention,
  handleInterventionUpdate,
  onStartWork
}) => {
  const [title, setTitle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [location, setLocation] = useState('');
  const [technician, setTechnician] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<Intervention['priority']>('medium');
  const [status, setStatus] = useState<Intervention['status']>('scheduled');
  
  useEffect(() => {
    if (intervention) {
      setTitle(intervention.title);
      setEquipment(intervention.equipment);
      setLocation(intervention.location);
      setTechnician(intervention.technician);
      setDescription(intervention.description);
      setNotes(intervention.notes || '');
      setDate(intervention.date ? new Date(intervention.date) : undefined);
      setPriority(intervention.priority);
      setStatus(intervention.status);
    }
  }, [intervention]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <InterventionDialogHeader 
          title="Détails de l'intervention"
          description="Mettre à jour les informations de l'intervention."
        />
        
        <ScrollArea className="flex-1 max-h-[65vh] pr-3">
          <div className="grid gap-4 py-4">
            <BasicInfoFields 
              title={title}
              setTitle={setTitle}
              equipment={equipment}
              setEquipment={setEquipment}
              location={location}
              setLocation={setLocation}
              technician={technician}
              setTechnician={setTechnician}
              intervention={intervention}
              handleInterventionUpdate={handleInterventionUpdate}
            />
            
            <DescriptionFields 
              description={description}
              setDescription={setDescription}
              notes={notes}
              setNotes={setNotes}
              intervention={intervention}
              handleInterventionUpdate={handleInterventionUpdate}
            />
            
            <DateField 
              date={date}
              setDate={setDate}
              intervention={intervention}
              handleInterventionUpdate={handleInterventionUpdate}
            />
            
            <StatusFields 
              priority={priority}
              setPriority={setPriority}
              status={status}
              setStatus={setStatus}
              intervention={intervention}
              handleInterventionUpdate={handleInterventionUpdate}
            />
            
            <PartsUsedList partsUsed={intervention?.partsUsed} />
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4 pt-3 border-t">
          <DialogFooterActions 
            onClose={onClose}
            intervention={intervention}
            onStartWork={onStartWork}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterventionDetailsDialog;
