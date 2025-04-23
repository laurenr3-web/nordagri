
import React, { useState, useEffect } from 'react';
import { Equipment } from '@/core/equipment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FuelLogsTable } from './FuelLogsTable';
import { FuelLog } from '@/types/FuelLog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface EquipmentFuelLogsProps {
  equipment: Equipment;
}

const EquipmentFuelLogs: React.FC<EquipmentFuelLogsProps> = ({ equipment }) => {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadFuelLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('fuel_logs')
          .select('*')
          .eq('equipment_id', equipment.id)
          .order('date', { ascending: false });

        if (error) throw error;

        console.log(`Chargement de ${data.length} logs de carburant pour l'équipement #${equipment.id}`);
        setFuelLogs(data as FuelLog[]);
      } catch (err) {
        console.error('Erreur lors du chargement des logs de carburant:', err);
        setError('Impossible de charger les données de carburant');
      } finally {
        setIsLoading(false);
      }
    };

    if (equipment?.id) {
      loadFuelLogs();
    }
  }, [equipment.id]);

  const handleDelete = async (logId: string) => {
    try {
      setIsDeletingId(logId);
      
      const { error } = await supabase
        .from('fuel_logs')
        .delete()
        .eq('id', logId);
        
      if (error) throw error;
      
      setFuelLogs(prev => prev.filter(log => log.id !== logId));
      toast({
        title: "Log supprimé",
        description: "L'entrée de carburant a été supprimée avec succès",
      });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cette entrée",
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleAddFuelLog = () => {
    setIsOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Historique de carburant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <p>Chargement des données de carburant...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Historique de carburant
            <Button size="sm" onClick={handleAddFuelLog} disabled={isLoading} className="min-h-[44px]">
              <Plus className="h-4 w-4 mr-1" /> Nouveau plein
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Historique de carburant
          <Button size="sm" onClick={handleAddFuelLog} className="min-h-[44px]">
            <Plus className="h-4 w-4 mr-1" /> Nouveau plein
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fuelLogs.length > 0 ? (
          <FuelLogsTable 
            logs={fuelLogs} 
            onDelete={handleDelete} 
            isDeletingId={isDeletingId} 
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Aucun historique de carburant enregistré pour cet équipement.
            </p>
            <Button onClick={handleAddFuelLog} className="min-h-[44px]">
              <Plus className="h-4 w-4 mr-1" /> Ajouter un premier plein
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentFuelLogs;
