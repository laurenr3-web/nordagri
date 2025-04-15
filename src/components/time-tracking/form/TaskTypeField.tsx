
import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface TaskTypeFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

interface TaskType {
  id: string;
  name: string;
}

export function TaskTypeField({ value, onChange, required = true }: TaskTypeFieldProps) {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  
  // Fetch task types from Supabase
  useEffect(() => {
    const fetchTaskTypes = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('task_types')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setTaskTypes(data || []);
      } catch (err) {
        console.error("Error loading task types:", err);
        setError(err instanceof Error ? err.message : 'Failed to load task types');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTaskTypes();
  }, []);
  
  // Show warning when form is submitted without a task type
  useEffect(() => {
    if (required && !value && document.activeElement?.getAttribute('type') === 'submit') {
      setShowWarning(true);
    } else if (value) {
      setShowWarning(false);
    }
  }, [value, required]);
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Task Type</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-2">
        <Label>Task Type</Label>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor="taskType" className={showWarning ? "text-red-500" : ""}>
          Task Type {required && <span className="text-red-500">*</span>}
        </Label>
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          id="taskType" 
          className={showWarning ? "border-red-500" : ""}
        >
          <SelectValue placeholder="Select a task type" />
        </SelectTrigger>
        <SelectContent>
          {taskTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {showWarning && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please select a task type to continue.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
