
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Equipment, Activity } from '@/hooks/timetracking/useTimeTracking';

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipments: Equipment[];
  onAddActivity: (activity: Omit<Activity, 'id' | 'status' | 'createdAt'>) => void;
}

const AddActivityDialog: React.FC<AddActivityDialogProps> = ({
  open,
  onOpenChange,
  equipments,
  onAddActivity
}) => {
  const [taskName, setTaskName] = useState('');
  const [equipmentId, setEquipmentId] = useState<number | null>(null);
  const [fieldId, setFieldId] = useState<number | null>(null);
  const [fieldSize, setFieldSize] = useState('');
  const [notes, setNotes] = useState('');

  // Fields are typically associated with a specific farm
  const fields = [
    { id: 1, name: 'North Field', size: 25 },
    { id: 2, name: 'South Field', size: 18 },
    { id: 3, name: 'East Field', size: 12 },
    { id: 4, name: 'West Field', size: 30 },
    { id: 5, name: 'Central Field', size: 22 },
  ];

  const resetForm = () => {
    setTaskName('');
    setEquipmentId(null);
    setFieldId(null);
    setFieldSize('');
    setNotes('');
  };

  const handleFieldChange = (value: string) => {
    const fieldId = parseInt(value);
    setFieldId(fieldId);
    
    // Auto-fill field size
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      setFieldSize(field.size.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskName || !equipmentId || !fieldId) {
      return;
    }
    
    const selectedEquipment = equipments.find(eq => eq.id === equipmentId);
    const selectedField = fields.find(f => f.id === fieldId);
    
    if (!selectedEquipment || !selectedField) {
      return;
    }
    
    onAddActivity({
      taskName,
      equipmentId,
      equipment: selectedEquipment.name,
      fieldId,
      field: selectedField.name,
      fieldSize: parseFloat(fieldSize),
      duration: 0,
      coordinates: {
        lat: 48.864716 + (Math.random() * 0.1 - 0.05), // Random coordinates near Paris for demo
        lng: 2.349014 + (Math.random() * 0.1 - 0.05)
      },
      notes
    });
    
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
          <DialogDescription>
            Create a new activity to track equipment usage in a field.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskName">Task Name*</Label>
              <Input
                id="taskName"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g., Plowing, Harvesting, Seeding"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="equipment">Equipment*</Label>
                <Select 
                  value={equipmentId?.toString() || ''} 
                  onValueChange={(value) => setEquipmentId(parseInt(value))}
                  required
                >
                  <SelectTrigger id="equipment">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipments.map((equipment) => (
                      <SelectItem key={equipment.id} value={equipment.id.toString()}>
                        {equipment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="field">Field*</Label>
                <Select 
                  value={fieldId?.toString() || ''} 
                  onValueChange={handleFieldChange}
                  required
                >
                  <SelectTrigger id="field">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.id} value={field.id.toString()}>
                        {field.name} ({field.size} ha)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fieldSize">Field Size (hectares)*</Label>
              <Input
                id="fieldSize"
                type="number"
                min="0.1"
                step="0.1"
                value={fieldSize}
                onChange={(e) => setFieldSize(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this activity"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">Add Activity</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddActivityDialog;
