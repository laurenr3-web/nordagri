
import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export interface TopEquipmentListProps {
  month: Date;
}

interface EquipmentTimeData {
  equipment_id: number;
  equipment_name: string;
  total_minutes: number;
}

export function TopEquipmentList({ month }: TopEquipmentListProps) {
  const [equipmentData, setEquipmentData] = useState<EquipmentTimeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchTopEquipment = async () => {
      try {
        setIsLoading(true);
        
        // Obtenir le premier et dernier jour du mois sélectionné
        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
        const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        // Récupérer la session de l'utilisateur actuel
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session?.user) {
          setEquipmentData([]);
          setIsLoading(false);
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Récupérer l'équipement le plus utilisé en termes de temps
        const { data, error: equipmentError } = await supabase
          .from('time_sessions')
          .select(`
            equipment_id,
            equipment:equipment_id(name),
            duration
          `)
          .eq('user_id', userId)
          .eq('status', 'completed')
          .gte('start_time', firstDay.toISOString())
          .lte('start_time', lastDay.toISOString())
          .not('duration', 'is', null)
          .order('duration', { ascending: false });
          
        if (equipmentError) throw equipmentError;
        
        // Agréger les données par équipement
        const equipmentMap = new Map<number, { name: string; minutes: number }>();
        
        data.forEach(session => {
          if (!session.equipment_id) return;
          
          const equipmentId = session.equipment_id;
          const equipmentName = session.equipment?.name || 'Équipement inconnu';
          const duration = session.duration || 0;
          
          if (equipmentMap.has(equipmentId)) {
            const current = equipmentMap.get(equipmentId)!;
            equipmentMap.set(equipmentId, {
              name: current.name,
              minutes: current.minutes + (duration * 60) // Convert hours to minutes
            });
          } else {
            equipmentMap.set(equipmentId, {
              name: equipmentName,
              minutes: duration * 60 // Convert hours to minutes
            });
          }
        });
        
        // Convertir en tableau et trier
        const sortedEquipment = Array.from(equipmentMap.entries())
          .map(([id, data]) => ({
            equipment_id: id,
            equipment_name: data.name,
            total_minutes: data.minutes
          }))
          .sort((a, b) => b.total_minutes - a.total_minutes)
          .slice(0, 5); // Top 5
        
        setEquipmentData(sortedEquipment);
      } catch (err) {
        console.error('Error fetching top equipment:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopEquipment();
  }, [month]);
  
  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Équipements les plus utilisés</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-muted-foreground p-4">
            <p>Une erreur est survenue lors du chargement des données.</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        ) : equipmentData.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            <p>Aucune donnée disponible pour ce mois</p>
          </div>
        ) : (
          <div className="space-y-4">
            {equipmentData.map((item) => (
              <div key={item.equipment_id} className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-medium">{item.equipment_name}</h4>
                  <div className="w-full bg-secondary h-2 mt-1 rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (item.total_minutes / (equipmentData[0]?.total_minutes || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
                <span className="ml-4 font-medium text-sm">
                  {formatTime(item.total_minutes)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
