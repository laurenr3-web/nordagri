import React from 'react';
import { Card } from '@/components/ui/card';
import { Beef, Wheat, Wrench, Hammer, Building2, MoreHorizontal } from 'lucide-react';
import { TimeEntryTaskType } from '@/hooks/time-tracking/types';

export interface QuickStartChoice {
  taskType: TimeEntryTaskType;
  customTaskType?: string;
}

interface QuickStartGridProps {
  onPick: (choice: QuickStartChoice) => void;
  onCustom: () => void;
}

const SHORTCUTS: Array<{
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  fg: string;
  choice: QuickStartChoice;
}> = [
  { label: 'Animaux', icon: Beef, bg: 'bg-rose-500/10', fg: 'text-rose-600', choice: { taskType: 'operation', customTaskType: 'Animaux' } },
  { label: 'Champs', icon: Wheat, bg: 'bg-amber-500/10', fg: 'text-amber-600', choice: { taskType: 'operation', customTaskType: 'Champs' } },
  { label: 'Équipement', icon: Wrench, bg: 'bg-blue-500/10', fg: 'text-blue-600', choice: { taskType: 'operation' } },
  { label: 'Maintenance', icon: Hammer, bg: 'bg-emerald-500/10', fg: 'text-emerald-600', choice: { taskType: 'maintenance' } },
  { label: 'Bâtiments', icon: Building2, bg: 'bg-violet-500/10', fg: 'text-violet-600', choice: { taskType: 'other', customTaskType: 'Bâtiments' } },
  { label: 'Autre', icon: MoreHorizontal, bg: 'bg-muted', fg: 'text-muted-foreground', choice: { taskType: 'other' } },
];

export function QuickStartGrid({ onPick, onCustom }: QuickStartGridProps) {
  return (
    <Card className="rounded-2xl shadow-sm w-full h-full">
      <div className="p-5 sm:p-6 flex flex-col gap-4 h-full min-w-0">
        <div>
          <h3 className="text-sm font-semibold">Démarrer une session</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Choisissez un type de travail</p>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
          {SHORTCUTS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => onPick(s.choice)}
                className="group flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors min-h-[80px]"
              >
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.bg} ${s.fg} shrink-0`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-center leading-tight">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onCustom}
          className="text-xs text-primary hover:underline text-left mt-auto"
        >
          Ou créer une session personnalisée →
        </button>
      </div>
    </Card>
  );
}