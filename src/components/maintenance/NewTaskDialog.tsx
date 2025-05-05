
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Clock, Plus, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMaintenanceForm } from '@/hooks/maintenance/useMaintenanceForm';
import { MaintenanceFormValues, MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';
import AddStaffDialog from './dialogs/AddStaffDialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formValues: MaintenanceFormValues) => Promise<any>;
  initialDate?: Date;
  userName?: string;
}

const NewTaskDialog: React.FC<NewTaskDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialDate,
  userName = 'Utilisateur'
}) => {
  const isMobile = useIsMobile();
  
  const {
    // Form fields
    title, setTitle,
    type, setType,
    priority, setPriority,
    dueDate, setDueDate,
    engineHours, setEngineHours,
    notes, setNotes,
    trigger_unit, setTrigger_unit,
    trigger_hours, setTrigger_hours,
    trigger_kilometers, setTrigger_kilometers,
    
    // Equipment data
    equipment, setEquipment,
    equipmentOptions,
    handleEquipmentChange,
    isLoading,
    
    // Staff management
    assignedTo, setAssignedTo,
    isAddStaffDialogOpen, setIsAddStaffDialogOpen,
    newStaffName, setNewStaffName,
    staffOptions,
    handleAddStaff,
    isLoadingStaff,
    
    // Form submission
    handleSubmit,
  } = useMaintenanceForm(onSubmit, onOpenChange, initialDate);

  const renderInitialDateWithUserInfo = () => {
    if (!initialDate) return null;
    
    return (
      <div className="bg-secondary/30 p-3 rounded-md text-sm mb-4">
        <p className="font-medium">
          {userName}, vous créez une tâche pour le {format(initialDate, 'dd MMMM yyyy', { locale: fr })}
        </p>
      </div>
    );
  };

  const formContent = (
    <>
      {renderInitialDateWithUserInfo()}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            placeholder="Entrez le titre de la tâche"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Equipment Field */}
        <div className="space-y-2">
          <Label htmlFor="equipment">Équipement</Label>
          <Select
            value={equipment}
            onValueChange={handleEquipmentChange}
            required
          >
            <SelectTrigger id="equipment" className="w-full">
              <SelectValue placeholder="Sélectionner un équipement" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Chargement des équipements...
                </SelectItem>
              ) : equipmentOptions.length > 0 ? (
                equipmentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.name}>
                    {option.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  Aucun équipement disponible
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Type and Priority Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={type} 
              onValueChange={(value) => setType(value as MaintenanceType)} 
              required
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventive">Préventive</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
                <SelectItem value="condition-based">Conditionnelle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priorité</Label>
            <Select 
              value={priority} 
              onValueChange={(value) => setPriority(value as MaintenancePriority)} 
              required
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Sélectionner une priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due Date and Duration Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Date d'échéance</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                  id="dueDate"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    format(dueDate, "d MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => date && setDueDate(date)}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="engineHours">Durée estimée (heures)</Label>
            <div className="flex items-center">
              <Input
                id="engineHours"
                type="number"
                step="0.5"
                min="0"
                value={engineHours}
                onChange={(e) => setEngineHours(e.target.value)}
                required
              />
              <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Seuil de déclenchement (optionnel)</Label>
          <div className="flex gap-4">
            <Select
              value={trigger_unit}
              onValueChange={setTrigger_unit}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Choisir une unité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun seuil</SelectItem>
                <SelectItem value="hours">Heures moteur</SelectItem>
                <SelectItem value="kilometers">Kilomètres</SelectItem>
              </SelectContent>
            </Select>

            {trigger_unit === 'hours' && (
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Seuil en heures"
                  value={trigger_hours || ''}
                  onChange={(e) => setTrigger_hours(parseFloat(e.target.value))}
                />
              </div>
            )}

            {trigger_unit === 'kilometers' && (
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Seuil en kilomètres"
                  value={trigger_kilometers || ''}
                  onChange={(e) => setTrigger_kilometers(parseFloat(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Assigned To Field */}
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assigné à</Label>
          <div className="flex space-x-2">
            <Select
              value={assignedTo}
              onValueChange={setAssignedTo}
            >
              <SelectTrigger id="assignedTo" className="w-full">
                <SelectValue placeholder="Sélectionner un technicien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={userName}>{userName} (vous)</SelectItem>
                {isLoadingStaff ? (
                  <SelectItem value="loading" disabled>
                    Chargement du personnel...
                  </SelectItem>
                ) : staffOptions.length > 0 ? (
                  staffOptions
                    .filter(name => name !== userName)
                    .map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))
                ) : (
                  <SelectItem value="none" disabled>
                    Aucun personnel disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsAddStaffDialogOpen(true)}
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notes Field */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Notes ou informations complémentaires"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit">
            <Plus className="mr-2 h-4 w-4" />
            Créer la tâche
          </Button>
        </div>
      </form>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>Nouvelle tâche de maintenance</DialogTitle>
        </DialogHeader>
        
        {isMobile ? (
          <ScrollArea className="h-[70vh] pr-2">
            {formContent}
          </ScrollArea>
        ) : (
          formContent
        )}

        {/* Add Staff Dialog */}
        <AddStaffDialog
          open={isAddStaffDialogOpen}
          onOpenChange={setIsAddStaffDialogOpen}
          staffName={newStaffName}
          setStaffName={setNewStaffName}
          onAddStaff={handleAddStaff}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskDialog;
