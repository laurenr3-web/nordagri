
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  clearFilters
}) => {
  const formatPrice = (value: number) => `${value}€`;
  
  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtres</CardTitle>
          {filterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-8 px-2"
            >
              Réinitialiser
            </Button>
          )}
        </div>
        {filterCount > 0 && (
          <Badge variant="secondary" className="mt-1">
            {filterCount} filtre{filterCount > 1 ? 's' : ''} appliqué{filterCount > 1 ? 's' : ''}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 block">Catégories</Label>
          <Tabs 
            defaultValue={selectedCategory || "all"} 
            className="w-full"
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <TabsList className="w-full grid grid-cols-2 h-auto">
              <TabsTrigger value="all" className="text-xs py-1.5">
                Toutes
              </TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs py-1.5">
                Favoris
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {categories.length > 0 && (
            <div className="grid grid-cols-1 gap-1 mt-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "secondary" : "ghost"}
                  size="sm"
                  className="justify-start font-normal h-8"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {manufacturers.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Fabricants</Label>
            <ScrollArea className="h-[180px] pr-4">
              <div className="space-y-2">
                {manufacturers.map((manufacturer) => (
                  <div key={manufacturer} className="flex items-center space-x-2">
                    <Checkbox
                      id={`manufacturer-${manufacturer}`}
                      checked={selectedManufacturers.includes(manufacturer)}
                      onCheckedChange={() => toggleManufacturer(manufacturer)}
                    />
                    <Label
                      htmlFor={`manufacturer-${manufacturer}`}
                      className="text-sm cursor-pointer flex-grow"
                    >
                      {manufacturer}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Prix</Label>
              <span className="text-sm text-muted-foreground">
                {formatPrice(minPrice)} - {formatPrice(maxPrice)}
              </span>
            </div>
            <div className="pt-4">
              <Slider
                defaultValue={[minPrice, maxPrice]}
                min={0}
                max={1000}
                step={10}
                value={[minPrice, maxPrice]}
                onValueChange={(values) => {
                  setMinPrice(values[0]);
                  setMaxPrice(values[1]);
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="in-stock" 
            checked={inStock}
            onCheckedChange={(checked) => setInStock(!!checked)}
          />
          <Label
            htmlFor="in-stock"
            className="text-sm cursor-pointer flex-grow"
          >
            En stock uniquement
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
