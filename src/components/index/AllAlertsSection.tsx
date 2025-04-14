
import React from 'react';
import { Button } from '@/components/ui/button';
import { BlurContainer } from '@/components/ui/blur-container';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { cn } from '@/lib/utils';
import { AlertItem } from '@/hooks/dashboard/types/dashboardTypes';

interface AllAlertsSectionProps {
  alerts: AlertItem[];
}

const AllAlertsSection: React.FC<AllAlertsSectionProps> = ({ alerts }) => {
  return (
    <DashboardSection 
      title="All System Alerts" 
      subtitle="Complete list of all notifications and warnings" 
      action={
        <Button variant="outline" size="sm">
          Mark All as Read
        </Button>
      }
    >
      <BlurContainer className="divide-y animate-fade-in">
        {alerts.map((alert, index) => (
          <div key={`${alert.id}-${index}`} className="p-4 hover:bg-secondary/40 transition-colors">
            <div className="flex items-start space-x-3">
              <div 
                className={cn(
                  "mt-0.5 h-3 w-3 rounded-full flex-shrink-0", 
                  alert.severity === 'critical' ? "bg-red-500" :
                  alert.severity === 'high' ? "bg-destructive" : 
                  alert.severity === 'medium' ? "bg-harvest-500" : "bg-agri-500"
                )} 
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{alert.message || alert.description}</p>
                  <span className="text-xs text-muted-foreground">
                    {alert.time || (alert.timestamp && alert.timestamp.toLocaleTimeString())}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{alert.equipment || alert.equipmentName || 'System'}</p>
              </div>
            </div>
          </div>
        ))}
      </BlurContainer>
    </DashboardSection>
  );
};

export default AllAlertsSection;
