
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CloudOff, ArrowUpCircle, CircleDot } from 'lucide-react';

type OperationType = 'create' | 'update' | 'delete' | 'read';

interface OfflineOperationStatusProps {
  operation: OperationType;
  className?: string;
}

export function OfflineOperationStatus({ operation, className }: OfflineOperationStatusProps) {
  // Map operation type to appropriate messaging
  const getOperationDetails = () => {
    switch (operation) {
      case 'create':
        return {
          title: "Création hors-ligne",
          description: "Cette nouvelle entrée sera synchronisée dès que vous serez connecté.",
          icon: <CircleDot className="h-4 w-4 text-amber-500" />
        };
      case 'update':
        return {
          title: "Modification hors-ligne",
          description: "Vos modifications seront synchronisées dès que vous serez connecté.",
          icon: <ArrowUpCircle className="h-4 w-4 text-amber-500" />
        };
      case 'delete':
        return {
          title: "Suppression hors-ligne",
          description: "Cette suppression sera appliquée dès que vous serez connecté.",
          icon: <CircleDot className="h-4 w-4 text-amber-500" />
        };
      case 'read':
        return {
          title: "Données hors-ligne",
          description: "Vous consultez une version locale des données qui pourrait ne pas être à jour.",
          icon: <CloudOff className="h-4 w-4 text-amber-500" />
        };
      default:
        return {
          title: "Mode hors-ligne",
          description: "Les changements seront synchronisés dès que vous serez connecté.",
          icon: <CloudOff className="h-4 w-4 text-amber-500" />
        };
    }
  };

  const { title, description, icon } = getOperationDetails();

  return (
    <Alert variant="warning" className={className}>
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <div className="font-medium text-sm">{title}</div>
          <AlertDescription className="text-xs">
            {description}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
