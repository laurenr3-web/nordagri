
import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';

interface StatData {
  title: string;
  value: string | number;
  icon: React.ComponentType;
  description: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface DashboardStatsProps {
  statsData: StatData[];
  isEditing?: boolean; // Make isEditing optional
  onStatsCardClick: (type: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  statsData,
  isEditing = false, // Default to false
  onStatsCardClick
}) => {
  // Function to provide additional details for the StatsCards
  const getStatCardDetails = (title: string) => {
    switch(title) {
      case "Active Equipment":
        return (
          <div className="space-y-2">
            <p className="text-sm">Équipements actifs par catégorie:</p>
            <ul className="space-y-1">
              <li className="flex justify-between"><span>Tracteurs</span> <span className="font-medium">12</span></li>
              <li className="flex justify-between"><span>Moissonneuses</span> <span className="font-medium">5</span></li>
              <li className="flex justify-between"><span>Irrigation</span> <span className="font-medium">8</span></li>
              <li className="flex justify-between"><span>Autres</span> <span className="font-medium">7</span></li>
            </ul>
          </div>
        );
      case "Maintenance Tasks":
        return "Comprend les maintenances préventives programmées, les maintenances correctives et les vérifications de routine.";
      case "Parts Inventory":
        return (
          <div className="space-y-2">
            <p className="text-sm">Valeur totale de stock: <span className="font-medium">24 560 €</span></p>
            <p className="text-sm">Pièces en dessous du seuil minimum: <span className="font-medium text-alert-red">14</span></p>
          </div>
        );
      case "Field Interventions":
        return "Interventions techniques sur le terrain, incluant les réparations, diagnostics et installations.";
      default:
        return undefined;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statsData.map((stat, index) => {
        // Get the icon component
        const IconComponent = stat.icon;
        
        return (
          <StatsCard 
            key={index} 
            title={stat.title} 
            value={stat.value} 
            icon={IconComponent} 
            description={stat.description} 
            trend={stat.trend} 
            details={getStatCardDetails(stat.title)}
            style={{
              animationDelay: `${index * 0.1}s`
            } as React.CSSProperties}
            onClick={() => onStatsCardClick(stat.title)}
          />
        );
      })}
    </div>
  );
};
