import React from 'react';
import { useMaintenanceSuggestions, MaintenanceSuggestion } from '@/hooks/planning/useMaintenanceSuggestions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Plus } from 'lucide-react';

interface MaintenanceSuggestionsProps {
  farmId: string | null;
  userId: string | null;
}

export function MaintenanceSuggestions({ farmId, userId }: MaintenanceSuggestionsProps) {
  const { suggestions, isLoading, createTask } = useMaintenanceSuggestions(farmId, userId);

  if (isLoading || suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
        <Wrench className="h-4 w-4" />
        Maintenances dues
      </div>
      {suggestions.map((s) => (
        <SuggestionCard key={s.id} suggestion={s} onCreateTask={() => createTask.mutate(s)} isCreating={createTask.isPending} />
      ))}
    </div>
  );
}

function SuggestionCard({ suggestion, onCreateTask, isCreating }: { suggestion: MaintenanceSuggestion; onCreateTask: () => void; isCreating: boolean }) {
  const badgeLabel = suggestion.isCounterBased
    ? suggestion.counterLabel
    : suggestion.daysLate > 0
      ? `En retard de ${suggestion.daysLate} jour${suggestion.daysLate > 1 ? 's' : ''}`
      : 'Due aujourd\'hui';

  return (
    <div className="border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{suggestion.title}</p>
          <p className="text-xs text-muted-foreground truncate">{suggestion.equipmentName}</p>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs border-amber-400 text-amber-700 dark:text-amber-400 whitespace-nowrap">
          {suggestion.isCounterBased ? "Seuil d'entretien dépassé" : badgeLabel}
        </Badge>
      </div>
      <Button size="sm" variant="outline" className="w-full text-xs" onClick={onCreateTask} disabled={isCreating}>
        <Plus className="h-3 w-3 mr-1" />
        Créer une tâche
      </Button>
    </div>
  );
}
