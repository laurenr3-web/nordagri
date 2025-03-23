
import React from 'react';
import { Button } from '@/components/ui/button';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { BlurContainer } from '@/components/ui/blur-container';
import { cn } from '@/lib/utils';
import { alertItems } from '@/data/dashboardData';

const AlertsDashboardView: React.FC = () => {
  // Double the alert items to show more content
  const extendedAlertItems = [...alertItems, ...alertItems, ...alertItems];
  
  return (
    <div className="space-y-8">
      <DashboardSection 
        title="All System Alerts" 
        subtitle="Complete list of all notifications and warnings" 
        action={
          <Button variant="outline" size="sm" className="hover:bg-primary/5">
            Mark All as Read
          </Button>
        }
      >
        <BlurContainer className="divide-y animate-fade-in rounded-xl border border-border/50">
          {extendedAlertItems.map((alert, index) => (
            <div key={`${alert.id}-${index}`} className="p-5 hover:bg-secondary/40 transition-colors">
              <div className="flex items-start space-x-4">
                <div className={cn(
                  "mt-1 h-3 w-3 rounded-full flex-shrink-0", 
                  alert.severity === 'high' ? "bg-destructive" : 
                  alert.severity === 'medium' ? "bg-harvest-500" : "bg-agri-500"
                )} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground ml-2">{alert.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{alert.equipment}</p>
                </div>
              </div>
            </div>
          ))}
        </BlurContainer>
      </DashboardSection>
    </div>
  );
};

export default AlertsDashboardView;
