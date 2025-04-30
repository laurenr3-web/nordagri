
import React from 'react';
import { Bell } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Bell className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">Aucune notification</h3>
      <p className="text-sm text-muted-foreground max-w-[250px] mt-1">
        Vous n'avez pas de notifications pour le moment. Nous vous préviendrons lorsque quelque chose d'important arrivera.
      </p>
    </div>
  );
}
