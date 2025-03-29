
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Sidebar } from '@/components/ui/sidebar';
import InterventionsList from '@/components/interventions/InterventionsList';
import InterventionsSidebar from '@/components/interventions/InterventionsSidebar';
import NewInterventionDialog from '@/components/interventions/NewInterventionDialog';
import InterventionDetailsDialog from '@/components/interventions/InterventionDetailsDialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus, FileText, BarChart3, Download } from 'lucide-react';

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
    // Use setTimeout to prevent DOM manipulation conflicts
    setTimeout(() => {
      setSelectedIntervention(intervention);
      console.log('Intervention détails demandés pour:', intervention.title);
    }, 10);
  };

  const handleCloseDetails = () => {
    // Use setTimeout to prevent DOM manipulation conflicts
    setTimeout(() => {
      setSelectedIntervention(null);
    }, 10);
  };

  const handleOpenNewDialog = () => {
    console.log('Ouverture du dialogue de nouvelle intervention...');
    // Use setTimeout to prevent DOM manipulation conflicts
    setTimeout(() => {
      setShowNewDialog(true);
      console.log('État du dialogue après changement:', true);
    }, 10);
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

  const exportInterventionsReport = () => {
    // Implementation for exporting interventions report to CSV
    try {
      const headers = ['ID', 'Titre', 'Équipement', 'Statut', 'Priorité', 'Date', 'Technicien', 'Durée', 'Lieu'];
      
      const csvRows = [
        headers.join(','),
        ...interventions.map(i => [
          i.id,
          `"${i.title.replace(/"/g, '""')}"`, // Escape quotes in CSV
          `"${i.equipment.replace(/"/g, '""')}"`,
          i.status,
          i.priority,
          i.date.toISOString().split('T')[0],
          `"${i.technician.replace(/"/g, '""')}"`,
          i.duration || i.scheduledDuration || '',
          `"${i.location.replace(/"/g, '""')}"`
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `interventions_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Rapport d\'interventions exporté avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'exportation du rapport', {
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 w-full overflow-x-hidden">
          <div className="container mx-auto py-8 px-4 md:px-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main content area */}
              <div className="w-full lg:w-3/4 order-2 lg:order-1">
                <div className="bg-card rounded-xl shadow-subtle p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-foreground">Interventions</h1>
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={exportInterventionsReport}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download size={16} />
                        <span className="hidden sm:inline">Exporter</span>
                      </Button>
                      <Button 
                        onClick={handleOpenNewDialog}
                        className="flex items-center gap-2"
                        size="sm"
                        id="new-intervention-btn"
                      >
                        <Plus size={16} />
                        <span>Nouvelle intervention</span>
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center p-8 my-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                      <p className="mt-4 text-muted-foreground">Chargement des interventions...</p>
                    </div>
                  ) : isError ? (
                    <div className="p-8 text-center border rounded-lg border-destructive/10 bg-destructive/5 my-8">
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
                    <div className="p-8 text-center border rounded-lg border-dashed my-8">
                      <p className="text-lg font-medium">Aucune intervention planifiée</p>
                      <p className="mt-2 text-muted-foreground">
                        Commencez par créer une nouvelle intervention pour un équipement.
                      </p>
                      <button
                        onClick={handleOpenNewDialog}
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
              
              {/* Right sidebar for upcoming interventions and stats */}
              <div className="w-full lg:w-1/4 order-1 lg:order-2">
                <div className="sticky top-4">
                  <InterventionsSidebar 
                    interventions={interventions}
                    onViewDetails={handleViewDetails}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ensure dialogs are properly controlled */}
      <NewInterventionDialog
        open={showNewDialog}
        onOpenChange={(open) => {
          console.log('Dialog onOpenChange called with:', open);
          setTimeout(() => {
            setShowNewDialog(open);
          }, 50);
        }}
        onSubmit={(values) => {
          interventionService.addIntervention(values)
            .then(() => {
              refetch();
              setTimeout(() => setShowNewDialog(false), 50);
              toast.success('Intervention créée avec succès');
            })
            .catch((err) => {
              toast.error('Erreur lors de la création de l\'intervention', {
                description: err.message
              });
            });
        }}
      />

      {selectedIntervention && (
        <InterventionDetailsDialog
          open={!!selectedIntervention}
          onOpenChange={(open) => {
            console.log('Details dialog onOpenChange called with:', open);
            if (!open) {
              setTimeout(() => setSelectedIntervention(null), 50);
            }
          }}
          interventionId={selectedIntervention.id}
          onStartWork={() => handleStartWork(selectedIntervention)}
        />
      )}
    </SidebarProvider>
  );
};

export default InterventionsPage;
