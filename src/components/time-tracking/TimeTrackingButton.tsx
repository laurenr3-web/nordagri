
import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Square, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimeTracking } from '@/hooks/time-tracking/useTimeTracking';
import { formatDuration } from '@/utils/dateHelpers';
import { cn } from '@/lib/utils';
import { TimeEntryForm } from './TimeEntryForm';

interface TimeTrackingButtonProps {
  className?: string;
  position?: 'fixed' | 'relative';
}

export function TimeTrackingButton({ 
  className, 
  position = 'fixed' 
}: TimeTrackingButtonProps) {
  const { 
    activeTimeEntry, 
    isLoading, 
    startTimeEntry, 
    stopTimeEntry,
    pauseTimeEntry,
    resumeTimeEntry
  } = useTimeTracking();
  
  const [duration, setDuration] = useState<string>('00:00:00');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Mettre à jour le timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Vérifier si une entrée active existe et n'est pas en pause
    if (activeTimeEntry && activeTimeEntry.status === 'active') {
      // Démarrer l'intervalle pour mettre à jour le timer
      intervalId = setInterval(() => {
        const start = new Date(activeTimeEntry.start_time);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        setDuration(formatDuration(diffMs));
      }, 1000);
      
      // Calculer la durée initiale
      const start = new Date(activeTimeEntry.start_time);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      setDuration(formatDuration(diffMs));
    } else if (activeTimeEntry && activeTimeEntry.status === 'paused') {
      // Pour l'entrée en pause, afficher simplement le temps écoulé sans mise à jour
      const start = new Date(activeTimeEntry.start_time);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      setDuration(formatDuration(diffMs));
    }
    
    // Nettoyer l'intervalle au démontage
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTimeEntry]);
  
  // Gérer le clic sur le bouton principal
  const handleMainButtonClick = () => {
    if (!activeTimeEntry) {
      setIsFormOpen(true);
    }
  };
  
  // Gérer le démarrage d'une entrée de temps
  const handleStartTimeEntry = async (data: any) => {
    try {
      await startTimeEntry(data);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Erreur lors du démarrage du suivi de temps:", error);
    }
  };
  
  // Gérer l'arrêt d'une entrée de temps
  const handleStopTimeEntry = async () => {
    if (activeTimeEntry) {
      try {
        await stopTimeEntry(activeTimeEntry.id);
      } catch (error) {
        console.error("Erreur lors de l'arrêt du suivi de temps:", error);
      }
    }
  };
  
  // Gérer la mise en pause d'une entrée de temps
  const handlePauseTimeEntry = async () => {
    if (activeTimeEntry) {
      try {
        await pauseTimeEntry(activeTimeEntry.id);
      } catch (error) {
        console.error("Erreur lors de la mise en pause du suivi de temps:", error);
      }
    }
  };
  
  // Gérer la reprise d'une entrée de temps
  const handleResumeTimeEntry = async () => {
    if (activeTimeEntry) {
      try {
        await resumeTimeEntry(activeTimeEntry.id);
      } catch (error) {
        console.error("Erreur lors de la reprise du suivi de temps:", error);
      }
    }
  };
  
  // Déterminer la classe de couleur en fonction du statut
  const getColorClass = () => {
    if (!activeTimeEntry) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    
    switch (activeTimeEntry.status) {
      case 'active':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'paused':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };
  
  return (
    <>
      <div 
        className={cn(
          'flex items-center gap-2 z-50',
          position === 'fixed' ? 'fixed bottom-20 right-4 shadow-lg rounded-full p-2' : '',
          getColorClass(),
          className
        )}
      >
        {/* Bouton principal */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'rounded-full p-2 h-10 w-10 flex items-center justify-center',
            !activeTimeEntry ? 'text-gray-700' : ''
          )}
          onClick={handleMainButtonClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin">
              <Timer className="h-5 w-5" />
            </div>
          ) : (
            <Clock className="h-5 w-5" />
          )}
        </Button>
        
        {/* Afficher le temps écoulé et les actions lorsqu'une entrée est active */}
        {activeTimeEntry && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">{duration}</span>
            
            {/* Actions selon l'état */}
            {activeTimeEntry.status === 'active' ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-2 h-8 w-8"
                  onClick={handlePauseTimeEntry}
                >
                  <Pause className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-2 h-8 w-8"
                  onClick={handleStopTimeEntry}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-2 h-8 w-8"
                  onClick={handleResumeTimeEntry}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-2 h-8 w-8"
                  onClick={handleStopTimeEntry}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Modal pour le formulaire */}
      <TimeEntryForm 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSubmit={handleStartTimeEntry} 
      />
    </>
  );
}
