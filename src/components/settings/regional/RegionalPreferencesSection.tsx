
import React, { useEffect, useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useUserSettingsContext } from '@/providers/UserSettingsProvider';
import { useAuthContext } from '@/providers/AuthProvider';

export const RegionalPreferencesSection = () => {
  const { user } = useAuthContext();
  const { settings, loading, saveSettings } = useUserSettingsContext();
  
  const [temperatureUnit, setTemperatureUnit] = useState(
    settings?.units_system === 'imperial' ? 'fahrenheit' : 'celsius'
  );
  const [dateFormat, setDateFormat] = useState(settings?.date_format || 'DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState(settings?.time_format || '24h');
  const [language, setLanguage] = useState(settings?.language || 'en');
  const [savingSettings, setSavingSettings] = useState(false);

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setTemperatureUnit(settings.units_system === 'imperial' ? 'fahrenheit' : 'celsius');
      setDateFormat(settings.date_format);
      setTimeFormat(settings.time_format);
      setLanguage(settings.language);
    }
  }, [settings]);

  const handleSavePreferences = async () => {
    if (!settings || !user) {
      toast.error('You must be logged in to save preferences');
      return;
    }

    try {
      setSavingSettings(true);
      
      await saveSettings({
        ...settings,
        units_system: temperatureUnit === 'celsius' ? 'metric' : 'imperial',
        date_format: dateFormat,
        time_format: timeFormat,
        language: language
      });
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <SettingsSection
      title="Regional Preferences"
      description="Set your preferred units, date formats, and language"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Temperature Unit</label>
          <Select value={temperatureUnit} onValueChange={setTemperatureUnit} disabled={loading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select temperature unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="celsius">Celsius (°C)</SelectItem>
              <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Format</label>
          <Select value={dateFormat} onValueChange={setDateFormat} disabled={loading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Time Format</label>
          <Select value={timeFormat} onValueChange={setTimeFormat} disabled={loading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
              <SelectItem value="24h">24-hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Language</label>
          <Select value={language} onValueChange={setLanguage} disabled={loading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        onClick={handleSavePreferences} 
        disabled={loading || savingSettings}
      >
        {savingSettings ? 'Saving...' : 'Save Preferences'}
      </Button>
    </SettingsSection>
  );
};
