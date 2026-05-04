
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TimeTrackingHeaderProps {
  onNewSession: () => void;
}

export function TimeTrackingHeader({ onNewSession }: TimeTrackingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Suivi du temps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérer les sessions, l'équipe et l'historique
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
