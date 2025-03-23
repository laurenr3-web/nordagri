
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const RegionalPreferencesSection = () => {
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      
      // In a real app, we would save these preferences to the database
      // For now, we'll just simulate a delay and show a success message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save to localStorage for now
      localStorage.setItem('regionalPreferences', JSON.stringify({
        temperatureUnit,
        dateFormat,
        timeFormat,
        language
      }));
      
      toast.success('Regional preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
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
          <Select value={temperatureUnit} onValueChange={setTemperatureUnit}>
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
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
              <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
              <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Time Format</label>
          <Select value={timeFormat} onValueChange={setTimeFormat}>
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
          <Select value={language} onValueChange={setLanguage}>
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
      
      <Button onClick={handleSavePreferences} disabled={loading}>
        Save Preferences
      </Button>
    </SettingsSection>
  );
};
