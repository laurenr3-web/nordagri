
import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputWithSuffix } from '@/components/ui/input-with-suffix';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

export const FarmInfoSection = () => {
  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [farmType, setFarmType] = useState('mixed');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmId, setFarmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setUser(data.session.user);
        fetchFarmInfo(data.session.user.id);
      } else {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          fetchFarmInfo(session.user.id);
        } else {
          resetFarmData();
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const resetFarmData = () => {
    setFarmName('');
    setFarmSize('');
    setFarmType('mixed');
    setFarmLocation('');
    setFarmId(null);
  };

  const fetchFarmInfo = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setFarmId(data.id);
        setFarmName(data.name || '');
        setFarmSize(data.size ? data.size.toString() : '');
        setFarmType(data.description || 'mixed');
        setFarmLocation(data.location || '');
      } else {
        // If no farm exists yet, set default values
        setFarmName('New Farm');
        setFarmSize('0');
        setFarmType('mixed');
        setFarmLocation('');
      }
    } catch (error) {
      console.error('Error fetching farm info:', error);
      toast.error('Failed to load farm information');
    } finally {
      setLoading(false);
    }
  };

  // Handle farm information save
  const handleSaveFarmInfo = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const farmData = {
        name: farmName,
        size: parseFloat(farmSize) || 0,
        size_unit: 'acres',
        location: farmLocation,
        description: farmType,
        updated_at: new Date().toISOString(),
      };
      
      let result;
      
      if (farmId) {
        // Update existing farm
        result = await supabase
          .from('farms')
          .update(farmData)
          .eq('id', farmId);
      } else {
        // Create new farm
        result = await supabase
          .from('farms')
          .insert({
            ...farmData,
            owner_id: user.id,
          })
          .select();
          
        if (result.data && result.data.length > 0) {
          setFarmId(result.data[0].id);
        }
      }
      
      if (result.error) throw result.error;
      
      toast.success('Farm information saved successfully');
    } catch (error) {
      console.error('Error saving farm information:', error);
      toast.error('Failed to save farm information');
    } finally {
      setLoading(false);
    }
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
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farm-size">Farm Size</Label>
                <InputWithSuffix 
                  id="farm-size" 
                  value={farmSize} 
                  onChange={(e) => setFarmSize(e.target.value)} 
                  suffix="acres" 
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="farm-type">Farm Type</Label>
                <Select 
                  value={farmType} 
                  onValueChange={setFarmType}
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleSaveFarmInfo} 
          disabled={loading}
        >
          Save Farm Information
        </Button>
      </div>
    </SettingsSection>
  );
};
