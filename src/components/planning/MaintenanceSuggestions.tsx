import React, { useState } from 'react';
import { useMaintenanceSuggestions, MaintenanceSuggestion } from '@/hooks/planning/useMaintenanceSuggestions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Plus, CalendarClock, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
        <SuggestionCard
          key={s.id}
          suggestion={s}
          onCreateTask={(date?: string) => createTask.mutate({ suggestion: s, date })}
          isCreating={createTask.isPending}
        />
      ))}
    </div>
  );
}

function getDateStr(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function SuggestionCard({ suggestion, onCreateTask, isCreating }: {
  suggestion: MaintenanceSuggestion;
  onCreateTask: (date?: string) => void;
  isCreating: boolean;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const badgeLabel = suggestion.isCounterBased
    ? "Seuil d'entretien dépassé"
    : suggestion.daysLate > 0
      ? `En retard de ${suggestion.daysLate} jour${suggestion.daysLate > 1 ? 's' : ''}`
      : "Due aujourd'hui";

  const tomorrowStr = getDateStr(1);

  return (
    <div className="border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{suggestion.title}</p>
          <p className="text-xs text-muted-foreground truncate">{suggestion.equipmentName}</p>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs border-amber-400 text-amber-700 dark:text-amber-400 whitespace-nowrap">
          {badgeLabel}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onCreateTask()} disabled={isCreating}>
          <Plus className="h-3 w-3 mr-1" />
          Aujourd'hui
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onCreateTask(tomorrowStr)} disabled={isCreating}>
          <CalendarClock className="h-3 w-3 mr-1" />
          Demain
        </Button>
        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="text-xs px-2" disabled={isCreating}>
              <Calendar className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarUI
              mode="single"
              locale={fr}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              onSelect={(date) => {
                if (date) {
                  onCreateTask(format(date, 'yyyy-MM-dd'));
                  setShowDatePicker(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
