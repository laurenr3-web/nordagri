
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { EquipmentCard } from '@/components/dashboard/EquipmentCard';
import { MaintenanceCalendar } from '@/components/dashboard/MaintenanceCalendar';
import { BlurContainer } from '@/components/ui/blur-container';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { 
  statsData, 
  equipmentData, 
  maintenanceEvents, 
  alertItems, 
  upcomingTasks 
} from '@/data/dashboardData';

interface MainDashboardViewProps {
  currentMonth: Date;
}

const MainDashboardView: React.FC<MainDashboardViewProps> = ({ currentMonth }) => {
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

  const handleTasksAddClick = () => {
    navigate('/maintenance');
  };

  return (
    <div className="space-y-8">
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
          <DashboardSection 
            title="Equipment Status" 
            subtitle="Monitor your fleet performance" 
            action={
              <Button variant="outline" size="sm" onClick={handleEquipmentViewAllClick}>
                View All
              </Button>
            }
          >
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
          
          <DashboardSection 
            title="Maintenance Schedule" 
            subtitle="Plan ahead for equipment servicing" 
            action={
              <Button variant="outline" size="sm" onClick={handleMaintenanceCalendarClick}>
                Full Calendar
              </Button>
            }
          >
            <MaintenanceCalendar 
              events={maintenanceEvents} 
              month={currentMonth} 
              className="animate-scale-in" 
            />
          </DashboardSection>
        </div>
        
        <div className="space-y-8">
          <DashboardSection 
            title="System Alerts" 
            subtitle="Recent notifications" 
            action={
              <Button variant="outline" size="sm" onClick={() => {}}>
                Clear All
              </Button>
            }
          >
            <BlurContainer className="divide-y animate-fade-in">
              {alertItems.map(alert => (
                <div key={alert.id} className="p-3 hover:bg-secondary/40 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "mt-0.5 h-2 w-2 rounded-full flex-shrink-0", 
                      alert.severity === 'high' ? "bg-destructive" : 
                      alert.severity === 'medium' ? "bg-harvest-500" : "bg-agri-500"
                    )} />
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <span>{alert.equipment} • {alert.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </BlurContainer>
          </DashboardSection>
          
          <DashboardSection 
            title="Upcoming Tasks" 
            subtitle="Scheduled maintenance" 
            action={
              <Button variant="outline" size="sm" onClick={handleTasksAddClick}>
                Add Task
              </Button>
            }
          >
            <BlurContainer className="divide-y animate-fade-in delay-100">
              {upcomingTasks.map(task => (
                <div key={task.id} className="p-4 hover:bg-secondary/40 transition-colors">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full", 
                      task.priority === 'high' ? "bg-red-100 text-red-800" : 
                      task.priority === 'medium' ? "bg-harvest-100 text-harvest-800" : 
                      "bg-agri-100 text-agri-800"
                    )}>
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
                </div>
              ))}
            </BlurContainer>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
};

export default MainDashboardView;
