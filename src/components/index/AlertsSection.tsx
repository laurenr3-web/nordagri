
import React from 'react';
import { Button } from '@/components/ui/button';
import { BlurContainer } from '@/components/ui/blur-container';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { cn } from '@/lib/utils';

interface AlertItem {
  id: number; // Ensure this is number to match our interface
  severity: 'high' | 'medium' | 'low';
  message: string;
  time: string;
  equipment: string;
}

interface AlertsSectionProps {
  alerts: AlertItem[];
  onViewAllClick: () => void;
}

const AlertsSection: React.FC<AlertsSectionProps> = ({ alerts, onViewAllClick }) => {
  return (
    <DashboardSection 
      title="Alertes système" 
      subtitle="Notifications récentes" 
      action={
        <Button variant="outline" size="sm" onClick={onViewAllClick}>
          Tout effacer
        </Button>
      }
    >
      <BlurContainer className="divide-y animate-fade-in">
        {alerts.map(alert => (
          <div key={alert.id} className="p-3 hover:bg-secondary/40 transition-colors">
            <div className="flex items-start space-x-3">
              <div 
                className={cn(
                  "mt-0.5 h-2 w-2 rounded-full flex-shrink-0", 
                  alert.severity === 'high' ? "bg-destructive" : 
                  alert.severity === 'medium' ? "bg-harvest-500" : "bg-agri-500"
                )} 
              />
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
  );
};

export default AlertsSection;
