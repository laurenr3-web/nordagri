
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MaintenanceFormValues, MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';

export const useMaintenanceForm = (
  onSubmit: (values: MaintenanceFormValues) => void, 
  onClose: (open: boolean) => void,
  initialDate?: Date
) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [equipmentId, setEquipmentId] = useState(1);
  const [type, setType] = useState<MaintenanceType>('preventive');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [dueDate, setDueDate] = useState<Date>(initialDate || new Date());
  const [estimatedDuration, setEstimatedDuration] = useState('2');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  
  // Update dueDate when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setDueDate(initialDate);
    }
  }, [initialDate]);
  
  // Staff management
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [staffOptions, setStaffOptions] = useState([
    'Michael Torres',
    'David Chen',
    'Sarah Johnson',
    'Emma Williams',
    'Robert Taylor',
  ]);

  // Equipment options
  const equipmentOptions = [
    { id: 1, name: 'John Deere 8R 410' },
    { id: 2, name: 'Case IH Axial-Flow' },
    { id: 3, name: 'Kubota M7-172' },
    { id: 4, name: 'Massey Ferguson 8S.245' },
    { id: 5, name: 'New Holland T6.180' },
    { id: 6, name: 'Fendt 942 Vario' },
  ];

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
    onClose(false);
    
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

  return {
    // Form values
    title,
    setTitle,
    equipment,
    setEquipment,
    equipmentId,
    type,
    setType,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    estimatedDuration,
    setEstimatedDuration,
    assignedTo,
    setAssignedTo,
    notes,
    setNotes,
    
    // Staff management
    isAddStaffDialogOpen,
    setIsAddStaffDialogOpen,
    newStaffName,
    setNewStaffName,
    staffOptions,
    handleAddStaff,
    
    // Equipment options
    equipmentOptions,
    handleEquipmentChange,
    
    // Form submission
    handleSubmit,
  };
};
