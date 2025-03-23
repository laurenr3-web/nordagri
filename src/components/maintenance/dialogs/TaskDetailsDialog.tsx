
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  MaintenanceTask, 
  MaintenancePriority, 
  MaintenanceStatus 
} from '@/hooks/maintenance/maintenanceSlice';
import { getStatusBadge, getPriorityBadge, formatDate } from '../MaintenanceUtils';
import { Clock, Calendar, FileText, Wrench, User, Trash2, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailsDialogProps {
  task: MaintenanceTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (taskId: number, status: MaintenanceStatus) => void;
  onPriorityChange?: (taskId: number, priority: MaintenancePriority) => void;
  onDeleteTask?: (taskId: number) => void;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  open,
  onOpenChange,
  onStatusChange,
  onPriorityChange,
  onDeleteTask
}) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  if (!task) return null;

  const handleStatusChange = (value: string) => {
    if (onStatusChange) {
      onStatusChange(task.id, value as MaintenanceStatus);
      toast({
        title: "Status updated",
        description: `Task status updated to ${value}`,
      });
    }
  };

  const handlePriorityChange = (value: string) => {
    if (onPriorityChange) {
      onPriorityChange(task.id, value as MaintenancePriority);
      toast({
        title: "Priority updated",
        description: `Task priority updated to ${value}`,
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (onDeleteTask) {
      onDeleteTask(task.id);
      onOpenChange(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
              </div>
              
              <Button 
                variant="destructive" 
                size="sm" 
                className="gap-1"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex gap-2 items-start">
                <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Equipment</p>
                  <p className="font-medium">{task.equipment} (ID: {task.equipmentId})</p>
                </div>
              </div>
              
              <div className="flex gap-2 items-start">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{task.assignedTo}</p>
                </div>
              </div>
              
              <div className="flex gap-2 items-start">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDate(task.dueDate)}</p>
                </div>
              </div>
              
              <div className="flex gap-2 items-start">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {task.status === 'completed' && task.actualDuration ? 
                      `${task.actualDuration} hrs (Actual)` : 
                      `${task.estimatedDuration} hrs (Est.)`
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {task.completedDate && (
              <div className="mb-4 flex gap-2 items-start">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed Date</p>
                  <p className="font-medium">{formatDate(task.completedDate)}</p>
                </div>
              </div>
            )}
            
            {task.notes && (
              <div className="mb-4 flex gap-2 items-start">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="bg-secondary/50 p-3 rounded-md mt-1">{task.notes}</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                <Select 
                  value={task.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending-parts">Pending Parts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
                <Select 
                  value={task.priority} 
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger>
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
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this maintenance task?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskDetailsDialog;
