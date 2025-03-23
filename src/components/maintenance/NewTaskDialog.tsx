
import React, { useState } from 'react';
import { CalendarIcon, Plus, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { MaintenanceFormValues, MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MaintenanceFormValues) => void;
}

const NewTaskDialog: React.FC<NewTaskDialogProps> = ({ open, onOpenChange, onSubmit }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [equipmentId, setEquipmentId] = useState(1);
  const [type, setType] = useState<MaintenanceType>('preventive');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [estimatedDuration, setEstimatedDuration] = useState('2');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  
  // New state for adding staff
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [staffOptions, setStaffOptions] = useState([
    'Michael Torres',
    'David Chen',
    'Sarah Johnson',
    'Emma Williams',
    'Robert Taylor',
  ]);

  // Simulated equipment list
  const equipmentOptions = [
    { id: 1, name: 'John Deere 8R 410' },
    { id: 2, name: 'Case IH Axial-Flow' },
    { id: 3, name: 'Kubota M7-172' },
    { id: 4, name: 'Massey Ferguson 8S.245' },
    { id: 5, name: 'New Holland T6.180' },
    { id: 6, name: 'Fendt 942 Vario' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: MaintenanceFormValues = {
      title,
      equipment,
      equipmentId,
      type,
      priority,
      dueDate,
      estimatedDuration: parseFloat(estimatedDuration),
      assignedTo,
      notes,
    };
    
    onSubmit(formData);
    onOpenChange(false);
    
    // Reset form
    setTitle('');
    setEquipment('');
    setEquipmentId(1);
    setType('preventive');
    setPriority('medium');
    setDueDate(new Date());
    setEstimatedDuration('2');
    setAssignedTo('');
    setNotes('');
  };

  const handleEquipmentChange = (value: string) => {
    const selected = equipmentOptions.find(eq => eq.name === value);
    if (selected) {
      setEquipment(value);
      setEquipmentId(selected.id);
    }
  };

  const handleAddStaff = () => {
    if (newStaffName.trim() === '') {
      toast({
        title: "Erreur",
        description: "Le nom de la personne ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }
    
    const updatedStaffOptions = [...staffOptions, newStaffName.trim()];
    setStaffOptions(updatedStaffOptions);
    setAssignedTo(newStaffName.trim());
    setNewStaffName('');
    setIsAddStaffDialogOpen(false);
    
    toast({
      title: "Personne ajoutée",
      description: `${newStaffName.trim()} a été ajouté(e) à la liste du personnel`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Maintenance Task</DialogTitle>
            <DialogDescription>
              Fill in the details to schedule a new maintenance task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="equipment">Equipment</Label>
                  <Select value={equipment} onValueChange={handleEquipmentChange} required>
                    <SelectTrigger id="equipment">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentOptions.map((eq) => (
                        <SelectItem key={eq.id} value={eq.name}>
                          {eq.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="taskType">Task Type</Label>
                  <Select value={type} onValueChange={(value: MaintenanceType) => setType(value)}>
                    <SelectTrigger id="taskType">
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="condition-based">Condition-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={priority} 
                    onValueChange={(value: MaintenancePriority) => setPriority(value)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'PPP', { locale: fr }) : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => date && setDueDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <div className="flex items-center gap-2">
                    <Select value={assignedTo} onValueChange={setAssignedTo} required className="flex-1">
                      <SelectTrigger id="assignedTo">
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffOptions.map((staff) => (
                          <SelectItem key={staff} value={staff}>
                            {staff}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline"
                      onClick={() => setIsAddStaffDialogOpen(true)}
                      title="Add new staff member"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the name of the new staff member to add to the assignment list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newStaffName">Staff Name</Label>
              <Input
                id="newStaffName"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddStaffDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAddStaff}>
              Add Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewTaskDialog;
