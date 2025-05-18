
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Parts from '@/pages/Parts';
import Equipment from '@/pages/Equipment';
import Interventions from '@/pages/Interventions';
import Index from '@/pages/Index';
import Maintenance from '@/pages/Maintenance';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import TimeTracking from '@/pages/TimeTracking';
import Dashboard from '@/pages/Dashboard';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/equipment" element={<Equipment />} />
      <Route path="/parts" element={<Parts />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/interventions" element={<Interventions />} />
      <Route path="/time-tracking" element={<TimeTracking />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
