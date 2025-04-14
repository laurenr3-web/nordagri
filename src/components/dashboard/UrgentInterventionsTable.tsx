
import React, { memo } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { UrgentIntervention } from '@/hooks/dashboard/types/dashboardTypes';

interface UrgentInterventionsTableProps {
  interventions: UrgentIntervention[];
  onViewDetails?: (id: number) => void;
}

export const UrgentInterventionsTable = memo(function UrgentInterventionsTable({ 
  interventions, 
  onViewDetails 
}: UrgentInterventionsTableProps) {
  if (!interventions || interventions.length === 0) {
    return (
      <div className="text-center py-8 bg-bg-light rounded-lg flex flex-col items-center justify-center">
        <CheckCircle className="h-10 w-10 text-agri-primary mb-2" />
        <p className="text-muted-foreground">Aucune intervention urgente en cours</p>
      </div>
    );
  }

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
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
  };

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
          <TableRow 
            key={intervention.id} 
            className="cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => onViewDetails && onViewDetails(Number(intervention.id))}
          >
            <TableCell className="font-medium">{intervention.title}</TableCell>
            <TableCell>{intervention.equipment}</TableCell>
            <TableCell>
              {getPriorityBadge(intervention.priority)}
            </TableCell>
            <TableCell className={
              intervention.date && new Date(intervention.date).getTime() < Date.now() ? "text-alert-red font-medium" : ""
            }>
              {intervention.date ? 
                formatDistanceToNow(new Date(intervention.date), { addSuffix: true, locale: fr }) : 
                "Date non définie"
              }
            </TableCell>
            <TableCell>{intervention.technician}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});

UrgentInterventionsTable.displayName = 'UrgentInterventionsTable';
