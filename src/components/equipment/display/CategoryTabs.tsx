
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CategoryTabsProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  setSelectedCategory
}) => {
  return (
    <div className="mb-4 sm:mb-6">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="all" className="text-xs sm:text-sm">Tous</TabsTrigger>
          <TabsTrigger value="Tractor" className="text-xs sm:text-sm">Tracteurs</TabsTrigger>
          <TabsTrigger value="Harvester" className="text-xs sm:text-sm">Moissonneuses</TabsTrigger>
          <TabsTrigger value="Seeder" className="text-xs sm:text-sm">Semoirs</TabsTrigger>
          <TabsTrigger value="Sprayer" className="text-xs sm:text-sm">Pulvérisateurs</TabsTrigger>
          <TabsTrigger value="Irrigation" className="text-xs sm:text-sm">Irrigation</TabsTrigger>
          <TabsTrigger value="Other" className="text-xs sm:text-sm">Autre</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default CategoryTabs;
