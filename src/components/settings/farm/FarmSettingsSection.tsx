
import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, Download, FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';

/**
 * Composant pour la gestion des paramètres de la ferme
 */
export function FarmSettingsSection() {
  const { user, profileData } = useAuthContext();
  const [farmName, setFarmName] = useState('');
  const [farmId, setFarmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Modules toggle states
  const [moduleToggles, setModuleToggles] = useState({
    maintenance: true,
    fuel: true, 
    parts: true,
    performance: false
  });

  // Fetch farm data on component mount
  useEffect(() => {
    const fetchFarmData = async () => {
      setLoading(true);
      try {
        if (!user?.id) return;
        
        // Récupérer les données du profil utilisateur pour obtenir l'ID de ferme
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('farm_id')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        if (!profileData?.farm_id) return;
        
        setFarmId(profileData.farm_id);
        
        // Récupérer les données de la ferme
        const { data: farmData, error: farmError } = await supabase
          .from('farms')
          .select('name')
          .eq('id', profileData.farm_id)
          .single();
        
        if (farmError) throw farmError;
        
        if (farmData) {
          setFarmName(farmData.name || '');
        }
        
        // Récupérer les paramètres des modules depuis la table farm_settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('farm_settings')
          .select('*')
          .eq('farm_id', profileData.farm_id)
          .maybeSingle();
          
        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
        
        if (settingsData) {
          setModuleToggles({
            maintenance: settingsData.show_maintenance ?? true,
            fuel: settingsData.show_fuel_log ?? true,
            parts: settingsData.show_parts ?? true,
            performance: settingsData.show_time_tracking ?? false
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de la ferme:', error);
        toast.error('Impossible de charger les données de la ferme');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFarmData();
  }, [user]);
  
  const handleSaveFarmSettings = async () => {
    if (!farmId) {
      toast.error('Identifiant de ferme non disponible');
      return;
    }
    
    setLoading(true);
    try {
      // Mettre à jour le nom de la ferme
      const { error: farmError } = await supabase
        .from('farms')
        .update({
          name: farmName,
          updated_at: new Date().toISOString()
        })
        .eq('id', farmId);
      
      if (farmError) throw farmError;
      
      // Mettre à jour les paramètres des modules
      const { error: settingsError } = await supabase
        .from('farm_settings')
        .upsert({
          farm_id: farmId,
          show_maintenance: moduleToggles.maintenance,
          show_fuel_log: moduleToggles.fuel,
          show_parts: moduleToggles.parts,
          show_time_tracking: moduleToggles.performance
        }, { onConflict: 'farm_id' });
      
      if (settingsError) throw settingsError;
      
      toast.success('Paramètres de la ferme mis à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres de la ferme:', error);
      toast.error('Erreur lors de la mise à jour des paramètres');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportData = async (format: 'csv' | 'pdf') => {
    toast.info(`Export des données au format ${format.toUpperCase()} en préparation...`);
    // Logique d'export à implémenter
  };
  
  const handleModuleToggle = (module: keyof typeof moduleToggles) => {
    setModuleToggles(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };
  
  return (
    <SettingsSection 
      title="Paramètres de la ferme" 
      description="Configurez les paramètres liés à votre exploitation agricole"
    >
      <div className="space-y-6">
        {/* Nom de la ferme */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="farmName">Nom de la ferme</Label>
            <Input 
              id="farmName" 
              value={farmName} 
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="Nom de votre ferme"
              disabled={loading || !farmId}
            />
          </div>
        </div>
        
        {/* Modules */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Modules actifs</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="maintenance-module">Maintenance</Label>
              <Switch 
                id="maintenance-module" 
                checked={moduleToggles.maintenance} 
                onCheckedChange={() => handleModuleToggle('maintenance')}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="fuel-module">Carburant</Label>
              <Switch 
                id="fuel-module" 
                checked={moduleToggles.fuel} 
                onCheckedChange={() => handleModuleToggle('fuel')}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="parts-module">Pièces</Label>
              <Switch 
                id="parts-module" 
                checked={moduleToggles.parts} 
                onCheckedChange={() => handleModuleToggle('parts')}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="performance-module">Performance</Label>
              <Switch 
                id="performance-module" 
                checked={moduleToggles.performance} 
                onCheckedChange={() => handleModuleToggle('performance')}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        
        {/* Bouton d'enregistrement */}
        <Button 
          onClick={handleSaveFarmSettings} 
          disabled={loading || !farmId}
          className="mt-4"
        >
          <Save className="mr-2 h-4 w-4" />
          Enregistrer les modifications
        </Button>
        
        {/* Exportation des données */}
        <div className="pt-6 border-t mt-6">
          <h3 className="text-lg font-medium mb-4">Exportation des données</h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleExportData('csv')}
              disabled={loading || !farmId}
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter en CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportData('pdf')}
              disabled={loading || !farmId}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Exporter en PDF
            </Button>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
