
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Tool, User, MapPin } from 'lucide-react';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const TimeEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) return;

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          toast.error("Vous devez être connecté pour voir les détails");
          return;
        }

        const data = await timeTrackingService.getTimeEntries({
          userId: sessionData.session.user.id,
        });

        const foundEntry = data.find(e => e.id === id);
        if (foundEntry) {
          setEntry(foundEntry);
        } else {
          toast.error("Session introuvable");
        }
      } catch (error) {
        console.error("Error fetching time entry:", error);
        toast.error("Erreur lors du chargement des détails");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!entry) {
    return <div>Session introuvable</div>;
  }

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "d MMM yyyy, HH:mm", { locale: fr });
  };

  const getDuration = () => {
    const start = new Date(entry.start_time);
    const end = entry.end_time ? new Date(entry.end_time) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  const getStatusBadge = () => {
    switch (entry.status) {
      case 'active':
        return <Badge className="bg-green-500">En cours</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">En pause</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Terminé</Badge>;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Détails de la session</h1>
            <p className="text-muted-foreground mt-1">
              Informations détaillées sur la session de temps
            </p>
          </div>

          <div className="grid gap-6">
            {/* En-tête */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl">
                  {entry.intervention_title || 'Session sans titre'}
                </CardTitle>
                {getStatusBadge()}
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Durée</p>
                      <p className="font-medium">{getDuration()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Début</p>
                      <p className="font-medium">{formatDate(entry.start_time)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tool className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{entry.task_type}</p>
                    </div>
                  </div>

                  {entry.equipment_name && (
                    <div className="flex items-center gap-2">
                      <Tool className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Équipement</p>
                        <p className="font-medium">{entry.equipment_name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {entry.notes && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Notes</h3>
                    <p className="text-muted-foreground">{entry.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TimeEntryDetail;
