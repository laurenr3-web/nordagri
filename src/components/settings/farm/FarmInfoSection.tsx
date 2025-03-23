
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputWithSuffix } from '@/components/ui/input-with-suffix';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building } from 'lucide-react';
import { toast } from 'sonner';

export const FarmInfoSection = () => {
  const [farmName, setFarmName] = useState('Green Valley Farm');
  const [farmSize, setFarmSize] = useState('250');
  const [farmType, setFarmType] = useState('mixed');
  const [farmLocation, setFarmLocation] = useState('Bordeaux, France');

  // Handle farm information save
  const handleSaveFarmInfo = () => {
    toast.success('Farm information saved successfully');
  };

  return (
    <SettingsSection
      title="Farm Information"
      description="Details about your agricultural operation"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farm-name">Farm Name</Label>
                <Input 
                  id="farm-name" 
                  value={farmName} 
                  onChange={(e) => setFarmName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farm-size">Farm Size</Label>
                <InputWithSuffix 
                  id="farm-size" 
                  value={farmSize} 
                  onChange={(e) => setFarmSize(e.target.value)} 
                  suffix="acres" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="farm-type">Farm Type</Label>
                <Select 
                  value={farmType} 
                  onValueChange={setFarmType}
                >
                  <SelectTrigger id="farm-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crops">Crop Farming</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                    <SelectItem value="mixed">Mixed Farming</SelectItem>
                    <SelectItem value="organic">Organic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="farm-location">Location</Label>
                <Input 
                  id="farm-location" 
                  value={farmLocation} 
                  onChange={(e) => setFarmLocation(e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>
        <Button onClick={handleSaveFarmInfo}>Save Farm Information</Button>
      </div>
    </SettingsSection>
  );
};
