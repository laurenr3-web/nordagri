
import React, { useState, useEffect } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { ObservationForm } from '@/components/observations/ObservationForm';
import { ObservationCard } from '@/components/observations/ObservationCard';
import { ObservationDetailsDialog } from '@/components/observations/ObservationDetailsDialog';
import { ObservationsFilter } from '@/components/observations/ObservationsFilter';
import { useFieldObservations } from '@/hooks/observations/useFieldObservations';
import { FieldObservation, FieldObservationFormValues, ObservationType, UrgencyLevel } from '@/types/FieldObservation';
import { toast } from 'sonner';

const FieldObservationsPage = () => {
  // État des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const [selectedObservationType, setSelectedObservationType] = useState<ObservationType | null>(null);
  const [selectedUrgencyLevel, setSelectedUrgencyLevel] = useState<UrgencyLevel | null>(null);

  // État des dialogues
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<FieldObservation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Récupération des données
  const { observations, isLoading, createObservation } = useFieldObservations();

  // Appliquer les filtres
  const filteredObservations = observations.filter((obs) => {
    // Filtre par recherche textuelle
    if (
      searchQuery &&
      !`${obs.equipment} ${obs.description || ''} ${obs.location || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filtre par équipement
    if (selectedEquipmentId && obs.equipmentId !== selectedEquipmentId) {
      return false;
    }

    // Filtre par type d'observation
    if (
      selectedObservationType &&
      obs.observation_type !== selectedObservationType
    ) {
      return false;
    }

    // Filtre par niveau d'urgence
    if (selectedUrgencyLevel && obs.urgency_level !== selectedUrgencyLevel) {
      return false;
    }

    // S'assurer que c'est bien une observation terrain (a un type d'observation)
    return obs.observation_type !== undefined;
  });

  // Gérer l'ouverture du détail d'une observation
  const handleViewObservation = (observation: FieldObservation) => {
    setSelectedObservation(observation);
    setIsDetailsOpen(true);
  };

  // Gérer la création d'une nouvelle observation
  const handleCreateObservation = async (values: FieldObservationFormValues) => {
    try {
      await createObservation(values);
      setIsFormOpen(false);
      toast.success('Observation enregistrée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Impossible de créer l\'observation');
    }
  };

  // Effacer tous les filtres
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedEquipmentId(null);
    setSelectedObservationType(null);
    setSelectedUrgencyLevel(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Observations Terrain</h1>
            <p className="text-muted-foreground">
              Enregistrez et consultez les anomalies détectées sur le terrain
            </p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="gap-1 whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Nouvelle observation</span>
          </Button>
        </div>

        {/* Filtres */}
        <div className="mb-6">
          <ObservationsFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedEquipmentId={selectedEquipmentId}
            onEquipmentChange={setSelectedEquipmentId}
            selectedObservationType={selectedObservationType}
            onObservationTypeChange={setSelectedObservationType}
            selectedUrgencyLevel={selectedUrgencyLevel}
            onUrgencyLevelChange={setSelectedUrgencyLevel}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Affichage des observations */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredObservations.length === 0 ? (
          <div className="bg-muted/30 border rounded-lg p-8 flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucune observation trouvée</h3>
            <p className="text-muted-foreground text-center mt-2">
              Aucune observation ne correspond à vos critères de recherche actuels.
            </p>
            {searchQuery || selectedEquipmentId || selectedObservationType || selectedUrgencyLevel ? (
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="mt-4"
              >
                Réinitialiser les filtres
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsFormOpen(true)}
                className="mt-4"
              >
                Créer une observation
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredObservations.map((observation) => (
              <ObservationCard
                key={observation.id}
                observation={observation}
                onView={handleViewObservation}
              />
            ))}
          </div>
        )}

        {/* Formulaire de création d'observation */}
        <ObservationForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleCreateObservation}
        />

        {/* Dialogue de détails d'observation */}
        <ObservationDetailsDialog
          observation={selectedObservation}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      </div>
    </MainLayout>
  );
};

export default FieldObservationsPage;
