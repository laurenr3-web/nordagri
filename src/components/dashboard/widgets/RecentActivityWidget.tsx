import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, FileText, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { RecentActivityItem } from '@/hooks/dashboard/useRecentActivityData';

interface Props {
  data: RecentActivityItem[] | null;
  loading: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
}

const KIND_ICON = {
  task_done: <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />,
  point_created: <AlertCircle className="h-4 w-4 text-destructive shrink-0" />,
  point_event: <FileText className="h-4 w-4 text-muted-foreground shrink-0" />,
} as const;

export const RecentActivityWidget = ({ data, loading }: Props) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Aucune activité récente</span>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {data.map((item) => (
        <li key={item.id}>
          <button
            onClick={() => navigate(item.link)}
            className="w-full flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-md hover:bg-accent/50 transition-colors text-left"
          >
            {KIND_ICON[item.kind]}
            <span className="text-sm text-foreground flex-1 truncate">{item.title}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: fr })}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};