
import React from 'react';
import { ModulesConfiguration } from '@/components/settings/ModulesConfiguration';

export function SettingsCustomization() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">Personnalisation de l'interface</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Adaptez l'application à vos besoins spécifiques
        </p>
      </div>
      
      <ModulesConfiguration />
    </div>
  );
}
