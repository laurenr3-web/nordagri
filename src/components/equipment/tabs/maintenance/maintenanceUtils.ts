
import { Badge } from '@/components/ui/badge';
import React from 'react';

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return 'bg-red-500 hover:bg-red-600';
    case 'high': return 'bg-orange-500 hover:bg-orange-600';
    case 'medium': return 'bg-blue-500 hover:bg-blue-600';
    case 'low': return 'bg-green-500 hover:bg-green-600';
    default: return 'bg-slate-500 hover:bg-slate-600';
  }
};

export const getStatusBadge = (status: string): React.ReactElement => {
  switch (status) {
    case 'scheduled':
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Planifié</Badge>;
    case 'in-progress':
      return <Badge variant="outline" className="border-orange-500 text-orange-500">En cours</Badge>;
    case 'completed':
      return <Badge variant="outline" className="border-green-500 text-green-500">Terminé</Badge>;
    case 'pending-parts':
      return <Badge variant="outline" className="border-purple-500 text-purple-500">En attente de pièces</Badge>;
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};
