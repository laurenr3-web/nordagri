
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FarmModules, useFarmModules } from '@/hooks/settings/useFarmModules';

export function ModulesConfiguration() {
  const { modules, isLoading, updateModules } = useFarmModules();

  const handleModuleChange = (key: keyof FarmModules) => {
    updateModules({ [key]: !modules[key] });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-10" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Modules de l'application</CardTitle>
        <CardDescription>
          Activez ou désactivez les fonctionnalités pour cette ferme. Les données ne sont pas supprimées, seulement masquées.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="equipment">Équipements</Label>
            <p className="text-sm text-muted-foreground">
              Gestion des machines et équipements
            </p>
          </div>
          <Switch
            id="equipment"
            checked={modules.show_equipment}
            onCheckedChange={() => handleModuleChange('show_equipment')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="maintenance">Maintenance</Label>
            <p className="text-sm text-muted-foreground">
              Planification et suivi des maintenances
            </p>
          </div>
          <Switch
            id="maintenance"
            checked={modules.show_maintenance}
            onCheckedChange={() => handleModuleChange('show_maintenance')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="parts">Pièces détachées</Label>
            <p className="text-sm text-muted-foreground">
              Gestion du stock de pièces
            </p>
          </div>
          <Switch
            id="parts"
            checked={modules.show_parts}
            onCheckedChange={() => handleModuleChange('show_parts')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="time-tracking">Suivi du temps</Label>
            <p className="text-sm text-muted-foreground">
              Enregistrement des heures de travail
            </p>
          </div>
          <Switch
            id="time-tracking"
            checked={modules.show_time_tracking}
            onCheckedChange={() => handleModuleChange('show_time_tracking')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="interventions">Interventions</Label>
            <p className="text-sm text-muted-foreground">
              Gestion des interventions sur site
            </p>
          </div>
          <Switch
            id="interventions"
            checked={modules.show_interventions}
            onCheckedChange={() => handleModuleChange('show_interventions')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reports">Rapports</Label>
            <p className="text-sm text-muted-foreground">
              Génération et exportation de rapports
            </p>
          </div>
          <Switch
            id="reports"
            checked={modules.show_reports}
            onCheckedChange={() => handleModuleChange('show_reports')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
