
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Activity } from '@/hooks/timetracking/useTimeTracking';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatDuration } from '@/lib/utils';
import { CalendarClock, Clock, Info, MapPin, Pause, Play, StopCircle, Timer, Tractor } from 'lucide-react';

interface ActivityDetailsDialogProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ActivityDetailsDialog: React.FC<ActivityDetailsDialogProps> = ({
  activity,
  open,
  onOpenChange
}) => {
  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{activity.taskName}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-2 mb-4">
            {getStatusBadge(activity.status)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Equipment</h3>
              <div className="flex items-center gap-2">
                <Tractor className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{activity.equipment}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Field</h3>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{activity.field} ({activity.fieldSize} ha)</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Started</h3>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatRelativeTime(activity.createdAt)}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatDuration(activity.duration)}</span>
              </div>
            </div>
          </div>
          
          {activity.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
              <div className="bg-secondary/20 p-3 rounded-md">
                <p>{activity.notes}</p>
              </div>
            </div>
          )}
          
          {activity.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <div className="bg-secondary/20 p-3 rounded-md">
                <p>{activity.description}</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper function for status badge
const getStatusBadge = (status: 'pending' | 'active' | 'paused' | 'completed') => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-secondary flex items-center gap-1 text-muted-foreground">
          <Clock size={12} />
          <span>Pending</span>
        </Badge>
      );
    case 'active':
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <Play size={12} />
          <span>Active</span>
        </Badge>
      );
    case 'paused':
      return (
        <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
          <Pause size={12} />
          <span>Paused</span>
        </Badge>
      );
    case 'completed':
      return (
        <Badge className="bg-agri-100 text-agri-800 flex items-center gap-1">
          <StopCircle size={12} />
          <span>Completed</span>
        </Badge>
      );
    default:
      return null;
  }
};

export default ActivityDetailsDialog;
