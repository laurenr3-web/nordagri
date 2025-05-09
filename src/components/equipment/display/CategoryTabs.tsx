
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
    <div className="mb-6">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full sm:w-auto mb-2 sm:mb-0 overflow-x-auto no-scrollbar">
          <TabsTrigger value="all">
            Tous
          </TabsTrigger>
          <TabsTrigger value="Tractor">
            Tracteurs
          </TabsTrigger>
          <TabsTrigger value="Harvester">
            Moissonneuses
          </TabsTrigger>
          <TabsTrigger value="Seeder">
            Semoirs
          </TabsTrigger>
          <TabsTrigger value="Sprayer">
            Pulvérisateurs
          </TabsTrigger>
          <TabsTrigger value="Irrigation">
            Irrigation
          </TabsTrigger>
          <TabsTrigger value="Other">
            Autre
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default CategoryTabs;
