
import React from 'react';
import { SettingsSection } from '../SettingsSection';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Puzzle } from 'lucide-react';

interface ModulesSectionProps {
  modules: string[];
  onToggleModule: (module: string, enabled: boolean) => Promise<boolean>;
  loading: boolean;
}

export function ModulesSection({ modules, onToggleModule, loading }: ModulesSectionProps) {
  const moduleOptions = [
    { id: 'maintenance', label: 'Maintenance', description: 'Suivi des tâches de maintenance des équipements' },
    { id: 'parts', label: 'Pièces détachées', description: 'Gestion du stock de pièces détachées' },
    { id: 'interventions', label: 'Interventions', description: 'Planification et suivi des interventions' },
    { id: 'time-tracking', label: 'Suivi du temps', description: 'Suivi du temps de travail' },
    { id: 'fuel', label: 'Carburant', description: 'Suivi de la consommation de carburant' }
  ];

  const handleToggle = async (moduleId: string, checked: boolean) => {
    await onToggleModule(moduleId, checked);
  };

  return (
    <SettingsSection 
      title="Modules activés" 
      description="Configurez les modules que vous souhaitez utiliser dans l'application"
      icon={<Puzzle className="h-5 w-5" />}
    >
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Chargement des modules...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {moduleOptions.map((module) => (
            <div key={module.id} className="flex items-center justify-between border-b pb-3">
              <Label htmlFor={`module-${module.id}`} className="flex-grow">
                <span className="font-medium">{module.label}</span>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              </Label>
              <Switch 
                id={`module-${module.id}`} 
                checked={modules.includes(module.id)}
                onCheckedChange={(checked) => handleToggle(module.id, checked)}
              />
            </div>
          ))}
        </div>
      )}
    </SettingsSection>
  );
}
