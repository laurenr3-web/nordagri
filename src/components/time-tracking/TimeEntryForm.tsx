
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { TaskType } from '@/hooks/time-tracking/types';
import { toast } from 'sonner';

interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit }: TimeEntryFormProps) {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [customType, setCustomType] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load task types on mount
  useEffect(() => {
    const loadTaskTypes = async () => {
      try {
        const types = await timeTrackingService.getTaskTypes();
        setTaskTypes(types);
        if (types.length > 0) {
          setSelectedType(types[0].name);
        }
      } catch (error) {
        console.error('Error loading task types:', error);
        toast.error('Could not load task types');
      }
    };

    if (isOpen) {
      loadTaskTypes();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) {
      toast.error('Please select a task type');
      return;
    }

    const taskType = selectedType as any;
    const taskTypeObj = taskTypes.find(t => t.name === taskType);

    onSubmit({
      task_type: taskType,
      task_type_id: taskTypeObj?.id,
      custom_task_type: taskType === 'other' ? customType : undefined,
      notes
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Time Session</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="task-type">Task Type</Label>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType === 'other' && (
            <div>
              <Label htmlFor="custom-type">Custom Task Type</Label>
              <Input
                id="custom-type"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter custom task type"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Start Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
