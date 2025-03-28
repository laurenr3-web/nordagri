
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';

interface EmptyRequestsPlaceholderProps {
  onCreateRequest: () => void;
}

const EmptyRequestsPlaceholder: React.FC<EmptyRequestsPlaceholderProps> = ({ onCreateRequest }) => {
  return (
    <BlurContainer className="p-8 text-center">
      <p className="text-muted-foreground">Aucune demande d'intervention en attente</p>
      <Button 
        onClick={onCreateRequest}
        variant="outline"
        className="mt-4"
      >
        Créer une demande
      </Button>
    </BlurContainer>
  );
};

export default EmptyRequestsPlaceholder;
