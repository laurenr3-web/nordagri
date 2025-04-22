
import React, { useState } from "react";
import MainLayout from "@/ui/layouts/MainLayout";
import { useTranslation } from "react-i18next";
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import ViewManager from '@/components/index/ViewManager';

const Dashboard = () => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  return (
    <MainLayout>
      <div className="w-full max-w-screen-xl mx-auto px-6 lg:px-12" style={{ overflowX: "hidden" }}>
        <ViewManager 
          currentView={currentView}
          currentMonth={currentMonth}
        />
      </div>
    </MainLayout>
  );
};
export default Dashboard;
