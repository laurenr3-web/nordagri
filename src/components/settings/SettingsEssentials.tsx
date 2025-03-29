
import React from 'react';
import { RegionalPreferencesSection } from './regional/RegionalPreferencesSection';
import { FarmInfoSection } from './farm/FarmInfoSection';

export const SettingsEssentials = () => {
  return (
    <div className="space-y-6">
      <FarmInfoSection />
      <RegionalPreferencesSection />
    </div>
  );
};
