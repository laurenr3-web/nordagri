
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, Plus, Tool, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { maintenanceService } from '@/core/maintenance';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { toast } from 'sonner';

interface EquipmentMaintenanceProps {
  equipment: EquipmentItem;
}

const EquipmentMaintenance: React.FC<EquipmentMaintenanceProps> = ({ equipment }) => {
  const [loading, setLoading] = useState(true);
  const [maintenanceTasks, setMaintenanceTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchMaintenanceTasks = async () => {
      try {
        setLoading(true);
        // We'll modify this to fetch from real data when available
        // For now, we're using mock data
        const mockTasks = [
          {
            id: 1,
            title: 'Vidange et changement de filtres',
            type: 'preventive',
            status: 'scheduled',
            priority: 'medium',
            dueDate: new Date(2023, 7, 15),
            estimatedDuration: 2,
            assignedTo: 'Martin Dubois'
          },
          {
            id: 2,
            title: 'Inspection des courroies',
            type: 'condition-based',
            status: 'in-progress',
            priority: 'high',
            dueDate: new Date(2023, 6, 28),
            estimatedDuration: 1,
            assignedTo: 'Sophie Martin'
          },
          {
            id: 3,
            title: 'Remplacement du système hydraulique',
            type: 'corrective',
            status: 'completed',
            priority: 'critical',
            dueDate: new Date(2023, 5, 10),
            completedDate: new Date(2023, 5, 12),
            estimatedDuration: 4,
            actualDuration: 5,
            assignedTo: 'Luc Bernard'
          }
        ];
        
        setTimeout(() => {
          setMaintenanceTasks(mockTasks);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching maintenance tasks:', error);
        toast.error('Impossible de charger les tâches de maintenance');
        setLoading(false);
      }
    };

    fetchMaintenanceTasks();
  }, [equipment.id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-blue-500 hover:bg-blue-600';
      case 'low': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Planifié</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">En cours</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-500">Terminé</Badge>;
      case 'pending-parts':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">En attente de pièces</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const handleAddTask = () => {
    toast.info('Fonctionnalité à venir : Ajouter une tâche de maintenance');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Maintenance de l'équipement</h2>
        <Button onClick={handleAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

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
              <Tool className="h-4 w-4 mr-2 text-green-500" />
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

      <Card>
        <CardHeader>
          <CardTitle>Calendrier de maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : maintenanceTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tâche</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Date prévue</TableHead>
                  <TableHead>Durée estimée</TableHead>
                  <TableHead>Assigné à</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      {task.type === 'preventive' ? 'Préventive' : 
                       task.type === 'corrective' ? 'Corrective' : 
                       task.type === 'condition-based' ? 'Conditionnelle' : task.type}
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority === 'critical' ? 'Critique' :
                         task.priority === 'high' ? 'Haute' :
                         task.priority === 'medium' ? 'Moyenne' :
                         task.priority === 'low' ? 'Basse' : task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(task.dueDate)}</TableCell>
                    <TableCell>{task.estimatedDuration}h</TableCell>
                    <TableCell>{task.assignedTo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune tâche de maintenance n'a été trouvée pour cet équipement</p>
              <Button variant="outline" className="mt-4" onClick={handleAddTask}>
                Planifier une maintenance
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentMaintenance;
