
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { EquipmentCard } from '@/components/dashboard/EquipmentCard';
import { MaintenanceCalendar } from '@/components/dashboard/MaintenanceCalendar';
import { Button } from '@/components/ui/button';
import { BlurContainer } from '@/components/ui/blur-container';
import { cn } from '@/lib/utils';
import { Tractor, Wrench, Package, ClipboardCheck, AlertTriangle, Clock, CalendarClock, LayoutDashboard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

// Sample data
const statsData = [{
  title: 'Active Equipment',
  value: '24',
  icon: <Tractor className="text-primary h-5 w-5" />,
  trend: {
    value: 4,
    isPositive: true
  }
}, {
  title: 'Maintenance Tasks',
  value: '12',
  icon: <Wrench className="text-primary h-5 w-5" />,
  description: '3 high priority',
  trend: {
    value: 2,
    isPositive: false
  }
}, {
  title: 'Parts Inventory',
  value: '1,204',
  icon: <Package className="text-primary h-5 w-5" />,
  description: '8 items low stock',
  trend: {
    value: 12,
    isPositive: true
  }
}, {
  title: 'Field Interventions',
  value: '8',
  icon: <ClipboardCheck className="text-primary h-5 w-5" />,
  description: 'This week',
  trend: {
    value: 15,
    isPositive: true
  }
}];
const equipmentData = [{
  id: 1,
  name: 'John Deere 8R 410',
  type: 'Tractor',
  image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
  status: 'operational' as const,
  usage: {
    hours: 342,
    target: 500
  },
  nextService: {
    type: 'Filter Change',
    due: 'In 3 weeks'
  }
}, {
  id: 2,
  name: 'Case IH Axial-Flow',
  type: 'Combine Harvester',
  image: 'https://images.unsplash.com/photo-1599033329459-cc8c31c7eb6c?q=80&w=500&auto=format&fit=crop',
  status: 'maintenance' as const,
  usage: {
    hours: 480,
    target: 500
  },
  nextService: {
    type: 'Full Service',
    due: 'In 2 days'
  }
}, {
  id: 3,
  name: 'Kubota M7-172',
  type: 'Tractor',
  image: 'https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop',
  status: 'repair' as const,
  usage: {
    hours: 620,
    target: 500
  },
  nextService: {
    type: 'Engine Check',
    due: 'Overdue'
  }
}];

// Sample maintenance events
const maintenanceEvents = [{
  id: '1',
  title: 'Oil Change - Tractor #1',
  date: new Date(2023, new Date().getMonth(), 8),
  duration: 2,
  priority: 'medium' as const,
  equipment: 'John Deere 8R 410'
}, {
  id: '2',
  title: 'Harvester Inspection',
  date: new Date(2023, new Date().getMonth(), 12),
  duration: 4,
  priority: 'high' as const,
  equipment: 'Case IH Axial-Flow'
}, {
  id: '3',
  title: 'Filter Replacement',
  date: new Date(2023, new Date().getMonth(), 18),
  duration: 1,
  priority: 'low' as const,
  equipment: 'Kubota M7-172'
}, {
  id: '4',
  title: 'Hydraulic Check',
  date: new Date(2023, new Date().getMonth(), 18),
  duration: 2,
  priority: 'medium' as const,
  equipment: 'John Deere 8R 410'
}, {
  id: '5',
  title: 'Annual Service',
  date: new Date(2023, new Date().getMonth(), 24),
  duration: 8,
  priority: 'high' as const,
  equipment: 'John Deere 8R 410'
}];
const alertItems = [{
  id: 1,
  severity: 'high',
  message: 'Harvester engine overheating detected',
  time: '2 hours ago',
  equipment: 'Case IH Axial-Flow'
}, {
  id: 2,
  severity: 'medium',
  message: 'Low oil pressure warning on Tractor #3',
  time: '1 day ago',
  equipment: 'Kubota M7-172'
}, {
  id: 3,
  severity: 'low',
  message: 'Maintenance interval approaching for Tractor #1',
  time: '2 days ago',
  equipment: 'John Deere 8R 410'
}];
const upcomingTasks = [{
  id: 1,
  title: 'Oil and Filter Change',
  equipment: 'John Deere 8R 410',
  due: 'Tomorrow',
  priority: 'high',
  assignee: 'Michael Torres'
}, {
  id: 2,
  title: 'Hydraulic System Check',
  equipment: 'Case IH Axial-Flow',
  due: 'Jun 15',
  priority: 'medium',
  assignee: 'Sarah Johnson'
}, {
  id: 3,
  title: 'Tire Pressure Adjustment',
  equipment: 'Kubota M7-172',
  due: 'Jun 18',
  priority: 'low',
  assignee: 'David Chen'
}];

const Index = () => {
  // Current month for calendar
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');
  const navigate = useNavigate();

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

  return <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="chip chip-primary mb-2">Agricultural ERP Dashboard</div>
                <h1 className="text-3xl font-medium tracking-tight mb-1">Welcome Back</h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your agricultural equipment today
                </p>
              </div>
              
              <Tabs value={currentView} onValueChange={value => setCurrentView(value as 'main' | 'calendar' | 'alerts')} className="mt-4 sm:mt-0">
                <TabsList className="grid w-full grid-cols-3 md:w-auto mx-auto">
                  <TabsTrigger value="main" className="gap-2">
                    <LayoutDashboard size={16} />
                    <span className="px-[23px]">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="gap-2">
                    <CalendarClock size={16} />
                    <span>June 2023</span>
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="gap-2">
                    <AlertTriangle size={16} />
                    <span>Alerts</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </header>
          
          <Tabs value={currentView} className="space-y-8">
            <TabsContent value="main" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statsData.map((stat, index) => (
                  <StatsCard 
                    key={index} 
                    title={stat.title} 
                    value={stat.value} 
                    icon={stat.icon} 
                    description={stat.description} 
                    trend={stat.trend} 
                    className="animate-fade-in cursor-pointer" 
                    style={{
                      animationDelay: `${index * 0.1}s`
                    } as React.CSSProperties}
                    onClick={() => handleStatsCardClick(stat.title)}
                  />
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <DashboardSection title="Equipment Status" subtitle="Monitor your fleet performance" action={<Button variant="outline" size="sm" onClick={handleEquipmentViewAllClick}>
                        View All
                      </Button>}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {equipmentData.map((equipment, index) => (
                        <EquipmentCard 
                          key={equipment.id} 
                          name={equipment.name} 
                          type={equipment.type} 
                          image={equipment.image} 
                          status={equipment.status} 
                          usage={equipment.usage} 
                          nextService={equipment.nextService} 
                          className="" 
                          style={{
                            animationDelay: `${index * 0.15}s`
                          } as React.CSSProperties}
                          onClick={() => navigate(`/equipment/${equipment.id}`)}
                        />
                      ))}
                    </div>
                  </DashboardSection>
                  
                  <DashboardSection title="Maintenance Schedule" subtitle="Plan ahead for equipment servicing" action={<Button variant="outline" size="sm" onClick={handleMaintenanceCalendarClick}>
                        Full Calendar
                      </Button>}>
                    <MaintenanceCalendar events={maintenanceEvents} month={currentMonth} className="animate-scale-in" />
                  </DashboardSection>
                </div>
                
                <div className="space-y-8">
                  <DashboardSection title="System Alerts" subtitle="Recent notifications" action={<Button variant="outline" size="sm" onClick={handleAlertsViewAllClick}>
                        Clear All
                      </Button>}>
                    <BlurContainer className="divide-y animate-fade-in">
                      {alertItems.map(alert => <div key={alert.id} className="p-3 hover:bg-secondary/40 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className={cn("mt-0.5 h-2 w-2 rounded-full flex-shrink-0", alert.severity === 'high' ? "bg-destructive" : alert.severity === 'medium' ? "bg-harvest-500" : "bg-agri-500")} />
                            <div>
                              <p className="text-sm font-medium">{alert.message}</p>
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <span>{alert.equipment} • {alert.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>)}
                    </BlurContainer>
                  </DashboardSection>
                  
                  <DashboardSection title="Upcoming Tasks" subtitle="Scheduled maintenance" action={<Button variant="outline" size="sm" onClick={handleTasksAddClick}>
                        Add Task
                      </Button>}>
                    <BlurContainer className="divide-y animate-fade-in delay-100">
                      {upcomingTasks.map(task => <div key={task.id} className="p-4 hover:bg-secondary/40 transition-colors">
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", task.priority === 'high' ? "bg-red-100 text-red-800" : task.priority === 'medium' ? "bg-harvest-100 text-harvest-800" : "bg-agri-100 text-agri-800")}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{task.equipment}</p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              <span>Due: {task.due}</span>
                            </div>
                            <span className="text-muted-foreground">{task.assignee}</span>
                          </div>
                        </div>)}
                    </BlurContainer>
                  </DashboardSection>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-8">
              <DashboardSection title="Maintenance Calendar" subtitle="Detailed view of all scheduled maintenance">
                <div className="p-4">
                  <MaintenanceCalendar events={maintenanceEvents} month={currentMonth} className="animate-scale-in w-full" />
                </div>
              </DashboardSection>
            </TabsContent>
            
            <TabsContent value="alerts" className="space-y-8">
              <DashboardSection title="All System Alerts" subtitle="Complete list of all notifications and warnings" action={<Button variant="outline" size="sm">
                    Mark All as Read
                  </Button>}>
                <BlurContainer className="divide-y animate-fade-in">
                  {alertItems.concat(alertItems).map((alert, index) => <div key={`${alert.id}-${index}`} className="p-4 hover:bg-secondary/40 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={cn("mt-0.5 h-3 w-3 rounded-full flex-shrink-0", alert.severity === 'high' ? "bg-destructive" : alert.severity === 'medium' ? "bg-harvest-500" : "bg-agri-500")} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <span className="text-xs text-muted-foreground">{alert.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{alert.equipment}</p>
                        </div>
                      </div>
                    </div>)}
                </BlurContainer>
              </DashboardSection>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
};
export default Index;
