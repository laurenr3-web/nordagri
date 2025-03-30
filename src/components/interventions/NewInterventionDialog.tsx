import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  SafeDialog,
  SafeDialogContent,
  SafeDialogDescription,
  SafeDialogFooter,
  SafeDialogHeader,
  SafeDialogTitle,
} from '@/components/ui/dialog/index';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface InterventionFormValues {
  title: string;
  equipment: string;
  equipmentId: number;
  location: string;
  priority: 'high' | 'medium' | 'low';
  date: Date;
  scheduledDuration: number;
  technician: string;
  description: string;
  notes: string;
}

interface NewInterventionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InterventionFormValues) => void;
}

const NewInterventionDialog: React.FC<NewInterventionDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit 
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [equipmentId, setEquipmentId] = useState(1);
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [date, setDate] = useState<Date>(new Date());
  const [scheduledDuration, setScheduledDuration] = useState('2');
  const [technician, setTechnician] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Equipment options
  const equipmentOptions = [
    { id: 1, name: 'John Deere 8R 410' },
    { id: 2, name: 'Case IH Axial-Flow' },
    { id: 3, name: 'Kubota M7-172' },
    { id: 4, name: 'Massey Ferguson 8S.245' },
    { id: 5, name: 'New Holland T6.180' },
    { id: 6, name: 'Fendt 942 Vario' },
  ];

  // Technician options
  const technicianOptions = [
    'Michael Torres',
    'David Chen',
    'Sarah Johnson',
    'Emma Williams',
    'Robert Taylor',
  ];

  // Location options
  const locationOptions = [
    'North Field',
    'South Field',
    'East Field',
    'West Field',
    'Central Field',
    'Workshop',
  ];

  const handleEquipmentChange = (value: string) => {
    const selected = equipmentOptions.find(eq => eq.name === value);
    if (selected) {
      setEquipment(value);
      setEquipmentId(selected.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !equipment || !location || !technician) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const formData: InterventionFormValues = {
      title,
      equipment,
      equipmentId,
      location,
      priority,
      date,
      scheduledDuration: parseFloat(scheduledDuration),
      technician,
      description,
      notes,
    };
    
    onSubmit(formData);
    
    // Reset form
    setTitle('');
    setEquipment('');
    setLocation('');
    setPriority('medium');
    setDate(new Date());
    setScheduledDuration('2');
    setTechnician('');
    setDescription('');
    setNotes('');
  };

  return (
    <SafeDialog open={open} onOpenChange={onOpenChange}>
      <SafeDialogContent className="sm:max-w-[550px]">
        <SafeDialogHeader>
          <SafeDialogTitle>Create New Intervention</SafeDialogTitle>
          <SafeDialogDescription>
            Fill in the details to schedule a new field intervention.
          </SafeDialogDescription>
        </SafeDialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Hydraulic System Repair"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="equipment">Equipment*</Label>
                <Select value={equipment} onValueChange={handleEquipmentChange} required>
                  <SelectTrigger id="equipment">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentOptions.map((option) => (
                      <SelectItem key={option.id} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Location*</Label>
                <Select value={location} onValueChange={setLocation} required>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: 'high' | 'medium' | 'low') => setPriority(value)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Date*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Scheduled Duration (hrs)*</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={scheduledDuration}
                  onChange={(e) => setScheduledDuration(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="technician">Technician*</Label>
                <Select value={technician} onValueChange={setTechnician} required>
                  <SelectTrigger id="technician">
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicianOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of the intervention"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes or instructions"
              />
            </div>
          </div>
          <SafeDialogFooter>
            <Button type="submit">Create Intervention</Button>
          </SafeDialogFooter>
        </form>
      </SafeDialogContent>
    </SafeDialog>
  );
};

export default NewInterventionDialog;
