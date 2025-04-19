
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEquipmentTypes } from '@/hooks/equipment/useEquipmentTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryTabsProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  setSelectedCategory
}) => {
  const { data: types = [], isLoading } = useEquipmentTypes();

  if (isLoading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full sm:w-auto mb-2 sm:mb-0 overflow-x-auto no-scrollbar">
          <TabsTrigger value="all">
            Tous
          </TabsTrigger>
          {types.map((type) => (
            <TabsTrigger key={type.id} value={type.name}>
              {type.name}
            </TabsTrigger>
          ))}
          <TabsTrigger value="other">
            Autres
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default CategoryTabs;
