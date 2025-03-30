
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, LayoutGrid, List, ArrowDownAZ, ArrowUpZA, ArrowDownUp } from 'lucide-react';

interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  filters: any;
  statusOptions: string[];
  typeOptions: string[];
  manufacturerOptions: string[];
  yearOptions: { min: number; max: number };
  isFilterActive: (type: string, value: string) => boolean;
  toggleFilter: (type: string, value: string) => void;
  clearFilters: (type?: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  activeFilterCount: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
}

const SearchToolbar: React.FC<SearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  currentView,
  setCurrentView,
  filters,
  statusOptions,
  typeOptions,
  manufacturerOptions,
  yearOptions,
  isFilterActive,
  toggleFilter,
  clearFilters,
  getStatusColor,
  getStatusText,
  activeFilterCount,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
      {/* Barre de recherche */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un équipement..."
          className="pl-9 w-full"
          value={searchQuery}
          onChange={onSearchChange}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1.5 h-7 w-7 px-0"
            onClick={() => onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Effacer la recherche</span>
          </Button>
        )}
      </div>
      
      {/* Menu de filtres */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
            {activeFilterCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Statut */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Statut</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuGroup>
                {statusOptions.map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={isFilterActive('status', status)}
                    onCheckedChange={() => toggleFilter('status', status)}
                  >
                    <div className="flex items-center">
                      <span className={`h-2 w-2 rounded-full ${getStatusColor(status)} mr-2`} />
                      {getStatusText(status)}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => clearFilters('status')}>
                Réinitialiser les statuts
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          {/* Type */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Type</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuGroup>
                {typeOptions.map(type => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={isFilterActive('type', type)}
                    onCheckedChange={() => toggleFilter('type', type)}
                  >
                    {type}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => clearFilters('type')}>
                Réinitialiser les types
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          {/* Fabricant */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Fabricant</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuGroup>
                {manufacturerOptions.map(manufacturer => (
                  <DropdownMenuCheckboxItem
                    key={manufacturer}
                    checked={isFilterActive('manufacturer', manufacturer)}
                    onCheckedChange={() => toggleFilter('manufacturer', manufacturer)}
                  >
                    {manufacturer}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => clearFilters('manufacturer')}>
                Réinitialiser les fabricants
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => clearFilters()}>
            Réinitialiser tous les filtres
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Menu de tri */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Trier
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Trier par</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
            <DropdownMenuRadioItem value="name">Nom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="type">Type</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="status">Statut</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="year">Année</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value: string) => setSortOrder(value as 'asc' | 'desc')}>
            <DropdownMenuRadioItem value="asc">
              <ArrowDownAZ className="mr-2 h-4 w-4" />
              Croissant
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="desc">
              <ArrowUpZA className="mr-2 h-4 w-4" />
              Décroissant
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Boutons de vue */}
      <div className="flex">
        <Button
          variant={currentView === 'grid' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setCurrentView('grid')}
          className="rounded-r-none"
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="sr-only">Vue en grille</span>
        </Button>
        <Button
          variant={currentView === 'list' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setCurrentView('list')}
          className="rounded-l-none"
        >
          <List className="h-4 w-4" />
          <span className="sr-only">Vue en liste</span>
        </Button>
      </div>
    </div>
  );
};

export default SearchToolbar;
