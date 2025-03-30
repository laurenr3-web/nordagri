import React, { useState } from 'react';
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
  severity: 'high' as const,
  message: 'Harvester engine overheating detected',
  time: '2 hours ago',
  equipment: 'Case IH Axial-Flow'
}, {
  id: 2,
  severity: 'medium' as const,
  message: 'Low oil pressure warning on Tractor #3',
  time: '1 day ago',
  equipment: 'Kubota M7-172'
}, {
  id: 3,
  severity: 'low' as const,
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

const DashboardPage = () => {
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
                  <AllAlertsSection alerts={alertItems.concat(alertItems.map(alert => ({...alert, id: alert.id + 100})))} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;
