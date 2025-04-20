
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import SettingsTabs from '@/components/settings/SettingsTabs';

const Settings = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Paramètres</h1>
        <SettingsTabs />
      </div>
    </MainLayout>
  );
};

export default Settings;
