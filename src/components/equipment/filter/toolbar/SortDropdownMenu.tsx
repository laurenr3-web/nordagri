
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDownUp, ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

interface SortDropdownMenuProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
}

const SortDropdownMenu: React.FC<SortDropdownMenuProps> = ({
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
}) => {
  return (
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
  );
};

export default SortDropdownMenu;
