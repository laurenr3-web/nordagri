
import React, { useState } from 'react';
import { Activity, ActiveTracking } from '@/hooks/timetracking/useTimeTracking';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, StopCircle, Timer, MapPin, Tractor, CalendarClock, Info } from 'lucide-react';
import { formatRelativeTime, formatDuration } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

interface ActivityListProps {
  activities: Activity[];
  activeTracking: ActiveTracking | null;
  startTracking: (equipmentId: number, fieldId: number) => void;
  pauseTracking: () => void;
  stopTracking: () => void;
  onViewDetails?: (activity: Activity) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  activeTracking,
  startTracking,
  pauseTracking,
  stopTracking,
  onViewDetails
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
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Recent Activities</h2>
      
      <Carousel className="w-full" opts={{ align: "start" }}>
        <CarouselContent className="-ml-4">
          {activities.map((activity, index) => (
            <CarouselItem key={activity.id} className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <ActivityCard 
                activity={activity} 
                activeTracking={activeTracking}
                startTracking={startTracking}
                pauseTracking={pauseTracking}
                stopTracking={stopTracking}
                onViewDetails={onViewDetails}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-end gap-2 mt-4">
          <CarouselPrevious className="static transform-none" />
          <CarouselNext className="static transform-none" />
        </div>
      </Carousel>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {activities.map((activity, index) => (
          <ActivityCard 
            key={activity.id}
            activity={activity} 
            activeTracking={activeTracking}
            startTracking={startTracking}
            pauseTracking={pauseTracking}
            stopTracking={stopTracking}
            onViewDetails={onViewDetails}
            animationDelay={index * 0.05}
          />
        ))}
      </div>
    </div>
  );
};

// ActivityCard component for each activity
const ActivityCard: React.FC<{
  activity: Activity;
  activeTracking: ActiveTracking | null;
  startTracking: (equipmentId: number, fieldId: number) => void;
  pauseTracking: () => void;
  stopTracking: () => void;
  onViewDetails?: (activity: Activity) => void;
  animationDelay?: number;
}> = ({ 
  activity, 
  activeTracking, 
  startTracking, 
  pauseTracking, 
  stopTracking, 
  onViewDetails,
  animationDelay = 0
}) => {
  return (
    <BlurContainer 
      className="overflow-hidden animate-scale-in h-full"
      style={{ animationDelay: `${animationDelay}s` } as React.CSSProperties}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg leading-tight">{activity.taskName}</h3>
          {getStatusBadge(activity.status)}
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Tractor size={14} />
          <span>{activity.equipment}</span>
          <span className="text-muted-foreground/50">•</span>
          <MapPin size={14} />
          <span>{activity.field}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-secondary/30 rounded-md p-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <CalendarClock size={14} />
              <span>Started</span>
            </div>
            <p className="font-medium text-sm">
              {formatRelativeTime(activity.createdAt)}
            </p>
          </div>
          
          <div className="bg-secondary/30 rounded-md p-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <Timer size={14} />
              <span>Duration</span>
            </div>
            <p className="font-medium text-sm">
              {formatDuration(activity.duration)}
            </p>
          </div>
        </div>
        
        {activity.notes && (
          <div className="mb-4 bg-secondary/20 p-3 rounded-md text-sm">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="line-clamp-2">{activity.notes}</p>
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => onViewDetails(activity)}
            >
              <Info size={14} />
              <span>Details</span>
            </Button>
          )}
          
          <div className="flex gap-2 ml-auto">
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
                  <span>Start</span>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </BlurContainer>
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
