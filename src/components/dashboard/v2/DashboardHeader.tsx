import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  firstName?: string | null;
}

export const DashboardHeader: React.FC<Props> = ({ firstName }) => {
  const today = format(new Date(), 'EEEE d MMMM', { locale: fr });
  return (
    <div className="flex flex-col gap-0.5">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
        Bonjour {firstName || ''} <span aria-hidden>👋</span>
      </h1>
      <p className="text-sm text-muted-foreground capitalize">{today}</p>
    </div>
  );
};
