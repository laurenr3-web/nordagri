
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Sidebar } from '@/components/ui/sidebar';
import InterventionsList from '@/components/interventions/InterventionsList';
import InterventionsSidebar from '@/components/interventions/InterventionsSidebar';
import NewInterventionDialog from '@/components/interventions/NewInterventionDialog';
import { toast } from 'sonner';

import { useQuery } from '@tanstack/react-query';
import { interventionService } from '@/services/supabase/interventionService';
import { Intervention } from '@/types/Intervention';
import { useInterventionsRealtime } from '@/hooks/interventions/useInterventionsRealtime';

const InterventionsPage = () => {
  const [showNewDialog, setShowNewDialog] = React.useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [currentView, setCurrentView] = useState('all');
  
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

  const handleStartWork = (intervention: Intervention) => {
    // Implementation for starting work
    console.log('Starting work on intervention:', intervention);
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
          <InterventionsSidebar 
            interventions={interventions}
            onViewDetails={handleViewDetails}
          />
        </Sidebar>
        
        <div className="flex-1 w-full">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
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
                  onClearSearch={handleClearSearch}
                  onViewDetails={handleViewDetails}
                  onStartWork={handleStartWork}
                />
              )}
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
    </SidebarProvider>
  );
};

export default InterventionsPage;
