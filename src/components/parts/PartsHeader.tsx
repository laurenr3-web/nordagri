
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListFilter, Plus, RefreshCw, SlidersHorizontal, Grid, List, Package, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import WithdrawPartDialog from './dialogs/WithdrawPartDialog';

interface PartsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenFilterDialog: () => void;
  onOpenSortDialog: () => void;
  filterCount: number;
}

const PartsHeader: React.FC<PartsHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  currentView,
  setCurrentView,
  onOpenFilterDialog,
  onOpenSortDialog,
  filterCount
}) => {
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      {/* Première ligne: titre et actions principales */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Inventaire des pièces</h2>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="default"
            onClick={() => setIsWithdrawDialogOpen(true)}
            className="gap-2"
          >
            <Wrench className="h-4 w-4" />
            <span className="hidden md:inline">Retirer une pièce</span>
            <span className="inline md:hidden">Retirer</span>
          </Button>
          <Button 
            variant="default"
            onClick={() => document.getElementById('add-part-button')?.click()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Ajouter une pièce</span>
            <span className="inline md:hidden">Ajouter</span>
          </Button>
        </div>
      </div>

      {/* Seconde ligne: recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Rechercher une pièce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Package className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            title="Filtre"
            onClick={onOpenFilterDialog}
            className={filterCount > 0 ? "relative" : ""}
          >
            <ListFilter className="h-5 w-5" />
            {filterCount > 0 && (
              <Badge 
                variant="destructive"
                className="absolute top-0 right-0 h-5 w-5 p-0 flex items-center justify-center transform translate-x-1/3 -translate-y-1/3"
              >
                {filterCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Trier"
            onClick={onOpenSortDialog}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={currentView === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              title="Vue grille"
              onClick={() => setCurrentView('grid')}
              className="rounded-none"
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button
              variant={currentView === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              title="Vue liste"
              onClick={() => setCurrentView('list')}
              className="rounded-none"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de retrait de pièce */}
      <WithdrawPartDialog 
        isOpen={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default PartsHeader;
