
import React from 'react';
import { Button } from '@/components/ui/button';
import { useResetIndexedDB } from '@/hooks/useResetIndexedDB';
import { AlertCircle } from 'lucide-react';

interface NoEquipmentFoundProps {
  resetFilters: () => void;
}

const NoEquipmentFound: React.FC<NoEquipmentFoundProps> = ({ resetFilters }) => {
  const { resetDatabase, isResetting } = useResetIndexedDB();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 mt-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
        <AlertCircle className="h-6 w-6 text-amber-600" />
      </div>
      
      <div className="text-center space-y-3">
        <h3 className="text-lg font-semibold">Aucun équipement trouvé</h3>
        <p className="text-muted-foreground max-w-md text-center">
          Aucun équipement ne correspond aux filtres sélectionnés ou la base de données est vide.
          Si vous êtes certain d'avoir des équipements, il peut y avoir un problème technique.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={resetFilters} variant="outline">
          Réinitialiser les filtres
        </Button>

        <Button 
          onClick={resetDatabase} 
          variant="secondary" 
          className="relative"
          disabled={isResetting}
        >
          {isResetting ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-b-2 rounded-full border-white inline-block"></span>
              Réparation en cours...
            </>
          ) : (
            'Réparer la base de données locale'
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground max-w-md text-center">
        Si vous rencontrez des problèmes pour voir vos équipements, essayez de réparer la base de données locale.
        Après la réparation, la page se rechargera automatiquement.
      </p>
    </div>
  );
};

export default NoEquipmentFound;
