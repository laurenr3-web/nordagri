
import React from 'react';
import { ProfileSection } from './profile/ProfileSection';
import { FarmInfoSection } from './farm/FarmInfoSection';
import { UserManagementSection } from './users/UserManagementSection';
import { RegionalPreferencesSection } from './regional/RegionalPreferencesSection';

export const SettingsEssentials = () => {
  return (
    <div className="space-y-6">
      <ProfileSection />
      <FarmInfoSection />
      <UserManagementSection />
      <RegionalPreferencesSection />
    </div>
  );
};
