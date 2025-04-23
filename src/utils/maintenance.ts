
import { MaintenancePlan } from '@/hooks/maintenance/useMaintenancePlanner';

export function isMaintenanceDue(plan: MaintenancePlan, equipment: any): boolean {
  // Vérifier d'abord si un seuil est défini
  if (!plan.trigger_unit || plan.trigger_unit === 'none') {
    return false;
  }

  // Récupérer la valeur actuelle selon l'unité
  const currentValue = plan.trigger_unit === 'hours'
    ? equipment?.valeur_actuelle || 0
    : equipment?.kilometers || 0;

  // Récupérer le seuil selon l'unité
  const threshold = plan.trigger_unit === 'hours'
    ? plan.trigger_hours || 0
    : plan.trigger_kilometers || 0;

  console.log(`Comparaison pour "${plan.title}": ${currentValue} >= ${threshold} (${plan.trigger_unit})`);

  // La maintenance est due si la valeur actuelle dépasse le seuil
  return currentValue >= threshold;
}

export function getMaintenanceRemainingValue(plan: MaintenancePlan, equipment: any): {
  value: number;
  unit: string;
  isOverdue: boolean;
} {
  if (!plan.trigger_unit || plan.trigger_unit === 'none') {
    return { value: 0, unit: '', isOverdue: false };
  }

  const currentValue = plan.trigger_unit === 'hours'
    ? equipment?.valeur_actuelle || 0
    : equipment?.kilometers || 0;

  const threshold = plan.trigger_unit === 'hours'
    ? plan.trigger_hours || 0
    : plan.trigger_kilometers || 0;

  const remaining = threshold - currentValue;
  const unit = plan.trigger_unit === 'hours' ? 'h' : 'km';

  return {
    value: Math.abs(remaining),
    unit,
    isOverdue: remaining <= 0
  };
}
