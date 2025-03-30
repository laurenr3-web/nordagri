
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dropdown-menu';

interface FilterDropdownMenuProps {
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
}

const FilterDropdownMenu: React.FC<FilterDropdownMenuProps> = ({
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
}) => {
  return (
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
  );
};

export default FilterDropdownMenu;
