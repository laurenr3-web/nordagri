
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
          <TabsTrigger value="harvester">
            Moissonneuses
          </TabsTrigger>
          <TabsTrigger value="seeder">
            Semoirs
          </TabsTrigger>
          <TabsTrigger value="sprayer">
            Pulvérisateurs
          </TabsTrigger>
          <TabsTrigger value="irrigation">
            Irrigation
          </TabsTrigger>
          <TabsTrigger value="other">
            Outils
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default CategoryTabs;
