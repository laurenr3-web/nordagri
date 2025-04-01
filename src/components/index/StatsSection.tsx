
import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Tractor, Wrench, Package, MapPin } from 'lucide-react';

interface StatItem {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface StatsSectionProps {
  stats: StatItem[];
  onStatClick: (type: string) => void;
}

const StatIconMap = {
  'Active Equipment': Tractor,
  'Maintenance Tasks': Wrench,
  'Parts Inventory': Package,
  'Field Interventions': MapPin,
};

const StatsSection: React.FC<StatsSectionProps> = ({ stats, onStatClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        // Utiliser l'icône spécifique de la stat ou trouver l'icône correspondante dans le mapping
        const IconComponent = stat.icon || StatIconMap[stat.title] || Package;
        
        return (
          <StatsCard 
            key={index} 
            title={stat.title} 
            value={stat.value} 
            icon={IconComponent} 
            description={stat.description} 
            trend={stat.trend} 
            className="animate-fade-in" 
            style={{
              animationDelay: `${index * 0.1}s`
            } as React.CSSProperties}
            onClick={() => onStatClick(stat.title)}
          />
        );
      })}
    </div>
  );
};

export default StatsSection;
