
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ searchTerm, setSearchTerm }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Rechercher un équipement..."
        className="pl-9 w-full"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1.5 h-7 w-7 px-0"
          onClick={() => setSearchTerm('')}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Effacer la recherche</span>
        </Button>
      )}
    </div>
  );
};

export default SearchInput;
