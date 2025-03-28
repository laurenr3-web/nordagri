
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Sidebar } from '@/components/ui/sidebar';
import InterventionsList from '@/components/interventions/InterventionsList';
import InterventionsSidebar from '@/components/interventions/InterventionsSidebar';
import NewInterventionDialog from '@/components/interventions/NewInterventionDialog';
import InterventionDetailsDialog from '@/components/interventions/InterventionDetailsDialog';
import { toast } from 'sonner';

import { useQuery } from '@tanstack/react-query';
import { interventionService } from '@/services/supabase/interventionService';
import { Intervention } from '@/types/Intervention';
import { useInterventionsRealtime } from '@/hooks/interventions/useInterventionsRealtime';

const InterventionsPage = () => {
  const [showNewDialog, setShowNewDialog] = React.useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [currentView, setCurrentView] = useState('scheduled');
  
  // Enable realtime updates
  const { isSubscribed, error: realtimeError } = useInterventionsRealtime();
  
  // Fetch interventions
  const {
    data: interventions = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: () => interventionService.getInterventions(),
  });

  // Handle errors
  React.useEffect(() => {
    if (isError && error) {
      toast.error('Erreur lors du chargement des interventions', { 
        description: error.message
      });
    }
  }, [isError, error]);

  // Monitor realtime subscription
  useEffect(() => {
    if (realtimeError) {
      console.error('Error with realtime subscription:', realtimeError);
      toast.error('Erreur de synchronisation en temps réel', {
        description: 'Les mises à jour en temps réel des interventions peuvent ne pas fonctionner correctement.'
      });
    } else if (isSubscribed) {
      console.log('Successfully subscribed to realtime updates for interventions');
    }
  }, [isSubscribed, realtimeError]);

  const handleViewDetails = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
  };

  const handleCloseDetails = () => {
    setSelectedIntervention(null);
  };

  const handleStartWork = (intervention: Intervention) => {
    // Implementation for starting work
    interventionService.updateInterventionStatus(intervention.id, 'in-progress')
      .then(() => {
        toast.success('Intervention démarrée');
        refetch();
      })
      .catch((err) => {
        toast.error('Erreur lors du démarrage de l\'intervention', {
          description: err.message
        });
      });
  };

  const handleClearSearch = () => {
    // Implementation for clearing search
    console.log('Clearing search');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
            {/* Main content area - takes 2/3 or 3/4 of the space */}
            <div className="md:col-span-2 lg:col-span-3 p-6">
              <div className="max-w-5xl">
                <h1 className="text-3xl font-bold mb-6">Interventions</h1>
                
                {isLoading ? (
                  <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">Chargement des interventions...</p>
                  </div>
                ) : isError ? (
                  <div className="p-8 text-center border rounded-lg border-destructive/10 bg-destructive/5">
                    <p className="text-lg font-medium text-destructive">
                      Impossible de charger les interventions
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      {error instanceof Error ? error.message : 'Une erreur inconnue est survenue'}
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : interventions.length === 0 ? (
                  <div className="p-8 text-center border rounded-lg border-dashed">
                    <p className="text-lg font-medium">Aucune intervention planifiée</p>
                    <p className="mt-2 text-muted-foreground">
                      Commencez par créer une nouvelle intervention pour un équipement.
                    </p>
                    <button
                      onClick={() => setShowNewDialog(true)}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                    >
                      Créer une intervention
                    </button>
                  </div>
                ) : (
                  <InterventionsList 
                    filteredInterventions={interventions}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    onClearSearch={handleClearSearch}
                    onViewDetails={handleViewDetails}
                    onStartWork={handleStartWork}
                  />
                )}
              </div>
            </div>
            
            {/* Right sidebar for upcoming interventions and stats - takes 1/3 or 1/4 of the space */}
            <div className="md:col-span-1 p-6">
              <InterventionsSidebar 
                interventions={interventions}
                onViewDetails={handleViewDetails}
              />
            </div>
          </div>
        </div>
      </div>
      
      {showNewDialog && (
        <NewInterventionDialog
          open={showNewDialog}
          onOpenChange={setShowNewDialog}
          onSubmit={(values) => {
            interventionService.addIntervention(values)
              .then(() => {
                refetch();
                setShowNewDialog(false);
                toast.success('Intervention créée avec succès');
              })
              .catch((err) => {
                toast.error('Erreur lors de la création de l\'intervention', {
                  description: err.message
                });
              });
          }}
        />
      )}

      {selectedIntervention && (
        <InterventionDetailsDialog
          open={!!selectedIntervention}
          onOpenChange={() => setSelectedIntervention(null)}
          interventionId={selectedIntervention.id}
          onStartWork={() => handleStartWork(selectedIntervention)}
        />
      )}
    </SidebarProvider>
  );
};

export default InterventionsPage;
