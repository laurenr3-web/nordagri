import React from 'react';
import { Users, ClipboardList, PackageMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Props {
  activeUsers: number;
  unassignedTasks: number;
  lowStockParts: number;
}

export const DashboardContextBar: React.FC<Props> = ({ activeUsers, unassignedTasks, lowStockParts }) => {
  const navigate = useNavigate();
  const chips = [
    { icon: Users, value: activeUsers, label: 'actifs', tone: 'default' as const, onClick: () => navigate('/time-tracking') },
    { icon: ClipboardList, value: unassignedTasks, label: 'non assignées', tone: unassignedTasks > 0 ? ('warn' as const) : ('default' as const), onClick: () => navigate('/planning') },
    { icon: PackageMinus, value: lowStockParts, label: 'stock bas', tone: lowStockParts > 0 ? ('warn' as const) : ('default' as const), onClick: () => navigate('/parts') },
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
              'flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:bg-accent/50 min-w-0',
              c.tone === 'warn' && 'border-amber-500/40 bg-amber-500/5'
            )}
          >
            <Icon className={cn('h-4 w-4 flex-shrink-0', c.tone === 'warn' ? 'text-amber-600' : 'text-muted-foreground')} />
            <div className="min-w-0">
              <div className="text-base font-semibold leading-none">{c.value}</div>
              <div className="text-[10px] text-muted-foreground truncate">{c.label}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
