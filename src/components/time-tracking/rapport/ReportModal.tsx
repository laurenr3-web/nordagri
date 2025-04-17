
import React from 'react';
import { X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useTaskDetails } from '@/hooks/time-tracking/useTaskDetails';
import { formatTime } from '@/utils/dateHelpers';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportModalProps {
  date: Date;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ date, onClose }) => {
  const { isLoading, tasks, totalHours } = useTaskDetails(date);
  
  const formattedDate = format(date, 'EEEE d MMMM yyyy', { locale: fr });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">{formattedDate}</DialogTitle>
          <DialogDescription className="flex items-center">
            <Clock className="h-4 w-4 mr-1" /> 
            Total : {totalHours.toFixed(2)} heures
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          ) : tasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Aucune tâche enregistrée pour cette journée.
            </p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="space-y-1 pb-3 border-b">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{task.task_type}</h4>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {task.duration.toFixed(1)}h
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(task.start_time)} - {formatTime(task.end_time || new Date())}
                </div>
                {task.equipment_name && (
                  <div className="text-sm">
                    🔧 {task.equipment_name}
                  </div>
                )}
                {task.notes && (
                  <div className="text-sm mt-1 italic">
                    {task.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
