
import React from 'react';
import { Wrench, Filter, Droplets, Settings } from 'lucide-react';

// Get the appropriate icon based on the category
export const getCategoryIcon = (category: string) => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('moteur') || lowerCategory.includes('mécanique')) {
    return <Wrench className="h-4 w-4" />;
  } else if (lowerCategory.includes('filtre')) {
    return <Filter className="h-4 w-4" />;
  } else if (lowerCategory.includes('hydraulique') || lowerCategory.includes('fluid')) {
    return <Droplets className="h-4 w-4" />;
  } else {
    return <Settings className="h-4 w-4" />;
  }
};

// Convert maintenance items to maintenance tasks
export const convertToMaintenanceTasks = (
  selectedItems: Array<any>,
  equipmentId: number | undefined,
  equipmentName: string | undefined
) => {
  if (!selectedItems.length || !equipmentId || !equipmentName) {
    return [];
  }
  
  return selectedItems.map(item => ({
    title: item.name,
    equipment: equipmentName,
    equipmentId: equipmentId,
    type: item.category.toLowerCase() as any,
    status: 'scheduled' as const,
    priority: item.priority as any,
    dueDate: new Date(Date.now() + item.interval * (
      item.interval_type === 'hours' ? 3600000 : 
      item.interval_type === 'months' ? 2592000000 : 
      86400000 // km - we use an arbitrary date for km
    )),
    engineHours: item.interval_type === 'hours' ? item.interval : 0,
    assignedTo: '',
    notes: item.description,
    trigger_unit: item.interval_type === 'kilometers' ? 'kilometers' : 
                  item.interval_type === 'hours' ? 'hours' : 'none',
    trigger_hours: item.interval_type === 'hours' ? item.interval : undefined,
    trigger_kilometers: item.interval_type === 'kilometers' ? item.interval : undefined
  }));
};
