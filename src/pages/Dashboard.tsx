
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import { Tractor, Wrench, Package, ClipboardCheck } from 'lucide-react';

// Composants refactorisés
import Header from '@/components/index/Header';
import Dashboard from '@/components/index/Dashboard';
import CalendarView from '@/components/index/CalendarView';
import AllAlertsSection from '@/components/index/AllAlertsSection';

// Services
import { equipmentService } from '@/services/supabase/equipmentService';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { getParts } from '@/services/supabase/parts';
import { interventionService } from '@/services/supabase/interventionService';

// Types
import { Part } from '@/types/Part';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { Intervention } from '@/types/Intervention';

// Définir le type pour les stats
interface Stat {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
}

const DashboardPage = () => {
  // Current month for calendar
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');
  const navigate = useNavigate();

  // États pour les données
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<Stat[]>([]);
  const [equipmentData, setEquipmentData] = useState<any[]>([]);
  const [maintenanceEvents, setMaintenanceEvents] = useState<any[]>([]);
  const [alertItems, setAlertItems] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);

  // Chargement des données depuis Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Récupérer les équipements
        const equipment = await equipmentService.getEquipment();
        
        // 2. Récupérer les tâches de maintenance
        const maintenanceTasks = await maintenanceService.getTasks();
        
        // 3. Récupérer les pièces
        const parts = await getParts();
        
        // 4. Récupérer les interventions
        const interventions = await interventionService.getInterventions();
        
        // 5. Construire les statistiques
        updateStatsData(equipment, maintenanceTasks, parts, interventions);
        
        // 6. Préparer les données d'équipement
        updateEquipmentData(equipment, maintenanceTasks);
        
        // 7. Préparer les événements de maintenance
        updateMaintenanceEvents(maintenanceTasks);
        
        // 8. Préparer les alertes
        updateAlerts(equipment, parts, maintenanceTasks);
        
        // 9. Préparer les tâches à venir
        updateUpcomingTasks(maintenanceTasks);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mettre à jour les statistiques
  const updateStatsData = (
    equipment: any[], 
    maintenanceTasks: MaintenanceTask[], 
    parts: Part[], 
    interventions: Intervention[]
  ) => {
    // 1. Nombre d'équipements actifs
    const operationalEquipment = equipment.filter(item => item.status === 'operational').length;
    
    // 2. Tâches de maintenance en attente
    const pendingMaintenance = maintenanceTasks.filter(task => 
      task.status !== 'completed' && task.status !== 'cancelled'
    ).length;
    
    // 3. Nombre de pièces à stock bas
    const lowStockParts = parts.filter(part => 
      part.stock <= (part.reorderPoint || 5)
    ).length;
    
    // 4. Interventions de cette semaine
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const weeklyInterventions = interventions.filter(intervention => {
      const date = new Date(intervention.date);
      return date >= weekStart && date < weekEnd;
    }).length;

    // Construire les stats
    setStatsData([
      {
        title: 'Active Equipment',
        value: operationalEquipment.toString(),
        icon: <Tractor className="text-primary h-5 w-5" />,
        trend: {
          value: 4, // À améliorer avec des données historiques
          isPositive: true
        }
      }, 
      {
        title: 'Maintenance Tasks',
        value: pendingMaintenance.toString(),
        icon: <Wrench className="text-primary h-5 w-5" />,
        description: `${maintenanceTasks.filter(task => task.priority === 'high' && task.status !== 'completed').length} high priority`,
        trend: {
          value: 2, // À améliorer avec des données historiques
          isPositive: false
        }
      }, 
      {
        title: 'Parts Inventory',
        value: parts.length.toString(),
        icon: <Package className="text-primary h-5 w-5" />,
        description: `${lowStockParts} items low stock`,
        trend: {
          value: 12, // À améliorer avec des données historiques
          isPositive: true
        }
      }, 
      {
        title: 'Field Interventions',
        value: weeklyInterventions.toString(),
        icon: <ClipboardCheck className="text-primary h-5 w-5" />,
        description: 'This week',
        trend: {
          value: 15, // À améliorer avec des données historiques
          isPositive: true
        }
      }
    ]);
  };

  // Transformer les données d'équipement
  const updateEquipmentData = (equipment: any[], maintenanceTasks: MaintenanceTask[]) => {
    const formattedEquipment = equipment.slice(0, 3).map(item => {
      // Trouver la prochaine maintenance pour cet équipement
      const nextMaintenance = maintenanceTasks
        .filter(task => task.equipmentId === item.id && task.status !== 'completed')
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
      
      return {
        id: item.id,
        name: item.name,
        type: item.type || 'Unknown',
        image: item.image || 'https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop',
        status: item.status || 'operational',
        usage: {
          hours: item.hours || 342,
          target: 500
        },
        nextService: nextMaintenance ? {
          type: nextMaintenance.type,
          due: getDueString(nextMaintenance.dueDate)
        } : {
          type: 'No maintenance scheduled',
          due: 'N/A'
        }
      };
    });

    setEquipmentData(formattedEquipment);
  };

  // Transformer les événements de maintenance
  const updateMaintenanceEvents = (maintenanceTasks: MaintenanceTask[]) => {
    const events = maintenanceTasks.slice(0, 5).map(task => ({
      id: task.id.toString(),
      title: task.title,
      date: task.dueDate,
      duration: task.estimatedDuration || 2,
      priority: task.priority,
      equipment: task.equipment
    }));

    setMaintenanceEvents(events);
  };

  // Transformer les alertes
  const updateAlerts = (equipment: any[], parts: Part[], maintenanceTasks: MaintenanceTask[]) => {
    const alerts = [];
    
    // Alertes pour les équipements en panne
    equipment.filter(item => item.status === 'repair').forEach(item => {
      alerts.push({
        id: `eq-${item.id}`,
        severity: 'high',
        message: `${item.name} requires repair`,
        time: '24 hours ago',
        equipment: item.name
      });
    });
    
    // Alertes pour les pièces à stock bas
    parts.filter(part => part.stock <= (part.reorderPoint || 5)).slice(0, 2).forEach(part => {
      alerts.push({
        id: `part-${part.id}`,
        severity: 'medium',
        message: `Low stock alert: ${part.name}`,
        time: '48 hours ago',
        equipment: 'Inventory'
      });
    });
    
    // Alertes pour les maintenances en retard
    const today = new Date();
    maintenanceTasks.filter(task => 
      task.status !== 'completed' && 
      task.dueDate < today
    ).slice(0, 2).forEach(task => {
      alerts.push({
        id: `maint-${task.id}`,
        severity: 'low',
        message: `Overdue maintenance: ${task.title}`,
        time: '72 hours ago',
        equipment: task.equipment
      });
    });
    
    setAlertItems(alerts.slice(0, 3));
  };

  // Transformer les tâches à venir
  const updateUpcomingTasks = (maintenanceTasks: MaintenanceTask[]) => {
    const today = new Date();
    const filteredTasks = maintenanceTasks.filter(task => 
      task.status !== 'completed' && 
      task.dueDate >= today
    ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 3);
    
    const mappedTasks = filteredTasks.map(task => ({
      id: task.id,
      title: task.title,
      equipment: task.equipment,
      due: getDueString(task.dueDate),
      priority: task.priority,
      assignee: task.assignedTo || 'Unassigned'
    }));
    
    setUpcomingTasks(mappedTasks);
  };

  // Helper pour les dates relatives
  const getDueString = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) return 'Today';
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    if (taskDate < today) return 'Overdue';
    
    return `${date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}`;
  };

  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'Active Equipment':
        navigate('/equipment');
        break;
      case 'Maintenance Tasks':
        navigate('/maintenance');
        break;
      case 'Parts Inventory':
        navigate('/parts');
        break;
      case 'Field Interventions':
        navigate('/interventions');
        break;
    }
  };

  const handleEquipmentViewAllClick = () => {
    navigate('/equipment');
  };

  const handleMaintenanceCalendarClick = () => {
    navigate('/maintenance');
  };

  const handleAlertsViewAllClick = () => {
    setCurrentView('alerts');
  };

  const handleTasksAddClick = () => {
    navigate('/maintenance');
  };
  
  const handleEquipmentClick = (id: number) => {
    navigate(`/equipment/${id}`);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 w-full">
          <div className="pt-6 pb-16 px-4 sm:px-8 md:px-12">
            <div className="max-w-7xl mx-auto">
              <Header 
                currentView={currentView}
                setCurrentView={setCurrentView}
              />
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Chargement des données...</p>
                  </div>
                </div>
              ) : (
                <Tabs value={currentView} className="space-y-8">
                  <TabsContent value="main">
                    <Dashboard 
                      statsData={statsData}
                      equipmentData={equipmentData}
                      maintenanceEvents={maintenanceEvents}
                      alertItems={alertItems}
                      upcomingTasks={upcomingTasks}
                      currentMonth={currentMonth}
                      handleStatsCardClick={handleStatsCardClick}
                      handleEquipmentViewAllClick={handleEquipmentViewAllClick}
                      handleMaintenanceCalendarClick={handleMaintenanceCalendarClick}
                      handleAlertsViewAllClick={handleAlertsViewAllClick}
                      handleTasksAddClick={handleTasksAddClick}
                      handleEquipmentClick={handleEquipmentClick}
                    />
                  </TabsContent>
                  
                  <TabsContent value="calendar">
                    <CalendarView 
                      events={maintenanceEvents} 
                      month={currentMonth} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="alerts">
                    <AllAlertsSection alerts={alertItems} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;
