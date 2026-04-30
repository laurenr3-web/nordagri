import React, { useState } from 'react';
import { Search, Filter, X, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { PartsView } from '@/hooks/parts/usePartsFilter';

interface PartsCompactFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  categories: string[];
  manufacturers: string[];
  filterManufacturers: string[];
  toggleManufacturerFilter: (m: string) => void;
  filterInStock: boolean;
  setFilterInStock: (v: boolean) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  view: PartsView;
  setView: (v: PartsView) => void;
  filterCount: number;
  clearFilters: () => void;
  filteredCount: number;
}

const ALL = '__all__';

const SORT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'name-asc', label: 'Nom (A → Z)' },
  { value: 'name-desc', label: 'Nom (Z → A)' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'stock-asc', label: 'Stock croissant' },
  { value: 'stock-desc', label: 'Stock décroissant' },
];

export const PartsCompactFilters: React.FC<PartsCompactFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  manufacturers,
  filterManufacturers,
  toggleManufacturerFilter,
  filterInStock,
  setFilterInStock,
  sortBy,
  setSortBy,
  view,
  setView,
  filterCount,
  clearFilters,
  filteredCount,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Single-select fabricant — on synchronise le multi sous-jacent
  const currentManufacturer =
    filterManufacturers.length === 1 ? filterManufacturers[0] : ALL;

  const handleManufacturerChange = (value: string) => {
    // Désélectionne tous les fabricants actifs
    filterManufacturers.forEach((m) => toggleManufacturerFilter(m));
    if (value !== ALL) {
      toggleManufacturerFilter(value);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === ALL ? 'all' : value);
  };

  const categoryValue =
    !selectedCategory || selectedCategory === 'all' ? ALL : selectedCategory;

  const stockValue = filterInStock ? 'in-stock' : ALL;
  const handleStockChange = (value: string) => {
    setFilterInStock(value === 'in-stock');
  };

  const handleViewChange = (value: string) => {
    if (value === 'grid' || value === 'list') {
      setView(value);
    }
  };

  return (
    <Card className="p-3">
      {/* Desktop : une seule ligne */}
      <div className="hidden md:flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-8 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={categoryValue} onValueChange={handleCategoryChange}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les catégories</SelectItem>
            {categories
              .filter((c) => c && c !== 'all')
              .map((c) => (
                <SelectItem key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={currentManufacturer} onValueChange={handleManufacturerChange}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Fabricant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les fabricants</SelectItem>
            {manufacturers.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stockValue} onValueChange={handleStockChange}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les stocks</SelectItem>
            <SelectItem value="in-stock">En stock uniquement</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Trier" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ToggleGroup
          type="single"
          value={view}
          onValueChange={handleViewChange}
          className="ml-1"
        >
          <ToggleGroupItem value="grid" aria-label="Vue grille" className="h-9 w-9">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Vue liste" className="h-9 w-9">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {filteredCount} {filteredCount > 1 ? 'pièces' : 'pièce'}
          </span>
          {filterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Mobile : ligne compacte + collapsible */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {filterCount}
              </Badge>
            )}
          </Button>

          <ToggleGroup
            type="single"
            value={view}
            onValueChange={handleViewChange}
          >
            <ToggleGroupItem value="grid" aria-label="Vue grille" className="h-9 w-9">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Vue liste" className="h-9 w-9">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Collapsible open={mobileOpen} onOpenChange={setMobileOpen}>
          <CollapsibleContent className="pt-2">
            <div className="grid grid-cols-2 gap-2">
              <Select value={categoryValue} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Toutes les catégories</SelectItem>
                  {categories
                    .filter((c) => c && c !== 'all')
                    .map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={currentManufacturer} onValueChange={handleManufacturerChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Fabricant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tous les fabricants</SelectItem>
                  {manufacturers.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockValue} onValueChange={handleStockChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tous les stocks</SelectItem>
                  <SelectItem value="in-stock">En stock uniquement</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Trier" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {filteredCount} {filteredCount > 1 ? 'pièces' : 'pièce'}
              </span>
              {filterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
};

export default PartsCompactFilters;