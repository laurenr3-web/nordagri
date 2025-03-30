
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface NoEquipmentFoundProps {
  resetFilters: () => void;
}

const NoEquipmentFound: React.FC<NoEquipmentFoundProps> = ({ resetFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">Aucun équipement trouvé</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Nous n'avons trouvé aucun équipement correspondant à vos critères de recherche. 
        Essayez d'ajuster vos filtres ou d'effectuer une recherche différente.
      </p>
      <Button onClick={resetFilters} variant="outline" className="gap-2">
        <Filter className="h-4 w-4" />
        Réinitialiser les filtres
      </Button>
    </div>
  );
};

export default NoEquipmentFound;
