
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Map, List, Clock } from 'lucide-react';
import { ActiveTracking } from '@/hooks/timetracking/useTimeTracking';
import ActiveTrackingBadge from './ActiveTrackingBadge';

interface TimeTrackingHeaderProps {
  isMapViewActive: boolean;
  setIsMapViewActive: (isActive: boolean) => void;
  onAddActivity: () => void;
  activeTracking: ActiveTracking | null;
}

const TimeTrackingHeader: React.FC<TimeTrackingHeaderProps> = ({
  isMapViewActive,
  setIsMapViewActive,
  onAddActivity,
  activeTracking
}) => {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-4 pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track equipment usage time and field activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={onAddActivity} className="gap-1">
            <Plus size={16} />
            <span>New Activity</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <div className="bg-secondary rounded-lg p-1 flex">
            <Button
              variant={isMapViewActive ? "secondary" : "ghost"}
              size="sm"
              className="gap-1"
              onClick={() => setIsMapViewActive(false)}
            >
              <List size={16} />
              <span className="hidden sm:inline">List</span>
            </Button>
            <Button
              variant={isMapViewActive ? "ghost" : "secondary"}
              size="sm"
              className="gap-1"
              onClick={() => setIsMapViewActive(true)}
            >
              <Map size={16} />
              <span className="hidden sm:inline">Map</span>
            </Button>
          </div>
        </div>
        
        {activeTracking && (
          <ActiveTrackingBadge activeTracking={activeTracking} />
        )}
      </div>
    </div>
  );
};

export default TimeTrackingHeader;
