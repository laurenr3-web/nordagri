
import React from 'react';
import { SecuritySection } from './security/SecuritySection';
import { UserManagementSection } from './users/UserManagementSection';

export const SettingsSecurity = () => {
  return (
    <div className="space-y-6">
      <SecuritySection />
      <UserManagementSection />
    </div>
  );
};
