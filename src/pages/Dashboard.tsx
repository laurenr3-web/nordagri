
import React, { useState } from "react";
import MainLayout from "@/ui/layouts/MainLayout";
import { useTranslation } from "react-i18next";
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import ViewManager from '@/components/index/ViewManager';
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { PageHeader } from "@/components/layout/PageHeader";

const Dashboard = () => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader 
          title="Tableau de bord" 
          description="Visualisez et gérez vos opérations agricoles"
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
