
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Intervention } from '@/types/Intervention';
import TabContent from './TabContent';

interface FieldTrackingCardProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
  onUpdateStatus?: (interventionId: number, newStatus: string) => void;
  onAssignTechnician?: (intervention: Intervention) => void;
}

const FieldTrackingCard: React.FC<FieldTrackingCardProps> = ({
  interventions,
  onViewDetails,
  onUpdateStatus,
  onAssignTechnician,
}) => {
  // Filtrer les interventions selon le statut
  const scheduledInterventions = interventions.filter(i => i.status === 'scheduled');
  const inProgressInterventions = interventions.filter(i => i.status === 'in-progress');
  const completedInterventions = interventions.filter(i => i.status === 'completed');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi des interventions terrain</CardTitle>
        <CardDescription>Visualisez et gérez les interventions en cours, planifiées et terminées</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="in-progress">
          <TabsList className="mb-4">
            <TabsTrigger value="scheduled">
              Planifiées ({scheduledInterventions.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              En cours ({inProgressInterventions.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Terminées ({completedInterventions.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scheduled" className="mt-2">
            <TabContent
              interventions={scheduledInterventions}
              onViewDetails={onViewDetails}
              onUpdateStatus={onUpdateStatus}
              onAssignTechnician={onAssignTechnician}
              status="scheduled"
            />
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-2">
            <TabContent
              interventions={inProgressInterventions}
              onViewDetails={onViewDetails}
              onUpdateStatus={onUpdateStatus}
              status="in-progress"
            />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-2">
            <TabContent
              interventions={completedInterventions}
              onViewDetails={onViewDetails}
              status="completed"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FieldTrackingCard;
