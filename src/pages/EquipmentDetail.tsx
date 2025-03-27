import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import EquipmentParts from '@/components/equipment/tabs/EquipmentParts';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '@/services/supabase/equipmentService';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [equipment, setEquipment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEquipment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('Fetching equipment with ID:', id);
        const data = await equipmentService.getEquipmentById(Number(id));
        console.log('Fetched equipment data:', data);
        
        if (!data) {
          throw new Error('Équipement non trouvé');
        }
        
        // Ensure date fields are properly formatted as strings
        const processedData = {
          ...data,
          lastMaintenance: data.lastMaintenance 
            ? (typeof data.lastMaintenance === 'object' 
               ? data.lastMaintenance.toISOString() 
               : String(data.lastMaintenance))
            : 'N/A',
          purchaseDate: data.purchaseDate 
            ? (typeof data.purchaseDate === 'object' 
               ? data.purchaseDate.toISOString() 
               : String(data.purchaseDate))
            : '',
          // Add UI-specific properties
          usage: { hours: 0, target: 500 },
          nextService: { type: 'Regular maintenance', due: 'In 30 days' }
        };
        
        setEquipment(processedData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching equipment:', err);
        setError(err.message || 'Failed to load equipment');
        toast.error('Erreur lors du chargement de l\'équipement');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEquipment();
  }, [id]);
  
  const handleEquipmentUpdate = async (updatedEquipment: any) => {
    try {
      console.log('Updating equipment:', updatedEquipment);
      setLoading(true);
      
      // Remove any UI-specific properties before sending to the server
      const { usage, nextService, ...equipmentForUpdate } = updatedEquipment;
      
      const result = await equipmentService.updateEquipment(equipmentForUpdate);
      console.log('Update result:', result);
      
      // Update local state with the result from the server
      setEquipment(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          ...result,
          // Convert potential Date objects to strings for UI display
          lastMaintenance: result.lastMaintenance 
            ? (typeof result.lastMaintenance === 'object' 
               ? result.lastMaintenance.toISOString() 
               : String(result.lastMaintenance))
            : prev.lastMaintenance || 'N/A',
          purchaseDate: result.purchaseDate 
            ? (typeof result.purchaseDate === 'object' 
               ? result.purchaseDate.toISOString() 
               : String(result.purchaseDate))
            : prev.purchaseDate || '',
          // Keep UI-specific properties
          usage: prev.usage || { hours: 0, target: 500 },
          nextService: prev.nextService || { type: 'Regular maintenance', due: 'In 30 days' }
        };
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', Number(id)] });
      
      toast.success('Équipement mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating equipment:', error);
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pl-12 ml-0 md:ml-64">
          <div className="max-w-7xl mx-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4"
              onClick={() => navigate('/equipment')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux équipements
            </Button>
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Chargement de l'équipement...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pl-12 ml-0 md:ml-64">
          <div className="max-w-7xl mx-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4"
              onClick={() => navigate('/equipment')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux équipements
            </Button>
            <div className="p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Équipement non trouvé</h2>
              <p className="text-muted-foreground">
                L'équipement avec l'ID {id} n'a pas pu être trouvé.
              </p>
              {error && (
                <p className="text-destructive mt-2">
                  Erreur: {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pl-12 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4"
            onClick={() => navigate('/equipment')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux équipements
          </Button>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="parts">Pièces</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <EquipmentDetails 
                equipment={equipment} 
                onUpdate={handleEquipmentUpdate} 
              />
            </TabsContent>
            
            <TabsContent value="parts">
              <EquipmentParts equipment={equipment} />
            </TabsContent>
            
            <TabsContent value="maintenance">
              <div className="p-8 text-center bg-card border rounded-lg">
                <h3 className="text-xl font-medium mb-2">Maintenance</h3>
                <p className="text-muted-foreground">
                  Le module de maintenance sera disponible prochainement.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="p-8 text-center bg-card border rounded-lg">
                <h3 className="text-xl font-medium mb-2">Historique</h3>
                <p className="text-muted-foreground">
                  L'historique d'utilisation sera disponible prochainement.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
