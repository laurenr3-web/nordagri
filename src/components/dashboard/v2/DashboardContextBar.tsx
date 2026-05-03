import React from 'react';
import { Users, ClipboardList, Eye, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Props {
  activeUsers: number;
  unassignedTasks: number;
  pointsToWatch: number;
}

export const DashboardContextBar: React.FC<Props> = ({ activeUsers, unassignedTasks, pointsToWatch }) => {
  const navigate = useNavigate();
  const chips = [
    { icon: Users, value: activeUsers, label: 'actifs', tone: 'default' as const, onClick: () => navigate('/time-tracking') },
    { icon: ClipboardList, value: unassignedTasks, label: 'non assig.', tone: unassignedTasks > 0 ? ('warn' as const) : ('default' as const), onClick: () => navigate('/planning') },
    { icon: Eye, value: pointsToWatch, label: 'à surveiller', tone: pointsToWatch > 0 ? ('warn' as const) : ('default' as const), onClick: () => navigate('/points') },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {chips.map((c, i) => {
        const Icon = c.icon;
        return (
          <button
            key={i}
            type="button"
            onClick={c.onClick}
            className={cn(
              'flex items-center gap-1 rounded-full border bg-card px-2.5 py-2 text-left transition-colors hover:bg-accent/50 min-w-0 shadow-sm',
              c.tone === 'warn' && 'border-amber-500/40'
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', c.tone === 'warn' ? 'text-amber-600' : 'text-muted-foreground')} />
            <span className="text-xs font-semibold shrink-0">{c.value}</span>
            <span className="text-[11px] text-muted-foreground truncate flex-1 min-w-0">{c.label}</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 hidden sm:block" />
          </button>
        );
      })}
    </div>
  );
};
