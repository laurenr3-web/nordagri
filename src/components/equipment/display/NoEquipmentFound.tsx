
import React from 'react';
import { Button } from '@/components/ui/button';
import { useResetIndexedDB } from '@/hooks/useResetIndexedDB';
import { AlertCircle, Database, RefreshCw } from 'lucide-react';

interface NoEquipmentFoundProps {
  resetFilters: () => void;
}

const NoEquipmentFound: React.FC<NoEquipmentFoundProps> = ({ resetFilters }) => {
  const { resetDatabase, isResetting } = useResetIndexedDB();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 mt-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100">
        <AlertCircle className="h-8 w-8 text-amber-600" />
      </div>
      
      <div className="text-center space-y-3">
        <h3 className="text-xl font-semibold">Aucun équipement trouvé</h3>
        <p className="text-muted-foreground max-w-md text-center">
          Aucun équipement ne correspond aux filtres sélectionnés ou la base de données est vide.
          Si vous êtes certain d'avoir des équipements, il peut y avoir un problème technique.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        <Button onClick={resetFilters} variant="outline" className="flex items-center gap-2">
          <RefreshCw size={16} />
          Réinitialiser les filtres
        </Button>

        <Button 
          onClick={resetDatabase} 
          variant="default" 
          className="relative bg-green-600 hover:bg-green-700 flex items-center gap-2"
          disabled={isResetting}
        >
          {isResetting ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-b-2 rounded-full border-white inline-block"></span>
              Réparation en cours...
            </>
          ) : (
            <>
              <Database size={16} />
              Réparer la base de données locale
            </>
          )}
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4 max-w-md">
        <p className="text-sm text-blue-700">
          <strong>Problème d'affichage?</strong> Si vous ne voyez pas vos équipements, essayez d'abord de réinitialiser 
          les filtres. Si le problème persiste, cliquez sur "Réparer la base de données locale" pour 
          résoudre les problèmes techniques. La page se rechargera automatiquement après la réparation.
        </p>
      </div>
    </div>
  );
};

export default NoEquipmentFound;
