
import React from 'react';
import { Button } from '@/components/ui/button';
import { useResetIndexedDB } from '@/hooks/useResetIndexedDB';

interface NoEquipmentFoundProps {
  resetFilters: () => void;
}

const NoEquipmentFound: React.FC<NoEquipmentFoundProps> = ({ resetFilters }) => {
  const { resetDatabase, isResetting } = useResetIndexedDB();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 mt-4">
      <div className="text-center space-y-3">
        <h3 className="text-lg font-semibold">Aucun équipement trouvé</h3>
        <p className="text-muted-foreground">
          Aucun équipement ne correspond aux filtres sélectionnés ou la base de données est vide.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={resetFilters} variant="outline">
          Réinitialiser les filtres
        </Button>

        <Button 
          onClick={resetDatabase} 
          variant="secondary" 
          disabled={isResetting}
        >
          {isResetting ? 'Réinitialisation...' : 'Réparer la base de données locale'}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground max-w-md text-center">
        Si vous rencontrez des problèmes pour voir vos équipements, essayez de réparer la base de données locale.
        Cela peut résoudre les problèmes liés au stockage hors ligne.
      </p>
    </div>
  );
};

export default NoEquipmentFound;
