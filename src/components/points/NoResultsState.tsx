import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onReset: () => void;
}

export const NoResultsState: React.FC<Props> = ({ onReset }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-4">
    <SearchX className="h-12 w-12 text-muted-foreground mb-3" aria-hidden />
    <h3 className="text-base font-semibold mb-1">
      Aucun point ne correspond à vos filtres
    </h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-4">
      Essayez d'ajuster vos critères de recherche ou réinitialisez les filtres pour voir
      tous vos points.
    </p>
    <Button variant="outline" size="sm" onClick={onReset}>
      Réinitialiser les filtres
    </Button>
  </div>
);