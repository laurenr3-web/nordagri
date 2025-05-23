
import React from 'react';
import { SettingsSectionWrapper } from '../SettingsSectionWrapper';
import { ModuleCard } from './ModuleCard';
import { 
  Wrench, 
  Fuel, 
  Package, 
  TrendingUp,
  Calendar,
  FileText,
  Users,
  BarChart
} from 'lucide-react';
import { Blocks } from 'lucide-react';

interface ModulesSectionProps {
  modules: any;
  onToggleModule: (moduleKey: string, enabled: boolean) => Promise<boolean>;
  loading: boolean;
}

const MODULES_CONFIG = [
  {
    key: 'maintenance',
    title: 'Maintenance',
    description: 'Planification et suivi de la maintenance des équipements',
    icon: Wrench,
    category: 'essential'
  },
  {
    key: 'fuel',
    title: 'Carburant',
    description: 'Gestion de la consommation de carburant',
    icon: Fuel,
    category: 'essential'
  },
  {
    key: 'parts',
    title: 'Pièces détachées',
    description: 'Inventaire et gestion des pièces',
    icon: Package,
    category: 'essential'
  },
  {
    key: 'performance',
    title: 'Performance',
    description: 'Analyse des performances et statistiques',
    icon: TrendingUp,
    category: 'advanced',
    badge: 'Premium'
  },
  {
    key: 'planning',
    title: 'Planification',
    description: 'Calendrier et planification des tâches',
    icon: Calendar,
    category: 'advanced',
    badge: 'Bientôt'
  },
  {
    key: 'documents',
    title: 'Documents',
    description: 'Gestion documentaire centralisée',
    icon: FileText,
    category: 'advanced',
    badge: 'Bientôt'
  },
  {
    key: 'team',
    title: 'Équipe',
    description: 'Gestion des équipes et permissions',
    icon: Users,
    category: 'advanced'
  },
  {
    key: 'analytics',
    title: 'Analytiques',
    description: 'Tableaux de bord et rapports avancés',
    icon: BarChart,
    category: 'advanced',
    badge: 'Premium'
  }
];

export function ModulesSection({ modules, onToggleModule, loading }: ModulesSectionProps) {
  const essentialModules = MODULES_CONFIG.filter(m => m.category === 'essential');
  const advancedModules = MODULES_CONFIG.filter(m => m.category === 'advanced');

  return (
    <SettingsSectionWrapper 
      title="Modules de l'application" 
      description="Activez ou désactivez les fonctionnalités selon vos besoins"
      icon={<Blocks className="h-5 w-5 text-primary" />}
      showSaveButton={false}
    >
      <div className="space-y-6">
        {/* Modules essentiels */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Modules essentiels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {essentialModules.map((module) => (
              <ModuleCard
                key={module.key}
                title={module.title}
                description={module.description}
                icon={module.icon}
                enabled={modules[module.key] ?? false}
                onToggle={() => onToggleModule(module.key, !modules[module.key])}
                disabled={loading}
                badge={module.badge}
              />
            ))}
          </div>
        </div>

        {/* Modules avancés */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Modules avancés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {advancedModules.map((module) => (
              <ModuleCard
                key={module.key}
                title={module.title}
                description={module.description}
                icon={module.icon}
                enabled={modules[module.key] ?? false}
                onToggle={() => onToggleModule(module.key, !modules[module.key])}
                disabled={loading || module.badge === 'Bientôt'}
                badge={module.badge}
              />
            ))}
          </div>
        </div>

        {/* Message d'information */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 Les modifications des modules sont appliquées immédiatement. 
            Certains modules premium nécessitent un abonnement actif.
          </p>
        </div>
      </div>
    </SettingsSectionWrapper>
  );
}
