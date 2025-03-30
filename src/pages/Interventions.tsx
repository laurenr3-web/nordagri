import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import InterventionsList from '@/components/interventions/InterventionsList';
import InterventionsSidebar from '@/components/interventions/InterventionsSidebar';
import NewInterventionDialog from '@/components/interventions/NewInterventionDialog';
import InterventionDetailsDialog from '@/components/interventions/InterventionDetailsDialog';
import { toast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Plus, FileText, BarChart3, Download } from 'lucide-react';
import { Intervention } from '@/types/Intervention';

// Using the Intervention type from types file
interface InterventionWithCoordinates extends Intervention {
  // Add any missing properties needed if the imported type isn't complete
}

const sampleInterventions: InterventionWithCoordinates[] = [
  {
    id: 1,
    title: 'Réparation du moteur',
    equipment: 'Tracteur John Deere',
    equipmentId: 123,
    location: 'Champ principal',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    technician: 'Jean Dupont',
    date: new Date(2024, 5, 20),
    scheduledDuration: 8,
    priority: 'high',
    status: 'scheduled',
    description: 'Réparation complète du moteur suite à une surchauffe.',
    notes: 'Vérifier le système de refroidissement.',
    partsUsed: [{ id: 1, name: 'Bougie', quantity: 4 }]
  },
  {
    id: 2,
    title: 'Maintenance préventive',
    equipment: 'Moissonneuse-batteuse Claas',
    equipmentId: 456,
    location: 'Hangar principal',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    technician: 'Sophie Martin',
    date: new Date(2024, 5, 22),
    scheduledDuration: 4,
    priority: 'medium',
    status: 'in-progress',
    description: 'Vérification et remplacement des filtres et huiles.',
    notes: 'Graisser tous les points de friction.',
    partsUsed: [{ id: 2, name: 'Filtre à huile', quantity: 1 }]
  },
  {
    id: 3,
    title: 'Remplacement des pneus',
    equipment: 'Remorque agricole',
    equipmentId: 789,
    location: 'Atelier',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    technician: 'Pierre Leclerc',
    date: new Date(2024, 5, 25),
    scheduledDuration: 2,
    priority: 'low',
    status: 'completed',
    description: 'Remplacement des pneus usés par des neufs.',
    notes: 'Serrer les écrous de roue correctement.',
    partsUsed: [{ id: 3, name: 'Pneu', quantity: 2 }],
    duration: 2
  },
  {
    id: 4,
    title: 'Diagnostic électrique',
    equipment: 'Tracteur New Holland',
    equipmentId: 101,
    location: 'Champ secondaire',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    technician: 'Jean Dupont',
    date: new Date(2024, 5, 28),
    scheduledDuration: 6,
    priority: 'medium',
    status: 'scheduled',
    description: 'Diagnostic et réparation du système électrique.',
    notes: 'Vérifier le câblage et les fusibles.',
    partsUsed: [{ id: 4, name: 'Fusible 10A', quantity: 5 }]
  },
  {
    id: 5,
    title: 'Révision du système hydraulique',
    equipment: 'Ensileuse automotrice',
    equipmentId: 112,
    location: 'Hangar secondaire',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    technician: 'Sophie Martin',
    date: new Date(2024, 6, 1),
    scheduledDuration: 8,
    priority: 'high',
    status: 'scheduled',
    description: 'Révision complète du système hydraulique.',
    notes: 'Remplacer l\'huile hydraulique et vérifier les joints.',
    partsUsed: [{ id: 5, name: 'Huile hydraulique', quantity: 20 }]
  },
  {
    id: 6,
    title: 'Contrôle des freins',
    equipment: 'Tracteur John Deere',
    equipmentId: 123,
    location: 'Atelier',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    technician: 'Pierre Leclerc',
    date: new Date(2024, 6, 3),
    scheduledDuration: 3,
    priority: 'medium',
    status: 'scheduled',
    description: 'Vérification et réglage des freins.',
    notes: 'Nettoyer les tambours de frein.',
    partsUsed: [{ id: 6, name: 'Plaquettes de frein', quantity: 4 }]
  },
  {
    id: 7,
    title: 'Entretien de la climatisation',
    equipment: 'Moissonneuse-batteuse Claas',
    equipmentId: 456,
    location: 'Hangar principal',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    technician: 'Jean Dupont',
    date: new Date(2024, 6, 5),
    scheduledDuration: 4,
    priority: 'low',
    status: 'scheduled',
    description: 'Recharge et entretien du système de climatisation.',
    notes: 'Vérifier les fuites de réfrigérant.',
    partsUsed: []
  },
  {
    id: 8,
    title: 'Réparation du système de direction',
    equipment: 'Remorque agricole',
    equipmentId: 789,
    location: 'Champ principal',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    technician: 'Sophie Martin',
    date: new Date(2024, 6, 8),
    scheduledDuration: 5,
    priority: 'medium',
    status: 'scheduled',
    description: 'Réparation du système de direction assistée.',
    notes: 'Vérifier la pompe de direction assistée.',
    partsUsed: [{ id: 7, name: 'Liquide de direction assistée', quantity: 1 }]
  },
  {
    id: 9,
    title: 'Remplacement de la courroie',
    equipment: 'Tracteur New Holland',
    equipmentId: 101,
    location: 'Atelier',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    technician: 'Pierre Leclerc',
    date: new Date(2024, 6, 10),
    scheduledDuration: 2,
    priority: 'low',
    status: 'scheduled',
    description: 'Remplacement de la courroie d\'entraînement.',
    notes: 'Tendre la courroie correctement.',
    partsUsed: [{ id: 8, name: 'Courroie', quantity: 1 }]
  },
  {
    id: 10,
    title: 'Inspection générale',
    equipment: 'Ensileuse automotrice',
    equipmentId: 112,
    location: 'Hangar secondaire',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    technician: 'Jean Dupont',
    date: new Date(2024, 6, 12),
    scheduledDuration: 7,
    priority: 'medium',
    status: 'scheduled',
    description: 'Inspection générale de l\'équipement.',
    notes: 'Vérifier tous les points de contrôle.',
    partsUsed: []
  }
];

const InterventionsPage = () => {
  const [interventions, setInterventions] = useState<InterventionWithCoordinates[]>(sampleInterventions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [isNewInterventionDialogOpen, setIsNewInterventionDialogOpen] = useState(false);
  const [interventionDetailsOpen, setInterventionDetailsOpen] = useState(false);
  const [selectedInterventionId, setSelectedInterventionId] = useState<number | string | null>(null);
  const [currentView, setCurrentView] = useState('scheduled');

  // Filter interventions based on search query and priority
  const filteredInterventions = interventions.filter(intervention => {
    const searchMatch = intervention.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.technician.toLowerCase().includes(searchQuery.toLowerCase());

    const priorityMatch = selectedPriority ? intervention.priority === selectedPriority : true;

    return searchMatch && priorityMatch;
  });

  // Handlers
  const handleOpenNewInterventionDialog = () => {
    setIsNewInterventionDialogOpen(true);
  };

  const handleCloseNewInterventionDialog = () => {
    setIsNewInterventionDialogOpen(false);
  };

  const handleCreateIntervention = (newIntervention: Partial<InterventionWithCoordinates>) => {
    // Create a new intervention with required fields and empty partsUsed array
    const completedIntervention: InterventionWithCoordinates = {
      ...newIntervention as any,
      id: interventions.length + 1,
      partsUsed: [],  // Ensure partsUsed is included
      status: 'scheduled',
    } as InterventionWithCoordinates;
    
    setInterventions([...interventions, completedIntervention]);
    setIsNewInterventionDialogOpen(false);
    toast({
      title: "Succès",
      description: "Nouvelle intervention créée avec succès.",
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePriorityChange = (priority: string | null) => {
    setSelectedPriority(priority);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedPriority(null);
  };

  const handleViewDetails = (intervention: InterventionWithCoordinates) => {
    setSelectedInterventionId(intervention.id);
    setInterventionDetailsOpen(true);
  };

  const handleCloseInterventionDetails = () => {
    setInterventionDetailsOpen(false);
    setSelectedInterventionId(null);
  };

  const handleStartWork = (intervention: InterventionWithCoordinates) => {
    // Placeholder for start work logic
    toast({
      title: "Intervention démarrée",
      description: `L'intervention ${intervention.title} a été marquée comme démarrée.`,
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Navbar />

        <div className="flex flex-1 flex-col">
          <div className="border-b">
            <div className="flex items-center justify-between p-4">
              <div className="flex-1 space-y-1.5">
                <h1 className="text-lg font-semibold">Interventions</h1>
                <p className="text-sm text-muted-foreground">
                  Gérez et suivez les interventions de maintenance.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
                <Button size="sm" onClick={handleOpenNewInterventionDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Intervention
                </Button>
              </div>
            </div>
          </div>

          <div className="container relative pb-6 pt-8 md:pb-12 md:pt-12 lg:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="col-span-1 lg:col-span-3">
                <InterventionsList
                  filteredInterventions={filteredInterventions}
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  onClearSearch={handleClearSearch}
                  onViewDetails={handleViewDetails}
                  onStartWork={handleStartWork}
                />
              </div>

              <div className="col-span-1 hidden lg:block">
                <InterventionsSidebar
                  interventions={filteredInterventions}
                  onViewDetails={handleViewDetails}
                  searchQuery={searchQuery}
                  selectedPriority={selectedPriority}
                  onSearchChange={handleSearchChange}
                  onPriorityChange={handlePriorityChange}
                  onClearSearch={handleClearSearch}
                />
              </div>
            </div>
          </div>

          {/* Dialogs */}
          <NewInterventionDialog
            open={isNewInterventionDialogOpen}
            onOpenChange={handleCloseNewInterventionDialog}
            onCreate={handleCreateIntervention}
          />

          <InterventionDetailsDialog
            interventionId={selectedInterventionId || ''}
            open={interventionDetailsOpen}
            onOpenChange={handleCloseInterventionDetails}
            onStartWork={() => {
              if (selectedInterventionId) {
                const intervention = interventions.find(i => i.id === selectedInterventionId);
                if (intervention) {
                  handleStartWork(intervention);
                }
              }
            }}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default InterventionsPage;
