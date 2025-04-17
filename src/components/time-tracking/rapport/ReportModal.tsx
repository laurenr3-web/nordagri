
import React from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useTaskDetails } from '@/hooks/time-tracking/useTaskDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime } from '@/utils/dateHelpers';

interface ReportModalProps {
  date: Date;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ date, onClose }) => {
  const { tasks, totalHours, isLoading } = useTaskDetails(date);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{format(date, 'EEEE dd MMMM yyyy', { locale: fr })}</span>
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="pb-2 pt-4 border-b">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total du jour</span>
            <span className="text-xl font-medium">
              {isLoading ? <Skeleton className="h-7 w-16" /> : `${totalHours.toFixed(1)} heures`}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Sessions de travail</h3>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((_, i) => (
                <div key={i} className="p-3 border rounded-md">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-3 max-h-[40vh] overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-md space-y-2">
                  <div className="font-medium">{task.task_type}</div>
                  
                  <div className="text-xs text-muted-foreground flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {formatTime(task.start_time)} - {task.end_time ? formatTime(task.end_time) : "En cours"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Durée:</span> {task.duration.toFixed(1)}h
                    </div>
                    
                    {task.equipment_name && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Équipement:</span> {task.equipment_name}
                      </div>
                    )}
                  </div>
                  
                  {task.notes && (
                    <div className="text-xs mt-1 border-t pt-1">
                      <span className="font-medium">Notes:</span> {task.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-muted-foreground text-sm">
              Aucune session pour cette journée
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
