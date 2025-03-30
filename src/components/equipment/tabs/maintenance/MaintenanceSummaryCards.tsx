
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Wrench, AlertTriangle } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';

interface MaintenanceSummaryCardsProps {
  maintenanceTasks: MaintenanceTask[];
  formatDate: (date: Date) => string;
}

const MaintenanceSummaryCards: React.FC<MaintenanceSummaryCardsProps> = ({ 
  maintenanceTasks, 
  formatDate 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            Prochaine maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {maintenanceTasks.filter(t => t.status === 'scheduled').length > 0 
              ? formatDate(maintenanceTasks.filter(t => t.status === 'scheduled')[0].dueDate)
              : 'Aucune planifiée'}
          </p>
          <p className="text-sm text-muted-foreground">
            {maintenanceTasks.filter(t => t.status === 'scheduled').length > 0 
              ? maintenanceTasks.filter(t => t.status === 'scheduled')[0].title
              : 'Planifiez votre première maintenance'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Wrench className="h-4 w-4 mr-2 text-green-500" />
            Maintenances complétées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {maintenanceTasks.filter(t => t.status === 'completed').length}
          </p>
          <p className="text-sm text-muted-foreground">
            Dernière maintenance: {maintenanceTasks.filter(t => t.status === 'completed').length > 0 
              ? formatDate(maintenanceTasks.filter(t => t.status === 'completed')[0].completedDate || new Date())
              : 'N/A'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
            Maintenances en retard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {maintenanceTasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length}
          </p>
          <p className="text-sm text-muted-foreground">
            {maintenanceTasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length > 0 
              ? 'Attention : interventions requises'
              : 'Aucune maintenance en retard'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceSummaryCards;
