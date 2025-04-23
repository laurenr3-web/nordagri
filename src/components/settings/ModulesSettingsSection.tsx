
import React from 'react';
import { SettingsSection } from './SettingsSection';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useFarmSettings } from '@/hooks/farm/useFarmSettings';

interface ModulesSettingsSectionProps {
  farmId: string;
}

export const ModulesSettingsSection: React.FC<ModulesSettingsSectionProps> = ({ farmId }) => {
  const { settings, updateSettings, loading } = useFarmSettings(farmId);

  if (!settings) return null;
  return (
    <SettingsSection 
      title="Modules activés"
      description="Activez ou désactivez les modules disponibles pour votre ferme."
    >
      <div className="space-y-5">
        {[
          {key: 'show_maintenance', label: 'Maintenance'},
          {key: 'show_fuel_log', label: 'Journal carburant'},
          {key: 'show_parts', label: 'Pièces détachées'},
          {key: 'show_time_tracking', label: 'Suivi du temps'},
        ].map(mod => (
          <div key={mod.key} className="flex items-center justify-between">
            <Label htmlFor={mod.key} className="flex-1">{mod.label}</Label>
            <Switch
              id={mod.key}
              checked={!!settings[mod.key as keyof typeof settings]}
              disabled={loading}
              onCheckedChange={checked => {
                updateSettings({ [mod.key]: checked });
                toast.success('Modification appliquée !');
              }}
            />
          </div>
        ))}
      </div>
    </SettingsSection>
  );
};
