
import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Tractor, Wrench, Package, MapPin } from 'lucide-react';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';

interface StatsSectionProps {
  onStatClick: (type: string) => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({ onStatClick }) => {
  const { stats, loading } = useDashboardStats();

  const statsItems = [
    {
      title: 'Active Equipment',
      value: stats.activeEquipment.toString(),
      icon: Tractor,
      description: ''
    },
    {
      title: 'Maintenance Tasks',
      value: stats.maintenanceTasks.total.toString(),
      icon: Wrench,
      description: stats.maintenanceTasks.highPriority > 0 
        ? `${stats.maintenanceTasks.highPriority} high priority`
        : ''
    },
    {
      title: 'Parts Inventory',
      value: stats.partsInventory.total.toString(),
      icon: Package,
      description: stats.partsInventory.lowStock > 0 
        ? `${stats.partsInventory.lowStock} items low stock`
        : ''
    },
    {
      title: 'Field Interventions',
      value: stats.fieldInterventions.toString(),
      icon: MapPin,
      description: 'Active interventions'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
        {[...Array(4)].map((_, index) => (
          <div 
            key={index}
            className="h-32 bg-muted rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statsItems.map((stat, index) => (
        <StatsCard 
          key={index}
          title={stat.title} 
          value={stat.value} 
          icon={stat.icon} 
          description={stat.description}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * 0.1}s`
          }}
          onClick={() => onStatClick(stat.title)}
        />
      ))}
    </div>
  );
};

export default StatsSection;
