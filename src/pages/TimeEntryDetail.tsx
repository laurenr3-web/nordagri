import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SessionTimer } from '@/components/time-tracking/detail/SessionTimer';
import { SessionInfo } from '@/components/time-tracking/detail/SessionInfo';
import { SessionNotes } from '@/components/time-tracking/detail/SessionNotes';
import { Pause, Play, StopCircle, Plus, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TimeEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [estimatedCost, setEstimatedCost] = useState(0);

  const fetchEntry = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast.error("Vous devez être connecté pour voir les détails");
        navigate('/auth');
        return;
      }

      // Récupérer toutes les entrées de temps de l'utilisateur
      const data = await timeTrackingService.getTimeEntries({
        userId: sessionData.session.user.id,
      });

      console.log("Entrées récupérées:", data);
      console.log("ID recherché:", id);

      // Trouver l'entrée correspondante par ID (assurez-vous que les IDs sont comparés dans le même format)
      const foundEntry = data.find(e => String(e.id) === String(id));
      
      if (foundEntry) {
        console.log("Entrée trouvée:", foundEntry);
        setEntry(foundEntry);
      } else {
        console.error("Entrée non trouvée avec l'ID:", id);
        console.error("Entrées disponibles:", data.map(e => e.id));
        toast.error("Session introuvable");
        navigate('/time-tracking');
      }
    } catch (error) {
      console.error("Error fetching time entry:", error);
      toast.error("Erreur lors du chargement des détails");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, [id, navigate]);

  useEffect(() => {
    if (entry && entry.start_time) {
      // Calculer le coût estimé (exemple: 50€/heure)
      const hourlyRate = 50;
      const start = new Date(entry.start_time);
      const end = entry.end_time ? new Date(entry.end_time) : new Date();
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      setEstimatedCost(Math.round(hours * hourlyRate * 100) / 100);
    }
  }, [entry]);

  const handlePauseResume = async () => {
    if (!entry) return;
    try {
      if (entry.status === 'active') {
        await timeTrackingService.pauseTimeEntry(entry.id);
        setEntry({ ...entry, status: 'paused' });
        toast.success('Session mise en pause');
      } else {
        await timeTrackingService.resumeTimeEntry(entry.id);
        setEntry({ ...entry, status: 'active' });
        toast.success('Session reprise');
      }
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleStop = async () => {
    if (!entry) return;
    try {
      await timeTrackingService.stopTimeEntry(entry.id);
      setEntry({ ...entry, status: 'completed' });
      toast.success('Session terminée');
    } catch (error) {
      toast.error('Erreur lors de l\'arrêt de la session');
    }
  };

  const handleNotesChange = async (notes: string) => {
    if (!entry) return;
    try {
      await timeTrackingService.updateTimeEntry(entry.id, { ...entry, notes });
      setEntry({ ...entry, notes });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des notes');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload logic here
      toast.success('Photo ajoutée à la session');
    } catch (error) {
      toast.error('Erreur lors de l\'upload de la photo');
    }
  };

  const handleCreateIntervention = () => {
    if (!entry) return;
    navigate('/interventions/new', {
      state: {
        equipment_id: entry.equipment_id,
        equipment_name: entry.equipment_name,
        duration: entry.current_duration,
        notes: entry.notes
      }
    });
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <Sidebar className="border-r">
            <Navbar />
          </Sidebar>
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg">Chargement des détails...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!entry) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <Sidebar className="border-r">
            <Navbar />
          </Sidebar>
          <div className="flex-1 p-6 flex flex-col items-center justify-center">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold mb-2">Session introuvable</h1>
              <p className="text-lg text-muted-foreground">
                Impossible de trouver les détails de cette session de temps
              </p>
            </div>
            <Button onClick={() => navigate('/time-tracking')}>
              Retour au suivi de temps
            </Button>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1">
          <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* En-tête avec timer et boutons d'action */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                  <SessionTimer 
                    startTime={new Date(entry.start_time)} 
                    status={entry.status}
                  />
                </div>
                
                <div className="flex gap-2">
                  {entry.status !== 'completed' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handlePauseResume}
                      >
                        {entry.status === 'active' ? (
                          <><Pause className="mr-2 h-4 w-4" /> Pause</>
                        ) : (
                          <><Play className="mr-2 h-4 w-4" /> Reprendre</>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleStop}
                      >
                        <StopCircle className="mr-2 h-4 w-4" />
                        Terminer
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Informations de session */}
              <div className="grid md:grid-cols-2 gap-6">
                <SessionInfo
                  userName={entry.user_name || 'Utilisateur'}
                  taskType={entry.task_type}
                  equipmentId={entry.equipment_id}
                  equipmentName={entry.equipment_name}
                  location={entry.location}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Coût estimé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{estimatedCost}€</p>
                    <p className="text-sm text-muted-foreground">Basé sur le taux horaire standard</p>
                  </CardContent>
                </Card>
              </div>

              {/* Notes et actions supplémentaires */}
              <div className="grid md:grid-cols-2 gap-6">
                <SessionNotes
                  notes={entry.notes}
                  onChange={handleNotesChange}
                  readOnly={entry.status === 'completed'}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <input
                        type="file"
                        id="photo"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('photo')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Ajouter une photo
                      </Button>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={handleCreateIntervention}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Créer une intervention
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TimeEntryDetail;
