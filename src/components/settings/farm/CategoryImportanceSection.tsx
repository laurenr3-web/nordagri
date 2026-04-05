
import React from 'react';
import { SettingsSectionWrapper } from '../SettingsSectionWrapper';
import { useFarmId } from '@/hooks/useFarmId';
import { useCategoryImportance } from '@/hooks/planning/useCategoryImportance';
import { PlanningPriority } from '@/services/planning/planningService';
import { Loader2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  animaux: '🐄 Animaux',
  champs: '🌾 Champs',
  alimentation: '🥩 Alimentation',
  equipement: '🔧 Équipement',
  batiment: '🏠 Bâtiment',
  administration: '📋 Administration',
  autre: '📌 Autre',
};

const PRIORITY_OPTIONS: { value: PlanningPriority; label: string; color: string }[] = [
  { value: 'critical', label: 'Critique', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700' },
  { value: 'important', label: 'Important', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700' },
  { value: 'todo', label: 'À faire', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' },
];

export function CategoryImportanceSection() {
  const { farmId, isLoading: farmLoading } = useFarmId();
  const { categories, isLoading, updateImportance } = useCategoryImportance(farmId);

  if (farmLoading || isLoading) {
    return (
      <SettingsSectionWrapper
        title="Priorité par catégorie"
        description="Définissez l'importance par défaut de chaque catégorie de tâche"
        icon={<Tag className="h-5 w-5 text-primary" />}
        showSaveButton={false}
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </SettingsSectionWrapper>
    );
  }

  if (!farmId) return null;

  return (
    <SettingsSectionWrapper
      title="Priorité par catégorie"
      description="Définissez l'importance par défaut de chaque catégorie pour la planification. Les nouvelles tâches hériteront automatiquement de cette priorité."
      icon={<Tag className="h-5 w-5 text-primary" />}
      showSaveButton={false}
    >
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card"
          >
            <span className="text-sm font-medium min-w-0 truncate">
              {CATEGORY_LABELS[cat.category] || cat.category}
            </span>
            <div className="flex gap-1.5 shrink-0">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (cat.importance !== opt.value) {
                      updateImportance.mutate({ id: cat.id, importance: opt.value });
                    }
                  }}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md border transition-all',
                    cat.importance === opt.value
                      ? opt.color
                      : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-muted-foreground mt-4">
          💡 Les modifications sont appliquées immédiatement. La priorité par catégorie détermine la priorité calculée des nouvelles tâches dans le module Planification.
        </p>
      </div>
    </SettingsSectionWrapper>
  );
}
