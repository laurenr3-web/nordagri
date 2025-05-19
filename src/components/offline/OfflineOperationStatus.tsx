
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CloudOff } from 'lucide-react';

interface OfflineOperationStatusProps {
  operation: 'create' | 'update' | 'delete';
  entityName?: string;
}

export function OfflineOperationStatus({
  operation,
  entityName = 'entrée'
}: OfflineOperationStatusProps) {
  const operationTexts = {
    'create': {
      title: 'Création hors-ligne',
      description: `Cette ${entityName} sera synchronisée lorsque vous serez connecté au réseau.`
    },
    'update': {
      title: 'Modification hors-ligne',
      description: `Les modifications seront synchronisées lorsque vous serez connecté au réseau.`
    },
    'delete': {
      title: 'Suppression hors-ligne',
      description: `La suppression sera effectuée lorsque vous serez connecté au réseau.`
    }
  };

  const { title, description } = operationTexts[operation];

  return (
    <Alert variant="warning" className="mt-4">
      <CloudOff className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
