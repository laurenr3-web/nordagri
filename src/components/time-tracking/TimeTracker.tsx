
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTimeTracking } from '@/hooks/time-tracking/useTimeTracking';
import { TimeEntryTaskType } from '@/hooks/time-tracking/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Timer, Clock, Pause, Play, StopCircle, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEquipmentOptions } from '@/hooks/equipment/useEquipmentOptions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const TimeTracker: React.FC = () => {
  const {
    activeTimeEntry,
    isLoading,
    startTimeEntry,
    stopTimeEntry,
    pauseTimeEntry,
    resumeTimeEntry,
  } = useTimeTracking();
  
  const [isStartDialogOpen, setIsStartDialogOpen] = React.useState(false);
  const [taskType, setTaskType] = React.useState<TimeEntryTaskType>('maintenance');
  const [equipmentId, setEquipmentId] = React.useState<number | undefined>(undefined);
  const [notes, setNotes] = React.useState('');
  const isMobile = useIsMobile();
  
  // Récupérer les options d'équipement
  const { data: equipmentOptions, isLoading: isLoadingEquipment } = useEquipmentOptions();
  
  // Calculer la durée écoulée pour l'entrée active
  const [elapsed, setElapsed] = React.useState<string>("00:00:00");
  
  React.useEffect(() => {
    let intervalId: number | null = null;
    
    if (activeTimeEntry && activeTimeEntry.status === 'active') {
      const startTime = new Date(activeTimeEntry.start_time);
      
      const updateElapsedTime = () => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        
        // Calculer heures, minutes, secondes
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        
        // Formater avec des zéros de remplissage
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        
        setElapsed(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
      };
      
      // Mise à jour immédiate
      updateElapsedTime();
      
      // Puis toutes les secondes
      intervalId = window.setInterval(updateElapsedTime, 1000);
    } else if (activeTimeEntry && activeTimeEntry.status === 'paused') {
      // Pour les entrées en pause, montrer simplement le temps écoulé jusqu'à la pause
      setElapsed("En pause");
    }
    
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [activeTimeEntry]);
  
  // Gérer le démarrage d'une nouvelle entrée
  const handleStartTimeEntry = async () => {
    try {
      await startTimeEntry({
        equipment_id: equipmentId,
        task_type: taskType,
        notes: notes,
      });
      
      // Réinitialiser le formulaire
      setTaskType('maintenance');
      setEquipmentId(undefined);
      setNotes('');
      setIsStartDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors du démarrage du suivi:", error);
      // Toast affiché dans le hook
    }
  };
  
  // Gérer l'arrêt d'une entrée active
  const handleStopTimeEntry = async () => {
    if (!activeTimeEntry) return;
    
    try {
      await stopTimeEntry(activeTimeEntry.id);
    } catch (error) {
      console.error("Erreur lors de l'arrêt du suivi:", error);
      // Toast affiché dans le hook
    }
  };
  
  // Gérer la mise en pause ou la reprise
  const handlePauseResumeTimeEntry = async () => {
    if (!activeTimeEntry) return;
    
    try {
      if (activeTimeEntry.status === 'active') {
        await pauseTimeEntry(activeTimeEntry.id);
      } else if (activeTimeEntry.status === 'paused') {
        await resumeTimeEntry(activeTimeEntry.id);
      }
    } catch (error) {
      console.error("Erreur lors de la pause/reprise:", error);
      // Toast affiché dans le hook
    }
  };
  
  // Rendu du composant
  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Chargement...</div>;
  }
  
  return (
    <>
      {!activeTimeEntry ? (
        <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
          <DialogTrigger asChild>
            <Button className={isMobile ? "w-full" : ""} variant="default">
              <Clock className="mr-2 h-4 w-4" />
              Démarrer le suivi du temps
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Démarrer le suivi du temps</DialogTitle>
              <DialogDescription>
                Enregistrez votre temps pour suivre vos activités.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="task-type">Type de tâche</Label>
                <Select 
                  value={taskType} 
                  onValueChange={(value) => setTaskType(value as TimeEntryTaskType)}
                >
                  <SelectTrigger id="task-type">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="repair">Réparation</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="equipment">Équipement</Label>
                <Select 
                  value={equipmentId?.toString() || ""} 
                  onValueChange={(value) => setEquipmentId(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger id="equipment">
                    <SelectValue placeholder="Sélectionner un équipement (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun équipement</SelectItem>
                    {!isLoadingEquipment && equipmentOptions?.map(eq => (
                      <SelectItem key={eq.id} value={eq.id.toString()}>
                        {eq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajouter des notes sur cette tâche..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" onClick={handleStartTimeEntry}>
                <Play className="mr-2 h-4 w-4" />
                Démarrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <div className={`border rounded-lg p-4 ${isMobile ? "w-full" : ""}`}>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Timer className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-semibold">
                  {activeTimeEntry.task_type.charAt(0).toUpperCase() + activeTimeEntry.task_type.slice(1)}
                </span>
              </div>
              <div className={`px-2 py-1 text-xs rounded-full ${
                activeTimeEntry.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {activeTimeEntry.status === 'active' ? 'Actif' : 'En pause'}
              </div>
            </div>
            
            {activeTimeEntry.equipment_name && (
              <div className="text-sm text-muted-foreground">
                Équipement: {activeTimeEntry.equipment_name}
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              Démarré le: {format(new Date(activeTimeEntry.start_time), 'dd MMM yyyy à HH:mm', {locale: fr})}
            </div>
            
            <div className="text-2xl font-mono font-bold mt-2">
              {elapsed}
            </div>
            
            <div className="flex space-x-2 mt-2">
              <Button 
                variant={activeTimeEntry.status === 'active' ? "outline" : "default"}
                size="sm"
                onClick={handlePauseResumeTimeEntry}
              >
                {activeTimeEntry.status === 'active' ? (
                  <>
                    <Pause className="mr-1 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-1 h-4 w-4" />
                    Reprendre
                  </>
                )}
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleStopTimeEntry}
              >
                <StopCircle className="mr-1 h-4 w-4" />
                Terminer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
