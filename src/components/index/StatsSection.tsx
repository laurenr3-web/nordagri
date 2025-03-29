
import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Stat } from '@/hooks/dashboard/useDashboardData';

interface StatsSectionProps {
  stats: Stat[];
  onStatClick: (type: string) => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats, onStatClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
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
          onClick={() => onStatClick(stat.title)}
        />
      ))}
    </div>
  );
};

export default StatsSection;
