
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';

interface PartsFiltersProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  manufacturers: string[];
  selectedManufacturers: string[];
  toggleManufacturer: (manufacturer: string) => void;
  minPrice: number;
  setMinPrice: (price: number) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  inStock: boolean;
  setInStock: (inStock: boolean) => void;
  filterCount: number;
  clearFilters: () => void;
}

export const PartsFilters: React.FC<PartsFiltersProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  manufacturers,
  selectedManufacturers,
  toggleManufacturer,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  inStock,
  setInStock,
  filterCount,
  clearFilters,
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Filtres</CardTitle>
          {filterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground flex gap-1 items-center"
              onClick={clearFilters}
            >
              <X className="h-4 w-4" /> Effacer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        {/* Filtrer par catégorie */}
        <div className="grid gap-2">
          <Label className="text-xs font-semibold">Catégorie</Label>
          <div className="grid grid-cols-2 gap-1">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="justify-start h-8 px-2 text-xs"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Filtrer par fabricant */}
        <div className="grid gap-2">
          <Label className="text-xs font-semibold">Fabricant</Label>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {manufacturers.map((manufacturer) => (
              <div key={manufacturer} className="flex items-center gap-2">
                <Checkbox
                  id={`manufacturer-${manufacturer}`}
                  checked={selectedManufacturers.includes(manufacturer)}
                  onCheckedChange={() => toggleManufacturer(manufacturer)}
                />
                <Label
                  htmlFor={`manufacturer-${manufacturer}`}
                  className="text-xs font-normal cursor-pointer"
                >
                  {manufacturer}
                </Label>
              </div>
            ))}
            {manufacturers.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucun fabricant disponible</p>
            )}
          </div>
        </div>
        
        {/* Filtrer par prix */}
        <div className="grid gap-2">
          <Label className="text-xs font-semibold">Prix</Label>
          <div className="grid gap-4">
            <Slider
              min={0}
              max={1000}
              step={10}
              value={[minPrice, maxPrice]}
              onValueChange={(value) => {
                setMinPrice(value[0]);
                setMaxPrice(value[1]);
              }}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs">{minPrice}€</span>
              <span className="text-xs">{maxPrice}€</span>
            </div>
          </div>
        </div>
        
        {/* Filtrer par disponibilité */}
        <div className="flex items-center justify-between">
          <Label htmlFor="in-stock" className="text-xs font-semibold">
            En stock uniquement
          </Label>
          <Switch
            id="in-stock"
            checked={inStock}
            onCheckedChange={setInStock}
          />
        </div>
      </CardContent>
    </Card>
  );
};
