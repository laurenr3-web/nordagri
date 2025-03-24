
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CategoryTabsProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  selectedCategory, 
  setSelectedCategory 
}) => {
  return (
    <Tabs 
      defaultValue="all" 
      className="mb-6" 
      value={selectedCategory} 
      onValueChange={setSelectedCategory}
    >
      <TabsList>
        <TabsTrigger value="all">All Equipment</TabsTrigger>
        <TabsTrigger value="heavy">Heavy Machinery</TabsTrigger>
        <TabsTrigger value="medium">Medium Machinery</TabsTrigger>
        <TabsTrigger value="light">Light Equipment</TabsTrigger>
        <TabsTrigger value="attachments">Attachments</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default CategoryTabs;
