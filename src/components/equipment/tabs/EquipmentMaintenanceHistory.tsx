
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle2, FileText, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { BlurContainer } from '@/components/ui/blur-container';
import { Separator } from '@/components/ui/separator';
import { MaintenanceTask } from '@/services/supabase/maintenanceService';
import { Button } from '@/components/ui/button';

interface EquipmentMaintenanceHistoryProps {
  equipment: any;
}

const EquipmentMaintenanceHistory: React.FC<EquipmentMaintenanceHistoryProps> = ({ equipment }) => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<MaintenanceTask[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchMaintenanceHistory = async () => {
      try {
        setLoading(true);
        if (!id) return;
        
        // Récupérer toutes les tâches de maintenance
        const tasks = await maintenanceService.getTasks();
        
        // Filtrer pour ne garder que les tâches complétées pour cet équipement
        const completed = tasks.filter(task => 
          task.status === 'completed' && 
          (task.equipment_id === Number(id) || task.equipment === equipment?.name)
        );
        
        // Trier par date de complétion (la plus récente d'abord)
        completed.sort((a, b) => {
          const dateA = a.completed_date ? new Date(a.completed_date).getTime() : 0;
          const dateB = b.completed_date ? new Date(b.completed_date).getTime() : 0;
          return dateB - dateA;
        });
        
        setCompletedTasks(completed);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique de maintenance:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaintenanceHistory();
  }, [id, equipment]);
  
  // Filtrer les tâches par type
  const filterTasksByType = (type: string) => {
    if (type === 'all') return completedTasks;
    return completedTasks.filter(task => task.type === type);
  };
  
  const displayedTasks = filterTasksByType(activeTab);
  
  // Générer le rapport de maintenance
  const generateMaintenanceReport = () => {
    // Créer un contenu simple pour le rapport
    let reportContent = `RAPPORT DE MAINTENANCE - ${equipment?.name}\n\n`;
    reportContent += `Date du rapport: ${format(new Date(), 'dd/MM/yyyy')}\n\n`;
    reportContent += `Nombre total de maintenances: ${completedTasks.length}\n\n`;
    
    reportContent += "HISTORIQUE DES MAINTENANCES:\n";
    completedTasks.forEach((task, index) => {
      reportContent += `\n${index + 1}. ${task.title}\n`;
      reportContent += `   Type: ${task.type}\n`;
      reportContent += `   Date: ${task.completed_date ? format(new Date(task.completed_date), 'dd/MM/yyyy') : 'N/A'}\n`;
      reportContent += `   Durée: ${task.actual_duration || task.estimated_duration} heures\n`;
      reportContent += `   Technicien: ${task.assigned_to || 'Non spécifié'}\n`;
      reportContent += `   Notes: ${task.notes || 'Aucune note'}\n`;
    });
    
    // Créer un blob et télécharger le fichier
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-maintenance-${equipment?.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse text-center">
          <History className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Chargement de l'historique de maintenance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Historique de maintenance</h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateMaintenanceReport}
            disabled={completedTasks.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Exporter le rapport
          </Button>
        </div>
      </div>
      
      {completedTasks.length > 0 ? (
        <>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Toutes ({completedTasks.length})</TabsTrigger>
              <TabsTrigger value="preventive">Préventives ({filterTasksByType('preventive').length})</TabsTrigger>
              <TabsTrigger value="corrective">Correctives ({filterTasksByType('corrective').length})</TabsTrigger>
              <TabsTrigger value="condition-based">Conditionnelles ({filterTasksByType('condition-based').length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {displayedTasks.length === 0 ? (
                <BlurContainer className="p-8 text-center">
                  <p className="text-muted-foreground">Aucune maintenance de ce type n'a été réalisée.</p>
                </BlurContainer>
              ) : (
                <div className="space-y-4">
                  {displayedTasks.map((task) => (
                    <BlurContainer key={task.id} className="overflow-hidden animate-fade-in">
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">{task.title}</h3>
                              <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                <span>Complétée</span>
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">
                              {task.completed_date
                                ? format(new Date(task.completed_date), 'dd MMMM yyyy', { locale: fr })
                                : 'Date inconnue'}
                            </p>
                          </div>
                          
                          <Badge className={`
                            ${task.type === 'preventive' ? 'bg-blue-100 text-blue-800' :
                              task.type === 'corrective' ? 'bg-amber-100 text-amber-800' :
                              'bg-purple-100 text-purple-800'}
                          `}>
                            {task.type === 'preventive' ? 'Préventive' :
                             task.type === 'corrective' ? 'Corrective' : 'Conditionnelle'}
                          </Badge>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Durée</p>
                            <p className="font-medium">
                              {task.actual_duration ? `${task.actual_duration} heures (Réelle)` : `${task.estimated_duration} heures (Estimée)`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Réalisée par</p>
                            <p className="font-medium">{task.assigned_to || 'Non spécifié'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Priorité</p>
                            <p className="font-medium capitalize">{task.priority}</p>
                          </div>
                        </div>
                        
                        {task.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-1">Notes</p>
                            <p className="text-sm bg-secondary/50 p-3 rounded-md">{task.notes}</p>
                          </div>
                        )}
                      </div>
                    </BlurContainer>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Aucun historique de maintenance</h3>
            <p className="text-muted-foreground">
              Aucune tâche de maintenance n'a encore été complétée pour cet équipement.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EquipmentMaintenanceHistory;
