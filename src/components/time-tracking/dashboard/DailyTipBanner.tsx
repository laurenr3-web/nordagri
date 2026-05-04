import React from 'react';
import { Card } from '@/components/ui/card';
import { Sprout, ArrowRight } from 'lucide-react';

export function DailyTipBanner() {
  return (
    <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-none">
      <div className="p-4 sm:p-5 flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
        <div className="shrink-0 rounded-xl bg-primary/15 p-2.5 text-primary">
          <Sprout className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Astuce du jour</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Utilisez les types de travail pour mieux analyser votre temps et optimiser vos activités.
          </p>
        </div>
        <button
          type="button"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
        >
          En savoir plus <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
}