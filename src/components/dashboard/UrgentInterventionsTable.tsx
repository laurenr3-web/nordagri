
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UrgentIntervention {
  id: number;
  title: string;
  equipment: string;
  priority: 'high' | 'medium' | 'low';
  date: Date;
  status: string;
  technician: string;
  location: string;
}

interface UrgentInterventionsTableProps {
  interventions: UrgentIntervention[];
  onViewDetails?: (id: number) => void;
}

export function UrgentInterventionsTable({ interventions, onViewDetails }: UrgentInterventionsTableProps) {
  if (!interventions || interventions.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">Aucune intervention urgente en cours</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Interventions urgentes en cours</TableCaption>
      <TableHeader>
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
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onViewDetails && onViewDetails(intervention.id)}
          >
            <TableCell className="font-medium">{intervention.title}</TableCell>
            <TableCell>{intervention.equipment}</TableCell>
            <TableCell>
              <Badge
                variant={
                  intervention.priority === 'high' ? 'destructive' : 
                  intervention.priority === 'medium' ? 'default' : 
                  'outline'
                }
              >
                {intervention.priority === 'high' ? 'Haute' : 
                 intervention.priority === 'medium' ? 'Moyenne' : 
                 'Basse'}
              </Badge>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(intervention.date, { addSuffix: true, locale: fr })}
            </TableCell>
            <TableCell>{intervention.technician}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
