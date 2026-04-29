import { cn } from '@/lib/utils';
import { PointPriority } from '@/types/Point';
import { PRIORITY_BADGE_CLASS, PRIORITY_LABELS } from './pointHelpers';

export const PointPriorityBadge = ({ priority, className }: { priority: PointPriority; className?: string }) => (
  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', PRIORITY_BADGE_CLASS[priority], className)}>
    {PRIORITY_LABELS[priority]}
  </span>
);