
import React, { useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { debounce } from '@/utils/debounce';

interface EquipmentPartsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddPart: () => void;
}

const EquipmentPartsHeader: React.FC<EquipmentPartsHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddPart
}) => {
  // Create a debounced version of onSearchChange
  const debouncedSearchChange = useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 300),
    [onSearchChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearchChange(e.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <CardTitle>Pièces compatibles</CardTitle>
      <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2 mt-2 md:mt-0">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-8"
            defaultValue={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button className="flex items-center" onClick={onAddPart}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une pièce
        </Button>
      </div>
    </div>
  );
};

export default EquipmentPartsHeader;
