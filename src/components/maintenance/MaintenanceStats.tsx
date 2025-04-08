
import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, PieChart } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { formatDate } from './MaintenanceUtils';
import { Widget } from '@/components/ui/widget';
import { Progress } from '@/components/ui/progress';
import { BlurContainer } from '@/components/ui/blur-container';

interface MaintenanceStatsProps {
  tasks: MaintenanceTask[];
  upcomingTasks: MaintenanceTask[];
}

const MaintenanceStats: React.FC<MaintenanceStatsProps> = ({ tasks, upcomingTasks }) => {
  // Calculer les statistiques
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Statistiques par type
  const typeStats = {
    preventive: tasks.filter(t => t.type === 'preventive').length,
    corrective: tasks.filter(t => t.type === 'corrective').length,
    conditionBased: tasks.filter(t => t.type === 'condition-based').length || 0
  };
  
  // Statistiques par priorité
  const priorityStats = {
    critical: tasks.filter(t => t.priority === 'critical').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length || 0
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tâches à venir */}
      <Widget 
        title="Prochaines maintenances"
        icon={Clock}
        variant="accent"
        delay={0}
      >
        <div className="space-y-4">
          {upcomingTasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center
                ${task.priority === 'critical' ? 'bg-destructive/20 text-destructive' : 
                  task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                  'bg-secondary text-muted-foreground'}`}>
                {task.type === 'preventive' ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}
              </div>
              <div>
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-sm text-muted-foreground mb-1">{task.equipment}</p>
                <p className="text-xs bg-background/70 px-2 py-1 rounded-full inline-block">
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </div>
          ))}
          
          {upcomingTasks.length === 0 && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune tâche à venir</p>
            </div>
          )}
        </div>
      </Widget>
      
      {/* Progression globale */}
      <Widget
        title="Progression globale"
        icon={PieChart}
        variant="primary"
        delay={0.1}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium text-xl">{completion}%</span>
          </div>
          <Progress value={completion} className="h-2" />
          <div className="text-sm text-center text-muted-foreground mt-2">
            {completedTasks} sur {totalTasks} tâches complétées
          </div>
        </div>
      </Widget>
      
      {/* Types de maintenance */}
      <BlurContainer className="overflow-hidden">
        <div className="p-4">
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium">Maintenance par type</h3>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Préventive</span>
              <span className="font-medium">{typeStats.preventive}</span>
            </div>
            <Progress value={(typeStats.preventive / totalTasks) * 100} className="h-1.5" indicatorClassName="bg-blue-500" />
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm">Corrective</span>
              <span className="font-medium">{typeStats.corrective}</span>
            </div>
            <Progress value={(typeStats.corrective / totalTasks) * 100} className="h-1.5" indicatorClassName="bg-harvest-500" />
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm">Conditionnelle</span>
              <span className="font-medium">{typeStats.conditionBased}</span>
            </div>
            <Progress value={(typeStats.conditionBased / totalTasks) * 100} className="h-1.5" indicatorClassName="bg-purple-500" />
          </div>
        </div>
      </BlurContainer>
      
      {/* Priorités */}
      <BlurContainer className="overflow-hidden">
        <div className="p-4">
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center mr-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="font-medium">Maintenance par priorité</h3>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive"></div>
                <span className="text-sm">Critique</span>
              </div>
              <span className="font-medium">{priorityStats.critical}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Haute</span>
              </div>
              <span className="font-medium">{priorityStats.high}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-harvest-500"></div>
                <span className="text-sm">Moyenne</span>
              </div>
              <span className="font-medium">{priorityStats.medium}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-agri-500"></div>
                <span className="text-sm">Basse</span>
              </div>
              <span className="font-medium">{priorityStats.low}</span>
            </div>
          </div>
        </div>
      </BlurContainer>
    </div>
  );
};

export default MaintenanceStats;
