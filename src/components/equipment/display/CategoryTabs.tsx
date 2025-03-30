
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
          <TabsTrigger value="tracteurs">
            Tracteurs
          </TabsTrigger>
          <TabsTrigger value="moissonneuses">
            Moissonneuses
          </TabsTrigger>
          <TabsTrigger value="semoirs">
            Semoirs
          </TabsTrigger>
          <TabsTrigger value="pulvérisateurs">
            Pulvérisateurs
          </TabsTrigger>
          <TabsTrigger value="irrigation">
            Irrigation
          </TabsTrigger>
          <TabsTrigger value="outils">
            Outils
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default CategoryTabs;
