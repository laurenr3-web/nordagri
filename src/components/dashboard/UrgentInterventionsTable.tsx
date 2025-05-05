
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
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

  // Affichage sous forme de cartes pour mobile
  if (isMobile) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-center text-muted-foreground">Interventions urgentes en cours</p>
        {interventions.map((intervention) => (
          <Card 
            key={intervention.id}
            className="p-3 cursor-pointer hover:shadow-md transition-all"
            onClick={() => onViewDetails && onViewDetails(intervention.id)}
          >
            <div className="flex justify-between items-start gap-2 mb-2">
              <h4 className="font-medium text-sm line-clamp-1">{intervention.title}</h4>
              {getPriorityBadge(intervention.priority)}
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
              <div>
                <span className="font-medium">Équipement:</span>{' '}
                <span className="line-clamp-1">{intervention.equipment}</span>
              </div>
              <div>
                <span className="font-medium">Technicien:</span>{' '}
                <span className="line-clamp-1">{intervention.technician}</span>
              </div>
              <div className={
                intervention.date.getTime() < Date.now() ? "text-alert-red font-medium col-span-2" : "col-span-2"
              }>
                <span className="font-medium">Délai:</span>{' '}
                <span>{formatDistanceToNow(intervention.date, { addSuffix: true, locale: fr })}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Affichage tableau pour desktop
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
            onClick={() => onViewDetails && onViewDetails(intervention.id)}
          >
            <TableCell className="font-medium">{intervention.title}</TableCell>
            <TableCell>{intervention.equipment}</TableCell>
            <TableCell>
              {getPriorityBadge(intervention.priority)}
            </TableCell>
            <TableCell className={
              intervention.date.getTime() < Date.now() ? "text-alert-red font-medium" : ""
            }>
              {formatDistanceToNow(intervention.date, { addSuffix: true, locale: fr })}
            </TableCell>
            <TableCell>{intervention.technician}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
