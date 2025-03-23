
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause } from 'lucide-react';
import { ActiveTracking } from '@/hooks/timetracking/useTimeTracking';
import { formatDuration } from '@/lib/utils';

interface ActiveTrackingBadgeProps {
  activeTracking: ActiveTracking;
}

const ActiveTrackingBadge: React.FC<ActiveTrackingBadgeProps> = ({ activeTracking }) => {
  return (
    <Badge variant="outline" className="px-3 py-2 flex items-center gap-2 bg-secondary">
      {activeTracking.status === 'active' ? (
        <Play size={14} className="text-green-600" />
      ) : (
        <Pause size={14} className="text-amber-600" />
      )}
      <span className="text-sm font-medium">
        {activeTracking.equipment} • {formatDuration(activeTracking.duration)}
      </span>
      <Clock size={14} className="text-muted-foreground" />
    </Badge>
  );
};

export default ActiveTrackingBadge;
