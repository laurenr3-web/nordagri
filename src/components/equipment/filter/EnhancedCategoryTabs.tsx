
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';

interface EnhancedCategoryTabsProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  equipment: EquipmentItem[];
  className?: string;
}

export const EnhancedCategoryTabs: React.FC<EnhancedCategoryTabsProps> = ({
  selectedCategory,
  setSelectedCategory,
  equipment,
  className
}) => {
  // Calculate counts for each category
  const categoryCounts = equipment.reduce((acc, item) => {
    const category = item.type || 'Autre';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allCount = equipment.length;
  const categories = Object.keys(categoryCounts).sort();

  return (
    <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className={className}>
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1">
        <TabsTrigger value="all" className="flex items-center gap-2 py-2">
          Tous
          <Badge variant="secondary" className="text-xs">
            {allCount}
          </Badge>
        </TabsTrigger>
        
        {categories.slice(0, 5).map((category) => (
          <TabsTrigger 
            key={category} 
            value={category}
            className="flex items-center gap-2 py-2"
          >
            <span className="truncate">{category}</span>
            <Badge variant="secondary" className="text-xs">
              {categoryCounts[category]}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
