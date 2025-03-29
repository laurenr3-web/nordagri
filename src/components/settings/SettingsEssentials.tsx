
import React from 'react';
import { RegionalPreferencesSection } from './regional/RegionalPreferencesSection';
import { FarmInfoSection } from './farm/FarmInfoSection';
import { DataExportSection } from './data/DataExportSection';

export const SettingsEssentials = () => {
  return (
    <div className="space-y-6">
      <FarmInfoSection />
      <RegionalPreferencesSection />
      <DataExportSection />
    </div>
  );
};
