
import React, { useState } from 'react';
import { Intervention, InterventionStatus } from '@/types/models/intervention';
import { useQuery } from '@tanstack/react-query';
import { interventionService } from '@/services/supabase/interventionService';
import { toast } from 'sonner';
import { ensureNumberId } from '@/utils/typeGuards';

// Import refactored components
import RequestsHeader from './requests/RequestsHeader';
import RequestsList from './requests/RequestsList';
import RequestForm from './requests/RequestForm';

interface RequestsManagementViewProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
}

const RequestsManagementView: React.FC<RequestsManagementViewProps> = ({ 
  interventions, 
  onViewDetails 
}) => {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const requests = interventions.filter(i => i.status === 'scheduled');

  // Use React Query to fetch the latest interventions
  const { refetch } = useQuery({
    queryKey: ['interventions'],
    queryFn: () => interventionService.getInterventions(),
    enabled: false // Don't fetch automatically
  });

  const handleCreateRequest = async (values: any) => {
    try {
      // Ensure all required fields are present and properly typed
      const interventionData = {
        title: values.title,
        equipment: values.equipment,
        equipmentId: values.equipmentId,
        location: values.location || 'Unknown',
        priority: values.priority as "low" | "medium" | "high",
        date: values.date,
        scheduledDuration: values.scheduledDuration,
        technician: values.technician,
        description: values.description,
        notes: values.notes,
        status: 'scheduled' as InterventionStatus,
      };
      
      await interventionService.createIntervention(interventionData);
      toast.success('Demande d\'intervention créée avec succès');
      setIsRequestDialogOpen(false);
      refetch(); // Refresh the data
    } catch (error) {
      toast.error('Erreur lors de la création de la demande', { 
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' 
      });
    }
  };

  const handleAcceptRequest = async (intervention: Intervention) => {
    try {
      await interventionService.updateInterventionStatus(intervention.id, 'in-progress');
      toast.success('Demande acceptée, intervention démarrée');
      refetch(); // Refresh interventions list
    } catch (error) {
      toast.error('Erreur lors de l\'acceptation de la demande', { 
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' 
      });
    }
  };

  const handleRejectRequest = async (intervention: Intervention) => {
    try {
      await interventionService.updateInterventionStatus(intervention.id, 'cancelled');
      toast.success('Demande rejetée');
      refetch(); // Refresh interventions list
    } catch (error) {
      toast.error('Erreur lors du rejet de la demande', { 
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <RequestsHeader 
        requestCount={requests.length} 
        onCreateRequest={() => setIsRequestDialogOpen(true)} 
      />
      
      <RequestsList 
        requests={requests}
        onViewDetails={onViewDetails}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onCreateRequest={() => setIsRequestDialogOpen(true)}
      />

      <RequestForm 
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
};

export default RequestsManagementView;
