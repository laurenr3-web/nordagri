
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { TimeEntryFormData } from '@/hooks/time-tracking/types';
import { TaskTypeField } from './form/TaskTypeField';

interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TimeEntryFormData) => Promise<void>;
}

const formSchema = z.object({
  notes: z.string().optional(),
  task_type_id: z.string().min(1, {
    message: "Please select a task type.",
  }),
});

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit }: TimeEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
      task_type_id: ""
    },
  });

  const { handleSubmit, reset } = form;

  const [formData, setFormData] = useState<TimeEntryFormData>({
    notes: '',
    task_type: 'maintenance',
    custom_task_type: '',
    task_type_id: '',
  });

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      notes: '',
      task_type: 'maintenance',
      custom_task_type: '',
      task_type_id: '',
    });
    reset({
      notes: "",
      task_type_id: ""
    });
  };

  const validateForm = () => {
    if (!formData.task_type_id) {
      toast.error("Task type is required");
      return false;
    }
    return true;
  };

  const submitHandler = async (values: z.infer<typeof formSchema>) => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to create time session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Time Session</DialogTitle>
          <DialogDescription>
            Start tracking your time and tasks.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
            <FormField
              control={form.control}
              name="task_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Type</FormLabel>
                  <FormControl>
                    <TaskTypeField
                      value={formData.task_type_id || ''}
                      onChange={(value) => setFormData({ ...formData, task_type_id: value })}
                      required={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Add notes about the session" {...field} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Start Session"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
