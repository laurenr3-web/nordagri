
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Filter, Grid, List, Plus, Zap, History, MinusCircle } from 'lucide-react';
import AddPartDialog from './dialogs/AddPartDialog';
import ExpressAddPartDialog from './dialogs/ExpressAddPartDialog';
import { PartsWithdrawalsHistoryDialog } from './dialogs/PartsWithdrawalsHistoryDialog';

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
  filterCount,
}) => {
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isExpressAddOpen, setIsExpressAddOpen] = useState(false);
  const [isWithdrawalHistoryOpen, setIsWithdrawalHistoryOpen] = useState(false);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Pièces</h2>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            onClick={() => setIsWithdrawalHistoryOpen(true)}
            className="flex items-center"
          >
            <History className="mr-2 h-4 w-4" />
            Historique
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setIsExpressAddOpen(true)}
            className="flex items-center"
          >
            <Zap className="mr-2 h-4 w-4" />
            Ajout Express
          </Button>
          <Button onClick={() => setIsAddPartDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une pièce
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="relative sm:max-w-xs w-full">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-between sm:justify-end w-full sm:w-auto">
          <div className="flex space-x-1 sm:space-x-2">
            <ToggleGroup type="single" value={currentView} onValueChange={(view) => setCurrentView(view as string)}>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <Grid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button variant="outline" size="icon" onClick={onOpenFilterDialog} className="relative">
              <Filter className="h-4 w-4" />
              {filterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                  {filterCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddPartDialog 
        isOpen={isAddPartDialogOpen}
        onOpenChange={setIsAddPartDialogOpen}
      />
      
      <ExpressAddPartDialog
        isOpen={isExpressAddOpen}
        onOpenChange={setIsExpressAddOpen}
      />
      
      <PartsWithdrawalsHistoryDialog
        isOpen={isWithdrawalHistoryOpen}
        onOpenChange={setIsWithdrawalHistoryOpen}
      />
    </div>
  );
};

export default PartsHeader;
