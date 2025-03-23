
import React from 'react';
import { Activity, ActiveTracking } from '@/hooks/timetracking/useTimeTracking';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, StopCircle, Timer, MapPin, Tractor } from 'lucide-react';
import { formatRelativeTime, formatDuration } from '@/lib/utils';

interface ActivityListProps {
  activities: Activity[];
  activeTracking: ActiveTracking | null;
  startTracking: (equipmentId: number, fieldId: number) => void;
  pauseTracking: () => void;
  stopTracking: () => void;
}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  activeTracking,
  startTracking,
  pauseTracking,
  stopTracking
}) => {
  if (activities.length === 0) {
    return (
      <div className="text-center p-10 border rounded-lg bg-background">
        <Clock className="w-12 h-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No Activities Yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Start tracking your equipment usage by creating a new activity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <BlurContainer key={activity.id} className="animate-fade-in">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="font-medium text-lg leading-tight mb-1">{activity.taskName}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tractor size={14} />
                  <span>{activity.equipment}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <MapPin size={14} />
                  <span>{activity.field}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(activity.status)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start Time</p>
                <p className="font-medium">
                  {new Date(activity.createdAt).toLocaleTimeString()} ({formatRelativeTime(activity.createdAt)})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <div className="flex items-center gap-2">
                  <Timer size={16} className="text-muted-foreground" />
                  <p className="font-medium">{formatDuration(activity.duration)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Field Size</p>
                <p className="font-medium">
                  {activity.fieldSize} ha
                </p>
              </div>
            </div>
            
            {activity.notes && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm bg-secondary/50 p-3 rounded-md">{activity.notes}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              {activeTracking && activeTracking.activityId === activity.id ? (
                <>
                  {activeTracking.status === 'active' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={pauseTracking}
                    >
                      <Pause size={14} />
                      <span>Pause</span>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => startTracking(activity.equipmentId, activity.fieldId)}
                    >
                      <Play size={14} />
                      <span>Resume</span>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                    onClick={stopTracking}
                  >
                    <StopCircle size={14} />
                    <span>Stop</span>
                  </Button>
                </>
              ) : (
                activity.status !== 'completed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                    onClick={() => startTracking(activity.equipmentId, activity.fieldId)}
                  >
                    <Play size={14} />
                    <span>Start Tracking</span>
                  </Button>
                )
              )}
            </div>
          </div>
        </BlurContainer>
      ))}
    </div>
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

export default ActivityList;
