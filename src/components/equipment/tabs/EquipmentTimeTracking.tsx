
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play } from 'lucide-react';
import { TimeEntryCard } from '@/components/time-tracking/TimeEntryCard';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TimeEntryForm } from '@/components/time-tracking/TimeEntryForm';
import { Skeleton } from '@/components/ui/skeleton';

interface EquipmentTimeTrackingProps {
  equipment: any;
}

const EquipmentTimeTracking: React.FC<EquipmentTimeTrackingProps> = ({ equipment }) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  
  // Récupérer l'ID utilisateur au chargement
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    fetchUserId();
  }, []);
  
  // Charger les entrées de temps pour cet équipement
  useEffect(() => {
    if (userId && equipment?.id) {
      fetchTimeEntries();
    }
  }, [userId, equipment]);
  
  // Récupérer les entrées de temps
  const fetchTimeEntries = async () => {
    if (!userId || !equipment?.id) return;
    
    setIsLoading(true);
    try {
      const data = await timeTrackingService.getTimeEntries({
        userId,
        equipmentId: typeof equipment.id === 'string' ? parseInt(equipment.id, 10) : equipment.id
      });
      
      setTimeEntries(data);
      
      // Calculer le temps total
      const total = data.reduce((sum, entry) => {
        const start = new Date(entry.start_time);
        const end = entry.end_time ? new Date(entry.end_time) : new Date();
        const diffMs = end.getTime() - start.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      
      setTotalHours(total);
    } catch (error) {
      console.error("Erreur lors de la récupération des entrées de temps:", error);
      toast.error("Impossible de charger les sessions de temps pour cet équipement");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Démarrer une nouvelle session de temps
  const handleStartTimeEntry = async (data: any) => {
    if (!userId) return;
    
    try {
      const equipmentId = typeof equipment.id === 'string' ? parseInt(equipment.id, 10) : equipment.id;
      
      // Préremplit l'équipement à partir de la page actuelle
      await timeTrackingService.startTimeEntry(userId, {
        ...data,
        equipment_id: equipmentId
      });
      
      setIsFormOpen(false);
      toast.success("Session de temps démarrée");
      fetchTimeEntries();
    } catch (error) {
      console.error("Erreur lors du démarrage du suivi de temps:", error);
      toast.error("Impossible de démarrer la session");
    }
  };
  
  // Reprendre une session en pause
  const handleResumeTimeEntry = async (entryId: string) => {
    try {
      await timeTrackingService.resumeTimeEntry(entryId);
      toast.success("Session reprise");
      fetchTimeEntries();
    } catch (error) {
      console.error("Erreur lors de la reprise du suivi de temps:", error);
      toast.error("Impossible de reprendre la session");
    }
  };
  
  // Supprimer une entrée de temps
  const handleDeleteTimeEntry = async (entryId: string) => {
    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      toast.success("Session supprimée");
      fetchTimeEntries();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entrée de temps:", error);
      toast.error("Impossible de supprimer la session");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Suivi du temps</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Clock className="h-4 w-4 mr-2" />
          Nouvelle session
        </Button>
      </div>
      
      {/* Carte de résumé */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800">Temps total sur cet équipement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-700">
            {isLoading ? <Skeleton className="h-10 w-24" /> : `${totalHours.toFixed(1)} heures`}
          </div>
          <p className="text-blue-600 mt-1">
            Réparti sur {timeEntries.length} sessions
          </p>
        </CardContent>
      </Card>
      
      {/* Liste des entrées de temps */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Historique des sessions</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="p-4">
                    <Skeleton className="h-6 w-24 mb-3" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          timeEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeEntries.map((entry) => (
                <TimeEntryCard
                  key={entry.id}
                  entry={entry}
                  onResume={handleResumeTimeEntry}
                  onDelete={handleDeleteTimeEntry}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md bg-gray-50">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">Aucune session enregistrée</h3>
              <p className="text-gray-500 mb-4">
                Vous n'avez pas encore enregistré de temps pour cet équipement.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Play className="h-4 w-4 mr-2" />
                Démarrer une session
              </Button>
            </div>
          )
        )}
      </div>
      
      {/* Modal pour créer une nouvelle session */}
      <TimeEntryForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleStartTimeEntry}
      />
    </div>
  );
};

export default EquipmentTimeTracking;
