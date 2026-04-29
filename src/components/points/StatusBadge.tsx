import { cn } from '@/lib/utils';
import { PointStatus } from '@/types/Point';
import { STATUS_BADGE_CLASS, STATUS_LABELS } from './pointHelpers';

export const PointStatusBadge = ({ status, className }: { status: PointStatus; className?: string }) => (
  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', STATUS_BADGE_CLASS[status], className)}>
    {STATUS_LABELS[status]}
  </span>
);