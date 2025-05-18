
import React, { useState } from "react";
import MainLayout from "@/ui/layouts/MainLayout";
import { useTranslation } from "react-i18next";
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import ViewManager from '@/components/index/ViewManager';
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Grid3x3, LayoutGrid } from "lucide-react";

const Dashboard = () => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<'main' | 'bento' | 'calendar' | 'alerts'>('main');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader 
          title="Tableau de bord" 
          description="Visualisez et gérez vos opérations agricoles"
          action={
            <div className="flex gap-2">
              <Button 
                variant={currentView === 'main' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setCurrentView('main')}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Standard
              </Button>
              <Button 
                variant={currentView === 'bento' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setCurrentView('bento')}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Bento
              </Button>
            </div>
          }
        />
        <ViewManager 
          currentView={currentView}
          currentMonth={currentMonth}
        />
      </LayoutWrapper>
    </MainLayout>
  );
};
export default Dashboard;
