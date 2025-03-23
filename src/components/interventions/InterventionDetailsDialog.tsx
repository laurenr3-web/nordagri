
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle2, X, MapPin, User, CalendarCheck, Wrench } from 'lucide-react';

// Types from the Interventions page
interface Intervention {
  id: number;
  title: string;
  equipment: string;
  equipmentId: number;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'scheduled' | 'in-progress' | 'completed' | 'canceled';
  priority: 'high' | 'medium' | 'low';
  date: Date;
  duration?: number;
  scheduledDuration?: number;
  technician: string;
  description: string;
  partsUsed: Array<{ id: number; name: string; quantity: number; }>;
  notes: string;
}

interface InterventionDetailsDialogProps {
  intervention: Intervention | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (interventionId: number, status: 'scheduled' | 'in-progress' | 'completed' | 'canceled') => void;
}

const InterventionDetailsDialog: React.FC<InterventionDetailsDialogProps> = ({
  intervention,
  open,
  onOpenChange,
  onStatusChange
}) => {
  const { toast } = useToast();
  
  if (!intervention) return null;

  // Helper function to format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-secondary flex items-center gap-1 text-muted-foreground">
            <CalendarCheck size={12} />
            <span>Scheduled</span>
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-harvest-100 text-harvest-800 flex items-center gap-1">
            <Clock size={12} />
            <span>In Progress</span>
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-agri-100 text-agri-800 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Completed</span>
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
            <X size={12} />
            <span>Canceled</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-secondary text-muted-foreground">
            {status}
          </Badge>
        );
    }
  };
  
  // Helper function for priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge className="bg-red-100 text-red-800">High</Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-harvest-100 text-harvest-800">Medium</Badge>
        );
      case 'low':
        return (
          <Badge className="bg-agri-100 text-agri-800">Low</Badge>
        );
      default:
        return (
          <Badge variant="outline">{priority}</Badge>
        );
    }
  };

  const handleStatusChange = (status: 'scheduled' | 'in-progress' | 'completed' | 'canceled') => {
    if (onStatusChange && intervention) {
      onStatusChange(intervention.id, status);
      toast({
        title: "Status updated",
        description: `Intervention status updated to ${status}`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{intervention.title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(intervention.status)}
              {getPriorityBadge(intervention.priority)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex gap-2 items-start">
              <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Equipment</p>
                <p className="font-medium">{intervention.equipment} (ID: {intervention.equipmentId})</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Technician</p>
                <p className="font-medium">{intervention.technician}</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{intervention.location}</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <CalendarCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(intervention.date)}</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {intervention.status === 'completed' && intervention.duration ? 
                    `${intervention.duration} hrs (Actual)` : 
                    `${intervention.scheduledDuration} hrs (Scheduled)`
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="bg-secondary/50 p-3 rounded-md">{intervention.description}</p>
          </div>
          
          {intervention.partsUsed && intervention.partsUsed.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Parts Used</p>
              <div className="bg-secondary/50 p-3 rounded-md">
                {intervention.partsUsed.map((part) => (
                  <div key={part.id} className="flex justify-between text-sm mb-1 last:mb-0">
                    <span>{part.name}</span>
                    <span className="font-medium">Qty: {part.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {intervention.notes && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="bg-secondary/50 p-3 rounded-md">{intervention.notes}</p>
            </div>
          )}
          
          {/* Status controls */}
          {intervention.status !== 'completed' && intervention.status !== 'canceled' && (
            <div className="grid grid-cols-1 mt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {intervention.status !== 'in-progress' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleStatusChange('in-progress')}
                    >
                      <Clock size={14} />
                      <span>Start Work</span>
                    </Button>
                  )}
                  
                  {intervention.status !== 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleStatusChange('completed')}
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark as Completed</span>
                    </Button>
                  )}
                  
                  {intervention.status !== 'canceled' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleStatusChange('canceled')}
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </Button>
                  )}
                </div>
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

export default InterventionDetailsDialog;
