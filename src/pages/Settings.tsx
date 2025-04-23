
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import SettingsTabs from '@/components/settings/SettingsTabs';

const Settings = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <h1 className="text-2xl font-semibold mb-4 mt-2 sm:mb-6 text-center sm:text-left">Paramètres</h1>
        <SettingsTabs />
      </div>
    </MainLayout>
  );
};

export default Settings;
