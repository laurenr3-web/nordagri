import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/components/interventions/utils/interventionUtils";
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2, Clock, X } from 'lucide-react';
import { Intervention } from '@/types/Intervention';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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

  const handleDateChange = (date: Date) => {
    if (intervention && date) {
      const updatedIntervention = {
        ...intervention,
        date: date // It will be properly converted when sent to the API
      };
      handleInterventionUpdate(updatedIntervention);
    }
  }
  
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Détails de l'intervention</DialogTitle>
          <DialogDescription>
            Mettre à jour les informations de l'intervention.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Choisir une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
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
          
          {intervention && intervention.partsUsed && intervention.partsUsed.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Pièces utilisées</Label>
              <div className="col-span-3">
                <ul className="list-none pl-0">
                  {intervention.partsUsed.map((part) => (
                    <li key={part.partId} className="flex items-center justify-between border-b py-2 text-sm">
                      <span>{part.name}</span>
                      <span>{part.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Fermer
          </Button>
          {intervention && intervention.status === 'scheduled' && (
            <Button type="button" onClick={() => {
              if (intervention) {
                onStartWork(intervention);
                onClose();
              } else {
                toast.error("Impossible de démarrer l'intervention");
              }
            }}>
              Démarrer
            </Button>
          )}
          {intervention && intervention.status === 'in-progress' && (
            <Button type="button" variant="outline">
              Terminer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterventionDetailsDialog;
