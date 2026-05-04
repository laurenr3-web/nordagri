
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TimeTrackingHeaderProps {
  onNewSession: () => void;
}

export function TimeTrackingHeader({ onNewSession }: TimeTrackingHeaderProps) {
  const today = format(new Date(), "EEEE d MMMM", { locale: fr });
  const capitalizedDay = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Suivi du temps</h1>
        <p className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          <span>Synchronisé · {capitalizedDay}</span>
        </p>
      </div>
      <Button
        id="start-time-session-btn"
        onClick={onNewSession}
        size="lg"
        className="rounded-xl shadow-sm w-full sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        Nouvelle session
      </Button>
    </div>
  );
}
