
import React, { memo } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { UrgentIntervention } from '@/types/Intervention';

interface UrgentInterventionsTableProps {
  interventions: UrgentIntervention[];
  onViewDetails?: (id: number) => void;
}

/**
 * Composant tableau pour afficher les interventions urgentes
 * Optimisé avec React.memo pour éviter les rendus inutiles
 */
export const UrgentInterventionsTable = memo(function UrgentInterventionsTable({ 
  interventions, 
  onViewDetails 
}: UrgentInterventionsTableProps) {
  if (!interventions || interventions.length === 0) {
    return <EmptyInterventionsState />;
  }

  return (
    <Table>
      <TableCaption>Interventions urgentes en cours</TableCaption>
      <TableHeader className="bg-muted/30">
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Équipement</TableHead>
          <TableHead>Priorité</TableHead>
          <TableHead>Délai</TableHead>
          <TableHead>Technicien</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {interventions.map((intervention) => (
          <InterventionTableRow 
            key={intervention.id} 
            intervention={intervention}
            onViewDetails={onViewDetails}
          />
        ))}
      </TableBody>
    </Table>
  );
});

/**
 * Composant pour afficher un état vide (pas d'interventions)
 */
const EmptyInterventionsState = () => (
  <div className="text-center py-8 bg-bg-light rounded-lg flex flex-col items-center justify-center">
    <CheckCircle className="h-10 w-10 text-agri-primary mb-2" />
    <p className="text-muted-foreground">Aucune intervention urgente en cours</p>
  </div>
);

/**
 * Type pour les niveaux de priorité des interventions
 */
type InterventionPriority = 'high' | 'medium' | 'low';

interface InterventionTableRowProps {
  intervention: UrgentIntervention;
  onViewDetails?: (id: number) => void;
}

/**
 * Ligne de tableau pour une intervention
 */
const InterventionTableRow = memo(function InterventionTableRow({ 
  intervention, 
  onViewDetails 
}: InterventionTableRowProps) {
  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(intervention.id);
    }
  };

  const isOverdue = intervention.date.getTime() < Date.now();

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/30 transition-colors"
      onClick={handleClick}
    >
      <TableCell className="font-medium">{intervention.title}</TableCell>
      <TableCell>{intervention.equipment}</TableCell>
      <TableCell>
        <PriorityBadge priority={intervention.priority} />
      </TableCell>
      <TableCell className={isOverdue ? "text-alert-red font-medium" : ""}>
        {formatDistanceToNow(intervention.date, { addSuffix: true, locale: fr })}
      </TableCell>
      <TableCell>{intervention.technician}</TableCell>
    </TableRow>
  );
});

/**
 * Badge pour afficher la priorité d'une intervention
 */
const PriorityBadge = memo(function PriorityBadge({ priority }: { priority: InterventionPriority }) {
  switch (priority) {
    case 'high':
      return (
        <Badge variant="outline" className="bg-alert-red/10 text-alert-red border-alert-red/20 flex items-center gap-1">
          <AlertTriangle size={12} />
          Haute
        </Badge>
      );
    case 'medium':
      return (
        <Badge variant="outline" className="bg-alert-orange/10 text-alert-orange border-alert-orange/20 flex items-center gap-1">
          <Clock size={12} />
          Moyenne
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="outline" className="bg-agri-primary/10 text-agri-primary border-agri-primary/20">
          Basse
        </Badge>
      );
  }
});

UrgentInterventionsTable.displayName = 'UrgentInterventionsTable';
