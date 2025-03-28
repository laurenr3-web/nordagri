
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Wrench } from 'lucide-react';
import { Intervention } from '@/types/Intervention';
import { formatDate } from './utils/interventionUtils';

interface InterventionsSidebarProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
}

const InterventionsSidebar: React.FC<InterventionsSidebarProps> = ({ 
  interventions, 
  onViewDetails 
}) => {
  // Calculate statistics
  const stats = {
    total: interventions.length,
    scheduled: interventions.filter(i => i.status === 'scheduled').length,
    inProgress: interventions.filter(i => i.status === 'in-progress').length,
    completed: interventions.filter(i => i.status === 'completed').length,
    canceled: interventions.filter(i => i.status === 'canceled').length
  };
  
  // Group interventions by equipment
  const equipmentStats = interventions.reduce((acc, intervention) => {
    acc[intervention.equipment] = (acc[intervention.equipment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="space-y-6">
      <BlurContainer className="p-4">
        <h3 className="font-medium mb-4">Interventions à venir</h3>
        <div className="space-y-4">
          {interventions
            .filter(intervention => intervention.status === 'scheduled')
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 3)
            .map((intervention) => (
              <div 
                key={intervention.id} 
                className="flex items-start gap-3 pb-3 border-b last:border-0 cursor-pointer hover:bg-secondary/20 p-2 rounded-md transition-colors"
                onClick={() => onViewDetails(intervention)}
                role="button"
                tabIndex={0}
                aria-label={`Voir les détails de l'intervention ${intervention.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onViewDetails(intervention);
                  }
                }}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center
                  ${intervention.priority === 'high' ? 'bg-red-100 text-red-800' : 
                    intervention.priority === 'medium' ? 'bg-harvest-100 text-harvest-800' : 
                    'bg-agri-100 text-agri-800'}`}>
                  <Wrench size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{intervention.title}</h4>
                  <p className="text-sm text-muted-foreground mb-1">{intervention.equipment}</p>
                  <p className="text-xs">Date: {formatDate(intervention.date)}</p>
                </div>
              </div>
            ))
          }
          
          {interventions.filter(i => i.status === 'scheduled').length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune intervention planifiée.</p>
          )}
        </div>
      </BlurContainer>
      
      <BlurContainer className="p-4">
        <h3 className="font-medium mb-4">Statistiques d'interventions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Total des interventions</span>
            <span className="font-medium">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Planifiées</span>
            <span className="font-medium">{stats.scheduled}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>En cours</span>
            <span className="font-medium">{stats.inProgress}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Terminées</span>
            <span className="font-medium">{stats.completed}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Annulées</span>
            <span className="font-medium">{stats.canceled}</span>
          </div>
        </div>
      </BlurContainer>
      
      <BlurContainer className="p-4">
        <h3 className="font-medium mb-4">Par équipement</h3>
        <div className="space-y-3">
          {Object.entries(equipmentStats)
            .sort((a, b) => b[1] - a[1])
            .map(([equipment, count]) => (
              <div key={equipment} className="flex items-center justify-between">
                <span className="truncate max-w-[75%]">{equipment}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
        </div>
      </BlurContainer>
    </div>
  );
};

export default InterventionsSidebar;
