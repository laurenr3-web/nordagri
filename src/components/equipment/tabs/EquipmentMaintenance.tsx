
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, Plus, Wrench, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { maintenanceService } from '@/core/maintenance';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { toast } from 'sonner';
import NewMaintenanceDialog from './maintenance/NewMaintenanceDialog';
import { useTasksManager } from '@/hooks/maintenance/useTasksManager';

interface EquipmentMaintenanceProps {
  equipment: EquipmentItem;
}

const EquipmentMaintenance: React.FC<EquipmentMaintenanceProps> = ({ equipment }) => {
  const [loading, setLoading] = useState(true);
  const [isNewMaintenanceOpen, setIsNewMaintenanceOpen] = useState(false);
  
  // Utiliser le hook useTasksManager pour gérer les tâches de maintenance
  const {
    tasks: maintenanceTasks,
    isLoading: tasksLoading,
    addTask,
    updateTaskStatus,
    updateTaskPriority
  } = useTasksManager();

  // État pour stocker la tâche sélectionnée pour voir le devis
  const [selectedTaskForQuote, setSelectedTaskForQuote] = useState<number | null>(null);

  useEffect(() => {
    // Déjà géré par useTasksManager, mais on ajoute un délai simulé pour l'UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
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
    setIsNewMaintenanceOpen(true);
  };

  const handleCreateMaintenance = (maintenance: any) => {
    try {
      // Préparer les données pour l'API
      const maintenanceTask = {
        title: maintenance.title,
        equipment: equipment.name,
        equipmentId: equipment.id,
        type: maintenance.type,
        status: 'scheduled',
        priority: maintenance.priority,
        dueDate: maintenance.dueDate,
        estimatedDuration: maintenance.estimatedDuration,
        assignedTo: '',
        notes: maintenance.notes || ''
      };
      
      // Ajouter la tâche via le hook
      addTask(maintenanceTask);
      
      // Fermer la boîte de dialogue
      setIsNewMaintenanceOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
      toast.error('Impossible d\'ajouter la tâche de maintenance');
    }
  };

  const handleViewQuote = (taskId: number) => {
    setSelectedTaskForQuote(taskId);
    toast.info(`Affichage du devis pour la tâche ${taskId}`);
    // Dans une implémentation réelle, vous pourriez ouvrir un dialogue pour afficher le devis
  };

  const handleChangeStatus = (taskId: number, newStatus: string) => {
    try {
      updateTaskStatus(taskId, newStatus as any);
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Impossible de mettre à jour le statut');
    }
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
                  <TableHead>Actions</TableHead>
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
                    <TableCell>{task.assignedTo || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewQuote(task.id)}
                          title="Voir le devis"
                        >
                          <FileText className="h-4 w-4 text-blue-500" />
                        </Button>
                        
                        {task.status !== 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleChangeStatus(task.id, 'completed')}
                            title="Marquer comme terminé"
                          >
                            <Wrench className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
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

      {/* Dialog pour créer une nouvelle maintenance */}
      {isNewMaintenanceOpen && (
        <NewMaintenanceDialog
          equipment={equipment}
          isOpen={isNewMaintenanceOpen}
          onClose={() => setIsNewMaintenanceOpen(false)}
          onSubmit={handleCreateMaintenance}
        />
      )}
    </div>
  );
};

export default EquipmentMaintenance;
