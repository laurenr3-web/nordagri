
import React from 'react';
import { Button } from '@/components/ui/button';

interface WithdrawalEmptyStateProps {
  onClose: () => void;
}

export const WithdrawalEmptyState: React.FC<WithdrawalEmptyStateProps> = ({ onClose }) => {
  return (
    <div className="py-4 text-center">
      <p className="text-muted-foreground">
        Veuillez sélectionner une pièce avant de pouvoir effectuer un retrait.
      </p>
      <Button 
        className="mt-4" 
        variant="outline" 
        onClick={onClose}
      >
        Fermer
      </Button>
    </div>
  );
};
