
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Calendar, CheckCircle2, Clock, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BlurContainer } from '@/components/ui/blur-container';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';

interface MaintenanceDashboardProps {
  tasks: MaintenanceTask[];
  periodStart?: Date;
  periodEnd?: Date;
}

const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({ 
  tasks,
  periodStart = subMonths(new Date(), 3),
  periodEnd = new Date()
}) => {
  // Filtrer les tâches pour la période spécifiée
  const tasksInPeriod = tasks.filter(task => {
    const taskDate = task.completedDate || task.dueDate;
    return taskDate >= periodStart && taskDate <= periodEnd;
  });
  
  // Données pour le graphique circulaire des types de maintenance
  const typeStats = [
    { name: 'Préventive', value: tasksInPeriod.filter(t => t.type === 'preventive').length },
    { name: 'Corrective', value: tasksInPeriod.filter(t => t.type === 'corrective').length },
    { name: 'Conditionnelle', value: tasksInPeriod.filter(t => t.type === 'condition-based').length },
  ].filter(item => item.value > 0);
  
  // Données pour le graphique circulaire des statuts
  const statusStats = [
    { name: 'Planifiée', value: tasksInPeriod.filter(t => t.status === 'scheduled').length },
    { name: 'En cours', value: tasksInPeriod.filter(t => t.status === 'in-progress').length },
    { name: 'Terminée', value: tasksInPeriod.filter(t => t.status === 'completed').length },
    { name: 'En attente de pièces', value: tasksInPeriod.filter(t => t.status === 'pending-parts').length },
  ].filter(item => item.value > 0);
  
  // Couleurs pour le graphique des types
  const COLORS_TYPE = ['#0088FE', '#FFBB28', '#AA00FF'];
  
  // Couleurs pour le graphique des statuts
  const COLORS_STATUS = ['#00C49F', '#0088FE', '#4CAF50', '#FF9900'];
  
  // Données pour le graphique des heures de maintenance par équipement
  const equipmentHoursData = React.useMemo(() => {
    const equipmentHours: Record<string, number> = {};
    
    tasksInPeriod.forEach(task => {
      if (task.status === 'completed') {
        const hours = task.actualDuration || task.engineHours;
        equipmentHours[task.equipment] = (equipmentHours[task.equipment] || 0) + hours;
      }
    });
    
    return Object.entries(equipmentHours)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5); // Top 5 équipements
  }, [tasksInPeriod]);
  
  // Calculer les statistiques globales
  const totalTasks = tasksInPeriod.length;
  const completedTasks = tasksInPeriod.filter(t => t.status === 'completed').length;
  const totalPlannedHours = tasksInPeriod.reduce((sum, task) => sum + task.engineHours, 0);
  const totalActualHours = tasksInPeriod
    .filter(t => t.status === 'completed')
    .reduce((sum, task) => sum + (task.actualDuration || task.engineHours), 0);
  
  // Statistiques de complétion
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Prochaines tâches (limitées aux 3 plus proches)
  const upcomingTasks = tasks
    .filter(t => t.status === 'scheduled' && t.dueDate > new Date())
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold mb-2">{completionRate}%</div>
              <Progress value={completionRate} className="w-full h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {completedTasks} sur {totalTasks} tâches complétées
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Heures de maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold mb-1">{totalActualHours.toFixed(1)}</div>
              <div className="flex items-center gap-1 text-sm">
                <span>sur</span>
                <span className="font-medium">{totalPlannedHours.toFixed(1)}</span>
                <span>heures planifiées</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalActualHours > totalPlannedHours ? 'Dépassement de ' : 'Économie de '}
                {Math.abs(totalActualHours - totalPlannedHours).toFixed(1)} heures
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prochaine maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length > 0 ? (
              <div className="flex flex-col items-center">
                <div className="text-xl font-bold mb-1 text-center">
                  {format(upcomingTasks[0].dueDate, "d MMMM", { locale: fr })}
                </div>
                <Badge variant="outline" className="mb-1">
                  {upcomingTasks[0].title}
                </Badge>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {upcomingTasks[0].equipment}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Aucune maintenance planifiée
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des tâches</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="type">
              <TabsList className="mb-4">
                <TabsTrigger value="type">Par type</TabsTrigger>
                <TabsTrigger value="status">Par statut</TabsTrigger>
              </TabsList>
              
              <TabsContent value="type" className="h-[260px]">
                {typeStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} tâches`, 'Nombre']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">Aucune donnée disponible</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="status" className="h-[260px]">
                {statusStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} tâches`, 'Nombre']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">Aucune donnée disponible</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Heures par équipement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              {equipmentHoursData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={equipmentHoursData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" unit=" h" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value} heures`, 'Temps de maintenance']} />
                    <Bar dataKey="hours" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Prochaines maintenances
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {upcomingTasks.length > 0 ? (
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <BlurContainer key={task.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.equipment}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge 
                          variant="outline" 
                          className={`
                            ${task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'}
                          `}
                        >
                          {task.priority === 'critical' ? 'Critique' :
                           task.priority === 'high' ? 'Haute' :
                           task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </Badge>
                        <span className="text-sm mt-1 font-medium">
                          {format(task.dueDate, "d MMMM yyyy", { locale: fr })}
                        </span>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{task.engineHours} heures</span>
                      </div>
                      
                      <div>
                        {task.assignedTo ? (
                          <span>Assignée à: <span className="font-medium">{task.assignedTo}</span></span>
                        ) : (
                          <span className="text-muted-foreground">Non assignée</span>
                        )}
                      </div>
                    </div>
                  </div>
                </BlurContainer>
              ))}
              
              <div className="flex justify-center mt-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir toutes les tâches
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucune tâche en attente</h3>
              <p className="text-muted-foreground">
                Toutes les tâches de maintenance ont été complétées.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceDashboard;
