
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Wrench, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
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
    <div className="space-y-8 mt-4">
      <h2 className="text-2xl font-semibold mb-2">Aperçu des interventions</h2>
      
      <BlurContainer className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 mr-2 text-agri-600" />
          <h3 className="font-medium text-lg">Interventions à venir</h3>
        </div>
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
                  <Wrench size={18} />
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
            <p className="text-sm text-muted-foreground py-2">Aucune intervention planifiée.</p>
          )}
        </div>
      </BlurContainer>
      
      <BlurContainer className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <CheckCircle2 className="h-5 w-5 mr-2 text-agri-600" />
          <h3 className="font-medium text-lg">Statistiques d'interventions</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground">Total des interventions</span>
            <span className="font-medium text-lg">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="flex items-center text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-agri-500 mr-2"></div>
              Planifiées
            </span>
            <span className="font-medium">{stats.scheduled}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="flex items-center text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-harvest-500 mr-2"></div>
              En cours
            </span>
            <span className="font-medium">{stats.inProgress}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="flex items-center text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-agri-700 mr-2"></div>
              Terminées
            </span>
            <span className="font-medium">{stats.completed}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="flex items-center text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
              Annulées
            </span>
            <span className="font-medium">{stats.canceled}</span>
          </div>
        </div>
      </BlurContainer>
      
      <BlurContainer className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <Wrench className="h-5 w-5 mr-2 text-agri-600" />
          <h3 className="font-medium text-lg">Par équipement</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(equipmentStats)
            .sort((a, b) => b[1] - a[1])
            .map(([equipment, count], index) => (
              <div key={equipment} className="flex items-center justify-between py-1">
                <span className="flex items-center truncate max-w-[75%] text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    index % 3 === 0 ? 'bg-agri-500' : 
                    index % 3 === 1 ? 'bg-harvest-500' : 
                    'bg-soil-500'
                  }`}></div>
                  {equipment}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            
          {Object.keys(equipmentStats).length === 0 && (
            <p className="text-sm text-muted-foreground py-2">Aucun équipement avec des interventions.</p>
          )}
        </div>
      </BlurContainer>
    </div>
  );
};

export default InterventionsSidebar;
