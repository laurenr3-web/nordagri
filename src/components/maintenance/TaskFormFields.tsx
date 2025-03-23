
import React from 'react';
import { CalendarIcon, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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

interface TaskFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  equipment: string;
  setEquipment: (equipment: string) => void;
  type: MaintenanceType;
  setType: (type: MaintenanceType) => void;
  priority: MaintenancePriority;
  setPriority: (priority: MaintenancePriority) => void;
  dueDate: Date;
  setDueDate: (date: Date) => void;
  estimatedDuration: string;
  setEstimatedDuration: (duration: string) => void;
  assignedTo: string;
  setAssignedTo: (staff: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  equipmentOptions: Array<{ id: number; name: string }>;
  handleEquipmentChange: (value: string) => void;
  staffOptions: string[];
  onAddStaffClick: () => void;
}

const TaskFormFields: React.FC<TaskFormFieldsProps> = ({
  title,
  setTitle,
  equipment,
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
  equipmentOptions,
  handleEquipmentChange,
  staffOptions,
  onAddStaffClick,
}) => {
  return (
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
            <div className="flex-1">
              <Select value={assignedTo} onValueChange={setAssignedTo} required>
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
            </div>
            <Button 
              type="button" 
              size="icon" 
              variant="outline"
              onClick={onAddStaffClick}
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
  );
};

export default TaskFormFields;
